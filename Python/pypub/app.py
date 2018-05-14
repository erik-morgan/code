from gui import PypubGUI
from config import AppConfig
from exceptions import ConfigError
from send2trash import send2trash

# add clean_up function for aborted process
# add help dialog

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
            # self.view.onClose = self.onClose
    
    def onBrowse(self, dirName, dirPath):
        self.dirs[dirName] = dirPath
    
    def initApp(self):
        print(f'Execution complete...Results:\n{self.dirs}')
    
    def onClose(self):
        self.config.saveDirs(self.dirs)
    

if __name__ == '__main__':
    app = PypubApp()
    