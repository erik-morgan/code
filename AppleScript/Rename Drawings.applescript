tell application "Microsoft Excel"
    tell active sheet
        repeat with i from 70 to 177
            set varOld to value of cell ("E" & i)
            set varNew to value of cell ("G" & i)
            if varOld is not equal to varNew then
                tell application "Finder" to set name of alias ((path to desktop as text) & "Drawings:~2-:" & varOld) to varNew
            end if
        end repeat
    end tell
end tell

(*
tell application "Microsoft Excel"
    tell active sheet
        tell used range to set rowCount to count of rows
        repeat with i from 1627 to rowCount
            set oldName to value of cell ("E" & i)
            set newName to value of cell ("G" & i)
            log (characters 1 thru 2 of oldName) as string
            if (characters 1 thru 2 of oldName) as string is "2-" then
                set dwg to ((path to desktop as text) & "Drawings:~2-:" & oldName)
            else if (characters 1 thru 2 of oldName) as string is "4-" then
                set dwg to ((path to desktop as text) & "Drawings:~4-:" & oldName)
            else if (characters 1 thru 2 of oldName) as string is "6-" then
                set dwg to ((path to desktop as text) & "Drawings:~6-:" & oldName)
            else
                set dwg to ((path to desktop as text) & "Drawings:~International:" & oldName)
            end if
            tell application "Finder" to set name of alias dwg to newName
        end repeat
    end tell
end tell
*)