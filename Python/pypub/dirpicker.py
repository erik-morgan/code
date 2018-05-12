import wx
from mdbutton import MDButton

class DirPicker(wx.Panel):
    def __init__ (self, parent,
                  size = wx.DefaultSize,
                  style = wx.TAB_TRAVERSAL,
                  labelText = 'Folder Path:',
                  initValue = '',
                  buttonText = 'Browse',
                  dialogTitle = 'Choose a folder',
                  startDir = '.',
                  pathCallback = None,
                  newDir = False,
                  name = 'dirpicker'):
        self.labelText = labelText
        self.initValue = initValue
        self.buttonText = buttonText
        self.dialogTitle = dialogTitle
        self.startDir = startDir
        self.callback = pathCallback
        self.newDir = newDir
        self.Font = parent.Font
        self.value = property(self.getValue, self.setValue)
        self.BackgroundColour = parent.BackgroundColour
        self.ForegroundColour = parent.ForegroundColour
        self.createPicker(parent, size, style, name)
    
    def createPicker(self, parent, size, style, name):
        super().__init__(self, parent, style=style, name=name)
        self.MinSize = size
        vsizer = wx.BoxSizer(wx.VERTICAL)
        self.label = self.makeLabel()
        vsizer.Add(self.label, 0, wx.CENTER|wx.TOP, 16)
        hsizer = wx.BoxSizer(wx.HORIZONTAL)
        hsizer.Add(self.makeField(), 1, wx.RIGHT, 16)
        self.button = self.makeButton()
        hsizer.Add(self.button, 0)
        vsizer.Add(hsizer, 1, wx.EXPAND|wx.TOP, 8)
        self.SetAutoLayout(True)
        self.SetSizerAndFit(vsizer)
        self.Layout()
        if instanceof(size, tuple):
            size = wx.Size(size)
        self.SetSize(-1, -1, size.width, size.height, wx.SIZE_USE_EXISTING)
    
    def makeLabel(self):
        label = wx.StaticText(self, -1, self.labelText, style=wx.ALIGN_LEFT)
        label.BackgroundColour = self.BackgroundColour
        self.sizeText(label, self.labelText)
        return label
    
    def makeField(self):
        sizer = wx.BoxSizer(wx.VERTICAL)
        
        self.field = wx.TextCtrl(self, value=self.initValue)
        line = wx.Panel(self, size=(-1, 1))
        self.field.BackgroundColour = self.BackgroundColour
        self.field.ForegroundColour = line.BackgroundColour = self.ForegroundColour
        self.field.ToolTip = f'Path to: {self.labelText}'
        self.sizeText(self.field, self.initValue)
        
        sizer.Add(self.field, 0, wx.EXPAND)
        sizer.Add(line, 0, wx.EXPAND)
        return sizer
    
    def makeButton(self):
        button = MDButton(self, self.buttonText)
        button.ToolTip = f'Click to browse to: {self.labelText}'
        button.Bind(wx.EVT_BUTTON, self.onBrowse)
        return button
    
    def setCallback(self, callbackFunc):
        self.callback = callbackFunc
    
    def getValue(self):
        return self.field.Value
    
    def setValue(self, value):
        self.field.Value = value
        if self.callback:
            self.callback(value)
    
    def onBrowse(self, ev=None):
        style = wx.DD_DEFAULT_STYLE
        if not self.newDir:
            style |= wx.DD_DIR_MUST_EXIST
        dialog = wx.DirSelector(self.dialogTitle, self.startDir, style)
        if dialog:
            self.Value = dialog.GetPath()
    
    def sizeText(self, elem, value):
        if not value:
            return (320, -1)
        elem.MinSize = (round(self.CharWidth * 1.2), self.CharHeight)
    