' JobProps = JobNum, StartDate, EndDate, SO, Customer, Customer Ref, Cert
' PartProps = PN, Type, Size, PSI, Mandrel, Gasket
' Headers = JN, PN, SD, ED, SO, CUST, REF, CERT, DESC, TYP, SZ, PSI, MAN, GSKT

Private ws As Worksheet
Private parts As Object
Private jobs As Object
Public regx As Object
Public Const specURL As String = "http://houston/ErpWeb/WorkOrdersForPart.aspx?PartNumber="
Public Const partURL As String = "http://houston/ErpWeb/PartDetails.aspx?PartNumber="
Public Const workURL As String = "http://houston/ErpWeb/WODetail.aspx?OrderNumber="
Public Const salesURL As String = "http://houston/ErpSalesWeb/SalesOrder.aspx?OrderNum="

Sub Init()
    ' Consider adding back part where I get existing sheet?
    ' What if XHR fails? Don't overwrite job if I'm missing updated data
    Set ws = Sheets("DATA")
    Set parts = CreateObject("Scripting.Dictionary")
    Set jobs = CreateObject("Scripting.Dictionary")
    ' Check out Chrome Bookmark: Increasing RE Performance (Pre-Compiled RE Exprs)
    Set regx = CreateObject("VBScript.RegExp")
    regx.Global = True
    Main
End Sub

Sub Main()
    Dim partNums ', partNum As String
    partNums = Application.Transpose(Sheets("PARTS").UsedRange.Value2)
    For i As Integer = LBound(partNums) To UBound(partNums)
        If Right(partNums(i), 9) Like "######-##" Then
            AddPart partNums(i)
        End If
    Next i
    For p As Integer = 0 To parts.Count-1
        ' If I use parts.Keys, I might not need a "PART" key in AddPart
        ProcessPart parts.Items(p)
    Next part
    For j As Integer = 0 To jobs.Count-1
        ' If I use jobs.Keys, I might not need a "JOB" key in AddJob
        ProcessJob jobs.Items(j)
    Next part
    ' Put values back
End Sub

Sub ProcessPart(partDict)
    ' Do implicit objs go away w/o references? (Set genericObject = ReturnedIXMLDOMNodeList)
    Dim doc As Object, desc As String, matches As Object, table
    Set doc = DOM (0, partDict("PART"))
    table = Split(doc.getElementsByTagName("table")(3).innerText, Chr(255))
    For i As Integer = 1 To UBound(table)
        AddJob Left(table(i), InStr(table(i), Asc(9))-1), partDict("PART")
    Next i
    ' ASK JOEL:    DX-DW Always 30" Mandrel?
    '              Full Lists of Mandrels and Gaskets
    '              Are SDX Always 30" (Ref 2-606709-02)?
    '              Can H4 Be 30" (Ref 2-608267-03)?
    '              DX-1 Gasket vs DX (Ref 2-606646-02)?
    '              Is Gasket Either VX/VT OR DX (No Others) ?
    regx.Pattern = "(.)""| ?([-/]) ?"
    desc = regx.Replace(doc.getElementById("Description").innerText, "$1$2")
    If InStr(desc, "DX-DW") Then
        partDict("TYPE") = "DX-DW"
        partDict("PSI") = "15,000 PSI"
    Else
        regx.Pattern = "\b(10|1?5)(?=,000|K)\b"
        Set matches = regx.Execute(desc)(0)
        partDict("TYPE") = "DX-" & matches
        partDict("PSI") = matches & ",000 PSI"
    End If
    partDict("SIZE") = Left(desc, 5)
    partDict("MANSIZE") = Switch(desc Like "16*", "25-3/4""", desc Like "*[/ ]30*", "30""", desc Like "*", "27""")
    regx.Pattern = "(CAMERON HUB|RBC)[^,]+(?:DOWN|PROFILE|LATCH)"
    Set matches = regx.Execute(desc)
    If matches.Count Then
        partDict("MAN") = matches(0).SubMatches(0)
    Else
        regx.Pattern = "\b(S?HD.?)?H-?4(.HD.?)?\b"
        Set matches = regx.Execute(desc)
        If matches.Count Then
            partDict("MAN") = matches(0)
        Else
            regx.Pattern = "\b(S?DX)\b[^-,]+(LATCH|PROFILE)"
            partDict("MAN") = regx.Execute(desc)(0).SubMatches(0)
        End If
    End If
    regx.Pattern = "\b(VX(?:.VT)?)\b"
    Set matches = regx.Execute(desc)
    partDict("GSKT") = IIf(matches.Count, matches(0), "DX")
    ' Lastly, get jobs and add to joblist with their properties
    ' Use Switch function to handle jobCerts
End Sub

Sub AddPart(pn As String)
    Dim dict As Object, props() As String = {"TYPE", "SIZE", "PSI", "CONN", "MAN", "MANSIZE", "GSKT"}
    Set dict = CreateObject("Scripting.Dictionary")
    ' Might not be necessary...
    dict("PART") = pn
    For n As Integer = 1 To UBound(props)
        dict(props(n)) = ""
    Next n
    parts(pn) = dict
    ' Test This:
    dict = Nothing
End Sub

Sub AddJob(jn As String, pn As String)
    Dim dict As Object, props() As String = {"DBEG", "DEND", "SO", "CUST", "REF", "CERT"}
    Set dict = CreateObject("Scripting.Dictionary")
    ' Might not be necessary...
    dict("JOB") = jn
    ' Definitely might not be necessary...
    dict("PART") = pn
    For n As Integer = 1 To UBound(props)
        dict(props(n)) = ""
    Next n
    jobs(jn) = dict
    ' Test This:
    dict = Nothing
End Sub

Function DOM(urlnum As Integer, idnum As String)
    Dim url As String, http As Object, html As Object
    url = Switch(urlnum=0, specURL, urlnum=1, partURL, urlnum=2, workURL, urlnum=3, salesURL) & idnum
    Set http = CreateObject("MSXML2.XMLHTTP60") ' OR MSXML2.XMLHTTP.6.0
    http.Open "GET", url, False
    http.send
    Set html = CreateObject("MSHTML.HTMLDocument")
    html.body.innerHTML = html
    Set DOM = html
    http = Nothing
    html = Nothing
End Function

' AndAlso/OrElse = Short-Circuit Logical Operators
' HTML Tags Needing To Be Closed: meta, input, br, col, hr, img, link
