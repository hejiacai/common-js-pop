/**
 *   jQuery  mobile.calling.js 行业控件
 *   Copyright (c)  ZhangYu
 */
(function($){	
	var c = function(element,option) {
		this.$element = null;
		this.options = null;
		this._selectItems = [];
		this.init(element,option);
	};
	c.Default = {
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
		firstHtml:'<dl>'+
				'        <dt class="allTitle"><b class="titleName"></b>'+
				'          <p class="_selectedItem"></p>'+
				'          <i class="hbFntWes"></i></dt>'+
				'</dl>',
		firstTitle: '不限行业',
		selectItems: null,
		allUrl:'http://www.huibo.com/calling/GetAllCallings',
		name:'hiddenName',
		onSelect:null,
		title:'请选择行业',
		isSingle:false,
		type:'focus',
		limitcount:5
	};
	c.prototype = {
		init:function(element,option) {	
			 this.options = $.extend({},c.Default, option);
			 var self = this;
			 this._element = $(element);
			 this.loadData(this.options.allUrl,function(result){
				  self.initContent(result);
				  self.initEvent();
			 });
		},
		initContent:function(result) {
			// 初始化内容
			var self =  this,
				arr = [];
			this._content = $(this.options.html);
			if(this.options.selectItems != null && this.options.selectItems != '') {
				 arr = this.options.selectItems.split(',');
				 this._selectItems = arr;
			}
			if(this.options.firstTitle){
				var first = $(self.options.firstHtml).appendTo(self._content.find('.bd'));
				first.find('.titleName').html(this.options.firstTitle);
			}
			$.each(result,function(i,n){
				var item  = $(self.options.itemHtml);
				item.find('._categoryName').html(n.calling_name);
				$.each(n.subItems,function(j,o){
					var iscurrselected = arr.contains(o.calling_id);
					if(iscurrselected) {
						item.find('._selectedItem').append(o.calling_name);
					}
					item.find('._itemContainer').append(self._buildItem(o,iscurrselected));
				});
				self._content.find('.bd').append(item);	
			});
			if(self.options.isSingle) {
				this._content.find('.hd').find('a').hide();				
			}
			this._content.find('.hd').find('._title').html(this.options.title);		
			this._content.appendTo('body');
			
		},
		
		initEvent:function() {
			// 初始化事件
			var _self = this,
				dt = _self._content.find('.bd dt');
				
			dt.click(function(e){
				if($(this).hasClass('allTitle')){
					_self._content.find('._selectedItem').empty();
					var  itmes = _self._content.find('.bd ul li');
					itmes.removeClass('check')
					.find('input').removeAttr('checked')
					.end().find('i').html('&#xf10c;');
					_self._selectItems = [];
					$(this).find('._selectedItem').html(_self.options.firstTitle);
					if(_self.options.isSingle){
						var li = $(this).children('b'),
							name = li.html(),
							value = '';
							
						_self.hiddenControl();
						_self.options.onSelect({name:name,value:value});
					}
				} else {
					var dd = $(this).closest('dl').find('dd');
					if(dd.is(':hidden')){
						dd.show();
					} else {
						dd.hide();
					}
				}
			});
			if(_self.options.isSingle) {
				_self._content.find('.bd ul').on('click','label',function(){
					  // 移除其他单选按钮的样式
					  var  li = $(this).closest('li'),
					  	  name = li.find('p').html(),
						  value = li.find('input').val(),
					      parent = _self._content.find('.bd ul').find('li');	  
					  parent.removeClass('check')
					 .end().find('input').removeAttr('checked')
					 .end().find('i').html('&#xf10c;');	
					  parent.closest('dl').find('._selectedItem').html('');
					  _self.options.firstTitle && dt.eq(0).find('._selectedItem').html('');
					  // 设置已选中的样式
					  li.addClass('check')
					 .end().find('input').attr('checked','checked')
					 .end().find('i').html('&#xf058;');		 
					 li.closest('dl').find('._selectedItem').append(name);			  
					  // 关闭窗口	
					  _self.hiddenControl();
					  if(_self.options.onSelect!=null) {
						  _self.options.onSelect({name:name,value:value});
					  }	
				});
				
			} else {
				_self._content.find('.bd ul').on('click','label',function(){
					  var parent = $(this).closest('li'),
						  content = parent.find('p').html(),
						  value = parent.find('input').val();
					
						_self.options.firstTitle && dt.eq(0).find('._selectedItem').html('');
					  if(_self.checkNum()&&!parent.hasClass('check')) {
						  alert("最多选择"+_self.options.limitcount+'项');
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
						  var rege = new RegExp(','+content+'|'+content+',|^'+content+'$');  
						  $(this).closest('dl').find('._selectedItem').html(selectContent.replace(rege,''));	
						  _self.delItem(parent.find('input').val());				  
					 }					      	  					
				});				
				
			}
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
					  _self.options.onSelect(_self.getSelectItems());
				  }
			});				
			var dHt = $(document).height();
			_self._element.on(_self.options.type,function(){
				_self._content.animate({'width':'100%'},100);
				_self._content.find('.closeSrc').css({'position':'fixed'});
				_self._content.find('.srcBoxLst').css({'min-height':dHt});
				_self._content.find('.closeSrc i').animate({'width':'90px'},{ queue: false, duration: 100 });
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
		getSelectItems:function() {
			var names = [];	
			this._content.find('.bd ._selectedItem').each(function(){
				var name = $(this).html();
				if(name=='全选') {
					name = $(this).closest('dl').find('._categoryName').html();
				}
				if(name!='') {
					names.push(name);			
				}
			});				
								
			return {name:names.join(','),value:this._selectItems.join(',')};			
			
		},
		_buildItem:function(object,ischecked) {
			if(ischecked) {
			return '<li class="check"><input type="checkbox" checked="checked" name="'+this.options.name+'" id="'+this.options.name+object.calling_id+'" value="'+object.calling_id+'" class="chb"><label for="'+this.options.name+object.calling_name+'"><p>'+object.calling_name+'</p><i class="hbFntWes">&#xf058;</i></label></li>';				
			}
			return '<li><input type="checkbox" name="'+this.options.name+'" id="'+this.options.name+object.calling_id+'" value="'+object.calling_id+'" class="chb"><label for="'+this.options.name+object.calling_id+'"><p>'+object.calling_name+'</p><i class="hbFntWes">&#xf10c;</i></label></li>';
		},
		loadData:function(url,callback) {
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
		}
	};
   var  o= $.fn.calling;
   $.fn.calling = function (option) {
     return this.each(function () {
       var $this   = $(this);

       var data    = $this.data('hb.calling');
       var options = typeof option == 'object' && option;
       if (!data) {
 		  $this.data('hb.calling', (data = new c(this, options)));
 	   }
       if (typeof option == 'string') {
 		  data[option]();
 	   }
     });
   };
   $.fn.calling.Constructor = c;
   $.fn.calling.noConflict = function () {
     $.fn.calling = o;
     return this;
   };      	
	
})(jQuery);