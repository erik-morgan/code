--Runs on the active InDesign document, regardless of how many tabs are open. InDesign itself doesn't
--need to be activated for the script to function. This script will check and correct the swatches
--Forest Green, Yellow Orange, and Red, clear any existing 'Note Boxes,' correct the formatting of
--every 'Note' paragraph in the document, and redraw the 'Note Boxes' with perfect and equal spacing.

colorFix("Forest Green", 0, 94, 0)
colorFix("Red", 224, 0, 0)
colorFix("Yellow Orange", 255, 166, 0)

clearBoxes()

tell application "Adobe InDesign CS5.5"
	set properties of view preferences of active document to {horizontal measurement units:points, vertical measurement units:points}
	set applied paragraph style of find text preferences to "Note"
	set find what of find text preferences to ":"
	tell active document
		set findNotes to find text
		set noteList to {}
		repeat with x from 1 to (count of findNotes)
			set tempNote to item x of findNotes
			set pNum to count of paragraphs from character 1 of parent story of tempNote to character 1 of tempNote
			set end of noteList to object reference of paragraph pNum of parent story of tempNote
		end repeat
		tell application "Adobe InDesign CS5.5" to set applied paragraph style of find text preferences to "Note Bullets"
		tell application "Adobe InDesign CS5.5" to set find what of find text preferences to nothing
		set bulletList to find text
		repeat with y from 1 to (count of noteList)
			set thisNote to item y of noteList
			my checkFormat(object reference of word 1 of thisNote)
			set pageNum to name of parent page of parent text frames of thisNote
			set paraNum to count of paragraphs from character 1 of parent story of thisNote to character 1 of thisNote
			set wordFirst to object reference of first word in paragraph paraNum of parent story of thisNote
			set wordLast to object reference of last word in paragraph paraNum of parent story of thisNote
			if (pageNum) mod 2 is 0 or pageNum is 1 then
				set x1 to 209.55
				set x2 to 543.63
			else if (pageNum) mod 2 is not 0 then
				set x1 to 209.55 + 630.25
				set x2 to 543.63 + 630.25
			end if
			set noteMax to ascent of wordFirst
			set noteMin to descent of wordLast
			set y1 to (baseline of wordFirst) - noteMax - 6.2
			if (count of bulletList) > 0 then
				repeat with z from 1 to (count of bulletList)
					set thisBullet to item z of bulletList
					set noteIndex to index of last character of thisNote
					set bulletIndex to index of first character of thisBullet
					if (bulletIndex - noteIndex = 1) then
						set bulletMin to descent of thisBullet
						set y2 to (baseline of last character of thisBullet) + bulletMin + 6.2
					end if
				end repeat
			end if
			set y2 to (baseline of wordLast) + noteMin + 6.2
			log "Rectangle Bounds = " & "{" & y1 & ", " & x1 & ", " & y2 & ", " & x2 & "}"
			tell (parent page of parent text frames of thisNote)
				set noteBox to make rectangle with properties {geometric bounds:{y1, x1, y2, x2}}
				set fill color of noteBox to "Black"
				set fill tint of noteBox to 7
				set stroke color of noteBox to "None"
				tell noteBox to send to back
			end tell
		end repeat
	end tell
	set properties of view preferences of active document to {horizontal measurement units:inches, vertical measurement units:inches}
	set find text preferences to nothing
	set change text preferences to nothing
end tell

on colorFix(colorName, rValue, gValue, bValue)
	tell application "Adobe InDesign CS5.5"
		tell active document
			try
				set color value of color colorName to {rValue, gValue, bValue}
			on error
				tell thisDoc to make color with properties {space:RGB, color value:{rValue, gValue, bValue}, name:colorName}
			end try
		end tell
	end tell
end colorFix

on clearBoxes()
	tell application "Adobe InDesign CS5.5"
		tell active document
			set blackID to id of color "Black"
			set pgs to every page
			repeat with pg from 1 to count of pgs
				set itemPage to item pg of pgs
				set pageItems to every rectangle of itemPage
				repeat with z from 1 to count of pageItems
					set thisItem to item z of pageItems
					if fill color of thisItem = color id blackID then
						set itemBounds to geometric bounds of thisItem
						set xLeft to item 2 of itemBounds
						set xRight to item 4 of itemBounds
						set itemWidth to xRight - xLeft
						if itemWidth > 4.5 and itemWidth < 4.75 then
							tell itemPage to delete thisItem
						end if
					end if
				end repeat
			end repeat
		end tell
	end tell
end clearBoxes

on checkFormat(w1)
	tell application "Adobe InDesign CS5.5"
		tell active document
			set c1 to character 1 of w1
			set applied font of w1 to "ITC Bookman Std"
			set font style of w1 to "Bold"
			if c1 is "N" or c1 is "n" then
				set contents of w1 to "Note:"
				set fill color of w1 to "Forest Green"
			else if c1 is "C" or c1 is "c" then
				set capitalization of w1 to all caps
				set fill color of w1 to "Yellow Orange"
			else if c1 is "W" or c1 is "w" then
				set capitalization of w1 to all caps
				set fill color of w1 to "Red"
			end if
		end tell
	end tell
end checkFormat