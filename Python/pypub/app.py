from gui import PypubGUI
from config import AppConfig
from send2trash import send2trash

# add clean_up function for aborted process
# add help dialog
# ALWAYS save the dirs when exiting the gui
# put callbacks in here; no need to send to GUI; test button names, and close from here
# still need closeCallback bc of ctrl+q
# ALSO validate colors, which means another freaking exception

class PypubApp(wx.App):
    
    def __init__(self):
        self.config = AppConfig()
        self.view = PypubGUI('pypub', self.config.colors)
        try:
            self.config.loadDirs()
        except ConfigError as err:
            self.view.onError(err)
        # 
        # SOLUTION IS TO PUT EVERYTHING ELSE INTO AN ELSE CLAUSE FOR TRY
        # THAT WAY, THE APP WILL JUST END EXECUTION IF CONFIGERROR, AND
        # MAINLOOP WILL ONLY BE INITIALIZED IF THERE IS NO CONFIGERROR
        # ALTERNATIVES: subclass wx.App, or call wx.Exit if not in MainLoop
        # apparently destroying the top window does NOT end execution;
        # 
        self.mainframe.init_gui(config.getColors())
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
        except (OutlineError, MissingFileError, AppendixError, ConfigFileError) as err:
            self.on_error(err.message)
    
if __name__ == '__main__':
    app = PypubApp()
    