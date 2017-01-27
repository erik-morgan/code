﻿var w = new Window("dialog", "Writer's Toolbox", undefined);
	var p = w.add("panel", undefined, undefined, {borderStyle:"etched"});
		p.alignChildren = "left";
		var gAll = p.add("group");
			var checkAll = gAll.add("checkbox", undefined, "Select All");
				checkAll.alignment = ["fill", ""];
		var gGuides = p.add("group");
			var checkGuides = gGuides.add("checkbox", undefined, "FixGuides:");
				checkGuides.preferredSize = [100, 18];
					bRun.enabled = canRun();
			var labelGuides = gGuides.add("staticText {text:'Removes all guides from the document, & inserts the correct guides on the master spread only.'}");
		var gLogos = p.add("group");
			var checkLogos = gLogos.add("checkbox", undefined, "FixLogos:");
				checkLogos.preferredSize = [100, 18];
			var labelLogos = gLogos.add("staticText {text:'Removes all master spread graphics, & places the logo files at the correct location at the proper scale.'}");
		var gFooters = p.add("group");
			var checkFooters = gFooters.add("checkbox", undefined, "AlignFooters:");
				checkFooters.preferredSize = [100, 18];
			var labelFooters = gFooters.add("staticText {text:'Recreates the master spread footers with consistent sizing & alignment. (will NOT affect footer contents)'}");
		var gFrames = p.add("group");
			var checkFrames = gFrames.add("checkbox", undefined, "FixFrames:");
				checkFrames.preferredSize = [100, 18];
			var labelFrames = gFrames.add("staticText {text:'Straightens all crooked text frames, checks all main story frames for proper placement, & corrects their positioning if necessary. (bypasses locked frames)'}");
		var gColors = p.add("group");
			var checkColors = gColors.add("checkbox", undefined, "ResetColors:");
				checkColors.preferredSize = [100, 18];
			var labelColors = gColors.add("staticText {text:'Sets the swatches to their correct values, removes all extraneous swatches, & creates any missing ones.'}");
		var gBoxes = p.add("group");
			var checkBoxes = gBoxes.add("checkbox", undefined, "ClearBoxes:");
				checkBoxes.preferredSize = [100, 18];
			var labelBoxes = gBoxes.add("staticText {text:'Clears the gray note boxes from the entire document. (bypasses locked boxes)'}");
		var gStyles = p.add("group");
			var checkStyles = gStyles.add("checkbox", undefined, "ResetStyles:");
				checkStyles.preferredSize = [100, 18];
			var labelStyles = gStyles.add("staticText {text:'Sets the paragraph styles to their correct settings, removes all extraneous styles, & creates any missing ones.'}");
		var gNotes = p.add("group");
			var checkNotes = gNotes.add("checkbox", undefined, "NoteBoxes:");
				checkNotes.preferredSize = [100, 18];
			var labelNotes = gNotes.add("staticText {text:'Finds all notes, checks their formatting/color, & creates a box behind each one. (bypasses locked frames, works with Note Bullets, & runs ClearBoxes/ResetColors by default)'}");
		var gClean = p.add("group");
			var checkClean = gClean.add("checkbox", undefined, "Cle&oc:");
				checkClean.preferredSize = [100, 18];
			var labelClean = gClean.add("staticText {text:'Removes multiple returns/spaces & trailing whitespace, corrects curly quotes, capitalizes/bolds figures, & fixes group text wrap (bypasses locked frames, & does not apply to master pages)'}");
		var gRev = p.add("group");
			var checkRev = gRev.add("checkbox", undefined, "NoteBoxes:");
				checkRev.preferredSize = [100, 18];
			var labelRev = gRev.add("staticText {text:'Increments the revision number & ammends the date in the footers, & saves the file in the same location with an incremented revision number in the file name.'}");
	var gExecute = w.add("group");
		gExecute.alignment = ["fill", "fill"];
		var pBackup = gExecute.add("panel", undefined, undefined, {borderStyle:'etched'});
			pBackup.alignment = ["fill", "fill"];
			pBackup.alignChildren = ["left", "center"];
			pBackup.spacing = 0;
			var checkBackup = pBackup.add("checkbox", undefined, "Backup Active Document");
			var gFile = pBackup.add("group");
				gFile.alignment = ["fill", "fill"];
				var labelFile = gFile.add("staticText", undefined, "Filename:");
					labelFile.preferredSize = [58, -1];
				var editFile = gFile.add("editText", undefined, "FILE NAME.INDD", {borderless:true});
					editFile.characters = 90;
			var gPath = pBackup.add("group");
				gPath.alignment = ["fill", "fill"];
				var labelPath = gPath.add("staticText", undefined, "Location:");
					labelPath.preferredSize = [58, -1];
				var editPath = gPath.add("editText", undefined, "FILE PATH TO MY DOCUMENTS", {borderless:true});
					editPath.characters = 90;
				var bPath = gPath.add("button {text:'Browse', enabled:true, helpTip:'Browse to a different folder'}");
					bPath.preferredSize = [-1, 18];
		var gButtons = gExecute.add("group");
			gButtons.orientation = "column";
			gButtons.alignment = ["fill", "fill"];
			gButtons.margins = gButtons.spacing = 0;
			var bRun = gButtons.add("button {text:'Run', enabled:false, helpTip:'Runs the selected functions.'}");
				bRun.alignment = ["fill", "fill"];
			var bCancel = gButtons.add("button {text:'Cancel', name:'cancel', enabled:true, helpTip:'Cancel the script.'}");
				bCancel.alignment = ["fill", "fill"];
w.show();