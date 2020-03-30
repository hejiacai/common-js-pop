/**
 *   jQuery  dropdown.js
 *   Copyright (c)  ZhangYu
 */
(function($){
	var dropdown = function(element,option) {
		this._element = null;
		this._content = null;
		this.options = null;
		this.bg = null;
		this.init(element,option);
	};
	dropdown.Default = {
		html:'<p class="Ltab">'+ 
			 '<span class="LitemTab Lselect">'+
		     '     <select class="LlistSelect _itemcontainer">'+
		     '     </select>'+
	         '     <span class="LselectedSelect _title"></span>'+
             '</span>'+
			 '</p>',
		name:'radName',	
		selectValue:null,
		title: '请选择',
		items:[],	
		onSelect:null	
	};
	dropdown.prototype = {
		init:function(element,option) {	
			 this.options = $.extend({},dropdown.Default, option);
			 this._element = $(element);
			 this.initContent();
			 this.initEvent();
		},
		initContent:function() { // 初始化内容
			var options = this.options;	
			this._content = $(options.html);			
			var _self = this;
			if(options.title!=null) {
				this._content.find('._title').html(options.title);
			}
			if(options.items.length>0) {
				// 绑定数据项			
			   $.each(options.items,function(i,n){
					var item = $('<option>></option>').val(n.value).text(n.name);;
					if(options.selectValue==n.value) {
						// 是否需要选中值
						item.attr('selected','selected');
						_self._content.find('._title').html(n.name);
				    }
					item.appendTo(_self._content.find('._itemcontainer'));
					
			   });				
			}
			this._element.append(this._content);
		},
		initEvent:function() {
			// 数据选择事件
			var self = this;
			this._content.find('._itemcontainer').change(function(){	
				 var name  = $(this).find('option:selected').text(),
				 	 value = $(this).find('option:selected').val();
				 if(name =='') {
					 self._content.find('._title').html(self.options.title);
				 }else {
					self._content.find('._title').html(name);
				 }	 
				 
				 if(self.options.onSelect!=null) {
					 self.options.onSelect(value,name);
				 }
				 					
			});
		}
	};
   var  o= $.fn.dropdown;
   $.fn.dropdown = function (option) {
     return this.each(function () {
       var $this   = $(this);
       var data    = $this.data('hb.dropdown');
       var options = typeof option == 'object' && option;
       if (!data) {
 		  $this.data('hb.dropdown', (data = new dropdown(this, options)));
 	   }
       if (typeof option == 'string') {
 		  data[option]();
 	   }
     });
   };
   $.fn.dropdown.Constructor = dropdown;
   $.fn.dropdown.noConflict = function () {
     $.fn.dropdown = o;
     return this;
   };      	
	
})(jQuery);