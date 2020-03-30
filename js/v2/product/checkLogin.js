// JavaScript Document

define('product.checkLogin', 
	['widge.overlay.hbDialog', 'tools.cookie'], 
function(require, exports, module) {
	
	var jquery = module['jquery'],
		util = require('base.util'),
		Dialog = module['widge.overlay.hbDialog'],
		cookie = exports.cookie = module['tools.cookie'];
	
	var dialog = exports.dialog = exports.dialog || new Dialog({
			width: 518,
			close: 'x',
			initHeight: 100,
			isAjax: true,
			isClick: true
		});
	
	exports.isLogin = function(callback, className, href){
		var userName = cookie.get('userid'),
			usertype = cookie.get('usertype'),
			logined = userName > 0 && usertype == 'p';
		if (!logined && !util.type.isBoolean(callback)){
			var url = (href || '') + '/login/Index/success-' + (callback || '');
			
			if(util.type.isString(className)){
				dialog.addClass(className);
			} else {
				dialog.clearClass();
			}
			
			dialog.setContent({
				title: '登录',
				content: url
			}).resetSize(518).show().off('loadComplete').on('loadComplete', function(){
				this.oneCloseEvent('#btnLogin');
			});
		}
		return logined;
	} 
	exports.isPersonLogin = function(callback, className, href){
		var userName = cookie.get('userid'),
			usertype = cookie.get('usertype'),
			logined = userName > 0 && usertype == 'p';
		if (!logined && !util.type.isBoolean(callback)){
			var url = href ? href+ (callback || '') : '/personregister/Index/success-' + (callback || '');
			
			if(util.type.isString(className)){
				dialog.addClass(className);
			} else {
				dialog.clearClass();
			}
			
			dialog.setContent({
				content: url,
				isOverflow: true
			}).resetSize(650).show();
		}
		return logined;
	}
	
	exports.setBlurHideTrigger = function(trigger){
		dialog.setBlurHideTrigger(trigger);
	}
	
	return exports;
});