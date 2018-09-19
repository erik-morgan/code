# 2018-09-18 23:50:40 #
from tkinter import filedialog, StringVar, Tk, Toplevel
from tkinter.ttk import Button, Entry, Label, Progressbar, Style, Treeview

# determine if there is any utility in making build_modules logic into a class!
# otherwise, just make it simple and working using top level functions

class ProgressUI(Toplevel):
    def __init__(self, tocs):
        super().__init__()
        self.tocs = tocs
        self.pb = Progressbar(self, maximum=len(tocs))
        self.pb.grid(column=0, row=0, sticky='NESW', padx=16, pady=16)
        self.build_table()
        self.pb.step()
        self.close = Button(self, text='Close', command=self.quit)
        self.close.grid(column=0, row=2, pady=16)
    
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

class DirPicker():
    def __init__(self, win, text, onbrowse=None):
        self.svar = StringVar()
        self.win = win
        self.callback = onbrowse
        r = win.grid_size()[1]
        label = Label(win, text=text)
        label.grid(column=0, row=r, sticky='W', padx=(16, 8), pady=(16, 0))
        entry = Entry(win, width=60, textvariable=self.svar, state='readonly')
        entry.grid(column=1, row=r, sticky='NESW', pady=(16, 0))
        browse = Button(win, text='Browse', command=self.pick_dir)
        browse.grid(column=2, row=r, sticky='NESW', padx=(8, 16), pady=(16, 0))
    
    def pick_dir(self):
        path = filedialog.askdirectory(initialdir='.', mustexist=True)
        if path:
            self.svar.set(path)
        if self.callback:
            self.callback()
    
    def read(self):
        return self.svar.get()

class FormUI:
    def __init__(self):
        self.win = Tk()
        self.dirs = {
            'pdfs': DirPicker(self.win, 'PDFs:', self.status_check),
            'dwgs': DirPicker(self.win, 'Drawings:', self.status_check),
            'tocs': DirPicker(self.win, 'TOCs:', self.status_check),
            'dest': DirPicker(self.win, 'Destination:', self.status_check)
        }
        self.cancel = Button(self.win, text='Cancel', command=self.win.quit)
        self.cancel.grid(column=0, row=4, columnspan=2, sticky='NES', pady=16)
        self.run = Button(self.win, text='Run', state='disabled',
                          command=self.build)
        self.run.grid(column=2, row=4, sticky='NESW', padx=(8, 16), pady=16)
    
    def status_check(self):
        run_state = self.run.cget('state') == 'normal'
        if all([d.read() for d in self.dirs.values()]) != run_state:
            self.run['state'] = 'disabled' if run_state else 'normal'
    
    def init_app(self):
        s = Style()
        s.theme_use('aqua' if 'aqua' in s.theme_names() else 'clam')
        self.win.resizable(width=True, height=False)
        self.win.columnconfigure(1, weight=1)
        self.win.title('Build Modules (by Erik Morgan)')
        self.win.bind('<Escape>', self.win.quit)
        self.center()
        self.win.mainloop()
    
    def center(self):
        self.win.update_idletasks()
        w = self.win.winfo_reqwidth() / 2
        h = self.win.winfo_reqheight() / 2
        wscreen, hscreen = self.win.maxsize()
        self.win.geometry(f'+{int(wscreen / 2 - w)}+{int(hscreen / 2 - h)}')
    
    def build(self):
        self.win.destroy()
        # business logic

class BuildModulesApp:
    def __init__(self):

if __name__ == '__main__':
    app = BuildModulesApp()
    app.init_app()
