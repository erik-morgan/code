from tkinter import filedialog, StringVar
from tkinter.ttk import Button, Entry, Label, Frame

class PubDir:
    def __init__(self, dir_name):
        self.strvar = StringVar()
        self.name = dir_name
    
    def tkinit(self, parent, label, get_dir_cb):
        self.label = Label(parent, text=label)
        self.entry_frame = Frame(parent)
        self.entry = Entry(self.entry_frame, textvariable=self.strvar, state='readonly')
        self.button = Button(parent, text='Browse')
        self.button['command'] = self._get_dir(get_dir_cb)
    
    def tkstyle(self, widget, col, row):
        # denote required fields with red asterisks, and put legend/note at bottom
        self.label.grid()
        self.entry_frame.grid(column=0, row=row+1, sticky='wes')
        self.entry.grid()
        self.button.grid()
    
    def _get_dir(self, callback):
        # check what happens if user cancels in askdir dialog
        def pick_dir(self):
            dir_path = filedialog.askdirectory()
            if dir_path and dir_path != self.svar():
                self.svar(dir_path)
            callback()
        return pick_dir
    
    def fsave(self):
        return f'{self.name}={self.svar()}\n'
    
    def svar(self, svar_val=None):
        if svar_val:
            self.strvar.set(svar_val)
        else:
            return self.strvar.get()
