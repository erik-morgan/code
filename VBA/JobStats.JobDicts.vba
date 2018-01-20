' JobProps = JobNum, StartDate, EndDate, SO, Customer, Customer Ref, Cert
' PartProps = PN, Type, Size, PSI, Mandrel, Gasket
' ASK JOEL:    Full Lists of Mandrels and Gaskets
'              Are SDX Always 30" (Ref 2-606709-02)? Yes
'              Can H4 Be 30" (Ref 2-608267-03)? Yes
'              DX-1 Gasket vs DX (Ref 2-606646-02)? 
'              Is Gasket Either VX/VT OR DX (No Others)? Yes

Private ws As Worksheet
Private data As Object
Private parts As Object
Private jobs As Object
Private regexCache As Object
Public Const specURL As String = "http://houston/ErpWeb/WorkOrdersForPart.aspx?PartNumber="
Public Const partURL As String = "http://houston/ErpWeb/PartDetails.aspx?PartNumber="
Public Const workURL As String = "http://houston/ErpWeb/WODetail.aspx?OrderNumber="
Public Const salesURL As String = "http://houston/ErpSalesWeb/SalesOrder.aspx?OrderNum="

Sub Init()
    ' What if XHR fails? Don't overwrite job if I'm missing updated data
    Dim preData
    Set ws = Sheets("DATA")
    Set parts = CreateObject("Scripting.Dictionary")
    Set jobs = CreateObject("Scripting.Dictionary")
    Set data = CreateObject(Scripting.Dictionary)
    preData = Intersect(ws.UsedRange, ws.UsedRange.Offset(1)).Value2
    For i As Integer = LBound(preData) To UBound(preData)
        data(preData(i, 1)), preData(i)
    Next i
    Set regexCache = CreateObject("Scripting.Dictionary")
    Main
End Sub

Sub Main()
    Dim partNums, retcode As Integer
    partNums = Application.Transpose(Sheets("PARTS").UsedRange.Value2)
    For i As Integer = LBound(partNums) To UBound(partNums)
        If Right(partNums(i), 9) Like "######-##" Then
            AddPart partNums(i)
        End If
    Next i
    For Each part As Variant In parts.Keys
        retcode = ProcessPart (part)
        If retcode = 1 Then
            MsgBox "Error retrieving part information"
            Exit Sub
        End If
    Next part
    For Each job As Variant In jobs.Keys
        retcode = ProcessJob (job)
        If retcode = 1 Then
            jobs(job)("STATUS") = "FAIL"
            If Not data.Exists(job) Then
                MsgBox "Problem getting job data for " & job
                Exit Sub
            End If
        Else
            jobs(job)("STATUS") = "OK"
        End If
    Next job
    ' Consider keeping jobs next to parts
    ' Make it a manual update
    ProcessData
End Sub

Function ProcessPart(partNum) As Integer
    Dim partDict As Object, doc As Object, matches As Object, table() As String, desc As String
    Set partDict = parts(partNum)
    Set doc = DOM (0, partNum)
    table = Split(doc.getElementsByTagName("table")(3).innerText, Chr(255))
    For i As Integer = 1 To UBound(table)
        AddJob Left(table(i), InStr(table(i), Asc(9))-1), partNum
    Next i
    desc = regx("(.)""| ?([-/]) ?").Replace(doc.getElementById("Description").innerText, "$1$2")
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
    ' What about part where only assy dwg mentions gasket?
    partDict("GSKT") = IIf(matches.Count, matches(0), "DX")
    partDict = Nothing
    doc = Nothing
    matches = Nothing
End Function

Function ProcessJob(jobNum) As Integer
    Dim jobDict As Object, doc As Object, table
    Set jobDict = jobs(jobNum)
    Set doc = DOM (2, jobNum)
    jobDict("DBEG") = doc.getElementById("StartDate").innerText
    table = Split(doc.getElementsByTagName("table")(4).innerText, "MFG-STK ")
    jobDict("DEND") = Left(table(1), InStr(table(1), " ")-1)
    jobDict("SO") = doc.getElementById("OrderReference").innerText
    Set doc = DOM (3, jobDict("SO"))
    jobDict("CUST") = doc.getElementById("OrderHeader_SoldToWeb").FirstChild.innerText
    jobDict("REF") = doc.getElementById("OrderHeader_CustomerReference").textContent
    table = doc.getElementsByTagName("table")(4).innerText
    regx.Pattern = "\bABS\b"
    If regx.Test(table) Then
        jobDict("CERT") = IIf(InStr(table, "DNV"), "ABS/DNV", "ABS")
    Else
        jobDict("CERT") = IIf(InStr(table, "DNV"), "DNV", "N/A")
    End If
    Set jobDict = Nothing
    Set doc = Nothing
End Function

Sub ProcessData()
    Dim rows(jobs.Count-1, 12) As Variant, job As Object, part As Object, r As Integer
    r = 0
    For Each jkey As Variant In jobs.Keys
        Set job = jobs(jkey)
        If job("STATUS") = "FAIL" Then
            Set job = data(jkey)
            rows(r, 1) = job(1)
            rows(r, 2) = job(2)
            rows(r, 3) = job(3)
            rows(r, 4) = job(4)
            rows(r, 5) = job(5)
            rows(r, 6) = job(6)
            rows(r, 12) = job(12)
        Else
            rows(r, 1) = job("PART")
            rows(r, 2) = job("DBEG")
            rows(r, 3) = job("DEND")
            rows(r, 4) = job("SO")
            rows(r, 5) = job("CUST")
            rows(r, 6) = job("REF")
            rows(r, 12) = job("CERT")
        Set part = parts(job("PART"))
        rows(r, 0) = jkey
        rows(r, 7) = part("TYPE")
        rows(r, 8) = part("SIZE")
        rows(r, 9) = part("PSI")
        rows(r, 10) = part("MANSIZE") & " " & part("MAN")
        rows(r, 11) = part("GSKT")
    Next jkey
    ws.Range("A2:M" & UBound(rows)).Value2 = rows
    MsgBox "Data Updated Successfully!"
End Sub

Sub AddPart(pn As String)
    Dim dict As Object, props() As String = {"TYPE", "SIZE", "PSI", "MAN", "MANSIZE", "GSKT"}
    Set dict = CreateObject("Scripting.Dictionary")
    For n As Integer = 1 To UBound(props)
        dict(props(n)) = ""
    Next n
    parts(pn) = dict
    ' Test This:
    dict = Nothing
End Sub

Sub AddJob(jn As String, pn As String)
    Dim dict As Object, props() As String = {"DBEG", "DEND", "SO", "CUST", "REF", "CERT", "STATUS"}
    Set dict = CreateObject("Scripting.Dictionary")
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

Function regx(rx As String)
    Dim rxKey As String
    If Not regexCache.Exists(rx) Then
        Dim regExp As Object
        Set regExp = CreateObject("VBScript.RegExp")
        regExp.Global = True
        regExp.Pattern = Pattern
        Set regexCache(rx) = regExp
    End If
    Set regx = regexCache(rx)
End Function
