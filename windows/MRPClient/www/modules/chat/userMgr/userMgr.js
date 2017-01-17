define(function(require) {
    "use strict";
    var _self;
    function UserMgr() {
        _self = this;
        _self.reset();
    }

    UserMgr.prototype.reset = function() {
        _self.users = {};
        _self.init = false;
    };
    UserMgr.prototype.add = function(obj) {
        var users = _self.users;
        var userid = obj.userid;
        if(!users.hasOwnProperty(userid)) {
            users[userid] = obj;
            if (app.uiContact) {
                app.uiContact.showUserList();
            }
        }
    };
    UserMgr.prototype.addList = function(list) {
        var users = _self.users;
        for (var i in list) {
            var userid =list[i].userid;
            if(!users.hasOwnProperty(userid)) {
                users[userid] = list[i];
            }
        }
        if (app.uiContact) {
            app.uiContact.showUserList();
        }
        _self.init = true;

        app.crm.deGetOrginizationManageInfo();

    };
    UserMgr.prototype.getUseridByUsername = function(username) {
        var users = _self.users;
        for (var id in users) {
            var user = users[id];
            if (username == user.username) {
                return id;
            }
        }
        return null;
    };
    UserMgr.prototype.setOrganizeInfo = function(){
        var organizeId = app.OrinazationManageInfo;
        var users = _self.users;
        for (var id in users) {

            for(var org_id in organizeId){
                var user_str = organizeId[org_id].user_id_str;
                var user_arr = user_str.split(",");
                for(var k = 0;k <= user_arr.length;k++){
                   if(user_arr[k] == id){
                       _self.users[id].organization_id = org_id;
                       if(organizeId[org_id].manage_persons && organizeId[org_id].uplever_manage_person){
                           _self.users[id].manage_persion = organizeId[org_id].manage_persons + "," + organizeId[org_id].uplever_manage_person;
                       }else  if(organizeId[org_id].manage_persons){
                           _self.users[id].manage_persion = organizeId[org_id].manage_persons;
                       }else if(organizeId[org_id].uplever_manage_person){
                           _self.users[id].manage_persion = organizeId[org_id].uplever_manage_person;
                       }else{
                           _self.users[id].manage_persion = "";
                       }

                   }
                }
            }

        }
    };
    UserMgr.prototype.updateHead = function(head) {
        app.emit('USERS_UPDATE_HEAD_RQ', {head:head});
    };
    UserMgr.prototype.updateUserInfo = function(username, phone, sign) {
        app.emit('USERS_UPDATE_USERINFO_RQ', {username:username, phone:phone, sign:sign});
    };
    UserMgr.prototype.onUpdateUserInfoNotify = function(obj) {
        console.log(obj);
        var users = _self.users;
        var userid = obj.userid;
        if(users.hasOwnProperty(userid)) {
            users[userid].username = obj.username;
            users[userid].phone = obj.phone;
            users[userid].sign = obj.sign;
            app.color.updateUserName(userid, obj.username);
        }
    };
    UserMgr.prototype.getupleverusers = function(users){

        var users_list = users.split(",");
        users_list.push(app.login.userid);

        console.log(users);
        var manage_persions = _.difference(_.uniq(_.map(users_list, function(userid) {
            var user = app.userMgr.users[userid];
            console.log(user);
            return  user.manage_persion;
        })),users_list);
        console.log(manage_persions.join(","));
        return manage_persions.join(",");

//        var users_list = users.split(",");
//        users_list.push(app.login.userid);
//
//        var user_id_unique_check = "[" + users_list.join("][") + "]";
//        var result_user_str = "";
//
//        for(var j = 0;j <= users_list.length;j++){
//
//            var current_user = users_list[j];
//            var current_users = _self.users[current_user];
//            var manage_person1 = current_users.manage_persion;
//            var manage_person_arr = manage_person1.split(",")||{};
//
//            for(var k = 0;k <= manage_person_arr.length;k++){
//                if(user_id_unique_check.indexOf("[" + manage_person_arr[k] + "]") == -1 && manage_person_arr[k] > 0){
//                    if(result_user_str == ""){
//                        result_user_str =  manage_person_arr[k];
//                    }else{
//                        result_user_str +=  "," + manage_person_arr[k];
//                    }
//                    user_id_unique_check += "[" + manage_person_arr[k] + "]";
//
//                }
//            }
//        }

//        return result_user_str;


    }
    return new UserMgr();
});


