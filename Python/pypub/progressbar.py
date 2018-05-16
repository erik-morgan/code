import wx

class ProgressBar(wx.Panel):
    def __init__(self, parent, message, steps=1):
        super().__init__(self, None)
        self.Font = parent.Font
        self.BackgroundColour = parent.BackgroundColour
        self.ForegroundColour = parent.ForegroundColour
        self.createProgress(message, steps)
    
    def createProgress(self, msg, steps):
        sizer = wx.BoxSizer(wx.VERTICAL)
        self.message = self.makeMessage(msg)
        sizer.Add(self.message, 0, wx.BOTTOM, 8)
        self.bar = self.makeBar()
        sizer.Add(self.bar, 0, wx.EXPAND)
        self.setSteps(steps)
        self.SetSizerAndFit(sizer)
    
    def makeMessage(self, message):
        msg = wx.StaticText(self, label=message, style=wx.ALIGN_LEFT)
        msg.MinSize = (self.CharWidth * len(message), self.CharHeight * 1.2)
        msg.BackgroundColour = self.BackgroundColour
        msg.ForegroundColour = self.ForegroundColour
        return msg
    
    def makeBar(self):
        bar = wx.Panel(self)
        bar.BackgroundColour = (171, 205, 237)
        bar.MinSize = (-1, self.CharHeight * 1.2)
        self.prog = wx.Panel(bar, pos=(0, 0), size=(0, -1))
        self.prog.BackgroundColour = (46, 134, 243)
        return bar
        
    def setMessage(self, messageText):
        self.message.Label = messageText
    
    def setSteps(self, steps):
        self.inc = self.bar.Size.Width / steps
    
    def update(self, newMessage=None):
        if newMessage:
            self.setMessage(newMessage)
        self.prog.Size.Width = self.prog.Size.Width + self.inc
    
