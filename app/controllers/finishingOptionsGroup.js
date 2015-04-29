var args = arguments[0] || {};

var print = args.print;


// default finishing options
var finishingOptions = {
	id : print,
	colorMode : 0,
	sides : 0,
	copyCount : 1,
	stapling : 0,
	punchHoles : 0,
	folding : 0, 
	binding : 0
};


function openWindow(){
	if(!args.print){
			$.finishingOptionsGroup.close();
			return;
	}
}


function changeColorMode(e){
	finishingOptions.colorMode = e.rowIndex;
}

function changeSides(e){
	finishingOptions.sides = e.rowIndex;
}

function changeStapling(e){
	finishingOptions.stapling = e.rowIndex;
}

function changePunchHoles(e){
	finishingOptions.punchHoles = e.rowIndex;
}

function changeFolding(e){
	finishingOptions.folding = e.rowIndex;
}

function changeBinding(e){
	finishingOptions.binding = e.rowIndex;
}




function incrementCopyCount(e){
	var value = parseInt($.copyCount.text);
	if(value != NaN){
		value++;
	}
	$.copyCount.text = value;
	finishingOptions.copyCount = value;
}
function decrementCopyCount(e){
	var value = parseInt($.copyCount.text);
	if(value != NaN && value > 1){
		value--;
	}
	$.copyCount.text = value;
	finishingOptions.copyCount = value;
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

		finishingOptions.printerTag = e.barcode;

	sendPrintJob(false, finishingOptions, 
		function(statusCode, response){ // success
			if(statusCode == 200){
					Ti.API.info("close finishing options group");
					$.finishingOptionsGroup.close();
			}else if(statusCode == 202){
				//prompt force
				var obj = JSON.parse(response);
				var missingArray = obj.missingFeatures;
				var arr = [];
				for(i=0; i < missingArray.length;i++){
					var feature = Alloy.Globals.missingFeatureMap(missingArray[i]);
					arr[arr.length] = feature;
				}
				
				var dialog =Titanium.UI.createAlertDialog({
					  cancel: 1,
		              title: "Missing features",
		              message: "Selected printer is missing requested features: " + arr.toString() + ". Do you want to print job anyway?" ,
		              buttonNames: ['Print anyway', L('close')]
	           	 });

			  dialog.addEventListener('click', function(e){
			    if (!e.cancel){
			    	sendPrintJob(true, finishingOptions, function(status, response){
							$.finishingOptionsGroup.close();
					    },function (response){
							var missing = JSON.parse(response);
							Titanium.UI.createAlertDialog({
					              title: ("printer" === missing.type ? "Unknown printer": "Unknown print job"),
					              message: ("printer" === missing.type ? "Scanned printer was not found. Please contact administrator.": "Send print job was not found. It was probably deleted. Please refresh your print job list."),
					              buttonNames: [L('close')]
					            }).show();
						});
				}
			  });
			  dialog.show();
			}
		},
		function(response){ // error
			var missing = JSON.parse(response);
		Titanium.UI.createAlertDialog({
              title: ("printer" === missing.type ? "Unknown printer": "Unknown print job"),
              message: ("printer" === missing.type ? "Scanned printer was not found. Please contact administrator.": "Send print job was not found. It was probably deleted. Please refresh your print job list."),
              buttonNames: [L('close')]
            }).show();
		});
				
		
		

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




function sendPrintJob( force, data, callbackSuccess, callbackError){
	data.forcePrint = force;
	var session = Ti.App.Properties.getString('session');
    var xhr = Titanium.Network.createHTTPClient();
	
    xhr.onload = function(e) {
    	if(callbackSuccess !== undefined){
    		callbackSuccess(this.status, this.responseText);
    	}
    };
	xhr.onerror = function (){
		if( this.status === 401 ){
			Titanium.UI.createAlertDialog({
	              title: L("wrong_credentials"),
	              message: L("invalid_session_login"),
	              buttonNames: [L('close')]
	            }).show();
		}else if(callbackError !== undefined && this.status === 404){
    		callbackError(this.responseText);
    	} else {
			Titanium.UI.createAlertDialog({
	              title: L("server_error"),
	              message: L("server_error_unknown"),
	              buttonNames: [L('close')]
	            }).show();
		}
	};
    xhr.open("POST", Alloy.Globals.API_URL + "/printjob/print/multiple");
	xhr.setRequestHeader(Alloy.Globals.SAFEQ_SESSION_HEADER, session);
	xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}
