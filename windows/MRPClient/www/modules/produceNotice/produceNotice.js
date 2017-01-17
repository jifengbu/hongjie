define(function(require) {
	"use strict";
    var _self;

    function ProduceNotice() {
        _self = this;
		_self.id = "produceNotice";
    }

    ProduceNotice.prototype.show = function() {
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
    };
    ProduceNotice.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.data) {
            _self.getProduceNotice();
        }
    };
    ProduceNotice.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.data = null;
        $('#prnt_list').html("");
        app.produceNoticeItem&&app.produceNoticeItem.release();
    };
    ProduceNotice.prototype.showProduceNotice = function(data) {
        var DATE_COLOR = app.color.DATE_COLOR,
            content = _self.data.content,
            data = _self.data.content.data,
            html = '';
        html += '<li>';
        html += '<div style="margin-bottom: 6px;">'+DATE_COLOR(content.sta_time)+'</div>';
        html += '</li>';
        for (var i=0, len=data.length; i<len; i++) {
            html += '<li onclick="app.produceNotice.showNoticeItem('+i+')">';
            html += '<a href="#">'+data[i].title+'</h2></a>';
            html += '</li>';
        }

        $('#prnt_list').html(html);
    };
    ProduceNotice.prototype.getProduceNotice = function() {
        var param = {
            uid: app.login.userid
        }

        var url = app.route.produceNoticeUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetProduceNoticeSuccess,
            error : _self.onGetProduceNoticeError
        });
    };
    ProduceNotice.prototype.onGetProduceNoticeSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            $.ui.goBack();
            return;
        }
        _self.data = data;
        _self.showProduceNotice(data);
        app.utils.clearWait();
    };
    ProduceNotice.prototype.onGetProduceNoticeError = function(data, type) {
        _self.release();
        $.ui.goBack();
    };
    ProduceNotice.prototype.showNoticeItem = function(index) {
        require('produceNoticeItem').show(_self.data.content.data[index]);
    };
    return new ProduceNotice();
});
