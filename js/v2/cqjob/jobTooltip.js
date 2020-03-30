/* ========================================================================
 * tooltip.js 
 * ======================================================================== */
define('cqjob.jobTooltip', 
function(require, exports, module) {
	var $ = module['jquery'];
	  var Tooltip = function (element, options) {
		this.type       =
		this.options    =
		this.enabled    =
		this.timeout    =
		this.hoverState =
		this.$element   = null
		this.init('tooltip', element, options);
	  }
	
	  Tooltip.DEFAULTS = {
		animation: true
	  , placement: 'top'
	  , selector: false
	  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
	  , trigger: 'hover focus'
	 // ,  trigger: 'click'
	  , title: ''
	  , delay: 0
	  , html: false
	  , container: false
	  }
	
	  Tooltip.prototype.init = function (type, element, options) {
		this.enabled  = true;
		this.type     = type;
		this.$element = $(element);
		this.options  = this.getOptions(options);
	
		var triggers = this.options.trigger.split(' ');
	
		for (var i = triggers.length; i--;) {
		  var trigger = triggers[i]
	
		  if (trigger == 'click') {
			this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
		  } else if (trigger != 'manual') {
			var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
			var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'
			this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
			this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
		  }
		}
		
		//获取title
		this.options.selector ?
		  (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
		  this.fixTitle();
	  };
	  
	  //获取默认参数信息	
	  Tooltip.prototype.getDefaults = function () {
		   return Tooltip.DEFAULTS;
	  };
	  Tooltip.prototype.getOptions = function (options) {
		options = $.extend({}, this.getDefaults(), this.$element.data(), options);
		//  对参数进行合并
		if (options.delay && typeof options.delay == 'number') {
		  options.delay = {
			show: options.delay
		  , hide: options.delay
		  }
		}
		return options
	  };
	  
	  // 开始事件
	  Tooltip.prototype.enter = function (obj) {
		var defaults = this.getDefaults();
		var options  = {};
		// 设置参数信息
		this._options && $.each(this._options, function (key, value) {
		  if (defaults[key] != value) {
			   options[key] = value;
		  }
		});
	
		var self = obj instanceof this.constructor ?
		  obj : $(obj.currentTarget)[this.type](options).data('bs.' + this.type);
		if (!self.options.delay || !self.options.delay.show) {
			// 如果输入的定时不合法
			 return self.show();
		}
		clearTimeout(this.timeout);
		
		self.hoverState = 'in'
		this.timeout = setTimeout(function () {
		  if (self.hoverState == 'in') {
			  self.show();
		  }	  
		}, self.options.delay.show);
	  }
	
	  // 离开事件
	  Tooltip.prototype.leave = function (obj) {
		var self = obj instanceof this.constructor ?
		  obj : $(obj.currentTarget)[this.type](this._options).data('bs.' + this.type);
		clearTimeout(this.timeout);
		if (!self.options.delay || !self.options.delay.hide) {
			 return self.hide()
		};
		self.hoverState = 'out'
		this.timeout    = setTimeout(function () {
		  if (self.hoverState == 'out') {
			  self.hide();
		  }
		}, self.options.delay.hide)
	  }
	
	  // 显示tooltip
	  Tooltip.prototype.show = function () {
		var e = $.Event('show.bs.'+ this.type)
		if (this.hasContent() && this.enabled) {
		  this.$element.trigger(e);
		  if (e.isDefaultPrevented())
		  { 
			 return;
		  }
		  var $tip = this.tip();
		  this.setContent();
		  if (this.options.animation) {
			   $tip.addClass('fade');
		  }
		  var placement = typeof this.options.placement == 'function' ?
			this.options.placement.call(this, $tip[0], this.$element[0]) :
			this.options.placement;
		  $tip
			.detach()
			.css({ top: 0, left: 0, display: 'block' });
		  this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
	
		  var tp;
		  var pos          = this.getPosition();
		  var actualWidth  = $tip[0].offsetWidth;
		  var actualHeight = $tip[0].offsetHeight;
	
		  switch (placement) {
			case 'bottom':
			  tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
			  break
			case 'top':
			  tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
			  break
			case 'left':
			  tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
			  break
			case 'right':
			  tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
			  break;
			case 'auto':
			  var h = $(window).height(),
				  w = $(window).width(),
				  st = $(document).scrollTop(), //获取滚动条到顶部的垂直高度      
				  sl = $(document).scrollLeft(); //获取滚动条到左边的垂直宽度 
			   // 定位到bottom	      
				if((pos.top+pos.height+actualHeight)<(h+st)&&(pos.left + pos.width / 2+actualWidth)<(w+sl)) {
				   placement = 'bottom';	
				   tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2};
			   }else if ((pos.top-st)>actualHeight&&(pos.left + pos.width / 2+actualWidth)<(w+sl)){
				   //定位到top
				   placement = 'top';
				   tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}   
			   }else if(( pos.left-sl)>actualWidth&& (pos.top + pos.height / 2 +actualHeight)<(h+st)) {
				   //定位到left
					placement = 'left';
					tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth};
			   }else {
				   //定位到right
					placement = 'right';
					tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width};
			   }  	
			   break;	
		  }
			
		  this.applyPlacement(tp, placement)
		  this.$element.trigger('shown.bs.' + this.type)
		}
	  }
	
	  Tooltip.prototype.applyPlacement = function(offset, placement) {
		var replace;
		var $tip   = this.tip();
		var width  = $tip[0].offsetWidth;
		var height = $tip[0].offsetHeight;
		$tip
		  .offset(offset)
		  .addClass(placement)
		  .addClass('in');
	
		var actualWidth  = $tip[0].offsetWidth;
		var actualHeight = $tip[0].offsetHeight;
	
		if (placement == 'top' && actualHeight != height) {
		  replace = true;
		  offset.top  = offset.top + height - actualHeight;
		}
	
		if (placement == 'bottom' || placement == 'top') {
		  var delta = 0;
		  if (offset.left < 0){
			delta  = offset.left * -2;
			offset.left = 0;
			$tip.offset(offset);
			actualWidth  = $tip[0].offsetWidth;
			actualHeight = $tip[0].offsetHeight;
		  }
		  this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
		} else {
		  this.replaceArrow(actualHeight - height, actualHeight, 'top');
		}
		if (replace) {
			 $tip.offset(offset);
		}
	  }
	
	  Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
		this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : '');
	  }
	
	  Tooltip.prototype.setContent = function () {
		var $tip  = this.tip();
		var title = this.getTitle();
		$tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
		$tip.removeClass('fade in top bottom left right')
	  }
	
	  // 隐藏 
	  Tooltip.prototype.hide = function () {
		var that = this;
		var $tip = this.tip();
		var e    = $.Event('hide.bs.' + this.type);
		this.$element.trigger(e);
		if (e.isDefaultPrevented()) {
			return
		}
		$tip.removeClass('in');
	
		function removeWithAnimation() {
		  var timeout = setTimeout(function () {
			$tip.off($.support.transition.end).detach();
		  }, 500);
	
		  $tip.one($.support.transition.end, function () {
			clearTimeout(timeout);
			$tip.detach();
		  })
		}
	
		$.support.transition && this.$tip.hasClass('fade') ?
		  removeWithAnimation() :
		  $tip.detach();
		this.$element.trigger('hidden.bs.' + this.type);
		return this;
	  }
	
	  // 修改title的默认属性
	  Tooltip.prototype.fixTitle = function () {
		var $e = this.$element;
		if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
		  $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
		}
	  }
	
	  Tooltip.prototype.hasContent = function () {
		return this.getTitle();
	  }
	
	  Tooltip.prototype.getPosition = function () {
		var el = this.$element[0]
		// getBoundingClientRect 获取页面元素的位置
		return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
		  width: el.offsetWidth
		, height: el.offsetHeight
		}, this.$element.offset())
	  }
	
	 // 获取title
	  Tooltip.prototype.getTitle = function () {
		var title;
		var $e = this.$element;
		var o  = this.options;
	
		title = $e.attr('data-original-title')
		  || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
	
		return title
	  }
	
	  // tip模板	
	  Tooltip.prototype.tip = function () {
		return this.$tip = this.$tip || $(this.options.template);
	  }
	
	  // 找到标记	
	  Tooltip.prototype.arrow =function(){
		return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow");
	  }
	
	  // 验证
	  Tooltip.prototype.validate = function () {
		if (!this.$element[0].parentNode) {
		  this.hide();
		  this.$element = null;
		  this.options  = null;
		}
	  }
	
	  Tooltip.prototype.enable = function () {
		this.enabled = true;
	  }
	
	  Tooltip.prototype.disable = function () {
		this.enabled = false;
	  }
	
	  // 切换tooltip 状态
	  Tooltip.prototype.toggleEnabled = function () {
		this.enabled = !this.enabled;
	  }
	
	  // 切换
	  Tooltip.prototype.toggle = function (e) {
		var self = e ? $(e.currentTarget)[this.type](this._options).data('bs.' + this.type) : this;
		self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
	  }
	
	   // 移除数据
	  Tooltip.prototype.destroy = function () {
		this.hide().$element.off('.' + this.type).removeData('bs.' + this.type);
	  }
	
	  // TOOLTIP PLUGIN DEFINITION tooltip 插件定义
	  // =========================
	  var old = $.fn.tooltip;
	  
	  
	  $.fn.tooltip = function (option) {
		return this.each(function () {
		  var $this   = $(this);
		  var data    = $this.data('bs.tooltip');
		  var options = typeof option == 'object' && option;
		  if (!data) {
			  $this.data('bs.tooltip', (data = new Tooltip(this, options)));
		  }
		  if (typeof option == 'string') {
			  data[option]();
		  }
		});
	  };
	  $.fn.unTooltip = function() {
		  return this.each(function () {
			  var $this = $(this);
			  var data = $this.data('bs.tooltip');
			  $this.removeData('bs.tooltip');
		  });
	  }
	  
	  $.fn.tooltip.Constructor = Tooltip;
	  // TOOLTIP NO CONFLICT [tooltip no 冲突]
	  // ===================
	
	  $.fn.tooltip.noConflict = function () {
		$.fn.tooltip = old;
		return this
	  }
	 return $;
});
