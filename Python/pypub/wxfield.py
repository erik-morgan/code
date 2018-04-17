import wx

class TextField(wx.Panel):
    
    def __init__(self, parent, val='', name='field', 
                readonly=False, bg=None, fg=None):
        super().__init__(parent, name=name)
        self.parent = parent
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.BackgroundColour = bg | parent.BackgroundColour
        self.ForegroundColour = fg | parent.ForegroundColour
        self.font = parent.Font
        self.build_field(val, readonly)
        self.add_border()
        self.SetSizerAndFit(self.sizer)
        self.value = property(self.get_value, self.set_value)
    
    def build_field(self, val='', ro)
        self.text = wx.TextCtrl(self, value=val)
        self.text.Font = self.font
        if val:
            self.text.MinSize = text_size(val)
        if ro:
            self.text.SetWindowStyleFlag(wx.TE_READONLY)
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
    
    def text_size(self, txt, font=None):
        if not txt:
            return (320, -1)
        if font:
            dc = wx.WindowDC(self)
            attrs = dc.GetFullTextExtent(txt, font=font)
            minw = attrs[0]
        else:
            minw = self.text.CharWidth * len(txt)
        return (round(minw * 1.2), -1)
