define(function(require) {
	"use strict";
	var _self;

	function PcbStandardBoardPrice() {
		_self = this;
		_self.id = "pcbStandardBoardPrice";
	}
	
	PcbStandardBoardPrice.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
	};
    PcbStandardBoardPrice.prototype.release = function() {
		app.utils.setReleasePanel(null);
    };
	PcbStandardBoardPrice.prototype.onLoad = function() {
    };
    PcbStandardBoardPrice.prototype.doTestWeixinLink = function() {
        var param = {
            msg_signature:"5e67e1412361fa0682712301d8e5a3bf77fddadd",
            timestamp:"1419421332",
            nonce:"1534340714",
            echostr:"dmL7OVNvlZ8FmbRH5mf0bkvA0MpjpmmppAun5RThUXsIbYBPXLv+ETfD0k2i/KiuBA94jUVurjz6Ax9ait7qdw=="
        };
//        var url = "http://58.251.15.147/"+"?"+ $.param(param);
        var url = "http://192.168.211.7:8080/download/weixin/"+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait("正在获取Ticket列表...");
        app.utils.ajax({
            type : "GET",
            url : url,
            dataType : 'text',
            success : _self.onSuccess
        });
    };
    PcbStandardBoardPrice.prototype.doTestWeixinSendMsg = function() {
        var param = {
            msg_signature:"f4cfb456cb4a47a903b642a1cfdb0d0d2f9514f1",
            timestamp:"1419495987",
            nonce:"1700656072"
        };
//        var url = "http://58.251.15.147/"+"?"+ $.param(param);
//        var url = "http://192.168.211.248:3000/test/"+"?"+ $.param(param);
        var url = "http://192.168.211.7:8080/download/weixin/test/"+"?"+ $.param(param);
        console.log(url);

        var data = "<xml><xml><ToUserName><![CDATA[wx9cd404c23adfeb42]]></ToUserName>            <Encrypt><![CDATA[k9sIhzQVd8jNt2T9lr1uAH7D3vcx5QwyXXqP3BCeU5mE43ZRQvdRsPHpjaIFyxpES072j085LZh5dROwMY9uPaoGZJwDB9N0kvXjTg6Y66y845TMXoHlsxGgzKwF4v33/daL7HIYBRDrMfTjVw6Hli63Z3xaKMwyKuudi6D3oIj6SMt98FnQeUqedbEBAovNPDWfzHEWImJ3gfIOQeljku2+u2mVF2pT+RBut+8fu6MbI0y9ZYqa7d8krQsOMQOsq+zi/ac4GnQya60OdpP+P14SnHSY4it3PGZbjt0BdWtnjr/Va0qi/nZNsyblhFT4lhhsxZjV6hCVgHhsn2T8RgnvsV/DW5GTHybqlJDs6t693pgGRIPmeTOOy9Cb6JhicSRUbuBoJ5DFxmmWYVu2wcOiYpjfwNyJwZjVz3WiLys=]]></Encrypt> <AgentID><![CDATA[1]]></AgentID></xml></xml>";
        app.utils.setWait("正在获取Ticket列表...");
        app.utils.ajax({
            type : "POST",
            url : url,
            data : {0:data},
            dataType : 'text',
            success : _self.onSuccess
        });
    };
    PcbStandardBoardPrice.prototype.onSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        $('#test_list').html(data);
    };
	return new PcbStandardBoardPrice();
});
