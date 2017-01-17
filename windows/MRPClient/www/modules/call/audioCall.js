define(function(require) {
	"use strict";
	var _self;
	function AudioCall() {
		_self = this;
		_self.id = "audioCall";
        _self.sessions = [];
	}
	AudioCall.prototype.show = function(userid, callid) {
        _self.userid = userid;
        var user = app.userMgr.users[userid];
        _self.username = user?user.username||userid:userid;
        if (callid != null) {
            _self.answer = true;
            _self.callid = callid;
        } else {
            _self.answer = false;
        }
        app.utils.loadPanel(_self.id, {footer:'none', header:'none', transition:"up", loadfunc:_self.id+"=onLoad",unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
	};
    AudioCall.prototype.onLoad = function() {
        var mgr = app.callMgr;
        if (_self.answer) {
            $('#audc_callin_button').show();
            $('#audc_callout_button').hide();
        } else {
            _self.callid = mgr.callOut(_self.userid, mgr.AUDIO_TYPE);
            $('#audc_callin_button').hide();
            $('#audc_callout_button').show();
        }
        app.utils.changeUserHead($('#audc_head')[0], _self.userid);
        $('#audc_username').html(app.color.USERNAME_COLOR(_self.userid, _self.username));
        mgr.updateTime(function(time, state) {
            $('#audc_call_state').html(state);
            $('#audc_call_time').html(time);
        });
    };
    AudioCall.prototype.onUnload = function() {
        _self.hangupAudioCall();
    };
    AudioCall.prototype.release = function() {
    };
    AudioCall.prototype.onSessionAnswer = function(callid) {
    };
    AudioCall.prototype.onCallOutError = function(callid) {
        console.log('onCallOutError', callid, _self.callid);
        if (_self.callid != null) {
            _self.callid = null;
            $.ui.goBack();
        }
    };
    AudioCall.prototype.answerAudioCall = function() {
        var mgr = app.callMgr;
        console.log('answerAudioCall', _self.callid);
        mgr.answerCallIn(_self.userid, mgr.AUDIO_TYPE, _self.callid);
        $('#audc_callin_button').hide();
        $('#audc_callout_button').show();
    };
    AudioCall.prototype.onCallOutAnswered = function(callid) {
        console.log('onCallOutAnswered', callid, _self.callid);
    };
    AudioCall.prototype.refuseAudioCall = function() {
        if (_self.callid != null) {
            console.log('refuseAudioCall', _self.callid);
            var mgr = app.callMgr;
            mgr.refuseCallIn(_self.userid, mgr.AUDIO_TYPE, _self.callid);
            _self.callid = null;
            $.ui.goBack();
        }
    };
    AudioCall.prototype.onCallOutRefused = function(callid) {
        if (_self.callid != null) {
            console.log('onCallOutRefused', callid, _self.callid);
            _self.callid = null;
            $.ui.goBack();
        }
    };
    AudioCall.prototype.hangupAudioCall = function() {
        if (_self.callid != null) {
            console.log('hangupAudioCall', _self.callid);
            var mgr = app.callMgr;
            mgr.callHangup(_self.userid, mgr.AUDIO_TYPE, _self.callid);
            _self.callid = null;
            $.ui.goBack();
        }
    };
    AudioCall.prototype.onPreCallHangupNotify = function(callid) {
        $('#audc_callin_button').hide();
        $('#audc_callout_button').show();
    };
    AudioCall.prototype.onCallHangupNotify = function(callid) {
        if (_self.callid != null) {
            console.log('onCallHangupNotify', callid, _self.callid);
            _self.callid = null;
            $.ui.goBack();
        }
    };

    return new AudioCall();
});
