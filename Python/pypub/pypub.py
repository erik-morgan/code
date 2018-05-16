from observer import Observer
from os import walk
from os.path import is_file, join, getmtime
from lxml import etree
from zipfile import ZipFile
import fnmatch as fn
from outlineparser import OutlineParser
from pub_exceptions import OutlineError, MissingFileError, AppendixError

# Use INDD RPs with TOCs in front instead of separate files?
# Ignore advisory, and stick it in to INDD
# if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
# standardize RP naming convention (regarding CC0104-MT vs CC0104-QTM-CR vs CC0104-01MT)
# TODO: ADD TITLES TO RUNNING PROCEDURE LIBRARY AS METADATA
# TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
# TODO: add handling of third party documents for appendix
# TODO: introductions and pdf cover locations
# TODO: add intros and back cover to PDF location
# Consider using R00 for Rev NC
# 
# IMPORTANT:
#   Start discussion about killing individual TOCs
#   File Naming: SS0264.R7 (TOCs have .TOC after rev)
# 
# REGX FOR DRAWINGS:
#     (\d-[0-9]|\d-[A-Z]{2}-|[A-Z]{2} ?|\d)\d{5}\S*

class Pypub(Observer):
    
    def __init__(self, dirs, progress_dialog):
        self.dir_list = []
        for directory in dirs:
            name, path = directory.split('=', 1)
            setattr(self, name, path)
            self.dir_list.append(getattr(self, name))
        self.opub = join(self.proj, '.opub.xml')
        self.docx = fn.filter(list(self.idir(self.proj)), '*Outline.docx')
        if not self.docx:
            raise OutlineError()
        else:
            self.docx = self.docx[0]
        if is_file(self.opub) and getmtime(self.opub) < getmtime(self.docx):
            self.pub = etree.parse(self.opub).getroot()
        self.prog = progress_dialog
    
    def save_opub(self):
        self.prog.set_msg('Saving parsed outline...')
        etree.ElementTree(self.pub).write(self.opub)
        self.prog.update()
    
    def init_parser(self):
        with ZipFile(self.docx) as zip:
            xdoc = zip.open('word/document.xml').read()
        self.parser = OutlineParser(xdoc)
        self.parse_range = len(parser.sections)
    
    def parse_outline(self, on_sect_done):
        for sect in parser.sections:
            if 'APPENDIX' in sect[0]:
                parser.doc.set('appendix', 'True')
            else:
                parser.add_sect(sect)
            on_sect_done()
        self.pub = parser.xpub
    
    def file_check(self):
        docs = set(parser.doc_list)
        self.prog.set_rng(len(docs))
        self.lib = dict(item for item in self.build_lib())
        missing = docs - set(self.lib)
        if missing:
            raise MissingFileError(missing)
        if self.pub.get('appendix') and 'Appendix' not in self.lib:
            raise AppendixError
    
    def build_lib(self):
        splits = {True: str.rsplit, False: str.split}
        for fpath, fname in self.idir(self.dir_list, False):
            yield splits[fn.fnmatch('*.indd')](fname, '.', 1)[0], join(fpath, fname)
    
    def idir(self, dirpaths, join_path=True):
        if instanceof(dirpaths, str):
            dirpaths = [dirpaths]
        for dirpath in dirpaths:
            for path, dirs, flist in os.walk(dirpath):
                for f in flist:
                    if join_path:
                        yield join(path, f)
                    else:
                        yield path, f
    
    def build_pub(pub):
        # write jsx function to handle indd files:
        # must accept the file to use, the drawings, and the output
        # then use pdftk or a python pdf library to compile everything
        pass
    