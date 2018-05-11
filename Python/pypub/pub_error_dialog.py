import wx
from mdbutton import MDButton

# call from gui
# create gui frame, but don't show it until explicitly called
# that way, this always has a parent, and colors

class ErrorDialog(wx.Dialog):
    def __init__(self, parent, errorObject):
        super().__init__(parent)
        self.Font = parent.Font
        self.BackgroundColour = parent.BackgroundColour
        self.ForegroundColour = parent.ForegroundColour
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.addTitle(errorObject.title)
        self.addMessage(errorObject.message)
    
    def addTitle(self, errorTitle):
        # use bigger/bold font?
        panel = wx.Panel(self)
        panel.BackgroundColour = (255, 71, 67)
        panel.MinSize = (self.CharWidth * 80, -1)
        title = wx.StaticText(panel, label='Error: ' + errorTitle)
        # On Linux, title.bg = (0, 0, 0, 0)
        # title.BackgroundColor = (255, 71, 67)
        title.ForegroundColour = (255, 255, 255)
        title.Font = self.Font
        title.MinSize = (self.CharWidth * len(errorTitle), self.CharHeight)
        panelSizer = wx.BoxSizer(wx.HORIZONTAL)
        panelSizer.Add(title, 0, wx.CENTER|wx.ALL, 4)
        panel.SetSizerAndFit(panelSizer)
        self.sizer.Add(panel, 0, wx.EXPAND|wx.ALL, 16)
    
    def addMessage(self, errorMessage):
        msg = wx.TextCtrl(self, style=wx.TE_READONLY|wx.BORDER_NONE|wx.TE_MULTILINE)
        msg.Value = errorMessage
        msg.Font = self.Font
        msg.BackgroundColour = self.BackgroundColour
        msg.ForegroundColour = self.ForegroundColour
        msg.MinSize = (self.CharWidth * 80,
            self.CharHeight * 1.5 * msg.NumberOfLines)
        msg.SetCanFocus(False)
        self.sizer.Add(msg, 1, wx.LEFT|wx.RIGHT, 16)
    
    def addButton(self, buttonbg=None):
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bsizer.AddStretchSpacer()
        button = MDButton(self, label='Dismiss')
        button.Font = self.Font
        if buttonbg:
            button.setColors(buttonbg)
        bsizer.Add(button, 0, wx.ALIGN_RIGHT)
        self.sizer.Add(bsizer, 0, wx.EXPAND|wx.ALL, 16)
    
    def raiseDialog(self):
        self.Bind(wx.EVT_BUTTON, lambda e: self.Destroy())
        self.SetSizerAndFit(self.sizer)
        self.CentreOnParent()
        self.ShowModal()
    
