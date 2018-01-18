' JobProps = JobNum, StartDate, EndDate, SO, Customer, Customer Ref, Cert
' PartProps = PN, Description (Custom), Type, Size, PSI, Top Conn, Mandrel, Gasket

' VBA RegEx Methods: Test, Replace, Execute
' Execute returns collection of Match objects;
' Match Properties: Count, Item, FirstIndex (First char = 0), Length, Submatches, Value (RegEx.Value Equivalent to RegEx)
' Submatch only has Count and Item; No match for group means submatch value is zero-length string

Private partProps(7) As String, jobs As Object, regx As Object, nodes As Object, partDesc As String

Private Sub Part_Initialize(ByRef pn As String)
    partProps(0) = pn
    Set jobs = CreateObject("Scripting.Dictionary")
    Set regx = CreateObject("VBScript.RegExp")
    GetJobs
    If jobs.Count > 0 Then
        ParseDesc
        For Each job In jobs.Keys()
            ProcessJobs job
        Next job
    End If
End Sub

Private Sub GetJobs()
    ie.navigate "http://houston/ErpWeb/WorkOrdersForPart.aspx?PartNumber=" & partProps(0)
    WaitIE
    partDesc = ie.document.getElementById("Description").innerText
    Set nodes = IESelect ("#pageBody table 1 tr", ie.document)
    For r = 1 To rows.Length - 1
        Dim jobProps(6) As String
        jobNum = rows(r).FirstChild.innerText
        If data.Exists(jobNum) Then
            results.Item(jobNum) = data.Item(jobNum)
        Else
            jobProps(0) = jobNum
            jobs.Item(jobNum) = jobProps
        End If
    Next r
End Sub

Private Sub ProcessJobs(jn As String, jprops() As String)
    Dim js As String
    ie.navigate "http://houston/ErpWeb/WODetail.aspx?OrderNumber=" & jn
    WaitIE
    jprops(1) = ie.document.getElementById("StartDate").innerText
    Set nodes = IESelect ("tbody 4 tr", ie.document)
    For n = 0 To nodes.Count - 1
        If nodes(n).FirstChild.innerText = "MFG-STK" Then
            jprops(3) = Split(node.Children(1).innerText, " ")(0)
            Exit For
        End If
    Next n
    ie.navigate "http://houston/ErpSalesWeb/SalesOrder.aspx?OrderNum=" & jid
    WaitIE
    'jprops(4) = ie.document.getElementById("OrderHeader_SoldToWeb").FirstChild.innerText
    jprops(4) = Split(ie.document.getElementById("OrderHeader_SoldToWeb").innerHTML, "<br>")(0)
    jprops(5) = ie.document.getElementById("OrderHeader_CustomerReference").innerText
    js =
    Set nodes = ie.document.all.tags("tbody")(4).getElementsByClassName("rowData")(0)
    For row =
    html = ie.document.toString()
    regx.Pattern = "\bABS\b.+\bDNV\b|\bDNV\b.+\bABS\b"
    If regx.Test(html) Then
        jprops(6) = "ABS/DNV"
    Else
        regx.Pattern = "\b(ABS|DNV)\b"
        Set match = regx.Execute(html)
        jprops(6) = "ABS/DNV"


    ' USE SWITCH/CASE OR REPT
    cert = IIf(match, "ABS", "") & IIf(regx.Test(ie.document.toString()), IIf(ma
    cert = IIf(matches(0) And matches(1), "ABS/DNV", IIf(matches(0)
    If (matches(0) And matches(1) Or (Len(matches(1)) And Len(matches(2))) Then
        cert = "ABS/DNV"
    ElseIf Len(matches(0)) Or Len(matches(2)) Then
        cert = "ABS"
    Else
        cert = "DNV"
    If matches(1) <> "" Then
        jprops(6) = "None"
    ElseIf matches.SubMatches


End Sub

Private Function IESelect(ByVal sel As String, ByRef doc) As Variant
    Dim steps() As String, exp As String, node As Object, index As Integer, asText As Boolean
    asText = False
    'Set node = doc.getElementsByTagName("body")(0)
    Set node = doc.all.tags("body")
    steps = Split(sel, " ")
    For i = LBound(steps) To UBound(steps) - 1
        exp = steps(i)
        If exp Like "#*" Then
            Set node = node.all.Item(Right(exp, Len(exp) - 1))
        ElseIf exp Like "#" Or exp Like "##" Then
            Set node = node(Val(exp))
        ElseIf exp Like "Text()" Then
            asText = True
            Exit For
        ElseIf exp Like "[a-z][a-z]*" Then
            Set node = node.all.tags(Replace(exp, item, ""))
        End If
    Next i
    IESelect = IIf(asText, node.innerText, node)
End Function

Private Sub WaitIE()
    Do While ie.Busy
        DoEvents
    Loop
End Sub


