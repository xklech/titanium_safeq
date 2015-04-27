var args = arguments[0] || {};

var print = args.print;


/*if(finishingOptions != undefined){
	// PRESELECT VALUES ACCORDING TO SAVED VALUES
	var colorMode = finishingOptions.get('colorMode');
	$.colorMode.setSelectedRow(0, colorMode, false);
	
	var sides = finishingOptions.get('sides');
	$.sides.setSelectedRow(0, sides, false);
	
	var copyCount = finishingOptions.get('copyCount');
	$.copyCount.text = copyCount;
	
	var stapling = finishingOptions.get('stapling');
	$.stapling.setSelectedRow(0, stapling, false);
	
	var punchHoles = finishingOptions.get('punchHoles');
	$.punchHoles.setSelectedRow(0, punchHoles, false);
	
	var pageRangeFrom = finishingOptions.get('pageRangeFrom');
	$.rangeFrom.text = pageRangeFrom;
	
	var pageRangeTo = finishingOptions.get('pageRangeTo');
	$.rangeTo.text = pageRangeTo;
	
	var folding = finishingOptions.get('folding');
	$.folding.setSelectedRow(0, folding, false);
	
	var binding = finishingOptions.get('binding');
	$.binding.setSelectedRow(0, binding, false);
} */


function openWindow(){
	if(!args.print){
			$.finishingOptionsGroup.close();
			return;
	}
}






function incrementCopyCount(e){
	var value = parseInt($.copyCount.text);
	if(value != NaN){
		value++;
	}
	$.copyCount.text = value;
}
function decrementCopyCount(e){
	var value = parseInt($.copyCount.text);
	if(value != NaN && value > 1){
		value--;
	}
	$.copyCount.text = value;
}



function scanPrinter(){
	openScanner();
}


// touch start creates a 250ms interval that fires click events
function touchStartClick(e) {
    if ( !e.source.touchTimer ) {
        e.source.touchTimer = setInterval(function () {
            e.source.fireEvent("click");
        }, 250);
    }
}

// touch end cancels the interval
function touchEndClick(e) {
    if ( e.source.touchTimer ) {
        clearInterval(e.source.touchTimer);
        e.source.touchTimer = null;
    }
}








//* SCANNER

var scanditsdk = require("com.mirasense.scanditsdk");

var picker;
// Create a window to add the picker to and display it. 

if(Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
    	Titanium.UI.iPhone.statusBarHidden = true;
	}

var window = Titanium.UI.createWindow({  
		title:'Scan printer code',
		navBarHidden:true
});


function openScanner() {
	// Instantiate the Scandit SDK Barcode Picker view
	picker = scanditsdk.createView({
		width:"100%",
		height:"100%"
	});
	// Initialize the barcode picker, remember to paste your own app key here.
	picker.init("Sv/+zKI8RacjE1x70xSU9iJ5a0AIBCBOMy/tb3zjzI4", 0);


	picker.showSearchBar(true);
	// add a tool bar at the bottom of the scan view with a cancel button (iphone/ipad only)
	picker.showToolBar(true);

	// Set callback functions for when scanning succeedes and for when the 
	// scanning is canceled.
	picker.setSuccessCallback(function(e) {
		alert("success (" + e.symbology + "): " + e.barcode);
		closeScanner();
	});
	picker.setCancelCallback(function(e) {
		closeScanner();
	});

	window.add(picker);
	window.addEventListener('open', function(e) {
		// Adjust to the current orientation.
		// since window.orientation returns 'undefined' on ios devices 
		// we are using Ti.UI.orientation (which is deprecated and no longer 
	    // working on Android devices.)
		if(Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
    		picker.setOrientation(Ti.UI.orientation);
		}
		
		picker.setSize(Ti.Platform.displayCaps.platformWidth, 
					   Ti.Platform.displayCaps.platformHeight);
		picker.startScanning();		// startScanning() has to be called after the window is opened. 
	});
	window.open();
}



function closeScanner() {
	if (picker != null) {
		picker.stopScanning();
		window.remove(picker);
	}
	window.close();
}

// Changes the picker dimensions and the video feed orientation when the
// orientation of the device changes.
Ti.Gesture.addEventListener('orientationchange', function(e) {
	window.orientationModes = [Titanium.UI.PORTRAIT, Titanium.UI.UPSIDE_PORTRAIT, 
				   Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];
	if (picker != null) {
		picker.setOrientation(e.orientation);
		picker.setSize(Ti.Platform.displayCaps.platformWidth, 
				Ti.Platform.displayCaps.platformHeight);
		// You can also adjust the interface here if landscape should look
		// different than portrait.
	}
});



