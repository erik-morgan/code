set regx to "(?<=RevisionNum\">)(.{1,2})(?=</span>)"
set cmd to "security unlock-keychain -p '' ~/Library/Keychains/login.keychain; security find-internet-password -w usportal ~/Library/Keychains/login.keychain"
set pass to do shell script cmd
set login to "morganel:" & pass

tell application "Microsoft Excel"
    tell used range of active sheet to set drawURLS to value of cell ("E1:E" & (count of rows))
    tell used range of active sheet to set specURLS to value of cell ("G1:G" & (count of rows))
end tell

set drawRevs to {}
set specRevs to {}

repeat with i from 1 to (length of drawURLS)
    if (length of item i of drawURLS) is greater than 50 then
        set cmd to "curl --anyauth -u " & login & " " & (item i of drawURLS)
        set drawSource to do shell script cmd
        try
            set drawRev to find text regx in drawSource with regexp
            if (matchResult of drawRev) is "NR" then
                copy "NC" to end of drawRevs
            else
                copy (matchResult of drawRev) to end of drawRevs
            end if
        on error
            log ("ERROR ON " & i)
            --log ("!!!item " & i & " of drawURLS: " & drawURLS & "\n!!!drawSource: " & drawSource & "\n!!!regx: " & regx)
            copy "ERR" to end of drawRevs
        end try
    else
        copy "-" to end of drawRevs
    end if
    set cmd to "curl --anyauth -u " & login & " " & (item i of specURLS)
    set specSource to do shell script cmd
    try
        set specRev to find text regx in specSource with regexp
        if (matchResult of specRev) is "NR" then
            copy "NC" to end of specRevs
        else
            copy (matchResult of specRev) to end of specRevs
        end if
    on error
        log ("ERROR ON " & i)
        --log ("!!!item " & i & " of drawURLS: " & drawURLS & "\n!!!drawSource: " & drawSource & "\n!!!regx: " & regx)
        copy "ERR" to end of drawRevs
    end try
end repeat

tell application "Microsoft Excel"
    tell sheet "Sheet2"
        repeat with j from 1 to (length of drawRevs)
            set value of cell ("A" & j) to (item j of drawRevs)
            set value of cell ("B" & j) to ("=Sheet1!B" & j)
            set value of cell ("C" & j) to (item j of specRevs)
        end repeat
    end tell
end tell

tell application "Microsoft Excel"
    repeat with k from 1 to (length of specRevs)
        tell sheet "Sheet1" to set specOld to value of cell ("C" & k)
        tell sheet "Sheet2" to set specNew to value of cell ("C" & k)
        if (last character in specNew) > (last character in specOld) then
            set downLink to ("http://houston/ErpWeb/Part/PartDocumentReader.aspx?partnumber=" & (value of cell ("B" & k)) & "&checkInProcess=1")
            tell application "Google Chrome" to open location downLink
        end if
    end repeat
end tell