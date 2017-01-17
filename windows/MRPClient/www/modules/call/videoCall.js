define(function(require) {
    "use strict";
    var _self;
    function VideoCall() {
        _self = this;
        _self.id = "videoCall";
        _self.sessions = [];
    }
    VideoCall.prototype.show = function(userid, callid) {
        _self.userid = userid;
        _self.localLarge = true;
        var user = app.userMgr.users[userid];
        _self.username = user?user.username||userid:userid;
        if (callid != null) {
            _self.answer = true;
            _self.callid = callid;
        } else {
            _self.answer = false;
        }
        app.utils.loadPanel(_self.id, {footer:'none', header:'none', transition:"none", loadfunc:_self.id+"=onLoad",unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
    };
    VideoCall.prototype.onLoad = function() {
        var mgr = app.callMgr;
        _self.updateVideoView();
        if (_self.answer) {
            $('#vidc_callin_button').show();
            $('#vidc_callout_button').hide();
        } else {
            _self.callid = mgr.callOut(_self.userid, mgr.VIDEO_TYPE);
            $('#vidc_callin_button').hide();
            $('#vidc_callout_button').show();
        }
        app.utils.changeUserHead($('#vidc_head')[0], _self.userid);
        $('#vidc_username').html(app.color.USERNAME_COLOR(_self.userid, _self.username));
        mgr.updateTime(function(time, state) {
            $('#vidc_call_state').html(state);
            $('#vidc_call_time').html(time);
        });
    };
    VideoCall.prototype.onUnload = function() {
        _self.hangupVideoCall();
    };
    VideoCall.prototype.release = function() {
    };
    VideoCall.prototype.toggleVideoView = function() {
        _self.localLarge = !_self.localLarge;
        _self.updateVideoView();
    };
    VideoCall.prototype.updateVideoView = function() {
        var smallView = $('#vidc_small_screen')[0];
        var largeView = $('#vidc_large_screen')[0];
        var local = _self.localLarge;
        navigator.phonertc.setVideoView({
            localView: local?largeView:smallView,
            remoteView: !local?largeView:smallView
        });
    };
    VideoCall.prototype.onSessionAnswer = function(callid) {
        _self.toggleVideoView();
    };
    VideoCall.prototype.onCallOutError = function(callid) {
        console.log('onCallOutError', callid, _self.callid);
        if (_self.callid != null) {
            _self.callid = null;
            navigator.phonertc.removeLocalVideoView();
            $.ui.goBack();
        }
    };
    VideoCall.prototype.answerVideoCall = function() {
        var mgr = app.callMgr;
        console.log('answerVideoCall', _self.callid);
        mgr.answerCallIn(_self.userid, mgr.VIDEO_TYPE, _self.callid);
        $('#vidc_callin_button').hide();
        $('#vidc_callout_button').show();
    };
    VideoCall.prototype.onCallOutAnswered = function(callid) {
        console.log('onCallOutAnswered', callid, _self.callid);
    };
    VideoCall.prototype.refuseVideoCall = function() {
        if (_self.callid != null) {
            navigator.phonertc.removeLocalVideoView();
            console.log('refuseVideoCall', _self.callid);
            var mgr = app.callMgr;
            mgr.refuseCallIn(_self.userid, mgr.VIDEO_TYPE, _self.callid);
            _self.callid = null;
            $.ui.goBack();
        }
    };
    VideoCall.prototype.onCallOutRefused = function(callid) {
        if (_self.callid != null) {
            navigator.phonertc.removeLocalVideoView();
            console.log('onCallOutRefused', callid, _self.callid);
            _self.callid = null;
            $.ui.goBack();
        }
    };
    VideoCall.prototype.hangupVideoCall = function() {
        if (_self.callid != null) {
            navigator.phonertc.removeLocalVideoView();
            console.log('hangupVideoCall', _self.callid);
            var mgr = app.callMgr;
            mgr.callHangup(_self.userid, mgr.VIDEO_TYPE, _self.callid);
            _self.callid = null;
            $.ui.goBack();
        }
    };
    VideoCall.prototype.onPreCallHangupNotify = function(callid) {
        $('#vidc_callin_button').hide();
        $('#vidc_callout_button').show();
    };
    VideoCall.prototype.onCallHangupNotify = function(callid) {
        if (_self.callid != null) {
            navigator.phonertc.removeLocalVideoView();
            console.log('onCallHangupNotify', callid, _self.callid);
            _self.callid = null;
            $.ui.goBack();
        }
    };

    return new VideoCall();
});
