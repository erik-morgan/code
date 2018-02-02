set js to "if(this.bookmarkRoot.children!=null){testing();}function testing(){var bmArray = [], bms = this.bookmarkRoot.children;"
set js to js & "for(i=0;i<bms.length;i++){bm=bms[i];kids=bm.children;if(kids==null){if(bm.name!=='TABLE OF CONTENTS'&&bm.name!=='INTRODUCTION'){bmArray.push(bm.name)}}"
set js to js & "else{for(j=0;j<kids.length;j++){(j==0)?bmArray.push(bm.name+' ['+kids[j].name+']'):bmArray.push(kids[j].name);}}}return bmArray.join('~');}"
tell application "Microsoft Excel" to set tocs to value of used range of worksheet "Sheet5"
set tocs to (first item of tocs)
set numTOC to (count of tocs)

repeat with x from 1 to numTOC
    log (x & "/" & numTOC)
    set doc to alias (item x of tocs)
    tell application "Adobe Acrobat Pro"
        open doc
        tell active doc
            set AppleScript's text item delimiters to "~"
            set bmList to text items of (do script (js as text))
            set AppleScript's text item delimiters to ""
        end tell
        close active doc without saving
    end tell
    my writeToExcel(bmList, x)
end repeat

on writeToExcel(bmList, num)
    repeat with z from 1 to (count of bmList)
        set item z of bmList to {item z of bmList}
    end repeat
    set startCell to (my numToLetters(num) & "1")
    set endCell to (my numToLetters(num) & (count of bmList))
    tell application "Microsoft Excel"
        tell worksheet "BOOKMARKS"
            set value of range (startCell & ":" & endCell) to bmList
        end tell
        save active workbook
    end tell
end writeToExcel

on numToLetters(colNum)
    set colName to {}
    set dividend to colNum
    repeat while dividend > 0
        set modulo to ((dividend - 1) mod 26)
        set end of colName to ASCII character (65 + modulo)
        set dividend to ((dividend - modulo) div 26)
    end repeat
    return reverse of colName as text
end numToLetters