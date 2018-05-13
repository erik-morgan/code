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
    
    def initGUI(self):
        self.Bind(wx.EVT_CLOSE, self.onClose)
        self.Bind(wx.EVT_CHAR_HOOK, self.onChar)
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
    
    def addActions(self, callback):
        if wx.Window.FindWindowByName('bquit'):
            return
        self.callback = callback
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bsizer.AddStretchSpacer()
        
        bquit = MDButton(self, 'Quit', 'bquit')
        bquit.setColors(self.colors.get('butbg'), wx.NullColour)
        bsizer.Add(bquit, 0, wx.ALIGN_RIGHT)
        
        binit = MDButton(self, 'Run', 'binit')
        binit.setColors(self.colors.get('actbg', wx.NullColour),
                        self.colors.get('actfg', wx.NullColour))
        binit.enable(False)
        bsizer.Add(binit, 0)
        self.sizer.Add(bsizer, 0, wx.EXPAND|wx.LEFT|wx.TOP|wx.RIGHT, 16)
        
        bquit.Bind(wx.EVT_BUTTON, self.onQuit)
        binit.Bind(wx.EVT_BUTTON, self.onInit)
    
    def onQuit(self, evt):
        self.Close()
    
    def onInit(self, evt):
        if self.callback:
            self.callback(True)
    
    def onClose(self, evt=None):
        if self.callback:
            self.callback(False)
        wx.CallAfter(self.Destroy())
    
    def onChar(self, evt):
        key = chr(evt.KeyCode)
        mod = evt.GetModifiers()
        if mod == wx.MOD_CONTROL and chr(key) in 'Qq':
            self.Close()
        evt.DoAllowNextEvent()
    
    def onError(self, errorObject):
        with ErrorDialog(self, errorObject) as dialog:
            dialog.raiseDialog()
        
    
    def setFont(self):
        self.Font = wx.SystemSettings().GetFont(wx.SYS_DEFAULT_GUI_FONT)
        charwMax = wx.SystemSettings().GetMetric(wx.SYS_SCREEN_X) * 0.004
        charw = self.CharWidth
        if charw < charwMax:
            self.Font = self.Font.Scaled(round(charw / charwMax, 1))
