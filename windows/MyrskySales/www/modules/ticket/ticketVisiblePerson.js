define(function(require) {
	"use strict";
	var _self;

	function TicketVisiblePerson() {
		_self = this;
		_self.id = "ticketVisiblePerson";
	}
	
	TicketVisiblePerson.prototype.show = function(persons, commonInfo) {
		_self.commonInfo = commonInfo;
		_self.persons = persons.split(',');
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
	};
	TicketVisiblePerson.prototype.onLoad = function() {
		_self.showPanel();
	};
    TicketVisiblePerson.prototype.release = function() {
        _self.commonInfo = null;
        _self.persons = null;
    };
	TicketVisiblePerson.prototype.showPanel = function() {
		var inner_user = _self.commonInfo.inner_user,
            persons = _self.persons;
		var html = '';
        for (var group in inner_user) {
            html += '<li>';
            html += '<div class="formGroupHead">' + group + '</div>';
            html += '<div>';
            html += '<div class="input-group">';
            var users = inner_user[group];
            for (var i in users) {
                var user = users[i];
                for (var id in user) {
                    var checked = false;
                    for (var j in persons) {
                        if (persons[j].trim() == id) {
                            checked = true;
                            break;
                        }
                    }
                    if (checked) {
                        html += '<input id="tvp_usr_' + id + '" type="checkbox" name="tvp_person" value="' + id + '" checked><label for="tvp_usr_' + id + '">' + user[id] + '</label>';
                    } else {
                        html += '<input id="tvp_usr_' + id + '" type="checkbox" name="tvp_person" value="' + id + '"><label for="tvp_usr_' + id + '">' + user[id] + '</label>';
                    }
                    break
                }
            }
            html += '</div>';
            html += '</div>';
            html += '</li>';
        }
		$("#tvp_list").html(html);
	};
	TicketVisiblePerson.prototype.setTicketVisiblePerson = function() {
		var ret = "";
		$("input[type=checkbox][name='tvp_person']:checked").each(function(){
			if (ret != "") {
				ret += ",";
			}
			ret += $(this).val(); 
		});  
		require('ticketIssue').setVisiblePerson(ret);
		app.utils.hideModal();
	};
	return new TicketVisiblePerson();
});
