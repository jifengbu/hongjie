define(function(require) {
	"use strict";
    var _self;
    function StagePlanCompSumupDetail() {
        _self = this;
        _self.id = "stagePlanCompSumupDetail";
    }

    StagePlanCompSumupDetail.prototype.show = function(data) {
        _self.data = data;
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
    };
    StagePlanCompSumupDetail.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.loaded) {
            _self.loaded = true;
            _self.showPanel(_self.data);
            _self.data = null;
        }
    };
    StagePlanCompSumupDetail.prototype.showPanel = function(data) {
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
            comphtml = data.comphtml,
            nocomphtml = data.nocomphtml,
            otherhtml = data.otherhtml,
            html = '';

        html += '</ul>';
        if (comphtml) {
            html += '<li class="divider expanded" onclick="app.utils.showHide(this, \'spcsd_comp_detail\')">完工详细</li>';
            html += '<ul class="list inset" id="spcsd_comp_detail">';
            html += comphtml;
            html += '</ul>';
        }
        if (nocomphtml) {
            html += '<li class="divider expanded" onclick="app.utils.showHide(this, \'spcsd_nocomp_detail\')">结存详细</li>';
            html += '<ul class="list inset" id="spcsd_nocomp_detail">';
            html += nocomphtml;
            html += '</ul>';
        }
        if (otherhtml) {
            html += '<li class="divider expanded" onclick="app.utils.showHide(this, \'spcsd_other_detail\')">其他工作详细</li>';
            html += '<ul class="list inset" id="spcsd_other_detail">';
            html += otherhtml;
            html += '</ul>';
        }
        html += '</ul>';
        $('#stpsd_list').html(html);
    };

    return new StagePlanCompSumupDetail();
});
