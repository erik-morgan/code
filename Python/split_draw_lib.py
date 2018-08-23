#!/usr/bin/python

from pathlib import Path
from shutil import copyfileobj as fcopy
import requests as req
from io import BytesIO
import re
from PyPDF2 import PdfFileReader as Reader, PdfFileWriter as Writer

# SPLIT PDF LIB BACK INTO INDIVIDUAL DRAWINGS & SPEC SHEETS
# CHECK IF THERE IS AN INDICATOR ON DIR RVW PAGE THAT SAYS IF ITS A DWG OR NOT
# pre-create dest dirs

DRAW_PATH = '/Users/HD6904/Desktop/Drawings'
root = Path(DRAW_PATH)
dest = root / 'Split-Drawings'
get_name = '{0}.{1}.pdf'.format

def main():
    tiffs = []
    for src in root.glob('[2467X]-'):
        dest = root / 'Split-Drawings' / src.name
        draws = []
        for f in src.iterdir():
            if f.suffix.lower() != 'pdf':
                continue
            name = f.name
            part, drev, srev = name[:-4].split('.')
            if srev != '-':
                slen = get_spec(part)
            draw = spec if '.-.' in name else draw
            if srev != '-':
                
            if drev != '-':
                

def get_spec(num):
    subdir = dest / (num[:2] if num[1] == '-' else 'X-')
    url = 'http://houston/ErpWeb/Part/PartDocumentReader.aspx'
    params = {'PartNumber': part_num, 'checkInProcess': 1}
    with req.get(url, params=params, stream=True) as reply:
        # check to see if num pages is listed in plain text
        pdfr = Reader(BytesIO(reply.raw.read()))
        name = re.search(r'filename="([-\w.]+)',
                         reply.headers['content-disposition'])[1]
    pdfw = Writer()
    pdfw.appendPagesFromReader(pdfr)
    with open(dest / subdir / name, 'wb') as f:
        pdfw.write(f)
    return pdfr.numPages

################################################################################


