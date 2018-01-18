Public ws As Worksheet, data As Object, rx As Object, ie As Object, results As Object

Sub Init()
    Dim preData()
    Set ws = Sheets("DATA")
    Set data = CreateObject(Scripting.Dictionary)
    preData = Intersect(ws.UsedRange, ws.UsedRange.Offset(1)).Value2
    For i = LBound(preData) To UBound(preData)
        data.Add preData(i, 1), preData(i)
    Next i
    Set rx = New RegX
    Set ie = CreateObject("InternetExplorer.Application")
    Set results = CreateObject(Scripting.Dictionary)
    Main Sheets("PARTS").UsedRange.Value2
    ie.close
End Sub

Sub Main(ByRef parts() As Variant)
    For p = LBound(parts) To UBound(parts)
        If parts(p, 1) <> vbNullString And rx.Test(parts(p, 1)) Then
            ProcessPart(parts(p, 1))
        End If
    Next p
    If UBound(results, 1) > 0 Then
        ws.UsedRange.Offset(ws.UsedRange.Rows.Count).Resize(UBound(results)).Value2 = results
    End If
End Sub

Sub ProcessPart(ByVal pn As String)
    Dim partDict As Object, Dim job As Object, partDesc As String
    Set partDict = CreateObject("Scripting.Dictionary")
    ie.navigate "http://houston/ErpWeb/WorkOrdersForPart.aspx?PartNumber=" & pn
    Do While ie.Busy
        DoEvents ' Application.Wait DateAdd("s", 1, Now)
    Loop
    Dim rows As Object
    partDesc = ie.document.getElementById("Description").innerText
    Set rows = ie.document.getElementById("pageBody").getElementsByTagName("table")(1).getElementsByTagName("tr")
    ' Try For Each row in rows
    For r = 1 To rows.Length - 1
        Dim jobNum As String, dateOut As String
        jobNum = rows(r).ChildNodes(0).innerText
        If data.Exists(jobNum) Then
            results.Item(jobNum) = data.Item(jobNum)
        Else
            Set job = New Jobject(jobNum)
            partDict.Item(jobNum) = job.props
        End If
    Next r
End Sub

' Error Handling
' Dim retCode As Integer: retCode =
' If retCode > 1 Then
'         MsgBox "Error! (Hint: Check Security in IE Internet Options)"
'     Exit Sub
' End If
' partDateReleased = rows(r).ChildNodes(4).innerText

' JobProps = JobNum, DateOut, SO, Customer, Cert
' PartProps = PN, Description (Custom), Type, Size, PSI, Top Conn, Mandrel, Gasket

' SO = id=OrderReference
' Customer = id="OrderHeader_SoldToWeb" (eg:
    ' Continent Projects Technologies Pte Ltd
    ' 30 Shaw Road
    ' #04-06, 367957
    ' SINGAPORE
' )
' If possible, use IE to search page
' Plain Text SO for Cert at http://houston/ErpSalesWeb/SalesOrderPlain.aspx?Company=11&OrderNum=3000738
