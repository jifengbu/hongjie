define(function(require) {
	"use strict";
    var _self;
    function StagePlanComp() {
        _self = this;
        _self.id = "stagePlanComp";
    }

    StagePlanComp.prototype.show = function() {
        _self.extendInfo = {};
        _self.date = app.utils.newDate();
        _self.cur_mrp_id = app.login.userid;
		_self.stage_meta_id = -1;
        var history = JSON.parse(localStorage["STAGE_PLAN_COMP_HISTORY"]||'{}');
        var date = app.utils.dateToString(_self.date);
        var clear = false;
        for (var stage in history) {
            var item = history[stage][0];
            if (item.date !== date) {
                clear = true;
            }
            break;
        }
        if (clear) {
            history = {};
        }
        _self.history = history;

        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
    };
    StagePlanComp.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉刷新", callback:_self.updateList});
        if (!_self.data) {
            _self.getStagePlanComp();
        }
    };
    StagePlanComp.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    StagePlanComp.prototype.release = function() {
        _self.data = null;
        _self.date = null;
        _self.stage_info = null;
        _self.extendInfo = null;
        _self.history = null;
        _self.sumupData = null;
        _self.historyData = null;
        _self.stage_meta_id = -1;
        app.stagePlanCompAddTask&&app.stagePlanCompAddTask.release();
        app.stagePlanCompOtherTask&&app.stagePlanCompOtherTask.release();
        app.stagePlanCompSumupHistory&&app.stagePlanCompSumupHistory.release();
        app.stagePlanCompSumupHistorySearch&&app.stagePlanCompSumupHistorySearch.release();
    };
    StagePlanComp.prototype.changeStage = function(stage_meta_id) {
        _self.stage_meta_id = stage_meta_id;
        _self.updateList();
    };
    StagePlanComp.prototype.doSumup = function() {
        require('stagePlanCompSumup').show(_self.sumupData,_self.comp_data);
    };
    StagePlanComp.prototype.showStagePlanComp = function() {
        var RED = app.color.RED,
            DARKOLIVEGREEN = app.color.DARKOLIVEGREEN,
            STEELBLUE = app.color.STEELBLUE,
            COUNT_COLOR = app.color.COUNT_COLOR,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>',
            WD0 = 'width="5%"',
            WD1 = 'width="30%"',
            WD2 = 'width="15%"',
            WD3 = 'width="13%"',
            WD4 = 'width="13%"',
            WD5 = 'width="23%"',
            html = '',
            data = _self.data;
        console.log(data);
        if (_self.cur_mrp_id == app.login.userid) {
            $('#stpc_title').html('个人工作记录');
        } else {
            $('#stpc_title').html(_self.cur_mrp_id+'的工作记录');
        }

        html += '<div style="background-color:#D3D3D3; margin-bottom: 3px;text-align: center;">'+LC('当前工序：');
        html += '&nbsp;<select id="stpc_stage" style="width: 30%; padding: 3px;" onchange="app.stagePlanComp.changeStage(this.value)">';
        var stages = _self.stage_info;
        for (var stage_id in stages) {
            if (!_self.stage_meta_id||_self.stage_meta_id==-1) {
                _self.stage_meta_id = stage_id;
            }
            var select = (stage_id==_self.stage_meta_id)?'selected="selected"':'';
            html += '<option value="'+stage_id+'" '+select+'>'+stages[stage_id]+'</option>';
        }
        html += '</select>';
        html += '</div>';

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+' >板名称</th><th '+WD2+'>数量</th><th '+WD3+'>'+'开始时间</th><th '+WD4+'>'+'完成时间</th><th '+WD5+'>'+'摘要</th></tr>';

        var index = 0;
        for (var i=0,len=data.length; i<len; i++) {
            var item = data[i];
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

        if (_self.historyData) {
            var item = _self.historyData;
            html += '<li class="divider">汇总</li>';
            html += '<li class="small_font">';
            html += DIVH + CC('产量合计：') + COUNT_COLOR(item.total_output) + '&nbsp;' + RED(item.total_output_unit) + DIVT;
            html += DIVH + CC('工作准备时间：') +COUNT_COLOR(app.utils.timeToStr(item.preparing_time)) + DIVT;
            html += DIVH + CC('工作生产时间：') + DARKOLIVEGREEN(app.utils.timeToStr(item.operation_time)) + DIVT;
            html += DIVH + CC('生产效率：') + COUNT_COLOR(item.productivity) + '&nbsp;' + RED(item.total_output_unit) + '/' + STEELBLUE('小时') + DIVT;
            html += DIVH + CC('结存：') + COUNT_COLOR(item.inventory) + '&nbsp;' + RED(item.total_output_unit) + DIVT;
            html += DIVH + CC('设备问题：') + COUNT_COLOR(item.equipment) + DIVT;
            html += DIVH + CC('提交时间：') + STEELBLUE(item.date) + DIVT;
            html += DIVH + CC('审核状态：') + (item.auditor_state=='no'?RED(item.auditor_state):GREEN(item.auditor_state)) + DIVT;
            html += '</li>';
        } else if (stages) {
            _self.sumupData = _self.getSumupData(data);
            var item = _self.sumupData;
            var space = '&nbsp;&nbsp;&nbsp;';
            html += '<li class="divider">汇总</li>';
            html += '<li class="small_font">';
            html += DIVH + CC('完成：') + COUNT_COLOR(item.total_vol) + '&nbsp;' + RED(item.total_vol_unit) + space + CC('结存：') + COUNT_COLOR(item.total_undo) + '&nbsp;' + RED(item.total_undo_unit);
            html += DIVH + CC('共耗时：') + DARKOLIVEGREEN(app.utils.timeToStr(item.total_time)) + space + CC('效率：') + COUNT_COLOR(item.efficiency) + '&nbsp;' + RED(item.total_vol_unit) + '/' + STEELBLUE('小时') + DIVT;
            if (app.utils.dateEquals(_self.date, app.utils.newDate()) && _self.cur_mrp_id == app.login.userid) {
                var history = _self.history[stages[_self.stage_meta_id]];
                var times = history ? history.length : 0;
                if (times) {
                    html += '<span id="stpc_dumbit_times" style="position: absolute;top:6px;right:10px;">已提交' + times + '次</span>';
                }
                html += '<a class="button icon check" style="position: absolute;top:20px;right:10px;" onclick="app.stagePlanComp.doSumup()">提交</a>';
            }
            html += DIVT + '</li>';
        }
        $('#stpc_list').html(html);
    };
    StagePlanComp.prototype.getSumupData = function(data) {
        var nocomphtml = '';
        var comphtml = '';
        var otherhtml = '';
        var total_time = 0;
        var total_vol = 0;
        var total_vol_unit = 'PNL';
        var total_undo = 0;
        var total_undo_unit = 'PNL';
        var year = new Date().getFullYear();
        for (var i=0,len=data.length; i<len; i++) {
            var item = data[i];
            var type = 1;
            if (item.parent) {
                type = 2;
            } else if (item.work_id) {
                type = 0;
            }

            if (type == 2) { //只计算未完工的数据
                if (!item.outsource&&item.wait_qty) {
                    total_undo += item.wait_qty*1;
                    nocomphtml += _self.getNoCompHtml(item);
                    total_undo_unit = item.workitem_is_panel?'PNL':'PCS';
                }
                continue;
            }

            var delta = 0;
            if (item.time_start && item.time_end) {
                var time_start = new Date(year + '/' + item.time_start);
                var time_end = new Date(year + '/' + item.time_end);
                if (time_end < time_start) {
                    time_start = new Date((year - 1) + '/' + item.time_start);
                }
                delta = (time_end - time_start) / 1000;
            }
            total_time += delta;
            total_vol += (item.workitem_vol||0)*1;
            if (type == 1) {
                comphtml += _self.getHaveCompHtml(item, delta);
                total_vol_unit = item.workitem_is_panel?'PNL':'PCS';
            } else if (type == 0) { //设备问题等其他工作
                otherhtml += _self.getOtherWorkHtml(item, delta);
            }
        }

        var efficiency;
        if (total_time===0) {
            efficiency = 0;
        } else {
            efficiency = (total_vol / (total_time / 3600)).toFixed(2);
        }

        return {
            efficiency: efficiency,
            total_time: total_time,
            total_vol: total_vol,
            total_vol_unit: total_vol_unit,
            total_undo: total_undo,
            total_undo_unit: total_undo_unit,
            nocomphtml: nocomphtml,
            comphtml: comphtml,
            otherhtml: otherhtml
        }
    };
    StagePlanComp.prototype.getHaveCompHtml = function(item, delta) {
        var RED = app.color.RED,
            PURPLE = app.color.PURPLE,
            STEELBLUE = app.color.STEELBLUE,
            GREEN = app.color.GREEN,
            COUNT_COLOR = app.color.COUNT_COLOR,
            DARKOLIVEGREEN = app.color.DARKOLIVEGREEN,
            CC = app.color.GRAY,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>',
            unit = item.workitem_is_panel?'PNL':'PCS',
            html = '';
        html += '<li>';
        html += DIVH+CC('板名称：')+DARKOLIVEGREEN(item.workitem_name.replace(/'/g,''))+DIVT;
        html += DIVH+CC('完工数量：')+COUNT_COLOR(item.workitem_vol)+'&nbsp;'+RED(unit)+DIVT;
        html += DIVH+CC('时长：')+GREEN(app.utils.timeToStr(delta))+'('+STEELBLUE(item.time_start)+'-'+RED(item.time_end)+')'+DIVT;
        html += '</li>';
        return html;
    };
    StagePlanComp.prototype.getOtherWorkHtml = function(item, delta) {
        var RED = app.color.RED,
            PURPLE = app.color.PURPLE,
            STEELBLUE = app.color.STEELBLUE,
            GREEN = app.color.GREEN,
            COUNT_COLOR = app.color.COUNT_COLOR,
            DARKOLIVEGREEN = app.color.DARKOLIVEGREEN,
            CC = app.color.GRAY,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>',
            html = '';
        html += '<li>';
        html += DIVH + CC('任务类型：') + DARKOLIVEGREEN(item.workitem_name.replace(/'/g, '')) + DIVT;
        html += DIVH + CC('任务描述：') + DARKOLIVEGREEN(item.work_context.replace(/'/g, '')) + DIVT;
        html += DIVH+CC('时长：')+GREEN(app.utils.timeToStr(delta))+'('+STEELBLUE(item.time_start)+'-'+RED(item.time_end)+')'+DIVT;
        html += DIVH+'工作描述：'+PURPLE(item.work_context)+DIVT;
        html += '</li>';
        return html;
    };
    StagePlanComp.prototype.getNoCompHtml = function(item) {
        var RED = app.color.RED,
            PURPLE = app.color.PURPLE,
            STEELBLUE = app.color.STEELBLUE,
            GREEN = app.color.GREEN,
            COUNT_COLOR = app.color.COUNT_COLOR,
            DARKOLIVEGREEN = app.color.DARKOLIVEGREEN,
            CC = app.color.GRAY,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>',
            unit = item.workitem_is_panel?'PNL':'PCS',
            html = '';
        html += '<li>';
        html += DIVH+CC('板名称：')+DARKOLIVEGREEN(item.workitem_name.replace(/'/g,''))+DIVT;
        html += DIVH+CC('未完工数量：')+COUNT_COLOR(item.wait_qty)+'&nbsp;'+RED(unit)+DIVT;
        html += DIVH+CC('开始时间：')+STEELBLUE(item.time_start||'未知')+DIVT;
        html += '</li>';
        return html;
    };
    StagePlanComp.prototype.addTaskToList = function(data) {
        var t = {
            workitem_name:data.work_type,
            work_context:data.work_context,
            time_start: data.begin_time,
            time_end: data.end_time,
            work_id: data.ID,
            wstmeta_id: data.memo
        };
        _self.data.push(t);

        _self.showStagePlanComp();
    };
    StagePlanComp.prototype.showSheetMenu = function() {
        var list = [
            // {
                // text: '更换查看日期',
                // cssClasses: '',
                // handler: function () {
                    // $.ui.actionsheetShow = false;
                    // _self.changeShowDate();
                // }
            // },
            {
                text: '查看其他人的记录',
                cssClasses: '',
                handler: function () {
                    $.ui.actionsheetShow = false;
                    _self.changeShowOtherPerson();
                }
            }
        ];


        if (app.utils.dateEquals(_self.date, app.utils.newDate()) && _self.cur_mrp_id == app.login.userid && _self.stage_info) {
            list.push(
                {
                    text: '板名称过数',
                    cssClasses: '',
                    handler: function () {
                        $.ui.actionsheetShow = false;
                        _self.showPopupInputBox();
                    }
                },
                {
                    text: '追加其他任务',
                    cssClasses: '',
                    handler: function () {
                        $.ui.actionsheetShow = false;
                        require('stagePlanCompAddTask').show();
                    }
                });
        } else {
            list.push({
                text: '返回今天任务',
                cssClasses: '',
                handler: function () {
                    $.ui.actionsheetShow = false;
                    _self.backTodayTask();
                }
            });
        }
        app.utils.actionsheet = $("#afui").actionsheet(list);
    };
    StagePlanComp.prototype.backTodayTask = function() {
        _self.date = app.utils.newDate();
        _self.stage_meta_id = -1;
        _self.cur_mrp_id = app.login.userid;
        _self.getStagePlanComp();
    };
    StagePlanComp.prototype.changeShowDate = function() {
        navigator.utils.datePickerDialog(function(date){
            _self.date = date;
            _self.getStagePlanComp();
        }, _self.date.year, _self.date.month, _self.date.day);
    };
    StagePlanComp.prototype.changeShowOtherPerson = function() {
        require('selectPerson').show(_self.cur_mrp_id, _self.updateListByUser);
    };
    StagePlanComp.prototype.showPopupInputBox = function() {
        app.utils.popup({
            title: "输入板名称(至少4位):",
            message: "<input type='text' id='stpc_witem_short_name' class='af-ui-forms' style='color:black;font-weight:bold;'>",
            cancelText: "取消",
            cancelCallback: function () {},
            doneText: "确定",
            doneCallback: function () {
                var short_name = $("#stpc_witem_short_name").val();
                if (short_name.length >= 4) {
                    _self.doGetWitemDispatchList(short_name);
                } else {
                    app.utils.toast("至少输入前4位");
                }
            }
        });
    };
    StagePlanComp.prototype.showListDetail = function(index, type, el) {
        //显示选中颜色
        if (_self.extendInfo.el) {
            _self.extendInfo.el.css("background-color", _self.extendInfo.background);
        }
        var el = $(el);
        _self.extendInfo.el = el;
        _self.extendInfo.background = el.css("background-color");
        el.css("background-color", "#D1EEEE");

        var data = _self.data[index];
        if (type == 0) {
            require('stagePlanCompOtherTask').show(data, _self.stage_info[_self.stage_meta_id]);
        } else if (type == 1) {
            _self.getWitemDispatchDetailDetail(data.wdisp_id);
        } else if (type == 2) {
            require('witemDispatchDetail').show({wdisp_list:[data.parent]}, null, _self.id);
        }
    };
    StagePlanComp.prototype.updateList = function() {
        _self.getStagePlanComp();
    };
    StagePlanComp.prototype.updateListByUser = function(uid) {
        _self.stage_meta_id = -1;
        _self.cur_mrp_id = uid;
        _self.getStagePlanComp();
    };
    StagePlanComp.prototype.doGetWitemDispatchList = function(short_name) {
        _self.short_name = short_name;
        var param = {
            op: 16,
            is_first: 1,
            workitem_short_name:_self.short_name,
            uid: app.login.userid
        };
        console.log(param);
        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetWitemDispatchListSuccess
        });
    };
    StagePlanComp.prototype.onGetWitemDispatchListSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }

        var valid_wdisp_list = [],
            wdisp_list = data.wdisp_list,
            stages = _self.stage_info;
        for (var i in wdisp_list) {
            var item = wdisp_list[i];
            for (var stage_id in stages) {
                if (stage_id == item.wstmeta_id) {
                    valid_wdisp_list.push(item);
                }
            }
        }

        if (!valid_wdisp_list.length) {
            app.utils.toast("该加工对象没有可以过数的派工单");
        } else {
            data.wdisp_list = valid_wdisp_list;
            require('witemDispatchDetail').show(data, _self.short_name, _self.id);
        }

        _self.short_name = null;
        app.utils.clearWait();
    };
    StagePlanComp.prototype.getStagePlanComp = function() {
        var param = {
            oper: 0,
            uid: _self.cur_mrp_id,
            stage_meta_id: _self.stage_meta_id,
            date: app.utils.dateToString(_self.date),
            other: (_self.cur_mrp_id!=app.login.userid)?1:0
        };
        var url = app.route.stagePlanComUrl+'?'+ $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStagePlanCompSuccess,
            error : _self.onGetStagePlanCompError
        });
    };
    StagePlanComp.prototype.onGetStagePlanCompSuccess = function(data) {
        console.log(data);
        var tmp = [];
		var comp_tmp = [];
        _self.stage_info = data.stage_info;
        var comp_info = data.comp_info;
        var wdisp_list = data.wdisp_list;
        var other_work = data.other_work;
        //计算批次数据
        var groups = {};
        for (var i=0 ,len=comp_info.length; i<len; i++) {
            var item = comp_info[i];
            if (!groups[item.wdisp_id]) {
                groups[item.wdisp_id] = [];
            }
            groups[item.wdisp_id].push(item);
        }
        //以下是同一个派工单的数据
        for (var wdisp_id in groups) {
            var group = groups[wdisp_id];
            //区分开接收的和完工的批次
            var comp_wdisp_batch = {};
            var recv_wdisp_batch = {};
            for (var i=0 ,len=group.length; i<len; i++) {
                var item = group[i];
                if (!comp_wdisp_batch[item.id]) {
                    comp_wdisp_batch[item.id] = item;
                }
                if (item.recv_id) {
                    if (!recv_wdisp_batch[item.recv_id]) {
                        recv_wdisp_batch[item.recv_id] = item;
                    }
                }
            }
            //分配到数组按照时间排序
            var comp_wdisp_batch_arr = [];
            var recv_wdisp_batch_arr = [];
            for (var id in comp_wdisp_batch) {
                comp_wdisp_batch_arr.push(comp_wdisp_batch[id]);
            }
            for (var id in recv_wdisp_batch) {
                recv_wdisp_batch_arr.push(recv_wdisp_batch[id]);
            }
            comp_wdisp_batch_arr.sort(function (a, b) {
                return a.time_end.localeCompare(b.time_end);
            });
            recv_wdisp_batch_arr.sort(function (a, b) {
                return a.time_start.localeCompare(b.time_start);
            });

            //批次完工和接收匹配
            for (var id in comp_wdisp_batch_arr) {
                var item = comp_wdisp_batch_arr[id];
                var vol = item.workitem_vol*1;
                var pnl2pcs = null;
                if (item.object_type == 'order') {
                    try {
                        pnl2pcs = JSON.parse(item.attr_val)[item.object_id] || 1;
                    } catch (e) {
                        pnl2pcs = 1;
                    }
                }
                for (var recv_id in recv_wdisp_batch_arr) {
                    var recv_item = recv_wdisp_batch_arr[recv_id];
                    if (pnl2pcs && recv_item.recv_object_type != 'order') {
                        recv_item.recv_workitem_vol *= pnl2pcs;
                    }
                    if ( vol <= recv_item.recv_workitem_vol*1) {
                        var d = {
                            time_start: recv_item.time_start,
                            time_end: item.time_end,
                            wdisp_id: item.wdisp_id,
                            workitem_name: item.workitem_name,
                            workitem_vol: vol,
                            workitem_is_panel: !pnl2pcs,
                            wstmeta_id: item.wstmeta_id
                        };
                        tmp.push(d);
						comp_tmp.push(d);
                        recv_item.recv_workitem_vol -= vol;
                        vol = 0;
                        break;
                    } else if (recv_item.recv_workitem_vol*1) {
                        if (recv_wdisp_batch_arr.length-1 == recv_id) {
                            var d = {
                                time_start: recv_item.time_start,
                                time_end: item.time_end,
                                wdisp_id: item.wdisp_id,
                                workitem_name: item.workitem_name,
                                workitem_vol: vol,
                                workitem_is_panel: !pnl2pcs,
                                wstmeta_id: item.wstmeta_id
                            };
                            tmp.push(d);
							comp_tmp.push(d);
                            break;
                        } else {
                            var d = {
                                time_start: recv_item.time_start,
                                time_end: item.time_end,
                                wdisp_id: item.wdisp_id,
                                workitem_name: item.workitem_name,
                                workitem_vol: recv_item.recv_workitem_vol,
                                workitem_is_panel: !pnl2pcs,
                                wstmeta_id: item.wstmeta_id
                            };
                            tmp.push(d);
							comp_tmp.push(d);
                            vol -= recv_item.recv_workitem_vol*1;
                            recv_item.recv_workitem_vol = 0;
                        }
                    }
                }
                if (vol > 0) {
                    var d = {
                        time_start: item.time_end,
                        time_end: item.time_end,
                        wdisp_id: item.wdisp_id,
                        workitem_name: item.workitem_name,
                        workitem_vol: vol,
                        workitem_is_panel: !pnl2pcs,
                        wstmeta_id: item.wstmeta_id
                    };
                    tmp.push(d);
					comp_tmp.push(d);
                }
            }
        }

        for (var i=0 ,len=other_work.length; i<len; i++) {
            tmp.push(other_work[i]);
        }
        for (var i=0 ,len=wdisp_list.length; i<len; i++) {
            var item = wdisp_list[i];
            var d = {
                parent: item,
                workitem_name:item.witem_name,
                wstmeta_id: item.wstmeta_id,
                no_comp_qty: item.no_comp_qty,
                wait_qty: item.wait_qty,
                priority: item.priority,
                workitem_is_panel: item.object_type!='piece',
                outsource: item.outsource*1
            };
            if (item.wait_qty) {
                d.time_start = item.timestart;
            }
            tmp.push(d);
        }
        //按照完成时间->开始时间->优先级排序
        var s1=[], s2=[], s3=[];
        for (var i in tmp) {
            if (tmp[i].time_end) {
                s1.push(tmp[i]);
            } else if (tmp[i].time_start) {
                s2.push(tmp[i]);
            } else {
                s3.push(tmp[i]);
            }
        }
        s1.sort(function (a, b) {
            return a.time_end.localeCompare(b.time_end);
        });
        s2.sort(function (a, b) {
            return a.time_start.localeCompare(b.time_start);
        });
        s3.sort(function (a, b) {
            return (a.priority<b.priority)?1:(a.priority==b.priority)?0:-1;
        });
        _self.data = s1.concat(s2).concat(s3);
		
		
		var comps1=[], comps2=[], comps3=[];
        for (var i in comp_tmp) {
            if (comp_tmp[i].time_end) {
                comps1.push(comp_tmp[i]);
            } else if (comp_tmp[i].time_start) {
                comps2.push(comp_tmp[i]);
            } else {
                comps3.push(comp_tmp[i]);
            }
        }
		_self.comp_data = comps1.concat(comps2).concat(comps3);
		
        
        app.utils.clearWait();
        if (app.utils.dateEquals(_self.date, app.utils.newDate()) && _self.cur_mrp_id == app.login.userid) {
            _self.showStagePlanComp();
        } else {
            _self.getSumupHistory();
        }
    };
    StagePlanComp.prototype.onGetStagePlanCompError = function(data, type) {
        app.utils.clearWait();
        if (!_self.data) {
            _self.release();
            $.ui.goBack();
        } else {
            app.utils.toast("无效用户");
        }
        return true;
    };
    StagePlanComp.prototype.addTask = function(title, content) {
        var param = {
            oper: 1,
            uid: app.login.userid,
            work_type: title,
            work_context: content,
            stage_meta_id: _self.stage_meta_id
        };
        var url = app.route.stagePlanComUrl+'?'+ $.param(param);
        console.log(url);
        app.utils.setWait("正在提交...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onAddTaskSuccess
        });
    };
    StagePlanComp.prototype.onAddTaskSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data["success"]) {
            app.utils.showError("添加任务失败，可能是数据库错误");
            return;
        }
        _self.addTaskToList(data.result);
    };
    StagePlanComp.prototype.getWitemDispatchDetailDetail = function(wdisp_id) {
        var param = {
            wdisp_id: wdisp_id,
            op: 8,
            uid: app.login.userid
        };

        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetWitemDispatchDetailDetailSuccess
        });
    };
    StagePlanComp.prototype.onGetWitemDispatchDetailDetailSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        require('stationDispatchDetail').show(data.databasic);
        app.utils.clearWait();
    };
    StagePlanComp.prototype.showHistory = function() {
        require('stagePlanCompSumupHistory').show();
    };
    StagePlanComp.prototype.getSumupHistory = function(userid) {
        _self.historyData = null;
        if (!_self.stage_meta_id||_self.stage_meta_id==-1) {
            for (var stage_id in _self.stage_info) {
                _self.stage_meta_id = stage_id;
                break;
            }
        }
		console.log('stage_info',_self.stage_info);console.log('stage_meta_id',_self.stage_meta_id);
        var param = {
            oper: 4,
            uid: app.login.userid,
            time_start: 'day',
            date: app.utils.dateToString(_self.date),
            stage_name: _self.stage_info[_self.stage_meta_id],
            operator_id: _self.cur_mrp_id
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
    StagePlanComp.prototype.onGetSumupHistorySuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data["success"]||!data.list.length) {
            _self.showStagePlanComp();
        } else {
            _self.historyData = data.list[0];
            _self.showStagePlanComp();
        }
    };

    return new StagePlanComp();
});
