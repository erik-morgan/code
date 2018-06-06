Option Explicit
On Error Resume Next

Set app = GetObject("", "InDesign.Application")

If WScript.Arguments.Count = 1 Then
    app.DoScript(WScript.Arguments(0), 1246973031)
Else
    Set jsx = CreateObject("Scripting.FileSystemObject").GetFile(WScript.Arguments(0))
    app.DoScript(jsx, 1246973031, WScript.Arguments(1))
End If
