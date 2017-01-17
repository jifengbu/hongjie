define(function(require) {
	"use strict";
    var _self;
    function StagePlanCompOtherTask() {
        _self = this;
        _self.id = "stagePlanCompOtherTask";
    }

    StagePlanCompOtherTask.prototype.show = function(data, stage) {
        _self.data = data;
        _self.stage = stage;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
    };
    StagePlanCompOtherTask.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVH = '<div style="margin-bottom:6px;margin-left:20px;">',
            DIVT = '</div>',
            html = '',
            data = _self.data;

        var year = new Date().getFullYear();
        html += DIVCH+CC('该任务所在工序：')+RED(_self.stage)+DIVT;
        html += DIVH+CC('任务名称：')+RED(data.workitem_name)+DIVT;
        html += DIVH+CC('任务内容：')+GREEN(data.work_context)+DIVT;
        html += DIVH+CC('开始时间：')+LC(data.time_start)+DIVT;
        if (data.time_end) {
            html += DIVH + CC('结束时间：') + GREEN(data.time_end) + DIVT;
            var diff = app.utils.getDateDiff(data.time_start, data.time_end, 'dhm');
            html += DIVH + CC('一共耗时：') + RED(diff) + DIVT;
        } else {
            var diff = app.utils.getDateDiff(year + '/' +data.time_start, new Date(), 'dhm');
            html += DIVH + CC('已经用时：') + RED(diff) + DIVT;
            html +=  app.utils.buttonHtml([{text:'点击完成', click:'app.stagePlanCompOtherTask.finishTask()'}]);
        }

        $('#spcot_list').html(html);
    };
    StagePlanCompOtherTask.prototype.onUnload = function() {
    };
    StagePlanCompOtherTask.prototype.release = function() {
        _self.data = null;
        _self.stage = null;
    };
    StagePlanCompOtherTask.prototype.finishTask = function() {
        app.utils.popup({
            title: "提示",
            message: "完成后时间不能修改，确认完成吗？",
            cancelText: "取消",
            cancelCallback: function () {},
            doneText: "确定",
            doneCallback: function () {
                _self.doFinishTask();
            }
        });
    };
    StagePlanCompOtherTask.prototype.doFinishTask = function() {
        var param = {
            oper: 2,
            id: _self.data.work_id
        };
        var url = app.route.stagePlanComUrl+'?'+ $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onFinishTaskSuccess
        });
    };
    StagePlanCompOtherTask.prototype.onFinishTaskSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data["success"]) {
            app.utils.showError(app.error.DATA_ERROR);
            return;
        }
        $.ui.goBack();
        app.stagePlanComp.updateList();
    };
    return new StagePlanCompOtherTask();
});
