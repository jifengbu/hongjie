define(function(require) {
	"use strict";
	function UserSetting() {
	}
	UserSetting.prototype.setStringData = function (key, value) {
        localStorage.setItem(key, value + "");
	};
	UserSetting.prototype.getStringData = function (key) {
	    return localStorage.getItem(key);
	};
	UserSetting.prototype.setBooleanData = function (key, value) {
	    localStorage.setItem(key, value + "");
	};
	UserSetting.prototype.getBooleanData = function (key) {
	    return "true" == localStorage.getItem(key) ? true : false;
	};
	UserSetting.prototype.setIntData = function (key, value) {
	    localStorage.setItem(key, value + "");
	};
	UserSetting.prototype.getIntData = function (key) {
		var val = localStorage.getItem(key)||0;
		return parseInt(val);
	};
	UserSetting.prototype.setObjectData = function (key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	};
	UserSetting.prototype.getObjectData = function (key) {
		var ret;
        var obj = localStorage.getItem(key);
		try {
			ret = JSON.parse(obj);
		} catch (e) {
			ret = null;
		}

		return ret;
	};
	
	return new UserSetting();
});

