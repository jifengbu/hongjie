define(function(require) {
	"use strict";
	var _self;

	function SelectGroup() {
		_self = this;
		_self.id = "selectGroup";
	}
	
	SelectGroup.prototype.show = function(groups, callback) {
		_self.multi = _.isArray(groups);
		_self.groups = _self.multi?groups:[groups];
		_self.callback = callback;
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
	};
	SelectGroup.prototype.onLoad = function() {
		app.crm.checkCommonInfo(_self.showPanel);
	};
	SelectGroup.prototype.showPanel = function() {
		var arr = app.crm.commonInfo.priv_cat,
			type = _self.multi ? 'checkbox':'radio';
		var list = [];
		for (var i=0; i<arr.length; i++) {
			var checked = ' ';
			for (var j in _self.groups) {
				if (_self.groups[j].trim() == arr[i].key) {
					checked = ' checked';
					break;
				}
			}
			var item = {key:arr[i].key, name:arr[i].name, checked:checked};
			list.push(item);
		}
		var html = '<div class="input-group">';
			for (var i=0; i<list.length; i++) {
				html += '<input id="selg_group_' + i + '" type="'+type+'" name="selg_group" value="' + list[i].key + '"'+list[i].checked+'><label for="selg_group_' + i + '">' + list[i].name + '</label>';
            }
        html += '</div>';

		$("#selg_from").html(html);
	};
	SelectGroup.prototype.setSelectGroup = function() {
		var callback = _self.callback;
		_self.callback = null;

		if (_self.multi) {
			var groups = [];
			$("input[type=checkbox][name=selg_group]").each(function () {
				var el = $(this);
				if (el.prop('checked')) {
					groups.push(el.val());
				}
			});
			callback(groups);
		} else {
			var group = $("input[type=radio][name=selg_group]:checked").val();
			callback(group);
		}
		app.utils.hideModal();
	};
	return new SelectGroup();
});
