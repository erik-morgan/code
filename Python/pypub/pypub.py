from pathlib import Path
from lxml import etree
from zipfile import ZipFile
from outlineparser import OutlineParser

# Remove .outline.json after finished
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
# TODO: 

class Pypub:

    def __init__(self, dir_list, err_func):
        for directory in dir_list:
            name, path = directory.split('=', 1)
            setattr(self, name, path)
        self.opub = Path(self.proj) / '.opub.xml'
        self.onerror = err_func

    def parseOutline(self):
        if self.opub.exists():
            self.pub = etree.fromstring(self.opub.read_bytes())
        else:
            with ZipFile(dirs.docx) as zip:
                xdoc = zip.open('word/document.xml').read()
            self.parser = OutlineParser(xdoc)
            self.pub = self.parser.parse()
            self.opub.write_bytes(etree.tostring(self.pub))
    
    def fileCheck(xpub):
        # TODO: introductions and pdf cover locations
        # TODO: add intros and back cover to PDF location
        procs = set((p.get('id'), p.get('rev')) for p in xpub.xpath('//procedure[not(@bs)]'))
        draws = set(xpub.xpath('//drawing[not(@bs)]/@id'))
        procLib = [i.stem for i in dirs.indd.glob('*.indd')]
        drawLib = [d.name.split('.')[0] for d in dirs.draw.glob('*.pdf')]
        fails = []
        app = fails.append
        for proc, rev in procs:
            rev = f'.R{int(rev)}' if rev.isdigit() else ''
            if f'{proc[0]}{rev}' not in procLib:
                app(f'{proc[0]}, Rev {rev}')
        for draw in draws:
            if draw not in drawLib:
                try:
                    localDraw = next(dirs.proj.rglob(f'{draw}*pdf'))
                except StopIteration:
                    app(draw)
        for i, fail in enumerate(fails):
            print(f'Addressing fail {i}/{len(fails)}:')
            print(f'Failed to find {fail} in provided directories')
        else:
            return not fails

    def buildPub(pub):
        # write jsx function to handle indd files:
        # must accept the file to use, the drawings, and the output
        # then use pdftk or a python pdf library to compile everything
        pass
