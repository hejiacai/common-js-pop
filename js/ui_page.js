/* 
* jquery.pager.js  分页控件 
* copyright(c)  2013    ZhangYu
*/
	  function serialize (form) {
		if (!form || form.nodeName !== "FORM") {
				return;
		}
		var i, j, q = [];
		for (i = form.elements.length - 1; i >= 0; i = i - 1) {
			if (form.elements[i].name === "") {
					continue;
			}
			switch (form.elements[i].nodeName) {
				case 'INPUT':
					switch (form.elements[i].type) {
						case 'text':
						case 'hidden':
						case 'password':
						case 'button':
						case 'reset':
						case 'submit':
								q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
								break;
						case 'checkbox':
						case 'radio':
								if (form.elements[i].checked) {
										q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
								}                                               
								break;
						}
					break;
				case 'file':
					break; 
				case 'TEXTAREA':
					q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
					break;
				case 'SELECT':
					switch (form.elements[i].type) {
					case 'select-one':
							q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
							break;
					case 'select-multiple':
							for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
									if (form.elements[i].options[j].selected) {
											q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
									}
							}
							break;
					}
					break;
				case 'BUTTON':
					switch (form.elements[i].type) {
					case 'reset':
					case 'submit':
					case 'button':
							q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
							break;
					}
					break;
			}
		}
		return q.join("&");
	}	
	
	// 字符串StringJson类
	var StringJson = function()
	{
		this._strings = new Array();        
	};
	StringJson.prototype.Append= function(key,value)
	{
		this._strings.push(key+":'"+value+"'");
		return this;
	};
	
	StringJson.prototype.toJson = function()
	{
		return  eval('({'+this._strings.join(',')+'})');
	};

+function ($) {
	 
	//　格式化ｕｒｌ参数
	var getParam = function(separator,param) {
		var arr = new Array();
		$.each(param,function(i,n){
			arr.push(i+separator+n);
		});
		return arr.join(separator);
	};
	
	//解析参数
	var analysisParam = function(separator,url) {
		var sep1 = separator;
		if(arguments.length >2) {
			sep1 = arguments[2];
		}
		var arr,
		json = new StringJson(),
		regex =new RegExp('[^'+separator+']+'+sep1+'[^'+separator+'\.]+','g'),
		result = url.match(regex);
		if(result!=null&&result.length>0) {
			//Array.prototype.slice.call(result);
			for(var i=result.length-1;i>=0;i-=1) {
				var attr = result[i].split(sep1);
				json.Append(attr[0],attr[1]);
			}
		}
		return json.toJson();
	};
	
	//格式化url地址,加上或修改指定参数
	var formatUrl = function(separator,param, url) {
		var fUrl = '';
		switch(separator) {
			case "-":
				var q = url,
				index = url.lastIndexOf('/'),
				_host = url.substring(0,index+1),
				_url = url.substring(index+1);
				hasParam =/[-]/g.test(_url);
				if(!hasParam) {
					var u = getParam('-',param);
					if(u.indexOf('.html')>0) {
						fUrl = _host+_url.replace(/(\.html)/,  u+"$1");
					}else {
					    fUrl = _host+_url+'/'+u+'.html';	
					}
					break;
				}
				var empty = {},
					urlParam = analysisParam(separator,_url);		
				$.extend(empty,urlParam,param);
				fUrl =_host +_url.replace(/([^/\.]+)(\.html)/, getParam(separator,empty)+"$2");			
				break;
			default:
			break;
		}
		return fUrl;
	};
	//格式化为分页查询的url
	var formatQueryUrl = function(url) {
		// 分页查询
		return formatUrl('-',{query: 'pager'}, url);
	};
	
	// 分页控件
	var pager = function (element, options) {
		this.options  = null;
		this.$container = null;
		this.$page = null;
		this.init('pager', element, options);
	}
	//默认参数
	pager.DEFAULTS = {
		pageIndex:1, // 当前页码
		pageSize:20, // 每页显示记录数
		dataUrl:'', // 数据来源地址
		preRender:null, // 预处理函数
		renderData:null,  // render函数
		dataType:'jsonp',  // 数据来源格式
		type:'get',       // 请求方式
		selectClass:'cu',  //选中页码样式
		queryForm:null,	// form表单	
		recordCount:0,    // 记录条数
		pageCount:20,     // 页码排版显示多少页数 
		pageNumber:0,     
		pageWidth:220,    //  页码的排版的html长度
		isLimitShow:0,
		noPageClass:'unclickPage',
		template: '<div class="datPage"> '+
				  ' <div class="pageLnk"><a href="javascript:void(0)" class="prePage">上一页</a></div>'+
				  '	<div class="pageLnk pageSel"> <a href="javascript:void(0)" class="selPage" id="_pageIndex">第<em></em>页<i class="hbFntWes">&#xf0dd;</i></a>'+
				  '	  <div class="pagePos" style="display:none;" id="_pageContainer">'+
				  '   <div class="pagePosHd"><a href="javascript:void(0)" class="hbFntWes close">&#xf00d;</a></div>'+
				  '		<div class="arrL"><a href="javascript:void(0)"><i class="hbFntWes">&#xf053;</i></a></div>'+
				  '		<div class="lst">'+
				  '		  <div class="lstMove" style="width:352px;left:0;">'+
				  '		  </div>'+
				  '		</div>'+
				  '		<div class="arrR"><a href="javascript:void(0)"><i class="hbFntWes">&#xf054;</i></a></div>'+
				  ' 		<div class="clear"></div>'+
				  '	  </div>'+
				  '	</div>'+
				  '	<div class="pageLnk"><a href="javascript:void(0)" class="nextPage">下一页</a></div>'+
				  ' <div class="clear"></div>'+
				  ' </div>',
		 pageTemplete:'<li><a href="javascript:void(0);">20</a></li>'		  
	}
	pager.prototype.init = function (type, container, options) {
		// 初始化参数
		this.options  = this.getOptions(options);
		this.$container = $(container);
		this.$page = $(this.options.template);
		// 添加分页模板
		this.$container.append(this.$page);
		if(this.options.queryForm!=null) {
		   var form = document.getElementById(this.options.queryForm);
		   if(form) {
			    var query = function(obj){
					    // 绑定form表单提交
						return function(){
							var data = serialize(form),
							param = analysisParam('&',data,'=');
							obj.options.pageIndex = 1;
							obj.reset();
							obj.options.dataUrl = formatUrl('-',param,$(form).attr('action') || window.location.href);
							obj.doPager();							
					    };
					}(this);
			    var data = serialize(form),
					param = analysisParam('&',data,'=');
				this.options.dataUrl = formatUrl('-',param,$(form).attr('action') || window.location.href);
 			    $(form).submit(function(e) {
					// 取消form表单默认事件
					e.preventDefault();
					query();
				});	
		   }			
	    }
		this.initEvent();
		// 执行分页查询
		this.doPager();
	};
	
	// 获取总页数
	pager.prototype.getTotalPage = function() {
		 return Math.floor(this.options.recordCount%this.options.pageSize > 0 ? (this.options.recordCount/this.options.pageSize + 1) : (this.options.recordCount/this.options.pageSize));
	}	
	
	// 查询分页 
	pager.prototype.doPager = function() {
		var self = this;
		//执行预调函数
		if(typeof self.options.preRender == 'function') {
			self.options.preRender();
		}
		// 拼接url参数
		var url = self.options.dataUrl||formatQueryUrl(window.location.href),
		    param = {page:self.options.pageIndex,pageSize:self.options.pageSize,v:Math.random()};
		url = formatUrl('-',param,url);
        $.ajax(
        {
            url: url,
            type: self.type,
            async: true,
            dataType: self.options.dataType,
            success: function(result){
				// 执行成功
				self.options.recordCount = parseInt(result.recordCount||0);
				self.updatePager();
				if(typeof self.options.renderData == 'function') {
					self.options.renderData(result.list,self.getTotalPage(),self.options.recordCount);
			   }
			},
            error: function(result) {
				// 加载数据失败
				//alert('错误');
			}
        });

	};
	
	// 上一页 
	pager.prototype.prePage = function() {
		if(this.options.pageIndex <=1) {
			return;
	    }
		this.options.pageIndex-=1;
		this.doPager();
		this.$container.find('.pagePos').hide();
	}
	
	// 下一页
	pager.prototype.nextPage = function() {
		if (this.options.pageIndex >= this.getTotalPage()){
			return;
	    }
		this.options.pageIndex+=1;
		this.doPager();
		this.$container.find('.pagePos').hide();
	}
	// 当前页
	pager.prototype.currPage = function() {
		this.doPager();
		this.$container.find('.pagePos').hide();
	}
	pager.prototype.toPage = function(index) {
		this.options.pageIndex = index;
		this.doPager();	
		this.$container.find('.pagePos').hide();
    }
	
	pager.prototype.reset = function(index){
		 this.$container.find('.lstMove').empty();	
    }
	
	// 更新页面控件状态  
	pager.prototype.updatePager = function() {
		  var self  = this,
		      options = self.options;
		  self.$container.find('.lstMove li').removeClass(options.selectClass);	  
		  self.$container.find('.selPage em').html(options.pageIndex);
		  if(self.$container.find('.pageIndex a').length>0) {
			  return;
		  }
		  var total = self.getTotalPage();// 总页数 
		  if(self.$container.find('.lstMove').find('ul').length<=0) {		  	
			  var arr = new Array();
			  for(var i = 1; i<=total;i += 1) {
				  if(i==1){
					  arr.push("<ul>");  
				   }
				  arr.push('<li><a href="javascript:void(0)" page="'+i+'">'+i+'</a></li> ');  
				  if(i==total) {
					   arr.push("</ul>");
					   arr.push('<div class="clear"></div>');
					   break;
				  }
				  if(i%options.pageCount==0) {
					  arr.push("</ul><ul>");
				  }  
			  }	
			  self.$container.find('.lstMove').append(arr.join('')); 
		  }
		  
		 // 根据页数，显示/隐藏分页控件 
		 if(total<=self.options.isLimitShow) {
			// self.$page.css('visibility','hidden'); 
			 self.$page.hide(); 
		 }else {
			 //self.$page.css('visibility','visible');
			 self.$page.show();
		 }
		  if(self.options.pageIndex<=1) {
			  self.$container.find('.prePage').addClass(options.noPageClass);  
		  }else {
			  self.$container.find('.prePage').removeClass(options.noPageClass);
		  }	
		  
		  if(self.options.pageIndex>=total) {
			  self.$container.find('.nextPage').addClass(options.noPageClass);
		  }
		  else{
			  self.$container.find('.nextPage').removeClass(options.noPageClass);
		  }
		  var p =Math.floor(total%options.pageCount>0?total/options.pageCount+1:total/options.pageCount),
		  	  c = Math.floor(options.pageIndex%options.pageCount>0?(options.pageIndex/options.pageCount)+1:(options.pageIndex/options.pageCount));
		  self.$container.find('.arrL a').hide();
		  self.$container.find('.arrR a').hide();
		  if(p>1&&c<p) {
			  self.$container.find('.arrR a').show();
		  }
		  if(c>1) {
			  self.$container.find('.arrL a').show();
		  }	
		  self.options.pageNumber = c-1;
		  self.$container.find('.lstMove')
		  .css({left:-(c-1)*options.pageWidth,width:p*options.pageWidth})
		  .find('a[page="'+options.pageIndex+'"]').parent().addClass(options.selectClass);
	}
	
	//初始化事件
    pager.prototype.initEvent = function() {
		  var self  = this;
		  self.$container.find('.prePage').unbind('click').bind('click',$.proxy(self.prePage,self));
		  self.$container.find('.nextPage').unbind('click').bind('click',$.proxy(self.nextPage,self));
		  var a = function(obj) { 
		  			  return function() {
						     var o = obj.$container.find('.pagePos');
						  	 if(o.is(':visible')) {
								 o.hide();
							 }else {
								 o.show();	 
							 }
						   }
				  }(this);
		  self.$container.find('.selPage').click(a);
		  self.$container.find('.lstMove').unbind('click').bind('click',function(e) {
			   if($(e.target).is('a[page]')) {
				   var page = parseInt($(e.target).attr('page'));
				   self.toPage(page);
			   }
		  });
		 
		 self.$container.find('.arrL a').click(function() {	 
			 if((self.options.pageNumber-1)<=0){
				 $(this).hide();
			 }
			 self.$container.find('.arrR a').show();
			 self.options.pageNumber--;
			 self.$container.find('.lstMove').css('left',-self.options.pageNumber*self.options.pageWidth);
	     }); 
		 self.$container.find('.arrR a').click(function() { 
			 if((self.options.pageNumber+2)>=self.$container.find('.lstMove').find('ul').length){
				 $(this).hide();
			 }
			 self.options.pageNumber++;
			 self.$container.find('.arrL a').show();
			 self.$container.find('.lstMove').css('left',-self.options.pageNumber*self.options.pageWidth);
	     });
		 self.$container.find('.close').click(function() {
			  self.$container.find('.pagePos').hide();			 
		 });
		 $.concealElement(this.$container.find('.pagePos'),'_pageIndex','_pageContainer');	
    }
	//获取默认参数信息	
	pager.prototype.getDefaults = function () {
		return pager.DEFAULTS;
	};
	// 合并参数
	pager.prototype.getOptions = function (options) {
		options = $.extend({}, this.getDefaults(), options);
		return options;
	};
	
	//事件
	var old = $.fn.pager;
	$.fn.pager = function (option) {
		return this.each(function () {
			var $this   = $(this);
			var obj    = $this.data('bs.pager');
			var options = typeof option == 'object' && option;
			if (!obj) {
				$this.data('bs.pager', (obj = new pager(this, options)));
			}
			/*
			if (typeof option == 'string') {
			obj[option]();
			}*/
		});
	}
	$.fn.pageSize = function(){
		var pager = $(this).data('bs.pager');
		return pager.options.pageSize;
	};
	$.fn.refreshPage = function() {
		var pager = $(this).data('bs.pager');
		pager.currPage();
	}
	$.fn.pager.Constructor = pager;	
	// 冲突
	$.fn.pager.noConflict = function () {
		$.fn.pager = old;
		return this;
	}

}(window.jQuery);


