define(function(require) {
	"use strict";
    var _self;

    function StationDispatchRecv() {
        _self = this;
		_self.id = "stationDispatchRecv";
    }

    StationDispatchRecv.prototype.show = function(data, from) {
        _self.data = data;
        _self.data.from = from;
        _self.work_sheet = {};
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    StationDispatchRecv.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
       _self.showStationDispatchRecv(_self.data);
    };
    StationDispatchRecv.prototype.release = function() {
        _self.work_sheet = null;
        _self.data = null;
    };
    StationDispatchRecv.prototype.showStationDispatchRecv = function(data) {
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
        html += '<li>';
        html += DIVCH+'报工工位：'+GREEN(data.stage)+DIVT;
        html += DIVH+'报工派工单：'+GREEN(data.wdisp_name)+DIVT;
        html += DIVH+'当前时间：'+($.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"))+DIVT;
        html += DIVH+'转序时间：'+GREEN(data.transfer_time)+DIVT;
        html += DIVH+'生产标记：'+GREEN(data.witem_name)+DIVT;
        var other_parameter = data.other_parameter||"";
        other_parameter = other_parameter.replace(/\n/g, "<br />");
        if (data.piece) {
            _self.isPanel = false;
            var piece = data.piece;
            for (var key in piece) {
                var item = piece[key];
                var recv_id = "stds_recv_input_"+key;
                html += DIVCH+'订单号：'+PURPLE(key)+DIVT;
                var title = item.mark+'('+PURPLE(item.order_id)+')：';
                var unit = RED('&nbsp;&nbsp;'+((item.unit=="piece"||item.unit=="Piece")?"Pcs":"Set"));
                html += DIVH+title+GREEN(item.wait_qty)+'('+RED(item.max_qty)+')'+unit+DIVT;
                _self.work_sheet[key] = {recv_id:recv_id, wait_qty:item.wait_qty};
                html += DIVRH+'<label for="'+recv_id+'" style="width:auto; padding-left:0px;">'+title+'</label><input id="'+recv_id+'" type="number" value="'+item.wait_qty+'" style="width: 30%;">'+unit+'</label>'+DIVT;
            }
        } else {
            var panel = data.panel;
            var unit = RED('&nbsp;&nbsp;'+'PNL');
            _self.isPanel = true;
            for (var key in panel) {
                var item = panel[key];
                var recv_id = "stds_recv_input_"+key;
                _self.work_sheet[key] = {recv_id:recv_id, wait_qty:item.wait_qty};
                html += DIVH+'等待数量(最大)：'+GREEN(item.wait_qty)+'('+RED(item.max_qty)+')'+unit+DIVT;
                html += DIVRH+'<label for="'+recv_id+'" style="width:auto; padding-left:0px;">接收数量：</label><input id="'+recv_id+'" type="number" value="'+item.wait_qty+'" style="width: 30%;">'+unit+DIVT;
            }
        }
        html += '</li>';

        html += '<li class="divider collapsed" onclick="app.utils.showHide(this, \'stdr_recv_other_params\')">其他参数</li>';
        html += '<li>';
        html += '<div id="stdr_recv_other_params" style="display: none">'+PURPLE(other_parameter)+DIVT;

        html +=  app.utils.buttonHtml([
            {text:'提交', click:'app.stationDispatchRecv.submitRecv()'}
        ]);
        html += '</li>';
        $('#stds_recv_list').html(html);
    };
    StationDispatchRecv.prototype.submitRecv = function() {
        var sends = [];
        for (var workitem_id in _self.work_sheet) {
            var item = _self.work_sheet[workitem_id];
            var recvNum = $('#'+item.recv_id).val();
            if (recvNum < 0) {
                app.utils.toast("加工单"+workitem_id+"的接收数量不能小于0");
                return;
            }
            if (recvNum > item.wait_qty) {
                app.utils.toast("加工单"+workitem_id+"的接收数量不能大于"+item.wait_qty);
                return;
            }
            if (recvNum>0) {
                sends.push({workitem_id:workitem_id, recvNum:recvNum});
            }
        }
        if (!sends.length) {
            app.utils.toast("接收数量不能是0");
            return;
        }
        var recv_qty = {};
        for (var i=0,len=sends.length; i<len; i++) {
            recv_qty[sends[i].workitem_id] = sends[i].recvNum;
        }
        var param = {
            recv_qty: JSON.stringify(recv_qty),
            wdisp_id: _self.data.wdisp_id,
            op: 4,
            uid: app.login.userid
        }

        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onSubmitRecvSuccess
        });
    };
    StationDispatchRecv.prototype.onSubmitRecvSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        app.utils.clearWait();

        if (_self.data.from === 'stationDispatch') {
            $.ui.goBack();
            app.stationDispatch.refreshCurPage();
        } else if (_self.data.from === 'passNumberDetailEx') {
            $.ui.goBack();
            app.passNumberDetailEx.getPassNumberList();
        } else if (_self.data.from == 'witemDispatchDetail') {
            if (app.witemDispatchDetail.from == 'stagePlanComp') {
                $.ui.goBack(2);
                app.stagePlanComp.updateList();
            } else {
                $.ui.goBack();
                app.witemDispatchDetail.updateWitemDispatchList();
            }
        }
    };
    return new StationDispatchRecv();
});
