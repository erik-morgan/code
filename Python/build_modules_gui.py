# 2018-09-18 00:15:34 #
from tkinter import filedialog, StringVar, Tk
from tkinter.ttk import Button, Entry, Label

# determine if there is any utility in making build_modules logic into a class!
# otherwise, just make it simple and working using top level functions

class BuildModulesApp:
    def __init__(self):
        self.win = Tk()
        self.svars = {
            'pdfs': self.add_row(0, 'PDFs:'),
            'dwgs': self.add_row(1, 'Drawings:'),
            'tocs': self.add_row(2, 'TOCs:'),
            'dest': self.add_row(3, 'Destination:')
        }
        self.cancel = Button(self.win, text='Cancel', command=self.exit)
        self.cancel.grid(column=0, row=4, columnspan=2, sticky='NES')
        self.run = Button(self.win, text='Run', state='disabled', command=self.build)
        self.run.grid(column=2, row=4, sticky='NESW')
    
    def add_row(self, row_num, text):
        def pick_dir():
            path = filedialog.askdirectory(parent=self.win, mustexist=True)
            if path:
                svar.set(path)
            self.status_check()
        
        svar = StringVar()
        label = Label(self.win, text=text)
        label.grid(column=0, row=row_num, sticky='W')
        entry = Entry(self.win, width=60, textvariable=svar, state='readonly')
        entry.grid(column=1, row=row_num, sticky='NESW')
        browse = Button(self.win, text='Browse', command=pick_dir)
        browse.grid(column=2, row=row, sticky='NESW')
        self.win.rowconfigure(row_num, pad=(16, 0))
        return svar
    
    def status_check():
        run_state = self.run.cget('state') == 'normal'
        if all([svar.get() for svar in self.svars]) != run_state:
            self.run['state'] = 'disabled' if run_state else 'normal'
    
    def init_app(self):
        self.win.resizable(width=True, height=False)
        self.win.rowconfigure(4, pad=16)
        self.win.columnconfigure(0, pad=(16, 8))
        self.win.columnconfigure(1, weight=1, pad=8)
        self.win.columnconfigure(2, pad=(8, 16))
        self.win.title('Build Modules (by Erik Morgan)')
        self.win.bind('<Escape>', self.exit)
        self.win.mainloop()
    
    def exit(self):
        self.win.quit()
    
    def build(self):
        # business logic
        pass

if __name__ == '__main__':
    app = BuildModulesApp()
    app.init_app()
