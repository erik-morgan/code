on join {separateList, delim}
    set AppleScript's text item delimiters to delim
    set joinedList to separateList as string
    set AppleScript's text item delimiters to ""
    return joinedList
end join