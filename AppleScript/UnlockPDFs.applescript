tell application "Finder"
    set root to alias ":Users:HD6904:Desktop:Digital SM Bank:"
    set fileList to (files of entire contents of root whose name extension is "pdf") as alias list
    repeat with thisFile in fileList
        set filePath to POSIX path of thisFile
        try
            do shell script "do shell script \"" & filePath & "\" input_pw wacKyworm output \"/Users/HD6904/Downloads/DigitalSMBank_Temp/" & (name of thisFile) & "\""
            set properties of alias (":Users:HD6904:Downloads:DigitalSMBank_Temp:" & (name of thisFile)) to properties of thisFile
            move alias (":Users:HD6904:Downloads:DigitalSMBank_Temp:" & (name of thisFile)) to (container of thisFile) with replacing
        on error
            set logFile to open for access (":Users:HD6904:Desktop:UnlockPDF_Failure_Log.txt" as alias) with write permission
            write ((filePath as text) & return) to logFile starting at eof
            close access logFile
        end try
    end repeat
end tell