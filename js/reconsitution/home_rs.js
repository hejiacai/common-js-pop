//网站首页修改20190521---xiaofei
hbjs.use('@searchv2, @jobLazyload, @jobDialog, @actions, @jobFlexSlider, @homeSideSortMenu, @hoverDir, @slidePage', function(m){

	var cookie = m['tools.cookie'],
        confirmBox = m['widge.overlay.confirmBox'],
        Dialog = m['widge.overlay.hbDialog'],
        jobTopSearch = m['product.jobSearch.jobTopSearchV2'],
        slidePage = m['widge.switchable.slidePage'],
		$ = m['jquery'].extend(m['cqjob.actions'], m['cqjob.jobDialog'], m['cqjob.jobFlexSlider'], m['cqjob.jobLazyload']);
		
		
		
	var recommendSlidesLst = $('#recommendSlidesLst');
	var hDir = new m['widge.hoverDir']({
		container: recommendSlidesLst,
		element: '.subBanner',
		size: 132
	});

	var slides = new slidePage({
		element: $('#slides'),
		slideSpeed: 700,
		timeout: 5000,
		scrollX: true,
		scrollY: false,
		isMouseParent: true
	});
	var slidesPage = $('#slidesPage'),
		slidesPageItem = slidesPage.children();

	$('#slidesPrev').on('click', function(){
		slides.prev(true);
	});
	$('#slidesNext').on('click', function(){
		slides.next(true);
	});

	slides.on('scrollEnd', function(e){
		slidesPageItem.removeClass('current');
		slidesPageItem.eq(e.page).addClass('current');
	});
	slidesPage.on('click', 'a', function(e){
		var target = $(e.currentTarget),
			index = slidesPageItem.index(target);

		slides.goToPage(index);
	});

	$(".newcontainer").hover(function(){
		$('#slidesPrev,#slidesNext').show();
	}, function(){
		$('#slidesPrev,#slidesNext').hide();
	});

	var sPage = new slidePage({
		element: recommendSlidesLst,
		slideSpeed: 700,
		timeout: 0,
		scrollX: true,
		isMouseParent: true,
		useTransition: false,
		useTransform:false
	});

	$('#flexDirectionPrev').on('click', function(){
		sPage.prev(true);
	});
	$('#flexDirectionNext').on('click', function(){
		sPage.next(true);
	});	
		
	$("#js_star_refresh").on("click", function(){
        $.ajax({
            type : "get",
            url :''+refreshStarEpy+'/index/randStarCompanys',
            success : function(json){
                var json = eval("("+json+")"); 
                if(json.status){
                    var html = "";
                    $.each(json.data,function(i,n){
                        html += "<li>";
                        html += '<a target="_blank" href="'+refreshStarEpy+'/qiye/'+n.company_flag+'.html"><img src="'+starEpyImg+''+n.img_url+'" /><span>'+n.img_title+'';
                        html += "</span></a></li>";
                    });

                    $("#star_company_logos_ul").html(html);
                }
            }
        });
    });
    //查看更多
    $("#js_star_more").on("click",function(){
        var starBox = $(".star_employer_box");
        if(starBox.hasClass("star_employer_more")) {
            starBox.removeClass("star_employer_more");
        }else{
            starBox.addClass("star_employer_more");
        }
        return false;
    });
	
	$('.flexBanner').flexslider({
			animation:"fade",
			itemWidth:225,
			itemMargin:0,
			prevText:'&#xf053;',
			nextText:'&#xf054;',
			pauseOnAction:false,
			pauseOnHover:true,
			slideshowSpeed:5000,
			move:5
		});
		
		var job = new m['product.homeSideSortMenu']({
				url: {
					host: homeLink,
					path: '/jobsearch/',
					param: null,
					alias: 'alias',
					selectId: ["1701"]
				},
				banner: [{
					id: 3,
					link: '/it/',
					value: '<img src="'+homeStyle+'/img/common/channel.jpg" alt="" />',
					className: 'subPageMenu',
					isHref : true
				},
				{
					id: 5,
					link: '/car/',
					value: '<img src="'+homeStyle+'/img/common/channel3.png" alt="" />',
					className: 'subPageMenu',
					isHref : true
				},
				{
					id: 6,
					link: '/fangdichan/',
					value: '<img src="'+homeStyle+'/img/common/channel2.png" alt="" />',
					className: 'subPageMenu',
					isHref: true
				},
				{
                        id: 9,
                        link: '/food/',
                        value: '<img src="'+homeStyle+'/img/common/channel4.jpg" alt="" />',
                        className: 'subPageMenu',
                        isHref: true
                    }
                ],

				isRenderTriggerMenu: false,
				isSpacer: null,
				isLinkTarget: true,
				width:740,
				posY: null
			});
		job.init();	
		
	var searchConfig = {
				trigger: '.butsub',
				selectedIndex:0,//'{/if $searchtype == "company"/}1{/elseif $searchtype == "fulltext"/}2{/else/}0{//if/}',
				initDataSource: '/head/SearchKeyword',
				dataSource:[
					'/index/auto/?limit=12&timestamp={{timestamp}}&type=job&q={{query}}&callback=jsonpcallback',
					''+homeLink+'/index/auto/?limit=12&timestamp={{timestamp}}&type=company&q={{query}}&callback=jsonpcallback',
					''+homeLink+'/index/auto/?limit=12&timestamp={{timestamp}}&type=fulltext&q={{query}}&callback=jsonpcallback'
				],
				url: [
					'/jobsearch/?key={{query}}',
					'/jobsearch/?params=u2&key={{query}}',
					'/jobsearch/?params=u3&key={{query}}'
				],
				// placeHolder: [
				// 	'春季期间周一至周六上午招聘会',
				// 	'请输入公司名称',
				// 	'春季期间周一至周六上午招聘会'
				// ],
				placeHolder: [
					'',
					'请输入公司名称',
					''
				]
			};
			//头部搜索
			var search = new jobTopSearch($.extend({
				container: $('#search_box form')
			}, searchConfig));
		
			search.on('submit', function(e){
                if(e.index == 0 && e.value && e.value != undefined) {
                    $.getJSON('/head/SaveJobkey/?keyword='+ encodeURIComponent(e.value) + '',function(result){
						window.location.href = e.url;
					});
				}else {
					  window.location.href = e.url;
				}
			});
		
			var searchInput = search.getSearch();
			var searchTabs = search.getTabs();
			//searchSelect = search.getSelect();
		
			searchInput.on('itemAllDelete', function(e){
				$.getJSON('/head/ClearSearchKeywords/');
			});
			searchInput.on('itemDeleted', function(e){
				$.getJSON('/head/DelSearchKeyword/keyword-'+e.value+'');
			});
			searchInput.on('searchItemSelected', function(e){
				//e.url是链接
				//e.data.text是对应的文字
				//e.index是索引号
				
				var index = searchTabs.get('tabIndex'),
					key = e.data.value;
				
				if(e.url && index == 0 && key != undefined){
					$.getJSON('/head/SaveJobkey/?keyword='+encodeURIComponent(key),function(result){
						window.location.href = e.url;
					});

				} else {
					window.location.href = e.url;
				}
			});	
		
	var userEnterBox = $('#userEnterBox,.login_regAge');
			userEnterBox.on('mouseenter mouseleave', '.login,.personage', function(e){
				var target = $(e.currentTarget);
				if(e.type === "mouseenter"){
					target.addClass('hover');
				} else {
					target.removeClass('hover');
				}
			});
			
        
			//顶部广告
			$('.huiboJob').slideDown(1000);
//			$('.huiboJob').hover(function(){
//				$('.huiboJobCode').show();
//			});
//			$('.huiboJobCode').mouseleave(function(){
//				$(this).hide();
//			});

            //城市切换
			var cityTrigger = $('#js-city');
			var cityPopup = $('#js-citybox');
			var cityTimer;
			
			cityTrigger.on('mouseenter', overHandle).on('mouseleave', leaveHandle);
			
			cityPopup.on('mouseenter', overHandle).on('mouseleave', leaveHandle);
			
			function overHandle(e){
				cityTimer && clearTimeout(cityTimer);
				
				cityTrigger.addClass('hover-city');
				cityPopup.show();
			}
			function leaveHandle(e){
				cityTimer && clearTimeout(cityTimer);
				
				cityTimer = setTimeout(function(){
					cityTrigger.removeClass('hover-city');
					cityPopup.hide();
				}, 100);
			}
			
			//弹窗城市定位
            try{
                $("#js-dialog-city").css("margin-top",-$("#js-dialog-city").height()/2);
            }catch(e){};
            
             //弹窗城市关闭
            $("#js-dialog-city").find(".close").click(function(){
                $("#js-dialog-city").hide();
                $(".hb_ui_ui-mask").remove();
                return false;
            });

            //var cookie = m['tools.cookie'];
            
            var is_first = cookie.get("is_firstvisit");
            if(is_first !=undefined && is_first=='1'){
                $('#js-dialog-city').show();
                $('#js-dialog-city2').show();
                //appraiselist_v1.html
            }

            $.post('/index/AjaxGetAreainfo/',function(data){
                $('#area_name').html(data.abbreviation);
                $('#area_name1').html(data.abbreviation);
                $('#area_name2').html(data.abbreviation);
                $('#nearCity').append(data.nearCity);
                //设置被选中地区
                $('#city_'+data['area_id']).addClass('cur');
                $('#city_'+data['area_id']).css({cursor:'default'});
                $('#city1_'+data['area_id']).addClass('cur');
                $('#city1_'+data['area_id']).css({cursor:'default'});

                $('#main_domain').attr('href',data['domain']);

            },'json');	
	
	$(window).scroll(function(){
        if ($(document).scrollTop() > 120){
            $('a.backTop').css({'display':'inline-block'});
        }else{
            $('a.backTop').css({'display':'none'});
        }
    });
    //	 打黑险恶
	 $('.crimePopz').click(function(){
           $('.crimeCrackdown').slideToggle();
    	});
    $('.crimeCrackdown').click(function(){
           $(this).slideUp();
    	});
    
	
    var hasreadcount = 0;

    //消息提醒的那个啥
    $.getJSON('/msgtip/getMsgs', null, function(json, textStatus) {
        if(json.status){
            $('#web_subscribe_form').after(json.html);
        }
    });

    $(document).on('click',"#msgAltRed",function(){
        var id = $(this).attr("data-id");
        if($(this).attr("data-readtime") != '1') {
            setRead(id);
        }       
        $(this).hide();
        $("#msgAlert").addClass('showMsg');
    })

    $(document).on('click',"#msgAlt",function(){
        $(this).hide();
        $("#msgAlert").addClass('showMsg');
        $("#nextmsg").click();
    })
  
    $(document).on('click','.msgInfor a.close',function(){  
        $("#msgAlert").removeClass('showMsg');
        var total = $("span.msgContent").length;
        var leftcount = total- hasreadcount;
        if(leftcount > 0) {
            $("#msgAlt font").html(leftcount>99?"99+":leftcount).parent().show();
        }       
    })
    $(document).on('click',"#nextmsg",function(){
        var thisindex = parseInt($("span.msgContent:visible").attr("data-index"));
        thisindex+=1;
        var total = $("span.msgContent").length;
        if(thisindex>=total) return false;
        $("span.msgContent").hide();
        var nextmsg = $("span.msgContent[data-index="+thisindex+"]");
        nextmsg.show();
        if(thisindex==total-1){
            $(this).attr('style','color:#999!important');
        }else{
            $(this).attr('style','');
        }
        if(nextmsg.attr('data-hasread') == 0 && nextmsg.attr('data-readtime') != '1') {
            setRead(nextmsg.attr('data-id'));
        }
    })

    $(document).on('click',"#prevmsg",function(){
        var thisindex = parseInt($("span.msgContent:visible").attr("data-index"));
        thisindex-=1;
        if(thisindex<0) return false;
        $("span.msgContent").hide();
        $("span.msgContent[data-index="+thisindex+"]").show();
        if(thisindex==0){
            $(this).attr('style','color:#999!important');
        }else{
            $(this).attr('style','');
        }
        
    })

    function setRead(tipmsgid){
        if(!tipmsgid){return false};
        $.ajax({
            url : ''+homeLink+'/msgtip/setRead',
            type:'get',
            data: {msgtipid:tipmsgid},
            dataType : 'jsonp',  
            jsonp:"callback",  
            success  : function(data) {
                if(data.status) {
                    hasreadcount += 1;
                    $("span.msgContent[data-id="+tipmsgid+"]").attr('data-hasread',1);
                }
            }
        });
    }
	
	
	user_jianli_status = true;// true: 公开  false: 不公开
    $('.index-gz-list').find('.sub-gz-list').find('a').bind('mousemove',function(){
        if($(this).hasClass('cut')){
            return false;
        }else{
            var thisIndex = $(this).index();
            $(this).addClass('cut').siblings('a').removeClass('cut');
            $('.index-gz-list').find('.sub-gx-list').find('ul').eq(thisIndex).css({'display':'block'}).siblings('ul').css({'display':'none'});
        }
    });
	
	$('a.backTop').click(function(){
        $('html,body').animate({ scrollTop: 0 });
   });

	$('.newschx').hover(function(){
		$('.newschSelect').show();
	});
	$('.newschSelect a').click(function(){
		var _this = $(this);
		var v = _this.attr('v');
		$('.sch').hide();
		$('#'+v).show();
		$('.newschSelect').hide();
		_this.parents(".newschSelect").find("input[type='hidden']").val(_this.attr("params"));
	});
	$('.newschSelect').mouseleave(function(){
		$(this).hide();
	});

	$('nav .lst ul li a').mouseout(function(){
		 $(this).find('.newIcon').css({left:"15px"});
	});

    /* 推荐职位 */
    $('.hotjob-famous li a').hover(function(){
        $(this).parent().find('.sub-famous').toggle();
    });

	$(".link").on("click", function(e) {
        e.stopPropagation();
        window.open($(this).attr("data-url"));
    });
	$('#close').click(function(){
		$('#weixin').hide();
	});

	$('#btnIndexLogin').mouseOverHide($('#loginContainer'),'loginBigcontainer');
	$('#btnIndexReg').mouseOverHide($('#RegContainer'),'RegBigcontainer');
	$("img.lazy").lazyload({
		effect:"fadeIn",
		failure_limit:5
	});

	$.focusblur('#tSchJob');
	$.focusblur('#tSchCom');
	$.focusblur('#tSchCash');




	//判断用户是否登录
        checkUser();

	$(".pos").mouseenter(function(){
        $(".pos").css("display","block");
    });

	$('#navLst li,.posBox').bind('mouseenter',function(){
		$(this).addClass('show');
	});
	$('#navLst li,.posBox').bind('mouseleave',function(){
		$(this).removeClass('show');
	});

    $('#searchTab').find('.tabT').find('a').click(function(){
		if($(this).hasClass('cu')){
			return false;
		}else{
			var thisIndex = $(this).index();
			$(this).addClass('cu').siblings('a').removeClass('cu');
			$('#searchTab').find('.tabC').find('.tabCon').eq(thisIndex).css({'display':'block'}).
                siblings('.tabCon').css({'display':'none'});
		}
	});

	$('#searchTab').bind('mouseenter',function(){
		$('#searchTab .tabT').css({'display':'block'});
	});
    $('#searchTab').bind('mouseleave',function(e){
        var searchInputID = document.activeElement.id;
        if(searchInputID!="tSchJob" && searchInputID!="tSchCash" && searchInputID != "tSchCom"){
            $("#searchTab .tabT").css({'display':'none'});
        }else{
            preventEvent(e);
        }
    });

	$('#fairTab').find('.tabT').find('li').bind('mousemove',function(){
		if($(this).hasClass('cu')){
			return false;
		}else{
			var thisIndex = $(this).index();
			$(this).addClass('cu').siblings('li').removeClass('cu');
			$('#fairTab').find('.tabC').find('.tabCon').eq(thisIndex).css({'display':'block'}).siblings('.tabCon').css({'display':'none'});
		}
	});

    $('#addTab').find('.tabT').find('li').find('b').bind('click',function(){
		if($(this).parents('li').hasClass('cu')){
			return false;
		}else{
			var thisIndex = $(this).parents('li').index();
			$(this).parents('li').addClass('cu').siblings('li').removeClass('cu');
			$('#addTab').find('.tabC').find('.tabCon').eq(thisIndex).css({'display':'block'}).siblings('.tabCon').css({'display':'none'});
            return false;
		}
	});
	
    $(".userOut").click(function(){
        $.ajax({
            'url':'/index/signOut',
            'type':'get',
            'dataType':'json',
            'success':function(json){
                if(json.success){
                    $('.newfree-post').css('display','block');
                    $(".befor,.login_reg").css("display","block");
                    $(".comAfter,.psnAfter,.psnLg,.comLg").css("display","none");
                    $(".panelBox").css("display","none");
                    $('#loginRight').removeClass('rightAfter').addClass('right');
                    //免费发布职位连接修改：
                    $('#free_put_job').attr('href',''+homeLink+'/company/register');

                    //$('#new_hight_search').hide();
                    //$('#go_register_person').show();
                    //$('#go_register_person').prev().show();

                    $.anchorMsg("退出成功");
					window.location.reload();
                }else{
                    $.message("退出失败");
                }
            }
        });
        return false;
    });

    $('.cqjop-tips').hover(function(){
        $('.tips-intro').show();
    });
	$('.newLogo').mouseleave(function(){
        $('.tips-intro').hide();
    });

	 //右边浮动栏
	 $('.popzP').hover(function(){
		$('.popzSpd').toggle();
	 });

	//广告位跳转
	$('#slides,#flexBannerList,#recommendSlidesLst,#fullAd,#fstAd,#sndAd,#thrdAd,#recommendCompanies,#lastCompanyPicture').on('click', 'a', function(e){
		var self = $(e.currentTarget);
		var advert_id = self.attr('advert_id');
		var area = self.attr('area');
		var company_flag = self.attr('company_flag');
		var data = {advert_id:advert_id,area:area,company_flag:company_flag};
		$.post('/ad/adverVisit/',data);
	});

    var _wrap=$('ul.popMList');
    var _interval=2000;
    var _moving;
    _wrap.hover(function(){
        clearInterval(_moving);
    }, function(){
        _moving=setInterval(function(){
            var _field=_wrap.find('li:first');
            var _h=_field.height();
            _field.animate({marginTop:-_h+'px'},600,function(){
                _field.css('marginTop',0).appendTo(_wrap);
            })
        },_interval);
    }).trigger('mouseleave');
	
	//地区切换
        function areaToggle(area_id){
            window.location.href = "/index/areacutover/areaid/"+area_id;
        }
	
	function preventEvent(event){
		var e = window.event || event;
		if(e.stopPropagation){
		   e.stopPropagation();
		} else {
		   e.cancelBubble = true;
		}
	}
    function checkUser(){
        //判断用户类型
        var type = cookie.get("usertype");
        var isLogin = !!type;
        var userName = type == "c" ? '企业招聘中心' : '我的汇博';//cookie.get("nickname") === undefined ? '我的汇博' : decodeURI(cookie.get("nickname"));
        var userID = cookie.get("userid");
        var headphoto = decodeURIComponent(cookie.get("headphoto"));
        if(!type){
            $(".befor,.login_reg").css("display","block");
            $(".comAfter,.comLg,.psnAfter,.psnLg,.psnLg_new").css("display","none");
        }
        if(type == "c"){
            $(".comAfter,.comLg").css("display","block");
            $(".befor,.login_reg,.psnAfter,.psnLg").css("display","none");
            $('#loginRight').removeClass('right').addClass('rightAfter');
            if(headphoto !== undefined && headphoto !== '' && headphoto !== 'undefined'){
                $('#comHeadphoto').attr("src",headphoto);
            }
            //免费发布职位连接修改：
            $('#free_put_job').attr('href',''+companyLink+'/job/add');

            //$('#go_register_person').hide();
            //$('#go_register_person').prev().hide();

        } else if(type == "p"){
            $('.newfree-post').css('display','none');

            $(".psnAfter,.psnLg_new").css("display","block");
            $(".befor,.login_reg,.comAfter,.comLg").css("display","none");
            $(".login_regAge").css("display","block");
            $('#loginRight').removeClass('right').addClass('rightAfter');
            //$(".psnUserName").html(userName);
            if(headphoto !== undefined && headphoto !== '' && headphoto !== 'undefined'){
                $('#psnHeadphoto').attr("src",headphoto);
            }

            //获取用户信息
            $.post(''+homeLink+'/loginindex/getinfo',{},function(data){
                    document.getElementById('user_info_ajax').innerHTML = data.content;
                    var userEnterBox1 = $('.login_regAge');
                    userEnterBox1.on('mouseenter mouseleave', '.personage', function(e){
                        var target = $(e.currentTarget);
                        if(e.type === "mouseenter"){
                            target.addClass('hover');
                        } else {
                            target.removeClass('hover');
                        }
                    });
                    auto_refresh = data.auto_refresh;
                    open_mode = data.open_mode;
                    user_jianli_status = document.getElementById('user_jianli_1').value;
                    //注册用户退出登录
                    $(".userOut").click(function(){
                        $.ajax({
                            'url':'/index/signOut',
                            'type':'get',
                            'dataType':'json',
                            'success':function(json){
                                if(json.success){
                                    $('.newfree-post').css('display','block');
                                    $('.newschHigh').css('display','none');
                                    $(".befor,.login_reg").css("display","block");
                                    $(".comAfter,.psnAfter,.psnLg,.comLg").css("display","none");
                                    $(".panelBox").css("display","none");
                                    $(".psnLg_new").css("display","none");
                                    $('#loginRight').removeClass('rightAfter').addClass('right');
                                    //免费发布职位连接修改：
                                    $('#free_put_job').attr('href',''+homeLink+'/company/register');
                                    $.anchorMsg("退出成功");
									window.location.reload();
                                }else{
                                    $.message("退出失败");
                                }
                            }
                        });
                        return false;
                    });
            },'json');
        }
	}
	//检测用户的简历信息
    $.getJSON('/resume/CheckWorkExperience',{},function(re){
    	if (!re.status) {
            var id_name = '';
            var title = '';
            if (re.data.code == 'need_resume') {
                id_name = 'need_resume_dialog';
                title = '创建简历';
			}
            if (re.data.code == 'need_work_experience') {
                id_name = 'need_work_experience_dialog';
                title = '工作经历';
            }
            if (re.data.code == 'need_update_resume') {
                id_name = 'need_update_resume_dialog';
                title = '更新求职意向';
            }
            var tdialog = new Dialog({
                close: 'x',
                idName: id_name,
                title: title,
                width: 380
            });
            tdialog.setContent(re.msg).show();
            var cancel_btn = tdialog.query('#j_cancel');
            cancel_btn.on('click',function(){
                tdialog.hide();
            });
            tdialog.after('hide', function(){
                tdialog.destory();
            });
		}
	});
        
        $.getJSON(feedBackLink,{},function(result) {
            if(result.is_show_feedback == 1){
                feedBack();
            }
        });
        
        function feedBack(){
            var feedBackHtml = getFeedBackHtml();
            var feedBackDialog = new Dialog({
                        idName: 'feed_back',
                        title: '提示',
                        content: feedBackHtml,
                        close: '╳',
                        width: 450
            });
            var feedBackObj     = feedBackDialog.query("#feedBackObj");
            var feedBackButton  = feedBackDialog.query(".finding-state-btns");
            feedBackObj.on("click",".finding-state-list span",function(){
                feedBackObj.find('.finding-state-list span').removeClass('checked');
                $(this).addClass('checked');
            });
            feedBackButton.on("click",".cancel-btn",function(){
                feedBackDialog.hide();
            });
            feedBackButton.on("click",".sure-btn",function(){
                var selectData = feedBackObj.find(".finding-state-list .checked").attr("data-value");
                if(typeof(selectData) == "undefined"){
                    confirmBox.timeBomb("请选择求职状态", {
                        name: 'fail',
                        width : 200,
                        timeout : 1500
                    });
                    return;
                }
                var data = {'code':selectData};
                $.getJSON(feedBackSetLink,data,function(result) {
                    if(!result.status){
                        confirmBox.timeBomb(result.msg, {
                            name: 'fail',
                            width : 200,
                            timeout : 1500
                        });
                        return;
                    }
                    confirmBox.timeBomb(result.msg, {
                        name : 'success',
                        width : 200,
                        timeout : 1500
                    });
                    feedBackDialog.hide();
                });		
            });
            feedBackDialog.show();
        }
        function getFeedBackHtml(){
            var html = "";
                html = html + '<div id="feedBackObj" class="finding-state">'
                html = html + '<div class="finding-state-text">有企业反馈您目前未找工作，请设置当前真实的求职状态：</div>'
                html = html + '<ul class="finding-state-list">'
                html = html + '<li><span data-value="2">正在找工作</span></li>'
                html = html + '<li><span data-value="1">暂未考虑换工作</span></li>'
                html = html + '</ul>'
                html = html + '</div>'
                html = html + '<div class="finding-state-btns">'
                html = html + '<div class="sure-btn">确认</div>'
                html = html + '<div class="cancel-btn">取消</div>'
                html = html + '</div>';
            return html;
        }  
        
});

var auto_refresh = 0;
var open_mode = 0;
var getNowFormatDatex = '';

//refresh_index('ajaxlogin');

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "/";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate()+1;
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate +' 00:00:00';
    return currentdate;
}
	getNowFormatDatex = getNowFormatDate();

function refresh_index(src){
    var src = src || 'index';// alert(src);return;
    hbjs.use('@confirmBox', function(m){
        var cookie = m['tools.cookie'],
            confirmBox = m['widge.overlay.confirmBox'],
            Dialog = m['widge.overlay.hbDialog'];
			$ = m['jquery'];

        var is_first = cookie.get("is_firstvisit");
        var area_id = cookie.get("ip_area_info");
        if(is_first !=undefined && is_first=='1'){
            $('#js-dialog-city').show();
            $('#js-dialog-city2').show();
        }

        if(src == 'index'){
            _checkRefesh('index');            
        } else {
            var cookie = m['tools.cookie'];
            var _isLogin = (cookie.get("usertype") == 'p') ? true : false;
            var _showRefeshConfirm = cookie.get('_hideRefeshConfirm');

            if(_isLogin && (_showRefeshConfirm != 1)&& auto_refresh==1){
                setRefeshConfirmCookie();
                _checkRefesh('ajaxlogin');
            }
        }
        
        function setRefeshConfirmCookie(){
            var tomorrow = new Date(getNowFormatDatex);
            cookie.set('_hideRefeshConfirm',1,{expires:tomorrow,path:'/',domain:".huibo.com"});
        }

        function doRefresh() {
             $.ajax({
                type : "get",
                url :''+personLink+'/resume/refresh',
                dataType : "jsonp",
                jsonp: "callbackparam",
                success : function(json){
                    if(json.status){
                        confirmBox.timeBomb("刷新成功", {
                            name : 'success',
                            timeout : 2000
                        });
                        $('#jian_li_shuaxin').hide();
                        $('#jianlishuaxin_line').hide();
                    } else {
                        confirmBox.timeBomb("每天只能刷新一次简历", {
                            name : 'warning',
                            width : 240,
                            timeout : 2000
                        });
                    }
                },
                error:function(e){
                    console.log('ajax fail');
                }
            });
        }

        function _checkRefesh(src1){
            var _src = src1 || 'index';
            $.ajax({
                type : "get",
                url :''+personLink+'/index/checkrefesh?src='+_src,
                dataType : "jsonp",
                jsonp: "jsonpCallback",
                success : function(json){
                    if(json.status) {
                        var tdialog = new Dialog({
                            close: 'x',
                            idName: 'refresh_dialog',
                            title: '温馨提示',
                            width: 500
                        });
                        tdialog.setContent(json.html).show();
                        tdialog.after('hide', function(){
                            tdialog.destory();              
                        });
                    } else {
                        if(_src != 'ajaxlogin') {
                            if(open_mode == 1) {
                            doRefresh();return;
                            }
                            confirmBox.confirm('简历当前为未公开状态，确认刷新后，将自动被公开', null, function () {
                                    this.hide();doRefresh();return;
                                }, function() {
                                    this.hide();
                                }, {
                                    confirmBtn: '<button class="button_a button_a_red">确定</button>',
                                    cancelBtn: '<button class="button_a cancelbtn">取消</button>',
                                    width : 320
                                });
                        }                        
                    }
                },
                error:function(e){
                    console.log('ajax fail');
                }
            });
        }
   }) 
}

function web_sub(){
    document.getElementById("web_subscribe_form").submit()
}


       
        


