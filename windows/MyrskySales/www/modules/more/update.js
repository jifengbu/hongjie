define(function(require) {
	"use strict";
	var MODULE_CONFIG_JSON;
    var DEST_APK_FILE;
	var _self;
	function Update(){
		_self = this;
		_self.id = "update";
		_self.fs = require('fs');
		_self.FROM_APP_START = 0;
		_self.FROM_MORE_PAGE = 1;
        if ($.os.android) {
            DEST_APK_FILE = "/sdcard/MyrskySales.apk";
            MODULE_CONFIG_JSON = _external+"modules/config.json";
        } else {
            DEST_APK_FILE = navigator.utils.getWorkPath()+"www.zip";
            MODULE_CONFIG_JSON = navigator.utils.getWorkPath()+"www/modules/config.json";
        }
	}
	
	Update.prototype.show = function(from) {
		_self.from = from;
		app.utils.loadPanel(_self.id, {header:"none", footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:"update=onUnload"});
	};
	Update.prototype.onLoad = function () {
		console.log("update onLoad");
		if (_self.from == _self.FROM_APP_START) {
			$.ui.clearHistory();
        }
        if (app.version.verCode > 100000) {
            _self.onCompleteCallback();
            return;
        }
        app.utils.blockUI();
        _self.clearUpdateLog();
        _self.addUpdateLog("准备检查更新...");
        _self.updateApkFile();
        console.log("UI splashscreen hide before");
        navigator.splashscreen.hide();
        console.log("UI splashscreen hide done");
	};
	Update.prototype.onUnload = function () {
		_self.config = null;
		_self.remoteConfig = null;
	};
    Update.prototype.updateApkFile = function() {
        var isTest = app.utils.isTestVersion(app.version.verCode);
        _self.addUpdateLog("当前"+(isTest?"测试":"")+"版本: V"+app.version.verName);
        _self.getApkVersion();
    };
    Update.prototype.completeCallback = function(error) {
        if (_self.from == _self.FROM_MORE_PAGE || error) {
            $("#updatelist").append(app.utils.buttonHtml([
                {
                    text: "我知道了",
                    click: "app.update.onCompleteCallback()",
                    width: 98
                }
            ]));
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
        } else {
            app.utils.uiBlockType = 0;//UI_NOT_BOLCK
            require('login').show();
        }
        $.unblockUI();
    };
	Update.prototype.onCompleteCallback = function() {
        app.utils.uiBlockType = 0;//UI_NOT_BOLCK
        if (_self.from == _self.FROM_APP_START) {
            require('login').show();
        } else {
            $.ui.goBack();
        }
    };
	Update.prototype.rewriteConfigFile = function() {
		var reloadPanel = function () {
			_self.addUpdateLog("全部更新成功", true);
			_self.addUpdateLog("点击确定后重启", true);
            $("#updatelist").append(app.utils.buttonHtml([{
                text:"确定",
                click:"app.update.onRewriteConfigFile()",
                width:98
            }]));
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
            $.unblockUI();
		};
        if (_os == "android") {
            _self.fs.writeText(MODULE_CONFIG_JSON, JSON.stringify(_self.remoteConfig),
                reloadPanel, reloadPanel);
        } else {
            navigator.utils.writeFileSync(MODULE_CONFIG_JSON, JSON.stringify(_self.remoteConfig));
            reloadPanel();
        }
	};
    Update.prototype.onRewriteConfigFile = function() {
        app.utils.uiBlockType = 0;//UI_NOT_BOLCK
        navigator.utils.restart();
    };
    Update.prototype.updateModules = function() {
        if (!_self.needGoonUpdateModule) {
            _self.completeCallback();
            return;
        }
        _self.addUpdateLog("准备更新模块...");
        if (_os == "ios") {
            navigator.utils.readFile(MODULE_CONFIG_JSON, function(config){
                console.log(config);
                _self.config = JSON.parse(config);
                _self.getModulesConfig();
            }, function() {
                console.log("have no config file, use empty config");
                _self.config = [];
                _self.getModulesConfig();
            });
        } else {
            $.getJSON(MODULE_CONFIG_JSON, function(config){
                console.log(config);
                _self.config = config;
                _self.getModulesConfig();
            }, function() {
                console.log("have no config file, use empty config");
                _self.config = [];
                _self.getModulesConfig();
            });
        }
    };
    Update.prototype.getApkVersion = function() {
        if (!app.utils.checkNetwork()) {
            _self.addUpdateLog("网络没有打开");
            _self.completeCallback();
            return;
        }
        _self.addUpdateLog("正在获取远程版本信息...");
        var url = app.route.versionInfoUrl;
        console.log(url);
        var timeout = (_self.from == _self.FROM_MORE_PAGE)?null:3000; //启动页面检查更新超时为3秒
        app.utils.ajax({
            type : "GET",
            url : url,
            timeout : timeout,
            success : _self.onGetApkVersionSuccess,
            error : _self.onGetApkVersionError
        });
    };
    Update.prototype.onGetApkVersionSuccess = function(data) {
        var utils = app.utils,
            thisVerCode = app.version.verCode,
            thatVerCode = data.verCode,
            thisVersionTest = utils.isTestVersion(thisVerCode),
            thatVersionTest = utils.isTestVersion(thatVerCode),
            message = '',
            needUpdate = false;
            _self.needGoonUpdateModule = true;
        if (thisVersionTest && thatVersionTest && thisVerCode < thatVerCode) {
            _self.addUpdateLog("发现新的测试版本："+data.verName);
            message += "当前测试版本:V"+app.version.verName+"<br>"+
                "发现测试新版本:V"+data.verName+"<br>";
            needUpdate = true;
        } else if (!thisVersionTest && !thatVersionTest && thisVerCode < thatVerCode) {
            _self.addUpdateLog("发现新的版本："+data.verName);
            message += "当前版本:V"+app.version.verName+"<br>"+
                "发现新版本:V"+data.verName+"<br>";
            needUpdate = true;
        }  else if (!thisVersionTest && thatVersionTest) {
            _self.addUpdateLog("发现新的测试版本："+data.verName);
            message += "当前版本:V"+app.version.verName+"<br>"+
                "发现测试版本:V"+data.verName+"<br>";
            needUpdate = true;
            _self.needGoonUpdateModule = false;
        }  else if (thisVersionTest && !thatVersionTest) {
            _self.addUpdateLog("发现新的正式版本："+data.verName);
            message += "当前测试版本:V"+app.version.verName+"<br>"+
                "发现正式版本:V"+data.verName+"<br>";
            needUpdate = true;
            _self.needGoonUpdateModule = false;
        }
        if (_os == "ios" || _os == "windows") {
            _self.version = data;
        }
        message += "版本描述:"+data.description+"<br>";
        if (needUpdate) {
            $.unblockUI();
            $("#afui").popup({
                title: "更新提示",
                message: message,
                cancelText: "跳过",
                cancelCallback: function () {
                    _self.addUpdateLog("跳过更新版本:"+data.verName);
                    $.blockUI();
                    _self.completeCallback(); //有新的版本之后模块肯定为空，不需要再更新模块
                },
                doneText: "下载",
                doneCallback: function () {
                    $.blockUI();
                    _self.downloadApkFile();
                }
            });
        } else {
            _self.addUpdateLog("程序是最新版本，无需更新");
            _self.updateModules();
        }

    };
    Update.prototype.onGetApkVersionError = function(data, type) {
        _self.addUpdateLog("获取程序版本信息失败");
        console.log("get apk version failed");
        _self.completeCallback();
        return true;
    };
    Update.prototype.installCancelCallback = function() {
        _self.addUpdateLog("安装被取消", true);
        $.unblockUI();
        $("#afui").popup({
            title: "警告",
            message: "你取消了安装，程序没有更新!",
            cancelText: "确定",
            cancelCallback: function () {
                $.blockUI();
                _self.completeCallback();
            },
            cancelOnly: true
        });
    };
    Update.prototype.downloadApkFile = function() {
        var fileTransfer = new FileTransfer();
        var url;
        if (_os == "android") {
            url = app.route.apkDownloadUrl;
        } else {
            url = app.route.wwwDownloadUrl;
        }
        var uri = encodeURI(url);
        console.log(uri);

        fileTransfer.onprogress = _self.downloadProcessing;
        _self.addUpdateLog("开始下载安装程序", true);
        fileTransfer.download(uri, DEST_APK_FILE,
            function(entry) {
                console.log("download to "+entry.fullPath);
                if (_os == "android") {
                    navigator.utils.installApk(DEST_APK_FILE);
                    setTimeout(function () {
                        _self.installCancelCallback();
                    }, 500);
                } else if (_os == "ios" || _os == "windows") {
                    _self.addUpdateLog("正在安装程序...", true);
                    navigator.utils.installApk(DEST_APK_FILE, function(){
                        navigator.utils.writeFileSync(navigator.utils.getWorkPath()+"www/version.json", JSON.stringify(_self.version));

                        _self.addUpdateLog("安装程序成功", true);
                        _self.addUpdateLog("点击确定后重启", true);
                        $("#updatelist").append(app.utils.buttonHtml([{
                            text:"确定",
                            click:"navigator.utils.restart()",
                            width:98
                        }]));
                        $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
                        $.unblockUI();
                    });
                }
            },
            function(error) {
                _self.addUpdateLog("下载安装程序失败");
                console.log(JSON.stringify(error));
                _self.onCompleteCallback(); //下载失败后不再更新模块
            }
        );
    };
    Update.prototype.downloadProcessing = function(progressEvent) {
        if (progressEvent.lengthComputable) {
            var loaded=progressEvent.loaded;
            var total=progressEvent.total;
            var percent=parseInt((loaded/total)*50)+"%";
            if (!_self.downLoadFlag) {
                _self.downLoadFlag = true;
                $("#updatelist").append("<li id='ud_download_progress'>"+percent+"</li>");
                $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
            } else {
                $("#ud_download_progress").html(percent);
            }
        }
    };
	Update.prototype.getModulesConfig = function() {
		_self.addUpdateLog("正在获取模块配置...");
        var timeout = (_self.from == _self.FROM_MORE_PAGE)?null:3000; //启动页面检查更新超时为3秒
		app.utils.ajax({
			type : "GET",
			url : app.route.modulesConfigUrl,
            timeout : timeout,
			success : _self.onGetModulesConfigSuccess,
			error : _self.onGetModulesConfigError
		});
	};
	Update.prototype.onGetModulesConfigSuccess = function(data) {
		console.log(data);
		_self.addUpdateLog("正在检查模块更新...");
		_self.remoteConfig = data;
		_self.checkUpdateModules(data);
	};
	Update.prototype.onGetModulesConfigError = function(data) {
		_self.addUpdateLog("获取模块配置失败");
		console.log("get remote config file failed");
		_self.completeCallback();
        return true;
	};
	Update.prototype.checkUpdateModules = function(data) {
		//检查更新
		var needUpdate = true;
		_self.needUpdateModules = [];
		for (var i=0; i<data.length; i++) {
			needUpdate = true;
			for (var j=0; j<_self.config.length; j++) {
				if (data[i].name == _self.config[j].name) {
					if (data[i].version <= _self.config[j].version) {
						needUpdate = false;
					}
					break;
				}
			}
			if (needUpdate) {
				console.log("need update module: "+data[i].name);
				_self.needUpdateModules.push(data[i].name);
			} else {
				console.log("not need update module: "+data[i].name);
			}
		}
		
		if (_self.needUpdateModules.length == 0) {
			console.log("have no modules need update");
            _self.addUpdateLog("没有模块可以更新");
            _self.completeCallback();
		} else {
            $.unblockUI();
            $("#afui").popup({
                title: "模块更新提示",
                message: "有可更新的模块，现在需要更新吗?",
                cancelText: "跳过",
                cancelCallback: function () {
                    _self.addUpdateLog("跳过更新模块");
                    $.blockUI();
                    _self.completeCallback();
                },
                doneText: "更新",
                doneCallback: function () {
                    $.blockUI();
                    _self.startUpdateModules();
                }
            });
		}
	};
	Update.prototype.startUpdateModules = function() {
        _self.curUpdateIndex = 0;
        _self.doUpdateModules(_self.curUpdateIndex);
    };
	Update.prototype.doUpdateModules = function(index) {
		var totalIndex = _self.needUpdateModules.length;
		_self.curUpdateIndex = index;
		if (index < totalIndex) {
			console.log("start download module: " + _self.needUpdateModules[index]);
			_self.addUpdateLog("正在下载 "+_self.needUpdateModules[index]+" 模块...", true);
			_self.downloadModule(_self.needUpdateModules[index], function() {
				_self.doUpdateModules(_self.curUpdateIndex+1);
			});
		} else {
            _self.rewriteConfigFile();
		}
	};
	Update.prototype.downloadModule = function(module, callback) {
		var fileTransfer = new FileTransfer();
		var uri = encodeURI(app.route.modulesDownloadUrl + module + "/" + module+".zip");
		console.log(uri);
		var filePath;
        if (_os == "android") {
            filePath = _external + "modules/" + module + ".zip";
        } else {
            filePath = navigator.utils.getWorkPath() + "www/modules/"+ module + ".zip";
        }

		fileTransfer.download(uri, filePath, 
			function(entry) {
				_self.addUpdateLog("下载 "+module+" 模块成功", true);
				console.log("download complete: " + entry.fullPath);
				setTimeout(_self.unzipModule, 0, module, callback);
			},
			function(error) {
				_self.addUpdateLog("下载 "+module+" 模块失败", true);
				console.log(JSON.stringify(error));
                _self.completeCallback(true);
			}
		);
	};
	Update.prototype.unzipModule = function(module, callback) {
		var modulePath;
        if (_os == "android") {
            modulePath = _external + "modules/" + module;
        } else {
            modulePath = navigator.utils.getWorkPath() + "www/modules/" + module;
        }
		console.log("start unzip module: " + module);
		_self.addUpdateLog("正在解压 "+module+" 模块...", true);
        var winWidth = $(window).width();
        var winHeight = $(window).height();
		navigator.utils.unzip(modulePath + ".zip", modulePath, winWidth, winHeight,function(state){
			if (state == "start") {
				console.log("start unzip in java module: " + module);
			} else if (state == "finish") {
				_self.addUpdateLog("解压 "+module+" 模块成功", true);
				console.log("unzip success: " + module);
				callback();
			}
		}, function(err){
			_self.addUpdateLog("解压 "+module+" 模块失败", true);
			console.log("unzip failed: " + module);
            _self.completeCallback(true);
		});
	};
	Update.prototype.addUpdateLog = function (info, force) {
        if (_self.from == _self.FROM_MORE_PAGE || force) {
            $("#updatelist").append("<li>" + info + "</li>");
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
        }
	};
	Update.prototype.clearUpdateLog = function () {
        _self.downLoadFlag = false;
		$("#updatelist").html('');
	};

    return new Update();
});
