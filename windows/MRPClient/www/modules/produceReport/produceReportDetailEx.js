define(function(require) {
	"use strict";
	var _self;

	function ProduceReportDetailEx() {
		_self = this;
		_self.id = "produceReportDetailEx";
	}
	
	ProduceReportDetailEx.prototype.show = function(data) {
        _self.data = data;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	ProduceReportDetailEx.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.showProduceReportDetailEx();
	};
    ProduceReportDetailEx.prototype.release = function() {
        _self.data = null;
        _self.stages = null;
    };
    ProduceReportDetailEx.prototype.getItemHtml = function(stage_info, type) {
        var COUNT_COLOR = app.color.COUNT_COLOR,
            PNL_COLOR = app.color.PNL_COLOR,
            PCS_COLOR = app.color.PCS_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            item_pcs = stage_info[type+"_pcs"] * 1,
            item_pnl = stage_info[type+"_pnl"] * 1,
            item_total_pcs = stage_info[type+"_total_pcs"] * 1,
            html = "";
        if (item_total_pcs) {
            if (item_pcs) {
                html += PCS_COLOR(item_pcs)+"PCS";
            } else {
                html += PNL_COLOR(item_pnl)+"PNL";
            }
            var area = stage_info[type+"_area"];
            html += " , "+AREA_COLOR(area)+"平米";
            var order_num = stage_info[type+"_order_num"];
            html += " , "+COUNT_COLOR(order_num)+"款";
        }
        if (html == "") html = "0";
        return html;
    };
    ProduceReportDetailEx.prototype.getStageHtml = function(stage_info, type) {
        var stage_show = "";
        var types = {"plan":"计划","produce":"投产","waittorecv":"待接收","recv":"接收","inprocess":"在制","comp":"完工","disd":"报废","rework":"返工"};
        for (var type in types) {
            stage_show += '<div style="margin-bottom: 6px;"><span>'+types[type]+':</span><span style="float: right;width: 80%;">'+_self.getItemHtml(stage_info, type)+'</span></div>';
        }
        return stage_show;
    };
    ProduceReportDetailEx.prototype.checkShowStage = function(stage_name) {
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
	ProduceReportDetailEx.prototype.showProduceReportDetailEx = function() {
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
    ProduceReportDetailEx.prototype.showVisibleStage = function() {
        require('produceReportVisibleStage').show(_self.data.wstage);
    };
    ProduceReportDetailEx.prototype.setVisibleStage = function(stages) {
        _self.stages = stages;
        _self.showProduceReportDetailEx();
    };

	return new ProduceReportDetailEx();
});
