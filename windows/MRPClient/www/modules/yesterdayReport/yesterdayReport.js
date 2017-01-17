define(function(require) {
	"use strict";
	var _self;

	function YesterdayReport() {
		_self = this;
		_self.id = "yesterdayReport";
	}
	
	YesterdayReport.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
	};
	YesterdayReport.prototype.onLoad = function() {
        if (!_self.data) {
            _self.getYesterdayReport();
        }
	};
    YesterdayReport.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.data = null;
    };
	YesterdayReport.prototype.showPopMenu = function() {
        app.utils.popup({
            title: "友情提示",
            message: "获取可能会花很长的时间，你确认要获取吗？",
            cancelText: "取消",
            cancelCallback: function () {},
            doneText: "确定",
            doneCallback: function () {
                _self.getYesterdayReport();
            },
            cancelOnly: false
        });
	};
	YesterdayReport.prototype.showYesterdayReport = function(data) {
        var AC = app.color.AREA_COLOR,
            PC = app.color.PRICE_COLOR,
            CC = app.color.COUNT_COLOR,
            DIVH = '<li><div">',
            DIVT = '</div></li>',
            html = '';

//        html += DIVH+'1.下单 '+AC(data.order_area)+'平米  产值'+PC(data.order_fee)+'万元'+DIVT;
//        html += DIVH+'2.出货 '+AC(data.report_area)+'平米  产值'+PC(data.report_fee)+'万元'+DIVT;
        html += DIVH+'1.下单 '+AC(data.order_area)+'平米'+DIVT;
        html += DIVH+'2.出货 '+AC(data.report_area)+'平米'+DIVT;
        html += DIVH+'3.投产 '+AC(data.product_area)+'平米  多层'+AC(data.product_layer_area)+'平米'+DIVT;
        html += DIVH+'4.待投产 '+AC(data.toproduct_area)+'平米  多层'+AC(data.toproduct_layer_area)+'平米'+DIVT;
        html += DIVH+'5.在制 '+AC(data.inprocess_area)+'平米  多层'+AC(data.inprocess_layer_area)+'平米'+DIVT;
        html += DIVH+'6.甩期版 '+CC(data.overdue_qty)+'款  '+AC(data.overdue_area)+'平米'+DIVT;

		//console.log(html);
		$('#uwyesterdayreport').html(html);
	};
	YesterdayReport.prototype.getYesterdayReport = function() {
		var date = new Date();
		var time = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
		var param = {
            uid: app.login.userid,
            search_date:time
        };
		var url = app.route.yesterdayReportUrl+'?'+ $.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetYesterdayReportSuccess,
			error : _self.onGetYesterdayReportError
		});
	};
	YesterdayReport.prototype.onGetYesterdayReportSuccess = function(data) {
        console.log(data);
		if (!data.success) {
			app.utils.showError(app.error.SERVER_ERROR);
			app.utils.clearWait();
            if (!_self.data) {
                $.ui.goBack();
            }
			return;
		}
		_self.data = data;
		_self.showYesterdayReport(data);
		app.utils.clearWait();
	};
	YesterdayReport.prototype.onGetYesterdayReportError = function(data, type) {
        _self.release();
		$.ui.goBack();
	};
	return new YesterdayReport();
});
