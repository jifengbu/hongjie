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
        getVersionInfo: function(success, fail) {
            var path = window.require('path');
            var guiApp = window.require('nw.gui').App;

            if (guiApp.manifest.verCode>=100001) {
                success({
                    verCode:100001,
                    verName:'1.0.1',
                    description:'开发版本号'
                });
            } else {
                var p = path.join(guiApp.dataPath, 'www', 'version.json');
                $.getJSON(p, function(version){
                    success(version);
                }, function() {
                    fail();
                });
            }
        },
        installApk: function(zipFile, callback) {
            console.log("installApk "+zipFile);
            var fs = window.require('fs');
            var unzip = window.require('unzip');
            var destDir = window.require('nw.gui').App.dataPath;
            fs.createReadStream(zipFile).pipe(unzip.Extract({ path: destDir}))
                .on('close', function () {
                    fs.unlinkSync(zipFile);
                    callback();
                });
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
            year = year||d.getFullYear();
            month = month||d.getMonth()+1;
            day = day||d.getDate();
            month = (month < 10)?"0"+month:month;
            day = (day < 10)?"0"+day:day;
            var value = year+"-"+month+"-"+day;
            console.log(value);
            app.utils.popup({
                message: "<input type='date' id='navigator_input_date' value='"+value+"' class='af-ui-forms' style='color:black;font:bold;'>",
                cancelText: "取消",
                cancelCallback: function () {},
                doneText: "确定",
                doneCallback: function () {
                    var date = $("#navigator_input_date").val();
                    date = date.split('-');
                    success({year:date[0]*1, month:date[1]*1, day:date[2]*1});
                },
                suppressTitle: true
            });
        },
        scanner: function(callback) {
            app.utils.clearWaitProgress();
            app.utils.popup({
                title: "模拟扫描二维码:",
                message: "<input type='text' id='navigator_input_scan_id' class='af-ui-forms' style='color:black;font:bold;'>",
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
        setSysMenu: function() {
            var gui = window.require('nw.gui');
            var menu = new gui.Menu();
            var win = gui.Window.get();
            var showTray = function() {
                var tray = new gui.Tray({ title: '迈瑞凯销售系统', icon: 'logo.png' });
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
        writeFileSync: function(filename, data) {
            window.require("fs").writeFileSync(filename, data);
        },
        getWorkPath: function() {
            return window.require('nw.gui').App.dataPath+"/";
        },
        getDocumentPath: function(success) {
            success("./");
        }
	};
});  

