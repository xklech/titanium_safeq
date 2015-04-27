// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

Alloy.Globals.API_URL = "http://private-3a4b1-safeqmobiletitanium.apiary-mock.com";
Alloy.Globals.SAFEQ_SESSION_HEADER = "X-Mobile-Safeq-Session";

//var printJob = Alloy.Collections.printJob = Alloy.createCollection('printJob');
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}



/**
 * 
 * THIS code handles incoming intents with files on Android OS. 
 * It is designed only for printable content and basic sharing of files. 
 * Productionb solution should be more complex.
 * 
 * Android support for files with mime application/*, image/*, text/*
 * and plain text with mime text/plain
 * 
 */
if(OS_ANDROID){
	(function() {
		var currentActivity = Ti.Android.currentActivity;
			var intentType = currentActivity.getIntent().getType();
			Ti.API.info("type: " + intentType); 
			var intentAction = currentActivity.getIntent().getAction();
			var intent = currentActivity.getIntent();
			Ti.API.info("action: " + intentAction); 
			if("android.intent.action.VIEW" !== intentAction && "android.intent.action.SEND" !== intentAction){
				Ti.API.info("not processable"); 
				return;
			}
			//delay untill application is fully started
			setTimeout(function() {
				var session = Ti.App.Properties.getString('session');
				if(session == null || session == "") {
				    Ti.UI.createAlertDialog({
					    title: "Not logged in",
					    message: "To upload files you must be logged in. Log in and try again."
				    }).show();
					return;
				}
				var win = Ti.UI.createWindow({
				        fullscreen: false,
				        layout: "vertical",
				        width: Ti.UI.FILL,
				    	height: Ti.UI.FILL,
				    });
				var EXTRA_STREAM = Ti.Android.EXTRA_STREAM;
			
				Ti.API.info("getData: " + intent.getData()); 
				Ti.API.info("text extra: " + intent.getStringExtra(Ti.Android.EXTRA_TEXT)); 
				
				if(intent.getData() !== null){
					var fileURI = intent.getData();
					Ti.API.info("fileURI: " + fileURI); 
				    var tmpFile = Ti.Filesystem.getFile(fileURI);
				    //var fileData = Ti.Filesystem.getFile(Ti.Filesystem.getTempDirectory() + tmpFile.name);
				    //tmpFile.copy(fileData.nativePath); //the copy can be handled like any other normal file
					sendToServer(tmpFile, "PUT", "/printjob/send", session, function(response){
						Ti.API.info("jsonResponse: " + response); 
				    	var response = JSON.parse(response);
				    	var id = response.id;
				    	var data = { fileName: tmpFile.name};
				    	sendToServer(data, "POST", "/printjob/send/" + id, session, function(response){
				    		Ti.API.info("force update list"); 
							Ti.App.Properties.setInt('lastUpdate', 0); // force update list
						});
					});
				} else if(intentType === "text/plain" && intent.getStringExtra(Ti.Android.EXTRA_TEXT) != null){
					 var body = intent.getStringExtra(Ti.Android.EXTRA_TEXT);
					 // send text body
					 var win2 = Ti.UI.createView({
				        layout: "horizontal",
				        height: Ti.UI.SIZE,
				        width: Ti.UI.FILL,
				        left: 16,
				        right: 16
				    });
				    var label = Ti.UI.createLabel({
				    	text: "Print job name: ",
				    	textAligment: Ti.UI.TEXT_ALIGNMENT_RIGHT,
				    	width: "50%",
				    	height: 30,
				    	left: 0
				    });
				    var textField =  Ti.UI.createTextField({
					  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
					  width: "50%"
					});
				    

				    
				    var button = Titanium.UI.createButton({
					   title: 'Send',
					   width: 300,
					   height: 50
					});
					button.addEventListener('click',function(e)
					{
					   Titanium.API.info("You clicked the button");
					   button.touchEnabled = false;
					   var data = {
					   		name : textField.value,
					   		text : body
					   		};	
						sendToServer(data, "POST", "/printjob/send", session, function(response){
				    		Ti.API.info("force update list"); 
							Ti.App.Properties.setInt('lastUpdate', 0); // force update list
							win.close();
						},
						function(){
							button.touchEnabled = true;
						}
						);
					});
					
					win2.add(label);
				    win2.add(textField);
				    win.add(win2);
				    win.add(button);
					win.open();
				} else {
					Titanium.UI.createAlertDialog({
			              title: "Not compatible",
			              message: "This version of application does not know how to resolve incoming sharing. Please contact developers.",
			              buttonNames: [L('close')]
			            }).show();
				}

			}, 3000);
	   })();
}




function sendToServer(data, method, url, session, calbbackSuccess, callbackFail){
		    var xhr = Titanium.Network.createHTTPClient();
		
		    xhr.onload = function(e) {
		    	if(calbbackSuccess !== undefined){
		    		calbbackSuccess(this.responseText);
		    	}
		    };
			xhr.onerror = function (){
				if(callbackFail !== undefined){
		    		callbackFail();
		    	}
				if( this.status === 401 ){
					Titanium.UI.createAlertDialog({
			              title: L("wrong_credentials"),
			              message: L("wrong_username_pass"),
			              buttonNames: [L('close')]
			            }).show();
				}else{
					Titanium.UI.createAlertDialog({
			              title: L("server_error"),
			              message: L("server_error_unknown"),
			              buttonNames: [L('close')]
			            }).show();
				}
			};
		    xhr.open(method, Alloy.Globals.API_URL + url);
			xhr.setRequestHeader(Alloy.Globals.SAFEQ_SESSION_HEADER, session);
		    xhr.send(data);
}