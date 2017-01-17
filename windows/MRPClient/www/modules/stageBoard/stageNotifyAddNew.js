define(function(require) {
	"use strict";
    var _self;

    function stageNotifyAddNew() {
        _self = this;
        _self.id = "stageNotifyAddNew";
    }

    stageNotifyAddNew.prototype.show = function(from) {
        _self.parent = from;
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"leftSwipe", loadfunc:_self.id+"=onLoad"});
    };
    stageNotifyAddNew.prototype.release = function(data) {
		_self.parent = null;
		_self.loaded = false;
		_self.addOptions = null;
    };
    stageNotifyAddNew.prototype.onLoad = function() {
        if (!_self.loaded) {
            _self.loaded = true;
            _self.showPanel();
			
        }
    };
    stageNotifyAddNew.prototype.showPanel = function() {
		app.updateChatPageBadge(_self.id);
		 if (!_self.addOptions) {
            _self.addOptions = true;
            var stages = _self.parent.stage_info;
			if(stages){
				var options = '';
				for (var stage_id in stages) {
					options += '<option value=' + stage_id + '>'+stages[stage_id]+'</option>';
				}
				$("#stnotifyaddnew_search_stages").html(options);
			}
			else{
				_self.getStage();	
			}	
        }
		$("#stnotifyaddnew_search_type option[value='"+_self.parent.searchInfo.type+"']").attr("selected", "selected");
		$("#stnotifyaddnew_search_stages option[value='"+_self.parent.searchInfo.stg+"']").attr("selected", "selected");
    };
    stageNotifyAddNew.prototype.getStage = function() {
		 var param = {
			oper:'getstg',
			uid: app.login.userid
        };
		var url = app.route.stgNotifysUrl+'?'+$.param(param);
		console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.ongetStageSuccess
        }); 
	}
	stageNotifyAddNew.prototype.ongetStageSuccess = function(data) {
		if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;			
		}	
		app.utils.clearWait();
		var stages = data.stage_info;
		var options = '';	
		options += "<option value=''></option>";
		for (var stage_id in stages) {
			options += '<option value=' + stage_id + '>'+stages[stage_id]+'</option>';
		}
		$("#stnotifyaddnew_search_stages").html(options);
	}
    stageNotifyAddNew.prototype.save = function() {
        
		 var param = {
			oper:'new',
            type: $("#stnotifyaddnew_search_type").val(),
            stg:  $("#stnotifyaddnew_search_stages").val(),
			uid: app.login.userid
        };
		var data = {
			msg:$("#stgnotifyaddnew_content").val()
		};
        console.log(param);
        var url = app.route.stgNotifysUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "POST",
            url : url,
			data : data,
            success : _self.onSaveSuccess
        });
    };
    stageNotifyAddNew.prototype.onSaveSuccess = function(data) {
		if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;			
		}	
        app.utils.clearWait();
        app.utils.toast("发布成功");
        _self.note = null;
		$.ui.goBack();
        _self.parent.refreshNotifys();
    };
    
    return new stageNotifyAddNew();
});
