import wx
from mdbutton import MDButton
from dirpicker import DirPicker
from error_ui import ErrorDialog
from progress_ui import ProgressDialog

class PypubGUI(wx.Frame):
    
    def __init__(self, title, colors):
        self.app = wx.App()
        super().__init__(None, title=title)
        self.colors = colors
        self.BackgroundColour = colors.get('bg', wx.NullColour)
        self.ForegroundColour = colors.get('fg', wx.NullColour)
        self.setFont()
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.dirs = {}
    
    def startGUI(self, callback):
        self.onAction = callback
        self.addActions()
        self.Bind(wx.EVT_BUTTON, self.actionHandler)
        self.Bind(wx.EVT_CLOSE, self.actionHandler)
        self.Bind(wx.EVT_CHAR_HOOK, self.onChar)
        self.SetSizerAndFit(self.sizer)
        self.Show()
        self.app.MainLoop()
    
    def addDir(self, name, val):
        self.dirs[name] = val
        picker = DirPicker(self,
                           labelText = name + ' Folder',
                           initValue = val,
                           dialogTitle = f'Select the {name} folder',
                           pathCallback = self.setDir,
                           name = name)
        picker.button.setColors(self.colors.get('butbg', wx.NullColour))
        self.sizer.Add(picker, 0, wx.EXPAND|wx.LEFT|wx.RIGHT, 16)
    
    def addActions(self):
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bquit = MDButton(self, 'Quit', 'bquit')
        bquit.setColors(self.colors.get('butbg', wx.NullColour))
        bsizer.Add(bquit, 0, wx.TOP|wx.BOTTOM, 16)
        binit = MDButton(self, 'Run', 'binit')
        binit.setColors(self.colors.get('actbg', wx.NullColour),
                        self.colors.get('actfg', wx.NullColour))
        binit.enable(False)
        bsizer.Add(binit, 0, wx.ALL, 16)
        self.sizer.Add(bsizer, 0, wx.ALIGN_RIGHT|wx.TOP|wx.BOTTOM, 8)
    
    def setDir(self, name, path):
        self.dirs[name] = path
        if all(self.dirs.values()):
            binit = wx.Window.FindWindowByName('binit')
            binit.enable(True)
    
    def actionHandler(self, evt):
        if evt.EventObject.Name == 'binit':
            self.onAction(True)
        else:
            self.onAction(False)
            self.Destroy()
    
    def onError(self, errorObject):
        with ErrorDialog(self, errorObject) as dialog:
            dialog.raiseDialog()
    
    def getProgress(self, onAbort=None):
        return ProgressDialog(self)
    
    def onChar(self, ev):
        if ev.GetModifiers() == wx.MOD_CONTROL and chr(ev.KeyCode) in 'Qq':
            self.Close()
        ev.DoAllowNextEvent()
    
    def setFont(self):
        self.Font = wx.SystemSettings().GetFont(wx.SYS_DEFAULT_GUI_FONT)
        charwMax = wx.SystemSettings().GetMetric(wx.SYS_SCREEN_X) * 0.0035
        charw = self.CharWidth
        self.Font = self.Font.Scaled(round(charwMax / charw, 1))
    
