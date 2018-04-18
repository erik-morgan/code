from pathlib import Path
from lxml import etree
from zipfile import ZipFile
from outlineparser import OutlineParser

# Remove .opub.xml after finished
# Stop putting pull lists into outline folder
# First check for existence of all drawings (minus stack-ups)
# use outline metadata for proj details
# urldecode special characters. see if lxml does it, or do global f/r
# Use INDD RPs with TOCs in front instead of separate files
# Ignore advisory, and stick it in to INDD
# if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
# standardize RP naming convention (regarding CC0104-MT vs CC0104-QTM-CR vs CC0104-01MT)
# TODO: ADD TITLES TO RUNNING PROCEDURE LIBRARY AS METADATA
# TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
# TODO: add handling of bluesheets
# TODO: add handling of third party documents for appendix

class Pypub:

    def __init__(self, dir_list, err_func):
        for directory in dir_list:
            name, path = directory.split('=', 1)
            setattr(self, name, Path(path))
        self.opub = self.proj / '.opub.xml'
        self.onerror = err_func
        self.docx = list(self.proj.rglob('*Outline.docx'))
        if not self.docx:
            self.onerror('No outline found in project directory. Outlines must end in "Outline.docx".')
        else:
            self.docx = self.docx[0]
            self.docx_mtime = self.docx.stat().st_mtime

    def parseOutline(self):
        if self.opub.exists() and self.opub.stat().st_mtime < self.docx_mtime:
            self.pub = etree.fromstring(self.opub.read_bytes())
        else:
            with ZipFile(self.docx) as zip:
                xdoc = zip.open('word/document.xml').read()
            self.parser = OutlineParser(xdoc)
            self.pub = self.parser.parse()
            self.opub.write_bytes(etree.tostring(self.pub))
    
    def fileCheck(self):
        # TODO: introductions and pdf cover locations
        # TODO: add intros and back cover to PDF location
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
            self.onerror('Unable to find the following files:\n' + '\n'.join(missing))
    
    def buildPub(pub):
        # write jsx function to handle indd files:
        # must accept the file to use, the drawings, and the output
        # then use pdftk or a python pdf library to compile everything
        pass
