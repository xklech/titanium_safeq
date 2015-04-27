
$.index.addEventListener('open', function(){
	if(OS_ANDROID){
		$.index.activity.actionBar.hide();
	}
	var session = Ti.App.Properties.getString('session');
	if(session != null && session != ""){
		// logged in run list
		Alloy.createController("list").getView().open();
		$.index.close();
	}
});


function login(e) {
	var userName = $.editTextUserName.value;
	var passwordValue = $.editTextPassword.value;
	if(userName == null || userName == ""){
		Titanium.UI.createAlertDialog({
              title: L("username_required"),
              message: L("username_cant_be_empty"),
              buttonNames: [L("OK")]
            }).show();
		return;
	}
	if(passwordValue == null || passwordValue == ""){
		Titanium.UI.createAlertDialog({
              title: L("password_required"),
              message: L("password_cant_be_empty"),
              buttonNames: [L("OK")]
            }).show();
		return;
	}
	if(Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){ 
		Titanium.UI.createAlertDialog({
              title: L("no_internet_connection"),
              message: L("no_internet_connection_text"),
              buttonNames: [L("close")] 
            }).show();
		return;
	}
	$.loginButton.touchEnabled = false;
	var loginReq = Titanium.Network.createHTTPClient();
    loginReq.onload = function()
		{
			    var json = this.responseText;
			    var response = JSON.parse(json);
		        Ti.App.Properties.setString('session', response.session);
	        	Ti.App.Properties.setString('username', response.name);
		        Ti.App.Properties.setString('usersurname', response.surname);
		        Ti.App.Properties.setDouble('logindate', new Date().getTime());
		        $.loginButton.touchEnabled = true;
				Alloy.createController("list").getView().open();
				$.index.close();
		};
	loginReq.onerror = function (){
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
		$.loginButton.touchEnabled = true;
	};
    loginReq.open("POST", Alloy.Globals.API_URL + "/authenticate");
    var params = {
        username: userName,
        password: passwordValue
    };

    loginReq.send(params);

}

	$.index.open();

