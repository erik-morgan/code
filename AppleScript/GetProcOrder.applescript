tell application "Adobe Acrobat Pro"
    tell active doc to set bmCount to count of bookmarks
    set doc to file alias of active doc
    set procs to {}
    repeat with i from 3 to bmCount
        set bm to item i of bookmarks
        tell active doc to perform bm
        if (get name of active doc) is not "BIGTOC.pdf" then
            if (count of procs) is 0 or (get name of active doc) is not (first item of (last item of procs)) then
                set end of procs to {(get name of active doc)}
            end if
        end if
        close active doc
        open doc
    end repeat
    my addToXL(procs)
end tell

on addToXL(procList)
    tell application "Microsoft Excel"
        set startRange to active cell
        set endRange to (get offset of startRange row offset ((count of procList) - 1))
        set value of range ((get address startRange) & ":" & (get address endRange)) to procList
    end tell
end addToXL