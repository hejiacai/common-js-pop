/**
 *  jQuery  ui_listingshowlogic.js  
 *  Copyright (c)  ZhangYu
 */

(function($){
	var dataShow = function(element,options) {
		this.errorElement = null;
		this.dataLoadElement= null;
		this.dataShowElement =null;
		this.$element = null;
		this.$relatedElement = null;
		this.options = null;
		this.flag = null;
		this.init(element,options);	
    };

    dataShow.DEFAULTS = {
	   errorHtmlTemp:'<div class="datErr">'+
			         '	<p>咦！网络似乎不给力啊！<a href="javascript:location.reload();">手动刷新</a>试试</p>'+
			         '</div>',
	   errorHtmlName:'loadResumeErr',
	   dataLoadTemp:'<div class="datLoad" style="display:none;">'+
				    '   	<p class="load"></p> '+
				    '       <p>数据加载中...</p>'+
				    '</div>',
	   dataLoadName:'loadResume',
	   dataShowTemp:'<div class="dat"></div>',
	   shadeElement:'<div class="datRsmLoad" id="datRsmLoad">'+
				    ' <div class="datLoad" style="display:none;">'+
				    '   	<p class="load"></p> '+
				    '       <p>数据加载中...</p>'+
				    '</div>					  '+	   		   
				    '</div>',
	   shadeElementName:'_shadeElement',		   
	   dataShowName:'remData',
	   relatedElementName:'',
	   prepare:null
   };
    
   dataShow.prototype ={
	  init:function(element,options) {
		 var empty ={};
		 this.options = jQuery.extend(empty, this.DEFAULTS, options);
		 this.$element = $(element);
		 if($('#'+dataShow.DEFAULTS.errorHtmlName).length>0){
			 this.errorElement = $('#'+dataShow.DEFAULTS.errorHtmlName).hide();
		 }else {
			 this.errorElement = $(dataShow.DEFAULTS.errorHtmlTemp).appendTo(this.$element).attr('id',dataShow.DEFAULTS.errorHtmlName).hide();
		 }
		 /*
		 if($('#'+dataShow.DEFAULTS.dataLoadName).length>0){
			 this.dataLoadElement = $('#'+dataShow.DEFAULTS.dataLoadName).hide();
		 }else {
			 this.dataLoadElement = $(dataShow.DEFAULTS.dataLoadTemp).appendTo(this.$element).attr('id',dataShow.DEFAULTS.dataLoadName).hide();
		 }		 
		 if($('#'+dataShow.DEFAULTS.relatedElementName).length>0){
			 this.$relatedElement = $('#'+dataShow.DEFAULTS.relatedElementName).hide();
		 }else {
			 this.$relatedElement = {hide:function(){},show:function(){}}; 
		 }
		 */
		 if($('#'+dataShow.DEFAULTS.dataShowName).length>0){
			 this.dataShowElement = $('#'+dataShow.DEFAULTS.dataShowName).hide();
		 }else {
			 this.dataShowElement = $(dataShow.DEFAULTS.dataShowTemp).appendTo(this.$element).attr('id',dataShow.DEFAULTS.dataShowName).hide();
		 }
		 if($('#'+dataShow.DEFAULTS.shadeElementName).length>0){
			 this.shadeElement = $('#'+dataShow.DEFAULTS.shadeElementName).hide();
		 }else {
			 this.shadeElement = $(dataShow.DEFAULTS.shadeElement).appendTo(this.$element).attr('id',dataShow.DEFAULTS.shadeElementName).hide();
		 }		 
		 
	  },
	  hide:function() {
		   this.errorElement.hide();
		   this.dataShowElement.empty().hide();
		   this.shadeElement.hide();
		  // this.$relatedElement.hide();
		  // this.dataLoadElement.hide();
	  },
	  load:function(url,successCallback,errorCallback,beforeCallback,flag) {
		  if(typeof beforeCallback == 'function') {
			  beforeCallback();
		  }
		  /*
		  
		  this.dataShowElement.hide();
		  this.$relatedElement.hide();
		  this.dataLoadElement.show();
		  */
		  this.errorElement.hide();
		  var _h = this.dataShowElement.height();
		  this.shadeElement.find('.datErr').hide();
		  this.shadeElement.height(_h).show();
		  this.shadeElement.find('.datLoad').show();
		  var self = this;
		  $.ajax({
			  url:url,
			  dataType:"html",
			  success: function(remResult){
			  	  self.errorElement.hide();
			  	  self.shadeElement.find('.datLoad').hide();
			  	  if(self.flag!=null&& typeof flag !='undefined') {
			  		  if(self.flag==flag) {
			  			  self.dataShowElement.html(remResult).show(); 
			  		  }
			  	  }else {
			  		  self.dataShowElement.html(remResult).show(); 
			  	  }
			  	  if(typeof successCallback =='function') {
				  		successCallback();
				  }
			  	  self.shadeElement.hide();
			   },
			   error:function(httprequest, status, error) {
				   self.shadeElement.find('.datLoad').hide();
				   self.errorElement.show();
				   if(typeof errorCallback =='function') {
					   errorCallback();
				   } 
			  }
		 });
	  },
	  setFlag:function(flag) {
		  this.flag = flag;
	  }
   };
   var o = $.fn.datashow;
   $.fn.datashow = function (option) {
     return this.each(function () {
       var $this   = $(this);
       var data    = $this.data('bs.datashow');
       var options = typeof option == 'object' && option;
       if (!data) {
 		  $this.data('bs.datashow', (data = new dataShow(this, options)));
 	   }
       if (typeof option == 'string') {
 		  data[option]();
 	   }
     });
   };
   $.fn.loadData = function(url,successCallback,errorCallback,beforeCallback,flag) {
 		var datashow = this.data('bs.datashow');
		datashow.load(url,successCallback,errorCallback,beforeCallback,flag);
   };
   $.fn.setFlag = function(flag) {
		var datashow = this.data('bs.datashow');
		datashow.setFlag(flag);	    
   };   
   
   $.fn.hideControl = function() {
		var datashow = this.data('bs.datashow');
		datashow.hide();	    
   };
   $.fn.datashow.Constructor = dataShow;
   // 取消冲突
   $.fn.datashow.noConflict = function () {
     $.fn.datashow = o;
     return this;
   };      
})(jQuery);