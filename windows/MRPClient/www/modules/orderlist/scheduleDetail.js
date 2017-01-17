define(function(require) {
	"use strict";
	var _self;

	function OrderlistScheduleDetail() {
		_self = this;
		_self.id = "scheduleDetail";
	}
	
	OrderlistScheduleDetail.prototype.show = function(data, order) {
		this.data = data;
		this.order = order;
        _self.wsheet_name = null;
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
	};
	OrderlistScheduleDetail.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.showScheduleDetail(_self.data);
    };
	OrderlistScheduleDetail.prototype.showScheduleDetail = function(data) {
        var PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            WHITE = app.color.WHITE,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVH = '<div>',
            DIVT = '</div>',
            RCOLH = '<span style="float: right;width: 60%;">',
            RCOLT = '</span>',
            html = '';

        html += '<li>';
        html += '<div>订单号:'+RCOLH+GREEN(_self.order.pn)+RCOLT+'</div>';
        html += '</li>';

        html += '<li>';
        if (data.worksheet) {
            html += '<h2 class="expanded" onclick="app.utils.showHide(this, \'ordersd_relevant_wsh\')">相关加工单：</h2>';
            html += '<div id="ordersd_relevant_wsh">';
            var wsh = data.worksheet;
            var cnt = 0;
            for (var key in wsh) {
                if (_self.wsheet_name == wsh[key] || (!_self.wsheet_name && cnt==0)) {
                    var style = "border-color:red;";
                    html += app.utils.buttonHtml([
                        {text: wsh[key], style: style}
                    ]);
                } else {
                    html += app.utils.buttonHtml([
                        {text: wsh[key], click: 'app.scheduleDetail.getRelevantWorkSheetSchedule(\'' + wsh[key] + '\')'}
                    ]);
                }
                cnt++;
            }
            html += '</div>';
        } else {
            html += '<div>相关加工单:'+RCOLH+RED("无")+RCOLT+'</div>';
        }
        html += '</li>';


        html += '<li>';
        html += '<div>最晚工序:'+RCOLH+RED(data.late_stage||"无")+RCOLT+'</div>';
        html += '</li>';

        html += '<li>';
        if (data.detail_stage) {
        html += '<h2 class="expanded" onclick="app.utils.showHide(this, \'ordersd_wsh_sh\')">工序完成进度：</h2>';
        html += '<div id="ordersd_wsh_sh">';
        var stage = data.detail_stage;
        for (var key in stage) {
            html += '<div>'+key+'：'+LC(stage[key])+'</div>'
        }
        html += '</div>';
        } else {
            html += '<div>工序完成进度:'+RCOLH+RED("无")+RCOLT+'</div>';
        }
        html += '</li>';

        //console.log(html);
		$('#orderlist_schedule_detail_list').html(html);
	};
    OrderlistScheduleDetail.prototype.release = function() {
        _self.data = null;
        _self.order = null;
        _self.wsheet_name = null;
    };
    OrderlistScheduleDetail.prototype.getRelevantWorkSheetSchedule = function(wsheet_name) {
        _self.wsheet_name = wsheet_name;
        var order = _self.order;
        var param = {
            uid: app.login.userid,
            id:order.id,
            item_id:order.item_id,
            wsheet_name:wsheet_name
        };
        console.log(param);
        var url = app.route.orderlistScheduleDetailUrl + '?' + $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetRelevantWorkSheetScheduleSuccess
        });
    };
    OrderlistScheduleDetail.prototype.onGetRelevantWorkSheetScheduleSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.DATA_ERROR);
        } else {
            _self.showScheduleDetail(data);
        }
        app.utils.clearWait();
    };

	return new OrderlistScheduleDetail();
});
