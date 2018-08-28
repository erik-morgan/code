# 2018-08-28 00:07:18 #
from pathlib import Path
from logging import basicConfig, info, error
from string import ascii_uppercase as letters
import requests as req
from lxml.html import fromstring as tohtml, get_element_by_id as by_id
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
revals = dict(rev_map())
get_name = '{0}.{1}.{2}.pdf'.format

def main():
    pyrev.mkdir(parents=True, exist_ok=True)
    basicConfig(filename = pyrev / 'log.txt',
                format = '[%(asctime)s] %(levelname)s:%(message)s',
                datefmt = '%Y-%m-%dT%H:%M:%S',
                level = logging.INFO)
    pull = pyrev / 'pull.txt'
    files = get_files(root / 'Library')
    pull_list = check_revs(files)
    if pull_list:
        rev_pulls(pull_list)
        pull.write_text('\n'.join(pull_list))

def get_files(lib_dir):
    files = {}
    for f in lib_dir.glob('*.*.*.???'):
        part, draw_rev, spec_rev = f.name.split('.')[0:-1]
        if draw_rev == '-':
            files[f] = (None, (part, revals[spec_rev]))
        elif spec_rev == '-':
            files[f] = ((part, revals[draw_rev]), None)
        else:
            files[f] = ((part.rsplit('-', 1)[0], revals[draw_rev]),
                        (part, revals[spec_rev]))
    return files

def check_revs(file_list):
    ############################################################################
    # num pages in raw text like: /Type/Pages ... \n/Kids.+ ... \n/Count #
    # due to revals, now both sets of data hold ints instead of revs
    # trying to figure out how to forego putting None into part tuples...make alternate file for that
    #     will probably involve slicing the revs out in that check_revs (eg file.name.split('.')[1:2])
    revs = get_revs(file_list)
    pull_list = {}
    for file, (draw, spec) in file_list.items():
        parts = (draw[0] if draw and draw[1] < revs[draw[1]] else None,
                 spec[0] if spec and spec[1] < revs[spec[1]] else None)
        if any(parts):
            pull_list[file] = parts
    return pull_list

def get_revs(files):
    # test difference between executor.map and executor.submit and zip(list, executor.map)
    parts = {part for parts in files.values() for part in parts if part}
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(fetch_rev, part) for part in parts]
        return dict([future.result() for future in as_completed(futures)])

def fetch_rev(part_num):
    url = 'http://houston/ErpWeb/PartDetails.aspx?PartNumber={part_num}'
    node = tohtml(req.get(url).content).by_id('revisionNum')
    if node:
        return part_num, revals[node.text_content()]

def rev_pulls(pulls):
    # left off here; problem is now determining best way to pass data to rev_pulls in
    # order to correctly handle which part of a drawing file to replace, whether it is draw/spec,
    # and what is needed for making swap;
    # 
    # TODO: tomorrow, write out the rev_pulls function first to determine
    #       which args it should expect, and how it handles single-file drawings
    # 
    pass

def rev_spec(part_num):
    url = 'http://houston/ErpWeb/Part/PartDocumentReader.aspx'
    params = {'PartNumber': part_num, 'checkInProcess': 1}
    head = {'Cookie': 'DqUserInfo=PartDocumentReader=AMERICAS\\MorganEL'}
    with req.get(url, params=params, headers=head, stream=True) as reply:
        pgs = re.search(r'Type Pages.+?Count (\d+)', str(reply.content))[1]
        return pgs, BytesIO(reply.raw.read())

def rev_map():
    yield 'NC', 0
    for c, n in zip(letters, range(1, 27)):
        yield c, n
        for prec, pren in zip('ABC', range(1, 4)):
            yield prec + c, 26 * pren + n

if __name__ == '__main__':
    main()
