define(function(require) {
	"use strict";
    var _self;
    function StagePlanCompAddTask() {
        _self = this;
        _self.id = "stagePlanCompAddTask";
    }

    StagePlanCompAddTask.prototype.show = function() {
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    StagePlanCompAddTask.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
    };
    StagePlanCompAddTask.prototype.addTask = function() {
        var title = $("#spcar_title").val();
        var content = $("#spcar_content").val();
        if (title.trim().length == 0) {
            app.utils.toast("标题不能为空");
            return;
        }
        if (content.trim().length == 0) {
            app.utils.toast("内容不能为空");
            return;
        }
        app.stagePlanComp.addTask(title, content);
        $.ui.goBack();
    };
    return new StagePlanCompAddTask();
});
