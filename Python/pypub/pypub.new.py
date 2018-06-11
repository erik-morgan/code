from observer import Observer
from os import scandir
from os.path import join, getmtime
from lxml import etree
from zipfile import ZipFile
from fnmatch import fnfilter
from outlineparser import OutlineParser
from pub_exceptions import OutlineError, MissingFileError, AppendixError

# if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
# standardize RP naming convention (regarding CC0104-MT vs CC0104-QTM-CR vs CC0104-01MT)
# TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
# TODO: introductions and pdf cover locations
# TODO: add intros and back cover to PDF location
# to order SUDs for buildpub, just call illustration and drawing xpaths separately
# 
# IMPORTANT:
#   File Naming: SS0264.R7 (TOCs have .TOC after rev;  consider using R00 for NC)
# 
# REGX FOR DRAWINGS:
#     (\d-[0-9]|\d-[A-Z]{2}-|[A-Z]{2} ?|\d)\d{5}\S*

class Pypub(Observer):
    
    def __init__(self, dirs):
        for directory in dirs:
            name, path = directory.split('=', 1)
            setattr(self, name, path)
        self.docx = self.dirlist(self.proj, '*Outline.docx')
        if not self.docx:
            raise OutlineError()
        else:
            self.docx = self.docx[0]
    
    def initParser(self):
        with ZipFile(self.docx) as zip:
            xdoc = zip.open('word/document.xml').read()
        self.parser = OutlineParser(xdoc)
    
    def parseOutline(self):
        for sect in self.parser.sections:
            if 'APPENDIX' in sect[0]:
                self.parser.doc.set('appendix', 'True')
            else:
                self.parser.addSect(sect)
        self.pub = self.parser.xpub
    
    def dirlist(self, dirpath, pattern=None):
        def fileGen(dir):
            for entry in scandir(dirpath):
                if entry.is_file():
                    yield entry.path
                else:
                    yield from dirlist(entry)
        if pattern:
            return fnfilter(list(fileGen(dirPath)), pattern)
        else:
            return list(fileGen(dirPath))
    
