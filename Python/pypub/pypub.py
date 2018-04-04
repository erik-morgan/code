import re
from pypub_config import PubDirs
from zipfile import ZipFile
from lxml import etree

# TODO: ADD TITLES TO RUNNING PROCEDURE LIBRARY AS METADATA
#dirs = PubDirs()
join = ''.join
xns = {
    'vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

def initPub():
    global w
    w.title('pypub')
    w.geometry(f'{w.winfo_screenwidth() / 3}x{w.winfo_screenheight() / 3}')
    f_w = Frame(w, padding='6')
    f_w.grid(column=0, row=0, sticky='nesw')
    f_w.columnconfigure(0, weight=1)
    f_w.rowconfigure(0, weight=1)
    # button.configure(text='goodbye') to change multiple options
    indd_path = StringVar()
    indd_label = Label(f_w, text='InDesign Folder:')
    indd_label.grid(column=0, row=0, sticky='w', padx=9)
    indd_entry = Entry(f_w, textvariable=indd_path, state='readonly')
    indd_entry.grid(column=1, row=0, sticky='ew')
    indd_button = Button(f_w, text="Browse", command=pick_dir)
    indd_button.grid(column=2, row=0, sticky='we')
    # pdfs_label = 
    # draw_label = 
    # proj_label = 
    # for child in mainframe.winfo_children(): child.grid_configure(padx=5, pady=5)
    # feet_entry.focus()
    # root.bind('<Return>', calculate)
    w.mainloop()

def main():
    # Remove .outline.json after finished
    # Stop putting pull lists into outline folder
    # First check for existence of all drawings (minus stack-ups)
    # use outline metadata for proj details
    # urldecode special characters. see if lxml does it, or do global f/r
    # Use INDD RPs with TOCs in front instead of separate files
    # Ignore advisory, and stick it in to INDD
    # if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
    # TODO: add ability to change vars
    # TODO: refactor dirs or add os check b/c dirs are now PosixPath objects; switch back to string paths?
    # TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
    # TODO: add handling of bluesheets
    # TODO: add handling of third party documents for appendix
    # TODO: 
    dirs.getProject()
    if dirs.pub.exists():
        redo = ""
        while not redo or not re.match(r'^[YyNn]', redo):
            redo = input('Recover project? (no if outline has changed): ')
        if redo[0] == 'n' or redo[0] == 'N':
            pub = etree.fromstring(dirs.pub.read_bytes())
        else:
            pub = None
    if not pub:
        with ZipFile(dirs.docx) as zip:
            xdoc = zip.open('word/document.xml').read()
        pub = parseOutline(xdoc)
        dirs.pub.write_bytes(etree.tostring(pub))
    if not fileCheck(pub):
        return
    buildPub(pub)

def parseOutline(xdoc):
    doc = etree.fromstring(re.sub(r'<w:(tab|br)/>', '<w:t>\t</w:t>', xdoc))[0]
    for node in doc.xpath('//w:p[./w:pPr//w:strike]', namespaces=xns):
        doc.remove(node)
    ptext = [join(t for t in p.itertext()) for p in doc]
    resplit = re.compile('\t+')
    props = {}
    props['sys'] = resplit.split(ptext[0])[0]
    m = re.match(r'Customer: ([^\t]+?)( \()?((?<= \()[^()\t]+)?(\))?', ptext[1])
    props['cust'], props['proj'] = m.groups(1, 2)
    props['rig'] = ptext[2].split(': ')[-1]
    m = re.match(r'Service Manual: (\d{4})(?: Volume )?(\S+)?(?: Rev )?(\d+)?', ptext[3])
    props['num'], props['vol'], props['rev'] = m.groups(1, 3)
    draft = props['draft'] = 'draft' in ptext[3].lower()
    xpub = etree.Element('project', props)
    sections = doc.xpath('//w:p[not(./w:pPr//w:strike) and .//w:u and .//w:b and position() > 2]', namespaces=xns)
    drawTest = re.compile(r'\d{5}|^\d-', re.I)
    procTest = re.compile(r'[A-Z]{2,6}\d{4}')
    bs = re.compile('bluesheet', re.I)
    for sectIndex, sect in enumerate(sections):
        docIndex = doc.index(sect)
        pdata = ptext[docIndex]
        if not ptext[docIndex + 1]:
            phase = re.sub(r' PHASE| PROCEDURES?|[\t].*)', '', pdata)
            phase = etree.SubElement(xpub, 'phase', name=phase)
        else:
            unit = etree.SubElement(phase, 'unit')
            if pdata.beginswith('STACK-UP'):
                unit.set('title', 'Stack-Up and Sequence Drawings')
            elif pdata.beginswith('CONDUCTOR'):
                unit.set('title', 'Conductor')
            elif 'TEST OPTION' in pdata:
                unit.set('title', 'BOP Test Options')
        nextIndex = doc.index(sections[sectIndex + 1])
        for pdata in ptext[docIndex + 1:nextIndex]:
            if not pdata:
                continue
            p = resplit.split(pdata)
            if drawTest.search(p[0]):
                draw = etree.SubElement(unit, 'drawing', id=p[0].replace(' ', ''))
                draw.text = p[1]
                if draft and bs.match(pdata):
                    draw.set('bs', 'true')
            elif procTest.match(p[0]):
                # standardize RP naming convention (regarding CC0104-MT vs CC0104-QTM-CR vs CC0104-01MT)
                proc = etree.SubElement(unit, 'procedure', id=p[0].replace('/', '-'))
                if draft and bs.match(pdata):
                    proc.set('bs', 'true')
            elif p[0].beginswith('Rev'):
                proc.set('rev', p[0][-2:])
            elif 'ADVISORY' in pdata:
                proc.set('advisory', "True")
            elif 'BTC' in pdata:
                btc = join(p[0].split()[0:2]
                proc = etree.SubElement(unit, 'procedure', id=btc)
    return xpub

def fileCheck(xpub):
    # TODO: introductions and pdf cover locations
    # TODO: add intros and back cover to PDF location
    procs = set((p.get('id'), p.get('rev')) for p in xpub.xpath('//procedure[not(@bs)]'))
    draws = set(xpub.xpath('//drawing[not(@bs)]/@id'))
    procLib = [i.stem for i in dirs.indd.glob('*.indd')]
    drawLib = [d.name.split('.')[0] for d in dirs.draw.glob('*.pdf')]
    fails = []
    app = fails.append
    for proc, rev in procs
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
    
if __name__ == '__main__':
    main()
