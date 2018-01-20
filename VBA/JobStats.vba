' Make it a manual update
' I COULD just write a web page, consisting only of a table, and use JS to fill it,
' and have excel import table from my page
' 
' JobProps = JobNum, StartDate, EndDate, SO, Customer, Customer Ref, Cert
' PartProps = PN, Type, Size, PSI, Mandrel, Gasket
' ASK JOEL:    Full Lists of Mandrels and Gaskets
'              Are SDX Always 30" (Ref 2-606709-02)? Yes
'              Can H4 Be 30" (Ref 2-608267-03)? Yes
'              DX-1 Gasket vs DX (Ref 2-606646-02)? 
'              Is Gasket Either VX/VT OR DX (No Others)? Yes
' Test this:
'     Dim doc As New HTMLDocument, newdoc As New HTMLDocument
'     doc.createDocumentFromUrl(url, "null", newdoc)
'     doc.implementation.createDocument => returns XMLDocument!?
'     
'     XHR with responseXML...should work (use QueryInterface to convert returned pointer into IXMLDOMDocument)
'     XHR.status SHOULD work

Private ws As Worksheet
Private data As Object
Private jobs As Object
Private regexps As Object
Public Const specURL As String = "http://houston/ErpWeb/WorkOrdersForPart.aspx?PartNumber="
Public Const partURL As String = "http://houston/ErpWeb/PartDetails.aspx?PartNumber="
Public Const workURL As String = "http://houston/ErpWeb/WODetail.aspx?OrderNumber="
Public Const salesURL As String = "http://houston/ErpSalesWeb/SalesOrder.aspx?OrderNum="

Sub Init()
    Dim preData() As Variant
    Set ws = Sheets("DATA")
    Set data = CreateObject("Scripting.Dictionary")
    Set jobs = CreateObject("Scripting.Dictionary")
    preData = Intersect(ws.UsedRange, ws.UsedRange.Offset(1)).Value2
    For i As Integer = LBound(preData) To UBound(preData)
        data(preData(i, 1)), preData(i)
    Next i
    InitRegx
    Main
End Sub

Sub Main()
'   Back-up Plan: Output data to local file instead of worksheet
    Dim partNums()
    partNums = Application.WorksheetFunction.Transpose(Sheets("PARTS").UsedRange.Value2)
    For i As Integer = LBound(partNums) To UBound(partNums)
        If Right(partNums(i), 9) Like "######-##" Then
            ProcessPart partNums(i)
        End If
    Next i
    ProcessData
    Dim rows() As String = jobs.Items
    ws.Range("A2:M" & UBound(rows)).Value2 = rows
    MsgBox "Data Updated Successfully!"
End Sub

Sub ProcessPart(ByRef partNum)
'   JobStats Array = 0=JOB 1=PART 2=DBEG 3=DEND 4=SO 5=CUST 6=REF 7=TYPE 8=SIZE 9=PSI 10=MAN 11=GSKT 12=CERT
'   Back-up Plan: Let it do unnecessary processing overhead if timing isn't too bad
    Dim props(12) As String, doc As Object, matches As Object, desc As String, txt As String, workOrders() As String
    Set doc = DOM (0, partNum)
    props(1) = partNum
    desc = regx("DESC").Replace(doc.getElementById("Description").innerText, "$1$2")
    If InStr(desc, "DX-DW") Then
        props(7) = "DX-DW"
        props(9) = "15,000 PSI"
    Else
        Set matches = regx("PSI").Execute(desc)
        props(7) = "DX-" & matches(0)
        props(9) = matches(0) & ",000 PSI"
    End If
    props(8) = Left(desc, 5)
    txt = Switch(desc Like "16*", "25-3/4"" ", _
                 desc Like "*[/ ]30*", "30"" ", _
                 desc Like "*", "27"" ")
    Set matches = regx("MAN").Execute(desc)
    If matches.Count Then
        txt = txt & matches(0).SubMatches(0)
    Else
        Set matches = regx("H4").Execute(desc)
        txt = txt & IIf(matches.Count, matches(0), regx("DX").Execute(desc)(0).SubMatches(0))
    End If
    props(10) = txt
    'DX vs DX-1 Gaskets
    Set matches = regx("VX").Execute(desc)
    props(11) = IIf(matches.Count, matches(0), "DX")
    workOrders = Split(doc.getElementsByTagName("table")(3).innerText, Chr(255))
    For w As Integer = 1 To UBound(workOrders)
        txt = Split(workOrders(w), Asc(9), 2)(0)
        ProcessJob txt, props
    Next w
    doc = Nothing
    matches = Nothing
End Sub

Sub ProcessJob(ByRef jobNum, ByVal ParamArray job() As String)
'   Make sure that using ParamArray doesn't remove holes
    Dim doc As Object, tableText As String
    If data.Exists(jobNum) Then
'       Add this in so if error, it can reuse data
        jobs(jobNum) = data(jobNum)
    End If
    Set doc = DOM (2, jobNum)
    job(2) = doc.getElementById("StartDate").innerText
    tableText = Split(doc.getElementsByTagName("table")(4).innerText, "MFG-STK ", 2)(1)
    job(3) = Left(tableText, InStr(tableText, " ")-1)
    job(4) = doc.getElementById("OrderReference").innerText
    Set doc = DOM (3, job("SO"))
    job(5) = doc.getElementById("OrderHeader_SoldToWeb").FirstChild.innerText
    job(6) = doc.getElementById("OrderHeader_CustomerReference").textContent
    tableText = doc.getElementsByTagName("table")(4).innerText
    If regx("ABS").Test(tableText) Then
        job(12) = IIf(InStr(tableText, "DNV"), "ABS/DNV", "ABS")
    Else
        job(12) = IIf(InStr(tableText, "DNV"), "DNV", "N/A")
    End If
    jobs(jobNum) = job
    Set doc = Nothing
End Sub

Function DOM(ByRef urlnum As Integer, ByRef idnum As String)
    Dim url As String, http As Object, html As Object
    url = Switch(urlnum=0, specURL, urlnum=1, partURL, urlnum=2, workURL, urlnum=3, salesURL) & idnum
    Set http = CreateObject("MSXML2.XMLHTTP60") ' OR MSXML2.XMLHTTP.6.0
    For tries As Integer = 1 To 5
        http.Open "GET", url, False
        http.send
        If InStr(http.statusText, "OK") Then
            Set html = CreateObject("MSHTML.HTMLDocument")
            html.body.innerHTML = html
            Set DOM = html
            Exit For
        End If
    Next i
    http = Nothing
    html = Nothing
End Function

Sub InitRegx()
    Dim keys() As String = {"DESC", "PSI", "MAN", "H4", "DX", "VX", "ABS"}
    Dim patterns() As String = {"(.)""| ?([-/]) ?", _
                                "\b(10|1?5)(?=,000|K)\b", _
                                "(CAMERON HUB|RBC)[^,]+(?:DOWN|PROFILE|LATCH)", _
                                "\b(S?HD.?)?H-?4(.HD.?)?\b", _
                                "\b(S?DX)\b[^-,]+(LATCH|PROFILE)", _
                                "\b(VX(?:.VT)?)\b", _
                                "\bABS\b"}
    Set regexps = CreateObject("Scripting.Dictionary")
    For r As Integer = 0 To UBound(rxkeys)
        Dim rx As Object
        Set rx = CreateObject("VBScript.RegExp")
        rx.Global = True
        rx.Pattern = patterns(r)
        regexps(rxkeys(r)) = rx
    Next r
End Sub
