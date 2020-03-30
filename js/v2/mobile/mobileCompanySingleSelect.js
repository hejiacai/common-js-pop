define('mobile.mobileCompanySingleSelect', function(require, exports, module){

	var $ = module['jquery'];
	var thirdSelect = {
		html:'<div class="selectParts" style="background:#fff;" id="thirdSelect">'
					+'<div class="selectMainTop">'
					+'<div class="psgSeekBg psgPrecise">'
						+'<span class="title"></span>'
						+'<a href="javascript:;" class="getBack icon-svg10" id="back"></a>'
						+'<a href="javascript:;" class="seekBtn" id="saveData">确定</a>'
					+'</div>'
					+'<div class="ptworkPlace" style="display:none">'
						+'<p>已选：</p>'
						+'<div id="hasSelected">'
						+'</div>'
					+'</div>'
					+'</div>'
					+'<ul class="psgMParts psgMPartsx" style="display:block; background:#fff;" id="mainData">'
					+'</ul>'
				+'</div>',
		loadinghtml:'<div id="thirdloading11"><div class="m_m_master" style="display:none;z-index:79;filter: alpha(opacity=10);opacity:0.1"></div>'
					+'<div class="juhua" style="display:none;z-index:80"><img src="//assets.huibo.com/img/m/new_person/loadingb.gif"></div></div>',
		selectDataName:[],
		selectMax:5,
		selectDataValue:[],
		dataCache:[],
		selectDataAll:[],
		dataurl:"",//post url
		param:"",//参数 不用
		bindValueElement:"",
		bindNameElement:"",
		tempdata:[],
		time:0,
		canEmpty:false,
		type:"multiple",  //multiple 多选  single 单选  未完成
		init:function(hasSelectData,title,dataurl,param,bindValueElement,bindNameElement,callBack){
			$("body").append(this.html);
			$("body").append(this.loadinghtml);
			this.bindHasSelect(hasSelectData,bindValueElement,bindNameElement);
			this.dataurl = dataurl;
			this.param = param;
			this.bindValueElement = bindValueElement;
			this.bindNameElement = bindNameElement;
			this.bindSelectData(dataurl,"");
			this.bindClick(callBack);
			$("#thirdSelect").find(".title").html(title);
			$("#thirdSelect").stop().animate({width:"100%"},200);
			$("#thirdSelect .selectMainTop").stop().animate({width:"100%"},200);
			//去掉页面的滚动条
		},
		showLoadingOne:function(z_index_m,z_index_j){
			if(z_index_m == undefined ||z_index_m ==""){
				z_index_m = 79;
			}
			if(z_index_j == undefined ||z_index_j ==""){
				z_index_j = 80;
			}
			$("#thirdloading11 .m_m_master").show().css({"z-index":z_index_m}); 
			$("#thirdloading11 .juhua").show().css({"z-index":z_index_j});
		},
		closeLoadingOne:function(){
			$("#thirdloading11 .m_m_master").hide();
			$("#thirdloading11 .juhua").hide();
		},
		bindClick:function(callBack){
				var _self = this;
			$("#thirdSelect #mainData .canClick").live("click",function(){
				var v = $(this).attr("data-value");
				_self.bindSelectData(_self.dataurl,v);
			});  
			//不限
			$("#thirdSelect #mainData .select_null").live("click",function(){
				var bindNameElement = _self.bindNameElement;
				var bindValueElement = _self.bindValueElement;
				$(bindValueElement).val($(this).attr("data-value"));
				 var name = $(this).html();
				$(bindNameElement).html(name).removeClass("green").addClass("gray");
				
				if(typeof(callBack) != "undefined"){
					callBack();
				}
				_self.destroy();
			});
			$("#thirdSelect #mainData .hasSelect").live("click",function(){
				var v = $(this).attr("data-value");
				var name = $(this).html();
				var isAll = $(this).attr("data-all");
			   
				$(this).removeClass("hasSelect").addClass("notSelect");
				$(this).parent("li").removeClass("cut");
				if(isAll ==1){
					//后面 所有的 都改变
					$(this).parent("li").siblings().removeClass("cut");
					$(this).parent("li").siblings().each(function(){
						$(this).find("a").addClass("notSelect");
					});
				}
				 _self.deleteData(v,name,isAll);
				_self.refreshTop(isAll,v);
		  });
		  $(".m_m_master").live("click",function(){
			  _self.closeLoadingOne();
		  })
		  $("#thirdSelect #mainData .notSelect").live("click",function(){
				if(_self.selectDataValue.length>=_self.selectMax){
					alert("最多只能选择"+_self.selectMax+"个");
					return;
				}
				var isAll = $(this).attr("data-all");
				var v = $(this).attr("data-value");
				var name = $(this).html();
			   
				$(this).parent("li").addClass("cut");
				$(this).removeClass("notSelect").addClass("hasSelect");
				if(isAll ==1){
					//后面 所有的 都改变
					$(this).parent("li").siblings().addClass("cut");
					$(this).parent("li").siblings().each(function(){
						$(this).find("a").removeClass("notSelect").removeClass("hasSelect");
					});
				}
				 _self.addData(v,name,isAll);
				_self.refreshTop(isAll,v);
	
		  });
		  $("#thirdSelect #hasSelected em").live("click",function(e){
			  e.preventDefault();
				var v = $(this).parent("span").attr("data-selectid");
				var name = $(this).parent("span").attr("data-selectname");
				//去掉对应的class
				var flag = false;
				$("#thirdSelect #mainData li a").each(function(){
					if($(this).attr("data-value")==v && $(this).attr("data-all")==1){
						flag = true;
						$(this).parent("li").removeClass("cut");
						$(this).removeClass("hasSelect").addClass("notSelect");
						return;
					}
					if($(this).attr("data-value")==v || flag == true){
						$(this).parent("li").removeClass("cut");
						$(this).removeClass("hasSelect").addClass("notSelect");
					}
				});
				var isAll = flag?1:0;
				  _self.deleteData(v,name,isAll);
				 _self.refreshTop(isAll,v);
		  });
		  //保存数据
		  $("#thirdSelect #saveData").live("click",function(){
			  var bindNameElement = _self.bindNameElement;
			  var bindValueElement = _self.bindValueElement;
			  if(_self.canEmpty){
			   
			  }else{
				if(_self.selectDataName.length<=0 || _self.selectDataValue<=0){
					alert("您还没有选择数据");return;
				}
			  }
			  $(bindValueElement).val(_self.selectDataValue.join(","));
			  $(bindNameElement).html(_self.selectDataName.join(",")).removeClass("gray").addClass("green");
				if(typeof(callBack) != "undefined"){
					callBack();
				}
			  _self.destroy();
		  });
		  $("#thirdSelect #back").live("click",function(){
			  
			  var data = _self.tempdata;
			  if(data.length==3){
					var v = data[1] =="top" ?"":data[1];
					_self.tempdata.pop();
				_self.bindSelectData(_self.dataurl,v);
			  }else if(data.length==2){
				  var v = data[0] =="top" ?"":data[0];
					_self.tempdata.pop();
				_self.bindSelectData(_self.dataurl,v);
			  }else if(data.length==1 || data.length==0){
				  _self.destroy();
			  }
		  });
		},
		deleteData:function(v,name,isAll){
			//删除 保存着的值
			if(isAll ==1){
				var s = "";
				if(v.indexOf("d")==0){
					s = v.slice(1,3);
				}else{
					s = v.slice(0,2);
				}
				var data = this.selectDataAll;
				var len = data.length;
				var delete_arr = [];
				for(var i=0;i<len;i++){
					var n = data[i].value.slice(0,2);
					if(data[i].value == v || n==s){
						delete_arr.push(data[i].value)
					}
				}
				for(var k =0;k<delete_arr.length;k++){
				   var index_v = this.selectDataValue.indexOf(delete_arr[k]);
					if(index_v>=0){
						this.selectDataValue.splice(index_v,1);
						 this.selectDataName.splice(index_v,1)
					}
					for(var m=0;m<data.length;m++){
						if(data[m].value==delete_arr[k]){
							data.splice(m,1);
						}
					}
				}
				this.selectDataAll  = data;
				
				var data_value = this.selectDataValue;
				for(var i =0;i<data_value.length;i++){
					var n = data_value[i].slice(0,2);
					if(data_value[i] ==v || n==s){
						this.selectDataValue.splice(i,1);
						this.selectDataName.splice(i,1);
					}
				}
				return;
			}
			
			var i = this.selectDataValue.indexOf(v);
			this.selectDataValue.splice(i,1);
			var k = this.selectDataName.indexOf(name);
			this.selectDataName.splice(k,1);
			var data = this.selectDataAll;
			for(var i=0;i<data.length;i++){
				if(data[i].value == v){
					data.splice(i,1);
				}
			}
			this.selectDataAll  = data;
		},
		addData:function(v,name,isAll){
		   if(isAll==1){
			   var s = "";
				if(v.indexOf("d")==0){
					s = v.slice(1,3);
				}else{
					s = v.slice(0,2);
				}
				var data = this.selectDataAll;
				var len = data.length;
				var delete_arr = [];
				for(var i = 0; i< len; i++){
					var n = data[i].value.slice(0,2);
					if (n == s){
					  delete_arr.push(data[i].value);
					}
				}
				for(var k =0;k<delete_arr.length;k++){
					var index_v = this.selectDataValue.indexOf(delete_arr[k]);
					var index_n = this.selectDataName.indexOf(delete_arr[k]);
					if(index_v>=0){
						this.selectDataValue.splice(index_v,1);
						this.selectDataName.splice(index_v,1)
					}
					for(var m=0;m<data.length;m++){
						if(data[m].value==delete_arr[k]){
							data.splice(m,1);
						}
					}
				}
				this.selectDataAll  = data;
		   }
			this.selectDataValue.push(v);
			this.selectDataName.push(name);
			var d = [];
			d['name'] = name;
			d['value'] = v;
			this.selectDataAll.push(d);
		},
		bindHasSelect:function(hasSelectData,bindValueElement,bindNameElement){
			var ids = $(bindValueElement).val();
			var names = $(bindNameElement).html();
			var id_arr = ids =="" ? [] :ids.split(",");
			var name_arr = names ==""?[] :names.split(",");
			var selectHtml = "";
			if(id_arr.length >0 && name_arr.length>0){
				for(var i =0;i<id_arr.length;i++){
					var d = [];
					d['name'] = name_arr[i];
					d['value'] = id_arr[i];
					this.selectDataAll.push(d);
					this.selectDataName.push(name_arr[i]);
					this.selectDataValue.push(id_arr[i]);
					selectHtml = selectHtml +'<span   data-selectname="'+name_arr[i]+'" data-selectid = "'+id_arr[i]+'">'+name_arr[i]+'<em class="icon-AI-_-24"></em></span>';
				}
				$("#thirdSelect #hasSelected").html(selectHtml);
				$("#thirdSelect .ptworkPlace").show();
			}
			
			var thirdHit=$("#thirdSelect .selectMainTop").height();
			$("#thirdSelect ul").css({"margin-top":thirdHit});
		},
		refreshTop:function(isAll,v){
			var selectHtml = "";
			var data =this.selectDataAll;
			if(data.length >0){
				for(var i =0;i<data.length;i++){
					selectHtml = selectHtml +'<span data-selectname="'+data[i].name+'" data-selectid = "'+data[i].value+'">'+data[i].name+'<em class="icon-AI-_-24"></em></span>';
				}
				$("#thirdSelect #hasSelected").html(selectHtml);
				$("#thirdSelect .ptworkPlace").show();
			}else{
				 $("#thirdSelect .ptworkPlace").hide();
			}
			var thirdHit=$("#thirdSelect .selectMainTop").height();
			$("#thirdSelect ul").css({"margin-top":thirdHit});
		},
		bindSelectData:function(url,value){
			var _self = this;
			var cache_key = "top";
			if(value !=""){
				cache_key = value;
			}
			var dataCache  =_self.dataCache;//获得缓存数据 如果已缓存 不必再post 访问
			var cacheData;
			for(var key in dataCache){
				if(key == cache_key){
					 _self.bindMainData(dataCache[key],value);
					return
				}
			}
			var p =this.param;
		   
			var data={p:value};
			//设置时间限制 如果访问超过多少秒 显示loading
			var t = setTimeout("thirdSelect.showLoadingOne()",1000);
			$.post(url,data,function(json){
				 clearInterval(t);
				 _self.closeLoadingOne();
				 _self.time = 0;
				if(json){
					_self.closeLoadingOne();
				}
				if(value==""){
					_self.addCacheData("top",json);
				}else{
					_self.addCacheData(value,json);
				}
			   
			   _self.bindMainData(json,value);
			},"json");
	//          $.ajax({
	//                url:url,
	//                data:data,
	//                type:"post",
	//                success:function(json){
	//                    if(flag){
	//                        _self.closeLoading();
	//                    }
	//                    if(value==""){
	//                        _self.addCacheData("top",json);
	//                    }else{
	//                        _self.addCacheData(value,json);
	//                    }
	//                   _self.bindMainData(json,value);
	//                },
	//                error:function(XMLHttpRequest, textStatus, errorThrown){
	//                     alert(XMLHttpRequest.status);
	//                        alert(XMLHttpRequest.readyState);
	//                        alert(textStatus);
	//                },
	//                datatype:"json"
	//            });
	
		},
		checkShowLoading:function(){
			this.time = this.time+1
			if(this.time >=3){
				 this.showLoading();
			}
		},
		bindMainData:function(data,value){
			if(value ==""){
				value ="top"
			}
			if(this.tempdata.length<=2){
				if(this.tempdata.indexOf(value) >=0){
				}else{
					this.tempdata.push(value);
				}
			}
			$("#thirdSelect #mainData").html("");
			var d = this.selectDataValue;
			var bindHtml = "";
			var isAll = data[0].isAll;
			var first = data[0].value;
			for(var i =0;i<data.length;i++){
				if(data[i].not_select){
					bindHtml = bindHtml + '<li><a href="javascript:;" class="select_null" data-value="'+data[i].value+'">'+data[i].label+'</a></li>';
				}else if(data[i].isNext){
					bindHtml = bindHtml + '<li><a href="javascript:;" class="canClick" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-svg15"></i></li>';
				}else{
					if(isAll == 1 && d.indexOf(first)>=0){
						if(data[i].isAll ==1){
							bindHtml = bindHtml + '<li class="cut"><a href="javascript:;" class="hasSelect" data-all="'+data[i].isAll+'" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-uniE602"></i></li>';
						}else{
							bindHtml = bindHtml + '<li class="cut"><a href="javascript:;" data-all="'+data[i].isAll+'" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-uniE602"></i></li>';
						}
						
					}else if(d.indexOf(data[i].value)>=0){
						bindHtml = bindHtml + '<li class="cut"><a href="javascript:;" data-all="'+data[i].isAll+'" class="hasSelect" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-uniE602"></i></li>';
					}else{
						bindHtml = bindHtml + '<li><a href="javascript:;" class="notSelect" data-all="'+data[i].isAll+'" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-uniE602"></i></li>';
					}
				}
			}
			$("#thirdSelect #mainData").html(bindHtml);
		},
		addCacheData:function(value,data){
			var d = this.dataCache;
			if(value ==""){
				d["top"]= data;
			}else{
				d[value]=data;
			}
		},
		destroy:function(){
			$("#thirdSelect").find(".title").html("");
			this.selectDataName = [];
			this.selectDataValue=[];
			this.dataCache=[];
			this.selectDataAll=[];
			this.tempdata=[];
			this.callback = "";
			this.canEmpty = false;
			this.time = 0;
			$("#thirdSelect #mainData .canClick").die();
			$("#thirdSelect #mainData .hasSelect").die();
			$("#thirdSelect #mainData .notSelect").die();
			 $("#thirdSelect #mainData .select_null").die();
			$("#thirdSelect #hasSelected em").die();
			$("#thirdSelect #saveData").die();
			$("#thirdSelect #back").die();
			$("#thirdSelect").remove();
			$("#thirdloading11").remove();
			$("#thirdloading11 .m_m_master").die();
		}
	};
	
	return thirdSelect;

});