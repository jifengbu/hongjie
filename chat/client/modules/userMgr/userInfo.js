module.exports = define(function(require) {
    var _self;

    function UserInfo() {
        _self = this;
    }

    UserInfo.prototype.updateUserInfo = function(args) {
        args = args.trim().split(/\s+/);
        if (args.length >= 3) {
            _self.username = args[0];
            _self.phone = args[1];
            _self.sign = args[2];
            _self.doUpdateUserInfo();
        } else {
            _self.questionUserName();
        }
    };
    UserInfo.prototype.questionUserName = function() {
        app.console.question("UserName: ", function(name) {
            name = name.trim();
            if (!name) {
                app.console.error("UserName is null");
                _self.questionUserName();
            } else {
                _self.username = name;
                _self.questionPhone();
            }
        });
    };
    UserInfo.prototype.questionPhone = function() {
        app.console.question("Phone: ", function(phone) {
            phone = phone.trim();
            if (/^1[\d]{10}/.test(phone)) {
                _self.phone = phone;
                _self.questionPhone();
            } else {
                app.console.error("phone is invalid");
                _self.questionPhone();
            }
        });
    };
    UserInfo.prototype.questionSign = function() {
        app.console.question("Sign: ", function(sign) {
            sign = sign.trim();
            if (!sign) {
                app.console.error("Sign is null");
                _self.questionSign();
            } else {
                _self.sign = sign;
                _self.doUpdateUserInfo();
            }
        });
    };
    UserInfo.prototype.updateUserHead = function(index) {
        var head = app.images.getUserHead(index);
        app.userMgr.updateHead(head);
    };
    UserInfo.prototype.doUpdateUserInfo = function() {
        var obj = {
            username: _self.username,
            phone: _self.phone,
            sign: _self.sign,
        };
        app.socket.emit('USERS_UPDATE_USERINFO_RQ', obj);
    };
    UserInfo.prototype.onUpdateUserInfo = function(obj) {
        app.console.log(obj);
    };
    return new UserInfo();
});
