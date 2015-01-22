#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import sqlite3
import urllib.error
import urllib.request
import urllib.parse
import json
import geotools
import sys
from contextlib import closing

nominatim_url = "http://nominatim.openstreetmap.org/search.php?{}"

def get_nominatim_json(search):
    params = urllib.parse.urlencode({'q': search, 'format' : 'json', 'polygon' : '1'})
    with closing(urllib.request.urlopen(nominatim_url.format(params))) as response:
        return json.loads(response.read().decode())

parser = argparse.ArgumentParser(description = 'Tool for updating database by bounding boxes from nominatim.')
parser.add_argument('database', help='Sqlite database')

args = parser.parse_args()

with closing(sqlite3.connect(args.database)) as conn, closing(conn.cursor()) as read_cursor, closing(conn.cursor()) as write_cursor:
    for row in read_cursor.execute('''SELECT `id`, `info` FROM `authorities`
                                   WHERE `nominatim_west` IS NULL AND `nominatim_east` IS NULL
                                   AND `nominatim_north` IS NULL AND `nominatim_south` IS NULL'''):
        try:
            id, info = row
            address = json.loads(info).get('151', {}).get('a', None)
            if not address:
                continue
            sys.stderr.write("Processing row with id {}\r".format(id))
            sys.stderr.flush()
            nominatim_json = get_nominatim_json(address)

            if nominatim_json:
                boundingbox = geotools.BoundingBox(nominatim_json[0]['boundingbox'])

                if 'polygonpoints' in nominatim_json[0]:
                    write_cursor.execute("UPDATE `authorities` SET `nominatim_west` = ?, `nominatim_east` = ?, `nominatim_north` = ?, `nominatim_south` = ?, `nominatim_polygon` = ? WHERE `id` = ?",\
                                         (boundingbox.west, boundingbox.east, boundingbox.north, boundingbox.south, json.dumps(nominatim_json[0]['polygonpoints']) ,id))
                else:
                    write_cursor.execute("UPDATE `authorities` SET `nominatim_west` = ?, `nominatim_east` = ?, `nominatim_north` = ?, `nominatim_south` = ? WHERE `id` = ?",\
                                         (boundingbox.west, boundingbox.east, boundingbox.north, boundingbox.south, id))
            conn.commit()
        except urllib.error.HTTPError:
            print("WARNING HTTPError id: {}".format(id))
        except:
            print("Error at record with id {}".format(id))
