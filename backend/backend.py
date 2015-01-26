#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import sys, os
import uuid
import urlparse, json
import sqlite3
import base64
import logging
from flup.server.fcgi import WSGIServer
from contextlib import closing

class ClientException(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

class ServerException(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

class Category():
    CORRECT = 0
    OUTSIDE = 1
    NOTFOUND = 2

    @staticmethod
    def from_str(s):
        if s is None:
            raise ClientException('You must define category.')
        su = s.upper()
        if su == 'CORRECT':
            return Category.CORRECT
        elif su == 'OUTSIDE':
            return Category.OUTSIDE
        elif su == 'NOTFOUND':
            return Category.NOTFOUND
        else:
            raise ClientException('Category is not defined.')


class Database:
    def __init__(self, filename):
        self._filename = filename
        self._conn = None
        self._columns = "\
            `id`, `info`, \
            `original_west`, `original_east`, `original_north`, `original_south`, \
            `nominatim_west`, `nominatim_east`, `nominatim_north`, `nominatim_south`, \
            `nominatim_polygon`\
        "
        self._lock_cond = "strftime('%s', 'now') - locked > 3600"
        self._wheres = {}
        self._wheres[Category.CORRECT] = "\
            `original_north` <= `nominatim_north` AND `original_north` >= `nominatim_south`\
            AND `original_south` <= `nominatim_north` AND `original_south` >= `nominatim_south`\
            AND `original_west` >= `nominatim_west` AND `original_west` <= `nominatim_east`\
            AND `original_east` >= `nominatim_west` AND `original_east` <= `nominatim_east`\
        "
        self._wheres[Category.OUTSIDE] = "NOT ({})".format(self._wheres[Category.CORRECT])
        self._wheres[Category.NOTFOUND] = "\
            `original_north` is NULL OR `original_south` is NULL\
            OR `original_west` is NULL OR `original_east` is NULL\
            OR `nominatim_north` is NULL OR `nominatim_south` is NULL\
            OR `nominatim_west` is NULL OR `nominatim_east` is NULL\
        "

    def __enter__(self):
        self._conn = sqlite3.connect(self._filename)
        self._conn.isolation_level = None
        return self

    def __exit__(self, type, value, traceback):
        self._conn.close()

    def _get_record(self, where_st, level):
        if level <= 0:
            raise ClientException('Wrong level.')
        lock_st = "\
            UPDATE `authorities`\
            SET `locked` = strftime('%s', 'now'), uuid = ?\
            WHERE `id` = ?\
        "
        select_st = "SELECT {} FROM `authorities` WHERE ({}) AND ({}) AND `level` = ? LIMIT 1"
        select_st = select_st.format(self._columns, where_st, self._lock_cond)
        with closing(self._conn.cursor()) as cur:
            cur.execute(select_st, [str(level)])
            result = cur.fetchone()
            if result is None:
                return None
            id = result[0]
            uuid_val = str(uuid.uuid4())
            cur.execute(lock_st, (uuid_val, id))
            return result + (uuid_val,)

    def _get_where(self, category):
        return self._wheres.get(category, None)

    def get_authority(self, category, level):
        return self._get_record(self._get_where(category), level)

    def unlock_authority(self, uuid):
        with closing(self._conn.cursor()) as cur:
            cur.execute("UPDATE `authorities` SET `locked` = 0, uuid = NULL WHERE uuid = ?", [uuid])

    def verify_authority(self, user, uuid, west, east, north, south):
        with closing(self._conn.cursor()) as cur:
            update_st = "\
                UPDATE `authorities`\
                SET `verified_west` = ?, `verified_east` = ?,\
                    `verified_north` = ?, `verified_south` = ?,\
                    `level` = 0, `locked` = 0, `uuid` = NULL, `user` = ?\
                WHERE `uuid` = ?\
            "
            cur.execute(update_st, [west, east, north, south, user, uuid]);

    def get_levels(self, category):
        with closing(self._conn.cursor()) as cur:
            st = "SELECT `level` FROM `authorities` WHERE ({}) AND ({}) AND `level` > 0 GROUP BY `level`"
            st = st.format(self._get_where(category), self._lock_cond)
            cur.execute(st)
            result = cur.fetchall()
            return [x[0] for x in result]

    def inc_level(self, uuid):
        with closing(self._conn.cursor()) as cur:
            cur.execute("UPDATE `authorities` SET `level` = `level` + 1 WHERE uuid = ?", [uuid])


def parse_params(enabled_params, environ):
    req_params = urlparse.parse_qs(environ['QUERY_STRING'])
    result = {}
    for param in enabled_params:
        if param in req_params and len(req_params[param]) == 1:
            result[param] = req_params[param][0]
        else:
            result[param] = None

    return result

def parse_level(value):
    if value is None:
        raise ClientException('You must define level.')
    try:
        return int(value)
    except:
        raise ClientException('Level must be null')

def get_request_body(environ):
    try:
        request_body_size = int(environ.get('CONTENT_LENGTH', 0))
    except ValueError:
        request_body_size = 0
    req_body = environ['wsgi.input'].read(request_body_size)
    result = {}
    if req_body:
        try:
            result = json.loads(req_body)
        except ValueError:
            raise ClientException('POST data are not in JSON format.')
        except:
            raise ServerException('Problem occured in parsing JSON: {}'.format(sys.exc_info()[0]))
    return result

def retype_polygon(polygon):
    result = []
    for coors in polygon:
        new_coors = [float(coors[0]), float(coors[1])]
        result.append(new_coors)
    return result

def send_response(start_response, result):
    start_response('200 OK', [('Content-Type', 'application/json')])
    return [json.dumps(result)]

def send_authority_response(start_response, params, levels):
    if params is None:
        return send_response(start_response, {'code' : 'EOF'})
    result = {}
    result['id'] = params[0]
    result['info'] = params[1]
    result['original_west'] = params[2]
    result['original_east'] = params[3]
    result['original_north'] = params[4]
    result['original_south'] = params[5]
    result['nominatim_west'] = params[6]
    result['nominatim_east'] = params[7]
    result['nominatim_north'] = params[8]
    result['nominatim_south'] = params[9]
    result['nominatim_polygon'] = retype_polygon(json.loads(params[10])) if params[10] else None
    result['uuid'] = params[11]
    result['code'] = 'OK'
    result['levels'] = levels

    return send_response(start_response, result)

def app(environ, start_response):
    logging.basicConfig(filename='/var/log/auth_verif/backend.log')
    try:
        user = base64.b64decode(environ['HTTP_AUTHORIZATION'].split(' ')[1]).split(':')[0]
        params = parse_params(['action'], environ)
        body = get_request_body(environ)

        with Database(os.getenv('AUTH_VERIF_DB')) as db:
                if params['action'] is None:
                    raise ClientException('You must define action.')
                if params['action'] == 'get_authority':
                    category = Category.from_str(body.get('category'))
                    level = parse_level(body.get('level'))
                    uuid = body.get('uuid')
                    skip = body.get('skip')
                    if uuid:
                        if skip:
                            db.inc_level(uuid)
                        db.unlock_authority(uuid)
                    return send_authority_response(
                        start_response,
                        db.get_authority(category, level),
                        db.get_levels(category)
                    )
                elif params['action'] == 'get_levels':
                    category = Category.from_str(body.get('category'))
                    return send_response(
                        start_response,
                        db.get_levels(category)
                    )
                elif params['action'] == 'free_authority':
                    uuid = body.get('uuid')
                    if not uuid:
                        raise ClientException('You must define uuid.')
                    db.unlock_authority(uuid)
                    return send_response(
                        start_response,
                        {'code': 'OK'}
                    )
                elif params['action'] == 'verify_authority':
                    west = body.get('verified_west')
                    east = body.get('verified_east')
                    north = body.get('verified_north')
                    south = body.get('verified_south')
                    uuid = body.get('uuid')
                    category = Category.from_str(body.get('category'))
                    level = parse_level(body.get('level'))
                    if (not west) or (not east) or (not north) or (not south):
                        raise ClientException('Verified Authority is not specified.')
                    if not uuid:
                        raise ClientException('You must define uuid.')
                    db.verify_authority(user, uuid, west, east, north, south)
                    return send_authority_response(
                        start_response,
                        db.get_authority(category, level),
                        db.get_levels(category)
                    )
                else:
                    raise ClientException('Action is not defined.')
    except ClientException as e:
        start_response('400 Bad Request', [])
        return [str(e)]
    except ServerException as e:
        logging.error(e)
        start_response('500 Internal server error', [])
        return []


if __name__ == '__main__':
    WSGIServer(app).run()
