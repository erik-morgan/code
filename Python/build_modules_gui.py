# 2018-10-02 23:34:08 #
from tkinter import BooleanVar, filedialog, IntVar, StringVar, Tk
from tkinter.ttk import Button, Checkbutton, Entry, Frame, Label, Progressbar, Scrollbar, Style, Treeview
from tkinter.font import nametofont
from os import exists, remove, sep, walk
from PyPDF2 import PdfFileReader as Reader, PdfFileMerger as Merger
from fnmatch import filter as fnfilter
import string
import re

class BuildModulesApp(Tk):
    def __init__(self):
        super().__init__()
        self.resizable(width=True, height=False)
        self.title('Build Modules (by Erik Morgan)')
    
    def launch_form(self):
        s = Style()
        s.theme_use('aqua' if 'aqua' in s.theme_names() else 'clam')
        self.form = FormFrame(self, self.build_modules)
        self.form.build_form()
        self.form.pack(expand=True, fill='both')
    
    def build_modules(self):
        self.build_libs()
        self.form.destroy()
        self.prog = ProgressFrame(self, self.tocs)
        self.prog.pack(expand=True, fill='both')
        builder = ModuleBuilder()
        builder.dest = self.dirs['dest'] + sep
        for toc, toc_path in self.tocs.items():
            missing = []
            build_paths = builder.scrape(toc, toc_path)
            if build_paths:
                for n, name in enumerate(build_paths):
                    build_paths[n] = self.lib.get(name)
                    if name not in self.lib:
                        missing.append(name)
                if all(build_paths):
                    builder.build(build_paths)
                    status = 'Build Complete!'
                else:
                    status = 'Missing: ' + ', '.join(missing)
            else:
                status = 'Error reading TOC'
            self.prog.update(toc, status)
    
    def build_libs(self):
        # SET LIBS TO CLASS ATTRIBUTE OF MODULE CLASS
        self.dirs = self.form.dirs
        self.rmtocs = self.form.rmtocs.get()
        self.tocs = {}
        for path, fname in self.iter_dir('tocs', pat='*TOC.pdf'):
            self.tocs[fname[:-5]] = f'{path}{sep}{fname}'
        self.lib = {}
        for path, fname in self.iter_dir('pdfs', 'dwgs', pat='*.pdf'):
            fmatch = re.match(r'^[-A-Z0-9/]+', fname, flags=re.I)
            if fmatch:
                self.lib[fmatch[0].replace('/', '-')] = f'{path}{sep}{fname}'
    
    def iter_dir(self, *args, pat='*'):
        dirs = [self.dirs[a] for a in args]
        steps = (step for d in dirs for step in walk(d))
        for path, folds, files in steps:
            files = fnfilter(files, '[!.]*')
            folds[:] = [fold for fold in folds if not fold.startswith('.')]
            yield from ((path, f) for f in fnfilter(files, pat))
    

class FormFrame(Frame):
    def __init__(self, master, onrun):
        super().__init__(master, padding=16)
        self.master = master
        self.bind('<Escape>', self.master.quit)
        self.onrun = onrun
        self.rmtocs = BooleanVar()
        self.fields = {
            'pdfs': 'PDFs Location:',
            'dwgs': 'Drawings Location:',
            'tocs': 'Project TOCs:',
            'dest': 'Destination:'
        }
    
    def build_form(self):
        for r, name in enumerate(self.fields):
            self.add_field(r, name)
        check = Checkbutton(self, variable=self.rmtocs, text='Delete used TOCs')
        check.grid(column=0, row=4, columnspan=3, sticky='w', pady=(0, 16))
        cancel = Button(self, text='Cancel', command=self.master.quit)
        cancel.grid(column=1, row=4, columnspan=2, sticky='nes')
        self.run = Button(self, text='Run', state='disabled', command=self.onrun)
        self.run.grid(column=2, row=4, sticky='nesw', padx=(8, 0))
        self.columnconfigure(1, weight=1)
        self.center()
    
    def add_field(self, r, name):
        def browse():
            path = filedialog.askdirectory(initialdir='.', mustexist=True)
            if path:
                svar.set(path)
                self.fields[name] = path
            if all(self.fields.values()):
                self.run.configure(state='normal')
        svar = StringVar()
        lbl = Label(self, text=self.fields[name])
        fld = Entry(self, width=60, state='readonly', textvariable=svar)
        btn = Button(self, text='Browse', command=browse)
        lbl.grid(column=0, row=r, sticky='w', pady=(0, 16))
        fld.grid(column=1, row=r, sticky='nesw', padx=8, pady=(0, 16))
        btn.grid(column=2, row=r, sticky='nesw', pady=(0, 16))
    
    def center(self):
        self.update_idletasks()
        w = self.winfo_reqwidth() / 2
        h = self.winfo_reqheight() / 2
        wscreen, hscreen = self.maxsize()
        self.geometry(f'+{int(wscreen / 2 - w)}+{int(hscreen / 2 - h)}')
    

class ProgressFrame(Frame):
    def __init__(self, master, tocs):
        super().__init__(master, padding=16)
        self.master = master
        self.tocs = tocs
        pbval = IntVar()
        self.pb = Progressbar(self, maximum=len(tocs), variable=pbval)
        self.pb.grid(column=0, row=0, columnspan=2, pady=(0, 16), sticky='nesw')
        self.pbval = property(pbval.get, pbval.set)
        self.build_table()
        self.close = Button(self, text='Close', command=self.master.destroy)
        self.close.grid(column=0, row=3, columnspan=2, pady=16)
    
    def build_table(self):
        charw = nametofont('TkDefaultFont').measure('0')
        minw = len(max(self.tocs, key=len)) * charw + 16
        xsb = Scrollbar(self, orient='vertical', command=self.tree.xview)
        ysb = Scrollbar(self, orient='horizontal', command=self.tree.yview)
        self.table = Treeview(self, height=len(self.tocs), selectmode='none',
                              show='headings', columns=('tocs', 'status'),
                              xscrollcommand=xsb.set, yscrollcommand=ysb.set)
        self.table.column('tocs', minwidth=minw, stretch=False)
        self.table.heading('tocs', text='TOCs')
        self.table.column('status', minwidth=minw)
        self.table.heading('status', text='Status')
        for toc in self.tocs:
            self.table.insert('', 'end', toc, values=(toc, ''))
        self.table.grid(column=0, row=1, sticky='nesw')
        xsb.grid(column=0, row=2, columnspan=2, sticky='ew')
        ysb.grid(column=1, row=1, sticky='ns')
    
    def update(self, iid, status):
        self.table.set(iid, 'status', status)
        self.pbval += 1
        if self.pbval == self.pb.maximum:
            self.close.configure(state='normal')

class ModuleBuilder:
    def __init__(self):
        self.parser = PDFParser()
        self.draws = re.compile(r'^(?:\d-)?(?:[A-Z]{1,2}[- ]?)?\d{4,}[-\w]*(?=\s)', re.I|re.M)
    
    def scrape(self, name, path):
        self.name = name
        docs = [re.match(r'^[^. ]+', name)[0]]
        try:
            txt = self.parser.get_text(path).upper()
        except:
            # what if it is a non-searchable pdf?
            return []
        if 'ILLUSTRATION' in txt:
            txt = txt.split('ILLUSTRATION')[1]
        elif 'ASSEMBLY DRAWING' in txt:
            txt = txt.split('ASSEMBLY DRAWING')[1]
        docs.extend(self.draws.findall(txt))
        return docs
    
    def build(self, files):
        out_path = self.dest + self.name
        num = 1
        ext = '.pdf'
        while exists(f'{out_path}{ext}')
            num += 1
            ext = f'.{num}.pdf'
        out_path += ext
        pdf = Merger()
        for f in files:
            pdf.append(child)
        pdf.write(out_path)
    

class PDFParser:
    escapes = {'n': '\n', 'r': '\r', 't': '\t'}
    hexes = {}
    printable = set(string.printable)
    hexdigits = set(string.hexdigits)
    
    def get_text(self, pdf):
        self.pos = 0
        pages = Reader(pdf).pages
        text = '\n'.join(''.join(self.parse(page)) for page in pages)
        text = re.sub(r'\\(\d{1,3})', self.fromoct, text)
        text = re.sub(r'\s*\n\s*', '\n', text)
        text = re.sub(r'(?<=\S)-\s+', '', text)
        text = re.sub(r' {2,}', ' ', text)
        return text
    
    def parse(self, page):
        data = page.getContents().getData().decode()
        tokens = re.compile(r'\(|(?<!<)<(?!<)|([\d.]+)?\s(Td|TD|Tm|T\*\'|")\b')
        tm = '0'
        token = tokens.search(data)
        while token:
            tok = token[0]
            self.pos = token.end()
            if tok[0].isdigit():
                if token[2] == 'Tm' and token[1] != tm:
                    tm = token[1]
                    yield '\n'
                elif token[2] in 'TdTD' and token[1] != '0':
                    yield '\n'
            elif tok == '(':
                yield from self.parse_str(data)
            elif tok == '<':
                yield from self.parse_hex(data)
            else:
                yield '\n'
            token = tokens.search(data, self.pos)
    
    def parse_str(self, data):
        token_sum = 0
        while True:
            char = data[self.pos]
            if char in '()':
                if char == ')' and token_sum == 0:
                    break
                else:
                    token_sum += 1 if char == '(' else -1
            if char == '\\':
                self.pos += 1
                char = data[self.pos]
                if char in '\n\r' and data[self.pos + 1] in '\n\r':
                    self.pos += 1
                elif char.isdigit():
                    char = '\\' + char
                else:
                    char = self.escapes.get(char, char)
            self.pos += 1
            yield char
    
    def parse_hex(self, data):
        remainder = {0: '', 1: '0'}
        hchars = data[self.pos:data.find('>', self.pos)]
        self.pos += len(hchars)
        if hchars not in self.hexes and set(hchars) < self.hexdigits:
            hexstr = hchars + remainder[len(hchars) % 2]
            code = 'utf-16' if hexstr.startswith('FEFF') else 'utf-8'
            hexstr = bytes.fromhex(hexstr).decode(code)
            if set(hexstr) < self.printable:
                self.hexes[hchars] = hexstr
        yield self.hexes.get(hchars, '')
    
    @staticmethod
    def fromoct(match):
        c = chr(int(match[1], 8))
        return c if c in string.printable else ' '

if __name__ == '__main__':
    app = BuildModulesApp()
    app.launch_form()
    app.mainloop()
