tell application "Finder"
    set folderList to (folders of entire contents of (alias "/Users/ErikML/Public/PMFix"))
    repeat with aFolder in folderList
        set fileList to (files of entire contents of aFolder whose name does not start with ".") as alias list
        repeat with aFile in fileList
            set fileName to name of aFile
            if (characters -3 thru -1 of fileName) as string is not "p65" then
                set name of aFile to (fileName & ".p65")
            end if
        end repeat
    end repeat
end tell