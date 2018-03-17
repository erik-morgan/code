import json
import os
from pathlib import Path

class PubDirs:
    envars = os.environ
    
    def __init__(self):
        self.indd = self._getPath('indd', 'PYPUB_INDD')
        self.pdfs = self._getPath('pdfs', 'PYPUB_PDFS')
        self.draw = self._getPath('draw', 'PYPUB_DRAW')
        print('Folder paths saved to environment variables.'
    
    def getProject(self):
        self.proj = self._getPath('proj')
        try:
            self.docx = self.proj.glob('**/*Outline.docx')[0]
        except IndexError:
            print('No outline found in project folder. Outline must end in "Outline.docx"')
            return
        self.opub = self.project / '.opub.xml'
    
    def _getPath(self, dirname, envname=None, p=None):
        if envname and self.envars.haskey(envname):
            p = Path(self.envars[envname])
        while not p or not (p.exists() and p.is_dir() and p.is_absolute()):
            p = Path(input(f'Enter full path to {dirName} folder: '))
        if envname and not self.envars.haskey(envname):
            self.envars[envname] = str(p)
        return p
