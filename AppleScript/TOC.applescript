clearBoxes()

tell application "Adobe InDesign CS5.5"
	tell active document
		try
			set myLayer to make layer with properties {name:"TOCLayer"}
		on error
			set myLayer to layer "TOCLayer"
		end try
		set properties of TOC style "PageMaker TOC style" to {title:"Table of Contents", title style:"TOC"}
		create TOC destination layer myLayer place point [8.5, 0] using TOC style "PageMaker TOC style"
		delete (pages 2 thru (count pages))
		make section with properties {page start:page 1, page number style:lower roman}
	end tell
	set properties of find change text options to {case sensitive:true, include footnotes:true, include master pages:true, whole word:true}
	set properties of find text preferences to {applied paragraph style:"Page No.", find what:"Page "}
	set change to of change text preferences to ""
	change text
	set find change text options to nothing
	set find text preferences to nothing
	set properties of find text preferences to {applied paragraph style:"SUGGESTED PROCEDURE"}
	tell active document
		set sugProc to find text
		if word 1 of item 1 of sugProc is "SUGGESTED" then
			set tocDiv to item 1 of sugProc
			--			set tocLim to (count of paragraphs from character 1 of parent story of tocDiv to character 1 of tocDiv) + 1
		end if
		set tocFrame to object reference of every text frame whose item layer is myLayer
		set tocStory to parent story of tocFrame
		set mainStory to parent story of tocDiv
		tell mainStory
			delete (paragraphs 4 thru (count of paragraphs))
			repeat with x from 1 to (count of paragraphs in tocStory)
				set tocText to contents of paragraph x of tocStory
				set tocStyle to applied paragraph style of paragraph x of tocStory
				set contents of insertion point -1 to tocText
				set applied paragraph style of paragraph (3 + x) to tocStyle
				if applied paragraph style of paragraph (3 + x) is in {"TOC Level 3", "TOC Level 4", "TOC Level 5"} then
					set hyphenation of paragraph (3 + x) to false
					set right indent of paragraph (3 + x) to 0.25
				end if
			end repeat
			set contents of insertion point -2 to "Assembly Drawings and Parts Lists" as string
			set applied paragraph style of last paragraph to "TOC Level 2"
			set applied paragraph style of insertion point -1 to "TOC Parts List"
		end tell
		delete tocFrame
		delete myLayer
	end tell
end tell

on clearBoxes()
	tell application "Adobe InDesign CS5.5"
		tell active document
			set blackID to id of color "Black"
			set pageItems to every rectangle of page 1
			repeat with y from 1 to count of pageItems
				set thisItem to item y of pageItems
				if fill color of thisItem is color id blackID then
					set itemBounds to geometric bounds of thisItem
					set x1 to item 2 of itemBounds
					set x2 to item 4 of itemBounds
					set itemWidth to x2 - x1
					if itemWidth > 4.5 and itemWidth < 4.75 then
						set itemPage to parent page of thisItem
						tell itemPage to delete thisItem
					end if
				end if
			end repeat
		end tell
	end tell
end clearBoxes