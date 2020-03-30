/**
 *  jQuery  mulitiplearea.js  
 *  Copyright (c)  ZhangYu 
 */ 
(function($) {
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
	
	var area = function(element,opt) {
		this.id = '';
		this.dh = null; //
		this.dc = null; // 内容       
		this.df = null; // 底部 
		this.$element = $(element), 
		this.options = null; //参数信息
		this.hd = null;
		this.currLevel = 1;
		this.lastSelectItem = ['NULL','不限'];
		this.isChecked = false;
		this.isDisabled =false;
		this._defaults ={
			 url: '//www.huibo.com/area/getarea/callback-callback-areaid-',
			 multipleUrl:'//www.huibo.com/area/getarea/callback-callback-areaid-',
			 allSubUrl:'//www.huibo.com/area/getarea/callback-callback-all-1-areaid-',
			 singleUrl:'//www.huibo.com/area/getareas/callback-callback-areaids-',
			 isLimit:false,
			 max: 3,
			 tipClass:'tipClass',
			 hddName:'hddName',
			 inputName:'areaName',
			 selectItems:[],
			 selectClass:'cu',
			 type:'multiple', 
			 unLimitedLevel:2,
			 onSelect:null,
			 specialNumber:['030','031','010','011','020','021','040','041'],
			_area:[{"area_id":"0300","parent_ID":"","area_name":"重庆","subAreas":[{"area_id":"030","parent_ID":"0300","area_name":"重庆-主城区","subAreas":[{"area_id":"0301","parent_ID":"030","area_name":"渝中区"},{"area_id":"0302","parent_ID":"030","area_name":"江北区"},{"area_id":"0303","parent_ID":"030","area_name":"九龙坡区"},{"area_id":"0304","parent_ID":"030","area_name":"沙坪坝区"},{"area_id":"0305","parent_ID":"030","area_name":"南岸区"},{"area_id":"0306","parent_ID":"030","area_name":"大渡口区"},{"area_id":"0307","parent_ID":"030","area_name":"渝北区"},{"area_id":"0308","parent_ID":"030","area_name":"巴南区"},{"area_id":"0309","parent_ID":"030","area_name":"北碚区"},{"area_id":"0342","parent_ID":"030","area_name":"两江新区"}]},{"area_id":"031","parent_ID":"0300","area_name":"重庆-周边区县","subAreas":[{"area_id":"0310","parent_ID":"031","area_name":"万州区"},{"area_id":"0311","parent_ID":"031","area_name":"涪陵区"},{"area_id":"0312","parent_ID":"031","area_name":"万盛区"},{"area_id":"0313","parent_ID":"031","area_name":"黔江区"},{"area_id":"0314","parent_ID":"031","area_name":"长寿区"},{"area_id":"0315","parent_ID":"031","area_name":"双桥区"},{"area_id":"0316","parent_ID":"031","area_name":"江津区"},{"area_id":"0317","parent_ID":"031","area_name":"合川区"},{"area_id":"0318","parent_ID":"031","area_name":"永川区"},{"area_id":"0319","parent_ID":"031","area_name":"南川区"},{"area_id":"0320","parent_ID":"031","area_name":"綦江区"},{"area_id":"0321","parent_ID":"031","area_name":"潼南区"},{"area_id":"0322","parent_ID":"031","area_name":"铜梁区"},{"area_id":"0323","parent_ID":"031","area_name":"大足区"},{"area_id":"0324","parent_ID":"031","area_name":"荣昌区"},{"area_id":"0325","parent_ID":"031","area_name":"璧山区"},{"area_id":"0326","parent_ID":"031","area_name":"梁平县"},{"area_id":"0327","parent_ID":"031","area_name":"城口县"},{"area_id":"0328","parent_ID":"031","area_name":"丰都县"},{"area_id":"0329","parent_ID":"031","area_name":"垫江县"},{"area_id":"0330","parent_ID":"031","area_name":"武隆县"},{"area_id":"0331","parent_ID":"031","area_name":"忠县"},{"area_id":"0332","parent_ID":"031","area_name":"开州"},{"area_id":"0333","parent_ID":"031","area_name":"云阳县"},{"area_id":"0334","parent_ID":"031","area_name":"奉节县"},{"area_id":"0335","parent_ID":"031","area_name":"巫山县"},{"area_id":"0336","parent_ID":"031","area_name":"巫溪县"},{"area_id":"0337","parent_ID":"031","area_name":"石柱县"},{"area_id":"0338","parent_ID":"031","area_name":"酉阳县"},{"area_id":"0339","parent_ID":"031","area_name":"彭水县"},{"area_id":"0340","parent_ID":"031","area_name":"秀山县"}]}]},{"area_id":"0100","parent_ID":"","area_name":"北京","subAreas":[{"area_id":"010","parent_ID":"0100","area_name":"北京-五环以内","subAreas":[{"area_id":"0101","parent_ID":"010","area_name":"东城区"},{"area_id":"0102","parent_ID":"010","area_name":"西城区"},{"area_id":"0105","parent_ID":"010","area_name":"朝阳区"},{"area_id":"0106","parent_ID":"010","area_name":"丰台区"},{"area_id":"0108","parent_ID":"010","area_name":"海淀区"}, {"area_id":"0107","parent_ID":"010","area_name":"石景山区"},{"area_id":"0103","parent_ID":"010","area_name":"崇文区"},{"area_id":"0104","parent_ID":"010","area_name":"宣武区"}]}, {"area_id":"011","parent_ID":"0100","area_name":"北京-五环以外","subAreas":[{"area_id":"0109","parent_ID":"011","area_name":"门头沟区"},{"area_id":"0110","parent_ID":"011","area_name":"房山区"},{"area_id":"0111","parent_ID":"011","area_name":"通州区"},{"area_id":"0112","parent_ID":"011","area_name":"顺义区"},{"area_id":"0113","parent_ID":"011","area_name":"昌平区"},{"area_id":"0114","parent_ID":"011","area_name":"大兴区"},{"area_id":"0115","parent_ID":"011","area_name":"怀柔区"},{"area_id":"0116","parent_ID":"011","area_name":"平谷区"},{"area_id":"0117","parent_ID":"011","area_name":"密云县"},{"area_id":"0118","parent_ID":"011","area_name":"延庆县"}]}]},{"area_id":"0200","parent_ID":"","area_name":"上海","subAreas":[{"area_id":"020","parent_ID":"0200","area_name":"上海-外环以内","subAreas":[{"area_id":"0201","parent_ID":"020","area_name":"黄浦区"},{"area_id":"0202","parent_ID":"020","area_name":"卢湾区 "},{"area_id":"0203","parent_ID":"020","area_name":"徐汇区"},{"area_id":"0204","parent_ID":"020","area_name":"长宁区"},{"area_id":"0205","parent_ID":"020","area_name":"静安区"},{"area_id":"0206","parent_ID":"020","area_name":"普陀区"},{"area_id":"0207","parent_ID":"020","area_name":"闸北区"},{"area_id":"0208","parent_ID":"020","area_name":"虹口区"},{"area_id":"0209","parent_ID":"020","area_name":"杨浦区"},{"area_id":"0213","parent_ID":"020","area_name":"浦东新区"}]},{"area_id":"021","parent_ID":"0200","area_name":"上海-郊区/县","subAreas":[{"area_id":"0210","parent_ID":"021","area_name":"闵行区"},{"area_id":"0211","parent_ID":"021","area_name":"宝山区"},{"area_id":"0212","parent_ID":"021","area_name":"嘉定区"},{"area_id":"0214","parent_ID":"021","area_name":"金山区"},{"area_id":"0215","parent_ID":"021","area_name":"松江区"},{"area_id":"0216","parent_ID":"021","area_name":"青浦区"},{"area_id":"0217","parent_ID":"021","area_name":"奉贤区"},{"area_id":"0218","parent_ID":"021","area_name":"崇明县"}]}]},{"area_id":"0400","parent_ID":"","area_name":"天津","subAreas":[{"area_id":"040","parent_ID":"0400","area_name":"天津-主城区","subAreas":[ {"area_id":"0401","parent_ID":"040","area_name":"和平区"},{"area_id":"0402","parent_ID":"040","area_name":"河东区"},{"area_id":"0403","parent_ID":"040","area_name":"河西区"},{"area_id":"0404","parent_ID":"040","area_name":"南开区"},{"area_id":"0405","parent_ID":"040","area_name":"河北区"},{"area_id":"0406","parent_ID":"040","area_name":"红桥区"},{"area_id":"0407","parent_ID":"040","area_name":"东丽区"},{"area_id":"0408","parent_ID":"040","area_name":"西青区"},{"area_id":"0409","parent_ID":"040","area_name":"津南区"},{"area_id":"0410","parent_ID":"040","area_name":"北辰区"}]},{"area_id":"041","parent_ID":"0400","area_name":"天津-周边区县","subAreas":[ {"area_id":"0412","parent_ID":"041","area_name":"宝坻区"},{"area_id":"0413","parent_ID":"041","area_name":"滨海新区"},{"area_id":"0414","parent_ID":"041","area_name":"宁河县"},{"area_id":"0415","parent_ID":"041","area_name":"静海县"},{"area_id":"0416","parent_ID":"041","area_name":"蓟县"},{"area_id":"0411","parent_ID":"041","area_name":"武清区"}]}]}]};
		
		var self = this;
		//初始化选项
		this.initOptions = function(){
			var tempOpt = opt || {};
			tempOpt.animate = tempOpt.animate || '';
			tempOpt.showAnimate = tempOpt.showAnimate || tempOpt.animate;
			tempOpt.hideAnimate = tempOpt.hideAnimate || tempOpt.animate;
			self.options = $.extend({}, this._defaults, tempOpt);
		};			
		
		// 获取地区级别
	    this.getAreaLevel = function (id)
		{
			var arr = new Array();
			if (id == '' || typeof id == 'undefined') return [];
			if (/\d{2}00/.test(id) && id.length==4) return [id];
			arr.push(id.substr(0, 2) + '00');
			if(id.length==4)arr.push(id.substr(0, 3));
			arr.push(id);
			return arr;
		}
		
		// 获取地区信息
		this.getArea = function(id)
		{
			/*
			var level = self.getAreaLevel(id);
			var l = self.options._area;
			var area = null;
			for (var i in level)
			{

				var id = level[i];
				for (var j in l)
				{
					if (l[j].area_id == id)
					{
						area = l[j];
						l = l[j].subAreas;
						break;
					}
				}
			}*/
			var l = self.options._area;
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
		}
		
		// 获取地区名称
		this.getAreaName = function(id)
		{
			var area = self.getArea(id);
			if (area)
			{
				return area.area_name;
			} else
			{
				return '';
			}
		}
		
		this.initHtml= function(type) {
			 // 初始化控件
			 var html =' <span><div class="dropSet"> '+
					   ' <b class="hbFntWes dropIco">&#xf03a;</b>'+
					   '    <input type="text" class="text JobCay">'+
					   '    <div class="clear"></div>'+
					   '  </div>'+ 
					   ' <div class="dropLst">'+
					   ' <div class="dropLstHead"><a href="javascript:void(0)" class="unlimited btn1 btnsF12">类别不限</a><p>最多可选择<em></em>项</p><a class="closeDrop" href="javascript:void(0)">×</a></div>'+
						' <div class="dropLstCon">'+
						'     <div class="lst lst1">'+
						'        <ul>'+
						'        </ul>'+
						'     </div>'+
						'    <div class="lst lst2">'+
						'    	<ul>'+
						'       </ul>'+
						'    </div>'+
						'    <div class="lst lst3">'+
						'     	<ul>'+
						'       </ul>'+
						'    </div>'+
						'    <div class="clear"></div>'+
						' </div> '+
						' </div></span>';										
			 self.dh =$(html).appendTo(self.$element).find('.dropLst').hide();
			 self.dh.find('.dropLstHead em').html(self.options.max);
			 self.tipElement = self.dh.find('.dropLstHead');
			 self.hd =self.$element.find('.dropSet').show(); 
			 self.hc = self.$element.find('.dropLstCon');
			 self.hddElement = $('<input type="hidden" name="'+self.options.hddName+'"/>').appendTo(self.$element);
			 
			 // 是否限制
			 if(self.options.isLimit){
				self.tipElement.find('.unlimited').hide(); 
			 }
			 // 加载一级类别
			 var url = self.options.url;
			 self.loadData(url, function(data){
				 self.selectItem(data);
				 self.dh.find('.lst1 ul').find('li[d="0300,重庆"]').find('label').click();  
			 });
			 if(self.options.selectItems.length>0) {
				  var ids = self.checkSpecialNumber(self.options.selectItems);
				  self.options.selectItems = []; 
				  for(var i =0; i<ids.length;i+=1) {
					  var areaurl = self.options.singleUrl+ids[i];
					  self.lastSelectItem =[ids[i],' '];
					  self.loadData(areaurl,self.setControl,false,true);			  
				  }	

			 }
			 
		};
		
		/*
		 * 检测特殊编号
		 */
		this.checkSpecialNumber = function(ids) {
			 var arr = ids;
			 for(var i = 0,len = self.options.specialNumber.length;i<len;i+=1) {
				  var d = self.getArea(self.options.specialNumber[i]);
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
		};
		
		// 初始化事件
		this.initEvent = function() {
			 self.dh.find('.closeDrop').click(function() {
				   self.dh.hide(); 
			 });
			 self.dh.find('.unlimited').click(function(){
				  self.dh.hide(); 
				  self.reset();
				  self.hd.find('input[type="text"]').before($('<span class="seled" d="null,不限">不限<i class="delSel">×</i></span>'));
			 });
			 
			 self.hd.click(function(e) {
				 var target = $(e.target);
				 if(target.is('.delSel')) {
					  self.lastSelectItem = target.parent().attr('d').split(',');
					  self.checkItem(false);
					  e.stopPropagation();
					  return;
				 }
				 self.dh.show(); 
			 });
			 
			 // 选择一级大类
			 self.dh.find('.lst1 ul').click(function(e) {
				 var target = $(e.target);
				 self.lastSelectItem = $(target).closest('li').attr('d').split(',');
				 if(target.is('input')) {
					 self.checkItem(target.is(':checked'));
				 }else if(target.is('label')) {
					 target = target.closest('li');
					 self.currLevel = 2;
					 $(target).siblings().removeClass(self.options.selectClass).end().addClass(self.options.selectClass);
					 self.lastSelectItem = $(target).attr('d').split(',');
					 self.isChecked = $(target).find('input').is(':checked');
					 self.isDisabled = $(target).find('input').is(':disabled');
					 var url = self.options.url+self.lastSelectItem[0];
					 self.loadData(url,self.selectItem);
 
				 }
			 });	 
			 // 选择二级大类
			 self.dh.find('.lst2 ul').click(function(e) {
				 var target = $(e.target);
				 self.lastSelectItem = $(target).closest('li').attr('d').split(',');
				 if(target.is('input')) {
					self.checkItem(target.is(':checked'));	
				 }else if(target.is('label')) {
					 target = target.closest('li');
					 if(target.is('li[isParent]')) {
						 var target = target.closest('li');
						 var input = $(target).find('input:visible');
						 if(input.length<=0) {
							 return;
						 }
						 var disabled = $(target).find('input').is(':disabled');
						 var checked = $(target).find('input').is(':checked');
						 
						 if(disabled) {
							 return;
						 }
						 if(checked) {
							 $(target).find('input').removeAttr('checked');
						 }else {
							 $(target).find('input').attr('checked','checked');
						 }
						 self.checkItem(!checked);							 
						 return;
					 }
					 self.currLevel = 3;
					 $(target).siblings().removeClass(self.options.selectClass).end().addClass(self.options.selectClass);
					 var url = self.options.url+self.lastSelectItem[0];
					 self.isChecked = $(target).find('input').is(':checked');
					 self.isDisabled = $(target).find('input').is(':disabled');
					 self.loadData(url,self.selectItem);
 
				 }
			 });
				 
			 // 选择三级类
			 self.dh.find('.lst3 ul').click(function(e) {
				 var target = $(e.target);
				 self.lastSelectItem = $(target).closest('li').attr('d').split(',');
				 if(target.is('input')) {
					self.checkItem(target.is(':checked'));	
				 }else if(target.is('label')) {
					 var target = target.closest('li');
					 var input = $(target).find('input:visible');
					 if(input.length<=0) {
						 return;
					 }
					 var disabled = $(target).find('input').is(':disabled');
					 var checked = $(target).find('input').is(':checked');
					 
					 if(disabled) {
						 return;
					 }
					 if(checked) {
						 $(target).find('input').removeAttr('checked');
					 }else {
						 $(target).find('input').attr('checked','checked');
					 }
					 self.checkItem(!checked);
				 }
			 });			 
			 
			 self.hc.mouseover(function(e){
				var target = $(e.target);
				if(target.is('li')){
					self.hc.find('li').removeClass('hov');
					target.addClass('hov');
				}
				else if(target.closest('li').length>0) {
					self.hc.find('li').removeClass('hov');
					target.closest('li').addClass('hov');
				}			
			});					
			
		};	
		
		this.show =function () {
			this.initOptions();
			this.initHtml();
			this.initEvent();
		};
		
		this.getSelectValue = function() {
			var s  = new Array();
			for(var i= 0;i<self.options.selectItems.length;i+=1) {
				var id = self.options.selectItems[i];
				if(self.options.specialNumber.contains(id)) {
					var data =self.getArea(id);
					if(data!=null&&data.subAreas) {
						$.each(data.subAreas,function(i,n){
							s.push(n.area_id);
						});
					}						
				}else{
					s.push(id);
				}
			}
			return s;			
	   };
		
		// 删除项
		this.delItems = function(data) {
			$.each(data,function(i,n){
				if(self.options.selectItems.contains(n.area_id)) {
					self.del(n.area_id,n.area_name);
				}				
			});
		};
		
		// 删除已选项
		this.del = function(id,name) {
			self.hd.find('.seled[d="'+id+','+name+'"]').remove();
			self.options.selectItems.remove(id);
			self.hddElement.val(this.getSelectValue().join(',')); 				
		};
		this.add = function(id,name) {
     		self.hd.find('input[type="text"]').before($('<span class="seled" d="'+id+','+name+'">'+name+'<i class="delSel">×</i></span>'));
			if(!self.options.selectItems.contains(id)) {
				self.options.selectItems.push(id);	
			}	
			self.hddElement.val(this.getSelectValue().join(','));	 							
		};
		 // 选择事件
		this.loadData = function(url,callback,isAll,isSelf) {
			var data = self.getArea(self.lastSelectItem[0]);
			if(data!= null) {
				if(typeof callback == 'function') {
					if(isAll&&typeof data.subAreas !='undefined'){
						var helper = new Helper();
					    helper.getDescendant(data.subAreas);
						callback(helper.arr);
					}else {
						if(isSelf) {
							var a = new Array();
							a.push(data);
							callback(a);
						 }else if(typeof data.subAreas !='undefined'){
							 callback(data.subAreas); 
						 }
					   	
				   }
					
				}
			}else {
				// 选择项时	
				$.ajax({
					url: url,
					type: "get",
					dataType: "jsonp",
					success: function(data) {
						if(typeof callback == 'function') {
							callback(data);
						}
					}
				});					
				
			}
		 };
		
		
		this.checkMultiple = function() {
			var isLimit = false;
			if(self.options.selectItems.length+1>self.options.max) {
				//self.tipElement.addClass(self.options.tipClass);
				isLimit = true;				
		    }else {
				//self.tipElement.removeClass(self.options.tipClass);
				isLimit = false;
			}
			return isLimit;
		};
		
		// check项
		this.checkItem = function(isChecked) {
			var id = self.lastSelectItem[0],
				name = self.lastSelectItem[1],
				url = self.options.allSubUrl+ id,
				isSingle = self.isSingle();
			if(isChecked) {
				 self.hd.find('.seled[d="null,不限"]').remove();
				  if(self.checkMultiple()) {
					  $.anchor('最多可以选择'+self.options.max+'项',{icon:'info'});	
					  self.dh.find('li[d="'+id+','+name+'"]').find('input').removeAttr('checked');	
					  return;
				  }
				  // 如果有将子类中的当前类选中
				 self.dh.find('li[d="'+id+','+name+'"]').find('input').attr('checked','checked');	
				  // 如果有禁用并选中所有的子类
				 self.loadData(url,function(data){
					self.delItems(data,true);
					$.each(data,function(i,n){
						 self.dh.find('li[d="'+n.area_id+','+n.area_name+'"]').find('input').attr('checked','checked').attr('disabled','disabled');		     
					});					  
				 },true);	
				 // 新增当前项到inPut中 
				 self.add(id,name);	

			}else {
				 self.dh.find('li[d="'+id+','+name+'"]').find('input').removeAttr('checked');  				
				 self.loadData(url,function(data){
					$.each(data,function(i,n){
						  self.dh.find('li[d="'+n.area_id+','+n.area_name+'"]').find('input').removeAttr('checked').removeAttr('disabled');				
					});					  
				 },true); 
				 self.del(id,name);
			} 
			if(typeof self.options.onSelect =='function') {
				self.options.onSelect();	
			}					
		};
			
		
		// 是否存在
		this.isExists = function(id) {
			return self.options.selectItems.contains(id);
		};
		// 是否单选
		this.isSingle = function(id) {
			return self.options.type=='single';
		};
		this.selectItem= function(data) {
			  var arr = new Array(),
			  	  pid = self.lastSelectItem[0],
				  pname = self.lastSelectItem[1],
				  isSingle = self.isSingle(),
				  createItem = function(isSigle,pid,id,name,isdisabled,isChecked,isParent,addClass,hasControl) {
					  var s = new StringBuilder();
					  s.Append('<li d="'+id+','+name+'"');
					  if(addClass) {
					      s.Append(' class= "ths" ');
					  }
					  if(isParent) {
						   s.Append(' isParent="true"');
					  }
					  s.Append('>');
					  if(isSigle) {
						   s.Append('<input type="radio" class="chb" name="'+self.options.inputName+'" ');	  
					  }else {
						   s.Append('<input type="checkbox"  class="chb" name="'+self.options.inputName+'" ');
					  }	 
					  if(isdisabled) {
						   s.Append('disabled="disabled"'); 
						   if(!self.isSingle()) {
							   s.Append(' checked="checked"');   
						   } 
					  } 
					  else if(isChecked) {
						   s.Append(' checked="checked"');
					  }
					  if(hasControl){
						  s.Append('style="display:none;"');
					  }		  
					  s.Append(' />');
					  
					  if(isParent) {
						  s.Append('<label>全选</label>');  
					  }else {
						  s.Append('<label>'+name+'</label>');
					  }
					  s.Append('</li>');
					  return s.toString();
			   };
			   

			  if(self.currLevel>=self.options.unLimitedLevel&&!isSingle) { // 是否在子类中显示当前类  
					  arr.push(createItem(isSingle,pid,pid,pname,self.isDisabled,self.isChecked,true,true,false));			    
			  }	  	
			  if(self.currLevel == 1) {
					// 一级
				  	self.dh.find('.lst1 ul').empty();
					arr= [];
					var bool = false;
					$.each(data,function(i,n){
						 bool = true;
						 var item = createItem(isSingle,pid,n.area_id,n.area_name,false,self.isExists(n.area_id),false,false,true);	
						 arr.push(item);
					});
					if(bool) {
						self.dh.find('.lst1 ul').html(arr.join(''));
					}else {
						self.dh.find('.lst1 ul').html(arr.join(''));
					}									
			  }else if(self.currLevel == 2) {
				  	self.dh.find('.lst3 ul').empty();
					var bool = false;
					$.each(data,function(i,n){
						 bool = true;
						 var item = createItem(isSingle,pid,n.area_id,n.area_name,self.isChecked,self.isExists(n.area_id),false,false,true);	
						 arr.push(item);
					});
					if(bool) {
						self.dh.find('.lst2 ul').html(arr.join(''));
					}else {
						self.dh.find('.lst2 ul').html(arr.join(''));
					}				     
			  }else {
				    self.dh.find('.lst3 ul').empty();
					var bool = false;
					$.each(data,function(i,n){
						 bool = true;
						 var item = createItem(isSingle,pid,n.area_id,n.area_name,self.isChecked,self.isExists(n.area_id),false,false,false);	
						 arr.push(item);
					});
					if(bool) {
						self.dh.find('.lst3 ul').html(arr.join(''));
				    }else {
						self.dh.find('.lst3 ul').html(arr.join(''));
					}	
			  }	  
		 }; 
		  
		this.setControl = function(data) {
			$.each(data,function(i,n){
				self.lastSelectItem[0] = n.area_id;
				self.lastSelectItem[1] = n.area_name;
				self.checkItem(true,self.isExists(n.parent_id),self.isExists(n.area_id));
			});	   
		} 
		this.reset = function() {
		   self.options.selectItems = [ ]; 	
		  // this.hc.find('.lst2 ul li').remove();
		  // this.hc.find('.lst3 ul li').remove();	
		   this.hc.find('input[type="checkbox"]').removeAttr('checked').removeAttr('disabled');	
		   this.hd.find('.seled').remove();
		   this.$element.find('input[name="'+this.options.hddName+'"]').val(' '); 

		}
		
		// 设置值
		this.setValue = function(items) {
			var values = items.split(','),
				newArr = new Array();
		    var ids = values.concat(self.options.selectItems);
				values = self.checkSpecialNumber(ids);
				for(var i =0,len = values.length;i<len;i+=1) {
					if(!self.isExists(values[i])) {
						//self.options.selectItems.push(values[i]);
						newArr.push(values[i]);
					}
				}
				for(var i =0; i<newArr.length;i+=1) {
					  self.lastSelectItem =[newArr[i],' '];
					  //self.options.selectItems = []; 
					  var areaurl = self.options.singleUrl+newArr[i]; 	 
					  self.loadData(areaurl,self.setControl,false,true);			  
			   }	
		};
		
		// 获取数据
		this.getValue = function() {
			var v=new Array();
			var specialV = new Array();
			this.hd.find('.seled').each(function(){
				var area = $(this).attr('d');	
				var id = area.split(',')[0];
				if(self.options.specialNumber.contains(id)) {
					var data =self.getArea(id);
					var jsonSpecialArea = [];
					if(data!=null&&data.subAreas) {
						//var jsonSpecialArea = {name:data.area_id,ids:[]};
						$.each(data.subAreas,function(i,n){
							jsonSpecialArea.push(n.area_id);
						});
				      }
					v.push({name:area.split(',')[1],ids:jsonSpecialArea})
				}else{
					v.push({name:area.split(',')[1],ids:[area.split(',')[0]]});
				}				
			});
			return v;
		};				

	   $('body').click(function(e){
			// 检测发生在body中的点击事件，隐藏日历控件
			var cell = $(e.target);
			if (cell)
			{
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
					self.dh.hide();
				}
			}
		});				
	};
  
  var old = $.fn.multiplearea;
  
  $.fn.multiplearea = function (option) {
	return this.each(function () {
	  var $this   = $(this);
	  var data    = $this.data('bs.multiplearea');
	  var options = typeof option == 'object' && option;
	  if (!data) {
		  $this.data('bs.multiplearea', (data = new area(this, options)));
		  data.show();
	  }
	  if (typeof option == 'string') {
		  data[option]();
	  }
	});
  }
  $.fn.setMultipleAreaValue = function(ids) {
	  var area = $(this).data('bs.multiplearea');
	  area.setValue(ids);
  };
  
  $.fn.getMultipleareaValue = function() {
	  var area = $(this).data('bs.multiplearea');
	  return area.getValue();
  };
  $.fn.resetMultipleareaValue =function() {
	  var area = $(this).data('bs.multiplearea');
	  return area.reset();
  };
  $.fn.multiplearea.Constructor = area;
  // 解决冲突	
  $.fn.multiplearea.noConflict = function () {
	$.fn.multiplearea = old;
	return this;
  }	
})(jQuery);