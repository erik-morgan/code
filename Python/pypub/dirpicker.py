import wx
from mdbutton import Button

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
        self.createPicker(parent, size, style, name)
        self.setColors(parent.BackgroundColour, parent.ForegroundColour)
        
    def createPicker(self, parent, size, style, name):
        super().__init__(self, parent, style=style, name=name)
        self.SetMinSize(size)
        vsizer = wx.BoxSizer(wx.VERTICAL)
        self.label = self.makeLabel()
        vsizer.Add(self.label, 0, wx.CENTER|wx.TOP, 16)
        hsizer = wx.BoxSizer(wx.HORIZONTAL)
        field, fieldSizer = self.makeField()
        hsizer.Add(fieldSizer, 1, wx.RIGHT, 16)
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
        self.sizeText(label, self.labelText)
        return label
    
    def makeField(self):
        sizer = wx.BoxSizer(wx.VERTICAL)
        
        field = wx.TextCtrl(self, value=self.initValue)
        field.ToolTip = f'Path to: {self.labelText}'
        self.sizeText(field, self.initValue)
        sizer.Add(field, 0, wx.EXPAND)
        
        line = wx.Panel(self, size=(-1, 1))
        line.BackgroundColour = self.ForegroundColour
        sizer.Add(line, 0, wx.EXPAND)
        return field, sizer
    
    def makeButton(self):
        button = Button(self, self.buttonText)
        button.ToolTip = f'Click to browse to: {self.labelText}'
        button.Bind(wx.EVT_BUTTON, self.onBrowse)
        return button
    
    def setColors(self, bgcolor=None, fgcolor=None):
        for win in [self, self.label, self.field]:
            if bgcolor:
                win.BackgroundColour = bgcolor
            if fgcolor:
                win.ForegroundColour = fgcolor
    
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
    
    def sizeText(self, widget, value):
        if not value:
            return (320, -1)
        w, h, d, e = self.GetFullTextExtent(value, self.Font)
        widget.MinSize = (round(w * 1.2), h)
    