class OutlineError(Exception):
    def __init__(self):
        self.message = 'No outline found in project directory. Outlines must end in "Outline.docx".'

class AppendixError(Exception):
    def __init__(self):
        paragraphs = [
            'No appendix file was found in project directory\n',
            ('To avoid the nightmare of third-party documents, this '
                'application requires a pre-packaged appendix.\n'),
            'The appendix must:',
            '  1. Be named "Appendix.pdf"',
            '  2. Be located within the project folder',
            '  3. Have all necessary bookmarks'
        ]
        self.message = '\n'.join(paragraphs)

class MissingFileError(Exception):
    def __init__(self, missing_files):
        self.message = 'Unable to find the following files:\n' + '\n'.join(missing_files)

class ConfigFileError(Exception):
    def __init__(self):
        self.message = ('Error parsing config file in Configuration class.\n'
                        'Pypub requires a file named "config" (no extension) to exist in the application directory, and it must adhere to these simple rules:\n'
                        '  1. Each line is a key=value pair. Key is a directory label, and value (directory path) is optional.\n'
                        '     Example line: Drawings = /User/Folder/Desktop/Drawings\n'
                        '  2. One of the lines MUST have a "Project" key, but the value for Project will be ignored.\n'
                        '  3. Labels should be single words')
