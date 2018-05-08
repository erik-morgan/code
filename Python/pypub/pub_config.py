from pathlib import Path
from pub_exceptions import ConfigDirError

class Configuration:
    
    def __init__(self):
        self.configFile = Path(__file__).parent.resolve() / 'config'
        pubdirs = ['InDesign', 'PDFs', 'Drawings', 'Project']
        if pubdirs and 'Project' in pubdirs and isinstance(pubdirs, list):
            self.pubdirs = pubdirs
        else:
            raise ConfigDirError
#        self.pubdirs = {
#            'indd': 'InDesign',
#            'pdfs': 'PDFs',
#            'draw': 'Drawings',
#            'proj': 'Project'
#        }
        
    def getColors(self):
        return {
            'bg': (238, 238, 238),
            'fg': (33, 33, 33),
            'butbg': (224, 224, 224),
            'actbg': (33, 150, 243),
            'actfg': (255, 255, 255),
            'disbg': (209, 209, 209),
            'disfg': (177, 177, 177)
        }
    
    def load_dirs():
        opt_char, opts =  '=', {}
        dir_list = []
        if configfile.exists():
            lines = configfile.read_text().splitlines()
            for line in lines:
                key, val = line.split(opt_char, 1)
                opts[key.strip()] = val.strip()
        for name, label in pubdirs:
            dir_opts = (name, label, opts.get(name, ''))
            dir_list.append(dir_opts)
        return dir_list
    
    def dump_dirs(dirtext):
        dirtext = ''.join(dirtext)
        configfile.write_text(dirtext)
    