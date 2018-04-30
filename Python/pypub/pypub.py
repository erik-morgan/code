from path_lib import Path
from lxml import etree
from zipfile import ZipFile
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
#   If I require appendix sections to be pre-built, I can ignore third-party documents
#   File Naming: SS0264.R7 (TOCs have .TOC after rev)


class Pypub:

    def __init__(self, dir_list, progress_dialog):
        for directory in dir_list:
            name, path = directory.split('=', 1)
            setattr(self, name, Path(path))
        self.opub = self.proj / '.opub.xml'
        self.docx = list(self.proj.rglob('*Outline.docx'))
        if not self.docx:
            raise OutlineError()
        else:
            self.docx = self.docx[0]
        self.prog = progress_dialog
    
    def get_pub(self):
        self.prog.init_prog('Parsing Outline...')
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
    
    def parse_outline(self, xdoc):
        parser = OutlineParser(xdoc)
        self.prog.set_rng(parser.init_parser())
        for index, sect in enumerate(parser.sections):
            doc_index = parser.doc.index(sect)
            pdata = parser.ptext[doc_index]
            self.prog.update()
            if not parser.ptext[doc_index + 1]:
                parser.add_phase(pdata)
                continue
            else:
                parser.add_unit(pdata)
            next_doc_index = parser.doc.index(parser.sections[index + 1])
            parser.parse_sect(parser.ptext[doc_index + 1:next_doc_index])
        appendix = parser.xpub.xpath('//phase[@name="APPENDIX"]')
        if len(appendix_units):
            parser.xpub.remove(appendix)
            parser.xpub.set('appendix', 'True')
        return parser.xpub
    
    def file_check(self):
        # add appendix check that raises AppendixError
        procs = self.pub.xpath('//procedure[not(@bs)]')
        procs = {proc.get('filename') for proc in procs}
        draws = set(self.pub.xpath('//drawing[not(@bs)]/@id'))
        tpdocs = self.pub.xpath('//third-party[not(@bs)]')
        indd_lib, proc_lib, draw_lib = self._build_libs(len(tpdocs) > 0)
        self.lib = {**indd_lib, **proc_lib, **draw_lib}
        self.files = []
        for proc in procs:
            if proc in proc_lib:
                self.files.append((proc, proc_lib[proc]))
        for draw in draws:
            if draw in draw_lib:
                self.files.append((draw, draw_lib[draw]))
        self.files = dict(self.files)
        docs = procs | draws
        missing = docs - set(self.files)
        if missing:
            raise MissingFileError(missing)
    
    def _build_lib(self):
        # i only need indd_lib b/c if i have that, then I can create toc or pdf
        # check for toc/pdf at run-time, during unit processing
        lib_paths = [
            (self.indd, '*.indd'),
            (self.draw, '*.pdf'),
            (self.proj, '[!O]*/[!.]*')
        ]
        lib_list = [f for d, g in lib_paths for f in d.rglob(g)]
        lib_files = []
        for f in lib_files:
            
        
        
        lib = list(self.indd.rglob()) + list(self.draw.rglob())
        
        indd_lib = {i.stem:i for i in self.indd.rglob('*.indd')}
        draw_lib = {d.name.split('.')[0]:d for d in self.draw.rglob('*.pdf')}
        proj_docs = list(self.proj.rglob())
        for doc in proj_docs:
            if doc.match('[0-9]*pdf'):
                draw_lib[doc.name.split('.')[0]] = doc
            if doc.suffix.lower() == 'indd':
                indd_lib[doc.stem] = doc
        return indd_lib, proc_lib, draw_lib
    
#####################################################################
    def _lib_gen(self, path_list):
        for p in path_list:
            pparts = p.name.lower().split('.')
            if pparts[-1] == 'pdf' and pparts[0][0].isdigit():
                yield (pparts[0], p)
            else:
                yield (pparts[0:-1], p)
#####################################################################
    
    def future_file_check(self):
        # this version is for non-separate tocs
        procs = []
        for proc in self.pub.xpath('//procedure[not(@bs)]'):
            rev = proc.get('rev', '')
            if not rev or not rev.isdigit():
                rev = ''
            procs.append(proc.get('id') + rev)
        procs = set(procs)
        draws = set(self.pub.xpath('//drawing[not(@bs)]/@id'))
        proc_lib = {i.stem:i for i in self.indd.glob('*.indd')}
        draw_lib = {d.name.split('.')[0]:d for d in self.draw.rglob('*.pdf')}
        projDraws = list(self.proj.rglob('[0-9]*pdf'))
        draw_lib.update({d.name.split('.')[0]:d for d in projDraws})
        self.files = []
        for proc in procs:
            if proc in proc_lib:
                self.files.append((proc, proc_lib[proc]))
        for draw in draws:
            if draw in draw_lib:
                self.files.append((draw, draw_lib[draw]))
        self.files = dict(self.files)
        docs = procs | draws
        missing = docs - set(self.files)
        if missing:
            raise MissingFileError(missing)
    
    def build_pub(pub):
        # write jsx function to handle indd files:
        # must accept the file to use, the drawings, and the output
        # then use pdftk or a python pdf library to compile everything
        pass
    
        
    
    