/**
 *   jQuery  mobile.multiple.area.js  多选地区控件
 *   Copyright (c)  ZhangYu
 */
(function($){
	var Helper = function(){
		 this.arr = [];	 
	};
	Helper.prototype.getDescendant=function(a){
		 if(typeof a == 'undefined') {
			 return;
		 }
		 var i = 0;
		 this.arr = this.arr.concat(a);
		 while(i <a.length) {
			 arguments.callee.call(this,a[i].subAreas);	
			 i++;
		 }				 
   };		
	var m = function(element,option) {
		this.$element = null;
		this.options = null;
		this.chongqingitem = null;
		this.mainarenitem  = null;
		this.otherareaitem = null;
		this.otheritem = null;
		this._selectItems = [];
		this.init(element,option);
	};
	m.Default = {
		html:'<section class="scrBox">'+
			'  <div class="scrBoxCon">'+
			'    <div  class="closeSrc"><i class="hbFntWes"></i></div>'+
			'    <div  class="srcBoxLst">'+
			'      <div class="hd"> <a class="btnsF12 btn3 _clear"  href="javascript:void(0);">清除</a><a  class="btnsF12 btn4 _confirm" href="javascript:void(0);">确定</a>'+
			'        <p class="_title"></p>'+
			'      </div>'+
			'      <div class="bd">'+
			'      </div>'+
			'    </div>'+
			'  </div>'+
			'</section>',	
		itemHtml:'<dl>'+
				'        <dt><b class="_categoryName"></b>'+
				'          <p class="_selectedItem"></p>'+
				'          <i class="hbFntWes"></i></dt>  '+
				'        <dd>'+
				'          <ul class="_itemContainer">'+
				'          </ul>'+
				'        </dd>'+
				'</dl>',
		chongqingitem:'<ul class="_itemContainer"></ul>',			
		selectArea:'',
	 	url: 'http://www.huibo.com/area/getareas/callback-callback-areaids-',
		name:'hiddenName',
		onSelect:null,
		type:'focus',
		limitcount:5,
		title:'请选择地区',
		specialNumber:['030','031'],
		_area:[{"area_id":"0300","parent_ID":"","area_name":"重庆","subAreas":[{"area_id":"030","parent_ID":"0300","area_name":"主城区","subAreas":[{"area_id":"0301","parent_ID":"030","area_name":"渝中区"},{"area_id":"0302","parent_ID":"030","area_name":"江北区"},{"area_id":"0303","parent_ID":"030","area_name":"九龙坡区"},{"area_id":"0304","parent_ID":"030","area_name":"沙坪坝区"},{"area_id":"0305","parent_ID":"030","area_name":"南岸区"},{"area_id":"0306","parent_ID":"030","area_name":"大渡口区"},{"area_id":"0307","parent_ID":"030","area_name":"渝北区"},{"area_id":"0308","parent_ID":"030","area_name":"巴南区"},{"area_id":"0309","parent_ID":"030","area_name":"北碚区"},{"area_id":"0342","parent_ID":"030","area_name":"两江新区"}]},{"area_id":"031","parent_ID":"0300","area_name":"周边区县","subAreas":[{"area_id":"0310","parent_ID":"031","area_name":"万州区"},{"area_id":"0311","parent_ID":"031","area_name":"涪陵区"},{"area_id":"0312","parent_ID":"031","area_name":"万盛区"},{"area_id":"0313","parent_ID":"031","area_name":"黔江区"},{"area_id":"0314","parent_ID":"031","area_name":"长寿区"},{"area_id":"0315","parent_ID":"031","area_name":"双桥区"},{"area_id":"0316","parent_ID":"031","area_name":"江津区"},{"area_id":"0317","parent_ID":"031","area_name":"合川区"},{"area_id":"0318","parent_ID":"031","area_name":"永川区"},{"area_id":"0319","parent_ID":"031","area_name":"南川区"},{"area_id":"0320","parent_ID":"031","area_name":"綦江县"},{"area_id":"0321","parent_ID":"031","area_name":"潼南县"},{"area_id":"0322","parent_ID":"031","area_name":"铜梁县"},{"area_id":"0323","parent_ID":"031","area_name":"大足县"},{"area_id":"0324","parent_ID":"031","area_name":"荣昌县"},{"area_id":"0325","parent_ID":"031","area_name":"璧山县"},{"area_id":"0326","parent_ID":"031","area_name":"梁平县"},{"area_id":"0327","parent_ID":"031","area_name":"城口县"},{"area_id":"0328","parent_ID":"031","area_name":"丰都县"},{"area_id":"0329","parent_ID":"031","area_name":"垫江县"},{"area_id":"0330","parent_ID":"031","area_name":"武隆县"},{"area_id":"0331","parent_ID":"031","area_name":"忠县"},{"area_id":"0332","parent_ID":"031","area_name":"开州"},{"area_id":"0333","parent_ID":"031","area_name":"云阳县"},{"area_id":"0334","parent_ID":"031","area_name":"奉节县"},{"area_id":"0335","parent_ID":"031","area_name":"巫山县"},{"area_id":"0336","parent_ID":"031","area_name":"巫溪县"},{"area_id":"0337","parent_ID":"031","area_name":"石柱县"},{"area_id":"0338","parent_ID":"031","area_name":"酉阳县"},{"area_id":"0339","parent_ID":"031","area_name":"彭水县"},{"area_id":"0340","parent_ID":"031","area_name":"秀山县"}]}]}]
};
	m.prototype = {
		init:function(element,option) {	
			 this.options = $.extend({},m.Default, option);
			 this.initContent(element);
			 this.initEvent();
		},
		initContent:function(element) {
			// 初始化内容
			this._element = $(element);
			this._content = $(this.options.html).appendTo('body');
			var mainarea = this.getArea('030'),
				otherarea = this.getArea('031'),
				cqarea = this.getArea('0300');			
			// 全重庆复选框	
			this.chongqingitem = $(this.options.chongqingitem);
			this.mainarenitem  = $(this.options.itemHtml);
			this.otherareaitem = $(this.options.itemHtml);
			this.otheritem = $(this.options.itemHtml);
			this.chongqingitem.find('dt').hide().end().find('dd').show();
		    // 预处理选中职位
			if(this.options.selectArea!=null||this.options.selectArea!='') {
				var arr = this.options.selectArea.split(','),
					loadArea = [];	
				var _selectItems = this.checkSpecialNumber(arr);
				this._selectItems = _selectItems;
				for(var k =0,len = arr.length;k<len;k++) {
					if(arr[k].substr(0, 2)!='03'){
						loadArea.push(arr[k]);
					}
				}
				var self = this;
			    if(loadArea.length>0) {
					var url = this.options.url+loadArea.join(',');
					this.loadArea(url,function(data){
						var a = [];	
						$.each(data,function(i,n){
							 a.push(n.area_name);
							 self.otheritem.find('._itemContainer').append(self._buildAreaItem(n,true));	     
						});	
						self.otheritem.find('._selectedItem').append(a.join(','));
					});
				}	
			}
			if(arr.contains('0300')) {
				// 包含重庆
				this.chongqingitem.append(this._buildAreaItem(cqarea,true));
			}else {
				this.chongqingitem.append(this._buildAreaItem(cqarea));	
			}
			
			// 主城区
			this.mainarenitem.find('._categoryName').html(mainarea.area_name);
			var isSelectMainArea = _selectItems.contains(mainarea.area_id);
			if(isSelectMainArea) {
				this.mainarenitem.find('._selectedItem').append('全选');
			}
			this.mainarenitem.find('._itemContainer').append(this._buildAreaItem({area_id:mainarea.area_id,area_name:'全选'},isSelectMainArea));	
			for(var i = 0,len = mainarea.subAreas.length;i<len;i++) {
				var area =  mainarea.subAreas[i],
					isSelected = _selectItems.contains(area.area_id);
				if(isSelected&&!isSelectMainArea) {
					this.mainarenitem.find('._selectedItem').append(area.area_name);
				}	
				this.mainarenitem.find('._itemContainer').append(this._buildAreaItem(area,isSelected||isSelectMainArea));	
			}
			
			//其他区县
			this.otherareaitem.find('._categoryName').html(otherarea.area_name);
			var isSelectOtherArea = _selectItems.contains(otherarea.area_id);
			if(isSelectOtherArea) {
				this.otherareaitem.find('._selectedItem').append('全选');
			}			
			this.otherareaitem.find('._itemContainer').append(this._buildAreaItem({area_id:otherarea.area_id,area_name:'全选'},isSelectOtherArea));				
			for(var j = 0,len = otherarea.subAreas.length;j<len;j++) {
				var area =  otherarea.subAreas[j],
					isSelected = _selectItems.contains(area.area_id);
				if(isSelected&&!isSelectOtherArea) {
					this.otherareaitem.find('._selectedItem').append(area.area_name);
				}	
				this.otherareaitem.find('._itemContainer').append(this._buildAreaItem(area,isSelected||isSelectOtherArea));	
			}
			this._content.find('.hd').find('._title').html(this.options.title);		
			this.otheritem.find('._categoryName').html('其他省市')	
			this._content.find('.bd').append(this.chongqingitem).append(this.mainarenitem).append(this.otherareaitem).append(this.otheritem);	
		},
		initEvent:function() {
			// 初始化事件
			var _self = this;
			_self._content.find('.bd dt').toggle(function(){
				$(this).closest('dl').find('dd').show();
			},function(){
				$(this).closest('dl').find('dd').hide();
			});
			_self._content.find('.bd ul').on('click','label',function(){
				  var parent = $(this).closest('li'),
				  	  content = parent.find('p').html(); 
				  // 选择重庆	
				  if(_self.checkNum()&&!parent.hasClass('check')) {
					  alert("最多选择"+_self.options.limitcount+'项');
					  return;
				  }  
				  if(content=='重庆') {
					  if(!parent.hasClass('check')) {
						  // 取消主城区与其他区县
						_self.mainarenitem.find('._selectedItem').html('')
						.end().find('li')
						.each(function(){
							 $(this).removeClass('check')
							 .find('input').removeAttr('checked')
							 .end().find('i').html('&#xf10c;');
							  _self.delItem($(this).find('input').val());							 
						 });
						 _self.otherareaitem.find('._selectedItem').html('')
						 .end().find('li')
						 .each(function(){
							 $(this).removeClass('check')
							 .find('input').removeAttr('checked')
							 .end().find('i').html('&#xf10c;');
							 _self.delItem($(this).find('input').val());							 
						  });						  
						  
						  parent.addClass('check').attr('v',content)
						 .end().find('input').attr('checked','checked')
						 .end().find('i').html('&#xf058;')
						 _self.addItem(parent.find('input').val());	 						  
					  }else {
						  parent.removeClass('check').removeAttr('v')
						 .end().find('input').removeAttr('checked')
						 .end().find('i').html('&#xf10c;')
						  _self.delItem(parent.find('input').val());				  
					 }					  
					return;  
				  }	  
				  if(parent.find('input').val().substr(0,2)=='03') {
					  // 选择重庆所属地区时，取消重庆
					 _self.chongqingitem.find('li').removeClass('check').removeAttr('v')
					 .end().find('input').removeAttr('checked')
					 .end().find('i').html('&#xf10c;')
					 _self.delItem('0300');					  
				  }
				  
				  if(content=='全选') {
					  //  全选操作
					  if(!parent.hasClass('check')) {
						  parent = parent.parent().find('li');
						  parent.addClass('check')
						 .end().find('input').attr('checked','checked')
						 .end().find('i').html('&#xf058;');	
						  $(this).closest('dl').find('._selectedItem').html(content);
						  _self.addItem($(this).closest('li').find('input').val());	 						  					  
					  }else {
						  parent = parent.parent().find('li');
						  parent.removeClass('check')
						 .end().find('input').removeAttr('checked')
						 .end().find('i').html('&#xf10c;');	
						  $(this).closest('dl').find('._selectedItem').html('');
						  _self.delItem($(this).closest('li').find('input').val());	 				  
					 }						  
					  
				  }else {
					  var first = parent.parent().find('li:first');
					  if(first.hasClass('check')&&first.find('p').html()=='全选') {
						  // 选中全选时，不在执行任何操作
						  return;
					  }
					  if(!parent.hasClass('check')) {
						  parent.addClass('check')
						 .end().find('input').attr('checked','checked')
						 .end().find('i').html('&#xf058;');	
						  var selectContent = $(this).closest('dl').find('._selectedItem').html(),
							  separator = ',';	
						  if(selectContent=='') {
							 separator = '';	  
						  }
						  $(this).closest('dl').find('._selectedItem').append(separator+content);
						  _self.addItem(parent.find('input').val());						  
					  }else {
						  parent.removeClass('check')
						 .end().find('input').removeAttr('checked')
						 .end().find('i').html('&#xf10c;');	
						  var selectContent = $(this).closest('dl').find('._selectedItem').html();  
						  $(this).closest('dl').find('._selectedItem').html(selectContent.replace(content+',','').replace(','+content,'').replace(content,''));	
						  _self.delItem(parent.find('input').val());				  
					 }					     
				  }	  	  
								
			});
			_self._content.find('._clear').click(function(){
				_self._content.find('._selectedItem').empty();
				 var  itmes = _self._content.find('.bd ul li');
				 itmes.removeClass('check')
				 .find('input').removeAttr('checked')
				 .end().find('i').html('&#xf10c;');
				 _self._selectItems = []; 
			});
			_self._content.find('.closeSrc').click(function(){
				_self.hiddenControl();
			});				
			
			_self._content.find('._confirm').click(function(){
				_self.hiddenControl();
				  if(_self.options.onSelect!=null) {
					  _self.options.onSelect(_self.getSelectArea());
				  }
			});	
			var dHt = $(document).height();
			_self._element.on(_self.options.type,function(){
				_self._content.animate({'width':'100%'},100);
				_self._content.find('.closeSrc').css({'position':'fixed'});
				_self._content.find('.srcBoxLst').css({'min-height':dHt});
				_self._content.find('.closeSrc i').animate({'width':'50px'},{ queue: false, duration: 100 });
			 });		
			
		},
		hiddenControl:function(){
			  this._content.animate({'width':'0'},{ queue: false, duration: 100 });
			  this._content.find('.closeSrc').find('i').animate({'width':0},{ queue: false, duration: 100 });
			  this._content.find('.closeSrc').css({'position':'absolute'});			
		},
		addItem:function(id) {
			if(this._selectItems.contains(id)) {
				return;
			}
			this._selectItems.push(id);
		},
		delItem:function(id) {
			if(this._selectItems.contains(id)) {
				this._selectItems.remove(id);
			}
		},
		checkNum:function() {
			return (this._selectItems.length+1>this.options.limitcount);
		},
		getSelectArea:function() {
			var areaname = [];
			var cqcontent = this.chongqingitem.find('li').attr('v');
			if(cqcontent!=''&&cqcontent!=null&&typeof cqcontent !='undefined') {
				areaname.push(cqcontent);	
			}
			
			var maincontent = this.mainarenitem.find('._selectedItem').html();
			if(maincontent == '全选') {
				maincontent ='主城区'; 
			}
			if(maincontent!='') {
				areaname.push(maincontent);				
			}
			var othercontent = this.otherareaitem.find('._selectedItem').html();
			if(othercontent=='全选') {
				othercontent = '周边区县'
			}
			if(othercontent!='') {
				areaname.push(othercontent);				
			}
			
			var ocontent = this.otheritem.find('._selectedItem').html();
			if(ocontent!='') {
				areaname.push(ocontent);				
			}
			
			// 去除特殊编号
			var arr = [];
			for(var i = 0,len = this._selectItems.length;i<len;i++) {
				if(this.options.specialNumber.contains(this._selectItems[i])) {
					var area = this.getArea(this._selectItems[i]);
				 	if(area.subAreas) {
					  for(var j = 0,areLen = area.subAreas.length;j<areLen;j += 1) {
							area.subAreas[j].area_id && arr.push( area.subAreas[j].area_id);
					  } 
					}
				}else {
					this._selectItems[i] && arr.push(this._selectItems[i]);
				}
			}		
			return {name:areaname.join(','),value:arr.join(',')};			
			
		},
		_buildAreaItem:function(area,ischecked) {
			if(ischecked) {
			return '<li class="check"><input type="checkbox" checked="checked" name="'+this.options.name+'" id="'+this.options.name+area.area_id+'" value="'+area.area_id+'" class="chb"><label for="'+this.options.name+area.area_id+'"><p>'+area.area_name+'</p><i class="hbFntWes">&#xf058;</i></label></li>';				
			}
			return '<li><input type="checkbox" name="'+this.options.name+'" id="'+this.options.name+area.area_id+'" value="'+area.area_id+'" class="chb"><label for="'+this.options.name+area.area_id+'"><p>'+area.area_name+'</p><i class="hbFntWes">&#xf10c;</i></label></li>';
		},
		loadArea:function(url,callback) {
			 $.ajax({
				 url: url,
				 type: "get",
				 dataType: "jsonp",
				 success: function(data) {
					  if(typeof callback == 'function'){
						  callback(data);
					   }
				 },
				error:function (XMLHttpRequest, textStatus, errorThrown) {
					  if(typeof callback == 'function'){
						  callback([]);
					   }					
				}
			 });
		},
		getArea:function(id)
		{
			// 获取地区信息
			var l = this.options._area;
			for(var i = 0,len = l.length;i<len;i+=1) {
				if(l[i].area_id ==id) {
					return l[i];
				}
				if(l[i].subAreas) {
					for(var j = 0,subLen = l[i].subAreas.length;j<subLen;j+=1 ) {
						if(l[i].subAreas[j].area_id ==id) {
							return l[i].subAreas[j];
						}
						if(l[i].subAreas[j].subAreas) {
							for(var k,partLen = l[i].subAreas[j].subAreas;k<partLen;k+=1) {
								if(l[i].subAreas[j].subAreas[k].area_id ==id) {
									return l[i].subAreas[j].subAreas[k];
								}								
							}
						}
						
					}		
				}
			}
			return null;
		},
		checkSpecialNumber:function(ids) {
			// 验证选择的是否是特殊编号
			 var arr = ids;
			 for(var i = 0,len = this.options.specialNumber.length;i<len;i+=1) {
				  var d = this.getArea(this.options.specialNumber[i]);
				  if(d.subAreas) {
					  var isExists = true;
					  var a = new Array();
					  for(var j = 0,areLen = d.subAreas.length;j<areLen;j+=1) {
						  a.push(d.subAreas[j].area_id)
						  if(!ids.contains(d.subAreas[j].area_id)) {
							  isExists = false;
							  break;
						  }
					  } 
					  if(isExists) {
						 for(var k = 0;k<a.length;k+=1) {
							 arr.remove(a[k]);
						 } 
						 arr.push(d.area_id);
					  } 
					  
				  }	 
			 }
			 return arr;
		}
	};
   var  o= $.fn.multiplearea;
   $.fn.multiplearea = function (option) {
     return this.each(function () {
       var $this   = $(this);
       var data    = $this.data('hb.area');
       var options = typeof option == 'object' && option;
       if (!data) {
 		  $this.data('hb.area', (data = new m(this, options)));
 	   }
       if (typeof option == 'string') {
 		  data[option]();
 	   }
     });
   };
   $.fn.multiplearea.Constructor = m;
   $.fn.multiplearea.noConflict = function () {
     $.fn.multiplearea = o;
     return this;
   };      	
	
})(jQuery);