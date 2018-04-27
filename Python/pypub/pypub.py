from pathlib import Path
from lxml import etree
from zipfile import ZipFile
from outlineparser import OutlineParser
from pub_exceptions import OutlineError, MissingFileError

# Use INDD RPs with TOCs in front instead of separate files?
# Ignore advisory, and stick it in to INDD
# if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
# standardize RP naming convention (regarding CC0104-MT vs CC0104-QTM-CR vs CC0104-01MT)
# TODO: ADD TITLES TO RUNNING PROCEDURE LIBRARY AS METADATA
# TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
# TODO: add handling of third party documents for appendix
# TODO: introductions and pdf cover locations
# TODO: add intros and back cover to PDF location

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
            self.docx_mtime = self.docx.stat().st_mtime
        self.prog = progress_dialog
    
    def get_pub(self):
        self.prog.init_prog('Parsing Outline...')
        if self.opub.exists() and self.opub.stat().st_mtime < self.docx_mtime:
            self.pub = etree.fromstring(self.opub.read_bytes())
        else:
            with ZipFile(self.docx) as zip:
                xdoc = zip.open('word/document.xml').read()
            self.pub = self.parse_outline(xdoc)
            self.prog.set_msg('Saving parsed outline...')
            self.opub.write_bytes(etree.tostring(self.pub))
    
    def parse_outline(self, xdoc):
        parser = OutlineParser(xdoc)
        self.prog.set_rng(len(parser.sections))
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
        return parser.xpub
    
    def file_check(self):
        # store tocs like SS0264.R7.TOC.indd
        # store pdfs like SS0264.R7.pdf
        # store indd sources like SS0264.R7.indd
        # consider using R0 for Rev NC
        # get toc for each proc, and if proc not in pdf, check for source indd
        # consider adding a function to check if each source indd has corresponding pdf
        procs = []
        for proc in self.pub.xpath('//procedure[not(@bs)]'):
            rev = proc.get('rev', '')
            if not rev or not rev.isdigit():
                rev = ''
            else:
                rev = '.R' + str(rev)
            procs.append(proc.get('id') + rev)
        procs = set(procs)
        draws = set(self.pub.xpath('//drawing[not(@bs)]/@id'))
        inddLib = {i.stem:i for i in self.indd.rglob('*.indd')}
        procLib = {p.stem:p for p in self.pdfs.rglob('*.pdf')}
        drawLib = {d.name.split('.')[0]:d for d in self.draw.rglob('*.pdf')}
        proj_docs = {f.stem:f for f in self.proj.rglob('*pdf')}
        for proj_doc in proj_docs:
            doc_name = proj_doc.name
            if doc_name[0].isdigit():
        proj_docs = list((self.proj / 'PDFs').glob('*pdf'))
        procLib.update({p.stem:p for p in proj_docs})
        proj_draws = list((self.proj / 'Pull').glob('*pdf'))
        drawLib.update({d.name.split('.')[0]:d for d in proj_draws})
        self.files = []
        for proc in procs:
            if proc in procLib:
                self.files.append((proc, procLib[proc]))
        for draw in draws:
            if draw in drawLib:
                self.files.append((draw, drawLib[draw]))
        self.files = dict(self.files)
        docs = procs | draws
        missing = docs - set(self.files)
        if missing:
            raise MissingFileError(missing)
    
    def _build_lib(self):
        procs = self.pub.xpath('//procedure[not(@bs)]')
        format_proc = lambda p: 
        proc_ids = map((lambda p: ), procs)
        procs = [p.get('id') + p.get('rev', '') for p in procs]
        for proc in self.pub.xpath('//procedure[not(@bs)]'):
            rev = proc.get('rev', '')
            if not rev.isdigit():
                rev = ''
            else:
                rev = '.R' + str(rev)
            procs.append(proc.get('id') + rev)
        procs = set(procs)
        draws = set(self.pub.xpath('//drawing[not(@bs)]/@id'))
        inddLib = {i.stem:i for i in self.indd.rglob('*.indd')}
        procLib = {p.stem:p for p in self.pdfs.rglob('*.pdf')}
        drawLib = {d.name.split('.')[0]:d for d in self.draw.rglob('*.pdf')}
        proj_docs = {f.stem:f for f in self.proj.rglob('*pdf')}
        for proj_doc in proj_docs:
            doc_name = proj_doc.name
            if doc_name[0].isdigit():
        proj_docs = list((self.proj / 'PDFs').glob('*pdf'))
        procLib.update({p.stem:p for p in proj_docs})
        proj_draws = list((self.proj / 'Pull').glob('*pdf'))
        drawLib.update({d.name.split('.')[0]:d for d in proj_draws})
        
    def get_procs(self, proc_list):
        for proc in proc_list:
            proc_name = proc.get('id')
            rev = proc.get('rev', '')
            yield  + (rev + 
    
    
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
        procLib = {i.stem:i for i in self.indd.glob('*.indd')}
        drawLib = {d.name.split('.')[0]:d for d in self.draw.rglob('*.pdf')}
        projDraws = list(self.proj.rglob('[0-9]*pdf'))
        drawLib.update({d.name.split('.')[0]:d for d in projDraws})
        self.files = []
        for proc in procs:
            if proc in procLib:
                self.files.append((proc, procLib[proc]))
        for draw in draws:
            if draw in drawLib:
                self.files.append((draw, drawLib[draw]))
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
    
        
    
    