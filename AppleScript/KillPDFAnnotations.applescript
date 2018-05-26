set filePaths to {}

tell application "Microsoft Excel"
    tell active sheet
        set usedCols to count of columns of used range
        repeat with i from 1 to usedCols
            log "CURRENT COL = " & i
            set usedRows to count of rows of used range
            repeat with j from 1 to usedRows
                set thisCell to cell (my numToLetters(i) & j)
                set thisValue to value of thisCell
                if (count of (thisValue as text)) > 1 then
                    set end of filePaths to thisValue
                end if
            end repeat
        end repeat
    end tell
end tell

log "Entering Loop..."

repeat with thisPath in filePaths
    log thisPath
    set doc to alias thisPath
    tell application "Adobe Acrobat Pro"
        open doc
        tell active doc
            repeat with x from 1 to (count of pages)
                tell page x to delete annotations
            end repeat
        end tell
        close active doc with saving
    end tell
end repeat

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