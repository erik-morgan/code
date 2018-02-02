(*
tell application "System Events" to set docList2 to (get the name of every file of (every folder of (alias "HD6904:Users:HD6904:Desktop:Drawings:Assembly Drawings:")) whose name does not start with ".")
set docList to paragraphs of (do shell script ("ls -1ApR " & quoted form of "/Users/HD6904/Desktop/Drawings/Assembly Drawings"))
tell application "Finder" to set drawFolder to (folder "Assembly Drawings" of folder "Drawings" of desktop)
set drawFolder to ("HD6904:Users:HD6904:Desktop:Drawings:Assembly Drawings:")
tell application "System Events"
set docList to (get every file of (every folder of drawFolder) whose name does not start with ".")
end tell
tell application "Finder"
    set docList to get every file of (every folder of (alias "HD6904:Users:HD6904:Desktop:Drawings:Assembly Drawings:"))
end tell
--tell application "System Events"
--set docList to (get every file of (every folder of (alias "HD6904:Users:HD6904:Desktop:Drawings:Assembly Drawings:")) as alias list)
--end tell

tell application "Adobe Acrobat Pro"
    open testDoc
    set info active doc key "Test" value "123"
    --tell testDoc to set info key "DrawingRevision" value "G" --}, {"SpecSheetRevision", "F"})
    --close testDoc
end tell

set docList to paragraphs of (do shell script ("ls -Ap " & quoted form of "/Users/HD6904/Desktop/Drawings/Assembly Drawings"))
log (length of docList)
log (contents of item 1 of docList)
error -28

tell application "Finder"
    set root to (POSIX file "/Users/HD6904/Desktop/Drawings/Assembly Drawings/") as alias
    set dirList to (every folder of root) as alias list
    log (length of dirList)
    repeat with dir in dirList
        set docList to (every file in dir whose name does not start with ".") as alias list
        log (length of docList)
        repeat with doc in docList
            set revs to my getRevs(doc)
            tell application "Adobe Acrobat Pro"
                open doc
                if (length of revs) is 1 then
                    set info active doc key (contents of (item 1 of revs)) value (contents of (item 2 of revs))
                else if (length of revs) is 2 then
                    set info active doc key (contents of (item 1 of (contents of (item 1 of revs)))) value (contents of (item 2 of (contents of (item 1 of revs))))
                    set info active doc key (contents of (item 1 of (contents of (item 2 of revs)))) value (contents of (item 2 of (contents of (item 2 of revs))))
                end if
                close active doc saving "Yes"
            end tell
        end repeat
    end repeat
end tell
*)
