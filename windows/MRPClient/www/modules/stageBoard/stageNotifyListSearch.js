define(function(require) {
    "use strict";
    var _self;

    function stageNotifyListSearch() {
        _self = this;
        _self.id = "stageNotifyListSearch";
    }

    stageNotifyListSearch.prototype.show = function(parent) {
        _self.parent = parent;
		
        app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
    };
    stageNotifyListSearch.prototype.onLoad = function() {
        _self.showPanel();
    };
    stageNotifyListSearch.prototype.release = function() {
        _self.parent = null;
        _self.addOptions = null;
    };
	stageNotifyListSearch.prototype.getStage = function() {
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
	stageNotifyListSearch.prototype.ongetStageSuccess = function(data) {
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
		$("#stnotify_search_stages").html(options);
	}		
    stageNotifyListSearch.prototype.showPanel = function() {
        if (!_self.addOptions) {
            _self.addOptions = true;
            var stages = _self.parent.stage_info;            
			if(stages){
				var options = '';	
				options += "<option value=''></option>";
				for (var stage_id in stages) {
					options += '<option value=' + stage_id + '>'+stages[stage_id]+'</option>';
				}
				$("#stnotify_search_stages").html(options);
			}
			else{
				_self.getStage();	
			}
        }
        var searchInfo = _self.parent.searchInfo;
		console.log(searchInfo);
        //$("#stnotify_search_stages option[value='"+searchInfo.stg+"']").attr("selected", "selected");
		$("#stnotify_search_stages").val(searchInfo.stg);
       //$("#stnotify_search_type option[value='"+searchInfo.type+"']").attr("selected", "selected");
		$("#stnotify_search_type").val(searchInfo.type);
        $("#stnotify_search_author").val(searchInfo.author);
		$("#stnotify_search_status").val(searchInfo.status);
    };
    stageNotifyListSearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        searchInfo.stg = $("#stnotify_search_stages").val();
        searchInfo.type = $("#stnotify_search_type").val();
        searchInfo.author = $("#stnotify_search_author").val();		
		searchInfo.status = $("#stnotify_search_status").val();		
        _self.parent.refreshNotifys();
        app.utils.hideModal();
    };
    return new stageNotifyListSearch();
});
