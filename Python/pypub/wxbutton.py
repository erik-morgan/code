import wx.lib.buttons as wxb
import wx.lib.newevent

StateChangeEvent, EVT_STATE_CHANGE = wx.lib.newevent.NewEvent()
# StateChangeEvent = wx.NewEventType()
# EVT_STATE_CHANGE = wx.PyEventBinder(StateChangeEvent, 0)

class PubButton(wxb.GenButton):
    
    def __init__(self, *args, **kwargs):
        action = kwargs.pop('action', None)
        self.colors = kwargs.pop('colors')
        super().__init__(self, *args, **kwargs)
        if action:
            self.enable(False)
            self._set_colors('act_bg', 'act_fg')
            self.Bind(EVT_STATE_CHANGE, self._toggle_state)
        else:
            self._set_colors('but_bg', 'fg')
    
    def enable(self, state_bool=True):
        self.Enabled = state_bool
        evt = StateChangeEvent(state=state_bool)
        # or with StateEvent(wx.PyEvent) wx.PostEvent(self.GetEventHandler(), StateEvent(obj.GetId(), obj))
        wx.PostEvent(self, evt)
    
    def _toggle_state(self, evt):
        state = evt.state
        print(f'EventObject: id={evt.EventObject.Id} state={evt.state}')
        print(f'Button [id={self.Id}]: state={self.Enabled} back={str(self.BackgroundColour)}')
        # or if self.Enabled:
        if state:
            self._set_colors('act_bg', 'act_fg')
        else:
            self._set_colors('dis_bg', 'dis_fg')
    
    def _set_colors(self, bg, fg):
        self.BackgroundColour = self.colors['bg']
        self.ForegroundColour = self.colors['fg']
