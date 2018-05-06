import wx.lib.buttons as wxb
import wx.lib.newevent

StateChangeEvent, EVT_STATE_CHANGE = wx.lib.newevent.NewEvent()

class Button(wxb.GenButton):
    
    def __init__(self, parent, label, name='mdbutton'):
        super().__init__(self, parent, label=label, name=name)
        self.Bind(EVT_STATE_CHANGE, self.stateHandler)
        self.bg = wx.NullColour
        self.fg = parent.ForegroundColour
        self.Font = parent.Font
    
    def enable(self, stateBool=True):
        self.Enabled = stateBool
        evt = StateChangeEvent(state=stateBool)
        wx.PostEvent(self, evt)
    
    def stateHandler(self, evt):
        state = evt.state
        print(f'EventObject: id={str(evt.EventObject.Id)} state={str(evt.state)}')
        print(f'Button [id={str(self.Id)}]: state={str(self.Enabled)} back={str(self.BackgroundColour)}')
        self.refresh()
    
    def refresh(self):
        if self.Enabled:
            self.BackgroundColour = getattr(self, 'bg', wx.NullColour)
            self.ForegroundColour = getattr(self, 'fg', wx.NullColour)
        else:
            self.BackgroundColour = wx.NullColour
            self.ForegroundColour = wx.NullColour
    
    def setColors(self, bg=None, fg=None):
        self.bg = bg if bg else self.bg
        self.fg = fg if fg else self.fg
        self.refresh()
