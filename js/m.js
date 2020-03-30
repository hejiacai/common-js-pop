Array.prototype.contains = function(obj) { 
var i = this.length; 
while (i>=0) { 
	if (this[i] === obj) { 
		return true; 
	}
	i--; 
} 
return false; 
};

/*  
*　方法:Array.remove(v)  
*　功能:删除JavaScript数组元素.  
*　参数:值  
*　返回:在原JavaScript数组上修改JavaScript数组  
*/  
Array.prototype.remove=function(v)  {  
for(var i=0;i<this.length;i++)  {  
	if(this[i] == v) {   
	   while(i<this.length){
		  if(i==this.length-1) {
			  this.length-=1;
			  break;
		  }
		  this[i] = this[i+1]
		  i++; 
	   }  
	   break;
	}  
} 
};

/**
 * 时间类
 */
var timeUtil = {
		/**
		 *  @description  计算时间的间隔月
		 *  @param  begin_date  开始时间
		 *  @param  end_date    结束时间  
		 *  @retrun int
		 */
		date_diff_month:function(begin_date,end_date){
			var sTime,eTime;
			if(typeof(begin_date)=='undefined') {
				sTime = new Date();
		    }
			else if(typeof(begin_date)=='string') {
				sTime = new Date(begin_date.replace(/\-/g, "/"));
			}else{
				sTime = begin_date;
			}
			if(typeof(end_date)=='undefined') {
				eTime = new Date();
		    }
			else if(typeof(end_date)=='string') {
				eTime = new Date(end_date.replace(/\-/g, "/"));
			}else{
				eTime = end_date;
			}
			var diffmonth = (eTime.getFullYear()*12+eTime.getMonth()+1)-(sTime.getFullYear()*12+sTime.getMonth()+1);
			return diffmonth;	
		}
};

$(document).ready(function() {
	jQuery.focusblur = function(focusid){
		var focusblurId = $(focusid);
		var defval = focusblurId.val();
		focusblurId.focus(function(){
			var thisval = $(this).val();
			//$(this).addClass('focus').removeClass('textGray');
			$(this).siblings('label.txtLabel').css({'display':'none'});
			$(this).addClass('focus');
/*			if(thisval==defval){
				$(this).val("");
			}*/
		});
		focusblurId.blur(function(){
			var thisval = $(this).val();
			if(thisval==""){
/*				$(this).val(defval);*/
				//$(this).addClass('textGray');
				$(this).siblings('label.txtLabel').css({'display':'block'});
			}
			$(this).removeClass('focus');
		});
	};
	
	jQuery.focusColor = function(focusid){
		var focusElemId = $(focusid);
		focusElemId.focus(function(){
			$(this).addClass('focus');
		}).blur(function(){
			$(this).removeClass('focus');
		});
	};
	
	jQuery.focusDate = function(focusid){
		var focusElemId = $(focusid);
		focusElemId.find('input.text').focus(function(){
			var focusThis = $(this).parents(focusid);
			focusThis.addClass('dateTextShow');
		}).blur(function(){
			var focusThis = $(this).parents(focusid);
			focusThis.removeClass('dateTextShow');
		});
	};
	
	jQuery.logBox = function(lgLnk,lgBox,content,closeLog,usId,regBtn,regBox,closeReg){
		var login = $(lgLnk), 
			othEle = $(content),
			lgBox = $(lgBox),
			closeLog = $(closeLog),
			usId = $(usId),
			regBtn = $(regBtn),
			regBox = $(regBox),
			closeReg = $(closeReg);
		login.bind("click",function(){
			othEle.css({'display':'none'});
			lgBox.css({'display':'block'});
		});
		closeLog.bind("click",function(){
			lgBox.css({'display':'none'});
			othEle.css({'display':'block'});
			
		});
		
		regBtn.bind("click",function(){
			lgBox.css({'display':'none'});
			othEle.css({'display':'none'});
			regBox.css({'display':'block'});
		});
		closeReg.bind("click",function(){
			regBox.css({'display':'none'});
			othEle.css({'display':'block'});
		});
		
		
		$.focusblur('input.text');
	};
	
	
	jQuery.srcBox = function(content,scrBtn,scrBox,srcBoxLst){
		var scrBtn = $(scrBtn);
		var scrBox = $(scrBox);
		var content = $(content);
		var srcBoxLst = $(srcBoxLst);
		var dHt = $(document).height();
		var dWt = $(document).width();
		var wWt = $(window).width();
		var wHt = $(window).height();
		scrBox.css({'min-height':dHt});
		scrBtn.bind("click",function(){
			scrBox.animate({'width':'100%'},100);
			var closeSrcBtn = scrBox.find('div.closeSrc');
			scrBox.find('div.closeSrc').css({'position':'fixed'});
			srcBoxLst.css({'min-height':dHt});
			closeSrcBtn.find('i').animate({'width':'50px'},{ queue: false, duration: 100 });
			closeSrcBtn.bind('click',function(){
				scrBox.animate({'width':'0'},{ queue: false, duration: 100 });
				$(this).find('i').animate({'width':0},{ queue: false, duration: 100 });
				$(this).css({'position':'absolute'})
			});
		});
		srcBoxLst.find('.bd').find('dt').click(function(){
			if($(this).siblings('dd').is(":visible")==false){
				srcBoxLst.find('dl dd').css({'display':'none'});
				$(this).siblings('dd').css({'display':'block'});
			}else{
				srcBoxLst.find('dl dd').css({'display':'none'});
			}

			
		});
	};

});