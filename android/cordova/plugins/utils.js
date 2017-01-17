cordova.define("plugins.utils", function(require, exports, module) {
    "use strict";
    var exec = require('cordova/exec');
    var CLASS = "UtilsPlugin";
    module.exports = {
        /**
         * exec一共5个参数
         第一个 :成功会掉
         第二个 :失败回调
         第三个 :将要调用的类的配置名字(config.xml文件中指定的<feature name>)
         第四个 :调用的方法名(android中对已的action)
         第五个 :传递的参数  以json的格式 (android中对已的args)
         */
        unzip: function(zipFile, outPath, winWidth, winHeight, success, fail) {
            exec(success, fail, CLASS, "unzip", [zipFile, outPath, winWidth, winHeight]);
        },
        callNumber: function(number) {
            exec(null, null, CLASS, "callNumber", [number]);
        },
        sendSms: function(number) {
            exec(null, null, CLASS, "sendSms", [number]);
        },
        genScreenCss: function(cssPath, cssFile, winWidth, winHeight) {
            exec(null, null, CLASS, "genScreenCss", [cssPath, cssFile, winWidth, winHeight]);
        },
        getLocalValue: function(tag, success) {
            exec(success, null, CLASS, "getLocalValue", [tag]);
        },
        setLocalValue: function(tag, value) {
            exec(null, null, CLASS, "setLocalValue", [tag, value]);
        },
        restart: function() {
            exec(null, null, CLASS, "restart", []);
        },
        exitApp: function() {
            navigator.app.exitApp();
        },
        unzipWWW: function(zipFile, success, fail) {
            var outPath = zipFile.replace(/www\.zip$/, '');
            exec(function(state) {
                    if (state == "finish") {
                        success();
                    }
                }, function(err){
                    fail();
                },
                CLASS, "unzip", [zipFile, outPath, $(window).width(), $(window).height()]);
        },
        installApp: function(apkFile, success, fail) {
            exec(null, null, CLASS, "installApk", [apkFile]);
        },
        toast: function(info) {
            exec(null, null, CLASS, "toast", [info]);
        },
        datePickerDialog: function(success, year, month, day) {
            var d = new Date();
            year = year*1||d.getFullYear();
            month = month*1||d.getMonth()+1;
            day = day*1||d.getDate();
            exec(function(date) {
                var y = date.year;
                var m = date.month;
                var d = date.day;
                success({
                    year : y,
                    month : m<10?'0'+m:m,
                    day : d<10?'0'+d:d
                });
            }, function(e){}, CLASS, "datePickerDialog", [year, month, day]);
        },
        scanner: function(callback) {
            exec(callback, null, CLASS, "scanner", []);
        },
        getAppInfo: function(success) {
            var that = this;
            exec(function(version) {
                console.log("getAppInfo:"+JSON.stringify(window.app)+"  "+JSON.stringify(version));
                if (window.app) {
                    that.readFile(version.documentPath+ "www/version.json", function(ver){
                        console.log("local getAppInfo:"+ver);
                        ver = JSON.parse(ver);
                        version.mainVersion = ver.mainVersion;
                        version.maxVersion = ver.maxVersion;
                        version.minVersion = ver.minVersion;
                        console.log("last getAppInfo:"+JSON.stringify(version));
                        success(version);
                    }, function(){
                        version.mainVersion = window.app.info.mainVersion;
                        version.minVersion = window.app.info.minVersion;
                        console.log("error getAppInfo:"+JSON.stringify(version));
                        success(version);
                    });
                } else {
                    success(version);
                }
            }, null, CLASS, "getAppInfo", []);
        },
        writeFile: function(filename, data, success, fail, type) {
            type = type||'utf8';
            exec(success, fail, CLASS, "writeFile", [filename, type, data]);
        },
        readFile: function(filename, success, fail, type) {
            type = type||'utf8';
            exec(success, fail, CLASS, "readFile", [filename, type]);
        },
        chooseDirectory: function(startdir, success) {
            exec(function(path) {
                if (path.substr(-1)!='/') {
                    path=path+"/";
                }
                success(path);
            }, function(){
                success("/sdcard/");
            }, CLASS, "chooseFile", [startdir||'/', 0]);
        },
        chooseFile: function(accept, startdir, success) {
            exec(function(path) {
                success(path);
            }, function(){
                success('');
            }, CLASS, "chooseFile", [startdir||'/', 1]);
        },
        addNotification: function(id, title, msg) {
            exec(null, null, CLASS, "addNotification", [id, title, msg]);
        },
        clearNotification: function(id) {
            exec(null, null, CLASS, "clearNotification", [id||-1]);
        }
    };
});

