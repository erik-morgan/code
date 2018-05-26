set fileList to {}
set files_ai to alias "HD6904:Users:HD6904:Desktop:Michael:ai:"
set files_eps to alias "HD6904:Users:HD6904:Desktop:Michael:eps:"
set files_indd to alias "HD6904:Users:HD6904:Desktop:Michael:indd:"
set files_pdf to alias "HD6904:Users:HD6904:Desktop:Michael:pdf:"
set files_doc to alias "HD6904:Users:HD6904:Desktop:Michael:doc:"
set files_xls to alias "HD6904:Users:HD6904:Desktop:Michael:xls:"
set files_p65 to alias "HD6904:Users:HD6904:Desktop:Michael:p65:"
set root to (((path to desktop as text) & "Michael:") as alias)
my getFiles(root)

-- OR: USE ENTIRE CONTENTS OF!

on getFiles(parentFolder)
    tell application "System Events"
        set itemList to (disk items of folder parentFolder)
        repeat with thisItem in itemList
            if class of thisItem is folder then
                my getFiles(path of thisItem)
            else
                set end of fileList to (thisItem as alias)
            end if
        end repeat
    end tell
end getFiles