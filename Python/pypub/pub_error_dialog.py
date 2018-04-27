import wx

class ErrorDialog(wx.Dialog):
    def __init__(self, colors, err_msg):
        super().__init__(self, None)
        self.colors = colors
        self.BackgroundColour = colors['bg']
        self.ForegroundColour = colors['fg']
        self.Font = wx.Font(12, wx.MODERN, wx.NORMAL, wx.NORMAL, False, 'Pypub')
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.add_text(err_msg)
        self.add_close()
        self.SetSizerAndFit(self.sizer)
    
    def add_text(self, msg):
        if '\n' in msg:
            style_flags = wx.TE_READONLY|wx.TE_MULTILINE|wx.BORDER_NONE
        else:
            style_flags = wx.TE_READONLY|wx.BORDER_NONE
        text = wx.TextCtrl(self, value=msg, style=style_flags)
        text_height = (msg.count('\n') + 2) * 18
        text.MinHeight = text_height
        text.SetCanFocus(False)
        self.sizer.Add(text, 1, wx.EXPAND|wx.ALL, 16)
        text.BackgroundColour = self.colors['bg']
        
    def add_close(self):
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bsizer.AddStretchSpacer()
        button = wx.Button(self, label='Close')
        button.BackgroundColour = self.colors['but_bg']
        button.ForegroundColour = self.colors['fg']
        button.Bind(wx.EVT_BUTTON, self.on_close)
        bsizer.Add(self.abort, 0, wx.ALIGN_RIGHT)
        self.sizer.Add(bsizer, 1, wx.RIGHT|wx.BOTTOM|wx.EXPAND, 16)
    
    def on_close(self, evt):
        self.Destroy()
        raise SystemExit(0)
    