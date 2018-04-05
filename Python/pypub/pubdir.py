from tkinter import StringVar
from pathlib import Path

class PubDir:
    def __init__(self, dir_name):
        self.str_var = StringVar()
        self.dir_name = dir_name
    
    def svar(self, svar_val=None):
        if svar_val:
            self.str_var.set(svar_val)
            setattr(self, 'path', Path(svar_val))
        else:
            return self.str_var.get()
