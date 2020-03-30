//企业详情xioafei20190522
	if($('#is_show_job_tab').val())
	    $('.index-2').click();

 	var mySwiper = new Swiper('.swiper-container-person',{
//                 autoplay : 2000,
     pagination: '.pagination',
//                     loop:true,
     grabCursor: true,
     paginationClickable: true,
     slidesPerView: 2,
//                pagination: '.pagination',
//                paginationClickable: true,
//                slidesPerView: 2,
//                loop: true
  });
   $('.arrow-left-person').on('click', function(e){
     e.preventDefault();
     mySwiper.swipePrev();
   });
   $('.arrow-right-person').on('click', function(e){
     e.preventDefault();
     mySwiper.swipeNext();
   });
//公司简介/在招职位标签切换
$(".title-tab li a").click(function(){
	if($(this).parent().hasClass('cur')){
		return false;
	}else{
		$(this).parent().addClass('cur').siblings().removeClass('cur');
		if($(this).attr('class') == 'index-1'){
			$('.appeal-companyp-text').show();
			$('.njmBanner').show();
			$('.appeal-job-all').show();
			$('.appeal-all-page').show();
			$('.appeal-all-item').show();
            $('.appeal-company-project').show();
			$('.appeal-njmJoinUs').hide();
			$('.appr_all').show();
			$('.appeal-companyp-profile').css('border-bottom','1px solid #f1f1f1');

		}else if($(this).attr('class') == 'index-2'){
			$('.appeal-companyp-text').hide();
			$('.njmBanner').hide();
			$('.appeal-job-all').hide();
			$('.appeal-all-page').hide();
			$('.appeal-all-item').hide();
            $('.appr_all').hide();

			$('.appeal-njmJoinUs').show();
            $('.appeal-company-project').hide();
			$('.appeal-companyp-profile').css('border-bottom','none');
		}

	}
});
$('.openPhotos').on('click',function () {

      // console.log($(this).find('input'));
      var inputs = $(this).find('input');
      var img_path = '//assets.huibo.com//CompanyImages/introduce';
      var html = '';
      for(var i=0;i<inputs.length;i++){
		  html+='<div class="swiper-slide">';
          html+='<img src="'+img_path+$(inputs[i]).val()+'" />';
          html+='</div>';
      }
	  $('#swiper-wrapper').html(html);
      $('.m_master_photo').show();
      $('html').css('overflow','hidden');
      $('.photo-all').css({'height':'auto'});

      var mySwiperPhoto = new Swiper('.swiper-container-photo',{
//                  loop:true,
        	initialSlide :0,
          pagination: '.swiper-pagination-photo',
          paginationHide :false,
      });
      $('.arrow-left-photo').on('click', function(e){
          e.preventDefault();
          mySwiperPhoto.swipePrev();
      })
      $('.arrow-right-photo').on('click', function(e){
          e.preventDefault();
          mySwiperPhoto.swipeNext();
      })
 });
  $('.m_master_photo').click(function () {
      $('.m_master_photo').hide();
      $('.photo-all').css('height','0px');
		$('html').css('overflow','scroll');
		$('#swiper-wrapper').html('');
    	$('#swiper-wrapper').removeAttr("style");
  });

hbjs.use('@jobPrettyPhoto, @imgLoader, @checkLogin, @confirmBox', function(m){
	
	
	var $ = m['jquery'].extend(m['cqjob.jobPrettyPhoto']),
		checkLogin = m['product.checkLogin'],
		ConfirmBox = ConfrimBox = m['widge.overlay.confirmBox'],
		fontSize = 18,
		cookie = m['tools.cookie'],
		imgLoader = new m['tools.imgLoader'](),
        Dialog     = m['widge.overlay.hbDialog'],
		pWidth = 70;
		
//	图片点击放大预览开始	

	var m1, r, s,
	 picList = $('.piclist'),
	 picListItem = picList.children('li'),
	 lw = picListItem.width()*3,
	 liw = lw * picListItem.length,
	 curIndex = 0,
	 imgs = [],
	 loadImgs = {},
	 isAnimated = $('.piclist li').size() <= 3 ? true : false;


	 picList.width( liw + 'px' );

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

	 loadPhone();
	 function loadPhone(index){
		 index || (index = curIndex);
		 if(loadImgs[index]) return;
		 phoneImgs && phoneImgs[index] && imgLoader.load(phoneImgs[index], {imgIndex: index});
	 }
	 imgLoader.on('load', function(e){
		 loadImgs[e.imgIndex || 0] = true;
		 picListItem.eq(e.imgIndex || 0).css('background', 'none').find('img').attr('src', e.src);
	 });

	 $('.pic_next').click(function(){
		 if(isAnimated || curIndex >= picListItem.length - 1) return;
		 isAnimated = true;
		 /*
		  if(picList.is(':animated')){
		  picList.stop(true,true);
		  }*/ /* 避免点击事件重复 */

		 ml = parseInt(picList.css('left'));
		 r = liw - (lw - ml);  /* 700为外部区块.infopic的宽度，15为li之间的距离，即.piclist li的margin-right的值 */
		 if(r < lw){
			 s = r - 0;
		 } else {
			 s = lw;
		 }
		 if(curIndex < picListItem.length - 1){
			 curIndex+=4;
		 }
		 picList.stop(true, false).animate({left: ml - s + 'px'}, 'slow', function(){
			 isAnimated = false;
			 loadPhone(curIndex);
		 });
	 });

	 $('.pic_prev').click(function(){
		 if(isAnimated || curIndex < 0) return;
		 isAnimated = true;
		 /*
		  if(picList.is(':animated')){
		  picList.stop(true,true);
		  }*/ /* 避免点击事件重复 */

		 ml = parseInt(picList.css('left'));
		 if(ml > -lw){
			 s = ml;
		 } else {
			 curIndex-=4;
			 s = -lw;
		 }
		 picList.stop(true, false).animate({left: ml - s + 'px'}, 'slow', function(){
			 isAnimated = false;
			 loadPhone(curIndex);
		 });
	 });

	 $(".gallery:first a[rel^='prettyPhoto']").prettyPhoto({
		 animation_speed:'fast',
		 slideshow: 10000,
		 hideflash: true,
		 initcallback: function(){
			 $.each(phoneImgs, function(index){
				 loadPhone(index);
			 });
		 },
		 ajaxcallback:function(){

		 }
	 });

//	图片点击放大预览结束	

	//一分钟留下简历
	var win = $(window);
	var fixed_box = $('#fixed_box');
	var falg_leav_info = false;
	if(cookie.get('isBottomClose') == undefined) {
		falg_leav_info = true;
		win.on('scroll', function () {
			if(falg_leav_info){
				var scrollTop = $(document).scrollTop() + win.height();//类似当前文档的高度
                var other1 = 0;
                if(resumeLeave){
                	other1 = $('.flex-viewport').height();
                }
                
				var w1 = $('.nJobMainCont').height() + $('.njmName').height() + other1;
				if (scrollTop >= w1) {
					fixed_box.show();
				}
			}
		});
	}
	fixed_box.on('click', '.close', function(e){
		var target = $(e.currentTarget);
		cookie.set('isBottomClose', 1);
		falg_leav_info = false;
		fixed_box.hide();
	});

	$('.registerResume').on('click', function(e){
		checkLogin.dialog.set('title', null);
		checkLogin.dialog._updateHeader();
		var isLogin = checkLogin.isPersonLogin(null, 'person_dialog', '/personregister/applyreg/success-ajaxLoginCallback-fromurl-jobsearch');
		return false;
	});

	$(".ques").mouseover(function(){
		$(this).parent().next().show();
	});

	$(".ques").mouseout(function(){
		$(this).parent().next().hide();
	});


	//评价内容 -》收起展开
	$(".companyp_switch_submit").click(function(){
		var self = $(this),sHeight = "93px",sHtml = '<a href="">展开<i class="icon-arr-down"></i></a>';
		if(self[0].switchstatus != "show"){
			sHeight = "none";
			sHtml = '<a href="">收起<i class="icon-arr-down" style="background-position:-22px -48px"></i></a>';
			self[0].switchstatus = "show";
		}else{
			self[0].switchstatus = "hide";
		}
		self.prev().css({"max-height":sHeight});
		self.html(sHtml);
		return false;
	});

	//点击展开
	$(".companyp_switch_company_info").click(function(){
                var content = $("#more_content").html();
		$(this).parent(".appeal-companyp-text").find(".companyp-text").css("height","auto");
		$(this).hide();
              //  var content = encodeURIComponent('');
		$('.companyp-text').html(content);
		return false;
	});
	//是否有用
	var can_requist = true;
	$("body").on("click",".thumbs-up a",function(){
		if(!can_requist){return false;}
		else{can_requist = false;}
		var num = $(this).find('em').text();
		var islogin = checkLogin.isLogin('ajaxLoginCallback');
		if(!islogin){can_requist = true;return false;}
		var status = 'add';
		var _this = this;
		if($(this).hasClass('cur')){
			status = 'del';
		}
		$.post('/job/UpdateAppraiseUseful',{status:status,appraise_id:$(this).attr('data-app')},function(e){
			if(e.status){
				$(_this).toggleClass("cur");
				if(status == 'add'){
					num++;
				}else{
					num = (num - 1);
					if(num < 0){num++;}
				}
				$(_this).find('em').text(num);
				can_requist = true;
			}else{
			}
		},'json');


		return false;
	});


	$("textarea").keyup(function(){ 
		var max = 200;
		var len = $(this).val().length;
		if(0 ==len){
			$(this).removeClass('textAreaChanged');
		}else{
			$(this).addClass('textAreaChanged');
		}
		if(max>=len){
			$(this).parents(".newMessage").find("span").text(len);
		}else{
			ConfrimBox.timeBomb("留言长度不能超过200字", {
				width : 250,
				name : 'warning'
			});
			$(this).parents(".newMessage").find("span").text(200);
			$(this).val($(this).val().substr(0,max));
		}
	});

	$("textarea").focus(function(){
		/* var islogin = checkLogin.isLogin('ajaxLoginCallback');
        checkLogin.dialog.resetSize(498);
        if(islogin){
        	if(!$(this).hasClass('textAreaChanged')){
    			$(this).val("");
    			$(this).addClass('textAreaChanged');
    		}	
        } */
        
		if(!$(this).hasClass('textAreaChanged')){
			$(this).val("");
			$(this).addClass('textAreaChanged');
		}else{
    		$(this).removeAttr("style");
    	}
	});
	
	$("textarea").blur(function(){
    	if($(this).val().replace(/^\s*$/g,'')  == ''){
    		$(this).val($(this).attr('data-tip'));
    		$(this).removeClass('textAreaChanged');
    	}
    });
	
	$(window).scroll(function(){
        if ($(document).scrollTop() > 120){
            $('#sus').find('a.backTop').css({'display':'inline-block'});
        }else{
            $('#sus').find('a.backTop').css({'display':'none'});
        }
    });
    $('#sus').find('a.backTop').click(function(){
        $('html,body').animate({ scrollTop: 0 });
    });
	
	$('#show_short_info').click(function(){
		$('#short_info').hide();
		$('#info').show();
	})
	
	$(document).ready(function(){
		var oldMsg = getCookie(window.location.href+"_msg");// alert(oldMsg);
		if(oldMsg != null){
			$("textarea").val(oldMsg).addClass("textAreaChanged");
			$(".newLeaveB span").html(oldMsg.length);
		}
	});


	/**
	 * 举报
	 */
	$('#report,#report_bf').click(function() {
		var islogin = checkLogin.isLogin('ajaxLoginCallback-jobflag-'+informJobflag+'');
		checkLogin.dialog.resetSize(498);
		if(islogin){
			checkLogin.dialog.setContent({
				title: '举报',
				content: informJobflagCont,
				isOverflow: true
			}).resetSize(610, 'auto').show().off('loadComplete').on('loadComplete', function(){
				this.oneCloseEvent('#btnComplaint');
			});
		}
	});


	//提交留言
	$('#submitMessage').click(function(){
		if($('textarea').val().replace(/^\s*$/g,'')  != '' && ($('textarea').hasClass('textAreaChanged'))){
    		setCookie(window.location.href+"_msg",$('textarea').val());
		}
		var islogin = checkLogin.isLogin('ajaxLoginCallback');
        checkLogin.dialog.resetSize(498); 
        if(islogin){
        	var message = $('textarea').val();
    		var url = "/company/ajaxSubmitMessage/";
    		if(message.replace(/^\s*$/g,'')  == '' || !($('textarea').hasClass('textAreaChanged'))){
    			ConfrimBox.timeBomb("留言内容不能为空！", {
					width : 240,
					name : 'warning'
				});
    			return false;	
    		}else{
    			$.post(url,{'company_id':$(this).attr('data-cid'),'content':message,'from':'12'},function(result){
    				delCookie(window.location.href+"_msg");
    				if((typeof result.status !='undefined') && parseInt(result.status)>0) {
    					ConfrimBox.timeBomb(result.message, {
							width : (result.message.length)*32,
							name : 'success'
						});
    					$("textarea").val($("textarea").attr('data-tip')).removeClass('textAreaChanged');
						$(".newLeaveB span").html("0");
    				}else if(parseInt(result.status) == 0){
						ConfrimBox.timeBomb(result.message, {
							width : (result.message.length)*21,
							name : 'warning'
						});
    					setTimeout(function(){window.location.href = result.url;},1000);
    				}else if(parseInt(result.status) == -7){
    					checkLogin.dialog.resetSize(498);
    				}else {
    					 ConfrimBox.timeBomb(result.message, {
							width : (result.message.length)*21,
							name : 'warning'
						});
    				}
    			},'json');
    		}
        }		
	});
	
	   function setCookie(name,value)
	    {
	        var exp = new Date();
	        exp.setTime(exp.getTime() + 60*1000);
	        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
	    }

	    //读取cookies
	    function getCookie(name)
	    {
	        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	     
	        if(arr=document.cookie.match(reg))
	     
	            return unescape(arr[2]);
	        else
	            return null;
	    }

	    //删除cookies
	    function delCookie(name)
	    {
	        var exp = new Date();
	        exp.setTime(exp.getTime() - 1);
	        var cval=getCookie(name);
	        if(cval!=null)
	            document.cookie= name + "="+cval+";expires="+exp.toGMTString();
	    }  	
	//添加关注
	$('.att').click(function(){
		var islogin = checkLogin.isLogin('ajaxLoginCallback');
                 checkLogin.dialog.resetSize(498);
		if(islogin){
			var company_flag = addCompanyFlag;
			var operate = $(this).attr('v');
			var data = {operate:operate,company_flag:company_flag};
			$.post('/company/attention/',data,function(json){
				if(json && json.error){
					ConfirmBox.timeBomb(json.error, {
						name : "warning",
						timeout : 1000,
						width: fontSize * json.error.length + pWidth
					});
					return;
				}
				if(operate == 'add'){
					$('#liAdd').hide();
					$('#liCance').show();
					ConfirmBox.timeBomb("关注成功", {
						name : "success",
						timeout : 3000,
						width: 60
					});
                                       /* $('.nFcswin span').html("关注成功");
                                          $('.nFcswin').show();*/
				} else {
					$('#liAdd').show();
					$('#liCance').hide();
					ConfirmBox.timeBomb("取消关注成功", {
						name : "success",
						timeout : 3000,
						width: 80
					});/*
                     $('.nFcswin span').html("取消关注成功");
                     $('.nFcswin').show();*/
				}
				ConfirmBox.timeBomb(json.info, {
					name : "success",
					timeout : 1000,
					width: fontSize * json.info.length + pWidth
				});
				return;
			},'json');
		}
	});
	$.getJSON('/company/CompanyVisit/company_flag-'+addCompanyFlag+'');
	
});

function ajaxLoginCallback() {
    window.location.href = window.location.href ; 
}


