/**
 *   jQuery  mobile.singlarea.js 单选级联地区控件
 *   Copyright (c)  ZhangYu
 */
/**
 *   jQuery  date.js
 *   Copyright (c)  ZhangYu
 */
define('mobile.mobileSinglearea', function(require, exports, module){

var $ = module['jquery'];
(function($){
	var a = function(element,option) {
		this.province= null;
		this.city = null;
		this.area = null;
		this.tradingarea = null;
		this.$element = null;
		this.options = null;
		this.init(element,option);
	};
	a.Default = {
		html:'<p class="Ltab">'+
			 ' <span class="LitemTab Lselect"><select class="LlistSelect"  name="_province"></select><span class="LselectedSelect _ptitle">省/市</span></span>'+
			 ' <span class="LitemTab Lselect"><select class="LlistSelect"  name="_city"><option value="00">地区</option></select><span class="LselectedSelect _ctitle">地区</span></span>'+
			 ' <span class="LitemTab Lselect"><select class="LlistSelect"  name="_area"><option value="00">商圈</option></select><span class="LselectedSelect _atitle">商圈</span></span>'+
			 '</p>', 
		selectArea:'0300',
		provinceUrl:'//www.huibo.com/area/getarea/callback-callback',   //省／直辖市　ｕｒｌ地址
	    areaUrl:'//www.huibo.com/area/GetTopArea/callback-callback-areaid-',// 获取当前地区及父级地区信息url地址　　
		subAreaUrl:'//www.huibo.com/area/getarea/callback-callback-areaid-',     // 获取子级地区信息Url地址
		showLevel:4,
		onSelect:null
	};
	a.prototype = {
		init:function(element,option) {	
			 this.options = $.extend({},a.Default, option);
			 this.initContent(element);
			 this.initEvent();
		},
		initContent:function(element) {
			this._element = $(element);
			this._content = $(this.options.html).appendTo(this._element);
			this.province=this._content.find('[name="_province"]').hide();
			// 市
		    this.city = this._content.find('[name="_city"]').hide();
			// 区/县
		    this.area = this._content.find('[name="_area"]').hide();
			// 加载省/直辖市
                    var provinceUrl = this.options.provinceUrl;
		    this.loadArea(provinceUrl,this.firstLoad.bind(this));			    	
			// 控制显示的级数 
			if(this.options.showLevel>=1) {
				 this.province.show();
			}
			if(this.options.showLevel>=2) {
				this.city.show();	 
			}
			if(this.options.showLevel>=3) {
				this.area.show();
			}
		},
		initEvent:function() {
			var _self = this;
			this.province.change(function(){
				 var area_id = $(this).val(),
					 area_name = $(this).find('option:selected').text();
				  if($(this).find('option:first').text()=='省/市') {
					  $(this).find('option:first').remove();
				  }	 
				  if(area_name=='不限') {
					  _self.city.empty();
					  _self.area.empty();
					  _self.tradingarea.empty();
					  return;
				  }	 	
				 _self.selectArea(area_id,area_name,1);				 
				 
			});
			this.city.change(function(){
				 var area_id = $(this).val(),
					 area_name = $(this).find('option:selected').text();
				  if(area_name=='不限') {
					   _self.area.empty();			  
					   return;
				  }	 	
				 _self.selectArea(area_id,area_name,2);		
			});
			
			this.area.change(function(){
				 var area_id = $(this).val(),
					 area_name = $(this).find('option:selected').text();
				  _self.selectArea(area_id,area_name,3); 		
			});	

		},
		loadArea:function(url,callback,object,isSetValue) {
			 $.ajax({
				 url: url,
				 type: "get",
				 dataType: "jsonp",
				 success: function(data) {
					  if(typeof callback == 'function'){
						  callback(data,object,isSetValue);
					   }
				 },
				error:function (XMLHttpRequest, textStatus, errorThrown) {
					  if(typeof callback == 'function'){
						  callback([],object,isSetValue);
					   }					
				}
			 });
		},
		selectArea:function(area_id,area_name,level,object,isSetValue) {
			var _self = this,
			    url = this.options.subAreaUrl + area_id;
			// 根据选择的地区信息 加载下级地区信息

			if(level == 1) {
				 _self._content.find('._ptitle').html(area_name);	
				 this.loadArea(url, this.updateCity.bind(this),object,isSetValue);
			}else if(level == 2) {
				 _self._content.find('._ctitle').html(area_name);
				 this.loadArea(url, this.updateArea.bind(this),object,isSetValue);
			} else {
				 _self._content.find('._atitle').html(area_name);
				  if(!isSetValue) {
					  _self.getArea();	
				  }
			}
		},
		firstLoad:function(data) {
			this.updateProvinces(data);
			// 初始化地区信息
			if(this.options.selectArea != null){
				var url = this.options.areaUrl+this.options.selectArea;
				this.loadArea(url,this.setAreaControl.bind(this));	
			}					
		},
		setAreaControl:function(data) {
			if(data&&data.length>0) {
				var self = this,
					result = data.reverse(),
				    len = result.length;
				self.province.find('option:first').remove();	
				self.province.find('option[value="'+result[0].area_id+'"]').attr('selected','selected');
				self._content.find('._ptitle').html(result[0].area_name);
				
 				if(len == 1) {
					self.selectArea(result[0].area_id,result[0].area_name,1,true);
				} else if(len > 1) {
					self.selectArea(result[0].area_id,result[0].area_name,1, result[1].area_id, true);
				}
 				if(len > 2) {
					self.isCityInit = true;
					self.selectArea(result[1].area_id,result[1].area_name,2, result[2].area_id, true);
				}				
 				if(len > 3) {
					self.selectArea(result[2].area_id,result[2].area_name,3,true);
				}					
			}			
	    },	
		getArea:function() {
			 if(this.options.onSelect!=null) { 
				 var areav = this.area.find('option:selected').val(),
				 	 areaname = this.area.find('option:selected').text(),
					 cityv = this.city.find('option:selected').val(),
					 cityname = this.city.find('option:selected').text(),
					 provincev = this.province.find('option:selected').val(),
					 provincename = this.province.find('option:selected').text();
				 if(areav!='00'&&areaname!='商圈'&&areaname!='不限') {this.options.onSelect(areav,areaname);return;}	 
				 if(areaname=='不限') {this.options.onSelect(cityv,cityname);return;}	
				 if(cityv!='00'&&cityname!='地区'&&cityname!='不限') {this.options.onSelect(cityv,cityname);return;}	 
				 if(cityname=='不限') {this.options.onSelect(provincev,provincename);return;}
				 this.options.onSelect(provincev,provincename);				
			 }				
		},			
		updateProvinces:function(data,object) {// 省/直辖市
			var self = this;
			var c =new Array();
			c.push('<option value="">省/市</option>');
			$.each(data,function(i,n){	
				c.push('<option value="'+n.area_id+'">'+n.area_name+'</option>');
			});
			self.province.empty().append(c.join(''));
		},
		updateCity:function(data,object,isSetValue) { // 更新市
			var self = this;
			var c =new Array();
			
			$.each(data,function(i,n){
				 if(object == n.area_id) {
					 c.push('<option value="'+n.area_id+'" selected="selected" >'+n.area_name+'</option>');
				 } else {
					 c.push('<option value="'+n.area_id+'" >'+n.area_name+'</option>');
				 }
			});	
			self.city.empty().append(c.join(''));
			var area_id = self.city.val(),
				area_name = self.city.find('option:selected').text();
			self._content.find('._ctitle').html(area_name);
			if(!this.isCityInit){
				self.selectArea(area_id,area_name, 2);
			}
			delete this.isCityInit;
			if(!isSetValue) {
				self.getArea();	
			}
		},
		updateArea:function(data,object,isSetValue) { // 更新区/县
			var self = this;
			var c = new Array();
			c.push('<option value="'+self.city.val()+'">不限</option>');
			$.each(data,function(i,n){
				 if(object == n.area_id) {
					 c.push('<option value="'+n.area_id+'" selected="selected" >'+n.area_name+'</option>');
				 } else {
					 c.push('<option value="'+n.area_id+'" >'+n.area_name+'</option>');
				 }
			});
			self.area.empty().append(c.join(''));
			self._content.find('._atitle').html(self.area.find('option:selected').text());
			
			if(!isSetValue) {
				self.getArea();	
			}
	    }
	};
   var  o = $.fn.area;
   $.fn.area = function (option,flag) {
       return this.each(function () {
       var $this   = $(this);
       var data    = $this.data('hb.area');
       var options = typeof option == 'object' && option;
       if (!data || flag) {
             $this.data('hb.area', (data = new a(this, options)));
 	   }
       if (typeof option == 'string') {
 		  data[option]();
 	   }
     });
   };
   $.fn.area.Constructor = a;
   $.fn.area.noConflict = function () {
     $.fn.area = o;
     return this;
   };      	
	
})($);

return $;

});