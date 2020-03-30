/**
 *   jQuery  area.js
 *   Copyright (c)  ZhangYu
 */
 
define('cqjob.areaPersonSimple', function(require, exports, module){
	
	var $ = module['jquery'],
		util = require('base.util'),
		disabledColor = {'background': '#f3f2f2'};
	
	var area = function(element,option) {
		this.isProvince =true;
		this.level = 1; 
		this.province= null;
		this.city = null;
		this.area = null;
		this.tradingarea = null;
		this.$element = null;
		this.options = null;
		this.hiddenElement = null,
		this.selectAreas = null;
		this.isGanged = true;
		this.isShowMenu = true;
		this.init(element,option);
	};
	area.Default = {
		provinceStructure:' <span class="drop addFstDrop formText"><b class="hbFntWes dropIco">&#xf0d7;</b>'+
						  ' <input type="text" class="city text textGray" value="省/直辖市" style="width:90px;" readonly />'+
						  '	<div class="dropLst">'+
						  '	<div class="dropLstCon">'+
                          '         <div class="dir">'+
                          '          	<ul>'+
                          '             </ul>'+
                          '              <div class="clear"></div>'+
                          '          </div>'+
                          '         <div class="lst">'+
                          '          	<ul>'+
                          '              </ul>'+
                          '              <div class="clear"></div>'+
                          '          </div>'+
                          '      </div>	'+					 
						  ' </div>'+
						  ' </span>',
		cityStructure:	'<span class="drop addSndDrop formText"><b class="hbFntWes dropIco">&#xf0d7;</b>'+
						'<input type="text" class="county text textGray" value="市"  style="width:90px;" readonly />'+
						'<div class="dropLst">'+
						'  <div class="dropLstCon">'+
						'	<ul>'+
						'	</ul>'+
						'	<div class="clear"></div>'+
						' </div>'+
						'</div>'+
						'</span> ',
        areaStructure:'<span class="drop addThrdDrop formText"><b class="hbFntWes dropIco">&#xf0d7;</b>'+
						'<input type="text" class="county text textGray" value="区/县"  style="width:90px;" readonly />'+
						'<div class="dropLst">'+
						'  <div class="dropLstCon">'+
						'	<ul>'+
						'	</ul>'+
						'	<div class="clear"></div>'+
						'  </div>'+
						'</div>'+
						'</span>',
        tradingareaStructure:'<span class="drop addFourDrop formText"><b class="hbFntWes dropIco">&#xf0d7;</b>'+
							'<input type="text" class="county text textGray" value="商圈/乡镇"  style="width:90px;" />'+
							'<div class="dropLst">'+
							'  <div class="dropLstCon">'+
							'	<ul>'+
							'	</ul>'+
							'	<div class="clear"></div>'+
							'  </div>'+
							'</div>'+
							'</span> ',	
        space:'<span class="tipTxt">&nbsp;</span>',																										
		hddName:'area',
		provinceName:'province',
		cityName:'city',
		areaName:'area',
		tradingareaName:'tradingarea',
		selectArea:null,
		controlClass:null,
		municipality:['0100','0200','0300','0400'],  //直辖市编号
		provinceUrl:'//www.huibo.com/area/getarea/callback-callback',   //省／直辖市　ｕｒｌ地址
	    areaUrl:'//www.huibo.com/area/GetTopArea/callback-callback-areaid-',// 获取当前地区及父级地区信息url地址　　
		subAreaUrl:'//www.huibo.com/area/getarea/callback-callback-areaid-',     // 获取子级地区信息Url地址
		showLevel:2,
		textDesc:['省/直辖市','市','区/县','商圈/乡镇'],
		disabled:[false, false, false, false],
		tipClass:'textGray',
		onSelect:null,
		onClick: null
	};
	area.prototype = {
		init:function(element,option) {	
			 this.initOptions(option);
			 this.initContent(element);
			 this.initEvent();
		},
		initOptions:function(option) {
			this.options = $.extend({},area.Default, option);
		},
		initContent:function(element) {
			this.$element = $(element);
			this.hiddenElement = $('<input type="hidden" id="'+this.options.hddName+'" name="'+this.options.hddName+'" />').appendTo(this.$element);
			// 省/直辖市
			var provinceElement = $(this.options.provinceStructure).appendTo(this.$element).hide(); 
			this.province= {id:null,span:null,div:null,pid: null,input: null,level:1,areasLen:0};
			this.province.id = this.options.provinceName;
			this.province.span = provinceElement;
			this.province.div = provinceElement.find('.dropLst');
			this.province.input = provinceElement.find('input[type="text"]');
			if(this.options.disabled[0]){
				this.province.span.css(disabledColor);
				this.province.input.css(disabledColor);
			}

			// 市
			$(this.options.space).appendTo(this.$element);
			var cityElement = $(this.options.cityStructure).appendTo(this.$element).hide();
		    this.city = {id:null,span:null,div:null,pid: null,input: null,level:2,areasLen:0};
			this.city.id = this.options.cityName;
			this.city.span = cityElement;
			this.city.div = cityElement.find('.dropLst');
			this.city.input = cityElement.find('input[type="text"]');
			if(this.options.disabled[1]){
				this.city.span.css(disabledColor);
				this.city.input.css(disabledColor);
			}
			
			// 区/县
			$(this.options.space).appendTo(this.$element);
		    this.area = {id:null,span:null,div:null,pid: null,input: null,level:3,areasLen:0};
			var areaElement = $(this.options.areaStructure).appendTo(this.$element).hide();
			this.area.id = this.options.areaName;
			this.area.span = areaElement;
			this.area.div = areaElement.find('.dropLst');
			this.area.input = areaElement.find('input[type="text"]');
			if(this.options.disabled[2]){
				this.area.span.css(disabledColor);
				this.area.input.css(disabledColor);
			}
			
			// 商圈/乡镇
			$(this.options.space).appendTo(this.$element);
		    this.tradingarea = {id:null,span:null,div:null,pid: null,input: null,level:4,areasLen:0};
			var tradingareaElement = $(this.options.tradingareaStructure).appendTo(this.$element).hide();
			this.tradingarea.id = this.options.tradingareaName;
			this.tradingarea.span = tradingareaElement;
			this.tradingarea.div = tradingareaElement.find('.dropLst');
			this.tradingarea.input = tradingareaElement.find('input[type="text"]');			
			if(this.options.disabled[3]){
				this.tradingarea.span.css(disabledColor);
				this.tradingarea.input.css(disabledColor);
			}
			
			if(this.options.controlClass!=null) {
				provinceElement.addClass(this.options.controlClass);
				cityElement.addClass(this.options.controlClass);
				areaElement.addClass(this.options.controlClass);
				tradingareaElement.addClass(this.options.controlClass);
			}
			// 加载省/直辖市
			var provinceUrl = this.options.provinceUrl;
		   // this.loadArea(provinceUrl,this.updateProvinces.bind(this));
		   this.loadArea(provinceUrl, util.bind(this.updateProvinces, this), true);
			    	
			// 初始化地区信息
			 if(this.options.selectArea != null){
				//  var url =this.options.areaUrl+this.options.selectArea;
			    //	this.loadArea(url,this.setAreaControl.bind(this));
				this.setArea(this.options.selectArea, true);
			 }
			 
			 this.selectAreas = ['0','0','0','0'];
			// 控制显示的级数 
			 if(this.options.showLevel>=1) {
				 provinceElement.show();
			 }
			 if(this.options.showLevel>=2) {
				cityElement.show();	 
			 }
			 if(this.options.showLevel>=3) {
				areaElement.show();
			 }
			 if(this.options.showLevel>=4) {
				tradingareaElement.show();	 
			 }
	    },
		setShowMenu: function(f){
			this.isShowMenu = f;
		},
		initEvent:function() {
		   var self  = this;
		   self.province.span.on('click', function(){
				self.options.onClick && self.options.onClick({level: 0});
		   });
		   self.province.input.bind('focus',function(){
			    if(self.options.disabled[0]){
					return;
				}
				self.city.div.hide();
				self.area.div.hide();
				self.tradingarea.div.hide(); 
				self.province.div.show(); 
				self.province.span.css({'box-shadow':'0 0 5px #93ddec'}); 
		   });
		   self.province.div.find('ul').click(function(e){
			   var target = $(e.target);
			   if(target.is('a')) {
				  self.level = 1;
				  self.isGanged = true;
				  var v = target.attr('v').split(','),
				  	  area_id = v[0],
					  area_name = v[1];	
				  self.province.div.hide(); 
				  self.selectArea(area_id,area_name);
				  self.province.span.css({'box-shadow':'none'}); 
				  self.city.input.focus();
				 // self.city.div.show();
				if(typeof self.options.onSelect =='function') {
					 self.options.onSelect({level: 0, name: area_name, id: area_id});
				}
				e.preventDefault();
			   }
		   });
		   
		   self.city.span.on('click', function(){
				self.options.onClick && self.options.onClick({level: 1});
		   });
		   self.city.input.bind('focus',function(){
			    if(self.options.disabled[1]) return;
				self.province.div.hide();
				self.area.div.hide();
				self.tradingarea.div.hide(); 
				self.city.span.css({'box-shadow':'0 0 5px #93ddec'}); 
				if(self.city.areasLen > 0) {
					self.city.div.show(); 	 	
				}
		   });
		   self.city.div.find('ul').click(function(e){
			   var target = $(e.target);
			   if(target.is('a')) {
				  self.level = 2;
				  self.isGanged = true;
				  var v = target.attr('v').split(','),
				  	  area_id = v[0],
					  area_name = v[1];	 
				  self.city.div.hide(); 
				  self.selectArea(area_id,area_name);
				  self.city.span.css({'box-shadow':'none'}); 
				  self.area.input.focus();
				  
				  if(typeof self.options.onSelect =='function') {
					 self.options.onSelect({level: 1, name: area_name, id: area_id});
				  }
				  
				  e.preventDefault();
			   }
		   });		   
		   	  
		   self.area.span.on('click', function(){
				self.options.onClick && self.options.onClick({level: 2});
		   });
		   self.area.input.bind('focus',function(){
			   	if(self.options.disabled[2]) return;
				self.province.div.hide();
				self.city.div.hide();
				self.tradingarea.div.hide();
				self.area.span.css({'box-shadow':'0 0 5px #93ddec'}); 
				if(self.area.areasLen > 0) {  
				    self.area.div.show();	 
				}
		   });
		   self.area.div.find('ul').click(function(e){
			   var target = $(e.target);
			   if(target.is('a')) {
				  self.level = 3;
				  self.isGanged = true;
				  var v = target.attr('v').split(','),
				  	  area_id = v[0],
					  area_name = v[1];	
				  self.area.div.hide();
				  self.selectArea(area_id,area_name);
				  self.area.span.css({'box-shadow':'none'}); 
				  self.tradingarea.input.focus();
				  
				  if(typeof self.options.onSelect =='function') {
					 self.options.onSelect({level: 2, name: area_name, id: area_id});
				  }
				  
				  e.preventDefault();
			   }
		   });		   
		   
		   self.tradingarea.span.on('click', function(){
				self.options.onClick && self.options.onClick({level: 3});
		   });
		   self.tradingarea.input.bind('focus',function(){
			    if(self.options.disabled[3]) return;
				self.province.div.hide();
				self.city.div.hide();
				self.area.div.hide();
				self.tradingarea.span.css({'box-shadow':'0 0 5px #93ddec'}); 
				if(self.tradingarea.areasLen > 0) {
					self.tradingarea.div.show();  	
				}
		   });		   
		   self.tradingarea.div.find('ul').click(function(e){
			   var target = $(e.target);
			   if(target.is('a')) {
				  self.level = 4;
				  self.isGanged = true;
				  var v = target.attr('v').split(','),
				  	  area_id = v[0],
					  area_name = v[1];	
				  self.tradingarea.div.hide();
				  self.tradingarea.span.css({'box-shadow':'none'}); 
				  self.selectArea(area_id,area_name);
				  
				  if(typeof self.options.onSelect =='function') {
					 self.options.onSelect({level: 3, name: area_name, id: area_id});
				  }
				  
				  e.preventDefault();
			   }
		   });			   
		   
		   $('body').click(function(e){
				// 检测发生在body中的点击事件，隐藏日历控件
				self.isShowMenu = true;
				var cell = $(e.target);
				if (cell){
					var tgID = $(cell).attr('id') == '' ? "string" : $(cell).attr('id');
					var inID = self.$element.attr('id');
					var isTagert = false;
					try
					{
						 // 如果事件触发元素不是Input元素 并且不是发生在时间控件区域
						 isTagert = tgID != inID && $(cell).closest('#' + inID).length <= 0;
					}
					catch (e)
					{
						isTagert = true;
					}
					if (isTagert)
					{
						self.hidden_area();
						self.province.span.css({'box-shadow':'none'}); 
						self.city.span.css({'box-shadow':'none'});
						self.area.span.css({'box-shadow':'none'}); 
						self.tradingarea.span.css({'box-shadow':'none'}); 
					}
				}
			});	
	    },
		selectArea:function(area_id,area_name) {
			var url = this.options.subAreaUrl+area_id;
			var _self = this;
			// 根据选择的地区信息 加载下级地区信息
			if(area_id!='0') {
				if(this.level == 1) {
					 this.changeCity(area_id);
					 this.province.input.val(area_name).removeClass(this.options.tipClass);
					 this.loadArea(url, util.bind(this.updateCity, this));
					 //this.loadArea(url,this.updateCity.bind(this));
				} else if(this.level == 2) {
					this.city.input.val(area_name).removeClass(this.options.tipClass);
					this.loadArea(url, util.bind(this.updateArea, this));
					//this.loadArea(url,this.updateArea.bind(this));
				} else if(this.level == 3) {
					this.area.input.val(area_name).removeClass(this.options.tipClass);
					this.loadArea(url, util.bind(this.updateTradingarea, this));
					//this.loadArea(url,this.updateTradingarea.bind(this));
				} else {
					this.tradingarea.input.val(area_name).removeClass(this.options.tipClass);	
				}
			}else {
				if(this.level == 1) {
					 this.province.input.val(area_name).removeClass(this.options.tipClass);
				}else if(this.level == 2) {
					this.city.input.val(area_name).removeClass(this.options.tipClass);
				}else if(this.level == 3) {
					this.area.input.val(area_name).removeClass(this.options.tipClass);
				}else {
					this.tradingarea.input.val(area_name).removeClass(this.options.tipClass);	
				}
			}
			// 重新选择不同的地区信息时，更新控件信息
			if(this.selectAreas[this.level-1] != area_id&&this.selectAreas[this.level-1]!="0") {
				var index = this.level;
				if(1>index) {
					this.province.input.val(this.options.textDesc[0]).addClass(this.options.tipClass); 
				}
				if(this.isProvince){
					 if(2 > index) {
						 this.city.input.val(this.options.textDesc[1]).addClass(this.options.tipClass); 
						 this.city.areasLen = 0;
					 }
					 if(3 > index) {
						this.area.input.val(this.options.textDesc[2]).addClass(this.options.tipClass); 
						this.area.areasLen = 0;
					 }
					 if(4 > index) {
						 this.tradingarea.input.val(this.options.textDesc[3]).addClass(this.options.tipClass); 
						 this.tradingarea.areasLen = 0;
					 }					 
				}else {
					 if(2>index) {
						 this.city.input.val(this.options.textDesc[2]).addClass(this.options.tipClass); 
						 this.city.areasLen = 0;
					 }
					 if(3>index) {
						this.area.input.val(this.options.textDesc[3]).addClass(this.options.tipClass); 
						this.area.areasLen = 0;
					 }					
				} 
			}
			
			// 重置了地区信息时，更新控件记录
			if(this.selectAreas[this.level-1] != area_id) { 
				this.selectAreas[this.level-1] = area_id;
				
				// 设置hidden 值
				if(area_id=='0') {
					this.hiddenElement.val(this.selectAreas[this.level-2]);
				} else {
					this.hiddenElement.val(area_id);	
			    }
				for(var i = this.level,len = this.selectAreas.length;i<len;i+=1 ) {
					this.selectAreas[i] == '0';
				}
			}			
		},
		hidden_area:function() {
			this.province.div.hide();
			this.city.div.hide();
			this.area.div.hide();
			this.tradingarea.div.hide(); 		
		},
		loadArea:function(url, callback, f) {
			var self = this;
			 $.ajax({
				 url: url,
				 type: "get",
				 dataType: "jsonp",
				 async:false,
				 success: function(data) {
					if(typeof callback == 'function'){
						  callback(data, f);
					}
					if(!f && self.options.onData){
						self.options.onData.call(self, data);
					}
				 },
				error:function (XMLHttpRequest, textStatus, errorThrown) {
					  if(typeof callback == 'function'){
						  callback([], f);
					   }					
				}
			 });
		},
		getAreaNames:function() {
			var province = this.province.input.val(),
				city = this.city.input.val(),
				area = this.area.input.val(), 
				tradingarea = this.tradingarea.input.val();		
			var areanames = new Array();
			if(!this.options.textDesc.contains(province)) {
				areanames.push(province);
			}
			if(!this.options.textDesc.contains(city)) {
				areanames.push(city);
			}	
			if(!this.options.textDesc.contains(area)) {
				areanames.push(area);
			}	
			if(!this.options.textDesc.contains(tradingarea)) {
				areanames.push(tradingarea);
		    }		
			return areanames;
		},
		updateProvinces:function(data) {// 省/直辖市
			var self = this;
			var municipality = new Array();	
			var c =new Array();
			$.each(data,function(i,n){	
			     // +n.area_id+			 
				 if(self.options.municipality.contains(n.area_id)) {
					  municipality.push('<li><a href="javascript:" v="'+n.area_id+','+n.area_name+'">'+n.area_name+'</a></li>');
				 } else {
					 c.push('<li><a href="javascript:" v="'+n.area_id+','+n.area_name+'">'+n.area_name+'</a></li>');
				 } 
			});
			this.province.div.find('.dir ul').empty().html(municipality.join(''));	
			this.province.div.find('.lst ul').empty().html(c.join(''));	
			if((municipality.length<0&&c.length<0)||self.options.showLevel<1) {
				this.province.span.hide();
				this.city.span.hide();
				this.area.span.hide();
				this.tradingarea.span.hide();
			}			
			if(municipality.length>0||c.length>0||!self.isGanged||self.options.showLevel<1) {
				this.province.div.hide();
				this.city.div.hide();
				this.area.div.hide();
				this.tradingarea.div.hide();			
			}
			else {
				this.province.span.show();
				if(self.isShowMenu){
					this.province.div.show();
				}
			}
		},
		updateCity:function(data) { // 更新市
			var self = this;
			var c = new Array(),
				bool = true;
			$.each(data,function(i,n){
				 if(bool) {
					  bool = false;	
					 //c.push('<li><a href="javascript:void(0)" v="0,不限">[不限]</a></li>');
				 }	
				 c.push('<li><a href="javascript:" v="'+n.area_id+','+n.area_name+'">'+n.area_name+'</a></li>');
			});
			self.city.areasLen = c.length;
			self.city.div.find('ul').empty().html(c.join(''));
			if(self.city.areasLen == 0||self.options.showLevel<2) {
				self.city.span.hide();
				self.area.span.hide();
				self.tradingarea.span.hide();
			}
			if(self.city.areasLen == 0||!self.isGanged||self.options.showLevel<2) {
				self.city.div.hide();
				self.area.div.hide();
				self.tradingarea.div.hide();
				//self.city.span.hide();
			}else {
				self.city.span.show();
				if(self.isShowMenu){
					self.city.div.show();
				}
			}
		},
		updateArea:function(data) { // 更新区/县
			var self = this;
			var c = new Array(),
				bool = true;
			$.each(data,function(i,n){
				 if(bool) {
					  bool = false;	
					 // c.push('<li><a href="javascript:void(0)" v="0,不限">[不限]</a></li>');
				 }	
				 c.push('<li><a href="javascript:" v="'+n.area_id+','+n.area_name+'">'+n.area_name+'</a></li>');
			});
			self.area.areasLen = c.length;
			self.area.div.find('ul').empty().html(c.join(''));
			if(self.area.areasLen == 0||self.options.showLevel<3) {
				self.area.span.hide();
				self.tradingarea.span.hide();
			}
			
			if(self.area.areasLen == 0||!self.isGanged||self.options.showLevel<3) {
				self.area.div.hide();
				self.tradingarea.div.hide();
				//self.area.span.hide();				
			} else {
				self.area.span.show();
				if(self.isShowMenu){	
					self.area.div.show();
				}
			}	
	    },
		updateTradingarea:function(data) { // 更新商圈
			var self = this;
			var c =new Array(),
				bool = true;
			$.each(data,function(i,n){
				 if(bool) {
					  bool = false;	
					  //c.push('<li><a href="javascript:void(0)" v="0,不限">[不限]</a></li>');
				 }	
				 c.push('<li><a href="javascript:" v="'+n.area_id+','+n.area_name+'">'+n.area_name+'</a></li>');
			});
			self.tradingarea.areasLen = c.length;
			self.tradingarea.div.find('ul').empty().html(c.join(''));
			if(self.tradingarea.areasLen == 0 || self.options.showLevel<4) {
				self.tradingarea.span.hide();				
			}
			if(self.tradingarea.areasLen == 0 || !self.isGanged||self.options.showLevel<4) {
				self.tradingarea.div.hide();
				//self.tradingarea.span.hide();				
			} else {
				self.tradingarea.span.show();
				if(self.isShowMenu){
					self.tradingarea.div.show();
				}
			}				
		},
		changeCity:function(area_id) {  // 切换直辖市和省
			var self = this;
			if(self.options.municipality.contains(area_id)) {
				//直辖市
				self.isProvince = false;
				if(self.selectAreas[0] != area_id) {
					self.city.input.val(self.options.textDesc[2]).addClass(self.options.tipClass);
					self.area.input.val(self.options.textDesc[3]).addClass(self.options.tipClass);	
					self.tradingarea.span.hide();	
				}	
			}else {
				// 省
				self.isProvince = true;
				if(self.selectAreas[0] != area_id) {
					self.city.input.val(self.options.textDesc[1]).addClass(self.options.tipClass);
					self.area.input.val(self.options.textDesc[2]).addClass(self.options.tipClass);
					if(self.options.showLevel>=4) {
						self.area.span.show();
						self.tradingarea.span.show();
					}
					self.tradingarea.input.val(self.options.textDesc[3]).addClass(self.options.tipClass);						
				}
			}			
		},
		setArea:function(areaid, f) {
			var url = this.options.areaUrl + areaid;
			this.loadArea(url, util.bind(this.setAreaControl, this, f));
			//this.loadArea(url, this.setAreaControl.bind(this), f);			
		},
		setAreaControl:function(data, f) {
			if(data&&data.length>0) {
				var self = this,
					result = data.reverse(),
				    len = result.length,
				    province = result[0],
					lastArea = result[len-1];
				self.changeCity(province.area_id);
				self.selectAreas[0] = lastArea.area_id;
				self.selectAreas = ['0','0','0','0'];
				self.isGanged = f != undefined ? true : false;
				
 				if(len>=1) {
					self.level = 1 ;
					self.selectArea(result[0].area_id,result[0].area_name);
					self.province.input.val(result[0].area_name).removeClass(self.options.tipClass);
				}
 				if(len>=2) {
					self.level = 2;
					self.selectArea(result[1].area_id,result[1].area_name);
					self.city.input.val(result[1].area_name).removeClass(self.options.tipClass);
				}				
 				if(len>=3) {
					self.level = 3;
					self.selectArea(result[2].area_id,result[2].area_name);
					self.area.input.val(result[2].area_name).removeClass(self.options.tipClass);
				}				
 				if(len>=4) {
					self.level = 4 ;
					self.selectArea(result[3].area_id,result[3].area_name);
					self.tradingarea.input.val(result[3].area_name).removeClass(self.options.tipClass);
				}			
			}			
	    }	
	};
   var o = $.fn.singleArea;
   $.fn.singleArea = function (option) {
     return this.each(function () {
       var $this   = $(this);
       var data    = $this.data('bs.singlearea');
       var options = typeof option == 'object' && option;
       if (!data) {
 		  $this.data('bs.singlearea', (data = new area(this, options)));
 	   }
       if (typeof option == 'string') {
 		  data[option]();
 	   }
     });
   };
   
   $.fn.setArea = function(areaid, f) {
	   var singleArea = $(this).data('bs.singlearea');
	   singleArea.setArea(areaid, f);
   };
   $.fn.getAreaNames = function() {
	   var singleArea = $(this).data('bs.singlearea');
	   return singleArea.getAreaNames();
   };
   $.fn.setShowMenu = function(f){
   	   var singleArea = $(this).data('bs.singlearea');
	   return singleArea.setShowMenu(f);
   };
   $.fn.singleArea.Constructor = area;
   // 取消冲突
   $.fn.singleArea.noConflict = function () {
     $.fn.singleArea = o;
     return this;
   };      	
	return $;
});