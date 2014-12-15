class Marc21Reader:
    def __init__(self, file):
        self.file = file
        
    def __parse_subfields(self, param_subfields):
        if param_subfields.find('$$') == -1:
            return param_subfields
        
        subfields = str(param_subfields)
        result = {}
        
        while True:
            dollars_index = subfields.rfind('$$')
            
            if dollars_index == -1:
                break
            
            subfield = subfields[dollars_index:]
            subfields = subfields[:dollars_index]
            result[subfield[2]] = subfield[3:]
            
        return result

    def read_record(self):
        current_id = None
        filepos = 0
        record = {}
        
        while True:
            filepos = self.file.tell()
            line = self.file.readline()
            
            if not line:
                return None
            
            line = line.rstrip()
            id, field, c, subfields = line.split(maxsplit=3)

            if current_id is None:
                current_id = id
            if current_id != id:
                if record['FMT'] == 'GA' or record['FMT'] == 'PA':
                    self.file.seek(filepos)
                    break
                else:
                    self.file.seek(filepos)
                    current_id = None
                    record = {}
                    continue
                    
            record[field] = self.__parse_subfields(subfields)
            
        return record
        

    def __iter__(self):
        return self
    
    def __next__(self):
        record = self.read_record()
        if record is None:
            raise StopIteration
        else:
            return record