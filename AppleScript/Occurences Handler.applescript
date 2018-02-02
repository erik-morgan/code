on countSubstring(theText, theSubstring)
    local ASTID, theText, theSubstring, i
    set ASTID to AppleScript's text item delimiters
    try
        set AppleScript's text item delimiters to theSubstring
        set i to (count theText's text items) - 1
        set AppleScript's text item delimiters to ASTID
        return i
    on error eMsg number eNum
        set AppleScript's text item delimiters to ASTID
        error "Can't countSubstring: " & eMsg number eNum
    end try
end countSubstring