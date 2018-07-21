#!/usr/bin/python
# from multiprocessing.dummy import Pool as ThreadPool
import os
from fnmatch import fnmatch as fn
import logging
from requests import get as req
from lxml import html
import pypdf2

# TODO: add multiprocessing support via ThreadPool
# TODO: add info logging statements like rev_check.sh
# TODO: check if login is needed on PC (if so, use os.getlogin or getpass.getuser)
# TODO: add support for checking stackup/gauging drawing revs

root = os.path.dirname(__file__)
sub_revs = {
    'NC': 0.5,
    'NR': 0.25,
    '0': 0
}

def get_revs(draw_id):
    # scrape page with draw_id
    # return tuple containing draw, spec revs
    pass

def rev_num(ltrs):
    if ltrs in sub_revs:
        return sub_revs[ltrs]
    return sum(26**i * (ord(c) - 64) for i, c in enumerate(ltrs[::-1]))

def check_revs():
    for path, dirs, files in os.walk(root):
        for dwg in files:
            if not fn(dwg, '[!A-Z]*[0-9][0-9][0-9][0-9][0-9]*pdf'):
                continue
            num, draw_rev, spec_rev = dwg.split('.')[0:3]
            draw_rev_new, spec_rev_new = get_revs(num)
            if rev_num(draw_rev_new) > rev_num(draw_rev):
                pass
            if rev_num(spec_rev_new) > rev_num(spec_rev):
                pass

def main():
    log_file = os.path.join(root, 'pyrev.log')
    with open(log_file, 'w') as f:
        pass
    logging.basicConfig(
        filename = log_file,
        format = '[%(asctime)s] %(levelname)s:%(message)s',
        datefmt = '%Y-%m-%dT%H:%M:%S',
        level = logging.INFO
    )
    check_revs():

# pypdf2 examples
pdf_file = open('sample.pdf')
read_pdf = PyPDF2.PdfFileReader(pdf_file)
# num pages
number_of_pages = read_pdf.getNumPages()
# extract pages
# combine files

