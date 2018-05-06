import wx

class TextField(wx.Panel):
    
    def __init__(self, parent, val='', name='field'):
        super().__init__(parent, name=name)
        self.parent = parent
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.BackgroundColour = parent.BackgroundColour
        self.ForegroundColour = parent.ForegroundColour
        self.Font = parent.Font
        self.addField(val, readonly)
        self.addBorder()
        self.SetSizerAndFit(self.sizer)
        self.value = property(self.get_value, self.set_value)
    
    def addField(self, val='')
        self.text = wx.TextCtrl(self, value=val, style=wx.TE_READONLY)
        self.text.Font = self.Font
        self.text.MinSize = text_size(val)
        self.text.BackgroundColour = self.BackgroundColour
        self.text.ForegroundColour = self.ForegroundColour
        self.sizer.Add(self.text, 0, wx.EXPAND)
    
    def add_border(self):
        self.border = wx.Panel(self, size=(-1, 1))
        self.border.BackgroundColour = self.ForegroundColour
        self.sizer.Add(self.border, 0, wx.EXPAND)
    
    def set_value(self, value):
        self.text.Value = value
    
    def get_value(self):
        return self.text.Value
    
    def text_size(self, text):
        if not text:
            return (320, -1)
        w, h, d, e = self.GetFullTextExtent(txt, self.Font)
        return (round(w * 1.2), h)
