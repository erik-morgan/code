class PypubError(Exception):
    pass

class OutlineError(PypubError):
    title = 'No outline in project folder'
    message = 'The project outline must end in "Outline.docx".'

class AppendixError(PypubError):
    title = 'No appendix file in project folder'
    message = '''To avoid the complication of third-party documents, this app requires a pre-packaged appendix, which must:
1. Be named "Appendix.pdf"
2. Be located within the project folder
3. Have all necessary bookmarks'''

class ConfigError(PypubError):
    title = 'Trouble parsing config file'
    message = '''Pypub requires a file named "config" (no extension) to exist in the application directory:
Each line is a key=value pair. Key is a directory label, and value (directory path) is optional.
Example Line: Drawings = /User/Folder/Desktop/Drawings'''

class MissingFileError(PypubError):
    title = 'Trouble finding some required files:'
    def __init__(self, missingFiles):
        self.message = ''
        for i, mf in enumerate(missingFiles):
            if (i + 1) % 3:
                self.message += mf.ljust(30)
            else:
                self.message += mf + '\n'
