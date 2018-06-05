Option Explicit
' On Error Resume Next

Set app = GetObject("", "InDesign.Application")

If WScript.Arguments.Count = 1 Then
    app.DoScript(WScript.Arguments(0), 1246973031)
Else
    Dim scriptArgs = Array(WScript.Arguments.Count - 2)
    For i = 0 To WScript.Arguments.Count - 2
      scriptArgs(i) = WScript.Arguments(i + 1)
    Next
    Set jsx = CreateObject("Scripting.FileSystemObject").GetFile(WScript.Arguments(0))
    app.DoScript(jsx, 1246973031, scriptArgs)
End If
