function A42LTR(doc){
	doc.layoutAdjustmentPreferences.properties = {
		allowGraphicsToResize:false,
		allowRulerGuidesToMove:false,
		enableLayoutAdjustment:true,
		ignoreObjectOrLayerLocks:true,
		ignoreRulerGuideAlignments:false,
		snapZone:'0.1pt'
	};
	doc.documentPreferences.pageSize = 'Letter';
	doc.layoutAdjustmentPreferences.enableLayoutAdjustment = false;
}