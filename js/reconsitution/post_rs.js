//职位详情修改xiaofei20190524
hbjs.use('@jobPrettyPhoto, @checkLogin,@fileUploader, @confirmBox, @dialog, @jobsort, @calling, @hbCommon, @jobFlexSlider, @fancybox', function(m){
	var $ = m['jquery'].extend(m['cqjob.jobPrettyPhoto'], m['cqjob.jobsort'], m['cqjob.calling'],  m['cqjob.jobFlexSlider'], m['cqjob.fancybox']),
		fileUploader = m['widge.fileUploader'],
		checkLogin = m['product.checkLogin'],
        cookie     = m['tools.cookie'],
        confirmBox = m['widge.overlay.confirmBox'],
        Dialog     = m['widge.overlay.hbDialog'],
        pWidth = 70,
		fontWidth = 18;

	//浏览第四个职位时弹出登录框
    function getCookie(name){
        var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)"),
            arr = document.cookie.match(reg);
        if (arr != null) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    }
    var count  = getCookie('scanJobDetailWithoutLoginNum');
    var userId = getCookie('userid');
    var is_login = userId>0;
    //20191223注释，去掉登录弹框
    /*if(count == 4&&!is_login) {
        var jobflag = $(this).attr('data-value');
        checkLogin.isLogin('ajaxLoginCallback-jobflag-' + jobflag + '-actiontype-apply-isReload-true');
    }*/
    //检测用户的简历信息
    $.getJSON('/resume/CheckWorkExperience',{},function(re){
        if (!re.status) {
            var id_name = '';
            var title = '';
            if (re.data.code == 'need_resume') {
                id_name = 'need_resume_dialog';
                title = '创建简历';
                return false;
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

	$(".gallery:first a[rel^='prettyPhoto']").prettyPhoto({animation_speed:'fast',slideshow:3000, hideflash: true});
	var liw = 0, ml, r, s;
	$('.piclist li').each(function(){
		liw += $(this).width()+0;
		$(this).css('width',$(this).width()+'px');
	})
	$('.piclist').width( liw + 'px');
	
	$('.pic_next').click(function(){
		
		if($('.piclist').is(':animated')){
			$('.piclist').stop(true,true);
		}/* 避免点击事件重复 */
		
		ml = parseInt($('.piclist').css('left'));
		r = liw - (208 - ml);  /* 700为外部区块.infopic的宽度，15为li之间的距离，即.piclist li的margin-right的值 */
		if(r<208){
			s = r - 0;
		}else{
			s = 208;
		}
		$('.piclist').animate({left: ml - s + 'px'},'slow');			
	})
	
	$('.pic_prev').click(function(){
		
		if($('.piclist').is(':animated')){
			$('.piclist').stop(true,true);
		}/* 避免点击事件重复 */
		
		ml = parseInt($('.piclist').css('left'));
		if(ml>-208){
			s = ml;
		} else {
			s = -208;
		}
		$('.piclist').animate({left: ml - s + 'px'},'slow');			
	});
	
	removeNullTag("info","p");
	checkAll("info","p",5);

	$(document).on('click','.checkAllContent',function(){
		if($(this).attr('id') == 'gather'){
			$("#info").find("p").eq(5).nextAll("p").hide();
			$('.checkAllContent').attr("id","check").html("[查看全部]");
		}else{
			$("#info").find("p").show();
			$('.checkAllContent').attr("id","gather").html("[收起]");
		}
	});
	
	// 申请视频面试
	var applyVideo = new Dialog({
	    close: 'x',
	    idName: 'id_name_applyvideo',
	    title: '提示',
	    width: 430
	});
	var applyVideoHtml = '<div class="applyVideoCode"><span>目前仅<em>手机app</em>支持视频面试，立即<em>扫码下载</em>！！</span><i></i></div>';
	$(document).on('click','.j_apply_radio',function(){
        //var back_url = window.location.href;
        var _this = $(this);
        if (_this.attr('data-is-login') == '0') {
            window.location.href = back_url;
            return false;
        }
        //检查是否有简历
        $.post('/shuangxuannet/checkResume', {sid:_this.attr('data-sid'),person_id:person_id,company_id:company_id}, function(re){
            if (!re.status) {
                confirmBox.confirm("拥有简历的求职者才可参加招聘会，快去添加简历吧",'创建简历',function(obj){
                    this.hide();
                },{
                    width:280,
                    confirmBtn:'<button class="btn3 btnsF12">取消</button>',
                    cancelBtn:'<button class="btn1 btnsF12" onclick="javascript:create_resume();">去创建</button>',
                });
            } else {
                //todo:有简历但不符合招聘会简历要求，且不是在活动当天则提示
                if (!re.data['is_complete']) {
                    confirmBox.confirm("您的简历完善度不符合企业要求，快去完善简历吧",'完善简历',function(obj){
                        this.hide();
                    },{
                        width:280,
                        confirmBtn:'<button class="btn3 btnsF12">取消</button>',
                        cancelBtn:'<button class="btn1 btnsF12" onclick="javascript:update_resume('+re.data['resume_id']+');">去完善</button>',
                    });
                } else {
                    applyVideo.setContent(applyVideoHtml).show();
                }
            }
        }, 'json');
	   /* confirmBox.confirm("拥有简历的求职者才可参加招聘会，快去添加简历吧",'创建简历',function(obj){
	        this.hide();
	    },{
	    	width:280,
			confirmBtn:'<button class="btn3 btnsF12">取消</button>',
			cancelBtn:'<button class="btn1 btnsF12">去创建</button>',
	    }); */
		
		/* confirmBox.confirm("您的简历完善度不符合企业要求，快去完善简历吧",'完善简历',function(obj){
		    this.hide();
		},{
			width:280,
			confirmBtn:'<button class="btn3 btnsF12">取消</button>',
			cancelBtn:'<button class="btn1 btnsF12">去完善</button>',
		}); */
		/*applyVideo.setContent(applyVideoHtml).show();*/
		
			   
	});

    $(document).on('click','#AppPop a',function(){
        $(this).parents("#AppPop").hide();        
    });
    if(isApplyJob){
	    var navH = $("#btnApplyJob").offset().top;
	    //滚动条事件
	    $(window).scroll(function(){
	        //获取滚动条的滑动距离
	        var scroH = $(this).scrollTop();
	        //滚动条的滑动距离大于等于定位元素距离浏览器顶部的距离，就固定，反之就不固定
	        if(scroH > navH){
	            $('#topDivApplyJob').show();
	            $("#topDivApplyJob").css({"position":"fixed","top":0});
	            //$("#btnApplyJob").css({"position":"fixed","top":0});
	        }else if(scroH < navH){
	            $('#topDivApplyJob').hide();
	            //$("#btnApplyJob").css({"position":"absolute","top":''});
	        }
	    });
    }
    $('.ques').mouseover(function(){
        $('.grayAlt').css('left', $(this).position().left);
        $('.grayAlt').html($(this).attr('msg-data'));
        $('.grayAlt').show();
    }).mouseout(function(){
        $('.grayAlt').html('');
        $('.grayAlt').hide();
    });
    var dialog = new Dialog({
        idName : 'work_map',
        content : workMapPost,
        isOverflow : true,
        close : '×',
        title:"上班路线&nbsp;&nbsp;<a href='javascript:;' id='jobMapError' style='float: right; font-size: 12px; height: auto; color:#3d84b8; margin-right: 25px;'>地址有误?</a>",
        width: 850,
        isAjax : true,
        zIndex:9998
    });
    /***********************/
    $("#work_map_btn").on('click',function(){
        dialog.show();
    });
    dialog.on('closeX',function(){
        window.location.reload();
    });
    /***********************/    

	function removeNullTag(id,tag){
		var obj = $("#"+id);
		for(var i=0;i<obj.find(tag).length;i++){
			if(obj.find(tag).eq(i).html().replace(/^\s*$/g,'')  == ''){
				obj.find(tag).eq(i).remove();
			}
		}
	}

    //评价翻页
    $('.page_ajax').live('click',function(){
        $.post('/job/GetAppraise',{page:$(this).attr('data-page'),job_id:evaluationPage},function(e){
            if(e.status){
                $('html,body').animate({scrollTop:$('.newJDuty').offset().top-100},1000);
                $('.appeal-all-item').remove();
                $('.appeal-all-page').remove();
                $('.invite_appraise_div').append(e.data);
            }else{}
        },'json');
    });
    
     //评价内容 -》收起展开
    $(".companyp-switch").click(function(){
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


    //是否有用
    var  can_requist = true;
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
                alert(e.msg);
            }
        },'json');


        return false;
    });
	
	function checkAll(id,tag,num){
		var obj = $("#"+id);
		if(obj.find(tag).length>num){
			obj.find(tag).eq(num-1).nextAll().hide();
			obj.append("<span class='checkAllContent' id='check' style='cursor:pointer;color:#149c95; position:relative;left:570px;'>[查看全部]</span>");
		}	
	}
	//公司简介的标签切换
	$(".newJDutyList li a").click(function(){
		if($(this).parent().hasClass('cut')){
			return false;
		}else{
			$(this).parent().addClass('cut').siblings().removeClass('cut');
			if($(this).attr('class') == 'index-1'){
                $('.newTytit').show();
                $('#company_indroduce').hide();
                $('.invite_appraise_div').hide();
				$('.jobTags_m').show();
			}else if($(this).attr('class') == 'index-2'){
				$('.newTytit').first().removeClass('hide').show();
				$('.newTytit').not(":first").addClass('hide').hide();
                $('.invite_appraise_div').hide();
                $('#company_indroduce').show();
				$('.jobTags_m').hide();
			}
            else{
                //面试评价
                $('.invite_appraise_div').show();
                $('.newTytit').hide();
            }
		}
	})

	var btnShowcontactWay = $('#btnShowcontactWay'),
		contactWayContainer = $('#contactWayContainer');
		
	btnShowcontactWay.on('click', function(){
		var isshowed = cookie.get('showcontactway');
        if (isLogin) {
            showcontactway();
            return;
        }   

		checkLogin.dialog.set('title', null);
		checkLogin.dialog._updateHeader();  
		checkLogin.isPersonLogin('ajaxLoginCallback-jobflag-'+jobflagPost+'', 'person_dialog');
		
	});
	
	var oldMsg = cookie.get(window.location.href + '_msg');
	//var oldMsg = getCookie(window.location.href+"_msg");// alert(oldMsg);
	if(oldMsg != null){
		$("textarea").val(oldMsg).addClass("textAreaChanged");
		$(".newLeaveB span").html(oldMsg.length);
	}

    //一分钟留下简历
    var win = $(window);
    var fixed_box = $('#fixed_box');
    var falg_leav_info = false;

    if(cookie.get('isBottomClose') == undefined) {
        falg_leav_info = true;
        win.on('scroll', function () {
            if(falg_leav_info){
                var scrollTop = $(document).scrollTop() + win.height();//类似当前文档的高度
                var w1 = $('.newJobBg').height();
                if (scrollTop >= w1) {
                    //fixed_box.show();
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
    $(window).scroll(function(){
        if ($(document).scrollTop() > 120){
            $('a.backTopNew').css({'display':'inline-block'});
        }else{
            $('a.backTopNew').css({'display':'none'});
        }
    });
    $('a.backTopNew').click(function() {
        $('html,body').animate({
            scrollTop: 0
        });
    });
    $('.j_company_name').on('click', function(e){
        var userid = cookie.get('userid');
        var is_login = userid > 0;
        if (!is_login) {
            var url = '/job/remenberJobCompanyClick';
            var company_flag = $(this).attr('data-flag');
            if (company_flag) {
                $.post(url,{company_flag:company_flag},function(res){
                    if (res.status) {
                        $('.j_company_name').unbind('click');
                        $('.j_company_name').removeClass('j_company_name');
                        checkLogin.dialog.set('title', null);
                        checkLogin.dialog._updateHeader();
                        var isLogin = checkLogin.isPersonLogin(null, 'person_dialog', '/personregister/applyreg/success-ajaxLoginCallback-fromurl-jobsearch');
                    }
                },'json');
            }
        }
    });
	
    //完善简历
    $(".updateMyResume").on("click",function(){
        var _this = $(this);
        var islogin = checkLogin.isLogin('ajaxLoginCallback-jobflag-'+jobflagPost+'-actiontype-apply-isReload-true-isFromResume-true');
        //判断有没有resume_id
        if(islogin){
            $.ajax({
                url:"/job/GetPersonData",
                type:"post",
                dataType: "json",
                data: {},
                success:function(json){
                    if(json.error){
                        $.anchorMsg(json.error,{ icon: 'warning'});
                        return;
                    }
                    var resume_id = json.resume_id;
                    var complete_percent = json.complete_percent;
                    if(resume_id ==''){
                       _this.off("click");
                       _this.attr('href',''+personLink+'/person/CreateBasic/');
                       _this.attr("target","_blank");
                       window.open(""+personLink+"/person/CreateBasic/");return;
                    }
                    _this.off("click");
                    _this.attr("href",""+personLink+"/resume/update/resume_id-"+resume_id);
                    _this.attr("target","_blank");
                    window.open(""+personLink+"/resume/update/resume_id-"+resume_id);
                    return;
                }
            });
        }
    });
    
    //上传附件简历
    $(".updateResumeAnnex").on("click",function(){
        var islogin = checkLogin.isLogin('ajaxLoginCallback-jobflag-'+jobflagPost+'-actiontype-apply-isReload-true-isFromAnnex-true');
        if(islogin){
            $.ajax({
                url:"/job/GetPersonData",
                type:"post",
                dataType: "json",
                data: {},
                success:function(json){
                    if(json.error){
                       $.anchorMsg(json.error,{ icon: 'warning' });
                       return;
                    }
                    var resume_id = json.resume_id;
                    var complete_percent = json.complete_percent;
                    var user_name = json.user_name;
                    var resume_count = json.resume_count;
                   
                    var sex  = json.sex;
                    if(json.annex_id){
                        $.anchorMsg("您已经上传过附件简历了",{ icon: 'warning' });
                        return;
                    }
//                    console.log(json);
//                    return;
                    if(complete_percent >= 30 || resume_count > 1){
                        //你已有简历，请完善
                       confirmBox.confirm("你已有简历，请完善",'提示',function(obj){
                           var self = this;
                           self.hide();
                           window.open(""+personLink+"/resume/update/resume_id-"+resume_id);
                       },{
                       	width:280
                       });
                        return;
                    }
                    uploadMyAnnexFile(user_name,sex);
                }
            });
        }
    });

    function uploadMyAnnexFile(user_name,sex){
          //简历附件
            var templateHtml = getUploudHtml(user_name,sex);
            var templateDialog = new Dialog({
                idName: 'uppwd_dialog',
                title: '上传附件简历',
                content: templateHtml,
                close: '╳',
                width: 550
            });
            var uploadObj = templateDialog.query(".uploadFailPop");
            uploadObj.on("click",".radsexz label",function(){
                var thisValue = $(this).attr('data-value');
		$(this).addClass('icon-sex-checked').siblings().removeClass('icon-sex-checked');
		uploadObj.find("#radSex").val(thisValue);
            });
            uploadObj.on("click",".radTypex label",function(){
                var thisValue = $(this).attr('data-value');
		$(this).addClass('cut').siblings().removeClass('cut');
		uploadObj.find('#radTypeq').val(thisValue);
		if(thisValue == 1){
			uploadObj.find('.uploadWord').show();
			uploadObj.find('.uploadImg').hide();
			
		}else{
			uploadObj.find('.uploadWord').hide();
			uploadObj.find('.uploadImg').show();
		}
            });
             uploadObj.on("click",".cancelUpload",function(){
            	templateDialog.hide();
            });
            uploadObj.on("click",".deleteDoc",function(){
                uploadObj.find(".docImag").attr("src","");
                uploadObj.find(".docName").html("");
                uploadObj.find("input[name='newDocName']").val("");
                uploadObj.find("input[name='oldDocName']").val("");
                uploadObj.find(".uploadWordShow").hide(); 
            });
            uploadObj.on("click",".canNotUpload",function(){
               $.anchorMsg("最多上传10张图片",{ icon: 'warning' });return;
            });
            uploadObj.on("click",".deleteImage",function(){
                $(this).parent("span").remove();
                 //判断上传的张数
                var count = uploadObj.find(".uploadImgList span").size();
                if(count <= 0){
                   uploadObj.find(".uploadImgList").hide(); 
                }
                if(count < 10){
                    uploadObj.find(".doUpload").show();
                    uploadObj.find(".canNotUpload").hide();
                }
            });
            //保存
            uploadObj.on("click",".uploadBtn",function(){
                var user_name = uploadObj.find('#upload_name').val();
                var radTypeq = uploadObj.find('#radTypeq').val();
                var radSex = uploadObj.find('#radSex').val();
                
		if(user_name == ''){
                    $.anchorMsg("请填写姓名",{ icon: 'warning' });
                    return;
		}
                //上传
                var doc_name = "";
                var old_doc_name = "";
                var imgs        =[];
                var filesize    = uploadObj.find("input[name='filesize']").val();
                if(radTypeq == 1){
                     doc_name       = uploadObj.find("input[name='newDocName']").val();
                     old_doc_name   = uploadObj.find("input[name='oldDocName']").val();
                     if(doc_name == "" || old_doc_name ==""){
                        $.anchorMsg("请上传附件文档",{ icon: 'warning' });
                        return;
                     }
                }else if(radTypeq == 2){
                    uploadObj.find(".uploadImgList span").each(function(){
                        var _img_name = $(this).attr("data-name");
                        var _img_oldname = $(this).attr("data-oldname");
                        imgs.push({'name':_img_name,'old_name':_img_oldname});
                    });
                    if(imgs.length <= 0){
                         $.anchorMsg("请上传附件图片",{ icon: 'warning' });
                        return;
                    }
                }
                
                //开始上传
                var upload_data = {'user_name':user_name,'type':radTypeq,'sex':radSex,'doc_name':doc_name,'old_doc_name':old_doc_name,'imgs':imgs,'filesize':filesize};
                $.ajax({
                    url:"/job/SaveUploadAnNeeFile",
                    type:"post",
                    dataType: "json",
                    data: upload_data,
                    success:function(json){
                        if(json.error){
                            $.anchorMsg(json.error,{ icon: 'warning' });
                            return;
                        }
                        $.anchorMsg("上传成功");
                        templateDialog.hide();
                    }
                });
                
                
            });
            templateDialog.show();
            uplouadFile(uploadObj);
            uplouadDoc(uploadObj);
    }
    
    function uplouadFile(obj){
      var avaterFile = new fileUploader({
                    trigger:obj.find(".doUpload"),
                    fileName: 'imageFile',//文件上传名
                    uploadURL: "/job/UploadAnNeeFile/type/2/",
                    imageURL: null,  
                    max: 1,
                    fileExt: '.jpg,.png,.jpeg',
                });

                avaterFile.on('startUpload', function(e){
                    //上传开始
                    //隐藏上传按钮
                    obj.find(".imgloading").show();
                    obj.find(".doUpload").hide();
                    
                    
                });
                
                //上传失败
                avaterFile.on('progressError', function(e){
                    if(e.errorMsg){
                         $.anchorMsg(e.errorMsg,{ icon: 'warning' });
                        return;
                   }
                    obj.find(".imgloading").hide();
                    obj.find(".doUpload").show();
                    var json = e.data;
                    $.anchorMsg(json.errorMsg,{ icon: 'warning' });
                    return;
                });
                avaterFile.on('progresed', function(e){
                    //上传成功
                    obj.find(".imgloading").hide();
                    obj.find(".doUpload").show();
                    var data = e.data;
                    var url = data.url;
                    var name = data.name;
                    var oldname = data.old_name;
                    var html = "<span data-name='"+name+"'  data-oldname='"+oldname+"'>"+'<img src="'+url+'"/>'
				+'<em>'+oldname+'</em>'
				+'<i class="deleteImage"></i>'
				+'</span>';
                    obj.find(".uploadImgList").append(html);  
                    obj.find(".uploadImgList").show(); 
                     //判断上传的张数
                    var count = obj.find(".uploadImgList span").size();
                    if(count >=10){
                        obj.find(".doUpload").hide();
                        obj.find(".canNotUpload").show();
                    }
                });
    }
    
    function uplouadDoc(uploadObj){
      var avaterDoc = new fileUploader({
                    trigger:uploadObj.find(".doUploadDoc"),
                    fileName: 'imageFileDoc',//文件上传名
                    uploadURL: "/job/UploadAnNeeFile/type/1/",
                    imageURL: null,  
                    max: 1,
                    fileExt: '.doc,.docx',
                });

                avaterDoc.on('startUpload', function(e){
                      //上传开始
                      uploadObj.find(".docloading").show();
                      uploadObj.find(".doUploadDoc").hide();
                });

                //上传失败
                avaterDoc.on('progressError', function(e){
                   if(e.errorMsg){
                         $.anchorMsg(e.errorMsg,{ icon: 'warning' });
                        return;
                   }
                    var json = e.data;
                     uploadObj.find(".docloading").hide();
                     uploadObj.find(".doUploadDoc").show();
                    $.anchorMsg(json.errorMsg,{ icon: 'warning' });
                    return;
                });
                avaterDoc.on('progresed', function(e){
                     uploadObj.find(".docloading").hide();
                     uploadObj.find(".doUploadDoc").show();
                
                    //上传成功
                    var data = e.data;
                    var url = data.url;
                    var name = data.name;
                    var oldname = data.old_name;
                    var filesize = data.filesize;
                    uploadObj.find(".docImag").attr("src",url);
                    uploadObj.find(".docName").html(oldname);
                    uploadObj.find("input[name='newDocName']").val(name);
                    uploadObj.find("input[name='oldDocName']").val(oldname);
                    uploadObj.find("input[name='filesize']").val(filesize);
                    uploadObj.find(".uploadWordShow").show(); 
                });
    }
    
    function getUploudHtml(user_name,sex){
       
        var default_sex = sex == 2 ? 2 : 1;
        var sex_selected1 = default_sex == 1 ? 'icon-sex-checked' : "";
        var sex_selected2 = default_sex == 2 ? 'icon-sex-checked' : "";
        var html = '<div id="myUploadFile" class="uploadFailPop">'
			+'<span class="uploadTips">系统将在12小时内将你上传的附件简历转化为在线简历</span>'
			+'<div class="uploadForm">'
				+'<div class="formMod">'
					+'<div class="l">姓名：</div>'
					+'<div class="r">'
					+'<span class="formText">'
						+'<input type="text" name="" id="upload_name" value="'+user_name+'" class="text" style="width:300px;">'
					+'</span>'
					+'</div>'
				+'</div>'
				+'<div class="formMod">'
					+'<div class="l">性别：</div>'
					+'<div class="r radsexz">'
						+'<label class="icon-sex '+sex_selected1+'" data-value="1">'
							+'<em class="icon-sex1"></em>男'
						+'</label>'
						+'<label class="icon-sex '+sex_selected2+'" data-value="2">'
							+'<em class="icon-sex2"></em>女'
						+'</label>'
						+'<input type="hidden" name="radSex" id="radSex" value="'+default_sex+'" />'
					+'</div>'
				+'</div>'
				+'<div class="formMod">'
					+'<div class="l">类型：</div>'
					+'<div class="r radTypex">'
						+'<label class="radTypez cut" data-value="1">'
							+'doc、docx文档'
						+'</label>'
						+'<label class="radTypez" data-value="2">'
							+'jpg、png、jpeg'
						+'</label>'
						+'<input type="hidden" name="radTypeq" id="radTypeq" value="1" />'
					+'</div>'
				+'</div>'
				
				+'<div class="formMod">'
					+'<div class="l">上传：</div>'
					+'<div class="r">'
						+'<div class="uploadWord">'
							+'<div class="uploadWordx">'
								+'<a href="javascript:;" class="doUploadDoc" >上传</a>'
                                                                +'<span class="updateloading docloading" style="display:none"><img src="'+stylePost+'/img/common/loading.gif"/>上传中...</span>'
                                                               
								+'<span>（请传小于5M的文件）</span>'
							+'</div>'
                                                        +'<input type="hidden" name="newDocName" />'
                                                        +'<input type="hidden" name="oldDocName" />'
                                                        +'<input type="hidden" name="filesize" />'
							+'<div class="uploadWordShow" style="display:none">'
								+'<img class="docImag" src=""/>'
								+'<span class="docName"></span>'
								+'<a href="javascript:;" class="deleteDoc">删除</a>'
							+'</div>'
						+'</div>'
						+'<div class="uploadImg">'
							+'<div class="uploadImgx">'
								+'<a href="javascript:;" class="doUpload">上传</a>'
                                                                +'<span class="updateloading imgloading" style="display:none"><img src="'+stylePost+'/img/common/loading.gif"/>上传中...</span>'
                                                                +'<a href="javascript:;" class="canNotUpload" style="display:none">上传</a>'
								+'<span>（限10张，请传小于5M的文件）</span>'
							+'</div>'
							+'<div class="uploadImgList" style="display:none">'
								
							+'</div>'
						+'</div>'
					+'</div>'
				+'</div>'
                            +'<div class="dialogFooter">'
					+'<a href="javascript:;" class="btn3 btnsF14 cancelUpload">取消</a>	'
					+'<a href="javascript:;" class="btn1 btnsF14 uploadBtn">确定</a>	'
                            +'</div>'
			+'</div>'
		+'</div>';
                return html;
    }
    


    
	//投个简历
	$('#posRum,#btnApplyJob,#topDivApplyJob').click(function() {
        checkLogin.dialog.set('title', null);
        checkLogin.dialog._updateHeader();                
		var islogin = checkLogin.isLogin('ajaxLoginCallback-jobflag-'+jobflagPost+'-actiontype-apply-isReload-true');

		if (islogin) {
		    //已达投递上线限弹窗提示
	        if (OverplusApplycount == 0) {
                var dialog_limit = new Dialog({
    				idName : 'apply_limit',
    				title : '提示',
    				content : '/job/Applylimit/'+'-v-'+Math.random(),
    				isOverflow : true,
    				close : 'x',
    				isAjax : true
				});

                dialog_limit.resetSize(360).show();
				$(".apply_limit").on("click", "#btnCloseLimitMsg", function (e) {
					dialog_limit.hide();
				});
                return false;
            }


            $.ajax({
                url : applyedCompanyPost,
                type : "GET",
                dataType : "JSON",
                async : false,
                success: function (e) {
                    // console.log(e)
                    if (e.status) {
                        content = '<p class="alert-p">你已投递该公司的<em>&lt;' + e.data + '&gt;</em>的职位，确定要再投递<em>&lt;'+stationPost+'&gt;</em>的职位</p>'
                            + '<p class="alert-p-red">同时投递多份无关的职位，会给企业留下您职位定位不清的印象</p>'
                            + '<p class="alert-p-red">将大大降低您的面试概率</p>'
                        confirmBox.confirm(content, '温馨提示', function() {
                            this.hide();
                        }, function () {
                            this.hide();
							
                            //未达投递上限 显示投递弹窗
                            var dialog = new Dialog({
                                idName : 'apply_job',
                                title : '投个简历<label style="font-size:14px;color:#000000">&nbsp;&nbsp;(今日还可投递</label><label style="font-size:16px;color:red">' +OverplusApplycount + '</label><label style="font-size:14px;color:#000000">个职位)</label>',
                                content : applyResoucePost,
                                isOverflow : true,
                                close : 'x',
                                isAjax : true
                            });
							var isDialog = true;
							dialog.on('closeX', function(){
								this.destory();
								isDialog = true;
							});
                            dialog.resetSize(586).show();
							
                            $(".apply_job").find("input[type='radio'][class='radio'][id^='re']").removeAttr("checked");
                            $(".apply_job").find("input[type='radio'][class='radio'][id^='re']").eq(0).attr("checked","checked");
                            $(".apply_job").on("click", "input[type='radio'][class='radio'][id^='re']", function (e) {
                                $(".apply_job").find("input[type='radio'][class='radio'][id^='re']").removeAttr("checked");
                                $(this).attr("checked","checked");
                            });

                            //console.log(dialog);
                            //立即投递
                            $(".apply_job").on("click", "#btnApply", function(e) {
								if(!isDialog){
									alert('已经投递过了');
									return;
								}
                                //判断是否需要完善简历
                                var resume_id = $(".apply_job").find("input[type='radio'][class='radio'][name='resumeId'][checked]").val();
								// console.log('判断是否需要完善简历上传的简历resume_id',resume_id)
                                $.getJSON('/job/needNoticeComplete/?resumeid='+resume_id, function(result){
                                    // console.log('完善简历的条件判断resule.need_notice:',result.need_notice)
                                    if(result.need_notice){
                                        confirmBox.confirm(
                                            "您的简历中有部分关键信息尚未完善，可能会影响投递效果。建议完善简历以后，再进行投递~", 
                                            '提示', 
                                            function() {
                                                //不再提示
                                                var _self = this;
                                                $.getJSON('/job/setNotNoticeComplete/', function(result){
                                                    confirmBox.alert("设置成功",function(){
                                                        _self.hide();
                                                    });
                                                });
                                            }, 
                                            function () {
                                                //完善简历
                                                window.open(perResumePost+resume_id);
                                                this.hide();
                                            },
                                            {
                                                confirmBtn:'<button class="button_a cancelbtn">不再提示</button>',
                                                cancelBtn:'<button class="button_a button_a_red">完善简历</button>',
                                                width:300
                                            }
                                        );
                                    }else{
                                        //原有投递简历逻辑
                                        isDialog = false;
                                        if(!auto_filter){
                                            //未开启职位自动过滤
                                            $(".apply_job").find("#frmApply")[0].submit();
                                            return false;
                                        } else {
                                            //已开启职位自动过滤
                                            dialog.hide();
                                            var sle_resumeId= $(".apply_job").find("input[type='radio'][class='radio'][name='resumeId'][checked]").val();

                                            //投递职位信息匹配
                                            $.ajax({
                                                url:'/job/MatchingApplyResume/',
                                                type:"post",
                                                data:'jobflag='+jobflagPost+'&resume_id='+sle_resumeId,
                                                dataType:"json",
                                                success:function(json){
                                                    isDialog = true;
                                                    var msg = json.msg, re_apply_type = reApplyType > 0 ? reApplyType : '5';
                                                    if(json.status==false){
                                                        //具有和投递职位不匹配信息进行弹窗提示
                                                        confirmMsg = '您简历中<span style="color:red;">'+msg+'</span>与职位要求不匹配，企业可能需要时间考虑，但企业会在<span style="color:red;">'+re_apply_type+'个工作日内</span>查看并回复您。确认投递吗？';
                                                        confirmBox.confirm(
                                                                confirmMsg,
                                                                '投递确认',
                                                                function(){
                                                                    $(".apply_job").find("#frmApply")[0].submit();
                                                                    this.hide();
                                                                    dialog.destory();
                                                                    return false;
                                                                },
                                                                function(){
                                                                    dialog.destory();
                                                                },
                                                                {
                                                                    idName: 'apply_mismatching',
                                                                    isOverflow: true,
                                                                    close:'x',
                                                                    width:'400px'
                                                                }
                                                        );
                                                    }else{
                                                        $(".apply_job").find("#frmApply")[0].submit();
                                                        return false;
                                                    }
                                                }
                                            });
                                        }
                                        //原有投递简历结束
                                    }
                                });
                                //新加是否提示完善简历弹窗结束
                            });

                            if(has_resume_count == 1){
                                $('.apply_job').hide()
                                ResTimer=setInterval(function () {
                                    $('.apply_job').hide()
                                    if($(".apply_job").find("#btnApply")) {
                                        $(".apply_job").find("#btnApply")[0].click();
                                        clearInterval(ResTimer)
                                    }
                                },500)
                            }

                        }, {
                            width : 600,
                            close : 'x',
                            confirmBtn: '<button class="btn3" style="height:35px;width:110px;border-radius: 3px;display: inline-block; font-family:微软雅黑; font-size: 14px; line-height: 35px; margin: 10px 40px; padding: 0 15px; cursor:pointer;">放弃</button>',
                            cancelBtn: '<button class="btn3 cancelbtn" style="height:35px;width:110px;border-radius: 3px;display: inline-block; font-family:微软雅黑; font-size: 14px; line-height: 35px; margin: 10px 5px; padding: 0 15px; cursor:pointer;">继续投递</button>'
                        });
                    } else {
                         //未达投递上限 显示投递弹窗
                        var dialog = new Dialog({
                            idName : 'apply_job',
                            title : '投个简历<label style="font-size:14px;color:#000000">&nbsp;&nbsp;(今日还可投递</label><label style="font-size:16px;color:red">' +OverplusApplycount + '</label><label style="font-size:14px;color:#000000">个职位)</label>',
                            content : applyResoucePost,
                            isOverflow : true,
                            close : 'x',
                            isAjax : true
                        });
						var isDialog = true;
						dialog.on('closeX', function(){
							this.destory();
							isDialog = true;
						});
                        dialog.resetSize(586).show();
                        $(".apply_job").find("input[type='radio'][class='radio'][id^='re']").removeAttr("checked");
                        $(".apply_job").find("input[type='radio'][class='radio'][id^='re']").eq(0).attr("checked","checked");
                        $(".apply_job").on("click", "input[type='radio'][class='radio'][id^='re']", function (e) {
                            $(".apply_job").find("input[type='radio'][class='radio'][id^='re']").removeAttr("checked");
                            $(this).attr("checked","checked");
                        });

                        //console.log(dialog);
                        //立即投递
                        $(".apply_job").on("click", "#btnApply", function(e) {
							if(!isDialog){
								alert('已经投递过了');
								return;
							}
                            //判断是否需要完善简历
                            var resume_id = $(".apply_job").find("input[type='radio'][class='radio'][name='resumeId'][checked]").val();
                            // console.log('判断是否需要完善简历上传的简历resume_id',resume_id)
                            $.getJSON('/job/needNoticeComplete/?resumeid='+resume_id, function(result){
                                // console.log('完善简历的条件判断resule.need_notice:',result.need_notice)
                                if(result.need_notice){
                                    confirmBox.confirm(
                                        "您的简历中有部分关键信息尚未完善，可能会影响投递效果。建议完善简历以后，再进行投递~", 
                                        '提示', 
                                        function() {
                                            //不再提示
                                            var _self = this;
                                            $.getJSON('/job/setNotNoticeComplete/', function(result){
                                                confirmBox.alert("设置成功",function(){
                                                    _self.hide();
                                                });
                                            });
                                        }, 
                                        function () {
                                            //完善简历
                                            window.open(perResumePost+resume_id);
                                            this.hide();
                                        },
                                        {
                                            confirmBtn:'<button class="button_a cancelbtn">不再提示</button>',
                                            cancelBtn:'<button class="button_a button_a_red">完善简历</button>',
                                            width:300
                                        }
                                    );
                                }else{
                                    //原有投递逻辑
                                    isDialog = false;

                                    if(!auto_filter){
                                        //未开启职位自动过滤
                                        $(".apply_job").find("#frmApply")[0].submit();
                                        return false;
                                    } else {
                                        //已开启职位自动过滤
                                        dialog.hide();
                                        var sle_resumeId= $(".apply_job").find("input[type='radio'][class='radio'][name='resumeId'][checked]").val();
                                        var re_apply_type = reApplyType;//是否承诺职位
                                        //投递职位信息匹配
                                        $.ajax({
                                            url:'/job/MatchingApplyResume/',
                                            type:"post",
                                            data:'jobflag='+jobflagPost+'&resume_id='+sle_resumeId,
                                            dataType:"json",
                                            success:function(json){
                                                isDialog = true;
                                                var msg = json.msg , re_apply_type = reApplyType > 0 ? reApplyType : '5';
                                                if(json.status==false){
                                                    //具有和投递职位不匹配信息进行弹窗提示
                                                    confirmMsg = '您简历中<span style="color:red;">'+json.msg+'</span>与职位要求不匹配，企业可能需要时间考虑，但企业会在<span style="color:red;">'+re_apply_type+'个工作日内</span>查看并回复您。确认投递吗？';
                                                    confirmBox.confirm(
                                                            confirmMsg,
                                                            '投递确认',
                                                            function(){
                                                                $(".apply_job").find("#frmApply")[0].submit();
                                                                this.hide();
                                                                dialog.destory();
                                                                return false;
                                                            },
                                                            function(){
                                                                dialog.destory();
                                                            },{
                                                                idName: 'apply_mismatching',
                                                                isOverflow: true,
                                                                close:'x',
                                                                width:'400px'
                                                            }
                                                    );
                                                }else{
                                                    $(".apply_job").find("#frmApply")[0].submit();
                                                    return false;
                                                }
                                            }
                                        });
                                    }
                                    //原有投递逻辑结束
                                }
                            });
                            //是否需要提示完善简历结束
                        });


                        if(has_resume_count == 1){
                            $('.apply_job').hide()
                            ResTimer=setInterval(function () {
                                $('.apply_job').hide()
                                if($(".apply_job").find("#btnApply")) {
                                    $(".apply_job").find("#btnApply")[0].click();
                                    clearInterval(ResTimer)
                                }
                            },500)
                        }
                    }
                }
            });

            
		}
	});
		
	
	$('#open2').click(function() {
		var islogin = checkLogin.isPersonLogin('ajaxLoginCallback', 'person_dialog');
		if(islogin){
			checkLogin.dialog.clearClass().setContent({
				content: 'http://www.abc.com/personregister/modifylogin/jobflag-jobi4isf55-flag-eaf6351c65b16bcef0f83e89df6526c5-personid-230005246-v-0.8650199427735047',
				isOverflow: true
			}).resetSize(586).show();
		}
	});

    $('#open3').click(function() {
        var islogin = checkLogin.isPersonLogin('ajaxLoginCallback', 'person_dialog');
        if(islogin){
            checkLogin.dialog.clearClass().setContent({
                content: 'http://www.abc.com/personregister/registersuccess/jobflag-jobi4isf55-v-0.6399117458989251',
                isOverflow: true
            }).resetSize(1000).show();
        }
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
    		confirmBox.timeBomb("留言长度不能超过200字", {
				width : 250,
				name : 'warning'
			});
    		$(this).parents(".newMessage").find("span").text(200);
    		$(this).val($(this).val().substr(0,max));
    	}
    });
    $("textarea").focus(function(){
        
    	if(!$(this).hasClass('textAreaChanged')){
    		$(this).val("");
    		$(this).addClass('textAreaChanged');
    	}
    });
    
    $("textarea").blur(function(){
    	if($(this).val().replace(/^\s*$/g,'')  == ''){
    		$(this).val($(this).attr('data-tip'));
    		$(this).removeClass('textAreaChanged');
    	}
    });
    
    $('#submitMessage').click(function(){
    	if($('textarea').val().replace(/^\s*$/g,'')  != '' && ($('textarea').hasClass('textAreaChanged'))){
			var d = new Date();
        	d.setTime(d.getTime() + 60 * 1000);
			cookie.set(window.location.href + '_msg', $('textarea').val(), {expires: d});
			
    		//setCookie(window.location.href+"_msg",$('textarea').val());
		}
    	var islogin = checkLogin.isLogin('ajaxLoginCallback-jobflag-'+jobflagPost+'');
		checkLogin.dialog.resetSize(498);  
        if(islogin){
        	var message = $('textarea').val();
    		var url = asMessagePost; //alert(message);alert($(this).hasClass('textAreaChanged'));
    		if(message.replace(/^\s*$/g,'')  == '' || !($('textarea').hasClass('textAreaChanged'))){
    			confirmBox.timeBomb("留言内容不能为空！", {
					width : 240,
					name : 'warning'
				});
    			return false;		
    		}else{
    			$.post(url,{'content':message,'from':'11'},function(result){
					cookie.remove(window.location.href + '_msg');
    				//delCookie(window.location.href+"_msg");
    				if((typeof result.status !='undefined') && parseInt(result.status)>0) { 
    					confirmBox.timeBomb(result.message, {
							width : (result.message.length)*32,
							name : 'success'
						});
						$("textarea").val($("textarea").attr('data-tip')).removeClass('textAreaChanged');
						$(".newLeaveB span").html("0");
    				}else if(parseInt(result.status) == 0){
    					confirmBox.timeBomb(result.message, {
							width : (result.message.length)*21,
							name : 'warning'
						});
    					setTimeout(function(){window.location.href = result.url;},1000);
    				}else if(parseInt(result.status) == -7){
    					checkLogin.dialog.resetSize(498);
    				}else { 
    					confirmBox.timeBomb(result.message, {
							width : (result.message.length)*21,
							name : 'warning'
						});
    				}
    				
    			},'json');
    		}
        }		
	});
	/**
	* 举报
	*/
	$('#report,#report_bf').click(function() {
		var islogin = checkLogin.isLogin('ajaxLoginCallback-jobflag-'+jobflagPost+'');
		checkLogin.dialog.resetSize(498);
		if(islogin){
			checkLogin.dialog.setContent({
				title: '举报',
				content: informPost,
				isOverflow: true
			}).resetSize(610, 'auto').show().off('loadComplete').on('loadComplete', function(){
				this.oneCloseEvent('#btnComplaint');
			});
		}
	});

    /**
     * 留言
     */
    $('#message').click(function() {
        var islogin = checkLogin.isLogin('ajaxLoginCallback-jobflag-'+jobflagPost+'');
		checkLogin.dialog.resetSize(498);
        if(islogin){
            checkLogin.dialog.setContent({
                title: '有疑问？给TA留言',
                content: leaveWordPost,
                isOverflow: true
            }).resetSize(610, 'auto').show().off('loadComplete').on('loadComplete', function(){
                this.oneCloseEvent('#btnCloseGuestBook');
            });
        }

    });
	
	var btnFav = $('#btnFav,#btnFav_bf');
	btnFav.click(function(){
		var islogin = checkLogin.isLogin('ajaxLoginCallback-jobflag-'+jobflagPost+'');
		checkLogin.dialog.resetSize(498);
		if(islogin){
			$.getJSON(collectPost,function(result) {
				if(result.error){
					 confirmBox.timeBomb(result.error, {
						name: 'fail',
						width: pWidth + result.error.length * fontWidth
					});
				} else if(result.success){
					confirmBox.timeBomb(result.success, {
						name: 'success',
						width: pWidth + result.success.length * fontWidth
					});
					
					btnFav.addClass('Unclick').html('已收藏').unbind();
				}		
			});
		}
	});

	$('#btnMore').mouseover(function() {
		$('#companyDesc').show();
		var height = $('#companyDesc').find('.detTipTxt').height(),
			tipheight = $('#companyDesc').find('.detTipArr').find('span').height();
		var top = (height - tipheight)/2;
		$('#companyDesc').find('.detTipBd').css('top',-top);
	}).mouseout(function(){
		$('#companyDesc').hide();
	});
	
	
	function showcontactway(){
		$.getJSON(getcontactwayPost,function(result) {

            if(result.status)
            {
                $('#show_phone_s').html('<strong>'+ result.linkway +'</strong>');
            }else{
                alert(result.msg);
            }

		});
	}
	
	$.getJSON(jobVisitPost);
	tabs('.newJobPdt');
	$('.newJshare').hover(function(){
		$('.newJect2').toggleClass('newJectCur');
		$('.newJsbg').toggle();							   
	});
	function tabs(callback){
		var tab = $(callback),tab_t=tab.find(".nPdtLit a"),
			tab_c = tab.find(".nPdtbg .nPdtL");
		tab_t.hover(function(){
			var _this = $(this);
			var lis = tab_t.index(this);
			tab_t.removeClass("cur");
			_this.addClass("cur");
			tab_c.hide();
			tab_c.eq(lis).show();
		});
	}


	//取消在线沟通弹窗提示
    var registerDialog;
    function showRegisterDialog(registerContent){
        if(!registerDialog){
            registerDialog = new Dialog({
                idName: 'new-sign-pop-dialog',
                width: 420,
                close: 'x',
                title:'温馨提示'

            });
            //不需要！
        }
        registerDialog.query('#companyVerCommit').off('click');
        registerDialog.setContent(registerContent);
        registerDialog.query('#companyVerCommit').on('click', function(){
            registerDialog.hide();
        });
        registerDialog.show();
    }
    function getalertHtml()
    {
        var tmp_str  = [
            '<div style="padding:30px">',
            '<p style="font-size:14px;color:#666;line-height:25px">扫描二维码，安装<strong style="color:#d73937">汇博求职APP</strong>，和企业即时沟通。聊着天，就把工作搞定了。</p>',
            '<p style="margin:30px auto 0;text-align: center"><img src="'+stylePost+'/img/p/login/popz_code.png" /></p>',
            '</div>'
        ].join('');
        return tmp_str;
    }


    $('#comuit_compnyer').click(function(){
        showRegisterDialog(getalertHtml());
    });


	$('#lst').find('tr').hover(function(){
		$(this).addClass('hov');},function(){
		$(this).removeClass('hov');
	});

	$('.flexBanner').flexslider({
		animation:"slide",
		itemWidth:263,
		itemMargin:0,
		prevText:'&#xf053;',
		nextText:'&#xf054;',
		pauseOnAction:false,
		pauseOnHover:true,  
		move:5,
		controlNav:false
	});
	
	$('.fancybox-thumbs').fancybox({
		closeBtn  : true,
		arrows    : true,
		helpers : {
			thumbs : {
				width  : 100,
				height : 100
			}
		},
		beforeShow:function(){
			$('.flexBanner').flexslider('pause');
		},
		afterClose:function(){
			$('.flexBanner').flexslider('play');
		}
	});

	$('.fancybox-media').attr('rel', 'media-gallery')
	.fancybox({
		openEffect : 'none',
		closeEffect : 'none',
		prevEffect : 'none',
		nextEffect : 'none',

		arrows : false,
		helpers : {
			media : {},
			buttons : {}
		},
		beforeShow:function(){
			$('.flexBanner').flexslider('pause');
		},
		afterClose:function(){
			$('.flexBanner').flexslider('play');
		}
	});

    setTimeout(function () {
        var page_now = pageNowPost;
        if(parseInt(page_now)>1){
            $('.index-3').click();
        }
    },500);

    $('#j_person_phone').on('input',function(){
        var phone = $(this).val();
        if(phone.length == 11){
            //查询今日登录的次数
            var pattern = /^[1]\d{10}$/;
            if(pattern.exec(phone)){
                $.post("/login/GetPersonLoginTimes",{mobile_phone:phone},function(r){
                    if(r.status){
                        if(r.count>4){
                            $('#jverifycodemobile').show();
                        }
                        $('#loginTimeCount').val(r.count);
                    }else{
                        confirmBox.alert('系统错误，请刷新后重试');
                        return false;
                    }
                },'json')
            }else{
                $('#jverifycodemobile').hide();
            }
        }else{
            $('#jverifycodemobile').hide();
        }
    });

    //发送验证码
    $('#jbtnSendValidate').click(function(){
        if ($("#loginTimeCount").val() > 4){
            //判断是否输入图片验证码
            var txtcode = $("#j_img_verify_code").val();
            if(txtcode.length <= 0){
                confirmBox.alert('请输入图片验证码');
                return;
            }
        }
        sendMsg();
    });

    //发送手机验证码
    function sendMsg(){
        var sendMsgUrl = $('#j_person_login_url').val();
        var phone = $('#j_person_phone').val();
        if(phone==''){
            confirmBox.alert('请输入手机号码');
            return;
        }
        var pattern = /^[1]\d{10}$/;
        if(!pattern.exec(phone)){
            confirmBox.alert('手机号码格式不正确');
            return;
        }
        $('#jbtnSendValidate').unbind('click');
        //验证码 和seed
        var seed = $("#j_seed").val();
        var catcha = $("#j_img_verify_code").val();
        var vali_code_count=$('#vali_code_count').val();
        var data={txtPhone:$('#j_person_phone').val(),seed:seed,catcha:catcha,vali_code_count:vali_code_count,loginTimeCount:$("#loginTimeCount").val()};
        $.getJSON(sendMsgUrl,data,function(result){
            if(result && result.error){
                $('#jbtnSendValidate').bind("click",function(){
                    sendMsg();
                });
                $('#imgCode').click();
                confirmBox.alert(result.error);
                return;
            }
            $('#jbtnSendValidate').addClass('nameBtnavt').html('<i>60</i>秒后重新获取');
            confirmBox.alert('已发送验证码短信到您的手机');
            $('#j_verify_code').focus();
            $('#vali_code_count').val(parseInt($('#vali_code_count').val())+1);
            interval = window.setInterval(countdown,1000);
        });
    }
    //发送手机验证码
    function countdown(){
        var seconds=$('#jbtnSendValidate').find('i').html();
        seconds = parseInt(seconds);
        if(seconds>0){
            seconds--;
            $('#jbtnSendValidate').find('i').html(seconds);
        }else{
            window.clearInterval(interval);
            $('#jbtnSendValidate').removeClass('nameBtnavt').html('免费获取验证码').bind("click",function(){
                sendMsg();
            });
        }
    }
    //点击求职者登录或注册
    $('#jbtnMoilbPhoneRegister').on('click',function(){
        var phone = $('#j_person_phone').val();
        var verify_code = $('#j_verify_code').val();
        var p = phone == '' || phone == null;
        var c = verify_code == '' || verify_code == null;
        if(p&&!c) {
            confirmBox.alert("手机号未填写！");
            return false;
        }else if(!p&&c) {
            confirmBox.alert("验证码未填写！");
            return false;
        }else if(p&&c) {
            confirmBox.alert("手机号和验证码未填写！");
            return false;
        }
        $.post("/login/MobilePhoneLoginDo/",{txtMobilePhone: phone,txtMobilPhoneCode: verify_code}, function(r){
            if(!r.success){
                confirmBox.alert(r.error);
            } else {
                if (r.is_new_person) {
                    window.location.href=$('#j_new_person_url').val();
                } else {
                    window.location.reload();
                }
            }
        },'json');
    });
    //看过此职位的还看过
    $(function(){
        var url = "/jobsearch/otherScanJob";
        $.post(url, {job_id:$('#j_job_id').val(),jobsort:$('#j_jobsort').val(),jobsort_ids:$('#j_jobsort_ids').val()}, function(json){
            if (json.data) {
                var data = json.data;
                var html = '';
                for(var i = 0;i<data.length;i++){
                    html += '<li>\n' +
                        '        <a class="little-title" target="_blank" href="'+data[i].url+'">'+ data[i].station +'</a>\n' +
                        '        <p class="salary">￥'+data[i].min_salary+'-'+data[i].max_salary+'</p>\n' +
                        '        <a class="company" target="_blank" href="'+data[i].company_url+'">'+data[i].company_name+'</a>\n' +
                        '    </li>';
                }
                $('#j_other_scan_jobs_bar').html(html);
            }
        },'json');
    });

})
//hbjs结束

function shareTO(type){
	var acttitle = acttitlePost;
	var tip =  createTips(),
		info = '找好工作，上汇博网！' + '“'+ acttitle + '”'+ '（来自huibo.com -> 职位详情)，'
	switch(type){
		case 'qq':
			 var href = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title=' + encodeURIComponent(info + tip) + '&summary=' + encodeURIComponent(info + tip) + '&url=' + encodeURIComponent(window.location.href);
			break;
		case 'sina':
			var href = 'http://service.weibo.com/share/share.php?title=' + encodeURIComponent(info + tip) + '&url=' + encodeURIComponent(window.location.href) + '&source=bookmark';
			break;
		case 'qqwb':
			 var href = 'http://v.t.qq.com/share/share.php?title=' + encodeURIComponent(info + tip) + '&url=' + encodeURIComponent(window.location.href);
			break;
				case 'renren':
			 var href = 'http://share.renren.com/share/buttonshare.do?link=' + encodeURIComponent(window.location.href) + '&title==' + encodeURIComponent(info + tip);
			break;
	}
	window.open(href);    
}
function createTips(){
	var strArray = ['赶紧推荐给您的朋友吧。', '分享一下，推荐工作。'];
	return strArray[Math.round(Math.random())];
}

function ajaxLoginCallback() {
	window.location.href = window.location.href; 
}


var has_resume_count=0;
var ResTimer=null;

$(function () {
    $.ajax({
        url : applyCompanyPost,
        type : "GET",
        dataType : "JSON",
        async : false,
        success:function (e) {
            // console.log('row1938,接盘数据：',e);
            has_resume_count=e.data.resume_count;
        }
    })
})