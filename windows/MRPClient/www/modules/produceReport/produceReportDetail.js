define(function(require) {
	"use strict";
	var _self;

	function ProduceReportDetail() {
		_self = this;
		_self.id = "produceReportDetail";
	}
	
	ProduceReportDetail.prototype.show = function(data) {
        _self.data = data;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	ProduceReportDetail.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.showProduceReportDetail();
	};
    ProduceReportDetail.prototype.release = function() {
        _self.data = null;
        _self.stages = null;
    };
    ProduceReportDetail.prototype.getItemHtml = function(stage_info, type) {
        var COUNT_COLOR = app.color.COUNT_COLOR,
            PNL_COLOR = app.color.PNL_COLOR,
            PCS_COLOR = app.color.PCS_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            item = stage_info[type],
            item_pcs = item["piece"] * 1,
            item_pnl = item["panel"] * 1,
            wsh_qty = item["wsh_qty"] * 1,
            total_area = stage_info["total_"+type+"_area"]* 1,
            html = "";
        if (item_pnl) {
            html += PNL_COLOR(item_pnl)+"PNL";
        } else if (item_pcs) {
            html += PCS_COLOR(item_pcs)+"PCS";
        }
        if (total_area > 0) {
            html += " , "+AREA_COLOR(total_area)+"平米";
        }
        if (wsh_qty > 0) {
            html += " , "+COUNT_COLOR(wsh_qty)+"款";
        }
        if (html == "") html = "0";
        return html;
    };
    ProduceReportDetail.prototype.getStageHtml = function(stage_info) {
        var html = "";
        var types = {"plan":"计划","produce":"投产","recv":"接收","inprogress":"在制","comp":"完工","waittorecv":"待接收","disd":"报废","rewk":"返工"};
        for (var type in types) {
            html += '<div style="margin-bottom: 6px;"><span>'+types[type]+':</span><span style="float: right;width: 80%;">'+_self.getItemHtml(stage_info, type)+'</span></div>';
        }
        return html;
    };
    ProduceReportDetail.prototype.checkShowStage = function(stage_name) {
        if (!_self.stages) {
            return true;
        }
        for (var i in _self.stages) {
            if (_self.stages[i].name == stage_name && _self.stages[i].checked) {
                return true;
            }
        }
        return false;
    };
	ProduceReportDetail.prototype.showProduceReportDetail = function() {
        var all_show = false;
        for (var i in _self.stages) {
            all_show = all_show||_self.stages[i].checked;
        }
        var html = ''
        var info = _self.data.wstage_info;
        for (var key in info) {
            if (!all_show || _self.checkShowStage(info[key].stage_name)) {
                html += '<li>';
                html += '<h2>' + info[key].stage_name + '</h2>';
                html += _self.getStageHtml(info[key]);
                html += '</li>';
            }
        }
       // console.log(html);
		$('#prd_detail_list').html(html);
        $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
	};
    ProduceReportDetail.prototype.showVisibleStage = function() {
        require('produceReportVisibleStage').show(_self.data.wstage);
    };
    ProduceReportDetail.prototype.setVisibleStage = function(stages) {
        _self.stages = stages;
        _self.showProduceReportDetail();
    };

	return new ProduceReportDetail();
});
