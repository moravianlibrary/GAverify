#!/usr/bin/env python3

import argparse
import marc21
import sqlite3
import json
import sys
import geotools
from contextlib import closing

table_schema = '''
    CREATE TABLE 'authorities' (
        'id' TEXT,
        'type' TEXT,
        'address' TEXT,
        'original_west' REAL,
        'original_east' REAL,
        'original_north' REAL,
        'original_south' REAL,
        'nominatim_west' REAL,
        'nominatim_east' REAL,
        'nominatim_north' REAL,
        'nominatim_south' REAL,
        'nominatim_polygon' TEXT,
        'verified_west' REAL,
        'verified_east' REAL,
        'verified_north' REAL,
        'verified_south' REAL,
        'level' INTEGER DEFAULT 1,
        'locked' INTEGER DEFAULT 0,
        'uuid'  TEXT,
        PRIMARY KEY ('id')
    )
'''

parser = argparse.ArgumentParser(description='Program for create sqlite database from Marc21 text file.')
parser.add_argument('input', help = 'Input Marc21 text file.')
parser.add_argument('output', help = 'Output Sqlite file.')

args = parser.parse_args()

with open(args.input) as in_file, closing(sqlite3.connect(args.output)) as conn, closing(conn.cursor()) as cursor:
    marcReader = marc21.Marc21Reader(in_file)
    cursor.execute(table_schema)

    for i, record in enumerate(marcReader):
        sys.stderr.write("Processing record {}\r".format(i))
        record['151'] = record.get('151', {})
        record['151']['a'] = record['151'].get('a', None)
        boundingbox = geotools.BoundingBox(record['034']) if '034' in record else None

        if boundingbox:
            cursor.execute(\
                "INSERT INTO 'authorities' ('id', 'type', 'address', 'original_west', 'original_east', 'original_north', 'original_south') VALUES (?, ?, ?, ?, ?, ?, ?)",\
                (record['001'], record['FMT'], record['151']['a'], boundingbox.west, boundingbox.east, boundingbox.north, boundingbox.south))
        else:
            cursor.execute(\
                "INSERT INTO 'authorities' ('id', 'type', 'address') VALUES (?, ?, ?)",\
                (record['001'], record['FMT'], record['151']['a']))

    sys.stderr.write("\n")
    sys.stderr.write("Commiting transaction.\n")
    conn.commit()
