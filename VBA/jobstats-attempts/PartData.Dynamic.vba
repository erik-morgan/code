Public ws As Worksheet, data As Object, rx As Object, ie As Object, results As Object

Sub Init()
    Dim preData()
    Set ws = Sheets("DATA")
    Set data = CreateObject("Scripting.Dictionary")
    Set ie = CreateObject("InternetExplorer.Application")
    preData = Intersect(ws.UsedRange, ws.UsedRange.Offset(1)).Value2
    For i = LBound(preData) To UBound(preData)
        data.Add preData(i, 1), preData(i)
    Next i
    Set rx = New RegX
    Set results = CreateObject("Scripting.Dictionary")
    Main Sheets("PARTS").UsedRange.Value2
    ' ie.close
End Sub

Sub Main()
    Dim jobs(), partNums(), part As Object, job As Object, parts As Object, partDict
    Set parts = CreateObject("Scripting.Dictionary")
    For p = LBound(partNums) To UBound(partNums)
        If partNums(p, 1) <> vbNullString And rx.Test(partNums(p, 1)) Then
            part = New Part(partNums(p, 1))
            partDict(partNums(p, 1)) = part
        End If
    Next p
    ' If UBound(results, 1) > 0 Then
    '     ws.UsedRange.Offset(ws.UsedRange.Rows.Count).Resize(UBound(results)).Value2 = results
    ' End If
End Sub

' Error Handling
' Dim retCode As Integer: retCode =
' If retCode > 1 Then
'         MsgBox "Error! (Hint: Check Security in IE Internet Options)"
'     Exit Sub
' End If
' partDateReleased = rows(r).ChildNodes(4).innerText

' JobProps = JobNum, DateBeg, DateEnd, SO, Customer, Cert
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
