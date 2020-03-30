/**
 *   jQuery  mobile.date.js
 *   Copyright (c)  ZhangYu
 */
(function($){
	var d = function(element,option) {
		this._element = null;
		this._content = null;
		this.options = null;
		this.init(element,option);
	};
	d.Default = {
		html:'<p class="Ltab">'+
			 ' <span class="LitemTab Lselect"><select class="LlistSelect"  name="_y"></select><span class="LselectedSelect _yeartitle">年</span></span>'+
			 ' <span class="LitemTab Lselect"><select class="LlistSelect"  name="_m"></select><span class="LselectedSelect _monthtitle">月</span></span>'+
			 ' <span class="LitemTab Lselect"> <select class="LlistSelect"  name="_d"></select><span class="LselectedSelect _datetitle">日</span></span>'+
			 '</p>',
		isCanNull:false,
		isHiddenDay:false,	 
		yearSection:'1900-2015',
		isDisabled:false,
		selectDate:null,
		onChange:null  	
	};
	d.prototype = {
		init:function(element,option) {	
			 this.options = $.extend({},d.Default, option);
			 this.initContent(element);
			 this.initEvent();
		},
		initContent:function(element) {
			this._element = $(element);
			this._content = $(this.options.html);//.appendTo(this._element);
			// 填充内容
			var arr = this.options.yearSection.split('-');
			if(this.options.isCanNull) {
				this._content.find('[name="_y"]').append("<option value='00'></option>");
				this._content.find('[name="_m"]').append("<option value='00'></option>");
				this._content.find('[name="_d"]').append("<option value='00'></option>");
			}
			// 年	
			for(var i = arr[1];i>=arr[0];i--) {
				this._content.find('[name="_y"]').append("<option value='"+i+"'>"+i+"年</option>");
			}
			
			// 月
			for(var j = 1;j<=12;j++) {
				if(j<10) {
					this._content.find('[name="_m"]').append("<option value='0"+j+"'>"+j+"月</option>");	
				}else
				{
					this._content.find('[name="_m"]').append("<option value='"+j+"'>"+j+"月</option>");	
				}	
			}
			// 日
			for(var k = 1;k<=31;k++) {
				if(k<10){
					this._content.find('[name="_d"]').append("<option value='0"+k+"'>"+k+"日</option>");
				}else {
					this._content.find('[name="_d"]').append("<option value='"+k+"'>"+k+"日</option>");
				}
			}
			if(this.options.isHiddenDay) {
				// 隐藏天
				this._content.find('[name="_d"]').hide();
				this._content.find('._datetitle').hide();
			}
				
			this._content.appendTo(this._element);
			if(this.options.selectDate!=null) {
				// 年月日
				var time = this.options.selectDate.split('-');
				this._content.find('[name="_y"]').val(time[0]);
				this._content.find('[name="_m"]').val(time[1]);
				this._content.find('[name="_d"]').val(time[2]);	
				this._content.find('._yeartitle').html(this._content.find('[name="_y"]').find('option[value="'+time[0]+'"]').text());
				this._content.find('._monthtitle').html(this._content.find('[name="_m"]').find('option[value="'+time[1]+'"]').text());
				this._content.find('._datetitle').html(this._content.find('[name="_d"]').find('option[value="'+time[2]+'"]').text());		    		
		    }
			this.setDisabled(this.options.isDisabled);		
		},
		initEvent:function() {
			var _self = this;
			if(_self.options.onChange!=null) {
				// 选中事件
				var a = function() {
					var year = _self._content.find('[name="_y"]').find('option:selected').text(),
						month = _self._content.find('[name="_m"]').find('option:selected').text(),
						day = _self._content.find('[name="_d"]').find('option:selected').text();
					_self._content.find('._yeartitle').html(year==''?'年':year);
					_self._content.find('._monthtitle').html(month==''?'月':month);
					_self._content.find('._datetitle').html(day==''?'日':day);
					if(_self.options.isHiddenDay) {
						return _self._content.find('[name="_y"]').val()+'-'+_self._content.find('[name="_m"]').val();	
					}
					return _self._content.find('[name="_y"]').val()+'-'+_self._content.find('[name="_m"]').val()+'-'+_self._content.find('[name="_d"]').val();
				}
				this._content.find('[name="_y"]').change(function(){
					_self.options.onChange(a());
				});
				this._content.find('[name="_m"]').change(function(){
					_self.options.onChange(a());
				});
				this._content.find('[name="_d"]').change(function(){
					_self.options.onChange(a());
				});					
			}
		}, 
		setDisabled:function(b) { //禁用控件
			if(b) {
				this._content.find('[name="_y"]').attr('disabled','disabled')
				.end().find('[name="_m"]').attr('disabled','disabled')
				.end().find('[name="_d"]').attr('disabled','disabled')
				.end().find('._yeartitle').html('年')
				.end().find('._monthtitle').html('月')
				.end().find('._datetitle').html('日');	
			}else {
				this._content.find('[name="_y"]').removeAttr('disabled')
				.end().find('[name="_m"]').removeAttr('disabled')
				.end().find('[name="_d"]').removeAttr('disabled');
			}
			
		}
	};
	
   var  o= $.fn.date;
   $.fn.date = function (option) {
     return this.each(function () {
       var $this   = $(this);
       var data    = $this.data('hb.date');
       var options = typeof option == 'object' && option;
       if (!data) {
 		  $this.data('hb.date', (data = new d(this, options)));
 	   }
       if (typeof option == 'string') {
 		  data[option]();
 	   }
     });
   };
   
   $.fn.setDateDisabled = function(b) {
	   var d = $(this).data('hb.date');
	   if(d) {
		   d.setDisabled(b);
	   }
   }
   $.fn.date.Constructor = d;
   $.fn.date.noConflict = function () {
     $.fn.date = o;
     return this;
   };      	
	
})(jQuery);