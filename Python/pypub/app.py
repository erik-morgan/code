from gui import PypubGUI
from config import AppConfig
from exceptions import ConfigError
from send2trash import send2trash

# add clean_up function for aborted process
# add help dialog
# ALWAYS save the dirs when exiting the gui
# put callbacks in here; no need to send to GUI; test button names, and close from here
# still need closeCallback bc of ctrl+q
# ALSO validate colors, which means another freaking exception
# 
# SOLUTION IS TO PUT EVERYTHING ELSE INTO AN ELSE CLAUSE FOR TRY
# THAT WAY, THE APP WILL JUST END EXECUTION IF CONFIGERROR, AND
# MAINLOOP WILL ONLY BE INITIALIZED IF THERE IS NO CONFIGERROR
# ALTERNATIVES: subclass wx.App, or call wx.Exit if not in MainLoop
# apparently destroying the top window does NOT end execution;

class PypubApp:
    
    def __init__(self):
        self.config = AppConfig()
        self.view = PypubGUI('pypub', self.config.colors)
        try:
            self.config.loadDirs()
        except ConfigError as err:
            self.view.onError(err)
        else:
            self.dirs = self.config.dirs.copy()
            for dirName, dirPath in self.dirs.items():
                self.view.addRow(dirName, dirPath, self.onBrowse)
            self.view.addActions()
            self.view.startGUI()
    
    def onBrowse(self, dirName, dirPath):
        self.dirs[dirName] = dirPath
    
    def initApp(self):
        pass
    
    def onClose(self):
        self.config.saveDirs(self.dirs)
    

if __name__ == '__main__':
    app = PypubApp()
    