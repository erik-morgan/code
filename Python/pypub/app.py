from gui import PypubGUI
from pub_config import Configuration
from pypub import Pypub
from pub_progress import PypubProgress
from pub_error_dialog import ErrorDialog
from send2trash import send2trash
import wx

# add clean_up function for aborted process
# add font to pub_config and pass to gui windows
# add help dialog
# ALWAYS save the dirs when exiting the gui
# put callbacks in here; no need to send to GUI; test button names, and close from here
# still need closeCallback bc of ctrl+q

class PypubApp(wx.App):
    
    def __init__(self):
        self.app = wx.App()
        self.mainframe = gui.PypubGUI('pypub', self.on_click)
        self.mainframe.init_gui(config.colors())
        dir_list = config.load_dirs()
        self.dirs = [f'{d[0]}={d[2]}' for d in dir_list if d[0] != 'proj']
        self.mainframe.build_gui(dir_list)
    
    def on_click(self, evt=None):
        self.fields = self.mainframe.pack_fields()
        self.mainframe.Destroy()
        if set(fields) != set(self.dirs):
            config.dump_dirs('\n'.join(fields))
        if evt and evt.EventObject.Name == 'binit':
            self.on_init()
    
    def on_init(self):
        prog = PypubProgress(config.colors(), self.on_error)
        prog.init_prog('Loading Outline...')
        try:
            pypub = Pypub(fields, prog)
            prog.update()
            if not getattr(pypub, 'pub'):
                pypub.init_parser()
                prog.init_prog('Parsing Outline...', pypub.parse_range)
                pypub.parse_outline(prog.update)
                prog.init_prog('Saving Outline...')
                pypub.save_opub()
                prog.update()
            prog.init_prog('Checking for files...')
            pypub.file_check()
            pypub.build_pub()
            send2trash(bytes(pypub.opub))
        except (OutlineError, MissingFileError, AppendixError, ConfigDirError) as err:
            self.on_error(err.message)
    
    def on_error(self, err_msg):
        self.prog.Destroy()
        ed = ErrorDialog(err_msg)
        ed.Centre()
        ed.ShowModal()
    
if __name__ == '__main__':
    app = PypubApp()
    