define(function(require) {
	"use strict";
    var _self;

    function ProduceNoticeItem() {
        _self = this;
		_self.id = "produceNoticeItem";
    }

    ProduceNoticeItem.prototype.show = function(data) {
        _self.data = data;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    ProduceNoticeItem.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.showProduceNoticeItem(_self.data);
    };
    ProduceNoticeItem.prototype.release = function() {
        _self.data = null;
        $('#prnti_list').html("");
    };
    ProduceNoticeItem.prototype.showProduceNoticeItem = function(data) {
        var title = data.title,
            content = data.content,
            html = '';
        $('#prnti_title').html(title);
        var is_wsh = /加工单/.test(title);
        for (var key in content) {
            if (!is_wsh) {
                html += '<li>';
                html += '<div>' + key + ':' + content[key] + '</div>';
                html += '</li>';
            } else {
                var wsheet_id = content[key].wsheet_no;
                html += '<li onclick="app.produceNoticeItem.showNoticeDetail(\''+wsheet_id+'\')">';
                html += '<a >' + key + ':' + content[key].content + '</a>';
                html += '</li>';
            }
        }
        $('#prnti_list').html(html);
    };
    ProduceNoticeItem.prototype.showNoticeDetail = function(wsheet_id) {
        require('produceNoticeDetail').show(wsheet_id);
    }

    return new ProduceNoticeItem();
});
