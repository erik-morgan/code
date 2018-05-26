tell application "Microsoft Excel" to set folderList to value of used range of active sheet
set folderList to first item of folderList
set rowNum to 2

repeat with aFolderPath in folderList
    log aFolderPath
    set root to alias aFolderPath
    tell application "Finder"
        set fileList to (files of entire contents of root whose name extension is "pdf") as alias list
        repeat with aFile in fileList
            tell application "Adobe Acrobat Pro"
                open aFile
                set security to (do script "this.securityHandler")
                close active doc without saving
            end tell
            if security is not "null" then
                my addToList(POSIX path of aFile, rowNum)
                set rowNum to (rowNum + 1)
            end if
        end repeat
    end tell
end repeat

on addToList(filePath, rowNum)
    tell application "Microsoft Excel"
        tell worksheet "LOCKED"
            set value of cell ("A" & rowNum) to filePath
        end tell
    end tell
end addToList