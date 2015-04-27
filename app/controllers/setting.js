var args = arguments[0] || {};


function logout(){
	$.logoutButton.touchEnabled = false;
	var session = Ti.App.Properties.getString('session');
	if(Titanium.Network.networkType != Titanium.Network.NETWORK_NONE && session != null && session != "") {
		var loginReq = Titanium.Network.createHTTPClient();
	
		loginReq.open("DELETE", Alloy.Globals.API_URL + "/authenticate");
		loginReq.setRequestHeader(Alloy.Globals.SAFEQ_SESSION_HEADER, session);
	    loginReq.send();
    
	}
	

    
    var properties = Ti.App.Properties.listProperties();
	for(var prop in properties){
		Ti.App.Properties.removeProperty(properties[prop]);
		Ti.API.info("prop: " + properties[prop]); 
	}
    Alloy.createController("index").getView().open();
    $.setting.close();
}

$.setting.addEventListener('open', function(e) {

	var name = Ti.App.Properties.getString('username');
	var surname = Ti.App.Properties.getString('usersurname');
	var logedin = Ti.App.Properties.getDouble('logindate');
  	var date = new Date(logedin);
  	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	
	var minutes = date.getMinutes();
	var hours = date.getHours();
	$.settingUserName.text = name;
    $.settingUserSurname.text = surname;
    $.settingLoggedIn.text = addZero(day) + ". " + addZero(month) + ". " + year + " " + addZero(hours) + ":" + addZero(minutes);

});

function addZero(numb){
	return numb < 9 ? "0" + numb : numb;
}


