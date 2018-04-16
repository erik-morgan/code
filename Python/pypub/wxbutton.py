import wx.lib.buttons as wxb
import wx.lib.newevent

StateChangeEvent, EVT_STATE_CHANGE = wx.lib.newevent.NewEvent()
# StateChangeEvent = wx.NewEventType()
# EVT_STATE_CHANGE = wx.PyEventBinder(StateChangeEvent, 0)

class PubButton(wxb.GenButton):
    
    def __init__(self, *args, **kwargs):
        super().__init__(self, *args, **kwargs)
        self.Bind(EVT_STATE_CHANGE, self.state_handler)
        self.bg = wx.NullColour
        self.fg = self.Parent.ForegroundColour
        self.disbg = wx.NullColour
        self.disfg = wx.NullColour
    
    def enable(self, state_bool=True):
        # or with StateEvent(wx.PyEvent) wx.PostEvent(self.GetEventHandler(), StateEvent(obj.GetId(), obj))
        self.Enabled = state_bool
        evt = StateChangeEvent(state=state_bool)
        wx.PostEvent(self, evt)
    
    def state_handler(self, evt):
        state = evt.state
        print(f'EventObject: id={str(evt.EventObject.Id)} state={str(evt.state)}')
        print(f'Button [id={str(self.Id)}]: state={str(self.Enabled)} back={str(self.BackgroundColour)}')
        self.update_colors()
    
    def update_colors(self):
        if self.Enabled:
            self.BackgroundColour = getattr(self, 'bg', wx.NullColour)
            self.ForegroundColour = getattr(self, 'fg', wx.NullColour)
        else:
            self.BackgroundColour = getattr(self, 'disbg', wx.NullColour)
            self.ForegroundColour = getattr(self, 'disfg', wx.NullColour)
    
    def set_colors(self, bg=None, fg=None, disbg=None, disfg=None):
        self.bg = bg if bg else self.bg
        self.fg = fg if fg else self.fg
        self.disbg = disbg if disbg else self.disbg
        self.disfg = disfg if disfg else self.disfg
        self.update_colors()
