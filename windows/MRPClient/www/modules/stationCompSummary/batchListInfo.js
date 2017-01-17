/**
 * Created by panyun on 2015/1/27.
 */
define(function(require) {
	"use strict";
    var _self;

    function BatchListInfo() {
        _self = this;
        _self.id = "batchListInfo";
    }

    BatchListInfo.prototype.show = function(wdisp_id,stage_name) {
        _self.wdisp_id = wdisp_id;
        _self.stage_name = stage_name;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
    };
    BatchListInfo.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.data) {
            _self.getBatchListInfo();
        }
    };
    BatchListInfo.prototype.release = function() {
        app.utils.setReleasePanel(null);
        _self.wdisp_id = "";
        _self.stage_name = "";
        _self.data = null;
    };
    BatchListInfo.prototype.showBatchListInfo = function() {
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="15%"',
            WD1 = 'width="20%"',
            WD2 = 'width="20%"',
            WD3 = 'width="15%"',
            WD4 = 'width="30%"',
            html = '',
            data;
        data = _self.data;
        if (!data) {
            app.utils.toast("错误数据不能正常显示");
            return;
        }
        console.log(data);

        html += DIVCH+RED(_self.stage_name)+DIVT;

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>批次ID</th><th '+WD1+' >时间</th><th '+WD2+'>'+'数量</th><th '+WD3+'>批次类型</th><th '+WD4+'>'+'操作者</th></tr>';
        for (var i=0,len=data.length; i<len; i++) {
            var item = data[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'" >';
            html += '<td '+WD0+'style="text-align:center">' + CC(item[0]) + '</td>';
            html += '<td '+WD1+'style="text-align:center">' + CC(item[2])+ '</td>';
            html += '<td '+WD2+'style="text-align:center">' + CC(item[3])+ '</td>';
            html += '<td '+WD3+'style="text-align:center">' + CC(item[4]) + '</td>';
            html += '<td '+WD4+'style="text-align:center">' + CC(item[6]) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#batch_list').html(html);
    };

    BatchListInfo.prototype.getBatchListInfo = function() {
        var param = {
            uid: app.login.userid,
            wdisp_id: _self.wdisp_id,
            batch: 1
        };
        var url = app.route.stationCompSummaryUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("正在更新...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetBatchListInfoSuccess
        });
    };
    BatchListInfo.prototype.onGetBatchListInfoSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            $.ui.goBack();
            return;
        }
        if (data.batch_list_info) {
            _self.data = data.batch_list_info;
            _self.showBatchListInfo();
        } else {
            app.utils.toast("查询数据错误");
            $.ui.goBack();
        }
    };


    return new BatchListInfo();
});
