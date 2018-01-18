' Member variable
' Private dBalance As Double
' Properties
' Property Get Balance() As Double
'     Balance = dBalance
' End Property
' Property Let Balance(dValue As Double)
'     dBalance = dValue
' End Property
' Event - triggered when class created
' Private Sub Class_Initialize()
'     dBalance = 100
' End Sub
' Methods
' Public Sub Withdraw(dAmount As Double)
'     dBalance = dBalance - dAmount
' End Sub
' Public Sub Deposit(dAmount As Double)
'     dBalance = dBalance + dAmount
' End Sub
'JobProps = JobNum, StartDate, EndDate, SO, Customer, Cert
'PartProps = PN, Description (Custom), Type, Size, PSI, Top Conn, Mandrel, Gasket
' Check out ie.navigatecomplete event
Private jprops(14) As String, filledProps As Boolean, loaded As Boolean
Private regx As Object, nodes As Object

Private Sub Class_Initialize(Optional ByRef jobData)
    jprops(1) = jobData
    filledProps = False
    Set browser = CreateObject("InternetExplorer.Application")
    Set regx = CreateObject("VBScript.RegExp")
    regx.Global = True
    regx.MultiLine = False
End Sub

Property Get props(ByRef jobData() As Variant) As String()
    If Not filledProps Then
        GetProps
    End If
    props = jprops
End Sub

Private Sub GetProps()
    AddWO
    AddSO
    filledProps = True
End Sub

Private Sub AddWO()
    loaded = False
    ie.navigate "http://houston/ErpWeb/WODetail.aspx?OrderNumber=" & jid
    ' WaitForIE
    jprops(2) = ie.document.getElementById("StartDate").innerText
    ' Try IHTMLElement Object
    ' jprops(3) = Split(doc.getElementsByTagName("tbody")(4).getElementsByTagName("td").ChildNodes(1).innerText, " ")(0)
    ' jprops(4) = doc.getElementById("OrderReference").innerText
    ' jprops(3) = Split(doc.tags("tbody").Item(4).tags("td").Item(1).ChildNodes(1).innerText, " ")(0)
    Set nodes = ie.document.Item("tbody").Item(4).tags("tr")
    For Each node in nodes
        ' Try element.Children
        If node.Children(0).innerText = "MFG-STK" Then
            jprops(3) = Split(node.Children(1).innerText, " ")(0)
            Exit For
        End If
    Next node
    ' Try queryselector
    ' jprops(4) = ie.document.Item("OrderReference").innerText
    jprops(4) = ie.document.querySelector("#OrderReference").innerText
End Sub

Private Sub AddWOALT()
    Dim response As DOMDocument60, http As XMLHTTP60, node As String ' XMLDOMNode, nodes As IXMLDOMNodeList
    Set http = New XMLHTTP60
    http.Open "GET", "http://houston/ErpWeb/WODetail.aspx?OrderNumber=" & jid, False
    http.send
    Set response = http.responseXML
    jprops(2) = response.SelectSingleNode("//*[@id='StartDate']/text()")
    Set node = response.SelectSingleNode("//tbody[5]//td//*[contains(., 'MFG-STK')]/following-sibling/text()")
    Debug.Print node
    jprops(3) = Split(node, " ")(0)
    jprops(4) = response.SelectSingleNode("//*[@id='OrderReference']/text()")
End Sub

Private Sub AddWOJS()
    Dim js As String
    js = "document.body.setAttribute('JSResult1', document.getElementById('StartDate').innerText);" _
        & vbNewLine & "var dend = '', i = 0, rows = document.getElementByTagName('tbody')[4].getElementByTagName('tr');" _
        & vbNewLine & "while (dend == ''){ if (rows[i].children[0].innerText == 'MFG-STK') dend = rows[i].children[1].innerText; i++; }" _
        & vbNewLine & "document.body.setAttribute('JSResult2', dend); " _
        & vbNewLine & "document.body.setAttribute('JSResult3', document.getElementById('OrderReference').innerText);"
    ie.document.parentWindow.execScript(js, "javascript")
    jprops(2) =  ie.Document.body.getAttribute.("JSResult1")
    jprops(3) =  ie.Document.body.getAttribute.("JSResult2")
    jprops(4) =  ie.Document.body.getAttribute.("JSResult3")
End Sub

Private Sub AddSO()
    ie.navigate "http://houston/ErpSalesWeb/SalesOrder.aspx?OrderNum=" & jid
    WaitForIE
    jprops(5) = ie.document.getElementById("OrderHeader_SoldToWeb").Children(0).innerText
    Set rows = ie.document.getElementById("parentObj").getElementsByTagName("tr")
End Sub

Private Sub WaitForIE()
    ' Test readystate to see if it is 4 or READYSTATE_COMPLETE
    ' Try If ie.readyState = 4 And ie.Status = 200 Then proceed
    Debug.Print ie.ReadyState
    Do While ie.Busy
        DoEvents
    Loop
End Sub

Private Sub browser_DocumentComplete(ByVal pDisp As Object, ByVal URL As Variant)
    loaded = True
End Sub

' Set patterns = CreateObject(Scripting.Dictionary)
' patterns.Item(1) = "^[-A-Z0-9]{6,}$"
' Set regx = CreateObject("VBScript.RegExp")
' regx.Global = True
' regx.MultiLine = False
