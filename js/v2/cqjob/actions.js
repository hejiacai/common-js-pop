// JavaScript Document
define('cqjob.actions', function(require, exports, module){
	
	var $ = module['jquery'];
	
	$.focusblur = function(focusid){
		var focusblurId = $(focusid);
		var defval = focusblurId.val();
		focusblurId.focus(function(){
			var thisval = $(this).val();
			//$(this).addClass('focus').removeClass('textGray');
			$(this).siblings('label.txtLabel').css({'display':'none'});
			$(this).addClass('focus');
			/*
			if(thisval==defval){
				$(this).val("");
			}*/
		});
		focusblurId.blur(function(){
			var thisval = $(this).val();
			if(thisval==""){
			/*  $(this).val(defval);*/
				//$(this).addClass('textGray');
				$(this).siblings('label.txtLabel').css({'display':'block'});
			}
			$(this).removeClass('focus');
		});
	};
	$.focusColor = function(focusid, focusFn, blurFn){
		var focusElemId = $(focusid);
		focusElemId.focus(function(){
			$(this).addClass('focus');
			focusFn && focusFn.call(this);
		}).blur(function(){
			$(this).removeClass('focus');
			blurFn && blurFn.call(this);
		});
	};
	$.setIndex = function(className){
		var zIndex = 1000;
		$('.'+className).each(function() {
			$(this).css('z-index',zIndex--);
		});
	};
	$.tab = function(tId,cId){
		$(tId).find('li').click(function(){
			if($(this).hasClass('cu')){
				return false;//do something
			} else {
				var thisIndex = $(this).index();
				$(this).addClass('cu').siblings('li').removeClass('cu');
				$(cId).find('.tabCon').eq(thisIndex).css({'display':'block'}).siblings('.tabCon').css({'display':'none'});
			}
		});
	}
	//调用$.tab('#tabT','#tabC');
	//给文本框加水印
	$.fn.watermark = function(txt)
	{
		if(typeof this.attr('watermark') != 'undefined'){
			txt = this.attr('watermark');
		}	
		var getVal = function(el){
			if (el.length == 0) return '';
			if (el[0].type.toLowerCase() == 'a' || el[0].type.toLowerCase() == 'span'){
				return el.html();
			} else {
				return el.val();
			}
		};
	
		this.attr('watermark', txt);
		if (getVal(this) == ''){
			this.val(txt);
			this.addClass('textGray');
		}
		this.focus(function(){
			var el = $(this);
			if (getVal(el) == el.attr('watermark'))
			{
				el.removeClass('textGray');
				el.val('');
			}
		});
		this.blur(function(){
			refreshStatus();
		});
		var self = this;
		var refreshStatus = function(){
			var el = self; //$(this);
			var val = getVal(el);
			var watermark = el.attr('watermark');
			if (val == '' || val == watermark)
			{
				el.val(watermark);
				el.addClass('textGray');
			} else
			{
				el.removeClass('textGray');
			}
		};
		refreshStatus();
	};
	//用于在form提交前清空水印
	$.fn.clearWatermark = function()
	{
		var inputs=$(this).find('input[watermark]');
		for(var i=inputs.length-1;i>=0;i--)
		{
			
			var el = $(inputs[i]);
			if (el.val() == el.attr('watermark'))
			{
				el.val('');
			}    
		}
	};
	//给文本框加水印  方法2
	$.fn.watermark2 = function(txt){
		var getVal = function(el){
				if (el.length == 0) return '';
				if (el[0].type.toLowerCase() == 'a' || el[0].type.toLowerCase() == 'span'){
					return el.html();
				} else {
					return el.val();
				}
			},
			txtLabel = "txtLabel",
			createLabel = function(id, txt){
				return '<label class="' + txtLabel + '" for="'+ id +'" style="display: none;">'+txt+'</label>';
			}, 
			status = 'focus',
			attr = 'watermark',
			label, txt;
	
		return $(this).each(function(){
			var _this = $(this);
			if(txt = _this.attr(attr)){
				var label = _this.parent().find('.' + txtLabel);
				if(!label.length){
					label = $(createLabel(_this.attr('id'), txt)).prependTo(_this.parent());
				}
				if(getVal(_this) === ''){
					_this.removeClass(status);
					label.css('display', 'block');
				} else {
					label.css('display','none');
				}
				_this.on('focus blur', function(e){
					var _this = $(this),
						val = getVal(_this);
	
					if(e.type === status){
						_this.addClass(status);
						label.css('display','none');
					} else {
						_this.removeClass(status);
						if (val){
							label.css('display','none');
						} else {
							label.css('display','block');
						}
					}
				});
			}
		});
	};
	 /*
	 * 计算文本长度
	 */
	(function($){
		var Listener = function(el, opt)
		{
			//默认值
			var _default = {
				max: 4000,
				objTotal: $(el).closest('div').next().find('.content'),
				objLeft: $(el).next('.textareaTxt').find('i'),
				duration: 200,
				objTotalStyle: 'green',
				flag:false
			};
			//初始化参数
			var options = $.extend({}, _default, opt);
			var start = function(){
				//统计函数
				var _length, _oldLen, _lastRn;
				_oldLen = _length = 0;
				this.time = setInterval(function()
				{
					_length = el.val().length;
					if (el == null || typeof el == "undefined")
					{   
						this.time = null;
						return;
					}
					if(!options.flag)
					{
						if (_length == _oldLen)     //防止计时器做无用的计算
						{   
							return;
						}
					}
					if (_length > options.max)
					{
						//避免ie最后两个字符为"\r\n",导致崩溃
						_lastRN = (el.val().substr(options.max - 1, 2) == "\r\n");
						el.val(el.val().substr(0, (_lastRN ? options.max - 1 : options.max)));
					}
					_oldLen = _length = el.val().length;
					//显示已输入字符
					if (options.objTotal.length>0)
					{
						options.objTotal.html(_length).addClass(options.objTotalStyle);
					};
					//显示剩余的输入字符
					if (options.objLeft.length>0)
					{
						options.objLeft.html((options.max - _length) < 0 ? 0 : (options.max - _length)).addClass(options.objTotalStyle);
					}
				}, options.duration);
			};
	
			var stop = function()
			{
				this.time = null;
			};
			if (options.objLeft != null)
			{
				try
				{
					var defaultLength = options.max - $(el).val().length;
					options.objLeft.html(defaultLength).addClass(options.objTotalStyle);
				}
				catch (e) { }
			};
			el.bind('focus', start);
			el.bind('blur', stop);
		};
		$.fn.setListen = function(opt)
		{
			var l = new Listener(this, opt || {});
			this.data('listener', l);
		};
	})($);
	
	//给当前复先框绑定选中事件
	$.fn.bindCheckBox = function(chk,containerName,isNumStat)
	{
		// 2011-04-29  zhangyu
		// 替换为checkBox click绑定匿名函数
		var con=$(containerName);
		$(this).click(function()
		{
			var _self=$(this);
			var checked = _self.attr('checked');
			var inputCheckBoxs=!containerName?$('input:not(:disabled)[type=checkbox][name="' + chk + '"]'):con.find('input:not(:disabled)[type=checkbox][name="' + chk + '"]');
			if(!checked) {
				inputCheckBoxs.removeAttr('checked');
			}else {
				inputCheckBoxs.attr("checked",checked);	
			}
			if(isNumStat){
				var checked_num = !containerName?$('input:not(:disabled)[type=checkbox][name="' + chk + '"]:checked').lenght:con.find('input:not(:disabled)[type=checkbox][name="' + chk + '"]:checked').length;
				$('#emNum').html('已选择'+checked_num+'个职位');
			}
		});
			var c = {
			checkbox: this,
			selector: chk,
			check: function()
			{
				var _self= c;
				var checked = 0, unchecked = 0;
				var checkBoxs=!containerName?$('input[type="checkbox"][name="' + _self.selector + '"]'):con.find('input[type="checkbox"][name="' + _self.selector + '"]');
				for(var i=checkBoxs.length-1;i>=0;i--)
				{
				var el=$(checkBoxs[i]);
				if (el.attr('checked'))
				{
					checked++;
				} else if (el.attr('disabled') != true)
				{
					unchecked++;
				}
				}
				var allCheck = checked > 0 && unchecked == 0;
				_self.checkbox.attr('checked', allCheck);
				if(isNumStat){
					$('#emNum').html('已选择'+checked+'个职位');
				}
			}
		};
		this.data('checkBoxName', c);
		(!containerName?$('input[type="checkbox"][name="' + chk + '"]'):con.find('input[type="checkbox"][name="' + chk + '"]')).live('click', c.check);
	};
	
	$.fn.extend({
		mouseOverHide: function(element,parendID) {
			$(this).mouseover(function(){
				element.show();
			}).mouseout(function(e){
				var target = $(e.relatedTarget);
				if(target.closest('#'+parendID).length<=0) {
					element.hide();
				}
			});
			$('#'+parendID).mouseout(function(e){
				var target = $(e.relatedTarget);
				if(target.closest('#'+parendID).length<=0) {
					element.hide();
				}	    	
				
			});
		}
	});
	$.extend({
		//过滤字符串中的html文本
		filterHTML: function(str)
		{
			if (str == 'undefined' || str == null || str == '' || str.constructor != String)
			{
				return '';
			}
			return str.replace(/<.*?>/g, function(match) { return match.replace('<', '').replace('>', ''); });
		},
		concealElement:function(element,curID,parentID) {
		   $('body').click(function(e){
				// 检测发生在body中的点击事件
				var cID = curID,
					pID = parentID,
					cell = $(e.target);
				if (!cell)return;
				var tgID = $(cell).attr('id') == '' ? "string" : $(cell).attr('id');
				var isTagert = true;
				 // 如果事件触发元素不是Input元素 并且不是发生在时间控件区域
				 if(cID&&cID!=''&&cID!=null) {
					 isTagert = (isTagert&&tgID!=cID&&$(cell).closest('#' + cID).length <= 0);
				 }
				 if(pID&&pID!=''&&pID!=null) {
					 isTagert = isTagert && tgID!=pID && $(cell).closest('#' + pID).length <= 0;
				 }
				if (isTagert){
					//element.hide();
				}
			});
		}
	});
	
	return $;
});