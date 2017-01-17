define(function(require) {
	"use strict";
	var _self;
	function PersonalInfo() {
		_self = this;
		_self.id = "personalInfo";
	}
	PersonalInfo.prototype.show = function() {
        if (app.chatLogin) {
            app.utils.loadPanel(_self.id, {footer: "none", transition: "up", loadfunc: _self.id + "=onLoad"});
        } else {
            app.utils.toast("你没有登陆聊天服务器");
        }
	};
	PersonalInfo.prototype.onLoad = function() {
        var login = app.login;
        $('#psi_username').val(login.info.username);
        $('#psi_userid').val(login.userid);
        $('#psi_userphone').val(login.info.phone);
        $('#psi_sign').val(login.info.sign);
        app.login.user_head_db.findOne({userid:login.userid}, function (err, doc) {
            if (doc) {
                $('#psi_head').attr("src", doc.head);
            } else {
                $('#psi_head').attr("src", app.resource.img_default_head);
            }
        });
	};
    PersonalInfo.prototype.showActionSheet = function() {
        if (_os == 'desktop' || _from == 'web') {
            app.utils.toast("请手机APP上修改头像");
            return;
        }
        var list = [{
            text: '照相',
            cssClasses: '',
            handler: function () {
                $.ui.actionsheetShow = false;
                _self.setHeadByCamera();
            }
        }, {
            text: '手机图片',
            cssClasses: '',
            handler: function () {
                $.ui.actionsheetShow = false;
                _self.setHeadByPhotoLibrary();
            }
        }];
        if (_os == "ios") {
            list.push({
                text: '手机相册',
                cssClasses: '',
                handler: function () {
                    $.ui.actionsheetShow = false;
                    _self.setHeadBySavedPhotoalbum();
                }
            });
        }
        app.utils.actionsheet = $("#afui").actionsheet(list);
    };
    PersonalInfo.prototype.setHeadPicture = function(imageData) {
        $('#psi_head').attr("src", "data:image/jpeg;base64," + imageData);
        app.utils.setWaitProgress("正在上传头像");
        setTimeout(function() {
            _self.head = $.getImageData("psi_head", 100,100);
            app.userMgr.updateHead(_self.head);
            $.upsertStyleSheet(app.userHeadCss, '.user_head_'+app.login.userid, 'background-image:url('+_self.head+')')
        }, 500);
    };
    PersonalInfo.prototype.onUpdateHead = function() {
        app.login.user_head_db.upsert({userid:app.login.userid}, {head:_self.head}, function(){
            app.utils.toast('更新头像成功');
            app.utils.clearWaitProgress();
        });
    };
    PersonalInfo.prototype.setHeadByCamera = function() {
        navigator.camera.getPicture(function (imageData) {
            _self.setHeadPicture(imageData);
        }, function () {
            console.log('camera cancelled');
        }, {
            quality: 50,
            allowEdit: true,
            targetWidth: 320,
            targetHeight: 320,
            correctOrientation: true,
            sourceType: Camera.PictureSourceType.CAMERA,
            cameraDirection: Camera.Direction.FRONT,
            destinationType: Camera.DestinationType.DATA_URL
        });
    };
    PersonalInfo.prototype.setHeadByPhotoLibrary = function() {
        navigator.camera.getPicture(function (imageData) {
            _self.setHeadPicture(imageData);
        }, function () {
            console.log('camera cancelled');
        }, {
            quality: 50,
            allowEdit: true,
            targetWidth: 320,
            targetHeight: 320,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.DATA_URL
        });
    };
    PersonalInfo.prototype.setHeadBySavedPhotoalbum = function() {
        navigator.camera.getPicture(function (imageData) {
            _self.setHeadPicture(imageData);
        }, function () {
            console.log('camera cancelled');
        }, {
            quality: 50,
            allowEdit: true,
            targetWidth: 320,
            targetHeight: 320,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            destinationType: Camera.DestinationType.DATA_URL
        });
    };
	PersonalInfo.prototype.doUpdateUserInfo = function() {
        var username = $("#psi_username").val();
        var phone = $("#psi_userphone").val();
        var sign = $("#psi_sign").val();

        if (phone && !(/^1[\d]{10}$/.test(phone))) {
            app.utils.toast("电话号码格式不对");
            return;
        }
        _self.username = username;
        _self.phone = phone;
        _self.sign = sign;
        app.userMgr.updateUserInfo(username, phone, sign);
    };
    PersonalInfo.prototype.onUpdateUserInfo = function(obj) {
        var info = app.login.info;
        app.utils.toast('更新成功');
        info.username = _self.username;
        info.phone = _self.phone;
        info.sign = _self.sign;
        _self.username = null;
        _self.phone = null;
        _self.sign = null;
    };
	return new PersonalInfo();
});