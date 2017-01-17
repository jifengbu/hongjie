"use strict";
$.ui.autoLaunch=false;
$.ui.useOSThemes=false;

var app = {info:{ mainVersion:3,maxVersion:8,minVersion:13}};
var _os; //操作系统
var _from = navigator._from;
if ($.os.android) {
    _os = "android";
} else if ($.os.ios) {
    _os = "ios";
} else {
    _os = "desktop";
}

function _call(items) {
	var module = items[0],
		func = items[1];
    if (app.hasOwnProperty(module)) {
        if (typeof app[module][func] === 'function') {
            app[module][func].apply(app[module], items.slice(2))
        }
    } else {
        requirejs([module], function (moduleInst) {
            app[module] = moduleInst;
            if (typeof moduleInst[func] === 'function') {
                moduleInst[func].apply(moduleInst, items.slice(2));
            }
        });
    }
} 
