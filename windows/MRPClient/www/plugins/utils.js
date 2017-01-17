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
        unzip: function(zipFile, outPath, winWidth, winHeight, success, error) {
            var fs = window.require('fs');
            var unzip = window.require('unzip');
            fs.createReadStream(zipFile).pipe(unzip.Extract({ path: outPath}))
                .on('close', function () {
                    fs.unlinkSync(zipFile);
                    success("finish");
                })
                .on('error', function (err) {error(err)});
        },
		callNumber: function(number) {
			app.utils.toast('桌面客户端不支持拨打电话');
		},
		sendSms: function(number) {
			app.utils.toast('桌面客户端不支持发送短信');
		},
        genScreenCss: function(cssPath, cssFile, winWidth, winHeight) {
            requirejs(["less!"+"/test/css/screen.less"]);
        },
        getLocalValue: function(tag, success) {
            success(localStorage.getItem(tag));
        },
        setLocalValue: function(tag, value) {
            localStorage.setItem(tag, value);
        },
        exitApp: function() {
            navigator.app.exitApp();
        },
        restart: function() {
            var child,
            child_process = window.require("child_process"),
            gui = window.require('nw.gui'),
            win = gui.Window.get();

            if (window.process.platform == "darwin") {
                child = child_process.spawn("open", ["-n", "-a", process.execPath.match(/^([^\0]+?\.app)\//)[1]], {detached:true});
            } else {
                child = child_process.spawn(process.execPath, [], {detached: true});
            }
            child.unref();
            win.hide();
            gui.App.quit();
        },
        unzipWWW: function(zipFile, success, fail) {
            console.log("unzipWWW "+zipFile);
            var fs = window.require('fs');
            var unzip = window.require('unzip');
            var destDir = window.require('nw.gui').App.dataPath;
            fs.createReadStream(zipFile).pipe(unzip.Extract({ path: destDir}))
                .on('close', function () {
                    fs.unlinkSync(zipFile);
                    success();
                }).on('error', function() {
                    fail();
                });
        },
        installApp: function(zipFile, success, fail) {
            console.log("installApp "+zipFile);
            this.unzipWWW(zipFile, success, fail);
        },
        toast: function(message, timeout) {
            var context = $('#afui').parent();
            var id = "jfbToastMessage";
            timeout = timeout||1000;

            $("#"+id).remove();
            var msgDIV = new Array();
            msgDIV.push('<div id="'+id+'">');
            msgDIV.push('<span>'+message+'</span>');
            msgDIV.push('</div>');
            var msgEntity = $(msgDIV.join('')).appendTo(context);
            var span = msgEntity.find('span')[0];

            var left = context.width()*0.5-span.offsetWidth*0.55+"px";
            var bottom = span.offsetHeight+"px";
            msgEntity.css({position:'absolute','z-index':'2000000',bottom:bottom,left:left,'background-color':'black',color:'white','font-size':'18px',padding:'10px',margin:'10px', 'border-radius':'5px'});

            var actions = new $.css3AnimateQueue();
            actions.push({ id: id,opacity: 0, time: "0ms",previous: true});
            actions.push({ id: id,opacity: 1, time: "200ms",previous: true});
            actions.push({ id: id,opacity: 1, time: timeout+"ms",previous: true});
            actions.push({ id: id,opacity: 0, time: "600ms",previous: true});
            actions.push(function(){msgEntity.remove()});
            actions.run();
        },
        datePickerDialog: function(success, year, month, day) {
            var d = new Date();
            year = year*1||d.getFullYear();
            month = month*1||d.getMonth()+1;
            day = day*1||d.getDate();
            var value = year+"-"+((month < 10)?"0"+month:month)+"-"+((day < 10)?"0"+day:day);
            console.log(value);
            app.utils.popup({
                message: "<input type='date' id='navigator_input_date' value='"+value+"' class='af-ui-forms' style='color:black;font-weight:bold;'>",
                cancelText: "取消",
                cancelCallback: function () {},
                doneText: "确定",
                doneCallback: function () {
                    var date = $("#navigator_input_date").val();
                    date = date.split('-');
                    var y, m, d;
                    y = date[0]*1;m = date[1]*1;d = date[2]*1;
                    success({year:y, month:(m<10?'0'+m:m), day:(d<10?'0'+d:d)});
                },
                suppressTitle: true
            });
        },
        scanner: function(callback) {
            app.utils.clearWaitProgress();
            app.utils.popup({
                title: "模拟扫描二维码:",
                message: "<input type='text' id='navigator_input_scan_id' class='af-ui-forms' style='color:black;font-weight:bold;'>",
                cancelText: "取消",
                cancelCallback: function () {
                    callback({cancelled:true});
                },
                doneText: "确定",
                doneCallback: function () {
                    var scan_id = $("#navigator_input_scan_id").val();
                    callback({text:scan_id});
                }
            });
        },
        setupAudio: function() {
           $('body').append('<audio id="audio_sound" style="display:none"></audio>');
           $('body').append('<audio id="audio_ring" style="display:none" loop></audio>');
           //$('body').append('<audio id="audio_music" style="display:none"></audio>');
        },
        setupFileChooser: function() {
            $('body').append('<input id="file_chooser" type="file" style="display: none"/>');
        },
        setupSysMenu: function() {
            var gui = window.require('nw.gui');
            var menu = new gui.Menu();
            var win = gui.Window.get();
            var showTray = function() {
                var tray = new gui.Tray({ title: 'MRPClient', icon: 'logo.png' });
                tray.on('click', function() {
                    tray.remove();
                    tray = null;
                    return win.show();
                });
            };

            win.on('close', function() {
                return win.close(true);
            });

            menu.append(new gui.MenuItem({
                label: '后退',
                click: function() {
                    var customEvent = document.createEvent('HTMLEvents');
                    customEvent.initEvent("backbutton", true, true);
                    return document.dispatchEvent(customEvent);
                }
            }));
            menu.append(new gui.MenuItem({
                label: '隐藏',
                click: function() {
                    showTray();
                    return win.hide();
                }
            }));
            menu.append(new gui.MenuItem({
                label: '退出',
                click: function() {
                    win.close(true);
                }
            }));

            document.body.addEventListener('contextmenu', function(ev) {
                ev.preventDefault();
                menu.popup(ev.x, ev.y);
                return false;
            });
        },
        chooseFile: function(accept, startdir, success) {
            var el = $("#file_chooser");
            el.removeAttr('nwsaveas');
            el.attr('accept', accept);
            el.attr('nwworkingdir', startdir);
            el.unbind("change").bind("change", function(evt) {
                success(this.value);
            }, false);
            el.click();
        },
        chooseDirectory: function(startdir, success) {
            var el = $("#file_chooser");
            el.removeAttr('nwsaveas');
            el.removeAttr('accept');
            el.attr('nwworkingdir', startdir);
            el.attr('nwdirectory', '');
            el.unbind("change").bind("change", function(evt) {
                success(this.value);
            }, false);
            el.click();
        },
        saveasFile: function(accept, startdir, defaultFile, success) {
            var el = $("#file_chooser");
            el.attr('accept', accept);
            el.attr('nwworkingdir', startdir);
            el.attr('nwsaveas', defaultFile);
            el.unbind("change").bind("change", function(evt) {
                success(this.value);
            }, false);
            el.click();
        },
        readFile: function(filename, success, fail, type) {
            type = type||'utf8';
            window.require("fs").readFile(filename, type, function(err, data){
                if (err) {
                    fail();
                } else {
                    success(data);
                }
            });
        },
        writeFile: function(filename, data, success, fail, type) {
            type = type||'utf8';
            window.require("fs").writeFile(filename, data, type, function(err){
                if (err) {
                    fail();
                } else {
                    success();
                }
            });
        },
        getAppInfo: function(success) {
            var path = window.require('path');
            var guiApp = window.require('nw.gui').App;
            var documentPath = guiApp.dataPath+"/";
            var mainVersion = app.info.mainVersion;
            var maxVersion = guiApp.manifest.verCode;
            var minVersion = app.info.minVersion;

            if (maxVersion>=10000) {
                success({
                    documentPath:documentPath,
                    mainVersion: 10000+mainVersion,
                    maxVersion:maxVersion-10000,
                    minVersion:minVersion
                });
                return;
            }

            var p = path.join(guiApp.dataPath, 'www', 'version.json');
            this.readFile(p, function(data){
                try {
                    var version = JSON.parse(data);
                    success({
                        documentPath:documentPath,
                        mainVersion: version.mainVersion,
                        maxVersion:version.maxVersion,
                        minVersion:version.minVersion
                    });
                } catch (e) {
                    success({
                        documentPath:documentPath,
                        mainVersion: mainVersion,
                        maxVersion:maxVersion,
                        minVersion:minVersion
                    });
                }
            }, function() {
                success({
                    documentPath:documentPath,
                    mainVersion: mainVersion,
                    maxVersion:maxVersion,
                    minVersion:minVersion
                });
            });
        },
        addNotification: function(id, title, msg) {
            console.log('addNotification', [id, title, msg]);
        },
        clearNotification: function(id) {
            console.log("clearNotification", [id||-1]);
        }
    };
});  

