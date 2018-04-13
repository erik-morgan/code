from wx.lib.buttons import GenButton
from wx import Colour
import wx.lib.newevent

StateChangeEvent, EVT_STATE_CHANGE = wx.lib.newevent.NewEvent()
# StateChangeEvent = wx.NewEventType()
# EVT_STATE_CHANGE = wx.PyEventBinder(StateChangeEvent, 0)
# PB_STYLE_SQUARE for platebutton with square edges (highlights on hover...)
# from wx.lib.platebtn import PlateButton

class PubButton(GenButton):
    
    back = wx.Colour(224, 224, 224)
    text = wx.Colour(33, 33, 33)
    dis_back = wx.Colour(209, 209, 209)
    dis_text = wx.Colour(177, 177, 177)
    
    def __init__(self, parent, label, name='button', action=False):
        super().__init__(parent, -1, label, name=name)
        self.BackgroundColour = self.back
        self.ForegroundColour = self.text
        if action:
            self.Enabled = False
            self.back = wx.Colour(33, 150, 243)
            self.text = wx.Colour(255, 255, 255)
            self.Bind(EVT_STATE_CHANGE, self.toggle_state)
    
    def Enable(self, state_bool):
        self.Enabled = state_bool
        evt = StateChangeEvent(state=state_bool)
        # or with StateEvent(wx.PyEvent) wx.PostEvent(self.GetEventHandler(), StateEvent(obj.GetId(), obj))
        wx.PostEvent(self, evt)
    
    def toggle_state(self, evt):
        state = evt.state
        print(f'EventObject: id={evt.EventObject.Id} state={evt.state}')
        print(f'Button [id={self.Id}]: state={self.Enabled} back={str(self.BackgroundColour)}')
        # or if self.Enabled:
        if state:
            self.BackgroundColour = self.back
            self.ForegroundColour = self.text
        else:
            self.BackgroundColour = self.dis_back
            self.ForegroundColour = self.dis_text
    
