define(function(require) {
	"use strict";
	var _self;
	function Setting() {
		_self = this;
		_self.id = "setting";
	}
	Setting.prototype.show = function() {
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	Setting.prototype.onLoad = function() {
		if (app.login.autologin) {
			$("#ms_auto_login").prop("checked", true);
		}

        if (app.us.getBooleanData('US_AUTO_CHECK_UPDATE')) {
            $("#ms_auto_check_update").prop("checked", true);
        }

		if (!app.notPlaySound) {
			$("#ms_play_sound").prop("checked", true);
		}

		if (!app.notShowNotify) {
			$("#ms_show_notify").prop("checked", true);
		}

		$("#ms_timeout").val(app.route.timeout);
        var passnumber_type = app.route.stageType;
        if (passnumber_type<2) {
            $('#ms_passnumber_type_div').show();
            $("input[type='radio'][name='ms_passnumber_type'][value='"+passnumber_type+"']").prop("checked", "checked");
        }
	};
	Setting.prototype.doMoreSettingDone = function() {
        var passnumber_type = $('input[type="radio"][name="ms_passnumber_type"]:checked').val();
        app.route.stageType = passnumber_type;
        app.us.setIntData("US_STAGE_TYPE", passnumber_type);

		var timeout = $("#ms_timeout").val();
		app.route.setTimeout(timeout);

        var autologin = $("#ms_auto_login").prop("checked");
        app.login.setAutoLogin(autologin);

        var playSound = $("#ms_play_sound").prop("checked");
		app.notPlaySound = !playSound;
        app.us.setBooleanData("US_NOT_PLAY_SOUND", !playSound);

        var showNotify = $("#ms_show_notify").prop("checked");
		app.notShowNotify = !showNotify;
		app.us.setBooleanData("US_NOT_SHOW_NOTIFY", !showNotify);

        var auto_check = $("#ms_auto_check_update").prop("checked");
        app.us.setBooleanData('US_AUTO_CHECK_UPDATE', auto_check);
		
		$.ui.goBack();
	};
	return new Setting();
});
