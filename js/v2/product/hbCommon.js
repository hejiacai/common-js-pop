define('product.hbCommon', function(require, exports, module) {
	
	var $ = module['jquery'],
		doc = document,
		win = win;
	$.fn.extend({
		bgiframe:function(s){
			//因发现ie7也出现这个问题，所以不管什么浏览器都加上
			//if ($.browser.msie && /6.0/.test(navigator.userAgent))
			try
			{
				s = $.extend({ top: 'auto', left: 'auto', width: 'auto', height: 'auto', opacity: true, src: 'javascript:void(0);'
				}, s || {});
		
				var prop = function(n)
				{
					return n && n.constructor == Number ? n + 'px' : n;
				};
				var width = this.outerWidth(true);
				var height = this.outerHeight(true);
				var html = this.find('.bgiframe');
				if (html.length > 0)
				{
					html.remove();
				}
				html = '<iframe class="bgiframe" frameborder="0" tabindex="-1" src="about:blank"' + 'style="display:block;position:absolute;z-index:-1;' + (s.opacity !== false ? 'filter:Alpha(Opacity=\'0\');' : '') + 'top:' + (s.top == 'auto' ? '0px' : prop(s.top)) + ';' + 'left:' + (s.left == 'auto' ? '0px' : prop(s.left)) + ';' + 'width:' + prop(width) + ';' + 'height:' + prop(height) + ';' + ' overflow:hidden;"/>';
				this.prepend(html);
			} catch (e) { }
			return this;
		},
		textDefault: function(dclass,iclass){
			this.each(function(){
				var _this = $(this),
					_dText = _this.find(dclass || ".def-text"),
					_input = _this.find(iclass || "input[type='text']");
				_this.click(function(){
					_dText.hide();
					_input.focus();
				});
				_input.blur(function(){
					if(/^[　\s]*$/.test($(this).val())){
						_dText.show();
					}
				});
			});
		},
		backTop:function(){			
			var target = $(this);
			$(win).scroll(function(){
		        if ($(doc).scrollTop() > 120){
		            target.find('a.backTop').css({'display':'inline-block'});
		        }else{
		            target.find('a.backTop').css({'display':'none'});
		        }
		    });		    
		    target.find('a.backTop').click(function(){
		        $('html,body').animate({ scrollTop: 0 });
		    });
		},
		watermark: function(){
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
				return '<label class="' + txtLabel + '" for="'+ id +'" style="display: none;">' + txt + '</label>';
			}, 
			status = '',
			attr = 'watermark',
			label, txt;
			var self = this;
			
			function toggleLabel(el, label){
				if(getVal(el) === ''){
				   label.show();
			    } else {
				   label.hide();
			    }
			}
			
			$.fn.resetWatermark = function(){
				$(this).each(function(){
					var _this = $(this),
						label = _this.parent().find('.' + txtLabel);
					toggleLabel(_this, label);
				});
			}
			
			return $(this).each(function(){
				var _this = $(this);
				if(txt = _this.attr(attr)){
					var label = _this.parent().find('.' + txtLabel);
					if(!label.length){
						label = $(createLabel(_this.attr('id'), txt)).prependTo(_this.parent());
					}
					toggleLabel(_this, label);
					_this.on('focus blur', function(e){
						var _this = $(this);
						
						if(e.type === 'focus'){
							label.hide();
						} else {
							toggleLabel(_this, label);
						}
					});
				}
			});	
		},
		placeHolder: function(options){
			isPlaceHolder = "placeholder" in document.createElement('input');
			if(isPlaceHolder){
				$.fn.resetReplaceHolder = function(){}
				return $(this);
			}
			
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
				return '<label class="' + txtLabel + '" for="'+ id +'" style="display: none;">' + txt + '</label>';
			}, 
			status = '',
			attr = 'placeHolder',
			label,
			self = this;
			
			function toggleLabel(el, label){
				if(!$.trim(getVal(el)).length){
					label.show();
			    } else {
					label.hide();
			    }
			}
			
			$.fn.resetPlaceHolder = function(){
				$(this).each(function(){
					var _this = $(this),
						label = _this.parent().find('.' + txtLabel);
					toggleLabel(_this, label);
				});
			}
			
			return $(this).each(function(){
				var _this = $(this),
					txt = _this.attr(attr);
				if(txt = _this.attr(attr)){
					var label = _this.parent().find('.' + txtLabel);
					if(!label.length){
						label = $(createLabel(_this.attr('id'), txt)).prependTo(_this.parent());
					}
					toggleLabel(_this, label);
					if(!options || (options && !options.isLabelClick)){
						label.on('click', function(e){
							_this.trigger(options && options.eventType || 'focus');
						});
					}
					_this.on('focus blur click keyup', function(e){
						var _this = $(this);
						toggleLabel(_this, label);
						options && options[e.type] && options[e.type].call(null, _this, label, !!_this.val());
					});
				}
			});
		}
	});
	$.fn.bgIframe = $.fn.bgiframe;
	
	var zindex = 100,
		getZIndex = function() {
		return zindex++;
	};
	//照片显示插件
	$.showPhotoHD = function(node, photo, hdPhoto) {
	   var el = $(node);
	   var doc = $(document);
	   var wnd = $(window);
	   var offset = el.offset();
	   var top = 0;
	   var left = 0;
	   var fix = 2;
	   var isHd = false;
	   var toTop = function(el, con) {
		   top = offset.top - con.height() - fix - 3;
		   left = offset.left + el.width() + fix;
		   if (left + con.outerWidth() > wnd.scrollLeft() + wnd.width()) {
			   left -= left + con.outerWidth() - wnd.scrollLeft() - wnd.width();
		   }
		   return top >= wnd.scrollTop();
	   }
	
	   var toBottom = function(el, con) {
		   top = offset.top + el.height() + fix;
		   left = offset.left - con.outerWidth() - fix;
		   if (left < wnd.scrollLeft()) {
			   left += wnd.scrollLeft() - left;
		   }
		   return top + con.outerHeight() <= wnd.scrollTop() + wnd.height();
	   }
	   //定位
	   var pos = function(el, con) {
		   //如果是高清照直接定位在左边
		   if (isHd) {
			   top = offset.top;
			   //310为小图的宽度度+大图的宽度+白色的间距部分
			   left = offset.left - con.outerWidth() + 310;
		   } else {
			   if (!toTop(el, con)) toBottom(el, con);
		   }
		   con.css({ top: top, left: left, 'z-index': getZIndex() });
		   con.show();
		   el.mouseout(function() {
			   con.hide();
		   });
	   }
	
	   if (hdPhoto) {
		   var hdImg = $('img[src="' + hdPhoto + '"]');
		   if (hdImg.length > 0) {
			   isHd = true;
			   pos(el, hdImg.closest('div.floatlayer_pic'));            
			   return;
		   }
	   } else {
		   var norImg = $('img[src="' + photo + '"]');
		   if (norImg.length > 0) {
			   pos(el, norImg.closest('div.floatlayer_pic'));
			   return;
		   }
	   }
	   var src = null;
	   var width = 0;
	   var height = 0;
	   if (hdPhoto) {
		   isHd = true;
		   src = hdPhoto;
		   width = 180;
		   height = 225;
	   } else if (photo) {
		   src = photo;
		   width = 120;
		   height = 150;
	   }
	   var img = $('<div class="" style="position:absolute;top:-1000px;left:-1000px;"><img width="'+width+'" height="'+height+'" src="' + src + '"/></div>');
	   var div = $('<div style="position:absolute;overflow:hidden;" class="floatlayer_pic"></div>');
	   div.append(img);
	   div.css({ width: width + 4, height: height + 4 });
	   div.appendTo('body');
	   var failNotify = setTimeout(function() {
		   div.addClass(isHd ? 'floatlayer_error2' : 'floatlayer_error').html('照片加载失败');
	   }, 10000);
	   img.find('img').load(function() {
		   clearTimeout(failNotify);
		   $(this).closest('div').css({ left: 0, top: 0 });
		   $(this).closest('div').parent().bgIframe();
	   });
	   pos(el, div);
	   el.mouseout(function() {
		   div.hide();
	   });
	}
	
	
	return $;
});