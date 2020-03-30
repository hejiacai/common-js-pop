/**
 *  jQuery  jort.js  
 *  Copyright (c)  ZhangYu 
 */ 
 
define('cqjob.jobsort2', 'cqjob.jobDialog', function(require, exports, module){
	
	var $ = module['jquery'],
		dialog = module['cqjob.jobDialog'];
	var jobsort = function(element,opt) {
		this.id = '';
		this.dh = null; //
		this.dc = null; // 内容       
		this.df = null; // 底部 
		this.$element = $(element), 
		this.options = null; //参数信息
		this.hd = null;
		this.currLevel = 1;
		this.lastSelectItem = ['NULL','不限'];
		this._defaults ={
			 url: '//www.huibo.com/jobsort/getjobsort/callback-callback-jobsort-',
			 multipleUrl:'//www.huibo.com/jobsort/getjobsorts/callback-callback-jobsorts-',
			 allSubUrl:'//www.huibo.com/jobsort/getsubjobsorts/callback-callback-jobsort-',
			 isLimit:false,
			 max:5,
			 tipClass:'tipClass',
			 hddName:'hddName',
			 inputName:'jobSortName',
			 selectItems:[],
			 selectClass:'cu',
			 type:'multiple', // single|multiple 
			 unLimitedLevel:3,
			 onSelect:null,
			 target:null
		};
		
		var self = this;
		//初始化选项
		this.initOptions = function(){
			var tempOpt = opt || {};
			tempOpt.animate = tempOpt.animate || '';
			tempOpt.showAnimate = tempOpt.showAnimate || tempOpt.animate;
			tempOpt.hideAnimate = tempOpt.hideAnimate || tempOpt.animate;
			self.options = $.extend({}, this._defaults, tempOpt);
		};			
		
		this.initHtml= function(type) {
			 // 初始化控件
			 var html =' <span><div class="prompt clearfix">'+
	                    	'<span class="max">最多可选三项</span>'+
	                        '<div class="left"><a href="#">不限</a><label> | 已选：</label></div>'+                  
	                   ' </div>'+ 
					   ' <div class="dropLst">'+
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
			 self.dh =$(html).appendTo(self.$element).find('.dropLst');//.hide()	
			 self.hd =self.$element.find('.prompt').show();  
			 self.tipElement = self.hd;//限制数量
			 self.hc = self.$element.find('.dropLstCon');
			 self.hddElement = $('<input type="hidden" name="'+self.options.hddName+'"/>').appendTo(self.$element); 
			 // 是否限制
			 if(self.options.isLimit){
				self.tipElement.find('.unlimited').hide(); 
			 }			 
			 
			 // 加载一级类别
			 var url = self.options.url;
			 self.loadData(url,self.selectItem);
			 if(self.isSingle()) {
				 self.tipElement.find('.unlimited').hide().end().find('p').html('请选择分类；重新选择即可修改当前选项');
				 // self.hd.find('.JobCay').hide();
				 self.hd.find('.dropIco').html('&#xf0d7;');
				 self.hd.removeClass('dropSet').addClass('dropRdSet');
			 }else {
				 self.tipElement.find('.max').html("最多可选"+self.options.max+"项");
			 }
			 if(self.options.selectItems.length>0) {
			   	  var jobsorturl = self.options.multipleUrl+self.options.selectItems.join(',');	
				  self.options.selectItems = []; 	 
				  self.loadData(jobsorturl,self.setControl);
			 }
			 
		};
		
		// 初始化事件
		this.initEvent = function() {
			 self.dh.find('.closeDrop').click(function() {
				   self.dh.hide(); 
			 });
			 self.dh.find('.unlimited').click(function(){
				  self.dh.hide(); 
				  self.reset();
				  //self.hd.find('.left').before($('<span class="seled" d="null,不限">不限<i class="delSel">×</i></span>'));
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
				 if(target.is('input')) {
				 }else if(target.is('label') || target.is('li')) {
					 target = target.is('label') ? target.closest('li') : target;
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
				 }else if(target.is('label') || target.is('li')) {
					 var target = target.is('label') ? target.closest('li') : target;
					 if(target.is('li[isParent]')) {
						 var target = target.closest('li');
						 var input = $(target).find('input:visible');
						 if(input.length<=0) {
							 return;
						 }
						 var disabled = $(target).find('input').is(':disabled');
						 var checked = $(target).find('input').is(':checked');
						 if($(target).find('input').is(':radio')&&checked) {
							 return;
						 }						 
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
					 self.isChecked = $(target).find('input').is(':checked');
					 self.isDisabled = $(target).find('input').is(':disabled');					 
					 var url = self.options.url+self.lastSelectItem[0];
					 self.loadData(url,self.selectItem);
 
				 }
			 });
				 
			 // 选择三级类
			 self.dh.find('.lst3 ul').click(function(e) {
				 var target = $(e.target);
				 self.lastSelectItem = $(target).closest('li').attr('d').split(',');
				 if(target.is('input')) {
				 	//target.attr("checked","checked");
					self.checkItem(target.is(':checked'));	
				 }else if(target.is('label') || target.is('li')) {
					 var target = target.is('label') ? target.closest('li') : target;
					 var input = $(target).find('input:visible');
					 if(input.length<=0) {
						 return;
					 }
					 var disabled = $(target).find('input').is(':disabled');
					 var checked = $(target).find('input').is(':checked');
					 if($(target).find('input').is(':radio')&&checked) {
						 return;
					 }					 
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
		
		// 删除项
		this.delItems = function(data) {
			$.each(data,function(i,n){
				if(self.options.selectItems.contains(n.jobsort)) {
					self.del(n.jobsort,n.jobsort_name);
				}				
			});
		};
		
		// 删除已选项
		this.del = function(id,name) {
			self.hd.find('.seled[d="'+id+','+name+'"]').remove();
			self.options.selectItems.remove(id);
			self.hddElement.val(self.options.selectItems.join(',')); 
			self.dh.find('li[d="'+id+','+name+'"]').find('input').removeAttr('checked');
							
		};
		this.add = function(id,name) {
			if(self.isSingle()) {
				self.hd.find('.left').after($('<a class="label seled" d="'+id+','+name+'">'+name+'</a>'));
			}else {
				self.hd.find('.left').after($('<a class="label seled" d="'+id+','+name+'">'+name+'<i class="delSel">×</i></a>'));
			}
			if(!self.options.selectItems.contains(id)) {
				self.options.selectItems.push(id);	
			}		
			self.hddElement.val( self.options.selectItems.join(','));	 							
		};
		
		 // 选择事件
		this.loadData = function(url,callback) {
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
		 };
		
		// 单选选中
		this.checkRadio = function() {
			var id = self.lastSelectItem[0],
				name = self.lastSelectItem[1],
				url = self.options.url+ id;
			 /*	 取消禁用
			 self.loadData(url,function(data){
				$.each(data,function(i,n){
					self.dh.find('li[d="'+n.jobsort+','+n.jobsort_name+'"]').find('input').attr('disabled','disabled');
				});					  
			 });*/
			 if(self.isExists(id)) {
				 return;
			 } 			
			 // 删除之前的
			 self.hd.find('.seled[d]').each(function(){
				  var obj = $(this).attr('d').split(','),
					  delurl = self.options.url+ obj[0];
				 self.del(obj[0],obj[1]);					 
			 });
			  // 如果有子类之前有选中的，移除Inupt中的项，并删除控件中的记录		 
			  self.loadData(url,self.delItems);
			  // 新增当前项到inPut中 
			  self.add(id,name);
			  self.dh.hide();				 
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
				 if(isSingle) { 
					 self.checkRadio(id);
				 }else {
					  if(self.checkMultiple()) {
						  self.dh.find('li[d="'+id+','+name+'"]').find('input').removeAttr('checked');
						  $.anchor('最多可以选择'+self.options.max+'项',{icon:'info'});		
						  return;
					  }
					  // 选中当前类
					 self.dh.find('li[d="'+id+','+name+'"]').addClass("cur").find('input').attr('checked',true);	
					 self.loadData(url,function(data){
						// 如果有子类之前有选中的，移除Inupt中的项，并删除控件中的记录	 
						self.delItems(data); 
						// 如果有禁用并选中所有的子类
						$.each(data,function(i,n){
							 self.dh.find('li[d="'+n.jobsort+','+n.jobsort_name+'"]').find('input').attr('checked','checked').attr('disabled','disabled');		     
							
						});					  
					 });	 		 	
					 // 新增当前项到中 
					 self.add(id,name);	
				}
			}else {
				 self.dh.find('li[d="'+id+','+name+'"]').removeClass("cur").find('input').removeAttr('checked');  				
				 self.loadData(url,function(data){
					$.each(data,function(i,n){
						  self.dh.find('li[d="'+n.jobsort+','+n.jobsort_name+'"]').find('input').removeAttr('checked').removeAttr('disabled');				
					});					  
				 }); 
				 self.del(id,name);
				// self.checkMultiple();
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
				  createItem = function(isSigle,pid,id,name,isdisabled,isChecked,isParent,isFirst,isShowControl) {
					  var s = new StringBuilder();
					  s.Append('<li d="'+id+','+name+'"');
					  if(isFirst) {
						  s.Append(' class="ths"'); 
					  }
					  if(isParent) {
						   s.Append(' isParent="true"');
					  }
					  s.Append('>');
					  
					  if(isSigle) {
						   s.Append('<input type="radio" class="rdo" name="'+self.options.inputName+'" ');	  
					  }else {
						   s.Append('<i class="hbFntWes">&#xf105;</i><input type="checkbox"  class="chb" name="'+self.options.inputName+'" ');
					  }	 
					  if(isdisabled) {
						   if(!self.isSingle()) {
							   s.Append(' disabled="disabled"'); 
							   s.Append(' checked="checked"');   
						   } 
					  } 
					  else if(isChecked) {
						 s.Append(' checked="checked"');	   
					  }
					  if(!isShowControl) {
						 s.Append(' style="display:none;"');
					  }
					  s.Append(' />');
					  if(isParent) {
						  s.Append('<label>全部('+name+')</label>'); 
					  }else {
						  s.Append('<label>'+name+'</label>');   
					  }
					  s.Append('</li>');
					  return s.toString();
			   };
			   
			  //&&!isSingle	
			  if(self.currLevel>=self.options.unLimitedLevel) { // 是否在子类中显示当前类  
					arr.push(createItem(isSingle,pid,pid,pname,self.isDisabled,self.isChecked,true,true,true));					    
			  }	  	

			  if(self.currLevel == 1) {
					// 一级职位类别
					$.each(data,function(i,n){
						 arr.push('<li d="'+n.jobsort+','+n.jobsort_name+'"><label>'+n.jobsort_name+'</label></li>');
					});
					self.dh.find('.lst1 ul').empty().html(arr.join(''));
			  }else if(self.currLevel == 2) {
				  	self.dh.find('.lst2 ul').empty();
					self.dh.find('.lst3 ul').empty();
					var bool = false;
					$.each(data,function(i,n){
						 bool = true;
						 var item = createItem(isSingle,pid,n.jobsort,n.jobsort_name,self.isChecked,self.isExists(n.jobsort),false,false,false);	
						 arr.push(item);
					});
					if(bool) {
						self.dh.find('.lst2 ul').html(arr.join(''));
					}				     
			  }else {
				    self.dh.find('.lst3 ul').empty();
					var bool = false;
					$.each(data,function(i,n){
						 bool = true;
						 var item = createItem(isSingle,pid,n.jobsort,n.jobsort_name,self.isChecked,self.isExists(n.jobsort),false,false,true);	
						 arr.push(item);
					});
					if(bool) {
						self.dh.find('.lst3 ul').html(arr.join(''));
				    }	
			  }	  
		 }; 
		  
		this.setControl = function(data) {
			$.each(data,function(i,n){
				self.lastSelectItem[0] = n.jobsort;
				self.lastSelectItem[1] = n.jobsort_name;
				//TODO:父级项是否被选中
				self.checkItem(true);
			});	   
		} 
		this.reset = function() {
		   self.options.selectItems = [ ]; 	
		 //  this.hc.find('.lst2 ul li').remove();
		 //  this.hc.find('.lst3 ul li').remove();
		   this.hc.find('input[type="checkbox"],input[type="radio"]').removeAttr('checked').removeAttr('disabled');	
		   this.hd.find('.seled').remove();
		   this.$element.find('input[name="'+this.options.hddName+'"]').val(' '); 
		}
		
		// 设置值
		this.setValue = function(items) {
			var values = items.split(','),
				newArr = new Array(),
				isSingle = self.isSingle();
			if(isSingle) {
				var jobsorturl = self.options.multipleUrl+items;	
				self.loadData(jobsorturl,self.setControl);
			}else {
				for(var i =0,len = values.length;i<len;i+=1) {
					if(!self.isExists(values[i])) {
						//self.options.selectItems.push(values[i]);
						newArr.push(values[i]);
					}
				}
				if(newArr.length>0) {
					var jobsorturl = self.options.multipleUrl+newArr.join(',');	 	 
					self.loadData(jobsorturl,self.setControl);					
				}				
			}	 

			
		};
		
		// 获取数据
		this.getValue = function() {
			var v=new Array();
			this.hd.find('.seled').each(function(){
				 var area = $(this).attr('d');	
				 v.push(area);
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
				if (isTagert && !self.options.target)
				{
					self.dh.hide();
				}
			}
		});				
	};
  
	var old = $.fn.jobsort;
	
	$.fn.jobsort = function (option) {
	  return this.each(function () {
		var $this   = $(this);
		var data    = $this.data('bs.jobsort');
		var options = typeof option == 'object' && option;
		if (!data) {
			$this.data('bs.jobsort', (data = new jobsort(this, options)));
			data.show();
		}
		if (typeof option == 'string') {
			data[option]();
		}
	  });
	}
	$.fn.setJobSortValue = function(ids) {
		var jobsort = $(this).data('bs.jobsort');
		jobsort.setValue(ids);
	};
	
	$.fn.getJobSortValue = function() {
		var jobsort = $(this).data('bs.jobsort');
		return jobsort.getValue();
	};
	
	$.fn.removeJobSortValue = function(id,name) {
		var jobsort = $(this).data('bs.jobsort');
		return jobsort.del(id,name);
	};
	$.fn.resetJobsortValue = function() {
		 var jobsort = $(this).data('bs.jobsort');
		 jobsort.reset();
	};
	
	$.fn.jobsort.Constructor = jobsort;
	// 解决冲突	
	$.fn.jobsort.noConflict = function () {
	  $.fn.jobsort = old;
	  return this;
	}	

	return $;
});