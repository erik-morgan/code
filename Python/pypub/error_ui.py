import wx
from mdbutton import MDButton

class ErrorDialog(wx.Dialog):
    def __init__(self, parent, errorObject):
        super().__init__(parent)
        self.Font = parent.Font
        self.BackgroundColour = parent.BackgroundColour
        self.ForegroundColour = parent.ForegroundColour
        self.mdred = (255, 71, 67)
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.addTitle(errorObject.title)
        self.addMessage(errorObject.message)
        self.addButton(self.mdred, parent.BackgroundColour)
    
    def addTitle(self, errorTitle):
        title = wx.StaticText(self, label='Error: ' + errorTitle)
        title.Font = self.Font.Bold()
        title.BackgroundColour = self.BackgroundColour
        title.ForegroundColour = self.mdred
        title.MinSize = (self.CharWidth * 80, self.CharHeight)
        self.sizer.Add(title, 0, wx.EXPAND|wx.ALL, 16)
    
    def addMessage(self, errorMessage):
        msg = wx.TextCtrl(self, value=errorMessage,
            style=wx.TE_READONLY|wx.BORDER_NONE|wx.TE_MULTILINE)
        msg.Font = self.Font
        msg.BackgroundColour = self.BackgroundColour
        msg.ForegroundColour = self.ForegroundColour
        msg.MinSize = (self.CharWidth * 80,
            self.CharHeight * 1.25 * msg.NumberOfLines)
        msg.SetCanFocus(False)
        self.sizer.Add(msg, 1, wx.EXPAND|wx.LEFT|wx.RIGHT, 16)
    
    def addButton(self, bg, fg):
        button = MDButton(self, label='Dismiss')
        button.Font = self.Font
        button.setColors(bg, fg)
        self.EscapeId = button.Id
        self.sizer.Add(button, 0, wx.CENTER|wx.ALIGN_CENTER|wx.ALL, 16)
    
    def onPaint(self, evt):
        dc = wx.PaintDC(self)
        rect = self.GetClientRect()
        rect.Deflate(0.125, 0.125)
        dc.SetPen(wx.Pen(self.mdred, 4))
        dc.SetBrush(wx.TRANSPARENT_BRUSH)
        dc.DrawRectangle(*rect)
        # dc.DrawRectangle(1, 1, self.ClientSize.Width - 1.25, self.ClientSize.Height - 1.25)
    
    def raiseDialog(self):
        self.Bind(wx.EVT_PAINT, self.onPaint)
        self.SetSizerAndFit(self.sizer)
        self.CentreOnParent()
        self.ShowModal()
    
