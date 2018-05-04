from os import path, scandir, walk
from lxml import etree
from zipfile import ZipFile
import re
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
# f for f in gen_expr if 'Outline.docx' in f
# 
# IMPORTANT:
#   Start discussion about killing individual TOCs
#   File Naming: SS0264.R7 (TOCs have .TOC after rev)
# 
# REGX FOR DRAWINGS:
#     (\d-[0-9]|\d-[A-Z]{2}-|[A-Z]{2} ?|\d)\d{5}\S*

class Pypub:

    def __init__(self, dirs, progress_dialog):
        for directory in dirs:
            name, path = directory.split('=', 1)
            setattr(self, name, path)
        self.opub = path.join(self.proj, '.opub.xml')
        self.proj_files = list(self.idir(self.proj, False))
        self.docx = [f for f in self.proj_files if 'Outline.docx' in f]
        if not self.docx:
            raise OutlineError()
        else:
            self.docx = self.docx[0]
        self.prog = progress_dialog
    
    def get_pub(self):
        if path.is_file(self.opub):
            opub_mtime = self.opub.stat().st_mtime
            docx_mtime = self.docx.stat().st_mtime
        if opub_mtime and opub_mtime < docx_mtime:
            self.pub = etree.parse(self.opub).getroot()
        else:
            with ZipFile(self.docx) as zip:
                xdoc = zip.open('word/document.xml').read()
            self.pub = self.parse_outline(xdoc)
            self.prog.set_msg('Saving parsed outline...')
            etree.ElementTree(self.pub).write(self.opub)
            self.prog.update()
    
    def parse_outline(self, xdoc):
        parser = OutlineParser(xdoc)
        self.prog.set_rng(len(parse.sections))
        for sect in parser.sections:
            if 'APPENDIX' in sect[0]:
                parser.doc.set('appendix', 'True')
            else:
                parser.add_sect(sect)
            self.prog.update()
        return parser.xpub
    
    def file_check(self):
        docs = set(parser.doc_list)
        self.prog.set_rng(len(docs))
        self.lib = self._build_lib()
        missing = docs - set(self.lib)
        if missing:
            raise MissingFileError(missing)
        if self.pub.get('appendix') and 'Appendix' not in self.lib:
            raise AppendixError
    
    def gen_lib(self):
        dir_list = [
            self.idir(self.indd),
            self.idir(self.draw),
            self.proj_files
        ]
        file_gen = (f for d in dir_list for f in d)
        for file in file_gen:
            # FUCK. cant use str path to get name
            # just remake with os.walk (into list of lists or handle split there)
            if '.indd' in file.lower():
                yield ()
        file_
        list(self.idir(self.indd)) + 
        self.indd
        for f in self.idir(self.dirs):
            
        file_list = [for d in dirs for f in d.rglob('*.*')]
        lib = dict(f for d in dirs for f in d.rglob('*[ip][dn]*'))
        return lib
    
############################################################
    def idir(self, dirpath, parts=True):
        file_list = []
        for root, dirs, files in walk(dirpath):
            if parts:
                file_list.extend([(root, f, f.split('.')[-1]) for f in files])
############################################################
        with scandir(dirpath) as d:
            entries = list(d)
        for entry in entries:
            if entry.is_file():
                yield entry.path
            else:
                yield from self.iterdir(entry.path)

    def build_pub(pub):
        # write jsx function to handle indd files:
        # must accept the file to use, the drawings, and the output
        # then use pdftk or a python pdf library to compile everything
        pass
    
#    def findir(self, parent_dir, look_for, files_only=True):
#        for root, folds, files in walk(parent_dir):
#            if not files_only:
#                files += folds
#            for f in files:
#                if look_for in f:
#                    return path.join(root, f)
#        return None
        