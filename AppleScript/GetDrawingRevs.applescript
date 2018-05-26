set dq to "http://houston/ErpWeb/PartDetails.aspx?PartNumber="

tell application "Microsoft Excel"
    tell worksheet "Sheet2" of active workbook
        repeat with x from 6 to 1692
            set revDwg to "A" & x
            set dwg to "B" & x
            set revPL to "C" & x
            set webPage to dq & value of cell dwg
            set value of cell revDwg to my getDwgRev(webPage, value of cell dwg)
            set value of cell revPL to my getPLRev(webPage)
        end repeat
    end tell
end tell

to getDwgRev(webPage, dwgNum)
    tell application "Safari"
        set URL of document 1 to webPage
        set isLoaded to false
        repeat while isLoaded is false
            set readyState to (do JavaScript "document.readyState" in document 1)
            set pageText to text of document 1
            if (readyState is "complete") and (pageText contains "Part Details: " & dwgNum) then
                set isLoaded to true
            end if
            delay 0.5
        end repeat
        set dRev to do JavaScript "document.getElementById('DrawingInfo').innerHTML" in document 1
    end tell
    return my trimDrawingInfo(dRev)
end getDwgRev

to getPLRev(webPage)
    tell application "Safari"
        set plRev to do JavaScript "document.getElementById('RevisionNum').innerHTML" in document 1
    end tell
    return plRev
end getPLRev

on trimDrawingInfo(txt)
    set AppleScript's text item delimiters to characters of "01234567890-."
    set TIs to text items of txt
    set AppleScript's text item delimiters to ""
    set txt to TIs as string
    return txt
end trimDrawingInfo