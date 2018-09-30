# 2018-09-30 01:35:09 #
from PyPDF2 import PdfFileReader as Reader
from io import BytesIO
import re

class PDFParser:
    def __init__(self, path):
        self.pdf = Reader(path)
        self.pages = self.pdf.pages
        self.text = bytearray()
        self.addtext = self.text.extend
        self.hex_digits = b'0123456789abcdefABCDEF'
    
    def get_text(self, page=None):
        parse_func = self.parse_page
        # parse_func = self.parse
        if page != None:
            parse_func(self.pages[page])
        else:
            list(map(parse_func, self.pages))
        self.text = self.text.decode()
        self.text = re.sub(r'-\s+', '', self.text)
        self.text = re.sub(r'\s*\t\s*', '\t', self.text)
        self.text = re.sub(r'\s*\n\s*', '\n', self.text)
        self.text = re.sub(r'\n(?=\w{1,3}\n)([A-Z]{1,3})?', ' ', self.text)
        self.text = re.sub(r' {2,}', ' ', self.text)
        return self.text
    
    def dump_page(self, page):
        return self.pages[page].extractText()
    
    def parse(self, page):
        stream = BytesIO(page.getContents().getData())
        operators = [b'ET', b'TD', b'Td', b'T*', b'\'', b'"']
        operator_chars = b''.join(operators)
        hopper = bytearray()
        intext = False
        while True:
            char = stream.read(1)
            if intext:
                if char == b'<':
                    self.parse_hex(stream)
                elif char == b'(':
                    self.parse_str(stream)
            if char.isspace() and len(hopper):
                if not intext and hopper == b'BT':
                    intext = True
                if intext and hopper in operators:
                    self.addtext(b'\n')
                    if hopper == b'ET':
                        intext = False
                hopper.clear()
            elif char in operator_chars:
                hopper.extend(char)
    
    def parse_page(self, page):
        content = page.getContents().getData()
        stream = BytesIO(content)
        ws = b' \t\n\r\x0b\f'
        self.streamlen = len(content)
        while True:
            bt = content.find(b'BT', stream.tell())
            if bt == -1:
                break
            if (bt == 0 or content[bt - 1] in ws) and content[bt + 2] in ws:
                stream.seek(bt, 0)
                self.parse_text_object(stream)
    
    def parse_text_object(self, stream):
        # Excluding T* and TD operators because of how InDesign seemed
        # to use them. The parsing results were more accurate without them.
        operators = [b'ET', b'Td', b'Tj', b'TJ', b'\'', b'"']
        operator_chars = b''.join(operators)
        hopper = bytearray()
        while stream.tell() < self.streamlen:
            char = stream.read(1)
            if char == b'<':
                self.parse_hex(stream)
            elif char == b'(':
                self.parse_str(stream)
            elif char.isspace():
                if hopper in operators:
                    self.addtext(b' ' if hopper in b'Tj TJ' else b'\n')
                    if hopper == b'ET':
                        break
                hopper.clear()
            elif char in operator_chars:
                hopper.extend(char)
    
    def parse_hex(self, stream):
        hexbytes = bytearray(stream.read(1))
        while hexbytes[-1] in self.hex_digits:
            hexbytes.extend(stream.read(1))
        hexbytes.pop()
        if len(hexbytes):
            hexstr = hexbytes.decode() + ('0' if len(hexbytes) % 2 else '')
            if hexstr.startswith('FEFF'):
                hexstr = bytearray.fromhex(hexstr).decode('utf-16')
            else:
                hexstr = bytearray.fromhex(hexstr).decode()
            if hexstr.isascii():
                self.addtext(hexstr.encode())
    
    def parse_str(self, stream):
        tokens = {b'(': 1, b')': -1}
        escapes = {b'n': b'\n', b'r': b'\r', b't': b'\t'}
        token_sum = 0
        while True:
            char = stream.read(1)
            if char == b')' and token_sum == 0:
                break
            if char == b'\\':
                char = stream.read(1)
                if char in escapes:
                    char = escapes[char]
                elif char.isdigit():
                    char += stream.read(2)
                    while not char.isdigit():
                        char = char[:-1]
                    stream.seek(len(char) - 3, 1)
                    char = chr(int(char, 8)).encode()
                    self.addtext(char if char.isascii() else b' ')
                elif char in b'\n\r':
                    char = stream.read(1)
                    if char not in b'\n\r':
                        stream.seek(-1, 1)
            else:
                token_sum += tokens.get(char, 0)
            self.addtext(char)

if __name__ == '__main__':
    parser = PDFParser('/home/erik/Downloads/build_modules/PDF Spec/SS0351-13 TOC.pdf')
    print(parser.get_text(2))
    # print(parser.dump_page(2))
