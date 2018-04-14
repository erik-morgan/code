#!/bin/python
import wx
import wx.lib.inspection as inspect

back = wx.Colour(238, 238, 238, 255)
text = wx.Colour(33, 33, 33, 255)
line = wx.Colour(192, 192, 192, 255)
blue = wx.Colour(33, 150, 243, 255)
white = wx.Colour(255, 255, 255, 255)
back_dis = wx.Colour(209, 209, 209, 255)
text_dis = wx.Colour(177, 177, 177, 255)
txt_val = '/run/media/erik/IT_DOCS/pypub/tkdocs'

def ToggleState(ev):
    binit.Enable(not binit.Enabled)
    binit.BackgroundColour = blue if binit.Enabled else back_dis
    binit.ForegroundColour = white if binit.Enabled else text_dis
    

def OnKeyPress(ev):
    key = ev.KeyCode
    if ev.GetModifiers() == wx.MOD_CONTROL and chr(key) in ('Q', 'q'):
        f.Close()
    ev.DoAllowNextEvent()

def make_label(lbl_txt):
    l = wx.StaticText(f, label=lbl_txt)
    return l

def build_field(val):
    pnl = wx.Panel(f)
    e = wx.TextCtrl(pnl, value=val, size=(min_size(val), -1), style=wx.TE_READONLY)
    szr = wx.BoxSizer(wx.VERTICAL)
    szr.Add(e, 0, wx.EXPAND|wx.BOTTOM, 1)
    pnl.BackgroundColour = text
    pnl.SetSizerAndFit(szr)
    return pnl

def make_field(val):
    e = wx.TextCtrl(f, value=val, style=wx.TE_READONLY)
    pnl = wx.Panel(f, size=(-1, 1))
    pnl.BackgroundColour = text
    szr = wx.BoxSizer(wx.VERTICAL)
    szr.Add(e, 0, wx.EXPAND)
    szr.Add(pnl, 0, wx.EXPAND)
    return szr

def build_button():
    b = wx.Button(f, label='Browse')
    return b

def min_size(txt):
    dc = wx.WindowDC(f)
    attrs = dc.GetFullTextExtent(txt, font=font)
    return round(attrs[0] * 1.2)

app = wx.App()
f = wx.Frame(None, title='pypub test')
f.BackgroundColour = back
f.ForegroundColour = text
f.Bind(wx.EVT_CHAR_HOOK, OnKeyPress)
font = wx.Font(12, wx.MODERN, wx.NORMAL, wx.NORMAL, False)
f.Font = font

sizer = wx.GridBagSizer(12, 12)
labels = ['InDesign Folder', 'PDFs Folder']
lbls = [make_label(lbltxt) for lbltxt in labels]
pnls = [build_field(txt_val), make_field(txt_val)]
btns = [build_button() for b in range(2)]
for n in range(2):
    r = n * 2
    sizer.Add(lbls[n], (r, 0), (1, 3))
    sizer.Add(pnls[n], (r + 1, 0), (1, 2), flag=wx.EXPAND)
    sizer.Add(btns[n], (r + 1, 2))

btogl = wx.Button(f, label='Toggle')
binit = wx.Button(f, label='Run')
binit.BackgroundColour = blue
binit.ForegroundColour = white
r = sizer.EffectiveRowsCount
sizer.Add(btogl, (r, 1), flag=wx.ALIGN_RIGHT|wx.ALIGN_TOP)
sizer.Add(binit, (r, 2), flag=wx.EXPAND)
btogl.Bind(wx.EVT_BUTTON, ToggleState)
sizer.Add(-1, 1, (r + 1, 0), (1, 3))
sizer.AddGrowableCol(0)
sizer.AddGrowableRow(r + 1)
f.SetSizerAndFit(sizer)
f.Show(True)
inspect.InspectionTool().Show()
app.MainLoop()

# print('GetFullTextExtent = ' + str(attrs[0]))
# charWidth = e.CharWidth
# elen = len(e.Value)
# print(f'charWidth ({str(charWidth)}) * elen ({str(elen)}) = {str(charWidth * elen)}')

# miscid = wx.NewId()
# f.Bind(wx.EVT_MENU, OnKeyPress, id=miscid)
# at = wx.AcceleratorTable([(wx.ACCEL_CTRL, ord('Q'), miscid)])
# f.SetAcceleratorTable(at)



# background: rgba(245, 245, 245, 1)
# text: rgba(33, 33, 33, 1)
# button background: rgba(34, 17, 150, 1)
#     normal: rgba(31, 147, 242, 1)
#     focused: rgba(27, 121, 204, 1)
#     pressed: rgba(25, 117, 209, 1)
#     disabled: rgba(0, 0, 0, 0.12)
#     min width: 88dp (px)
#     height: 36dp (px)
#     corner radius: 2dp (px)
# button foreground: rgba(255, 255, 255, 1)
#     normal: rgba(255, 255, 255, 1)
#     disabled: rgba(0, 0, 0, 0.26)
# font size: 16
