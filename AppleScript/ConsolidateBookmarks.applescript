set rowCount to 0

tell application "Microsoft Excel"
    tell worksheet "BOOKMARKS"
        set usedCols to count of columns of used range
        repeat with i from 1 to usedCols
            set numRows to my colCellCount(i, "BOOKMARKS")
            set pathList to value of range ((get address of (cell 1 of column i)) & ":" & (get address of (cell numRows of column i)))
            set newRange to range ("B" & (rowCount + 1) & ":B" & (rowCount + (count of pathList))) of worksheet "Sheet14"
            set value of newRange to pathList
            set rowCount to (rowCount + numRows)
        end repeat
    end tell
end tell

on colCellCount(colNum, ws)
    tell application "Microsoft Excel"
        tell worksheet ws
            return first row index of (get end (last cell of column colNum) direction toward the top)
        end tell
    end tell
end colCellCount