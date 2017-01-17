define(function(require) {
	"use strict";
	var _self;
    var US_PNHISTORY = "US_PNHISTORY";
	var SCAN_ID_MIN_LENGTH = 12;
    var MAX_PASSNUMBER_LIST_CNT = 10;

	function PassNumber() {
		_self = this;
		_self.id = "passNumber";
		_self.scan_id = "7580121211679";
        _self.pnhistory = [];
	}
	
	PassNumber.prototype.show = function() {
        _self.getPassNumberHistoryList();
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
	};
	PassNumber.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
		_self.showHistoryList();
	};
    PassNumber.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.data = null;
        _self.pnhistory = [];
    };
	PassNumber.prototype.showHistoryList = function() {
		var html = '',
            list = _self.pnhistory;

		for(var key in list) {
            html += '<li>';
            html += '<a href="#" onclick="app.passNumber.doGetPassNumberList(\''+list[key]+'\')">'+list[key]+'</a>';
            html += '</li>';
        }
        if (!html) {
            html = "没有历史过单编号，点击右上角的<添加>按钮添加过单编号";
        }
		$('#pn_history_list').html(html);
	};
	PassNumber.prototype.showSheetMenu = function() {
		app.utils.actionsheet = $("#afui").actionsheet([{
				text: '手动输入',
				cssClasses: '',
				handler: function () {
                    $.ui.actionsheetShow = false;
					_self.showPopupInputBox();
				}
			}, {
				text: '相机扫描',
				cssClasses: '',
				handler: function () {
                    $.ui.actionsheetShow = false;
					_self.doScanBarcodes();
				}
			}]);
	};
	PassNumber.prototype.showPopupInputBox = function() {
        app.utils.popup({
			title: "输入条形码:",
			message: "<input type='text' id='pn_input_scan_id' class='af-ui-forms' style='color:black;font-weight:bold;'>",
			cancelText: "取消",
			cancelCallback: function () {},
			doneText: "确定",
			doneCallback: function () {
				var scan_id = $("#pn_input_scan_id").val();
				if (scan_id.length >= SCAN_ID_MIN_LENGTH) {
					_self.doGetPassNumberList(scan_id);
				} else {
					app.utils.toast("错误的条形码");
				}
			},
			cancelOnly: false
		});
	};
	PassNumber.prototype.doScanBarcodes = function() {
		app.utils.setWaitProgress('正在初始化相机');
        setTimeout(function(){
            navigator.utils.scanner(
                function(result) {
                    app.utils.clearWaitProgress();
                    if (!result.cancelled) {
                        if (result.text && result.text.trim().length !=0) {
                            _self.doGetPassNumberList(result.text);
                        }
                    }
                });
        }, 500);
	};
	PassNumber.prototype.doGetPassNumberList = function(scan_id) {
		_self.scan_id = scan_id;
        var stageType = app.route.stageType;
        if (stageType == 0 || stageType == 2) {
            require('passNumberDetail').show(_self);
        } else {
            require('passNumberDetailEx').show(_self);
        }
	};
    PassNumber.prototype.getPassNumberHistoryList = function () {
        _self.pnhistory = app.us.getObjectData(US_PNHISTORY)||[];
    };
    PassNumber.prototype.addPassNumberHistoryList = function () {
        var id = _self.scan_id;
        var arr = _self.pnhistory;
        var len = arr.length;
        for (var i=0; i<len; i++) {
            if (id == arr[i]) {
                arr.splice(i, 1);
                break;
            }
        }
        len = arr.unshift(id);
        if (len > MAX_PASSNUMBER_LIST_CNT) {
            arr.pop();
        }
        _self.pnhistory = arr;
        app.us.setObjectData(US_PNHISTORY, arr);
    };
	return new PassNumber();
});
