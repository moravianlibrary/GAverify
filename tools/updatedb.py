#!/usr/bin/env python3

import argparse
import sqlite3
import geotools
import json
import sys
from contextlib import closing

parser = argparse.ArgumentParser(description = 'Tool for updating database. It converts marc034 to real values.')
parser.add_argument('database', help='Sqlite database')

args = parser.parse_args()

with closing(sqlite3.connect(args.database)) as conn:
    read_cursor = conn.cursor()
    write_cursor = conn.cursor()
    for row in read_cursor.execute("SELECT `001`, `034` FROM `authorities` WHERE `034` is not null"):
        id, field034 = row
        
        sys.stderr.write("Processing record {}\r".format(id))
        
        boundingbox = geotools.BoundingBox(json.loads(field034))
        write_cursor.execute("UPDATE `authorities` SET `original_west` = ?, `original_east` = ?, `original_north` = ?, `original_south` = ? WHERE `001` = ?",\
                            (boundingbox.west, boundingbox.east, boundingbox.north, boundingbox.south, id))
    conn.commit()
    sys.stderr.write("\n")