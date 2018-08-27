# 2018-08-26 23:04:06 #
from pathlib import Path
from os import listdir
from logging import basicConfig, info, error
import requests as req
from lxml.html import fromstring as tohtml, get_element_by_id as get_id
from io import BytesIO
from PyPDF2 import PdfFileReader as Reader, PdfFileWriter as Writer, PdfFileMerger as Merger
from concurrent.futures import ThreadPoolExecutor, as_completed

# TODO: add info logging statements like rev_check.sh
# TODO: add support for SUD/Gauging revs (by refactoring Drawings folder organization)
# TODO: merge 2-, 4-, 6-, 7-, and X- into single folder called Units or Assembly Drawings or Library
# TODO: idk how necessary pathlib module is; after implementing rev_draws & pdf portion of check_revs, reevaluate
# NOTE: can't just keep diff revs and use that, bc it's possible that two files have diff revs of same dwg

DRAW_PATH = '/Users/HD6904/Desktop/Drawings'
root = Path(DRAW_PATH)
pyrev = root / '.pyrev'
revint = lambda s: sum((ord(c) - 64) * 26**n for n, c in enumerate(s[::-1]))
get_name = '{0}.{1}.{2}.pdf'.format

def main():
    pyrev.mkdir(parents=True, exist_ok=True)
    basicConfig(filename = pyrev / 'log.txt',
                format = '[%(asctime)s] %(levelname)s:%(message)s',
                datefmt = '%Y-%m-%dT%H:%M:%S',
                level = logging.INFO)
    pull = pyrev / 'pull.txt'
    files = get_files(root / 'Library')
    if pull.exists:
        rev_draws(pull)
        # only delete pull when all dwgs are replaced, but update it each time
    else:
        # clear log_file
        pull_list = check_revs(files)
        if pull_list:
            pull.write_text('\n'.join(pull_list))

def get_files(lib_dir):
    files = {}
    for f in lib_dir.glob('*.*.*.???'):
        part, draw_rev, spec_rev = f.name.split('.')[0:-1]
        draw = part if '.-.' in f.name else part.rsplit('-', 1)[0]
        files[f] = ((None if draw_rev == '-' else draw, draw_rev),
                   (None if spec_rev == '-' else part, spec_rev))
    return files

def check_revs(file_list):
    ############################################################################
    # lib.glob('*.*.*.???')
    # use partre?
    # num pages in raw text like: /Type/Pages ... \n/Kids.+ ... \n/Count #
    revs = get_revs(file_list)
    pull_list = []
    for file, parts in file_list.items():
        (draw, draw_rev), (spec, spec_rev) = parts
    return pull_list

def get_revs(files):
    # test difference between executor.map and executor.submit and zip(list, executor.map)
    parts = {pn for parts in files.values() for pn, rev in parts if pn}
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(fetch_rev, part) for part in parts]
        return dict([future.result() for future in as_completed(futures)])

def fetch_rev(part_num):
    url = 'http://houston/ErpWeb/PartDetails.aspx?PartNumber={part_num}'
    node = tohtml(req.get(url).content).get_id('revisionNum')
    return part_num, node.text_content() if node else ''

def is_old(rev1, rev2):
    r1 = revint(rev1) if rev1 != 'NC' else 0
    r2 = revint(rev2) if rev2 != 'NC' else 0
    return revint(r2) if r2 != 'NC' else 0 > revint(r1) if r1 != 'NC' else 0

def rev_spec(part_num):
    url = 'http://houston/ErpWeb/Part/PartDocumentReader.aspx'
    params = {'PartNumber': part_num, 'checkInProcess': 1}
    head = {'Cookie': 'DqUserInfo=PartDocumentReader=AMERICAS\\MorganEL'}
    with req.get(url, params=params, headers=head, stream=True) as reply:
        pgs = re.search(r'Type Pages.+?Count (\d+)', str(reply.content))[1]
        return pgs, BytesIO(reply.raw.read())

if __name__ == '__main__':
    main()
