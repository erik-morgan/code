class OutlineError(Exception):
    def __init__(self):
        self.message = 'No outline found in project directory. Outlines must end in "Outline.docx".'
    

class MissingFileError(Exception):
    def __init__(self, missing_files):
        self.message = 'Unable to find the following files:\n' + '\n'.join(missing_files)
