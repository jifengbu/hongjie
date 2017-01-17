define(function(require) {
	"use strict";
    var _self;
    function StagePlanCompSumupHistory() {
        _self = this;
        _self.id = "stagePlanCompSumupHistory";
    }

    StagePlanCompSumupHistory.prototype.show = function() {
		console.log(app.stagePlanComp.stage_meta_id);
        _self.searchInfo = {
            time_start:'day',
            date: app.utils.newDate(),
            operator_id: app.stagePlanComp.cur_mrp_id,
            stage_name:app.stagePlanComp.stage_info[app.stagePlanComp.stage_meta_id]
        };
		console.log(app.stagePlanComp);
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    StagePlanCompSumupHistory.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.loaded) {
            _self.loaded = true;
            _self.getSumupHistory();
        }
    };
    StagePlanCompSumupHistory.prototype.release = function() {
		_self.data = null;
        _self.searchInfo = null;
		_self.stgall = null; 
		_self.complist  = null;
		_self.user_list  = null;
		_self.stg_list = null;
    };
    StagePlanCompSumupHistory.prototype.showPanel = function() {
        var RED = app.color.RED,
            PURPLE = app.color.PURPLE,
            STEELBLUE = app.color.STEELBLUE,
            GREEN = app.color.GREEN,
            COUNT_COLOR = app.color.COUNT_COLOR,
            DARKOLIVEGREEN = app.color.DARKOLIVEGREEN,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>',
            html = '',
			WD0 = 'width="5%"',
            WD1 = 'width="30%"',
            WD2 = 'width="15%"',
            WD3 = 'width="13%"',
            WD4 = 'width="13%"',
            WD5 = 'width="23%"',
            data = _self.data;
			console.log(_self.searchInfo);
		html += '<li class="divider">'+'日期:'+RED(_self.searchInfo.date.year+'-'+_self.searchInfo.date.month+'-'+_self.searchInfo.date.day)+'</li>';
		
		//_self.complist  = data.comp_info;    
		//_self.user_list = data.user_list;    
		//_self.stg_list = data.stg_list;	
		console.log("_self.complist",_self.complist);
		console.log("_self.user_list",_self.user_list);
		console.log("_self.stg_list",_self.stg_list);
		//console.log("_self.stgall",_self.stgall);
		
		
		console.log("searchInfo",_self.searchInfo);
		var default_user = '';
		var default_stg = '';
		if($("#stpsh_stg_list").length){
			default_stg = $("#stpsh_stg_list").val();
		}
		if($("#stpsh_user_list").length){
			default_user = $("#stpsh_user_list").val();
		}
        if (_self.searchInfo.stage_name) {
            html += '<li class="divider">'+'工序:'+RED(_self.searchInfo.stage_name)+'</li>';
			for(var stgnid in _self.stgall){
				if(_self.stgall[stgnid] == _self.searchInfo.stage_name){
					default_stg = stgnid;
					break;
				}	
			}	
        }
		else{
			if(!default_stg){
				for (var stg_id in _self.stg_list) {
					default_stg = stg_id;
					break;
				}
			}	
			html += '<li class="divider">'+'工序:';		
			var stgnum = 0;	
			var stghtml = '';
			for (var stg_id in _self.stg_list) {
				var selected = '';
				if (default_stg == stg_id) {
					selected = ' selected';
				}	
				stghtml += "<option value='"+stg_id+"' "+selected+">"+_self.stg_list[stg_id]+"</option>";
				stgnum++;
			}	
			if(stgnum>0){
				html += "<select id='stpsh_stg_list'>"+stghtml+"</select>";
			}
			html += "</li>";
		}	
		if(_self.searchInfo.operator_id){
			html += '<li class="divider"> 操作人员:'+RED(_self.searchInfo.operator_id)+'</li>';
			default_user = _self.searchInfo.operator_id;
		}
		else{
			if(!default_user){
				for (var idx in _self.user_list) {
					default_user = _self.user_list[idx].id;
					break;
				}
			}
			html += '<li class="divider">'+'操作人员:';			
			var usernum = 0;
			var user_html = '';
			for (var idx in _self.user_list) {	
				var selected = '';
				if (default_user == _self.user_list[idx].id) {
					selected = 'selected';
				}
				user_html += "<option value='"+_self.user_list[idx].id+"' "+selected+">"+_self.user_list[idx].name+"</option>";
				usernum++;
			}
			if(usernum>0){
				html += "<select id='stpsh_user_list'>"+user_html+"</select>";
			}							
			html += "</li>";	
		}
		
		var curcomplist = [];
		console.log("default_user",default_user);
		console.log("default_stg",default_stg);
		var complen = 0;
		for (var obj in _self.complist) {	
			complen++;
		}
		if(complen>0){
			if(_self.complist[default_user]){
				curcomplist = _self.complist[default_user][default_stg];
				console.log("----complist----",_self.complist[default_user][default_stg]);
			}
			else{
				curcomplist = '';
			}				
		}
		if(!curcomplist){
			curcomplist = [];
		}
		console.log("curcomplist",curcomplist);
		if(curcomplist.length > 0){	
			html += '<table style="border:1px;color:inherit;width: 100%">';
			html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+' >板名称</th><th '+WD2+'>数量</th><th '+WD3+'>'+'开始时间</th><th '+WD4+'>'+'完成时间</th><th '+WD5+'>'+'摘要</th></tr>';		
			var index = 0;
			for (var i=0,len=curcomplist.length; i<len; i++) {
				var item = curcomplist[i];
				index++;
				var background = (index&1)?"lightgray":"wheat";
				var type = 1;
				if (item.parent) {
					type = 2;
				} else if (item.work_id) {
					type = 0;
				}
				html += '<tr align="center" style="background-color:'+background+'; height:2em" onclick="app.stagePlanComp.showListDetail('+i+','+type+', this)">';
				html += '<td '+WD0+'>' + RED(index) + '</td>';
				html += '<td '+WD1+'>' + CC(item.workitem_name.replace(/'/g,''))+(item.outsource?'('+RED('w')+')':'')+ '</td>';
				if (type==0) {
					html += '<td ' + WD2 + '></td>';
				} else if (type==1) {
					html += '<td ' + WD2 + '>' + COUNT_COLOR(item.workitem_vol)+RED(item.workitem_is_panel?'PNL':'PCS')+ '</td>';
				} else {
					var unit = item.workitem_is_panel?'PNL':'PCS';
					html += '<td ' + WD2 + '>' +RED(item.wait_qty)+'/'+GREEN(item.no_comp_qty) +RED(unit)+ '</td>';
				}
				html += '</td>';
				if (!item.time_start) {
					html += '<td '+WD3+'></td>';
				} else {
					html += '<td ' + WD3 + '>' + item.time_start + '</td>';
				}
				if (!item.time_end) {
					html += '<td '+WD4+'></td>';
				} else {
					html += '<td '+WD4+'>'+item.time_end+'</td>';
				}
				if (type==0) {
					html += '<td '+WD5+'>'+CC(item.work_context)+'</td>';
				} else {
					html += '<td '+WD5+'></td>';
				}
				html += '</tr>';
			}
			html += '</table>';
		}
		
		var curdata = [];
		var loglen = 0;
		for (var obj in data) {	
			loglen++;
		}
		if(loglen>0){
			if(data[default_user]){
				curdata = data[default_user][default_stg];
				console.log("----curdata----",data[default_user][default_stg]);
			}
			else{
				curdata = '';
			}			
		}
		if(!curdata){
			curdata = [];
		}
		var log_html = '';
        for (var i=0,len=curdata.length; i<len; i++) {
            var item = curdata[i];
            // if (!_self.searchInfo.stage_name) {
                // log_html += '<li class="divider">' + '工序:' + RED(item.procedure) + '</li>';
            // }
            log_html += '<li>';
            log_html += DIVH + CC('产量合计：') + COUNT_COLOR(item.total_output) + '&nbsp;' + RED(item.total_output_unit) + DIVT;
            log_html += DIVH + CC('工作准备时间：') +COUNT_COLOR(app.utils.timeToStr(item.preparing_time)) + DIVT;
            log_html += DIVH + CC('工作生产时间：') + DARKOLIVEGREEN(app.utils.timeToStr(item.operation_time)) + DIVT;
            log_html += DIVH + CC('生产效率：') + COUNT_COLOR(item.productivity) + '&nbsp;' + RED(item.total_output_unit) + '/' + STEELBLUE('小时') + DIVT;
            log_html += DIVH + CC('结存：') + COUNT_COLOR(item.inventory) + '&nbsp;' + RED(item.total_output_unit) + DIVT;
            log_html += DIVH + CC('设备问题：') + COUNT_COLOR(item.equipment) + DIVT;
            log_html += DIVH + CC('提交时间：') + STEELBLUE(item.date) + DIVT;
            log_html += DIVH + CC('审核状态：') + (item.auditor_state=='no'?RED(item.auditor_state):GREEN(item.auditor_state)) + DIVT;
            log_html += '</li>';
        }
        if (!log_html) {
            html += '<li>没有提交的日志历史记录！</li>';
        }
		else{
			html += log_html;
		}	
        $('#stpsh_list').html(html);
		$('#stpsh_user_list').unbind('change');
		$('#stpsh_user_list').bind('change',function(){
			_self.showPanel();					
		});
		$('#stpsh_stg_list').unbind('change');
		$('#stpsh_stg_list').bind('change',function(){
			_self.showPanel();											
		});
    };
    StagePlanCompSumupHistory.prototype.doSearch = function() {
        require('stagePlanCompSumupHistorySearch').show(this);
    };
    StagePlanCompSumupHistory.prototype.getSumupHistory = function() {
        var param = {
            oper: 9,
            uid: app.login.userid,
            time_start: _self.searchInfo.time_start,
            date: app.utils.dateToString(_self.searchInfo.date),
            stage_name: _self.searchInfo.stage_name,
            operator_id: _self.searchInfo.operator_id
        };
        console.log(param);
        var url = app.route.stagePlanComUrl+'?'+ $.param(param);
        console.log(url);
        app.utils.setWait("正在提交...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetSumupHistorySuccess
        });
    };
    StagePlanCompSumupHistory.prototype.onGetSumupHistorySuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data["success"]) {
            app.utils.showError(app.error.DATA_ERROR);
            return;
        }
        _self.data = data.list;		        
		_self.getCompList(true);
    };
	
	StagePlanCompSumupHistory.prototype.getCompList = function(notshowload) {
		var param = {
            oper: 7,
            user_id: _self.searchInfo.operator_id,
			uid:app.login.userid,
            stage_meta_name: _self.searchInfo.stage_name,
            date: app.utils.dateToString(_self.searchInfo.date)
        };
        var url = app.route.stagePlanComUrl+'?'+ $.param(param);
        console.log("getCompList",url);
		if(!notshowload){
			app.utils.setWait("请稍后...");
		}
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.getCompListSuccess,
            error : _self.getCompListError
        });	
	};
	StagePlanCompSumupHistory.prototype.getCompListSuccess = function(data){
		
        console.log(data);
        _self.complist  = data.comp_info;    
		_self.user_list = data.user_list;    
		_self.stg_list = data.stg_list;	
		_self.stgall = data.stage_info;
        app.utils.clearWait();
		_self.showPanel();
               
    };
	StagePlanCompSumupHistory.prototype.getCompListError = function(data, type) {
        app.utils.clearWait();
		app.utils.toast("获取完工过数数据失败!");
        return true;
    };
	
    return new StagePlanCompSumupHistory();
});
