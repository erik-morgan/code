import wx
from mdbutton import MDButton

# Full List of Steps
# Parsing Outline:
#     do progress dialog with determinate progress bar
#     make the steps max the number of sections in outline
#     close/clear the dialog
# make checking files a single step
# do another progress dialog/guage:
#     for each unit in xml tree, change message
#     Processing Unit #/##: SS0264...
# Assembling manual...
# Saving [sm name (same as proj folder)]

class ProgressDialog(wx.Dialog):
    
    def __init__(self, parent):
        super().__init__(self, None)
        self.Font = parent.Font
        self.BackgroundColour = parent.BackgroundColour
        self.ForegroundColour = parent.ForegroundColour
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.MinSize = (wx.SystemSettings().GetMetric(wx.SYS_SCREEN_X) / 5, -1)
        self.MaxSize = (parent.Size.Width, -1)
        self.build(parent.colors.get('but_bg', wx.NullColour))
    
    def addPhases(self, phases):
        self.phases = phases
        self.title = wx.StaticText(self, label=self.phases.pop(0), style=wx.ALIGN_CENTRE_HORIZONTAL)
        self.sizer.Prepend(self.title, 0, wx.TOP, 16)
    
    def build(self, bgabort):
        self.message = self.makeMessage('')
        self.sizer.Add(self.message, 0, wx.TOP|wx.LEFT, 16)
        self.bar = self.makeBar()
        self.sizer.Add(self.bar, 0, wx.EXPAND|wx.ALL, 16)
        self.sizer.Add(self.makeAbort(bgabort), 0, wx.CENTER|wx.ALIGN_CENTER|wx.BOTTOM, 16)
    
    def setProgress(self, messageText, steps):
        self.message.Label = messageText
        self.step = 0
        self.steps = steps
    
    def nextPhase(self):
        if len(self.phases):
            self.title.Label = self.phases.pop(0)
    
    def update(self, newMessage=None):
        if newMessage:
            self.message.Label = newMessage
        self.step += 1
        w, h = tuple(self.bar.Size)
        self.prog.Size = (w * self.step / self.steps, h)
    
    def makeMessage(self, message):
        msg = wx.StaticText(self, label=message, style=wx.ALIGN_LEFT)
        msg.MinSize = (-1, self.CharHeight * 1.2)
        msg.Font = self.Font
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
    
    def makeAbort(self, bgcolor):
        abort = MDButton(self, 'Abort')
        abort.setColors(bgcolor)
        abort.Bind(wx.EVT_BUTTON, lambda e: self.Close())
        return abort
    
    def closeHandler(self, evt):
        confirm = wx.MessageBox('Are you sure you want to abort?', 'Confirm', wx.YES_NO|wx.CANCEL)
        if confirm == wx.YES:
            self.onAbort()
            self.Destroy()
    
    def raiseDialog(self, onAbort=None):
        self.onAbort = onAbort
        self.Bind(wx.EVT_CLOSE, self.closeHandler)
        self.SetSizerAndFit(self.sizer)
        self.CentreOnParent()
        self.ShowWindowModal()
    
