from tkinter import filedialog, StringVar
from tkinter.ttk import Button, Entry, Label

class PubDir:
    def __init__(self, dir_name):
        self.strvar = StringVar()
        self.name = dir_name
    
    def tkinit(self, parent, label, get_dir_cb):
        self.label = Label(parent, text=label_text)
        self.entry = Entry(parent, textvariable=self.strvar, state='readonly')
        self.button = Button(parent, text='Browse')
        self.button['command'] = self._get_dir(get_dir_cb)
    
    def tkstyle(self, widget, col, row):
        pass
    
    def _get_dir(callback):
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
