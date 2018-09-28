# 2018-09-26 15:19:11 #
import zlib
import re

# Support ASCIIHexDecode, ASCII85Decode, LZWDecode, and FlateDecode
# Use hex values, bc stuff is lost when it is assumed to be octal
# 
# So, read xref tables. if line ends with an "n", store its byte-offset
# can also count from xref\n#1 #2 where #1 is the starting obj num & #2 is num of entries in xref table
# subsections start over with \n#1 #2, and whole xref finishes @ trailer keyword
# /Prev entry has byte-offset of previous xref table
# 
# SHOULD BE SAFE JUST DOING THIS:
# trailer has /Root, giving obj ref for the root node
# root node has the document catalog, which contains a /Pages dictionary key, providing obj ref for Page Tree
# page tree has 4 mandatory keys: /Type /Pages, /Parent (the tree), /Count (# of pg objs under THIS node), 
# & /Kids (an array with obj refs for it's descendants)
# *** if the /Parent key is missing, it is the root node. just recursively traverse the tree.
# *** for children, if /Type is /Page, then it is a leaf node. if it is /Pages then it is another tree node
# grab the /Contents key from the Page dictionaries, which points to child obj
# 
# ** just noticed there are multiple EOFs in a linearized file...
# 
# maybe just half-ass this by splitting on newline + # # + newline
# i'm going to do this the lazy way:
#   find /Catalog, and that is the root node, which contains the /Pages key

class PDF:
    def __init__(self, path):
        self.path = path
        with open(path, 'rb') as f:
            self.pdfb = f.read()
        self.read()
    
    def read(self):
        beg, src = self.findxref()
    
    def findxref(self):
        self.xref = {}
        beg = self.pdfb.rfind(b'startxref') + 9
        eof = self.pdfb.rfind(b'%%EOF')
        off = self.pdfb[beg:eof]
    
    def next_line

class PDFObject:
    def __init__(self, objid, data, pdf):
        # super class of NamedObject and IndirectObject
        # data should be slice of object
        if ' ' in objid:
            return IndirectObject(objid, data, pdf)
        else:
            return NamedObject(objid, data, pdf)
    
    def parse_data(self):
        # whitespace chars = [null, tab, lf, ff, cr, sp]
        # delims = [(), <>, [], {}, /, %]
        # comments (beginning with %) are to be completely disregarded
        # objs = Boolean, Integer, Real, String, Name, Array, Dict, Stream, Null
        # objs can be labeled for reference, and are called indirect objects
        # integers = 123, 43445, +17,-98, 0
        # reals = 34.5 -3.62, +123.6, 4., -.002, 0.0
        # strings = (literal characters) or <hex data>
        # any chars can appear in literal string except unbalanced () and \
        # \ is used as an escape char, including the usual \[nrtbf], \(, \), \\, and \ddd
        # \ at end of line is a continuation character
        # eol within literal w/o a \ is a byte value of x0A, whether it was CR, LF, or both
        # \ddd is an octal char; can be filled w/ leading 0s; \0053 == \005+3, but \053 and \53 == \053 (plus sign)
        # odd # of chars in a hex str assumes a trailing 0
        # names = a / indicating the following chars are a name + the name itself
        # names: # (x23) as #23; reg chars can be #dd with hex value; non-reg chars as #xx
        # whitespace in names must be encoded with #xx value
        # / by itself is considered a unique name with empty sequence of chars
        # 
        

# Example Object:
# 1 0 obj
# <</ArtBox[ 0 0 612 792]/BleedBox[ 0 0 612 792]/Contents 2 0 R /CropBox[ 0 0 612 792]/MediaBox[ 0 0 612 792]
#   /Resources<</ExtGState<</GS0 104 0 R /GS1 105 0 R >>
#               /Font<</T1_0 101 0 R /T1_1 110 0 R /T1_2 102 0 R /T1_3 117 0 R /T1_4 116 0 R >>
#               /ProcSet[/PDF/Text]
#               /XObject<</Fm0 9 0 R >>>>
#   /Rotate 0/StructParents 2/Thumb 18 0 R /TrimBox[ 0 0 612 792]/Type/Page/Parent 24 0 R >>
# 
# PDFDictionary(1, 0) {
#   ArtBox: [0, 0, 612, 792],
#   BleedBox: [0, 0, 612, 792],
#   Contents: '2 0',
#   CropBox: [0, 0, 612, 792],
#   MediaBox: [0, 0, 612, 792],
#   Resources: {
#       ExtGState: {
#           GS0: '104 0',
#           GS1: '105 0'
#       },
#       Font: {
#           T1_0: '101 0',
#           T1_1: '110 0',
#           T1_2: '102 0',
#           T1_3: '117 0',
#           T1_4: '116 0'
#       },
#       ProcSet: ['PDF', 'Text'],
#       XObject: {
#           Fm0: '9 0'
#       }
#   },
#   Rotate: 0,
#   StructParents: 2,
#   Thumb: '18 0',
#   TrimBox: [0, 0, 612, 792],
#   Type: 'Page',
#   Parent: '24 0'
# }

class IndirectObject(PDFObject):
    def __init__(self, objid, data, pdf):
        self.objid = objid
        self.num, self.gen = objid.partition(' ')[::2]
        self.data = data
        self.pdf = pdf
    
    def __str__(self):
        return f'IndirectObject({self.objid})'
    
    def __eq__(self, obj):
        return self.objid == obj.objid
    
    

    def readFromStream(stream, pdf):
        idnum = b_("")
        while True:
            tok = stream.read(1)
            if not tok:
                # stream has truncated prematurely
                raise PdfStreamError("Stream has ended unexpectedly")
            if tok.isspace():
                break
            idnum += tok
        generation = b_("")
        while True:
            tok = stream.read(1)
            if not tok:
                # stream has truncated prematurely
                raise PdfStreamError("Stream has ended unexpectedly")
            if tok.isspace():
                if not generation:
                    continue
                break
            generation += tok
        r = readNonWhitespace(stream)
        if r != b_("R"):
            raise utils.PdfReadError("Error reading indirect object reference at byte %s" % utils.hexStr(stream.tell()))
        return IndirectObject(int(idnum), int(generation), pdf)
    readFromStream = staticmethod(readFromStream)



# XREF TABLES:
# Each cross-reference section shall begin with a line containing the keyword xref.
# Following shall be 1+ cross-reference subsections, which may appear in any order.
# Cross-reference tables are delimited by two lines: one says xref, the other says trailer
# Each subsection contains entries for a contiguous range of object numbers.
# The subsection begins with a line containing 2 numbers separated by a SPACE,
#       denoting the object # of the first object in this subsection and the # of entries.
# 
# FILE TRAILER:
# Conforming readers should read a PDF file from its end.
# The last line of the file shall contain only the end-of-file marker "%%EOF".
# The two preceding lines shall contain the keyword startxref and the byte offset
#       in the decoded stream from the beginning of the file to the beginning of
#       the xref keyword in the last cross-reference section.
# The startxref line shall be preceded by the trailer dictionary.
# 
# XREF STREAMS:
# value following startxref will be offset of xref stream instead of 'xref' keyword.
# 
# PREDICTOR VALUES:
# 1     No prediction (the default value)
# 2     TIFF Predictor 2
# 10    PNG prediction (on encoding, PNG None on all rows)
# 11    PNG prediction (on encoding, PNG Sub on all rows)
# 12    PNG prediction (on encoding, PNG Up on all rows)
# 13    PNG prediction (on encoding, PNG Average on all rows)
# 14    PNG prediction (on encoding, PNG Paeth on all rows)
# 15    PNG prediction (on encoding, PNG optimum)
# 
# NOTES:
# marked content sequences (14.6)
# interactive forms ()
# structure element dict (table 323)
# span as inline-level structure elements (14.8.4.4)
# 

