import wx
from mdbutton import MDButton
from dirpicker import DirPicker
from error_ui import ErrorDialog

# TODO: check spacing/layout
# TODO: add app.py handler func for tracking field values

class PypubGUI(wx.Frame):
    
    def __init__(self, title, colors):
        self.app = wx.App()
        super().__init__(None, title=title)
        self.BackgroundColour = colors.get('bg', wx.NullColour)
        self.ForegroundColour = colors.get('fg', wx.NullColour)
        self.setFont()
        self.sizer = wx.BoxSizer(wx.VERTICAL)
    
    def startGUI(self):
        if not self.app.IsMainLoopRunning():
            self.addActions()
            self.Bind(wx.EVT_CLOSE, self.closeHandler)
            self.SetSizerAndFit(self.sizer)
            self.Show()
            self.app.MainLoop()
    
    def addRow(self, name, val, dirCallback=None):
        picker = DirPicker(self,
                           labelText = name + ' Folder',
                           initValue = val,
                           dialogTitle = f'Select the {name} folder',
                           name = name)
        picker.button.setColors(self.colors['butbg'])
        if dirCallback:
            picker.setCallback(dirCallback)
        self.sizer.Add(picker, 0, wx.EXPAND|wx.LEFT|wx.RIGHT, 16)
    
    def addActions(self):
        if wx.Window.FindWindowByName('bquit'):
            return
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bsizer.AddStretchSpacer()
        
        bquit = MDButton(self, 'Quit', 'bquit')
        bquit.setColors(self.colors.get('butbg'), wx.NullColour)
        self.AcceleratorTable = wx.AcceleratorTable([(wx.ACCEL_CTRL, ord('Q'), bquit.Id)])
        bsizer.Add(bquit, 0, wx.ALIGN_RIGHT)
        
        binit = MDButton(self, 'Run', 'binit')
        binit.setColors(self.colors.get('actbg', wx.NullColour),
                        self.colors.get('actfg', wx.NullColour))
        binit.enable(False)
        bsizer.Add(binit, 0)
        self.sizer.Add(bsizer, 0, wx.EXPAND|wx.ALL, 16)
        
        bquit.Bind(wx.EVT_BUTTON, lambda e: self.Close())
        binit.Bind(wx.EVT_BUTTON, self.onRun)
    
    def onRun(self, evt):
        pass
    
    def closeHandler(self, evt):
        if self.onClose:
            self.onClose()
        wx.CallAfter(self.Destroy())
    
    def onError(self, errorObject):
        with ErrorDialog(self, errorObject) as dialog:
            dialog.raiseDialog()
    
    def setFont(self):
        self.Font = wx.SystemSettings().GetFont(wx.SYS_DEFAULT_GUI_FONT)
        charwMax = wx.SystemSettings().GetMetric(wx.SYS_SCREEN_X) * 0.004
        charw = self.CharWidth
        if charw < charwMax:
            self.Font = self.Font.Scaled(round(charw / charwMax, 1))
