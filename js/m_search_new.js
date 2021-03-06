//缓存数据
function memorize(f){
	var cache = {};
	return function(){
		//将实参转换为字符串形式，并将其用做缓存的键
		//var key = arguments.length + Array.prototype.join.call(arguments,",");
		var key = arguments[0].data;
		if(arguments[0].setdata){
			cache[key] = arguments[0].setdata;
			return cache[key];
		}
		else if(key in cache){
			arguments[0].succCallback && arguments[0].succCallback(cache[key]);
			return cache[key];
		}
		else{
			cache[key] = f.apply(this,arguments);
			return cache[key];
		}
	}
}
//数据模版
function formatTemplate(dta, tmpl) {
	var format = {
		name: function(x) {
			return x
		}
	};
	return tmpl.replace(/{(\w+)}/g, function(m1, m2) {
		if (!m2)
			return "";
		return (format && format[m2]) ? format[m2](dta[m2]) : dta[m2];
	});
}
//获取ajax请求数据
function ajaxJson(parameter_josn){
	var arr = [];
	$.ajax({
		 type: "post",
		 url: parameter_josn.url,
		 async: false,
		 data:  parameter_josn.data,
		 dataType: "json",
		 success: function(data){
		 //对数据进行遍历
			 if(data.length)data[0]['label'] = "（全部）" + data[0]['label'];
			 $.each(data, function(i, o) {
			 //这里取到o就是上面data的值, formatTemplate是最开始定义的方法.
				 if(i == 0){
					 arr.push(formatTemplate(o,  parameter_josn.datahtml.replace("icon-svg122","icon-AI-_-12")));
				 }else{
					 arr.push(formatTemplate(o,  parameter_josn.datahtml));
				 }

			 });
			 parameter_josn.succCallback && parameter_josn.succCallback(arr.join(''));
			return arr.join('');
		 }
	 });
	return arr.join('');
}
function span_move_fun(){
	var left_bar_box = $('.left-bar-box');
	// var left_money = left_bar_box.find('.mouse-bar .bar-money').attr('left_money');
	// left_money = left_money ? left_money : 1000;
	var right_bar_box = $('.right-bar-box');
	// var right_money = right_bar_box.find('.mouse-bar .bar-money').attr('right_money');
	// right_money = right_money ? right_money : 30000;
	
	// console.log(left_money,right_money)

	// var def_left_width = left_bar_box.width(),def_right_width=right_bar_box.width()
	// console.log(def_left_width,def_right_width)
	var def_left_width = 0,def_right_width = 0;
	var left_money = 1000,right_money = 30000;
	var start_left = 0;
	var move_left = 0;
	var chend_left = 0;
	var allwidth = $(".more-progressbar").width()||325;

	document.addEventListener('touchstart', function(event) {
		if (event.targetTouches.length == 1) {
			//薪资区间
			var eventTarget = $(event.target);
			if(eventTarget.parent(".mouse-bar").length || eventTarget.hasClass("mouse-bar")){
				// event.preventDefault();
				event.stopPropagation();
				var touch = event.targetTouches[0];
				start_left = touch.pageX;
				def_left_width = $(".left-bar-box").width(); //0
				def_right_width = $(".right-bar-box").width();
				left_money = left_bar_box.find('.mouse-bar .bar-money').attr('left_money');
				right_money = right_bar_box.find('.mouse-bar .bar-money').attr('right_money');
			}
			// else{
			// 	event.preventDefault();
			// }
		}
	}, { passive: false });
	document.addEventListener('touchmove', function(event) {
		var eventTarget = $(event.target);
		if (event.targetTouches.length == 1) {
			if(eventTarget.parent(".mouse-bar").length || eventTarget.hasClass("mouse-bar")) {
				event.preventDefault();
				event.stopPropagation();
				var touch = event.targetTouches[0];
				move_left = touch.pageX;
			}
		}
		if(start_left && move_left){
			if(eventTarget.parent(".mouse-bar").length){
				var eventTarget = $(event.target);
				eventTarget = eventTarget.parent(".mouse-bar");
			}
			var leftBar = eventTarget.parent(".left-bar-box");
			var rightBar = eventTarget.parent(".right-bar-box");
			if(leftBar.length){
				var self_width = move_left - start_left + def_left_width;
				left_money = (parseInt(self_width / (allwidth / 29)) * 1000 + 1000);
				if(left_money >= 30000 || left_money < 1000 || left_money >= right_money) return;
                if((self_width + $(".right-bar-box").width())+3 >= allwidth) return;
				leftBar.css("width",self_width);
				leftBar.find(".bar-money").html((left_money)+'<i class="icon--017"></i>');
				leftBar.find(".bar-money").attr('left_money',left_money);
				$("#moreInterval").find(".js_leftMoney").html(left_money);
                // console.log("left___allwidth:"+allwidth+"_____"+   +":"+ (start_left - move_left + def_right_width));
			}
			else if(rightBar.length){
				var self_width = start_left - move_left + def_right_width;
				right_money = (30000 - parseInt(self_width / (allwidth / 29)) * 1000);

				if(right_money > 30000 || right_money <= 1000  ||  right_money <= left_money ) return;
                if((self_width + $(".left-bar-box").width())+3 >= allwidth) return;
                //if(self_width + $(".left-bar-box").width() ) return;
				rightBar.css("width",self_width);
				rightBar.find(".bar-money").html((right_money)+'<i class="icon--017"></i>');
				leftBar.find(".bar-money").attr('right_money',right_money);
               $("#moreInterval").find(".js_rightMoney").html(right_money);
			}
		}

	}, { passive: true });
	document.addEventListener('touchend', function(event) {
		var touch = event.changedTouches[0];
	});

}
span_move_fun();

/*快速筛选*/
$("#newFastSelect").click(function(){

	var _self = $(this);
	if(_self.hasClass('cut')){
		newAllSelect.closeDialog(_self,"selectFast");
	}else{
		newAllSelect.init(_self,"selectFast",315);
		if(!_self[0].bindClick)
			_self[0].bindClick = newAllSelect.fastBindClick();
	}
});
/*地区筛选*/
$("#newAddressSelect").click(function(){
	var _self = $(this);
	if(_self.hasClass('cut')){
		newAllSelect.closeDialog(_self,"selectAddress");
	}else{
		newAllSelect.init(_self,"selectAddress",800);
		if(!_self[0].bindClick)
			_self[0].bindClick = newAllSelect.addressBindClick();
	}
});
/*更多筛选*/
$("#newMoreSelect").click(function(){
	var _self = $(this);
	if(_self.hasClass('cut')){
		newAllSelect.closeDialog(_self,"selectMore");
	}else{
		newAllSelect.init(_self,"selectMore",800);
		if(!_self[0].bindClick)
			_self[0].bindClick = newAllSelect.moreBindClick();
	}
	var allwidth = $(".more-progressbar").width();
	var leftVal = $("#salary_min").val();
	var rightVal = $("#salary_max").val();
	if(leftVal && leftVal != 1000)
		$("#selectMore .left-bar-box").css("width",(parseInt((allwidth / 29)) * leftVal) / 1000);
	if(rightVal)
		$("#selectMore .right-bar-box").css("width",(parseInt((allwidth / 29)) * (30000 -rightVal)) / 1000);
});
/*发布时间筛选*/
$("#newPutTimeSelect").click(function(){
	var _self = $(this);
	if(_self.hasClass('cut')){
		newAllSelect.closeDialog(_self,"selectPutTime");
	}else{
		newAllSelect.init(_self,"selectPutTime",162);
		if(!_self[0].bindClick)
			_self[0].bindClick = newAllSelect.putTimeBindClick();
	}
});
/*类别筛选*/
$("#coloe_more").click(function(){
	newAllSelect.closeDialog(null,"selectType");
	$('#more_header').hide();
	return false;
});
var TypeSelectCot = 0;
$("#newTypeSelect").click(function(){
	$('#more_header').show();
	var _self = $(this), gethtml = memorize(ajaxJson);
	if(_self.hasClass('cut')){
		newAllSelect.closeDialog(_self,"selectType");
	}else{
		newAllSelect.init(_self,"selectType",800);
        if(!_self[0].bindClick){
			_self[0].bindClick = newAllSelect.typeBindClick(gethtml);
		}
	}
	//
	if(TypeSelectCot) return false;
	var _selfBox = $("#selectType .one-hover"),
		_selfoneBox = _selfBox.find(".jobtype-one");

	_selfoneBox.after(
		gethtml({
			url: _glo_serv_name +"/datasourse/getJobSortData",
			data:"p="+_selfoneBox.find("a").attr("data-value"),
			datahtml:'<p class="jobtype-two"><a href="javascript:;" data-value="{value}"><i class="icon-svg132"></i><i class="icon-svg122"></i><i class="icon--023"></i>{label}</a></p>'
		})
	);
	//数据请求成功后
	function succCallback(){
		var second_jobsort = $('input[name="jobsort_second"]').val();
		if(second_jobsort){
			_selfBox.find(".jobtype-two").each(function(){
				var _twoSelf = $(this),_twoSelfa = _twoSelf.find("a");
				if(_twoSelfa.attr("data-value") === second_jobsort){
					_twoSelf.addClass("two-hover").find(".icon-svg132").hide();
					_twoSelf.after('<div class="jobtype-three">'+gethtml({
						url: _glo_serv_name +"/datasourse/getJobSortData",
						data:"p="+_twoSelfa.attr("data-value"),
						datahtml:'<a href="javascript:;" data-value="{value}">{label}</a>'
					})+'</div>');
					var treen = $("input[name=jobsort_thride]").val();
					if(treen){
						_twoSelf.next(".jobtype-three").find("a[data-value="+treen+"]").addClass("cur");
					}else{
						_twoSelf.next(".jobtype-three").find("a").eq(0).addClass("cur");
					}
				}
			});
		}else{
			_selfBox.find(".jobtype-two").eq(0).addClass("two-hover").find(".icon-svg132").hide();
		}
		//把获取并添加选中样式的html添加到dom结构中
		TypeSelectCot = 1;
	};
	succCallback();
});
/*公用部份*/
var newAllSelect = {
	init:function(obj,idName,height){
		$(".m_master").click().show();
        var phoneHeight = $(window).height();
		if(idName !== "selectType"){
			phoneHeight = phoneHeight - 80;
		}else{
			phoneHeight = phoneHeight - 45;
			$("#newHeader .headNew").css({"z-index":56});
		}
        if(idName === "selectAddress"){
			$("#"+idName).find(".address-item,.address-two").css({"height":phoneHeight});
		}else{
			$("#"+idName).find(".js-scroll,.list").css({"height": (idName !== "selectType" ? (phoneHeight - 60) : phoneHeight),"overflow-y":"scroll","overflow-x":"hidden"});
		}
		$("#"+idName).stop().animate({"height":phoneHeight},200).find(".selectBox-btn").show();
		$("body").css({"height":$(window).height(),"overflow-y":"hidden"});
		obj.find("i").length && obj.find("i").addClass("icon-svg132").removeClass("icon-svg122");

		$(".psgExact").addClass("searchMainPop");
		$(".searchMainTop .newSchbg").hide();
		$(".searchMainTop .crumbs").hide();
		$(".headerTop").hide();


		//改变点击的样式
		obj.addClass("cut");
		//点击隐藏关闭
		newAllSelect.masterClick();
	},
	masterClick:function(obj,idName){
		$(".m_master").bind("click",function(){
			newAllSelect.closeDialog();
		});
	},
	closeDialog:function(obj,idName){
		$("#selectFast,#selectAddress,#selectPutTime,#selectMore,#selectType").css({"height":"0px"}).find(".selectBox-btn").hide();
		$("#newHeader .headNew").css({"z-index":10});
		$(".m_master").unbind().hide();
		$("body").css({"height":"auto","overflow-y":"auto"});
		if(index.isScrolling==false){
			//添加
			$(".psgExact").removeClass("searchMainPop");
			$(".searchMainTop .newSchbg").show();
			$(".searchMainTop .crumbs").show();
			$(".headerTop").show();
		}
		$(".psgExact").find("a").removeClass("cut").find("i").addClass("icon-svg122").removeClass("icon-svg132");
        $("#newTypeSelect").removeClass("cut");
		$(".showLoginAndRegister").remove();
		$('.psgExact').removeClass('searchMainPop');
		$('.psgMate').not('#selectType').hide();
		console.log('去类名')
		$('#selectType').removeClass('show');
	},
	addressBindClick:function(){
		//绑定默认值
		var hddCurAddress = $("#hddCurAddress");
		var default_value = hddCurAddress.val();
		var selectAddress = $("#selectAddress");
		var gethtml = memorize(ajaxJson);

		var singal_value = $("#hddCurAddress");

		selectAddress.find(".address-one a").bind("click",function(){
			//选择后
			$(this).parent(".address-one").addClass("address-cur").siblings().removeClass("address-cur");
			var select_v = $(this).attr("data-value")+"&M_type=2";
			//选中第一项筛选当前全部地区 --》直接跳转
			if($(this).closest(".address-one").index() == 0){
				$('#hddCurAddress').val('');
				//var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");			
				window.location.href = $(this).attr("data-url");
				return false;
			}		
			//选中 全重庆 发起请求
			if(!select_v){
				$('#hddCurAddress').val('');
				var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");
				window.location.href = url;
			}else{
				//数据请求成功后
				function succCallback(self_html){

					//如果没有获取的二级地区时 20170410省外市场
					if(self_html.split("<a").length <= 2){
						$('#hddCurAddress').val(select_v);
						var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");
						window.location.href = url;
						return;
					}
					//把已选择的添加选中样式
					var defValue_arr = default_value.split(",");
					for(var idata in defValue_arr){
						if(defValue_arr[idata].length > 1 && self_html)self_html = self_html.replace('"'+defValue_arr[idata]+'"','"'+defValue_arr[idata]+'"'+' class="cur"');
					}
					//把获取并添加选中样式的html添加到dom结构中
					selectAddress.find(".address-two").html(self_html);
				}
				//获取请求数据
				gethtml({
					url: _glo_serv_name +"/datasourse/getMoreArea/can_not_select-area",
					data:"p="+select_v,
					datahtml:'<a href="javascript:;" data-all="{isAll}" data-value="{value}">{label}<i class="icon-uniE602"></i></a>',
					succCallback:succCallback
				});				
				return false;
			}

		});
		selectAddress.find(".address-two").on("click","a",function(){
            //var select_v = $(this).attr("data-value");
			singal_value = $(this).attr("data-value");
            if($(this).hasClass("cur")){
                //default_value = default_value.replace(","+select_v,"");
				$('#hddCurAddress').val('');
            }else{
				//判断是否满5个
				/*var last_param = hddCurAddress.val();
				if(last_param){
					last_param = last_param.replace(/^,/,function(world){return '';});
					var last_arr = last_param.split(',');
					if(last_arr.length >= 5){
						alert('已满5个，请不要超过5个');
						return false;
					}
				}*/

				//default_value = default_value+","+select_v;
				//hddCurAddress.val(default_value);//赋值
				//var last_param = hddCurAddress.val();
				//last_param = last_param.replace(/^,/,function(world){return '';});
				$('#hddCurAddress').val(singal_value);
				var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");
				window.location.href = url;
            }
			return false;
		});
		//清空条件
		/*selectAddress.find(".clearSubmit").bind("click",function(){
			default_value = "";
			hddCurAddress.val("");
			selectAddress.find(".address-two a").removeClass("cur");
			return false;
		});*/
		//提交
		/*selectAddress.find(".otherSubmit").bind("click",function(){
			var last_param = hddCurAddress.val();
			last_param = last_param.replace(/^,/,function(world){return '';});
			alert(last_param);
			$('#hddCurAddress').val(last_param);
			var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");
			//window.location.href = url;
			return false;
		});*/
		return true;
	},
	fastBindClick:function(){
		var selectFast = $("#selectFast");
		selectFast.find("a").bind("click",function(){
			//选择后
			$(this).toggleClass("cut");
            var select_v = [];
			selectFast.find(".cut").each(function(){
                select_v.push($(this).attr("data-value"));
            });
			//赋值
			if(!$(this).hasClass('cut'))
				$('#'+$(this).attr('data-input-id')).val('');
			else
				$('#'+$(this).attr('data-input-id')).val($(this).attr('data-value'));

		});
		//清空条件
		selectFast.find(".clearSubmit").bind("click",function(){

			selectFast.find("a").removeClass("cut");
			//清掉值
			$('#hight_repaly').val('');
			$('#urgent').val('');
			$('#famous_c').val('');
			$('#reApplyType').val('');
			$('#no_peixun').val('');
			$('#no_daizhao_zj').val('');

			return false;
		});
		//提交
		selectFast.find(".otherSubmit").bind("click",function(){

			var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");
			window.location.href = url;
			return false;
		});
		return true;
	},
	moreBindClick:function(){
       // span_move_fun();
		var input_id_name = ['rewardValue','workyearValue','studyLev','sizeValue','propertyValue'];
		var selectMore = $("#selectMore");
		selectMore.find(".more-label a").click(function(){
			var _self = $(this), curIndex = selectMore.find(".more-label").index(_self.closest(".more-label"));
			if(curIndex != 0 && curIndex != 4){
				_self.siblings().removeClass("cur");
			}
			_self.toggleClass("cur");

			//赋值
			selectMoreClickToVal(input_id_name);

            return false;
        });
		//清空条件
		selectMore.find(".clearSubmit").bind("click",function(){
			selectMore.find(".left-bar-box").width("0px").find(".bar-money").html('1000<i class="icon--017"></i>');
			selectMore.find(".right-bar-box").width("0px").find(".bar-money").html('不限<i class="icon--017"></i>');
			selectMore.find("a").removeClass("cur");

			//清值
			$('#salary_min').val('');
			$('#salary_max').val('');
			$('.js_leftMoney').text('1000');
			$('.js_rightMoney').text('不限');
			for(var i = 0;i< input_id_name.length;i++){
				$('#'+input_id_name[i]).val('');
			}

			return false;
		});
		//提交
		selectMore.find(".otherSubmit").bind("click",function(){
			selectMoreClickToVal(input_id_name);

			var url = urlrule.init("#jobForm","search/searchdo/",_glo_serv_name +"/");
			window.location.href = url;
			return false;
		});
		function selectMoreClickToVal(input_id_name){
			// 最小值，最大值
			if($('.js_leftMoney').text() == 1000 && $('.js_rightMoney').text() == '不限'){
				$('#salary_min').val('');
				$('#salary_max').val('');
			}else{
				$('#salary_min').val($('.js_leftMoney').text());
				$('#salary_max').val($('.js_rightMoney').text() == '不限' ? '':$('.js_rightMoney').text());
			}
			
			for(var i = 0;i< input_id_name.length;i++){
				var par = $('.'+input_id_name[i]).children('a.cur');
				var val = new Array();
				for(var b = 0;b < par.length;b++){
					val.push($(par[b]).attr('data-value'));
				}

				$('#'+input_id_name[i]).val(val.join(','));
			}
		}
		return true;
	},
    typeBindClick:function(memorize){
        var gethtml = memorize;
		var selectType = $("#selectType");
		var hddCurType = $("#hddCurType");
		var default_value = hddCurType.val();//已选中
        //一级菜单
        selectType.find(".jobtype-one").bind("click",function(){

			//点击 职位类别不限 直接请求
			if($($(this).children()[0]).attr('data-value') == '')
			{
				$('#jobsortValue').val('');
				var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");
				window.location.href = url;
				return false;
			}

			var _self = $(this),_selfParent =  _self.parents(".jobtype-box");
            if(_selfParent.hasClass("one-hover")){
                _selfParent.removeClass("one-hover").find(".jobtype-three").hide();
                return false;
            }
			selectType.find(".jobtype-three").hide();
            //选择后
            _selfParent.addClass("one-hover").siblings().removeClass("one-hover");
			_selfParent.find(".two-hover").next(".jobtype-three").show();
            if(_self[0].bindDate || _selfParent.find(".jobtype-two").length){
                return false;
            }
            var select_v = _self.find("a").attr("data-value");
			_self[0].bindDate = true;
            //获取请求数据

			_self.after(
				gethtml({
					url: _glo_serv_name +"/datasourse/getJobSortData",
					data:"p="+select_v,
					datahtml:'<p class="jobtype-two"><a href="javascript:;" data-value="{value}"><i class="icon-svg132"></i><i class="icon-svg122"></i><i class="icon--023"></i>{label}</a></p>'
				})
			);
            return false;
        });
        //二级菜单
        selectType.on("click",".jobtype-two",function(){
			var _first_value = $($($(this).parent().children()[1]).children()[0]).attr('data-value');
			var _this_value = $($(this).children()[0]).attr('data-value');

			//点击第一个发起请求
			if(_first_value == _this_value){
				$('#jobsortValue').val(_this_value);
				$('#txtKeyword').val('');
				var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");
				window.location.href = url;
				return false;
			}

			var _self = $(this);
            selectType.find(".jobtype-three").hide();

			var select_v = _self.find("a").attr("data-value");
            if(_self.hasClass("two-hover")){
                _self.removeClass("two-hover");
				//default_value = default_value.replace(","+select_v,"");
				//hddCurType.val(default_value);//赋值
                return;
            }
            //选择后
			selectType.find(".two-hover").removeClass("two-hover");
            _self.addClass("two-hover");

            if(_self[0].bindDate){
                _self.next(".jobtype-three").show();
                return;
            }

			//数据请求成功后
			function succCallback(self_html){
				_self[0].bindDate = true;
				//把获取并添加选中样式的html添加到dom结构中
				_self.after('<div class="jobtype-three">'+self_html+'</div>');
			}
			//获取请求数据
			gethtml({
				url: _glo_serv_name +"/datasourse/getJobSortData",
				data:"p="+select_v,
				datahtml:'<a href="javascript:;" data-value="{value}">{label}</a>',
				succCallback:succCallback
			});

        });
        //三级菜单
        selectType.on("click",".jobtype-three a",function(){
			$('#jobsortValue').val($(this).attr('data-value'));
			$('#txtKeyword').val('');
			var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");
			//console.log(url);return false;
			window.location.href = url;
			return false;
        });
        return true;
    },
	putTimeBindClick:function(){
		var default_value = $("#refreshtype").val();
		var selectPutTime = $("#selectPutTime");
		selectPutTime.find("a").each(function(){
			var v = $(this).attr("data-value");
			if(parseInt(v)==parseInt(default_value)){
				$(this).addClass("cut");
			}
		});
		selectPutTime.find("a").bind("click",function(){
			//选择后
			$(this).addClass("cut");
			$(this).siblings().removeClass("cut");
			var select_v = $(this).attr("data-value");
			$("#refreshtype").val(select_v);//赋值
			//点击后开始提交
			var url = urlrule.init("#jobForm","search/searchdo/", _glo_serv_name +"/");
			window.location.href = url;
		});
		return true;
	}
};

