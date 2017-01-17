define(function(require) {
	"use strict";
	var MAX_PANNEL_NUMBER = 100;
    var UI_NOT_BOLCK = 0;
    var UI_BOLCK_NET = 1;
    var UI_BOLCK_PROGRESS = 2;
    var UI_BOLCK_ALL = 3;
    var UI_BOLCK_POPUP = 4;
    var BLOCK_OPACITY = 0.3;

    var TICKET_NOTIFY_ID = 1000,
        MESSAGE_NOTIFY_ID = 1001,
        WORK_NOTIFY_ID = 1002;

	var _self;
	function Utils() {
		_self = this;
		_self.panels = [];
		_self.uiBlockType = false;
        _self.asyncRequestCnt = 0;
	}

	Utils.prototype.panelID = function(id) {
		return "#panel_"+id;
	};
    Utils.prototype.toast = function(message) {
        if (!app.pause) {
            navigator.utils.toast(message);
        }
    };
    Utils.prototype.playSound = function(src) {
        if (app.notPlaySound||app.pause) {
            return;
        }
        if (_self.audio_sound) {
            _self.audio_sound.stop();
            _self.audio_sound.release();
            _self.audio_sound = null;
        }
        _self.audio_sound = new Media((_os=='desktop'||_from=='web')?src:app.resPath+src);
        _self.audio_sound.play();
    };
    Utils.prototype.stopRing = function() {
        if (_self.audio_ring) {
            _self.ring_state = 0;
            _self.audio_ring.stop();
            _self.audio_ring.release();
            _self.audio_ring = null;
        }
    };
    Utils.prototype.playRing = function(src) {
        console.log("playRing:" + src);
        _self.ring_state = 1;
        if (_os=='desktop'||_from=='web') {
            _self.audio_ring = new Media(src, 1);
        } else {
            _self.audio_ring = new Media(app.resPath+src, null, null, function(status) {
                if(status==Media.MEDIA_STOPPED && _self.ring_state==1) {
                    _self.audio_ring.play();
                }
            });
        }
        _self.audio_ring.play();
    };
    Utils.prototype.addTicketNotification = function(subject, message, isReply) {
        if (app.notShowNotify||!app.pause) {
            return;
        }
        subject = $.base64.decode(subject, true);
        message = $.base64.decode(message, true);
        subject = (isReply)?"【ticket新回复】:":"【ticket新消息】:"+subject;
        navigator.utils.addNotification(TICKET_NOTIFY_ID, subject, message);
    };
    Utils.prototype.addMessageNotification = function(username, message, isGroup) {
        if (app.notShowNotify||!app.pause) {
            return;
        }
        if (isGroup) {
            username = "【群】:"+username;
        }
        username = "来自 "+username+" 的消息"
        navigator.utils.addNotification(MESSAGE_NOTIFY_ID, username, message);
    };
    Utils.prototype.addWorkNotification = function(module, message) {
        if (app.notShowNotify||!app.pause) {
            return;
        }
        navigator.utils.addNotification(WORK_NOTIFY_ID, module, message);
    };
    Utils.prototype.noticeNewMessage = function() {
        if (!_self.havePlayNoticeNewMessage) {
            _self.havePlayNoticeNewMessage = true;
            _self.playSound(app.resource.aud_new_message);
        }
    };
    Utils.prototype.changeUserHead = function(el, userid) {
        var classList = el.className.split(/\s+/g);
        var flag = false;
        for (var i in classList) {
            var classitem = classList[i];
            if (/user_head_.*/.test(classitem)) {
                flag = true;
                classList[i] = 'user_head_'+userid;
            }
        }
        if (!flag) {
            classList.push('user_head_'+userid);
        }
        el.className = classList.join(' ');
    };
    Utils.prototype.timeToStr = function(time) {
        var sec = time;
        var min = Math.floor(time/60);
        sec = sec-min*60;
        var hour = Math.floor(min/60);
        min = min-hour*60;
        var ret = '';
        if (hour) {
            ret = ret + hour + '时';
        }
        if (min) {
            ret = ret + min + '分';
        }
        return ret?ret:sec+'秒';
    };
    //ios时间格式为yyyy/mm/dd hh:ii:ss
    Utils.prototype.adjustDate = function(time) {
        return time.replace(/(\d+)-(\d+)-(\d+)/, '$1/$2/$3');
    };
    Utils.prototype.getShowDate = function(time) {
        var date = new Date(time);
        var now = new Date();
        date.setHours(0);date.setMinutes(0);date.setSeconds(0);date.setMilliseconds(0);
        now.setHours(0);now.setMinutes(0);now.setSeconds(0);now.setMilliseconds(0);
        if (now.getTime() == date.getTime()) {
            var d = new Date(time);
            var h = d.getHours();
            var pre = h<6?'凌晨':h<12?'早上':h<13?'中午':h<17?'下午':h<22?'晚上':'深夜';
            return pre+h+":"+d.getMinutes();
        }
        date.getDate(date.getDate()+1);
        if (now.getTime() == date.getTime()) {
            return '昨天';
        }
        date.getDate(date.getDate()+1);
        if (now.getTime() == date.getTime()) {
            return '前天';
        }
        var d = new Date(time);
        return (d.getMonth()+1)+'月'+ d.getDate()+'日';
    };
    Utils.prototype.getShowDateTime = function(time) {
        var date = new Date(time);
        var now = new Date();
        now.setHours(0);now.setMinutes(0);now.setSeconds(0);now.setMilliseconds(0);
        date.setHours(0);date.setMinutes(0);date.setSeconds(0);date.setMilliseconds(0);
        var d = new Date(time);
        var h = d.getHours();
        var pre = h<6?'凌晨':h<12?'早上':h<13?'中午':h<17?'下午':h<22?'晚上':'深夜';
        if (now.getTime() == date.getTime()) {
            return pre+h+":"+d.getMinutes();
        }
        date.getDate(date.getDate()+1);
        if (now.getTime() == date.getTime()) {
            return '昨天 '+pre+h+":"+d.getMinutes();
        }
        date.getDate(date.getDate()+1);
        if (now.getTime() == date.getTime()) {
            return '前天 '+pre+h+":"+d.getMinutes();
        }
        return (d.getMonth()+1)+'月'+ d.getDate()+'日 '+h+":"+d.getMinutes();
    };
    Utils.prototype.clearLocalStorage = function(filters) {
        var save = {};
        for (var key in filters) {
            save[filters[key]] = localStorage[filters[key]];
        }
        localStorage.clear();
        for (var key in filters) {
            localStorage[filters[key]] = save[filters[key]];
        }
    };
    Utils.prototype.isTestVersion = function(mainVersion) {
        mainVersion = mainVersion||app.info.mainVersion;
        return (mainVersion > 10 && mainVersion < 100);
    };
    Utils.prototype.isDevelopVersion = function(mainVersion) {
        mainVersion = mainVersion||app.info.mainVersion;
        return (mainVersion > 100);
    };
	Utils.prototype.hideModal = function() {
        _self.activeIsModal = false;
        $.ui.hideModal();
    };
	Utils.prototype.showHide = function(obj, objToHide) {
        if (!_self.showHideRefresh) {
            _self.showHideRefresh = true;
            var className = obj.className;
            if (/expanded/.test(obj.className)) {
                obj.className = className.replace(/expanded/, 'collapsed');
            } else {
                obj.className = className.replace(/collapsed/, 'expanded');
            }
            $("#" + objToHide).toggle();
            setTimeout(function(){ //因为android会出现toggle两次，所以使用延时控制
                _self.showHideRefresh = false;
            }, 500);
        }
	};
    Utils.prototype.showHideEx = function(obj, objToHide) {
        if (/down/.test(obj.className)) {
            $(obj).removeClass("down");
            $(obj).addClass("up");
        } else if (/up/.test(obj.className)) {
            $(obj).removeClass("up");
            $(obj).addClass("down");
        }
        $("#"+objToHide).toggle();
    };
	Utils.prototype.showError = function(err) {
        _self.toast(err);
	};
    Utils.prototype.showChatError = function(err) {
        _self.toast(app.error[err]);
    };
	Utils.prototype.showNetError = function(type) {
		if (type == "timeout") {
			_self.showError(app.error.NET_TIMEOUT_ERROR);
		} else if (type == "parsererror") {
            _self.showError(app.error.JSON_PARSE_ERROR);
        } else if (!_self.haveAbort) {
			_self.showError(app.error.SERVER_ERROR);
		}
	};
    Utils.prototype.checkNetwork = function() {
        //console.log(navigator.connection);
        if (navigator.connection.type == Connection.UNKNOWN
            || navigator.connection.type == Connection.NONE) {
            return false;
        }
        return true;
    };
    Utils.prototype.newDate = function(time) {
        var date = (time == null)?new Date():new Date(time);
        var m = date.getMonth()+ 1, d = date.getDate();
        return {
            year : date.getFullYear(),
            month : m<10?'0'+m:m,
            day : d<10?'0'+d:d
        };
    };
    Utils.prototype.dateEquals = function(date1, date2) {
        return date1.year==date2.year&&date1.month==date2.month&&date1.day==date2.day;
    };
    Utils.prototype.dateToString = function(date) {
        return date.year+"-"+date.month+"-"+date.day;
    };
    Utils.prototype.stringToDate = function(str) {
        var arr = str.split('-');
        return {
            year : arr[0],
            month : arr[1],
            day : arr[2]
        };
    };
    Utils.prototype.getDateDiff = function(startTime, endTime, type/*dhms*/) {
        if (!(startTime instanceof  Date)) {
            startTime = startTime.replace(/\-/g, "/");
            startTime = new Date(startTime);
        }
        if (!(endTime instanceof  Date)) {
            endTime = endTime.replace(/\-/g, "/");
            endTime = new Date(endTime);
        }
        var result = "",
            mustShow = false,
            sec = (endTime.getTime()-startTime.getTime())/1000;
        if (sec < 60) {
            type += 's';
        }
        if (type.indexOf('d')!=-1) {
            var day = Math.floor(sec/3600/24);
            if (mustShow||day>0) {
                result += day + "天";
                sec -= day*3600*24;
                mustShow = true;
            }
        }
        if (type.indexOf('h')!=-1) {
            var hour = Math.floor(sec/3600);
            if (mustShow||hour>0) {
                result += hour + "小时";
                sec -= hour * 3600;
                mustShow = true;
            }
        }
        if (type.indexOf('m')!=-1) {
            var min = Math.floor(sec / 60);
            if (mustShow||min>0) {
                result += min + "分钟";
                sec -= min * 60;
            }
        }
        if (type.indexOf('s')!=-1) {
            result += sec + "秒";
        }
        return result;
    };
    Utils.prototype.ajax = function(opt) {
        _self.haveAbort = false;
        if (!_self.checkNetwork()) {
            _self.showError("网络没有打开");
            _self.clearWait();
            return false;
        }
        if (!opt.dataType) { //默认返回数据时json，如果不是需要手动设置
            opt.dataType = 'json';
        }

        if (!opt.timeout) {
            opt.timeout = app.route.timeout;
        }
        var nosound = opt.nosound;
        delete opt.nosound;
        var error =  opt.error; //opt的error return true 终止传递
        opt.error = function (ret, type) {
            if (!error || !error(ret, type)) {
                _self.showNetError(type);
                _self.clearWait();
            }
            if (!nosound) {
                _self.playSound(app.resource.aud_fail_tip);
            }
            if (_self.popup_inst) {
                _self.popup_inst.remove();
                _self.popup_inst = null;
            }
        }
        var success =  opt.success;
        opt.success = function (ret, type) {
            success(ret);
            if (_self.popup_inst) {
                _self.popup_inst.remove();
                _self.popup_inst = null;
            }
        }
        if (_from == "web") {
            var option = opt;
            var successfunc = option.success;
            var errorfunc = option.error;
            delete option.success;
            delete option.error;

            var op = {
                type:"POST",
                url: "/proxy",
                data:option,
                timeout: opt.timeout,
                dataType: opt.dataType,
                success:successfunc,
                error:errorfunc
            };
            opt = op;
        }
        _self.request = $.ajax(opt);
        return true;
    };
    Utils.prototype.ajaxAsync = function(opt) {
        if (!_self.checkNetwork()) {
            _self.showError("网络没有打开");
            return false;
        }
        if (!opt.dataType) { //默认返回数据时json，如果不是需要手动设置
            opt.dataType = 'json';
        }
        var error =  opt.error; //opt的error return true 终止传递
        opt.error = function (ret, type) {
            _self.setAsyncRequestOff();
            if (!error || !error(ret, type)) {
                _self.showNetError(type);
            }
        }
        var success =  opt.success;
        opt.success = function (ret, type) {
            _self.setAsyncRequestOff();
            success(ret);
        }
        _self.setAsyncRequestOn();
        _self.request = $.ajax(opt);
        return true;
    };
	Utils.prototype.setAsyncRequestOn = function () {
        if (_self.asyncRequestCnt==0) {
            $("#content").append('<span class="ui-async-on">1</span>');
        } else {
            $("#content>.ui-async-on").html(_self.asyncRequestCnt+1);
        }
        _self.asyncRequestCnt++;
    };
	Utils.prototype.setAsyncRequestOff = function (id) {
        _self.asyncRequestCnt--;
        if (_self.asyncRequestCnt == 0) {
            $('#content>.ui-async-on').remove();
        } else {
            $("#content>.ui-async-on").html(_self.asyncRequestCnt);
        }
    };
	Utils.prototype.isActivePanel = function (id) {
        id = 'panel_' + id;
        var activeDiv = $.ui.activeDiv.id;
        return activeDiv==id || '#'+id==activeDiv;
    };
	Utils.prototype.getAsyncRequestData = function (id) {
        var rd = localStorage["requestdata_"+id];
        return (!rd)?null:JSON.parse(rd);
    };
    Utils.prototype.setAsyncRequestData = function (id, data, index, extra) {
        if (!data) {
            return;
        }
        var rd = localStorage["requestdata_"+id],
            dd = (!rd)?{}:JSON.parse(rd);

        dd.time = new Date().getTime();
        dd.extra = extra;

        if (index == null) {
            dd.data = data;
        } else {
            dd.data = (!dd.data)?data: dd.data.cancat(data);
            dd.index = index;
        }
        localStorage["requestdata_"+id] = JSON.stringify(dd);
    };
	Utils.prototype.initialPullRefresh = function (id, down, up) {
        var scroller = $(id[0]=='#'?id:_self.panelID(id)).scroller();
        scroller.addPullToRefresh();
        if (down) {
            scroller.runCB = true;
            scroller.upRefresh = true;
            scroller.setRefreshContentPullDown(down.info);
            $.bind(scroller, "refresh-trigger", function () {
                scroller.refresh_trigger = true;
            });
            $.bind(scroller, "refresh-cancel", function () {
                scroller.refresh_trigger = false;
            });
            $.bind(scroller, "refresh-release", function () {
                var that = this;
                if (scroller.refresh_trigger) {
                    scroller.refresh_trigger = false;
                    down.callback();
                }
                setTimeout(function () {
                    that.hideRefresh();
                }, 0);
                return false;
            });
        }
        if (up) {
            scroller.downRefresh = true;
            scroller.setRefreshContentPullUp(up.info);
            $.bind(scroller, "down-refresh", function () {
                up.callback();
            });
        }
        scroller.enable();

        return scroller;
    };
	Utils.prototype.uninitialPullRefresh = function (scroller) {
        $.unbind(scroller, "refresh-trigger");
        $.unbind(scroller, "refresh-cancel");
        $.unbind(scroller, "refresh-release");
        $.unbind(scroller, "down-refresh");
    };
	Utils.prototype.addPanel = function (id, attr, html) {
		attr = attr || {};
		var eid = _self.panelID(id);
		var el = $.query(eid).get(0);
		if (el) {
			console.log("loadPanel: "+ id +" have existed in pannels");
			return;
		}
		_self.panels.push(id);
		if (_self.panels.length > MAX_PANNEL_NUMBER) {
			var del = _self.panels.shift();
			if (del) {
				$(_self.panelID(del)).remove();
			}
		}
		$.ui.addContentDiv(eid, html, attr.title);
		var panel = $(eid);
		panel.attr("data-header", attr.header);
		panel.attr("data-footer", attr.footer);
		panel.attr("data-load", attr.loadfunc);
		panel.attr("data-unload", attr.unloadfunc);
		panel.attr("data-modal", attr.modal);
        $.ui.loadContent(eid, false, false, attr.transition);
	};
	Utils.prototype.loadPanel = function (id, attr) {
		attr = attr || {};
        if (attr.modal) {
            _self.activeIsModal = true;
        }
		var eid = _self.panelID(id);
		var el = $.query(eid).get(0);
		if (el) {
			var panel = $(eid);
			$.ui.loadContent(eid, false, false, attr.transition);
			console.log("loadPanel: "+ id +" have existed in pannels");
			return;
		}
		_self.panels.push(id);
		if (_self.panels.length > MAX_PANNEL_NUMBER) {
			var del = _self.panels.shift();
			if (del) {
				$(_self.panelID(del)).remove();
			}
		}
        var page = require.toUrl(id+".html");
		$.ajax({url:page, success:function (data) {
			    $.ui.addContentDiv(eid, data, attr.title);
				var panel = $(eid);
				panel.attr("data-header", attr.header);
				panel.attr("data-footer", attr.footer);
				panel.attr("data-load", attr.loadfunc);
				panel.attr("data-unload", attr.unloadfunc);
				panel.attr("data-modal", attr.modal);
				$.ui.loadContent(eid, false, false, attr.transition);
			}
	  });
	};
    Utils.prototype.SP = function(n) {
        var space = "";
        while (n-->0)space+="&nbsp;";
        return space;
    };
    Utils.prototype.buttonHtml = function(opts) {
        var html = '<table width="100%"><tr width="100%">';
        for (var i=0,len=opts.length; i<len; i++) {
            var opt = opts[i];
            var width = opt.width||94;
            var left = (100-width)/2;
            var style = 'style="width:'+width+'%;left:'+left+'%;position:relative;'+(opt.style||"")+'"';
            html+='<td width="'+(100/opts.length)+'%"><a class="round_button" '+style+(opt.click?(' onclick="'+opt.click):" ") +'">'+opt.text+'</a></td>';
        }
        html += "</tr></table>";
        return html;
    };
    Utils.prototype.popup = function(opt) {
        var cancelCallback = opt.cancelCallback;
        if (cancelCallback) {
            opt.cancelCallback = function(el) {
                _self.uiBlockType = UI_NOT_BOLCK;
                _self.popup_inst = null;
                cancelCallback(el);
            }
        }
        var doneCallback = opt.doneCallback;
        if (doneCallback) {
            opt.doneCallback = function(el) {
                _self.uiBlockType = UI_NOT_BOLCK;
                _self.popup_inst = null;
                doneCallback(el);
            }
        }
        _self.uiBlockType = UI_BOLCK_POPUP;
        _self.popup_inst = $("#afui").popup(opt);
        return _self.popup_inst;
    };
    Utils.prototype.popupEx = function (html, title, doneCallback, cancelCallback) {
        var id = "us_popup_ex";
        var eid = _self.panelID(id);
        _self.popupExDone = function() {
            if (doneCallback) {
                doneCallback();
            }
            app.utils.hideModal();
            _self.popupExDone = null;
        };
        _self.popupExCancel = function() {
            if (cancelCallback) {
                cancelCallback();
            }
            app.utils.hideModal();
            _self.popupExCancel = null;
        };
        var header = '<header>';
        header += '<h1>'+title+'</h1>';
        header += '<a class="button icon close" onclick="app.utils.popupExCancel()"></a>';
        header += '<a class="button  icon check" style="float:right" onclick="app.utils.popupExDone()"></a>';
        header += '</header>';
        html = header + html;
        var el = $.query(eid).get(0);
        if (el) {
            $.ui.updateContentDiv(eid, html);
            $.ui.loadContent(eid, false, false, "fade");
        } else {
            $.ui.addContentDiv(eid, html);
            var panel = $(eid);
            panel.attr("data-header", true);
            panel.attr("data-footer", false);
            panel.attr("data-modal", true);
            $.ui.loadContent(eid, false, false, "fade");
        }
    };
    Utils.prototype.setWaitProgress = function(info) {
        $.blockUI(BLOCK_OPACITY);
        $.ui.showMask(info);
        _self.uiBlockType = UI_BOLCK_PROGRESS;
    };
    Utils.prototype.clearWaitProgress = function() {
        $.unblockUI();
        $.ui.hideMask();
        _self.uiBlockType = UI_NOT_BOLCK;
    };
	Utils.prototype.setWait = function(info) {
		$.blockUI(BLOCK_OPACITY);
		$.ui.showMask(info);
		_self.uiBlockType = UI_BOLCK_NET;
        if (_os != "android") {
            $('#mask_backButton').click(function(){
                _self.showCancelRequest();
            });
        }
	};
	Utils.prototype.clearWait = function() {
		$.unblockUI();
		$.ui.hideMask();
		_self.uiBlockType = UI_NOT_BOLCK;
	};
	Utils.prototype.blockUI = function(info) {
		$.blockUI(BLOCK_OPACITY);
		_self.uiBlockType = UI_BOLCK_ALL;
	};
	Utils.prototype.unblockUI = function() {
		$.unblockUI();
		_self.uiBlockType = UI_NOT_BOLCK;
	};
    Utils.prototype.setReleasePanel = function(panel) {
        _self.toReleasePanel = panel;
    };
    Utils.prototype.setRemoveMenuitemPanel = function(panel) {
        _self.toRemoveMenuitem = panel;
    };
    Utils.prototype.showCancelRequest = function() {
        $.unblockUI();
        _self.popup_inst = $("#afui").popup({
            title: "温馨提示",
            message: "你确定要终止请求吗?",
            cancelText: "取消",
            cancelCallback: function () {
                _self.popup_inst = null;
                setTimeout(function(){
                    $.blockUI(BLOCK_OPACITY);
                    $('#mask_backButton').click(function(){
                        _self.showCancelRequest();
                    });
                }, 10);
            },
            doneText: "确定",
            doneCallback: function () {
                _self.popup_inst = null;
                _self.haveAbort = true;
                _self.request.onreadystatechange = function(){};
                _self.request.abort();
                _self.clearWait();
            },
            cancelOnly: false
        });
    }
    Utils.prototype.onBackButton = function(e) {
        if (_self.uiBlockType == UI_BOLCK_ALL || _self.uiBlockType == UI_BOLCK_PROGRESS) {
            console.log("UI been Blocked, Can't return");
            return;
        }
        if (_self.uiBlockType == UI_BOLCK_NET) {
            _self.showCancelRequest();
            return;
        }
        if (_self.uiBlockType == UI_BOLCK_POPUP) {
            if (_self.popup_inst) {
                _self.uiBlockType == UI_NOT_BOLCK;
                _self.popup_inst.remove();
                $.unblockUI();
                _self.popup_inst = null;
            }
            return;
        }

        if ($.ui.actionsheetShow) {
            $.ui.actionsheetShow = false;
            app.utils.actionsheet.hideSheet();
            return;
        }
        if (_self.activeIsModal) {
            _self.hideModal();
            return;
        }
        if (_self.toRemoveMenuitem) {
            _self.toRemoveMenuitem.removeMenuitemAddIcon();
            return;
        }
        if (_self.toReleasePanel) {
            var activeId = $.ui.activeDiv.id,
                releaseId = 'panel_' + _self.toReleasePanel.id;
            if (activeId == releaseId || '#' + releaseId == activeId) {
                _self.toReleasePanel.release();
            }
        }
        if ($.ui.history.length > 0) {
            $.ui.goBack();
            _self.exitFlag = false;
            return;
        }
        if (!_self.exitFlag) {
            _self.toast("再点击一次退出");
            _self.exitFlag = true;
            window.setTimeout(function() {
                _self.exitFlag = false;
            }, 3000);
        } else {
            //app.socket.disconnect();
            navigator.utils.exitApp();
        }
    };

	return new Utils();
});
