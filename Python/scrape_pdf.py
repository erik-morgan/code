# 2018-08-18 22:01:51 #
import re
import zlib
import struct

class PDFScraper:
    """
    PDFs contain objects, and each object may need 1+ filters to decompress it.
    Text streams usually use FlateDecode filter (zlib).
    The data for each object can be found between stream/endstream sections. Data usually contains 1+ text objects (from BT to ET) with formatting instructions inside.
    """
    
    def __init__(self):
        pass
    
    def decode(self):
        """
        https://github.com/euske/pdfminer/blob/master/pdfminer/ascii85.py
        if FlateDecode, use zlib
        if ASCII85 use decode_ascii85
        if ASCIIHex use decode_asciihex
        """
        
    
    def xrefs(self):
        """
        https://github.com/euske/pdfminer/blob/master/pdfminer/pdfdocument.py
        https://github.com/euske/pdfminer/blob/master/pdfminer/psparser.py
        https://github.com/euske/pdfminer/blob/master/pdfminer/pdfparser.py
        """
        
    

def decode_ascii85(data):
    """
    taken from https://github.com/euske/pdfminer/blob/master/pdfminer/ascii85.py
    """
    n = b = 0
    out = b''
    for c in data:
        if b'!' <= c and c <= b'u':
            n += 1
            b = b*85+(ord(c)-33)
            if n == 5:
                out += struct.pack('>L', b)
                n = b = 0
        elif c == b'z':
            assert n == 0
            out += b'\0\0\0\0'
        elif c == b'~':
            if n:
                for _ in range(5-n):
                    b = b*85+84
                out += struct.pack('>L', b)[:n-1]
            break
    return out

def decode_asciihex(data):
    """
    taken from https://github.com/euske/pdfminer/blob/master/pdfminer/ascii85.py
    """
    hex_re = re.compile(r'([a-f\d]{2})', re.I)
    trail_re = re.compile(r'^(?:[a-f\d]{2}|\s)*([a-f\d])[\s>]*$', re.I)
    decode = (lambda hx: chr(int(hx, 16)))
    out = map(decode, hex_re.findall(data))
    m = trail_re.search(data)
    if m:
        out.append(decode('%c0' % m.group(1)))
    return b''.join(out)
