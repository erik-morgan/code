#!/usr/bin/python
from pathlib import Path
from zipfile import ZipFile
from lxml import etree
import re

root = Path('/Users/HD6904/Erik/Procedure Status/docx')
dest = Path('/Users/HD6904/Erik/Procedure Status/text')
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
xstyles = etree.XPath('//w:style[.//w:strike]/@w:styleId', namespaces=ns)
xstyle = etree.XPath('//*[@* = $style]')
xstrike = etree.XPath('.//*[local-name() = "strike"]')
fromstr = etree.fromstring
procre = (r'\b(C[FW]S|[CD]R[CJM]?|CSRP|DV|ER|FD[CM]?|GVS|[GH]PU|'
          r'(?:DT)?(?:AP|[CMS]{2,4}|DR|UW)|LS|PMP|POS|RT|S[CS]J|SING|SSH|SW|'
          r'UWHTSM?|WOC) ?(\d{3,4})')

def main():
    for f in root.iterdir():
        if f.name.startswith('.') or not f.suffix == '.docx':
            continue
        with ZipFile(f) as zip:
            doc = fromstr(zip.open('word/document.xml').read())
            styles = xstyles(fromstr(zip.open('word/styles.xml').read()))
        destrike(doc, styles)
        text = '\n'.join(list(get_text(doc)))
        text = re.sub(r'r(ev ?)?\d{1,2}\b|based on .*', '', text, flags=re.I)
        text = re.sub(r'aber.?proc ?', 'AP', text, flags=re.I)
        text = re.sub(procre, r'\1\2', text, flags=re.I)
        text = re.sub(r'(cc0104\S*) (?=[mq]t)', r'\1', text, flags=re.I)
        (dest / (f.stem + '.txt')).write_text(text)

def destrike(doc, styles):
    for style in styles:
        for node in xstyle(doc, style=style):
            node.getparent().remove(node)
    for p in doc.iter('{*}p'):
        for r in p.iter('{*}r'):
            if xstrike(r):
                p.remove(r)
        if xstrike(p):
            p.getparent().remove(p)
    return doc

def get_text(doc):
    for p in doc.iter('{*}p'):
        ptext = ''
        for node in p.iter('{*}t', '{*}tab', '{*}br'):
            tag = node.tag.split('}')[1]
            if tag == 't':
                ptext += node.text
            else:
                ptext = ptext.strip() + ('\t' if tag == 'tab' else ' ')
        yield ptext.strip()

if __name__ == '__main__':
    main()
