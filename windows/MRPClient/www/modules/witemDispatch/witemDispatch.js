define(function(require) {
	"use strict";
	var _self;
    var US_WITEM_HISTORY = "US_WITEM_HISTORY";
    var MAX_WITEM_LIST_CNT = 10;

	function WitemDispatch() {
		_self = this;
		_self.id = "witemDispatch";
		_self.witem_short_name = "0402";
        _self.witem_history = [];
	}
	
	WitemDispatch.prototype.show = function() {
        _self.getWitemDispatchHistoryList();
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
	};
	WitemDispatch.prototype.onLoad = function() {
		_self.showHistoryList();
	};
    WitemDispatch.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.data = null;
        _self.witem_history = [];
    };
	WitemDispatch.prototype.showHistoryList = function() {
		var html = '',
            list = _self.witem_history;
        for (var key in list) {
            html += '<li>'
            html += '<a href="#" onclick="app.witemDispatch.doGetWitemDispatchList(\''+list[key]+'\')">'+list[key]+'</a>'
            html += '</li>'
        }
        if (!html) {
            html = "没有历史过单的板名称，点击右上角的<添加>按钮添加过单编号，必须输入前4位或更多。";
        }

        //console.log(html);
		$('#witem_history_list').html(html);
	};
	WitemDispatch.prototype.showPopupInputBox = function() {
        app.utils.popup({
			title: "输入板名称(至少4位):",
			message: "<input type='text' id='witem_input_short_name' class='af-ui-forms' style='color:black;font-weight:bold;'>",
			cancelText: "取消",
			cancelCallback: function () {},
			doneText: "确定",
			doneCallback: function () {
				var short_name = $("#witem_input_short_name").val();
				if (short_name.length >= 4) {
					_self.doGetWitemDispatchList(short_name);
				} else {
					app.utils.toast("至少输入前4位");
				}
			},
			cancelOnly: false
		});
	};
	WitemDispatch.prototype.doGetWitemDispatchList = function(short_name) {
        _self.short_name = short_name;
        var param = {
            op: 16,
            is_first: 1,
            workitem_short_name:_self.short_name,
            uid: app.login.userid
        };
        console.log(param);
        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetWitemDispatchListSuccess
        });
    };
    WitemDispatch.prototype.onGetWitemDispatchListSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        if (!data.wdisp_list || !data.wdisp_list.length) {
            app.utils.toast("该加工对象没有可以过数的派工单");
        } else {
            _self.saveWitemDispatchHistoryList(data);
            require('witemDispatchDetail').show(data, _self.short_name, _self.id);
            _self.short_name = null;
        }
        app.utils.clearWait();
    };
    WitemDispatch.prototype.saveWitemDispatchHistoryList = function (data) {
        var wdisp_list = data.wdisp_list;
        for (var i=0,len=wdisp_list.length; i<len; i++) {
            if (_self.witem_history[0] != wdisp_list[i].witem_name) {
                _self.addWitemDispatchHistoryList(wdisp_list[i].witem_name);
            }
        }
    };
    WitemDispatch.prototype.getWitemDispatchHistoryList = function () {
        _self.witem_history = app.us.getObjectData(US_WITEM_HISTORY)||[];
    };
    WitemDispatch.prototype.addWitemDispatchHistoryList = function (witem_name) {
        var arr = _self.witem_history;
        var len = arr.length;
        for (var i=0; i<len; i++) {
            if (witem_name == arr[i]) {
                arr.splice(i, 1);
                break;
            }
        }
        len = arr.unshift(witem_name);
        if (len > MAX_WITEM_LIST_CNT) {
            arr.pop();
        }
        _self.witem_history = arr;
        app.us.setObjectData(US_WITEM_HISTORY, arr);
    };
	return new WitemDispatch();
});
