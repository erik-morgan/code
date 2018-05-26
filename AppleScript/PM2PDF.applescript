tell application "Finder"
    set root to alias "HD4717:Users:ErikML:Public:Missing PDFs:"
    set fileList to (files of entire contents of root whose name extension is "p65") as alias list
    repeat with aFile in fileList
        set psName to characters 1 thru -5 of (name of aFile as text) as string
        tell application "Adobe¨ PageMaker¨ 6.5"
            evaluate ("Open \"" & (aFile as text) & "\"")
            evaluate ("printdoc 1, 0, 0, 0, \"\", 0, 0, 0, 0, 0, -2, 0, 0")
            evaluate ("printto \"Acrobat Distiller (PPD)\", \"\"")
            evaluate ("printoptions 1, -2, 0, 0, 0, 0")
            evaluate ("printoptionsps 3, 0, 0, 1, 1, 1, 1, 1, 0, 0")
            evaluate ("print -2, -2, -2, \"" & psName & ".ps\"")
            evaluate ("Close")
        end tell
    end repeat
end tell

on logError(fileName, errorMessage, errorNumber)
    set theFile to "HD4717:Users:ErikML:Public:Missing PDFs:PM2PDF_LOG.TXT"
    set logFile to open for access file theFile with write permission
    set logText to fileName & " (" & errorNumber & ": " & errorMessage & ")" & return
    write logText to logFile starting at eof
    close access logFile
end logError