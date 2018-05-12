from os import path
from pub_exceptions import ConfigFileError

class AppConfig:
    
    colors = {
        'bg': (238, 238, 238),
        'fg': (33, 33, 33),
        'butbg': (224, 224, 224),
        'actbg': (33, 150, 243),
        'actfg': (255, 255, 255),
        'disbg': (209, 209, 209),
        'disfg': (177, 177, 177)
    }
    
    def __init__(self):
        self.configFile = path.join(path.dirname(__file__), 'config')
        if not path.exists(self.configFile):
            raise ConfigFileError
        self.dirs = {}
    
    def getDirs(self):
        dirs = {}
        with open(self.configFile) as f:
            lines = [ln.strip().split('=', 1) for ln in f if '=' in ln]
        dirs = {k.strip():v.strip() for k, v in lines}
        if 'Project' not in dirs:
            raise ConfigFileError
        for name in dirs:
            if name == 'Project' or not path.exists(dirs[name]):
                dirs[name] = ''
        self.dirs = dirs
        return dirs
    
    def setDirs(newDirs):
        for name in newDirs:
            if not path.exists(newDirs[name]):
                newDirs[name] = self.dirs[name]
        if newDirs != self.dirs:
            with open(self.configFile, 'w') as f:
                f.write('\n'.join(f'{k} = {v}' for k, v in newDirs.items()))
    
    