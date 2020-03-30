// JavaScript Document
 
define('product.jobSortActions',
function(require, exports, module){
 
	var $ = module['jquery'];
	//分类
	var side_menu = $("#job_filter_box");//多选父级		
		side_menu.find(".one_sort .mutil").click(function(){
			//多选
			var onesort = $(this).closest(".one_sort").removeClass("one_sort").addClass("many_sort");
				onesort.next(".actions-oper").show();
			
			onesort.find("li").each(function(){
				if($(this).find(".first").hasClass("cur"))$(this).find("a").addClass("cur");
				else $(this).find(".sub_link").removeClass("cur");
			});								
		});
		side_menu.find(".one_sort li").each(function(){
			checked($(this));
		});
	//更多筛选
	var filter_group = $("#filter_group");
		filter_group.find(".mutil").click(function(){
			//多选
			var _this = $(this),
				filter_menu = _this.closest(".filter_menu");					
				filter_menu.toggleClass("mutil_mode");
			
			if(!_this.get(0).bindClick)_this.get(0).bindClick = filter_menu.each(function(){checked($(this));});	
			
			if(_this.html().indexOf("多选") > -1){
				_this.html("回单选");
			}
			else _this.html('多选<i class="hbFntWes">&#xf067;</i>');			
						
		});
		filter_group.find(".filter_menu").hover(function(){
			$(this).addClass("filter_menu_select");
		},function(){
			$(this).removeClass("filter_menu_select");
		});
	//选中or取消
	function checked(_self){
		_self.find("a").click(function(){
			var _this = $(this),//当前
				_subSort = _self.find(".sub_sort"),//一级
				_sub_link = _self.find(".sub_link"); //二级
			
			if(_this.closest(".many_sort").length >= 1 || _this.closest(".mutil_mode").length >= 1){
				_this.toggleClass("cur");//选中或取消				
				_subSort.find(".first").removeClass("cur");
				//判断为一级
				if(_this.hasClass("sub_link")){
					 _this.hasClass("cur") ? _subSort.find("a").addClass("cur") : _subSort.find("a").removeClass("cur");
				}else{				
					//二级
					_subSort.find("a").length - _subSort.find(".cur").length == 1 ? _sub_link.addClass("cur") :	_sub_link.removeClass("cur");
				}
				return false;
			}
		});
	};		
	//提交、清除、取消
	var checkOper = {
		//提交
		submit:function(sortli){
			var _ArrVal = new Array();
			sortli.each(function(){
				var _this = $(this),_sub_link = _this.find(".sub_link"); //二级
				if(_sub_link.hasClass("cur")){						
					if(_this.parent(".first").length <= 0 && _sub_link.attr("data-value"))_ArrVal.push(_sub_link.attr("data-value"));
				}else{
					_this.find(".cur").each(function(){
						var _cur = $(this);
						if(!_cur.hasClass("first") && !_cur.hasClass("hide") && _cur.attr("data-value")){						
							_ArrVal.push(_cur.attr("data-value"));
						}
					});
				}
			});
			return _ArrVal;
		},
		//清除		
		remove:function(sortli){
			sortli.find(".cur").removeClass("cur");
		},
		//取消			
		cancel:function(sortli){
			sortli.find(".dft_checked").addClass("cur");
			sortli.each(function(){
				if($(this).find(".cur").length > 0)$(this).find(".sub_link").addClass("cur");
			});
			sortli.closest("td").find(".many_sort").addClass("one_sort").removeClass("many_sort").next(".actions-oper").hide();	
			sortli.parents(".filter_menu").removeClass("mutil_mode").find(".mutil").html('多选<i class="hbFntWes">&#xf067;</i>');		
		}
	};
	
	//招聘行业\工作地点\福利亮点 按钮操作
	$("#frmCalling,#frmArea,#frmReward,#filter_group .actions-oper").click(function(e){
		var _this = $(this),			
			sortli = _this.closest("td").find("li");
			if(_this.closest(".mutil_mode").length >= 1){
				sortli = _this.prev(".normal_list");
			}
		switch($(e.target).attr("data-type")){
			case "submit":
				var hid = _this.find(".many-hidden"),
					val = checkOper.submit(sortli);
				 if(val)hid.val(hid.attr("type-value")+val.join("_"));
				 else hid.remove();
				_this.closest("form").submit();
				break;
			case "remove":
				checkOper.remove(sortli);
				break;
			case "cancel":
				checkOper.remove(sortli);
				checkOper.cancel(sortli);
				break;
		}			
	});
});