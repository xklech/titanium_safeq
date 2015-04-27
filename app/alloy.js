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


if(OS_ANDROID){
	(function() {
			var intentType = Ti.Android.currentActivity.getIntent().getType();
			Ti.API.info("type: " + intentType); 
			var intentAction = Ti.Android.currentActivity.getIntent().getAction();
			Ti.API.info("action: " + intentAction); 
			if("android.intent.action.SEND" !== intentAction){
				Ti.API.info("not file"); 
				return;
			}
			var session = Ti.App.Properties.getString('session');
			if(session == null || session == "") {
			    Ti.UI.createAlertDialog({
				    title: "Not logged in",
				    message: "To upload files you must be logged in. Log in and try again."
			    }).show();
				return;
			}
			
			var EXTRA_STREAN = Ti.Android.EXTRA_STREAM;
		
		    var fileURI = currentActivity.getStringExtra(EXTRA_STREAN);
			Ti.API.info("fileURI: " + fileURI); 
			
		    var tmpFile = Ti.Filesystem.getFile(fileURI);
		    var fileData = Ti.Filesystem.getFile(Ti.Filesystem.getTempDirectory() + tmpFile.name);
		    tmpFile.copy(fileData.nativePath); //the copy can be handled like any other normal file
		
		    var xhr = Titanium.Network.createHTTPClient();
		
		    xhr.onload = function(e) {
			    Ti.UI.createAlertDialog({
				    title: "Success",
				    message: "File has been successfully uploaded to the Mobile Uploads folder"
			    }).show();
		    };
			xhr.onerror = function (){
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
		    xhr.open("PUT", Alloy.Globals.API_URL + "/send");
			xhr.setRequestHeader(Alloy.Globals.SAFEQ_SESSION_HEADER, session);
		    xhr.send(fileData);
	   })();
}
