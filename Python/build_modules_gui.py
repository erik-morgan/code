# 2018-09-28 00:56:49 #
from tkinter import BooleanVar, filedialog, IntVar, StringVar, Tk
from tkinter.ttk import Button, Checkbutton, Entry, Frame, Label, Progressbar, Style, Treeview
from os import walk, remove, sep
from PyPDF2 import PdfFileReader as Reader, PdfFileMerger as Merger
from fnmatch import filter as fnfilter
from io import BytesIO
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
        self.dirs = self.form.dirs
        self.rmtocs = self.form.rmtocs.get()
        self.form.destroy()
        self.build_libs()
        self.prog = ProgressFrame(self, self.tocs)
        self.prog.pack(expand=True, fill='both')
    
    def build_libs(self):
        # SET LIBS TO CLASS ATTRIBUTE OF MODULE CLASS
        rx = re.compile(r'^[-A-Z0-9/]+', re.I)
        self.tocs = {}
        for path, fname in self.iter_dir('tocs', pat='*TOC.pdf'):
            self.tocs[fname[:-5]] = f'{path}{sep}{fname}'
        self.lib = {}
        for path, fname in self.iter_dir('pdfs', 'dwgs', pat='*.pdf'):
            fmatch = rx.match(fname)
            if fmatch:
                self.lib[fmatch.group()] = f'{path}{sep}{fname}'
    
    def iter_dir(self, *args, pat='*'):
        dirs = [self.dirs(a) for a in args]
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
        self.pb.pack(expand=True, fill='x', pady=(0, 16))
        self.pbval = property(pbval.get, pbval.set)
        self.build_table()
        self.close = Button(self, text='Close', command=self.master.destroy)
        self.close.grid(column=0, row=2, pady=16)
        self.layout()
    
    def layout(self):
        self['width'] = self.master.winfo_reqwidth()
        self['height'] = self.master.winfo_reqheight()
        # charw = nametofont('TkDefaultFont').measure('0')
        # ACTUALLY, DO THIS:
        # TRY USING TWO LISTBOXES, SIDE-BY-SIDE, INSIDE OF A FRAME
        # TREEVIEW IS TOO HARD TO CONFIGURE, SIZE-WISE
    
    def build_table(self):
        self.table = Treeview(self, height=len(self.tocs),
                              selectmode='none', show='headings')
        self.table.column('tocs', )
        self.table.heading('tocs', text='TOCs')
        self.table.column('status', )
        self.table.heading('status', text='Status')
        self.table.pack(expand=True, fill='both')
        for toc in self.tocs:
            self.table.insert('', 'end', toc, values=(toc, ''))
    
    def update(self, status, iid):
        self.table.set(iid, 'status', status)
        self.pbval += 1
        if self.pbval == self.pb.maximum:
            self.close.configure(state='normal')

class Module:
    def __init__(self, toc):
        self.path = toc
        self.dqid = re.match(r'^[^. ]+', toc.rpartition(sep)[2]).group()
        self.docs = [self.dqid]
    
    def scrape(self):
        with open(self.path, 'rb') as f:
            txt = '\n'.join(pg.extractText() for pg in Reader(f).pages)
        txt = re.sub(r' (?=\d{5})', '', txt.split('Assembly Drawing')[1])
        for draw in drawre.finditer(txt):
            if draw not in self.docs:
                self.docs.append(draw[0])
    
    def build(self, out_path):
        # return True/False, so if False, controller knows to ask for missing files
        if exists(out_path):
            os.remove(out_path)
        pdf = Merger()
        for child in self.docs:
            pdf.append(child)
        pdf.write(out_path)
    

class PDFParser:
    def __init__(self, path):
        self.pdf = Reader(path)
        self.pages = self.pdf.pages
    
    def get_text(self):
        for page in self.pages:
            datab = page.getContents().getData()
            self.parse(datab)
        return self.text
    
    def parse(self, bites):
        # ActualText<FEFF0009>>> is a tab!
        # review intext optimization options & next_literal functionality
        # while using BytesIO, can nest while loops like w/ hex str portion
        # RESUME
        
        def is_operator(stream, *args):
            for op in args:
                if stream.read(len(op) + 2).strip(whitespace) == op:
                    return True
                else:
                    stream.seek(-len(op) - 2, 1)
            return False
        
        append_text = self.text.append
        whitespace = b' \t\n\r\x0b\f'
        intext = False
        next_literal = False
        depth = 0
        stream = BytesIO(bites)
        while True:
            char = stream.read(1)
            if not char:
                break
            if intext:
                if not depth:
                    if is_operator(stream, b'TD', b'Td', b'T*', b'\'', b'"'):
                        append_text(b'\n')
                    elif char == b'<':
                        charh = stream.read(1)
                        hex_chars = b''
                        while charh not in b'<>':
                            hex_chars += charh
                            charh = stream.read(1)
                        if len(hex_chars) % 2 != 0:
                            hex_chars += b'0'
                        for h1, h2 in zip(hex_chars[0::2], hex_chars[1::2]):
                            charh = int(h1 + h2, 16)
                            if charh < 127:
                                append_text(chr(charh))
                        continue
                    elif is_operator(stream, b'TJ', b'Tj'):
                        append_text(b' ')
                if not depth and is_operator(stream, b'ET'):
                    intext = False
                    append_text(b'\n')
                elif char == b'(' and not depth and not next_literal:
                    depth += 1
                elif char == b')' and depth == 1 and not next_literal:
                    depth = 0
                elif depth:
                    if char == b'\\' and not next_literal:
                        next_literal = True
                    else:
                        if char.isascii():
                            append_text(char)
                        next_literal = False
            if not intext and is_operator(stream, b'BT'):
                intext = True
    

if __name__ == '__main__':
    app = BuildModulesApp()
    app.launch_form()
    app.mainloop()
