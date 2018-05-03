from path_lib import Path
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
# IMPORTANT:
#   Start discussion about killing individual TOCs
#   File Naming: SS0264.R7 (TOCs have .TOC after rev)
# 
# REGX FOR DRAWINGS:
#     (\d-[0-9]|\d-[A-Z]{2}-|[A-Z]{2} ?|\d)\d{5}\S*

class Pypub:

    def __init__(self, dir_list, progress_dialog):
        self.dir_list = []
        for directory in dir_list:
            name, path = directory.split('=', 1)
            setattr(self, name, Path(path))
            self.dir_list.append(getattr(self, name))
        self.opub = self.proj / '.opub.xml'
        self.docx = list(self.proj.rglob('*Outline.docx'))
        if not self.docx:
            raise OutlineError()
        else:
            self.docx = self.docx[0]
        self.prog = progress_dialog
    
    def get_pub(self):
        if self.opub.exists():
            opub_mtime = self.opub.stat().st_mtime
            docx_mtime = self.docx.stat().st_mtime
        if opub_mtime and opub_mtime < docx_mtime:
            self.pub = etree.fromstring(self.opub.read_bytes())
        else:
            with ZipFile(self.docx) as zip:
                xdoc = zip.open('word/document.xml').read()
            self.pub = self.parse_outline(xdoc)
            self.prog.set_msg('Saving parsed outline...')
            self.opub.write_bytes(etree.tostring(self.pub))
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
    
    def _build_lib(self):
        dir_list = [self.indd, self.draw, self.proj]
        lib = dict(f for d in dir_list for f in d.rglob('*[ip][dn]*'))
        return lib
    
    def _build_lib(self):
        dir_list = [self.indd, self.draw, self.proj]
        lib = dict(f for d in dir_list for f in self.parse_dir(d))
        return lib
    
    def parse_dir(self, dir_path):
        for item in dir_path.iterdir():
            if item.is_dir():
                yield from self.parse_dir(item)
            else:
                ext = item.suffix.lower()
                if ext == 'indd':
                    yield (item.stem, item)
                elif ext == 'pdf':
                    yield (item.split('.')[0], item)
    
    def build_pub(pub):
        # write jsx function to handle indd files:
        # must accept the file to use, the drawings, and the output
        # then use pdftk or a python pdf library to compile everything
        pass
    
        
    
    