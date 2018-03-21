import json
from pathlib import Path
from PIL import Image
from PIL.ImageTk import PhotoImage as PI

class PubDirs:
	app = Path(__file__).parent.resolve()
    config = app / 'config.json'
    imgs = {
        photo = 
        'start': PI(Image.open(app / 'images/start.svg')),
        'prefs': PI(Image.open(app / 'images/prefs.svg')),
        'exit': PI(Image.open(app / 'images/exit.svg'))
    }
    _dirs = {}
    
    def config_pub(self):
        if self.config.exists():
            self._dirs = json.load(self.config.open())
        self.indd = self._getPath('indd')
        self.pdfs = self._getPath('pdfs')
        self.draw = self._getPath('draw')
        json.dump(self._dirs, self.config.open('w'), sort_keys=True, indent=4)
        print('Folder paths saved to: ' + str(self.config))
    
    def get_project(self):
        self.proj = self._getPath('proj')
        try:
            self.docx = next(self.proj.rglob('*Outline.docx'))
        except StopIteration:
            print('No outline found in project folder. Outline must end in "Outline.docx"')
            return
        self.pub = self.project / '.pub.xml'
    
    def _getPath(self, dirname, p=None):
        if self._dirs.haskey(dirname):
            p = Path(self._dirs[dirname])
        while not p or not (p.exists() and p.is_dir() and p.is_absolute()):
            p = Path(input(f'Enter full path to {dirName} folder: '))
        self._dirs[dirname] = str(p)
        return p
