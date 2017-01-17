"use strict";
$.ui.autoLaunch=false;
$.ui.useOSThemes=false;

var _root = "./";
var _external;  //下载模块地址
var _os; //操作系统

if ($.os.android) {
    _os = "android";
} else if ($.os.ios) {
    _os = "ios";
} else {
    _os = "windows";
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

function T(tags) {
    var tagsSlipt = tags.split(".");
    var lang = app.lang;
    for (var i=0,len=tagsSlipt.length; i<len; i++) {
        lang = lang[tagsSlipt[i]];
        if (!lang) {
            return tagsSlipt[len-1];
        }
    }
    return lang[app.langType];
}
