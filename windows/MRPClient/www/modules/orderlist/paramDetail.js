define(function(require) {
	"use strict";
	var _self;

	function OrderlistParamDetail() {
		_self = this;
		_self.id = "paramDetail";
	}
	
	OrderlistParamDetail.prototype.show = function(data) {
		this.data = data;
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
	};
	OrderlistParamDetail.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        var PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            WHITE = app.color.WHITE,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVH = '<div>',
            DIVT = '</div>',
            RCOLH = '<span>',
            RCOLT = '</span>',
            html = '',
            data = this.data;

        var cnt=0;
        for(var key in data){
            var id= "uwolpd_info"+cnt;
            html += '<li>';
            html += '<h2 class="expanded" onclick="app.utils.showHide(this, \''+id+'\')" style="background-color:#D3D3D3;">'+key+'</h2>';
            html += '<div id="'+id+'">';
            var item = data[key];
            for(var key1 in item){
                html += DIVH+LC(key1)+'： '+(item[key1]?BLUE(item[key1]):RED("无"))+DIVT;
            }
            html += '</div>';
            html += '</li>';
            cnt++;
        }
		//console.log(html);
		$('#orderlist_param_detail_list').html(html);
	};
    OrderlistParamDetail.prototype.release = function() {
        this.data = null;
    };
	return new OrderlistParamDetail();
});
