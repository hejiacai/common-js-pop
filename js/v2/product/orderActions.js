// JavaScript Document

define('product.orderActions', 'widge.overlay.hbDialog, widge.overlay.confirmBox', 
function(require, exports, module) {
	
	var jquery 	   = module['jquery'],
		util       = require('base.util'),
		Dialog     = module['widge.overlay.hbDialog'],
		confirmBox = module['widge.overlay.confirmBox'],
		pWidth     = 70,
		fontWidth  = 18,
		isSubmit   = true;
	
	var dialog = exports.dialog = exports.dialog || new Dialog({
			close : 'x',
			idName : 'order_dialog',
			width : 370,
			isOverflow : false,
			isAjax : true,
			zIndex: 99999
		});
	
	dialog.after('hide', function() {
		isSubmit = true;
		dialog.query('.submit').off('click');
		dialog.query('.cancel').off('click');
		//dialog.off('closeX');
	});

	
	exports.setSubmit = function(f, target) {
		isSubmit = f != undefined ? f : isSubmit;
		if(f){
			target && target.text('确定').css('background-color', '#66bce4');
		} else {
			target && target.text('提交中...').css('background-color', '#999');
		}
		return isSubmit;
	}
	exports.show = function(params) {
		if (params == undefined)
			return;
		if (params.data) {
			var data = params.data;
			var content = '<div style="padding:20px 15px 0 15px">';
			if(data.items.orders){
				for (var i = 0; i < data.items.orders.length; i++) {
					content += '<p style="padding-bottom:8px;">'
						+ '<span style="display:inline-block;width:170px">'+ data.items.orders[i].title + '</span>'
						+ '<span style="display:inline-block;width:50px;text-align:center">' + data.items.orders[i].day + '</span>'
						+ '<span style="display:inline-block;width:120px;text-align:right">应付：' + data.items.orders[i].consume + '</span>'
						+ '</p>';
				}
			}

            content += '</div><p style="text-align:right;border-top:1px solid #f4f4f4;padding:10px;margin:10px 5px 20px 10px;font-size:12px;color:#444;font-weight:bold">推广金扣除：';

            var spread_lack = false;
            if (data.items.params.consume <= data.items.params.spread_overage) {
                content += data.items.params.consume;
            } else {
                content += data.items.params.spread_overage;
                data.items.params.consume -= data.items.params.spread_overage;
                data.items.params.consume = data.items.params.consume.toFixed(2);
                spread_lack = true;
            }

            var account_lack = false;
            if (spread_lack) {
                if (data.items.params.consume <= data.items.params.account_overage) {
                    content += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;余额扣除：' + data.items.params.consume;
                } else {
                    content += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;余额扣除：' + data.items.params.account_overage;
                    content += '<br /><span style="color:#d73937;display:inline-block;margin-top:5px">还需充值：' + Math.ceil(data.items.params.consume - data.items.params.account_overage) + '</span>';
                    account_lack = true;
                }
            }

            content += '</p>';
            content += '<div class="dialogFooter set-top-foot" style="border-top:0px;background:#f3f3f3;padding:7px">'
                    + (account_lack ? '<span style="float:left;margin-top:5px;color:#666;font-size:12px">当前余额不足，请<a href="//company.huibo.com/pay" style="color:#66bce4;text-decoration: underline;">充值</a>后再设置</span>' : '')
                    + (account_lack ? '<a class="btn1 btnsF12" href="javascript:void(0);" style="background:#999;border:0px;box-shadow:none">确定</a>'
                    	: '<a class="btn1 btnsF12 submit" href="javascript:void(0);" style="background:#66bce4;border:0px;box-shadow:none">确定</a>')
                    + '<a class="btn3 btnsF12 cancel" href="javascript:void(0);" style="background:#fff;border:0px;box-shadow:none">取消</a>'
                    + '</div>';
			
			dialog.setContent({
                'title' : '订单确认',
                'content' : content
            }).show();
			
			dialog.query('.submit').on('click', function(e) {
				params.submit && params.submit.call(dialog, e);
			});

			dialog.query('.cancel').on('click', function(e) {
				if (params.cancel) {
					params.cancel && params.cancel.call(dialog, e);
				}
				params.hide && params.hide.call(dialog);
				dialog.hide();
			});

			dialog.on('closeX', function() {
				params.hide && params.hide.call(dialog);
			});
			return;
		}

		if (params.url) {
			$.post(params.url, {
                data : params.orders || [],
                job_id : params.jobid || null
			}, function (e) {
				if (e.status) {
					var content = '<div style="padding:20px 15px 0 15px">';
					for (var i = 0; i < e.items.orders.length; i++) {
						content += '<p style="padding-bottom:8px;">'
                            + '<span style="display:inline-block;width:170px">'+ e.items.orders[i].title + '</span>'
                            + '<span style="display:inline-block;width:50px">' + e.items.orders[i].day + '</span>'
                            + '<span style="display:inline-block;width:120px;text-align:right">应付：' + e.items.orders[i].consume + '</span>'
                            + '</p>';
					}

                    content += '</div><p style="text-align:right;border-top:1px solid #f4f4f4;padding:10px;margin:10px 5px 20px 10px;font-size:12px;color:#444;font-weight:bold">推广金扣除：';

                    var spread_lack = false;
                    if (e.items.params.consume <= e.items.params.spread_overage) {
                        content += e.items.params.consume;
                    } else {
                        content += e.items.params.spread_overage;
                        e.items.params.consume -= e.items.params.spread_overage;
                        e.items.params.consume = e.items.params.consume.toFixed(2);
                        spread_lack = true;
                    }

                    var account_lack = false;
                    if (spread_lack) {
                        if (e.items.params.consume <= e.items.params.account_overage) {
                            content += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;余额扣除：' + e.items.params.consume;
                        } else {
                            content += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;余额扣除：' + e.items.params.account_overage;
                            content += '<br /><span style="color:#d73937;display:inline-block;margin-top:5px">还需充值：' + Math.ceil(e.items.params.consume - e.items.params.account_overage) + '</span>';
                            account_lack = true;
                        }
                    }

                    content += '</p>';
                    content += '<div class="dialogFooter set-top-foot" style="border-top:0px;background:#f3f3f3;padding:7px">'
                            + (account_lack ? '<span style="float:left;margin-top:5px;color:#666">当前余额不足，请<a target="_blank" href="//company.huibo.com/pay/" style="color:#66bce4;text-decoration: underline;">充值</a>后再设置</span>' : '')
                            + (account_lack ? '<a class="btn1 btnsF12" href="javascript:void(0);" style="background:#999;border:0px;box-shadow:none">确定</a>'
                    			: '<a class="btn1 btnsF12 submit" href="javascript:void(0);" style="background:#66bce4;border:0px;box-shadow:none">确定</a>')
                            + '<a class="btn3 btnsF12 cancel" href="javascript:void(0);" style="background:#fff;border:0px;box-shadow:none">取消</a>'
                            + '</div>';

					dialog.setContent({
                        'title' : '订单确认',
                        'content' : content
                    }).show();

					dialog.query('.submit').on('click', function(e) {
						if(!isSubmit){
							return;
						}
						params.submit && params.submit.call(dialog, e);
					});

					dialog.query('.cancel').on('click', function(e) {
						if (params.cancel) {
							params.cancel && params.cancel.call(dialog, e);
						}
						params.hide && params.hide.call(dialog);
						dialog.hide();
					});

					dialog.on('closeX', function() {
						params.hide && params.hide.call(dialog);
					});

				} else {
					confirmBox.timeBomb(e.msg, {
						name: 'fail',
						timeout: 1000,
						width: pWidth + e.msg.length * fontWidth
					});
				}
			}, 'json');
		}
	}

	return exports;
});