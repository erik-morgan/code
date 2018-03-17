import json
from pathlib import Path

class PubDirs:
    configPath = Path(__file__).parent.resolve() / 'config.json'
    _dirs = {}

    def __init__(self):
        if configPath.exists():
            self._dirs = json.load(configPath.open())
        self.indd = self._getPath('indd')
        self.pdfs = self._getPath('pdfs')
        self.draw = self._getPath('draw')
        json.dump(self._dirs, configPath.open('w'), sort_keys=True, indent=4)
        print('Folder paths saved to: ' + str(configPath))
    
    def getProject(self):
        self.proj = self._getPath('proj')
        try:
            self.docx = self.proj.glob('**/*Outline.docx')[0]
        except IndexError:
            print('No outline found in project folder. Outline must end in "Outline.docx"')
            return
        self.opub = self.project / '.opub.xml'
    
    def _getPath(self, dirname, p=None):
        if self._dirs.haskey(dirname):
            p = Path(self._dirs[dirname])
        while not p or not (p.exists() and p.is_dir() and p.is_absolute()):
            p = Path(input(f'Enter full path to {dirName} folder: '))
        self._dirs[dirname] = str(p)
        return p
