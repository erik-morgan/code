from wx.lib.buttons import GenButton
from wx import NullColour

class MDButton(GenButton):
    
    def __init__(self, parent, label, name='mdbutton'):
        super().__init__(parent, label=label, name=name)
        self.bg = self.BackgroundColour
        self.fg = parent.ForegroundColour
        self.Font = parent.Font
        self.SetBezelWidth(0)
    
    def enable(self, stateBool=True):
        self.Enabled = stateBool
        self.refresh()
    
    def refresh(self):
        if self.Enabled:
            self.BackgroundColour = self.bg
            self.ForegroundColour = self.fg
        else:
            self.BackgroundColour = NullColour
            self.ForegroundColour = NullColour
    
    def setColors(self, bgcolor=None, fgcolor=None):
        self.bg = bgcolor if bgcolor else self.bg
        self.fg = fgcolor if fgcolor else self.fg
        self.refresh()
