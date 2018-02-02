set folderList to {"SS10", "SS30", "SS40", "SS50", "SS60", "SS70-", "SW", "WOC"}

repeat with x from 1 to count of folderList
    tell application "Finder"
        set aFolder to alias ("HD4717:Users:ErikML:Public:Final PageMaker Folder:" & (item x of folderList) & ":")
        set logText to ""
        set fileList to (files of entire contents of aFolder whose name extension is "p65") as alias list
        repeat with aFile in fileList
            set logText to logText & (name of aFile) & return
            try
                tell application "Adobe® PageMaker® 6.5"
                    «event misceval» ("Open \"" & (aFile as text) & "\"")
                    set fileLinks to «event misceval» ("GetLinks")
                    «event misceval» ("Close")
                end tell
                --on error
                --    make file at aFolder with properties {name:((name of aFolder) & ".txt")}
                --    set logFile to open for access (((aFolder as text) & (name of aFolder) & ".txt") as alias) with write permission
                --    write logText to logFile starting at eof
                --    close access logFile
            end try
            set logText to logText & fileLinks & return
        end repeat
        make file at aFolder with properties {name:((name of aFolder) & ".txt")}
        set logFile to open for access (((aFolder as text) & (name of aFolder) & ".txt") as alias) with write permission
        write logText to logFile starting at eof
        close access logFile
    end tell
end repeat
