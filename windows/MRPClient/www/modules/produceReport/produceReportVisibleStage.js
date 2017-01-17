define(function(require) {
	"use strict";
	var _self;

	function ProduceReportVisibleStage() {
		_self = this;
		_self.id = "produceReportVisibleStage";
	}
	
	ProduceReportVisibleStage.prototype.show = function(stages) {
        if (!_self.stages) {
            _self.stages = [];
            for (var i in stages) {
                _self.stages.push({checked:false, name: stages[i]});
            }
        }
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
	};
	ProduceReportVisibleStage.prototype.onLoad = function() {
		_self.showPanel();
	};
    ProduceReportVisibleStage.prototype.release = function() {
        _self.stages = null;
    };
	ProduceReportVisibleStage.prototype.showPanel = function() {
        var html = '',
            list = _self.stages;

		html += '<div class="input-group">'
        for (var i=0; i<list.length; i++) {
            if (list[i].checked) {
                html += '<input id="prvg_group_' + i + '" type="checkbox" name="prvg_group" value="' + i + '" checked><label for="prvg_group_' + i + '">' + list[i].name + '</label>';
            } else {
                html += '<input id="prvg_group_' + i + '" type="checkbox" name="prvg_group" value="' + i + '"><label for="prvg_group_' + i + '">' + list[i].name + '</label>';
            }
        }
        html += '</div>';
		$("#prvg_from").html(html);
	};
	ProduceReportVisibleStage.prototype.setProduceReportVisibleStage = function() {
        for (var i in _self.stages) {
            _self.stages[i].checked = false;
        }
		$("input[type=checkbox][name='prvg_group']:checked").each(function(){
            var i = $(this).val();
            _self.stages[i].checked = true;
		});
        console.log(_self.stages);
		require('produceReportDetail').setVisibleStage(_self.stages);
		app.utils.hideModal();
	};
	return new ProduceReportVisibleStage();
});
