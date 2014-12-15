import parse
import json

class Point:
    def __init__(self, field034):
        assert field034['d'] == field034['e']
        assert field034['f'] == field034['g']
        
        if field034['f'][0] == 'N':
            self.latitude = parse.parse("N{:f}", field034['f'])[0]
        elif field034['f'][0] == 'S':
            self.latitude = -parse.parse("S{:f}", field034['f'])[0]
        else:
            raise ValueError("Wrong input data: {}".format(field034['f']))
        
        if field034['d'][0] == 'E':
            self.longitude = parse.parse("E{:f}", field034['d'])[0]
        elif field034['d'][0] == 'W':
            self.longitude = -parse.parse("W{:f}", field034['d'])[0]
        else:
            raise ValueError("Wrong input data: {}".format(field034['d']))


class BoundingBox:
    def __init__(self, coordinates):
        if isinstance(coordinates, list):
            self.south, self.north, self.west, self.east = [float(coordinate) for coordinate in coordinates]
        elif isinstance(coordinates, dict):
            if coordinates['d'][0] == 'E':
                self.west = parse.parse("E{:f}", coordinates['d'])[0]
            elif coordinates['d'][0] == 'W':
                self.west = -parse.parse("W{:f}", coordinates['d'])[0]
            else:
                raise ValueError("Wrong input data: {}".format(coordinates['d']))
            
            if coordinates['e'][0] == 'E':
                self.east = parse.parse("E{:f}", coordinates['d'])[0]
            elif coordinates['e'][0] == 'W':
                self.east = -parse.parse("W{:f}", coordinates['d'])[0]
            else:
                raise ValueError("Wrong input data: {}".format(coordinates['e']))
            
            if coordinates['f'][0] == 'N':
                self.north = parse.parse("N{:f}", coordinates['f'])[0]
            elif coordinates['f'][0] == 'S':
                self.north = -parse.parse("S{:f}", coordinates['f'])[0]
            else:
                raise ValueError("Wrong input data: {}".format(coordinates['f']))
            
            if coordinates['g'][0] == 'N':
                self.south = parse.parse("N{:f}", coordinates['f'])[0]
            elif coordinates['g'][0] == 'S':
                self.south = -parse.parse("S{:f}", coordinates['f'])[0]
            else:
                raise ValueError("Wrong input data: {}".format(coordinates['g']))
            
            
        
    def contains(self, point):
        return self.south < point.latitude < self.north\
           and self.west < point.longitude < self.east
        
    def tomarc21(self):
        marc21 = {}
        marc21['d'] = "E{:08.4f}".format(self.west)
        marc21['e'] = "E{:08.4f}".format(self.east)
        marc21['f'] = "N{:08.4f}".format(self.north)
        marc21['g'] = "N{:08.4f}".format(self.south)
        return json.dumps(marc21)