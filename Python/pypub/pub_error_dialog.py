import wx
from mdbutton import MDButton

class ErrorDialog(wx.Dialog):
    def __init__(self, parent):
        super().__init__(parent)
        if parent:
            self.BackgroundColour = parent.BackgroundColour
            self.ForegroundColour = parent.ForegroundColour
        self.Font = wx.Font(wx.FontInfo(12).Family(wx.MODERN))
        self.sizer = wx.BoxSizer(wx.VERTICAL)
    
    def setMessage(self, msg):
        style_flags = wx.TE_READONLY|wx.BORDER_NONE
        if '\n' in msg:
            style_flags |= wx.TE_MULTILINE
        self.text = wx.TextCtrl(self, value=msg, style=style_flags)
#        text_height = (msg.count('\n') + 2) * 18
#        text.MinHeight = text_height
        self.text.SetCanFocus(False)
        self.sizer.Add(self.text, 1, wx.EXPAND|wx.ALL, 16)
        
    def addClose(self):
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bsizer.AddStretchSpacer()
        self.button = MDButton(self, label='Close')
        bsizer.Add(self.button, 0, wx.ALIGN_RIGHT)
        self.sizer.Add(bsizer, 1, wx.RIGHT|wx.BOTTOM|wx.EXPAND, 16)
    
    def launch(self):
        self.addClose()
        self.Bind(wx.EVT_BUTTON, lambda e: self.Destroy())
        self.SetSizerAndFit(self.sizer)
        self.CentreOnParent()
        self.ShowModal()
    
    def setColors(self, swatch):
        if 'bg' in swatch:
            self.BackgroundColour = self.text.BackgroundColour = swatch['bg']
        if 'fg' in swatch:
            self.ForegroundColour = self.text.ForegroundColour = swatch['fg']
        if 'butbg' in swatch:
            self.button.setColors(swatch['butbg'])
    
