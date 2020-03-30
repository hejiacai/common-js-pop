var page = getCookie('joblist_page') ? parseInt(getCookie('joblist_page')) : 1;
var total_page=1;

$('#doSearch').click(function () {
        $.post("/job/SearchStatistics/",{},function(){},'json');
        window.location.href = mjianzhi_url+"/job/partjoblist?from=search";
    })
//ajax请求
    var ajax_page_requist={
    	url : php_page_url ,
        init:function(){
            var doc = $(document),
                    win = $(window),
                    isLoadScroll = false;

            //page = {/$cur_page/};
            //url = page_url;
            content_last = '';//反正重复请求的数据加载
            is_do = false;//一旦触发，is_do 锁住 ,保证逻辑不被并发,及保证请求完第2页后才请求第3页，这样,,,（避免重复请求，避免一次下滑多次触发导致page到最后，而页面显示不完整数据（网络卡，刷新过快））
            win.on('scroll', function() {
            	
                if(is_do){
                    return false;
                }else{
                    is_do = true;
                }
                var c = doc.scrollTop() + win.height() >= doc.height() - 50;
                if(c && !isLoadScroll){
                    $(".loading").show();
                    if((total_page-page)<=0){
                        isLoadScroll = false;//每次都提示
                        $(".loading").html(" <span style='color:black;font-size: 14px;'>到底了,没有更多数据了</span>");
                        setTimeout("$(\".loading\").hide()",1500);
                        //解锁
                        is_do = false;
                        return false;
                    }
                    
                    //开始滚动
                    $.getJSON(mjianzhi_url+'/job/getJobListAjax/page-' + (1 + page) + ajax_page_requist.url, function (e) {
                        if(content_last != e.message)
                        {
                            $("#jobList").append(e.message);
                            content_last = e.message;
                        }
						
                        page++;
						
                        //停止滚动
                        setTimeout('$(".loading").hide();',1000);
                        //解锁
                        is_do = false;
                    });
                }else{
                    //解锁
                    is_do = false;
                }

            });
        }
    };
    
	$.getJSON(mjianzhi_url+'/job/getJobListAjax/page-' + 1 + ajax_page_requist.url, function (e) {
				$("#jobList").html(e.message)
				$('.loading-mask').remove()
				total_page=e.totalPage;
		})

	
	//当有cookie时，获取li
//	!(function(){
//		if(!getCookie('joblist_page')){
//			
//			//没有cookie时打开页面初始化
//			
//			$.getJSON(mjianzhi_url+'/job/getJobListAjax/page-' + 1 + ajax_page_requist.url, function (e) {
//				$("#jobList").html(e.message)
//				$('.loading-mask').remove()
//				total_page=e.totalPage
//			})
//	        
//		}else{
//			var text="";
//			
//			$.ajaxSettings.async = false;
//			for(var i=1;i<=Math.min(5,getCookie('joblist_page'));i++){
//				$.getJSON(mjianzhi_url+'/job/getJobListAjax/page-' + i + ajax_page_requist.url, function (e) {
//					text+=e.message
//                  total_page=e.totalPage
//				})
//
//			}
//			//page=getCookie('joblist_page');
//			//console.log(page)
//			
//			$("#jobList").html(text);
//			$(document).scrollTop(getCookie('scp'))
//			
//	        setCookie('joblist_page',"")
//	        setCookie('scp',"")
//			$('.loading-mask').remove()
//		}
//		
//	})()
	

    //页面滚动JS
    var win_scroll = {
        init:function(){
            $(window).scroll(function(){
                if ($(document).scrollTop() >46){
                    $(".psgExact").addClass("searchMainPop");
                }else{
                    $(".psgExact").removeClass("searchMainPop");
                }
            });
             //初始化滚动加载data
            ajax_page_requist.init();
        }
    };
    win_scroll.init();
   
    
    //----------------多级动态左侧弹出类型弹框----------------
    //工作地点
    $("#start_expect_area").click(function(){
        $('#refreshTime_alert, .m_master, #other_alert').hide();
        $(".psgExact").removeClass("searchMainPop");
        $ (window).unbind ('scroll');
        var dataurl = mjianzhi_url+"/job/GetMoreAreaOpenProvice/";
        thirdSelect.canEmpty = true;
        thirdSelect.init('',"工作地点",dataurl,"areaid","input[name=start_expect_area]","#start_expect_area_name",function(){
            $('input[name=start_expect_area]').change();
        });
    });
    $('input[name=start_expect_area]').change(function(){
        $('#search_form').submit();
    });

    //----------------左侧弹出类型弹框----------------

    var singleSelect = {
        initialiseSelect:function(title,data,default_value,valueBindTree,nameBindTree,callBack){
            if(data =="" || data.length<=0){
                alert("数据错误，请重新刷新页面");return;
            }
            $("#singleSelect #selectTitle").html(title);
            singleSelect.bindData(data,default_value);
            $("#singleSelect .select_a").bind("click",function(){
                var selectValue = $(this).attr("data-value");
                var selectName = $(this).attr("data-name");
                $(valueBindTree).val(selectValue);
                $(nameBindTree).html(selectName).addClass("green").removeClass("gray");
                if(typeof(callBack) != "undefined"){
                    callBack(selectValue);
                }
                singleSelect.closeDialog();
            });
            $("#singleSelect .closeButton").bind("click",function(){
                singleSelect.closeDialog();
            });
            singleSelect.showRight();
        },
        bindData:function(data,default_value){
            var appendHtml = "";
            for(var i=0;i<data.length;i++){
                if(default_value == data[i].value){
                    appendHtml = appendHtml + '<li class="cut"><a href="javascript:;" class="select_a" data-name="'+data[i].name+'" data-value="'+data[i].value+'">'+data[i].name+'</a><i class="icon-uniE602"></i></li>';
                }else{
                    appendHtml = appendHtml + '<li><a href="javascript:;" class="select_a" data-name="'+data[i].name+'" data-value="'+data[i].value+'">'+data[i].name+'</a></li>';
                }
            }
            $("#singleSelect #selectUl").html(appendHtml);
        },
        closeDialog:function(){
            $("#singleSelect").stop().animate({width:"0%"},200);
            $("#singleSelect .select_a").unbind();
            $("#singleSelect #selectUl").html("");
            $("#singleSelect #selectTitle").html("");
        },
        showRight:function(){
            $("#singleSelect").stop().animate({width:"100%"},200);
            $("#singleSelect").show();
        }


    };
    //求职意向弹框 hopejob
    $("#hopjob_selsect").click(function(){
        $('#refreshTime_alert, .m_master, #other_alert').hide();
        $(".psgExact").removeClass("searchMainPop");
        $ (window).unbind ('scroll');
        var default_value = $("input[name=hopejob]").val();
        //var hop_job_data={/$hop_job/};
//        singleSelect.initialiseSelect("职位选择",hop_job_data,default_value,"input[name=hopejob]",'#hoejob_name',function(){
//            $('input[name=hopejob]').change();
//        });
        var dataurl = mjianzhi_url+"/job/GetMoreJobV2/";
        thirdSelect.canEmpty = true;
        thirdSelect.init('',"职位选择",dataurl,"areaid","input[name=hopejob]","#hoejob_name",function(){
            $('input[name=hopejob]').change();
        });
    });
    $('input[name=hopejob]').change(function(){
        $('#search_form').submit();
    });

    //弹窗返回处理
    $('#back,.getBack').live('click',function(){
        $(window).bind('scroll');
        win_scroll.init();
    });

    //排序弹窗
    $('#refreshTime').click(function(){
        $('#refreshTime_alert, .m_master, #other_alert').hide();
        $ (window).unbind ('scroll');
        $(".psgExact").addClass("searchMainPop").css('z-index',9999);
        $('#refreshTime_alert').show();
        $('.m_master').show().addClass('refrese_alert_close');
        $('.order_select').click(function(){
            $('.order_select').removeClass('cut');
            $(this).addClass('cut');
            $('input[name=order]').val($(this).attr('data-value'));
            $('#search_form').submit();
        });
    });

    //筛选弹窗
    $('.more-label a').click(function(){
        $(this).addClass('cur').siblings().removeClass('cur');
    });
    $('.otherSubmit').click(function(){
        $('#other_alert,.m_master ').css('display','none');
    });
    $('.otherSubmit').click(function(){
        var value = '';


        //性别
        var other_x = $('.o_sex');
        var length = other_x.length;
        for(var i = 0;i<length;i++){
            if($(other_x[i]).hasClass('cur')){
                value += ',' + $(other_x[i]).attr('data-value');
            }
        }
        console.log(value);
        $('input[name=other_sex]').val(value);
        //结算方式
        value = '';
         other_x = $('.o_way');
         length = other_x.length;
        for(var i = 0;i<length;i++){
            if($(other_x[i]).hasClass('cur')){
                value += ',' + $(other_x[i]).attr('data-value');
            }
        }
        console.log(value);
        $('input[name=other_count_way]').val(value);

        //特殊兼职
        value = '';
         other_x = $('.o_time');
         length = other_x.length;
        for(var i = 0;i<length;i++){
            if($(other_x[i]).hasClass('cur')){
                value += ',' + $(other_x[i]).attr('data-value');
            }
        }
        console.log(value);
        $('input[name=other_work_time]').val(value);

        //发布来源
        value = '';
        other_x = $('.o_source');
        length = other_x.length;
        for(var i = 0;i<length;i++){
            if($(other_x[i]).hasClass('cur')){
                value += ',' + $(other_x[i]).attr('data-value');
            }
        }
        if(value == '') 
            value = -1;
        $('input[name=other_source]').val(value);



        $('#other_alert,.m_master ').css('display','none');
        $('#search_form').submit();
    });
    $('.clearSubmit').click(function(){
        $('.more-label a').removeClass('cur');
    })
    var windowHeight=$(window).height();
    $('#other').click(function(){
        $('#refreshTime_alert, .m_master, #other_alert').hide();
        $ (window).unbind ('scroll');
        $('#other_alert').height(windowHeight-86);
        $('.js-scroll').height(windowHeight-146);
        $(".psgExact").addClass("searchMainPop").css('z-index',99999);
        $('#other_alert').show();
        $('.m_master').show().addClass('refrese_alert_close');
    });

    //排序|筛选弹框 点击其他地方取消弹框
    $('.refrese_alert_close').live('click',function(){
        $(window).bind('scroll');
        win_scroll.init();
        $('#refreshTime_alert, .m_master, #other_alert').hide();
//      $(window).scroll();
    });


    function getLocation()
    {
        var map_lng = getCookie('map_lng');
        var map_lat = getCookie('map_lat');
        if (!map_lat || !map_lng) {
            var geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(function (r) {
                if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                    $('input[name=map_y]').val(r.point.lng);
                    $('input[name=map_x]').val(r.point.lat);
                    setCookie('map_lng',r.point.lng);
                    setCookie('map_lat',r.point.lat);

                }
                else {
                    alert('failed' + this.getStatus());
                }
            }, {enableHighAccuracy: true});
        } else {
            $('input[name=map_y]').val(map_lng);
            $('input[name=map_x]').val(map_lat);
        }
    }
    //经纬度获取
    window.onload = getLocation();

    function setCookie(name,value)
    {
    	var day = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    	if(day!==0){
	        var exp = new Date();
	        exp.setTime(exp.getTime() + day*24*60*60*1000);
	        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
    	}else{
    		document.cookie = name + "="+ escape (value);
    	}
    }

    function getCookie(name)
    {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    }
	
//点击a标签时候，将第几页和scrolltop存入cookie,不是安卓浏览器直接返回
//	$('#jobList').on('click','a',function(ev){
//		if(navigator.userAgent.indexOf('Android')==-1)return;
//		setCookie("joblist_page",page,0);
//		setCookie('scp',$(document).scrollTop(),0)
//	})
//	$('.seekBtn').on('click',function(ev){
//		if(navigator.userAgent.indexOf('Android')==-1)return;
//		setCookie("joblist_page",page,0);
//		setCookie('scp',$(document).scrollTop(),0)
//	})