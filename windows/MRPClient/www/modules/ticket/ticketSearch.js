define(function(require) {
    "use strict";
    var _self;

    function TicketSearch() {
        _self = this;
        _self.id = "ticketSearch";
    }

    TicketSearch.prototype.show = function(parent) {
        _self.parent = parent;
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft",loadfunc:_self.id+"=onLoad"});
    };
    TicketSearch.prototype.onLoad = function() {
        app.updateChatPageBadge(_self.id);
        if (!_self.loaded) {
            _self.loaded = true;
            app.crm.checkCommonInfo(_self.showPanel);
        }
    };
    TicketSearch.prototype.release = function() {
        _self.parent = null;
    };
    TicketSearch.prototype.getFilterHtml = function() {
        var html = '',
            searchInfo = _self.parent.searchInfo;

        html += '<div style="padding: 20px 20px" id="tisearch_filter">';

        html += '<table  width="100%" style="color: inherit;">';
        html += '<tr><td>';
        html += '<label for="tisearch_writer_id" style="width: 32%;">发布人:</label>';
        html += '<textarea id="tisearch_writer_id" rows="2" placeholder="多个用逗号隔开" style="width: 52%;" class="input_style">'+(searchInfo.writer_id?searchInfo.writer_id.join(','):'')+'</textarea><label for="tisearch_writer_id" style="width: 15%;float:right;"><a class="button icon add" style="float:right;border:0" onclick="app.ticketSearch.addPerson()"></a></label>';
        html += '</td></tr>';
        html += '<tr><td>';
        html += '<label for="tisearch_ticket_ids" style="width: 32%;">查询ticket:</label>';
        html += '<textarea id="tisearch_ticket_ids" rows="2" placeholder="多个用英文头号隔开,如83128,83129" style="width: 60%;" class="input_style">'+(searchInfo.ticket_ids?searchInfo.ticket_ids.join(','):'')+'</textarea>';
        html += '</td></tr>';
        html += '<tr><td>';
        var checked = searchInfo.un_read_myself?' checked':'';
        html += '<label for="tisearch_un_read_myself" style="width: 32%;">只显示未读:</label>';
        html += '<input id="tisearch_un_read_myself" type="checkbox"'+checked+' class="toggle"><label for="tisearch_un_read_myself" data-on="是" data-off="否" style="left:55%"><span></span></label>';
        html += '</td></tr>';
        html += '</table>';
        html += '</div>';

        return html;
    };
    TicketSearch.prototype.getStatusHtml = function() {
        var html = '',
            parent = _self.parent,
            index = 0;

        var list = app.crm.commonInfo.status;
        var status = parent.searchInfo.status;
        var cnt = list.length;
        var all = ((!status)||cnt===status.length);

        html += '<div style="padding: 20px 20px" id="tisearch_status">';
        html += '<table width="100%">';
        for(var i=0; i<cnt; i++){
            var item = list[i];
            if (!(index&1)) {
                html += '<tr width="100%">';
            }
            html += '<td width="50%">';
            var checked = (all||(status.indexOf(item.key)!=-1))?"checked":"";
            html += '<input id="tksearch_status_'+i+'" type="checkbox" name="tksearch_status" value="'+item.key+'"'+checked+'><label for="tksearch_status_'+i+'" style="width:90%;">'+item.name+'</label>';
            html += '</td>';
            if (index&1) {
                html += '</tr>';
            }
            index++;
        }
        if (!(index&1)) {
            html += '<tr width="100%">';
        }
        html += '<td>';
        var checked = (all)?"checked":"";
        html += '<input id="tksearch_status_all" type="checkbox" name="tksearch_status_all" '+checked+'><label for="tksearch_status_all" style="width:90%;">all</label>';
        html += '</td>';
        if (index&1) {
            html += '</tr>';
        }
        html += '</table>';
        html += '</div>';
        return html;
    };
    TicketSearch.prototype.initialStatusState = function() {
        $('input[type="checkbox"][name="tksearch_status"]').change(function(){
            var checked = ($('input[type="checkbox"][name="tksearch_status"]:checked').length == app.crm.commonInfo.status.length);
            $('input[type="checkbox"][name="tksearch_status_all"]').prop("checked", checked);
        });
        $('input[type="checkbox"][name="tksearch_status_all"]').change(function(){
            var checked = $(this).prop("checked");
            $('input[type="checkbox"][name="tksearch_status"]').each(function() {
                $(this).prop("checked", checked);
            });
        });
    };
    TicketSearch.prototype.getGeneratorHtml = function() {
        var html = '';
        var list = {'all':'Show All', manual:'Manual', customer:'Customer', auto: 'Auto', factory:'Factory'};
        var generator = _self.parent.searchInfo.generator;

        html += '<div style="padding: 20px 20px" id="tisearch_generator_container">';
        html += '<table  width="100%" style="color: inherit;"><tr><td><div>';
        html += '<select class="input_style" id="tisearch_generator">';
        for (var key in list) {
            var selected = (generator===key)?' selected':'';
            html += '<option value="'+key+'"'+selected+'>'+list[key]+'</option>';
        }
        html += '</select>';
        html += '</div></td></tr></table>';
        html += '</div>';
        return html;
    };
    TicketSearch.prototype.getCategoryHtml = function() {
        var html = '';
        var list = app.crm.commonInfo.category;
        var category = _self.parent.searchInfo.category;

        html += '<div style="padding: 20px 20px" id="tisearch_category_container">';
        html += '<table  width="100%" style="color: inherit;"><tr><td><div>';
        html += '<select class="input_style" id="tisearch_category">';
        var selected = (category==='all')?' selected':'';
        html += '<option value="all"'+selected+'>Show All</option>';
        for (var key in list) {
            var selected = (category===key)?' selected':'';
            html += '<option value="'+key+'"'+selected+'>'+list[key]+'</option>';
        }
        html += '</select>';
        html += '</div></td></tr></table>';
        html += '</div>';
        return html;
    };
	TicketSearch.prototype.getPurposeHtml = function() {
        var html = '';
        var list = app.crm.commonInfo.purpose;
        var purpose = _self.parent.searchInfo.purpose;

        html += '<div style="padding: 20px 20px" id="tisearch_purpose_container">';
        html += '<table  width="100%" style="color: inherit;"><tr><td><div>';
        html += '<select class="input_style" id="tisearch_purpose">';
        var selected = (purpose==='all')?' selected':'';
        html += '<option value="all"'+selected+'>全部</option>';
        for (var key in list) {
            var selected = (purpose===key)?' selected':'';
            html += '<option value="'+key+'"'+selected+'>'+list[key]+'</option>';
        }
        html += '</select>';
        html += '</div></td></tr></table>';
        html += '</div>';
        return html;
    };
	
    TicketSearch.prototype.showPanel = function() {
        var html = '';
		html += '<li class="divider collapsed"  style="background-color: lightgray;" onclick="app.utils.showHide(this, \'tisearch_purpose_container\')">栏目:</li>';
		html += _self.getPurposeHtml();
		
        html += '<li class="divider collapsed" style="background-color: lightgray;" onclick="app.utils.showHide(this, \'tisearch_filter\')">Filters:</li>';
        html += _self.getFilterHtml();

        html += '<li class="divider collapsed"  style="background-color: lightgray;" onclick="app.utils.showHide(this, \'tisearch_status\')">Status:</li>';
        html += _self.getStatusHtml();

        html += '<li class="divider collapsed"  style="background-color: lightgray;" onclick="app.utils.showHide(this, \'tisearch_generator_container\')">Generator:</li>';
        html += _self.getGeneratorHtml();

        html += '<li class="divider collapsed"  style="background-color: lightgray;" onclick="app.utils.showHide(this, \'tisearch_category_container\')">Category:</li>';
        html += _self.getCategoryHtml();
		
		

        $('#tisearch_list').html(html);
        _self.initialStatusState();
    };
    TicketSearch.prototype.addPerson = function() {
        var persons = $("#tisearch_writer_id").val();
        require('selectPerson').show(persons.split(','), function(persons) {
            $("#tisearch_writer_id").val(persons)
        });
    };
    TicketSearch.prototype.setSearchInfo = function() {
        var searchInfo = _self.parent.searchInfo;
        var status = [];
        $('input[type="checkbox"][name="tksearch_status"]:checked').each(function() {
            status.push($(this).val());
        });
        searchInfo.status = status;
        var val = $('#tisearch_writer_id').val().trim();
        searchInfo.writer_id = val?val.split(','):null;
        val = $('#tisearch_ticket_ids').val().trim();
        searchInfo.ticket_ids = val?val.split(','):null;
        searchInfo.un_read_myself = $('#tisearch_un_read_myself').prop("checked");
        searchInfo.generator = $('#tisearch_generator').val();
        searchInfo.category = $('#tisearch_category').val();
	searchInfo.purpose = $('#tisearch_purpose').val();	
        $.ui.goBack();
        app.ticket.updateTicketList();
    };

    return new TicketSearch();
});
