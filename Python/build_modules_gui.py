# 2018-09-19 23:57:16 #
from tkinter import BooleanVar, filedialog, StringVar, Tk
from tkinter.ttk import Button, Checkbutton, Entry, Frame, Label, Progressbar, Style, Treeview
from tkinter.font import nametofont
from os import walk, remove
from PyPDF2 import PdfFileReader as Reader, PdfFileMerger as Merger
import re

# determine if there is any utility in making build_modules logic into a class!
# otherwise, just make it simple and working using top level functions

class BuildModulesApp(Tk):
    def __init__(self):
        super().__init__()
        self.resizable(width=True, height=False)
        self.title('Build Modules (by Erik Morgan)')
        self.bind('<Escape>', self.quit)
        self.form = FormFrame(self, self.build_libs)
        self.form.build_form()
        self.form.pack(expand=True, fill='BOTH')
        s = Style()
        s.theme_use('aqua' if 'aqua' in s.theme_names() else 'clam')
    
    def build_modules(self):
        self.dirs = self.form.dirs
        self.rmtocs = self.form.rmtocs.get()
        self.form.destroy()
        self.pb = ProgressFrame(self, self.tocs)
        self.pb.pack(expand=True, fill='BOTH')
    
    def build_libs(self):
        # do for self.dirs[pdfs & dwgs & tocs]
        # changed onrun callback to build_libs since this
        # is only place I'll need paths from self.dirs
        Module.pdflib = pdfs
        Module.dwglib = dwgs
        self.tocs = tocs
        self.build_modules()
    
    def iter_dir(dir_path, cond='*'):
        for path, dirs, files in walk(dir_path):
            path += '/'
            files = [path + f for f in fnfilter(files, '*.[Pp][Dd][Ff]')]
            for f in fnfilter(files, cond):
                yield f
    

class FormFrame(Frame):
    def __init__(self, master, onrun):
        super().__init__(master)
        self.master = master
        self.onrun = onrun
        self.rmtocs = BooleanVar()
        self.fields = {
            'pdfs': 'PDFs:',
            'dwgs': 'Drawings:',
            'tocs': 'TOCs:',
            'dest': 'Destination:'
        }
    
    def build_form(self):
        for r, name in enumerate(self.fields):
            self.add_field(r, name)
        check = Checkbutton(self, variable=self.rmtocs,
                            text='Delete TOC after successful build')
        check.grid(column=0, row=4, columnspan=3, sticky='W', padx=16, pady=16)
        self.cancel = Button(self, text='Cancel', command=self.quit)
        self.cancel.grid(column=0, row=4, columnspan=2, sticky='NES', pady=16)
        self.run = Button(self, text='Run', state='disabled',
                          command=self.onrun)
        self.run.grid(column=2, row=4, sticky='NESW', padx=(8, 16), pady=16)
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
        lbl = Label(self, text=label)
        fld = Entry(self, width=60, state='readonly', textvariable=svar)
        btn = Button(self, text='Browse', command=browse)
        lbl.grid(column=0, row=r, sticky='W', padx=(16, 8), pady=(16, 0))
        field.grid(column=1, row=r, sticky='NESW', pady=(16, 0))
        browse.grid(column=2, row=r, sticky='NESW', padx=(8, 16), pady=(16, 0))
    
    def center(self):
        self.update_idletasks()
        w = self.winfo_reqwidth() / 2
        h = self.winfo_reqheight() / 2
        wscreen, hscreen = self.maxsize()
        self.geometry(f'+{int(wscreen / 2 - w)}+{int(hscreen / 2 - h)}')
    

class ProgressFrame(Frame):
    def __init__(self, master, tocs):
        super().__init__(master)
        self.master = master
        self.tocs = tocs
        self.charw = nametofont('TkDefaultFont').measure('0')
        self.pb = Progressbar(self, maximum=len(tocs))
        self.pb.grid(column=0, row=0, sticky='NESW', padx=16, pady=16)
        self.build_table()
        self.pb.step()
        self.close = Button(self, text='Close', command=self.quit)
        self.close.grid(column=0, row=2, pady=16)
        self.mainloop()
    
    def layout(self):
        # calculate widget sizes using root window geometry
        pass
    
    def build_table(self):
        self.table = Treeview(self, columns=('tocs', 'status'))
        self.table.heading('tocs', text='TOCs')
        self.table.heading('status', text='Status')
        self.table.grid(column=0, row=1, sticky='NESW', padx=16)
        self.row_ids = []
        for toc in self.tocs:
            self.row_ids.append(self.table.insert('', 'end', values=(toc, '')))
    
    def update(self, status):
        row_id = self.row_ids.pop(0)
        self.table.set(row_id, 'status', status)
        self.pb.step()
        if len(self.row_ids) == 0:
            self.close.configure(state='normal')

class Module:
    def __init__(self, toc):
        self.name, self.proc = re.search(r'.+/(([^. ]+).+)\.pdf',
                                         toc, flags=re.I).groups()
        self.elements = [toc, self.get_path(proc)]
    
    def build(self, out_path):
        for draw in self.scrape(toc_path):
            draw = self.get_path(draw)
            if draw not in self.elements:
                self.elements.append(draw)
        if exists(out_path):
            os.remove(out_path)
        pdf = Merger()
        for child in self.children:
            pdf.append(child)
        pdf.write(out_path)
    
    def scrape(self):
        with open(toc, 'rb') as f:
            txt = '\n'.join(pg.extractText() for pg in Reader(f).pages)
        txt = re.sub(r' (?=\d{5})', '', txt.split('Assembly Drawing')[1])
        for draw in drawre.finditer(txt):
            yield draw[0]
    
    def get_path(idnum):
        # check if idnum is in any of the libraries, and returns it if found
    

if __name__ == '__main__':
    app = BuildModulesApp()
    app.mainloop()
