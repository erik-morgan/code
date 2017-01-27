#target indesignvar doc = app.activeDocument;var links = doc.links.everyItem().getElements();var linksAI = [];for (i = 0; i < links.length; i++){	var link = links[i];	if (link.status == LinkStatus.NORMAL && link.filePath.substr(-2) == 'ai' && link.name.search(/DQ Logo/i) == -1){		if (!File(link.filePath.toString().replace(/\.ai/i, '.eps')).exists){			linksAI.push(link);		}		else {			link.relink(File(link.filePath.toString().replace(/\.ai/i, '.eps')));		}	}}if (linksAI.length > 0){	for (i = 0; i < linksAI.length; i++){		var linkAI = linksAI[i];		var bt = new BridgeTalk();		bt.target = 'illustrator';		btMessage = 'app.open(File("' + encodeURI(linkAI.filePath) + '"));\r';		btMessage += 'var epsFile = new File(\"' + linkAI.filePath.toString().replace(/\.ai/i, '.eps') + '\");\r';		btMessage += 'app.activeDocument.saveAs(epsFile);\r';		btMessage += 'app.activeDocument.close();';		bt.body = btMessage;		bt.onResult = function (resObj){};		bt.send(30);	}}for (i = 0; i < linksAI.length; i++){	linksAI[i].relink(File(linksAI[i].filePath.toString().replace(/\.ai/i, '.eps')));}