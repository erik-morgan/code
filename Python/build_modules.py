# 2018-08-18 22:01:51 #
import sys
from os import walk, getcwd, remove
from os.path import exists, isdir
from fnmatch import filter as fnfilter
from PyPDF2 import PdfFileReader as Reader, PdfFileMerger as Merger
import re

# TODO: move dwgs from Libraries to Drawings
# TODO: finally standardize proc naming to SS####.R#.ext
# NOTE: could benefit from a coroutine setup where the builder appends to Merger
#       while none of the files are missing. then, if missing, it'll keep a list of
#       missing files. then, at end, when next is triggered without a send, it'll
#       evaluate missing list, and either write to file (will need to somehow accept path)
#       or print the missing message

PDFS_PATH = '/Users/HD6904/Desktop/PDFs'
DRAWS_PATH = '/Users/HD6904/Desktop/Drawings'
drawre = re.compile(r'(?:\d-)?(?:[A-Z]{2}-?\d{5}|\d{6})(?=\D)\S*', re.I)
# PROBLEM IS THAT IF IT IS A-Z it can only match 5 digits
# Possible Starting Strings: 2-\d{6} | 2-PD-\d{5} | TP\d{5} | \d{6}
# 
# STILL WON'T PROPERLY HANDLE LIT WHERE DWG IS REPEATED IN DESCRIPTION
# 
# drawre = re.compile(r'(?:[-0-9]{8,}|(?:\d-)?(?:[A-Z]{2}[- ]?)\d{5})\S*', re.I)

def main(proj):
    proj_tocs = proj + '/TOCs/'
    proj_pdfs = proj + '/PDFs/'
    if exists(proj_tocs) and exists(proj_pdfs):
        for toc_path in iter_dir(proj_tocs, '*TOC.*'):
            name, proc = re.search(r'.+/(([^. ]+).+)', toc_path).groups()
            merge_list = [toc_path, get_path(proc)]
            for draw in scrape_toc(toc_path):
                draw = get_path(draw)
                if draw not in merge_list:
                    merge_list.append(draw)
            if all([exists(f) for f in merge_list]):
                build_module(merge_list, proj_pdfs + proc + '.pdf')
            else:
                print(f'{name} failed to build due to missing files: ' +
                      ', '.join(f for f in merge_list if '/' not in f))
    else:
        print('The project directory must contain "TOCs" and "PDFs" folders.\n'
              'If called without an argumemt, working directory is used.')

def scrape_toc(toc):
    with open(toc, 'rb') as f:
        txt = '\n'.join(pg.extractText() for pg in Reader(f).pages)
    txt = re.sub(r' (?=\d{5})', '', txt.split('Assembly Drawing')[1])
    for draw in drawre.finditer(txt):
        yield draw[0]

def build_module(path_list, out_path):
    if exists(out_path):
        os.remove(out_path)
    pdf = Merger()
    for path in path_list:
        pdf.append(path)
    pdf.write(out_path)

def iter_dir(dir_path, cond='*'):
    for path, dirs, files in walk(dir_path):
        path += '/'
        files = [path + f for f in fnfilter(files, '*.[Pp][Dd][Ff]')]
        for f in fnfilter(files, cond):
            yield f

def get_path(idnum):
    # draw test without using re:
    # if len(max(''.join(str(int(c.isdigit())) for c in idnum).split('0'))) > 4:
    pattern = '*/{0}*'.format
    if re.search(r'[0-9]{5}', idnum):
        paths = fnfilter(draws, pattern(idnum + '.'))
        if not paths:
            paths = fnfilter(draws, pattern(idnum.rsplit('-', 1)[0] + '.'))
    else:
        paths = fnfilter(pdfs, pattern(idnum))
    return paths[0] if paths else idnum

def test_dir(path):
    if exists(path) and isdir(path):
        return True
    print(f'{path} is not a valid directory.')
    return False

if __name__ == '__main__':
    proj_path = sys.argv[1] if len(sys.argv) > 1 else getcwd()
    if test_dir(PDFS_PATH) and test_dir(DRAWS_PATH):
        pdfs = list(iter_dir(PDFS_PATH))
        draws = list(iter_dir(DRAWS_PATH))
        if len(sys.argv) == 1:
            main(getcwd())
        else:
            main(sys.argv[1])
