define(function(require) {
    "use strict";
    var _self;
    var DEC_DIR = 0, INC_DIR = 1, REFRESH_DIR=2;
	var MAX_PAGE_CACHE = 5;
    var PER_GET_PAGE_NUM = 30;
    function stageNotifyList() {
        _self = this;
        _self.id = "stageNotifyList";
    }
	
    stageNotifyList.prototype.show = function(from,type,stg,is_first,type_name) {
        
		_self.type = type?type:'';
		_self.stg = stg?stg:'';
		
        if (!from || is_first) {
            _self.searchInfo = {
                stg:_self.stg,
                type:_self.type,
				status:'open',
				author:''
            };
        }
		if(from){
			_self.from = from;
			_self.stage_info = from.stage_info;
			_self.stage_name = from.searchInfo.stage
		}
		else{
			_self.stage_info = '';
			_self.stage_name = '';
		}
        _self.notify_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
		_self.getManageUserInfo();
    };
	
    stageNotifyList.prototype.onLoad = function() {
        app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getNotifys(0, PER_GET_PAGE_NUM);
        }
    };
    stageNotifyList.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    stageNotifyList.prototype.release = function() {
        app.utils.setReleasePanel(null);
        _self.loaded = false;
        _self.from = null;
        _self.notify_list = null;
		_self.stage_info = null;
		_self.searchInfo = null;
    };
    stageNotifyList.prototype.refreshCurPage = function() {
        _self.dir = REFRESH_DIR;
		console.log(_self.pageIndex);
        _self.getNotifys(_self.pageIndex, PER_GET_PAGE_NUM);
    };
    stageNotifyList.prototype.refreshNotifys = function() {
        _self.notify_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        app.us.setIntData("STDS_SEARCH_STAGE", _self.searchInfo.stage);
        _self.getNotifys(0, PER_GET_PAGE_NUM);
    };
    //计算当前页的方法是total-tail
    //total = min(loaded+1, MAX_PAGE_CACHE)
    //tail = loaded+1-index
    //如[0,1,2,3];show=2 =>total=4;tail=(3+1-2)=2;cur=4-2=2
    //如[6,7,8,9,10];show=7 =>total=5;tail=(10+1-7)=4;cur=5-4=1
    stageNotifyList.prototype.onCurPage = function(data) {
        var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
        var tail = _self.loadedPageIndex+1-_self.pageIndex;
        var curIndex = total-tail;
		console.log(data);
		for (var i=0; i<data.length; i++) {
			_self.notify_list[i+curIndex*PER_GET_PAGE_NUM] = data[i];
		}			
		
		_self.showNotify(_self.pageIndex);
    };
    stageNotifyList.prototype.nextPage = function() {
        if (_self.pageIndex == -1) {
            app.utils.toast("没有更多的数据了");
            return;
        }
        if (_self.pageIndex == _self.maxPageIndex) {
            app.utils.toast("已经是最后一页了");
            return;
        }
        _self.dir = INC_DIR;
        if (_self.pageIndex < _self.loadedPageIndex) {
            _self.pageIndex++;
            var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
            var tail = _self.loadedPageIndex+1-_self.pageIndex;
            var curIndex = total-tail;
            _self.showNotify(curIndex);
            return;
        }
        _self.getNotifys(_self.pageIndex+1, PER_GET_PAGE_NUM);
    };
    stageNotifyList.prototype.onNextPage = function(data) {
		console.log("stageNotifyList=============onNextPage",data);
        if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
				console.log("stageNotifyList=============onNextPage",_self.pageIndex);
                _self.showStageBoardWithNoData();
            } else {
                _self.maxPageIndex = _self.pageIndex;
                app.utils.toast("已经是最后一页了");
            }
            return;
        }
        _self.pageIndex++;
        if (data.length < PER_GET_PAGE_NUM) {
            _self.maxPageIndex = _self.pageIndex;
        }

        _self.notify_list = _self.notify_list.concat(data);
        _self.loadedPageIndex = _self.pageIndex;
        if (_self.loadedPageIndex >= MAX_PAGE_CACHE) {
            _self.notify_list  = _self.notify_list.slice(PER_GET_PAGE_NUM);
        }
        var curIndex = Math.min(_self.loadedPageIndex, MAX_PAGE_CACHE-1);
        _self.showNotify(curIndex);
    };
    stageNotifyList.prototype.prePage = function() {
        if (_self.pageIndex == -1) {
            app.utils.toast("没有更多的数据了");
            return;
        }
        if (_self.pageIndex == 0) {
            app.utils.toast("已经是第一页了");
            return;
        }
        _self.dir = DEC_DIR;
        var tail = _self.loadedPageIndex+1-_self.pageIndex;
        if (MAX_PAGE_CACHE > tail) {
            _self.pageIndex--;
            var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
            tail = _self.loadedPageIndex+1-_self.pageIndex;
            var curIndex = total-tail;
            _self.showNotify(curIndex);
            return;
        }
        _self.getNotifys(_self.pageIndex-1, PER_GET_PAGE_NUM);
    };
    stageNotifyList.prototype.onPrePage = function(data) {
        _self.pageIndex--;
        _self.loadedPageIndex--;
        _self.notify_list = data.concat(_self.notify_list);
        _self.notify_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
        _self.showNotify(0);
    };
    stageNotifyList.prototype.showFilterSearch = function() {
        require('stageNotifyListSearch').show(_self);
    };
    stageNotifyList.prototype.showStageBoardWithNoData = function(){        
        $('#stnotify_list').html('<span>无提醒!</span>');
    };
    stageNotifyList.prototype.showNotify = function(pageIndex) {
        var PURPLE = app.color.PURPLE,
            BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            CC = app.color.GRAY,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 5px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="5%"',
            WD1 = 'width="30%"',
            WD2 = 'width="10%"',
            WD3 = 'width="15%"',
            WD4 = 'width="40%"',
            html = '';

        var info_list = _self.notify_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
        _self.showData = info_list;

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+info_list.length<_self.totalInfo.count);

        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
		
        var len=info_list.length;
        for (var i=0, len=info_list.length; i<len; i++) {
            var item = info_list[i];
			
           html += "<li class='divider' onclick='app.stageNotifyList.showDetail("+i+")'>[<span style='color:green'>"+
		   $.base64.decode(item.smsg, true)+"</span>]  <span style='color:orange'>"+item.type_name+"</span> <span style='color:red'>"
		   +item.stg_name+"</span></li>";//(<span style='color:blue'>"+item.author+"</span> 发出) 
        }
        
        //console.log(html);
        $('#stnotify_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
   
    stageNotifyList.prototype.getNotifys = function(pageNum, num) {
        var start = pageNum*PER_GET_PAGE_NUM;
        var param = {
            start: start,
            limit: num,
			oper:'list',
            type: _self.searchInfo.type,
            stg: _self.searchInfo.stg,
			author:_self.searchInfo.author,
			status:_self.searchInfo.status,
			 uid: app.login.userid
        };
		 
        console.log(param);
        var url = app.route.stgNotifysUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetNotifys
        });
    };
    stageNotifyList.prototype.onGetNotifys = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        if (_self.maxPageIndex == -1) {
            _self.totalInfo = {};
            _self.totalInfo.count = data.count;
            _self.maxPageIndex = Math.floor((data.count-1)/PER_GET_PAGE_NUM);
        }
		console.log(_self.dir);
        if (_self.dir == DEC_DIR) {
            _self.onPrePage(data.notify_list);
        } else if (_self.dir == INC_DIR) {
            _self.onNextPage(data.notify_list);
        } else {
            _self.onCurPage(data.notify_list);
        }
        app.utils.clearWait();
		if(app.stageBoard){
			console.log("app.StageBoard.getNotifyFirst",data);
			app.stageBoard.getNotifyFirst();
		}
		_self.searchInfo.type
    };
    stageNotifyList.prototype.showDetail = function(index) {
		console.log(_self.showData);
        require('stageNotifyListDetail').show(_self,_self.showData[index]);
    };
	stageNotifyList.prototype.showAddNew = function(){
		require('stageNotifyAddNew').show(_self);
	}
	stageNotifyList.prototype.getManageUserInfo = function() {
        var param = {
            user_id: app.login.userid,
            is_manage: 1
        };
        var url = app.route.crmGetManageUserInfo+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetManageUserInfoSuccess
        });
    };
    stageNotifyList.prototype.onGetManageUserInfoSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        app.login.isManage = (data==1);
		if(app.login.isManage){
			$("#stnotify_list_addnew").show();
		}
    };
    return new stageNotifyList();
});
