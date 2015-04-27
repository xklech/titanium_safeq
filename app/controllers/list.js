var args = arguments[0] || {};

var printJob = Alloy.Collections.printJob;
var search;
if(OS_ANDROID){
	/**
	 * Whole declaration of android menu items could be in alloy list.xml view, but alloy cant bound own actionView.
	 * It is not possible to write some items in alloy and some in controller, alloy will override controllers 
	 * onCreateOptionsMenu function. 
	 */
	var search = Ti.UI.Android.createSearchView({
	    hintText: L('search_hint')
	});
	$.list.activity.onCreateOptionsMenu = function(e) {
	    var menu = e.menu;
	    menu.add({
	        title: L('menu_search'),
	        actionView : search,
	        icon: "/images/ic_action_search.png",
	        showAsAction: Ti.Android.SHOW_AS_ACTION_IF_ROOM | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW
	    });
	    var updateItem = menu.add({
	        title: L('menu_update'),
	        icon: "/images/ic_action_refresh.png",
	        showAsAction: Ti.Android.SHOW_AS_ACTION_IF_ROOM
	    });
	    
	    updateItem.addEventListener("click", function(e) {
            update();
        });
	    
	    var setting = menu.add({
	        title: L('menu_setting'),
	        icon: "/images/ic_action_settings.png",
	        showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
	    });
	    setting.addEventListener("click", function(e) {
            openSettings();
        });
    };

}else {
	search = $.search;
}



$.listView.searchView = search;
$.listView.caseInsensitiveSearch = true;

search.addEventListener('cancel', function(){
	search.blur();
});

function windowOpen(){
	if(OS_ANDROID){
		$.list.activity.invalidateOptionsMenu();	
	}
	var lastUpdate = Ti.App.Properties.getInt('lastUpdate');
	if(lastUpdate == null || lastUpdate == 0){
		update();
	}

}

function windowClose(){
	$.destroy();
}



function update(){
	if(Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){ 
		return;
	}
	var session = Ti.App.Properties.getString('session');
	if(session == null || session == "") {
	    Alloy.createController("index").getView().open();
	    $.list.close();
		return;
	}

	Ti.App.Properties.setInt('lastUpdate', new Date().getTime());
	var printerJobReq = Titanium.Network.createHTTPClient();
	    printerJobReq.onload = function()
			{
				var db = Ti.Database.open('_alloy_');
				db.execute('DELETE FROM printJob;');
				db.close();
			    var json = this.responseText;
			    var response = JSON.parse(json);
		        for (var i in response){
		        	Ti.API.log('info',"obj: " + response[i]);
			        var model = Alloy.createModel('printJob', response[i]);
					// add model to collection which will in turn update the UI
					printJob.add(model);
					// save the model to SQLite
					model.save();
		        }

				// refresh the collection to reflect this in the UI
				printJob.fetch();
			};
		printerJobReq.onerror = function (){
			if( this.status === 401 ){
				var dialog = Titanium.UI.createAlertDialog({
		              title: L("unauthorized"),
		              message: L("invalid_session_login"),
		              buttonNames: [L("close")]
		           });
			   dialog.show();
			}else{
				Titanium.UI.createAlertDialog({
		              title: L("server_error"),
		              message: L("server_error_unknown"),
		              buttonNames: [L("close")]
		            }).show();
			}
		};
	    printerJobReq.open("GET", Alloy.Globals.API_URL + "/printjob/list");
	    printerJobReq.setRequestHeader(Alloy.Globals.SAFEQ_SESSION_HEADER, session);
	    printerJobReq.send();

}


function openSettings(){
	Alloy.createController("setting").getView().open();
}




// On Android inclick callback of whore item is firend even when you click one component (Switch)
var uiComponentClicked = false;
function showPrintJob(e){
	if(uiComponentClicked){
		uiComponentClicked = false;
		return;
	}
    var section = $.listView.sections[e.sectionIndex];
    // Get the clicked item from that section
    var item = section.getItemAt(e.itemIndex);
    //alert("item: " + item.properties.modelId);
    var model = printJob.get(item.properties.modelId);
    //alert("item: " + JSON.stringify(model));
    
    if(model.get('status') === 'processing'){
    	alert("Selected print job is being processed by server. Jobs will be now updated.");
    	update();
    	return;
    }
    
    Alloy.createController("finishingOptions", {printId: item.properties.modelId}).getView().open();
}
    


function switchClicked(){
	uiComponentClicked = true;
}


/**
 *
 * 	List item data binding
 *  
 */

// assign a ListItem template based on the contents of the model
function doTransform(model) {
	var o = model.toJSON();
	switch(o.type){
		case "pdf" :
			o.image="/images/ic_pdf.png";
			break;
		case "doc" :
			o.image="/images/ic_word.png";
			break;
		case "xls" :
			o.image="/images/ic_excel.png";
			break;
		case "img" :
			o.image="/images/ic_image.png";
			break;
		case "powerpoint" :
			o.image="/images/ic_powerpoint.png";
			break;
		default:
			o.image="/images/ic_text.png";
	}
	if("processing" === o.status) {
		o.template = "processing";
		o.image="/images/ic_unknown.png";
	}else{
		o.template = "item";
	}
	o.modelId = o.id;
	return o;
}


function filterFunctionWaiting(collection){
	var arrayProcessing = collection.where({status:'processing'});
	var arrayWaiting = collection.where({status:'waiting'});
	
	var array = arrayProcessing === 'undefined' ? arrayWaiting : arrayProcessing.concat(arrayWaiting);
	
	$.emptyWaiting.height = typeof array !== 'undefined' && array.length > 0 ? 0 : 55;
	return array;
}

function filterFunctionFavorite(collection){
	var array = collection.where({status:'favorite'});
	$.emptyFavorite.height = typeof array !== 'undefined' && array.length > 0 ? 0 : 55;
	return array;
}

function filterFunctionPrinted(collection){
	var array = collection.where({status:'printed'});
	$.emptyPrinted.height = typeof array !== 'undefined' && array.length > 0 ? 0 : 55;
	return array;
}


printJob.fetch();


