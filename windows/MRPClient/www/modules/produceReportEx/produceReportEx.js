define(function(require) {
	"use strict";
	var _self;
    var MODE = 0;

	function ProduceReport() {
		_self = this;
		_self.id = "produceReportEx";
	}
	
	ProduceReport.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
	};
	ProduceReport.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.date) {
            _self.date = app.utils.newDate();
        }
        if (!_self.data) {
           _self.getProduceReport(true);
        }

//        var data = '{"stage_info":{"开料":[["plan","panel","2","132","0"],["plan","panel","2","132","0"],["produce","panel","1","14","0"],["produce","panel","1","14","0"],["comp","panel","1","14","0"],["recv","panel","1","14","0"],["recv","panel","1","14","0"],["inprocess",null,"0",null,null],["waittorecv","panel","0",null,null],["waittorecv","piece","0",null,null]],"钻孔":[["plan","panel","2","132","0"],["produce","panel","1","14","0"],["inprocess",null,"0",null,null],["waittorecv","panel","13","367","68.66364754"],["waittorecv","piece","0",null,null]]},"success":true}';
//        data = JSON.parse(data);
//        _self.data = data.stage_info;
//        _self.showProduceReport();
	};
    ProduceReport.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.data = null;
        _self.stages = null;
        _self.date = null;
        _self.search_date = null;
        app.produceReportExVisibleStage&&app.produceReportExVisibleStage.release();
    };
	ProduceReport.prototype.doResearch = function() {
        navigator.utils.datePickerDialog(function(date){
            _self.date = date;
            _self.getProduceReport(true);
        }, _self.date.year, _self.date.month, _self.date.day);
	};
    ProduceReport.prototype.getItemHtml = function(arr, type) {
        var COUNT_COLOR = app.color.COUNT_COLOR,
            PNL_COLOR = app.color.PNL_COLOR,
            PCS_COLOR = app.color.PCS_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            html = "",
            rows = 0,
            first = true;

        for (var i=0,len=arr.length; i<len; i++){
            var item = arr[i];
            if (item[0] == type) {
                rows++;
                var TRH = '', TRT = '';
                if (!first) {
                    TRH = '<tr>';TRT = '</tr>';
                } else {
                    first = false;
                }
                if (!item[2] && !item[3] && !item[4]) {
                    continue;
                }
                if (item[1]=='piece') {
                    html += TRH+'<td style="border:1px solid;border-color:#E0E0E0;">'+COUNT_COLOR(item[2]) + '款' + '</td><td style="border:1px solid;border-color:#E0E0E0;">'+ PCS_COLOR(item[3]) + 'PCS' + '</td><td style="border:1px solid;border-color:#E0E0E0;">' + AREA_COLOR(item[4]) + '平米</td>'+TRT;
                } else {
                    html += TRH+'<td style="border:1px solid;border-color:#E0E0E0;">'+COUNT_COLOR(item[2]) + '款' + '</td><td style="border:1px solid;border-color:#E0E0E0;">'+ PNL_COLOR(item[3]) + 'PNL' + '</td><td style="border:1px solid;border-color:#E0E0E0;">' + AREA_COLOR(item[4]) + '平米</td>'+TRT;
                }
            }
        }

        if (html == "") html = '<td colspan="3" style="border:1px solid;border-color:#E0E0E0;">0</td>';
        return {rows: rows, html: html};
    };
	ProduceReport.prototype.showProduceReport = function(data) {
        var COUNT_COLOR = app.color.COUNT_COLOR,
            PNL_COLOR = app.color.PNL_COLOR,
            DATE_COLOR = app.color.DATE_COLOR,
            PCS_COLOR = app.color.PCS_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 12px;text-align: center;">',
            DIVT = '</div>',
            html = "";

        var types = {"plan":"计划","produce":"投产","recv":"接收","inprocess":"在制","comp":"完工","waittorecv":"待接收","disd":"报废","rewk":"返工"};

        html += DIVCH+'查询日期:'+DATE_COLOR(_self.search_date)+DIVT;
        var data = _self.data;
        for (var stage in data) {
            var arr = data[stage];
            html += '<li>';
            html += '<h2>' + stage + '</h2>';
            html += '<table style="border-spacing:0px;font:inherit;width:100%">';
            for (var type in types) {
                var item = _self.getItemHtml(arr, type);
                html += '<tr><td rowspan="'+item.rows+'" style="border:1px solid;border-color:#E0E0E0;">'+types[type]+'：</td>';
                html += item.html;
                html += '</tr>';
            }
            html += '</table>';
            html += '</li>';
        }
        html +=  app.utils.buttonHtml([
            {text:'查看工序详细生产情况', click:'app.produceReportEx.getProduceReportDetail()'}
        ]);

//        console.log(html);
		$('#prex_list').html(html);
        setTimeout(function(){
            $.ui.scrollToTop(app.utils.panelID(_self.id), 500);
        }, 100);
	};
    ProduceReport.prototype.getProduceReportDetail = function() {
        require('produceReportExVisibleStage').show(_self.stages);
    };
    ProduceReport.prototype.getStagesReport = function(stages) {
        var stage_names = "";
        for (var i in stages) {
            if (stages[i].checked) {
                stage_names += ","+stages[i].name;
            }
        }
        stage_names = stage_names.substr(1);
        _self.getProduceReport(false, stage_names);
    };
	ProduceReport.prototype.dateFormat = function(date) {
        var year = date.year,
            month = (date.month<10)?"0"+date.month:date.month,
            month = (date.day<10)?"0"+date.day:date.day;
        return year + "" + month + "" + day;
    };
	ProduceReport.prototype.getProduceReport = function(is_first, stage_names) {
        _self.search_date = _self.date.year + "-" + _self.date.month + "-" + _self.date.day;
        var param = {
            uid: app.login.userid,
            search_date:_self.search_date,
            is_first:is_first,
            stage_names:stage_names
        };

        var url = app.route.produceReportExUrl+"?"+$.param(param);
        console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetProduceReportSuccess,
			error : _self.onGetProduceReportError
		});
	};
	ProduceReport.prototype.onGetProduceReportSuccess = function(data) {
        console.log(data);
		if (!data.success) {
			app.utils.showError(app.error.SERVER_ERROR);
			app.utils.clearWait();
			$.ui.goBack();
			return;
		}
        if (data.stages) {
            _self.stages = data.stages;
            data.stages = null;
        }
        _self.data = data.stage_info;
        _self.showProduceReport();
		app.utils.clearWait();
	};
	ProduceReport.prototype.onGetProduceReportError = function(data, type) {
        _self.release();
		$.ui.goBack();
	};

	return new ProduceReport();
});
