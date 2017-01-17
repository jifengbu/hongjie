define(function(require) {
	"use strict";
	var _self;
    var MODE = 0;

	function ProduceReport() {
		_self = this;
		_self.id = "produceReport";
	}
	
	ProduceReport.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
	};
	ProduceReport.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.date) {
            _self.date = app.utils.newDate();
        }
        if (!_self.data) {
            _self.getProduceReport();
        }
	};
    ProduceReport.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.data = null;
        _self.date = null;
        _self.search_date = null;
        app.produceReportDetail&&app.produceReportDetail.release();
        app.produceReportVisibleStage&&app.produceReportVisibleStage.release();
    };
	ProduceReport.prototype.doResearch = function() {
        navigator.utils.datePickerDialog(function(date){
            _self.date = date;
            _self.getProduceReport();
        }, _self.date.year, _self.date.month, _self.date.day);
	};

	ProduceReport.prototype.showProduceReport = function(data) {
        var COUNT_COLOR = app.color.COUNT_COLOR,
            PNL_COLOR = app.color.PNL_COLOR,
            DATE_COLOR = app.color.DATE_COLOR,
            PCS_COLOR = app.color.PCS_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 12px;text-align: center;">',
            DIVT = '</div>',
            html = "";

        html += '<li>';
        html += DIVCH+'查询日期:'+DATE_COLOR(_self.search_date)+DIVT;
        html += DIVH+'当前总的在制数量:'+COUNT_COLOR(data.wip_panel_qty)+DIVT;
        html += DIVH+'当前总的在制面积:'+AREA_COLOR(data.wip_panel_area)+'平米'+DIVT;
        html += DIVH+'今日完工数量:'+PNL_COLOR(data.comp_panel_qty)+'(PNL)'+DIVT;
        html += DIVH+'今日完工面积:'+AREA_COLOR(data.comp_panel_area)+'平米'+DIVT;
        html += DIVH+'今日报废数量:'+PCS_COLOR(data.disd_total_qty)+'(PCS)'+DIVT;
        html += DIVH+'今日报废面积:'+AREA_COLOR(data.disd_total_area)+'平米'+DIVT;
        html += '</li>';

        html +=  app.utils.buttonHtml([
            {text:'查看各道工序详细生产情况', click:'app.produceReport.getProduceReportDetail()'}
        ]);

        //console.log(html);
		$('#pr_total_list').html(html);
	};
	ProduceReport.prototype.getProduceReport = function() {
        _self.search_date = _self.date.year + "-" + _self.date.month + "-" + _self.date.day;
        var param = {
            uid: app.login.userid,
            search_date:_self.search_date
        };

        var url = app.route.produceReportUrl+"?"+$.param(param);
        console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetProduceReportSuccess,
			error : _self.onGetProduceReportError
		});
	};
	ProduceReport.prototype.onGetProduceReportSuccess = function(data) {
        console.log(data);
		if (!data.success) {
			app.utils.showError(app.error.SERVER_ERROR);
			app.utils.clearWait();
			$.ui.goBack();
			return;
		}
		_self.data = data.sum_info;
		_self.showProduceReport(data.sum_info);
		app.utils.clearWait();
	};
	ProduceReport.prototype.onGetProduceReportError = function(data, type) {
        _self.release();
		$.ui.goBack();
	};
	ProduceReport.prototype.getProduceReportDetail = function() {
        var param = {
            uid: app.login.userid,
            search_date:_self.search_date
        };

        var url = (MODE?app.route.produceReportDetailUrlEx:app.route.produceReportDetailUrl)+"?"+$.param(param);
        console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetProduceReportDetailSuccess
		});
	};
	ProduceReport.prototype.onGetProduceReportDetailSuccess = function(data) {
        console.log(data);
		if (!data.success) {
			app.utils.showError(app.error.SERVER_ERROR);
			app.utils.clearWait();
			return;
		}
		app.utils.clearWait();
        require('produceReportDetail').show(data);
	};

	return new ProduceReport();
});
