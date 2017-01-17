define(function(require) {
	"use strict";
	var _self;

	function PassNumberDetail() {
		_self = this;
		_self.id = "passNumberDetail";
	}

    /**
     *说明，如果是出手机过数链接过来的，设置parent,使用parent中的scan_id
     *如果是从派工单过来的，直接使用lot_no
     * from=0||null, 直接从派工单链接过来的
     * from=1，从今日任务统计链接到派工单
     * from=2，从板名称过数链接过来的
     */
	PassNumberDetail.prototype.show = function(parent, lot_no, from) {
        _self.parent = parent;
        _self.lot_no = lot_no;
        _self.from = from;
        _self.operate_type = 0;
        _self.max_pcs_qty = 0;
        _self.select_stage = null;
        _self.data = null;
        _self.time = $.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
	};
	PassNumberDetail.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.data) {
            _self.getPassNumberList();
        }
	};
    PassNumberDetail.prototype.release = function() {
        app.utils.setReleasePanel(null);
        _self.parent = null;
        _self.data = null;
        _self.time = null;
    };
	PassNumberDetail.prototype.showPassNumberDetail = function() {
        var AREA_COLOR = app.color.AREA_COLOR,
            PRICE_COLOR = app.color.PRICE_COLOR,
            PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVRH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;">',
            DIVT = '</div>',
            html = '';

        var selectable_stages = _self.data.selectable_stages;
        var stages_list = DIVH+'工序：';
        stages_list += '<select id="pnd_stages_list" onchange="app.passNumberDetail.showStages(this.value)" style="width: 60%;color: inherit;font: medium;">';
        for (var key in selectable_stages) {
            if (!_self.select_stage) {
                _self.select_stage = key;
            }
            var select = "";
            if (_self.select_stage == key) {
                select = 'selected="selected"';
            }
            var item = selectable_stages[key];
            for (var itemkey in item) {
                stages_list += '<option '+select+' value="'+key+'">'+item[itemkey]+'</option>';
                break;
            }
        }
        stages_list += '</select>'+DIVT;

        var data =  _self.data.recv_com_info[_self.select_stage];
        if (!data) {
            app.utils.toast("错误数据不能正常显示");
            return;
        }


        html += '<li>';
        html += DIVCH+'当前时间：'+GREEN(_self.time)+DIVT;
        html += DIVH+'条形码：'+GREEN((_self.lot_no)?_self.lot_no:_self.parent.scan_id)+DIVT;
        var company = app.route.company;
        if(company == "snow8" || company == "snow7" || company == "szhspcb" || company == "jjhspcb"){
            html += DIVH+'板名称：'+GREEN(data.fab_kind+data.witem_name+"("+data.factory_self_no+")")+DIVT;
        }  else {
            html += DIVH+'板名称：'+GREEN(data.witem_name)+DIVT;
        }
        html += stages_list;

        var et_wip_qty = ''; //完工数量显示
        if (data.piece) {
            _self.type_out = "piece";
            var piece = data.piece;
            var wip_qty = '', //在制数量显示
                pcs_pro_qty = ''; //加工数量显示
            for (var key in piece) {
                var item = piece[key];
                var title = item.mark+'('+PURPLE(item.order_id)+')：';
                var unit = RED('&nbsp;&nbsp;'+((item.unit=="piece"||item.unit=="Piece")?"Pcs":"Set"));
                var wait_wip_qty, max_qty;
                if (item.on_make_qty != null) {
                    _self.operate_type = 1;
                    wait_wip_qty = item.on_make_qty*1;
                    max_qty = wait_wip_qty;
                } else {
                    wait_wip_qty = item.wait_qty*1;
                    max_qty = item.max_qty*1;
                }
                et_wip_qty += '<br>'+title+'<input type="number" value='+wait_wip_qty+' class="pnd_input_pass_number" workitem_id="'+key+'" class="af-ui-forms" style="color:black;font-weight:bold; width:30%;">'+unit;

                wip_qty += '<br>'+title+wait_wip_qty+unit;
                pcs_pro_qty += '<br>'+title+wait_wip_qty+unit;
                _self.max_pcs_qty += max_qty;
            }
            html += DIVH+'在制数量：'+wip_qty+DIVT;
            html += DIVH+'加工数量：'+pcs_pro_qty+DIVT;
        } else {
            var panel = data.panel;
            var unit = RED('&nbsp;&nbsp;'+'PNL');
            _self.type_out = "panel";
            for (var key in panel) {
                var item = panel[key];
                if (item.on_make_qty) {
                    _self.operate_type = 1;
                    _self.max_pnl_qty = item.on_make_qty;
                    html += DIVH + '在制数量：' + GREEN(item.on_make_qty) + unit + DIVT;
                    html += DIVH + '加工数量：<input type="number" value='+item.on_make_qty+' id="pnd_input_pass_number" class="af-ui-forms" style="color:black;font-weight:bold; width:30%;">' + unit + DIVT;
                } else {
                    _self.max_pnl_qty = item.max_qty;
                    html += DIVH + '在制数量：' + GREEN(item.max_qty) + unit + DIVT;
                    html += DIVH + '加工数量：<input type="number" value='+item.wait_qty+' id="pnd_input_pass_number" class="af-ui-forms" style="color:black;font-weight:bold; width:30%;">' + unit + DIVT;
                }
                _self.order_qty = item.order_qty;
            }
        }
        html += DIVH+'上工序：'+GREEN(data.pre_stgmeta)+DIVT;
        html += DIVH+'下工序：'+GREEN(data.next_stgmeta)+DIVT;
        if (et_wip_qty) {
            html += DIVH+'完工数量：'+et_wip_qty+DIVT;
        }
        var other_parameter = data.other_parameter||"";
        other_parameter = other_parameter.replace(/\n/g, "<br />");
        html += DIVH+'其他参数：'+GREEN(other_parameter)+DIVT;
        html += '</li>';
        if (data.is_oustsource == "1") {
            html += DIVH+'外发单：'+GREEN(data.oustsource_name)+DIVT;
        } else {
            html +=  app.utils.buttonHtml([
                {text:'提交', click:'app.passNumberDetail.doSubmit()'}
            ]);
	}
        $('#pnd_detail_list').html(html);
	};
	PassNumberDetail.prototype.showStages = function(stage) {
        _self.select_stage = stage;
        _self.showPassNumberDetail();
    };
    PassNumberDetail.prototype.getPassNumberList = function() {
        var param = {
            uid: app.login.userid,
            lot_no: (_self.lot_no)?_self.lot_no:_self.parent.scan_id,
            op: 9
        };
        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("正在更新...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetPassNumberListSuccess
        });
    };
    PassNumberDetail.prototype.onGetPassNumberListSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            $.ui.goBack();
            return;
        }
        if (data.selectable_stages && data.recv_com_info) {
            if (_self.parent) {
                _self.parent.addPassNumberHistoryList();
            }
            _self.data = data;
            _self.showPassNumberDetail();
        } else {
            app.utils.toast("该单没有可以过数的派工单");
            $.ui.goBack();
        }
    };
	PassNumberDetail.prototype.doSubmit = function() {
        var data = _self.data.recv_com_info[_self.select_stage];

        if (_self.type_out == "panel") {
            var num = $("#pnd_input_pass_number").val();
            if (num.trim().length == 0) {
                app.utils.toast("完工数量不能为空");
                return;
            }
            num = ~~num;
            if (num <= 0) {
                app.utils.toast("完工数量不能为空不能小于1");
                return;
            }
            if (num >  _self.max_pnl_qty) {
                app.utils.toast("完工数量不得大于在制数量");
                return;
            }
            var order_wip_qtys = "{";
            var order_qty = _self.order_qty;
            for (var order_id in order_qty) {
                var qty = num * order_qty[order_id];
                order_wip_qtys += order_id+":"+qty+",";
            }
            order_wip_qtys = order_wip_qtys.replace(/,$/, '');
            order_wip_qtys += "}";
            var param = {
                recv_qty: num,
                order_wip_qtys: order_wip_qtys,
                wsh_id: data.wsh_name,
                workitem_id: data.witem_name,
                lot_id: data.lot_id,
                stg_id: data.stginst_id,
                wdisp_id:data.wdisp_id,
                scan_time: _self.time,
                unit: _self.type_out,
                op: 10
            };
            if(_self.operate_type == 1){
                param.operate_type = 1;
            }
            console.log(param);
            var url = app.route.stationDispatchUrl+'?'+$.param(param);
            console.log(url);
            app.utils.setWait("正在提交...");
            app.utils.ajax({
                type : "GET",
                url : url,
                timeout : app.route.timeout,
                success : _self.onSubmitSuccess
            });
        } else {
            var total_qty = 0;
            var order_wip_qtys = "{";
            $('.pnd_input_pass_number').each(function(){
                var qty =  $(this).val();
                var workitem_id = $(this).attr('workitem_id');
                total_qty += qty*1;
                order_wip_qtys += workitem_id+":"+qty+",";
            });
            order_wip_qtys = order_wip_qtys.replace(/,$/, '');
            order_wip_qtys += "}";

            if(total_qty > _self.max_pcs_qty) {
                app.utils.toast("各订单完工数量必须小于其在制数量");
                return;
            }
            if(total_qty == 0 && _self.max_pcs_qty != 0) {
                app.utils.toast("完工数量不能为零");
                return;
            }
            if(_self.max_pcs_qty == 0) {
                app.utils.toast("该单在本工序无可接收数量，请返回重新扫描或到web端查看该工序是否已做接收");
                return;
            }
            var param = {
                order_wip_qtys: order_wip_qtys,
                recv_qty: total_qty,
                wsh_id: data.wsh_name,
                workitem_id: data.witem_name,
                lot_id: data.lot_id,
                stg_id: data.stginst_id,
                wdisp_id: data.wdisp_id,
                scan_time: _self.time,
                unit: _self.type_out,
                op: 10
            };
            if(_self.operate_type == 1){
                param.operate_type = 1;
            }
            console.log(param);
            var url = app.route.stationDispatchUrl+'?'+$.param(param);
            console.log(url);
            app.utils.setWait("正在提交...");
            app.utils.ajax({
                type : "GET",
                url : url,
                timeout : app.route.timeout,
                success : _self.onSubmitSuccess
            });
        }
	};
	PassNumberDetail.prototype.onSubmitSuccess = function(data) {
		console.log(data);
		if (!data.success) {
			app.utils.toast("提交失败");
			app.utils.clearWait();
			return;
		}
        if (!data.is_success) {
            app.utils.toast("该单在其他地方已过数");
        }
		app.utils.clearWait();
        _self.select_stage = null;
        if (_self.parent) { //手机过数时更新本页面
            _self.getPassNumberList();
        } else {  //从其他地方过来的需要返回更新
            if (!_self.from) {  //从派工单过来的需要返回更新
                $.ui.goBack();
                require('stationDispatch').refreshStationDispatch();
            } else if (_self.from == 1) { //从今日统计过来的需要返回到今日统计界面去更新
                $.ui.goBack(3);
                require('stationReport').refreshStationReport();
            } else if (_self.from == 2) { //从板名称过数过来的需要返回到板名称过数去更新
                $.ui.goBack();
                require('witemDispatchDetail').updateWitemDispatchList();
            }
        }
	};
    PassNumberDetail.prototype.getStationDispatchDetail = function(wdisp_id) {
        var param = {
            uid: app.login.userid,
            wdisp_id: _self.data.recv_com_info[_self.select_stage].wdisp_id,
            op: 8
        };

        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStationDispatchDetailSuccess
        });
    };
    PassNumberDetail.prototype.onGetStationDispatchDetailSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        app.utils.clearWait();
        require('stationDispatchDetail').show(data.databasic);
    };

	return new PassNumberDetail();
});
