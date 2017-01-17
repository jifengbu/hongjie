define(function(require) {
	"use strict";
    var _self;

    function ProduceNoticeDetail() {
        _self = this;
		_self.id = "produceNoticeDetail";
    }

    ProduceNoticeDetail.prototype.show = function(wsheet_id) {
        _self.wsheet_id = wsheet_id;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
    };
    ProduceNoticeDetail.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        $('#prntd_title').html(_self.wsheet_id);
        _self.getProduceNoticeDetail(_self.wsheet_id);
    };
    ProduceNoticeDetail.prototype.release = function() {
        _self.wsheet_id = null;
        $('#prntd_list').html("");
    };
    ProduceNoticeDetail.prototype.showProduceNoticeDetail = function(detail_para) {
        var html = '';
        html += '<li>开始时间：'+detail_para.time_start+'</li>';
        html += '<li>结束时间：'+detail_para.time_end+'</li>';
        html += '<li>加工数量：'+detail_para.prodct_vol+'</li>';
        html += '<li>订单数量：'+detail_para.order_vol+'</li>';
        html += '<li>包含订单：'+detail_para.order+'</li>';
        var stages = detail_para.comp_stages;
        if (stages) {
            stages = stages.replace(/\n/g, "<br />");
        }
        html += '<li>完工工序：<br />'+stages+'</li>';
        $('#prntd_list').html(html);
    };
    ProduceNoticeDetail.prototype.getProduceNoticeDetail = function(wsheet_id) {
        var param = {
            uid: app.login.userid,
            wsheet_id: wsheet_id
        }

        var url = app.route.produceNoticeUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetProduceNoticeDetailSuccess
        });
    };
    ProduceNoticeDetail.prototype.onGetProduceNoticeDetailSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        _self.showProduceNoticeDetail(data.detail_para);
        app.utils.clearWait();
    };
    return new ProduceNoticeDetail();
});
