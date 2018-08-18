# 2018-08-18 00:00:09 #
from os import walk, chdir, getcwd, sep
from os.path import exists, isdir, dirname, basename
from fnmatch import fnmatch, filter as fnfilter
from PyPDF2 import PdfFileReader as Reader, PdfFileMerger as Merger, PdfFileWriter as Writer
import sys
import re

# TODO: move dwgs from Libraries to Drawings
# TODO: finally standardize proc naming to SS####.R#.ext

drawre = re.compile(r'^ *[-0-9A-Z]+ ?\d{5}\S*', re.I|re.M)
missing_msg = 'Skipping "{0}"...Could not find file(s): {1}'

def main(dirs):
    for dir_path in dirs:
        tocs = [f for f in parse_dir(dir_path) if fnmatch(f, '*TOC.*')]
        for toc in tocs:
            files, missing = parse_toc(toc)
            if missing:
                print(missing_msg.format(basename(toc), ', '.join(missing)))
            else:
                build_module(files, toc)

def parse_dir(dir_path):
    if exists(dir_path) and isdir(dir_path):
        for path, dirs, files in walk(dir_path):
            path = path + sep
            for f in files:
                if f[-3:].lower() == 'pdf':
                    yield path + f

def parse_toc(toc):
    missing = []
    cat_list = [toc, get_path(basename(toc), True)]
    if not cat_list[1]:
        missing.append('Procedure PDF')
    with open(toc, 'rb') as f:
        txt = '\n'.join(pg.extractText() for pg in Reader(f).pages)
        for draw in drawre.finditer(txt):
            draw_path = get_path(draw)
            if draw_path:
                cat_list.append(draw_path)
            else:
                missing.append(draw)
    return cat_list, missing

def get_path(file_id, is_proc=False):
    pattern = '*/' + file_id + '*'
    path = fnfilter(PDFS if is_proc else DRAWS, pattern)
    if not path and not is_proc:
        return get_path(file_id.rsplit('-', 1)[0] + '.')
    return path[0] if path else None

def build_module(path_list, toc):
    # use Merger class, and write to module_path
    toc = re.sub(r'(.+)TOCs(.+).TOC', r'\1PDFs\2', toc)
    # LEFT OFF HERE

if __name__ == '__main__':
    PDFS = list(parse_dir('/Users/HD6904/Desktop/PDFs'))
    DRAWS = list(parse_dir('/Users/HD6904/Desktop/Drawings'))
    if len(sys.argv) == 1:
        main(getcwd())
    else:
        main(sys.argv[1:])
