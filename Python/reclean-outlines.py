#!/usr/bin/python
from pathlib import Path
import re

files = list(Path.cwd().glob('text*/*.txt'))
regexps = [
    (re.compile(r'^((?:\d-)?\d{6}.+\n)(?=[^\d\s])', re.M), r'\1\n'),
    (re.compile(r'^.+\n((?:C[FW]S|[CD]R[CJM]?|CSRP|DV|ER|FD[CM]?|GVS|[GH]PU|(?:DT)?(?:AP|[CMS]{2,4}|DR|UW)|LS|PMP|POS|RT|S[CS]J|SING|SSH|SW|UWHTSM?|WOC)\d{4})', re.I|re.M), r'\1'),
    (re.compile(r'^(?:sale|rent|reque|prep|engine|master|stand).*:.+\n', re.I|re.M), ''),
    (re.compile(r'^(?:service man|table of|intro|.+ phase|completion|emergency|temp|abandon|system (?:detail|stack|feat)|stack.?up|scope of|BTC).*\n', re.I|re.M), ''),
    (re.compile(r'(\d{2,4}) [–-] ', re.I), r'\1\t'),
    (re.compile(r' \(((?:\d-)?\d{6}\S*\t[^\t]+)', re.I), r'\n\1'),
    (re.compile(r'\n{3,}', re.I), r'\n\n'),
    (re.compile(r'^(?!.+(?:system|:))[^\d\n]+\n', re.I|re.M), ''),
    (re.compile(r'\s*:\s*'), ': '),
    (re.compile(r'\nappendix[\S\s]*', re.I), r'\n')
]

def main():
    for f in files:
        txt = f.read_text()
        txt = txt.replace('’', '\'')
        txt = txt.replace('”', '"')
        for rx, sub_with in regexps:
            txt = rx.sub(sub_with, txt)
        f.write_text(txt.strip() + '\n')

if __name__ == '__main__':
    main()
