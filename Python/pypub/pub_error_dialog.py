import wx
from mdbutton import Button

class ErrorDialog(wx.Dialog):
    def __init__(self, parent=None, colors=None):
        super().__init__(parent)
        if parent:
            self.BackgroundColour = self.parent.BackgroundColour
            self.ForegroundColour = self.parent.ForegroundColour
        elif colors:
            self.BackgroundColour = self.parent.BackgroundColour
            self.ForegroundColour = self.parent.ForegroundColour
            self.colors = colors
            colors['bg']
            colors['fg']
        self.Font = wx.Font(wx.FontInfo(12).Family(wx.MODERN))
        self.sizer = wx.BoxSizer(wx.VERTICAL)
    
    def setMessage(self, msg):
        style_flags = wx.TE_READONLY|wx.BORDER_NONE
        if '\n' in msg:
            style_flags |= wx.TE_MULTILINE
        text = wx.TextCtrl(self, value=msg, style=style_flags)
#        text_height = (msg.count('\n') + 2) * 18
#        text.MinHeight = text_height
        text.SetCanFocus(False)
        self.sizer.Add(text, 1, wx.EXPAND|wx.ALL, 16)
        text.BackgroundColour = self.BackgroundColour
        self.addClose()
        
    def addClose(self):
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bsizer.AddStretchSpacer()
        button = wx.Button(self, label='Close')
        button.BackgroundColour = self.colors['butbg']
        button.ForegroundColour = self.ForegroundColour
        bsizer.Add(button, 0, wx.ALIGN_RIGHT)
        self.sizer.Add(bsizer, 1, wx.RIGHT|wx.BOTTOM|wx.EXPAND, 16)
    
    def launch(self):
        self.Bind(wx.EVT_BUTTON, lambda e: self.Destroy())
        self.SetSizerAndFit(self.sizer)
        self.CentreOnParent()
        self.ShowModal()
    
    def _setColors(self, win):
        if self.parent:
            bg = self.parent.BackgroundColour
            fg = 
        elif self.colors:
            bg = 
        self.BackgroundColour = colors['bg']
        self.ForegroundColour = colors['fg']
        
