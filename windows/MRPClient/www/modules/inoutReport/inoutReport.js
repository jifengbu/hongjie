define(function(require) {
	"use strict";
    var _self;

    function InoutReport() {
        _self = this;
		_self.id = "inoutReport";
    }

    InoutReport.prototype.show = function() {
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
    };
    InoutReport.prototype.onLoad = function() {
        if (!_self.date) {
            _self.date = app.utils.newDate();
            _self.search_date = _self.date.year + "-" + _self.date.month;
            _self.rangeType = "month";
            $('input[type="radio"][name="ior_range"][value="month"]').prop("checked", true);
        }
        $('#ior_time').val(_self.search_date);
        $('input[type="radio"][name="ior_range"]').change(function () {
            _self.rangeType = this.value;
            _self.setSearchDate();
        });
    };
    InoutReport.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.date = null;
        _self.search_date = null;
    };
    InoutReport.prototype.setSearchDate = function() {
        if (_self.rangeType == 'month') {
            _self.search_date = _self.date.year + "-" + _self.date.month;
        } else {
            _self.search_date = _self.date.year + "-" + _self.date.month + "-" + _self.date.day;
        }
        $('#ior_time').val(_self.search_date);
    };
    InoutReport.prototype.doSelectDate = function() {
        navigator.utils.datePickerDialog(function(date){
            _self.date = date;
            _self.setSearchDate();
        }, _self.date.year, _self.date.month, _self.date.day);
    };
    InoutReport.prototype.getInoutReport = function() {
        var param = {
            statistic_time: _self.search_date,
            statistic_range: _self.rangeType,
            uid: app.login.userid
        }

        var url = app.route.inoutReportUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetInoutReportSuccess
        });
    };
    InoutReport.prototype.onGetInoutReportSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        require('inoutReportDetail').show(data);
        app.utils.clearWait();
    };
    return new InoutReport();
});
