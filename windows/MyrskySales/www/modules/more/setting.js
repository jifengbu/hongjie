define(function(require) {
	"use strict";
	var _self;
	function Setting() {
		_self = this;
		_self.id = "setting";
	}
	Setting.prototype.show = function() {
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	Setting.prototype.onLoad = function() {
        if (_os == "windows") {
            var html = '';
            html += '<br>';
            html += app.utils.buttonHtml([{
                text:"设置窗口大小",
                click:"app.setting.setWindowSize()",
                width:90
            }]);
            $('#ms_extend_setting').html(html);
        }

		if (app.login.autologin) {
			$("#ms_auto_login").prop("checked", true);
		}

        if (app.us.getBooleanData('US_AUTO_CHECK_UPDATE')) {
            $("#ms_auto_check_update").prop("checked", true);
        }
		$("#ms_timeout").val(app.route.timeout);
	};
	Setting.prototype.doMoreSettingDone = function() {
		var timeout = $("#ms_timeout").val();
		app.route.setTimeout(timeout);

        var autologin = $("#ms_auto_login").prop("checked");
        app.login.setAutoLogin(autologin);

        var auto_check = $("#ms_auto_check_update").prop("checked");
        app.us.setBooleanData('US_AUTO_CHECK_UPDATE', auto_check);

		$.ui.goBack();
	};
	Setting.prototype.setWindowSize = function() {
        var html = '';
        _self.onSizeChange = function(value) {
            var text = value+"x"+(value*1.5);
            $('#ms_win_size').text(text);
        };
        var width = localStorage.getItem("US_WIN_WIDTH")||420,
            height = localStorage.getItem("US_WIN_HEIGHT")||630;
        html += '<table  width="100%" style="font: inherit;"><tr><td>';
        html += '<span id="ms_win_size" style="color:red;">'+width+'x'+height+'</span>&nbsp;&nbsp;小<input type="range" value='+width+' min=320 max=480 step=2 onchange="app.setting.onSizeChange(this.value)"/>大';
        html += '</td></tr></table>';
        app.utils.popup({
            title: "设置窗口大小",
            message: html,
            cancelText: "取消",
            cancelCallback: function () {},
            doneText: "确定",
            doneCallback: function () {
                var sizes = $("#ms_win_size").text().split('x');
                app.us.setIntData("US_WIN_WIDTH", sizes[0]);
                app.us.setIntData("US_WIN_HEIGHT", sizes[1]);
                _self.onSizeChange = null;
                app.utils.toast("程序在1秒后重启");
                setTimeout(function(){
                    navigator.utils.restart();
                }, 1000);
            },
            addCssClass: 'wide'
        });
	};
	return new Setting();
});