//网站搜索页面xiaofei20190524
var searchConfig = {
    trigger: '.butsub',
    select: {
        trigger: '.search_select',
        trigerClassName: 'hover',
        align: {
            baseXY: [0, '100%-2']
        }
    },
    selectedIndex: searchtypex,
    initDataSource: '/head/SearchKeyword',
    dataSource: ['/index/auto/?limit=12&timestamp={{timestamp}}&type=job&q={{query}}&callback=jsonpcallback', '/index/auto/?limit=12&timestamp={{timestamp}}&type=company&q={{query}}&callback=jsonpcallback,/index/auto/?limit=12&timestamp={{timestamp}}&type=fulltext&q={{query}}&callback=jsonpcallback'],
    url: ['/jobsearch/?key={{query}}', '/jobsearch/?params=u2&key={{query}}', '/jobsearch/?params=u3&key={{query}}'],
    placeHolder: ['找一找，总有适合您的工作', '请输入公司名称', '请输入关键词']
};
var confirmBox_;
var thisjquery;

hbjs.use('@confirmBox, @jobLazyload, @jobDialog, @actions, @search, @homeSideSortMenu, @position, @hbCommon, @fixed, @checkLogin, @mask, @jobPostipGroup',
function(m) {
    var $ = m['jquery'].extend(m['cqjob.jobLazyload'], m['cqjob.actions'], m['cqjob.jobDialog'], m['product.hbCommon']),
    confirmBox = m['widge.overlay.confirmBox'],
    jobTopSearch = m['product.jobSearch.jobTopSearch'],
    cookie = m['tools.cookie'],
    position = m['tools.position'],
    util = m['base.util'],
    fixed = m['tools.fixed'],
    checkLogin = m['product.checkLogin'],
    jobTopSearch = m['product.jobSearch.jobTopSearch'],
    Dialog = m['widge.overlay.hbDialog'],
    mask = m['widge.overlay.mask'],
    jobPostipGroup = m['product.jobList.jobPostipGroup'],
    homeSideSortMenu = m['product.homeSideSortMenu'],
    pWidth = 70,
    fontSize = 18;

    //判断cookie是否过期然后是否弹出登录框
    function getCookie(name){
        var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)"),
            arr = document.cookie.match(reg);
        if (arr != null) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    }
    function setCookie(name, value, hours){
        var str = name + "=" + escape(value);
        if (hours > 0) {
            var date = new Date();
            date.setTime(date.getTime() + hours * 3600 * 1000);
            str += "; expires=" + date.toGMTString();    // toGMTstring将时间转换成字符串
        }
        //写入Cookie
        document.cookie = str;
    }
    var isPopLogin = getCookie('isPopLogin');
    var userId = getCookie('userid');
    var is_login = userId>0;
    //20191223去掉10秒后弹出登录框
    /*if(!is_login && !isPopLogin) {
        setTimeout(function () {
            var jobflag = $(this).attr('data-value');
            checkLogin.isLogin('ajaxLoginCallback-jobflag-' + jobflag + '-actiontype-apply-isReload-true');
        },10000);
        setCookie("isPopLogin", true, 24);
    }*/

    var userEnterBox = $('#userEnterBox');
    userEnterBox.on('mouseenter mouseleave', '.login',
    function(e) {
        var target = $(e.currentTarget);
        if (e.type === "mouseenter") {
            target.addClass('hover');
        } else {
            target.removeClass('hover');
        }
    });
    //城市切换
    var cityTrigger = $('#js-city');
    var cityPopup = $('#js-citybox');
    var cityTimer;

    cityTrigger.on('mouseenter', overHandle).on('mouseleave', leaveHandle);

    cityPopup.on('mouseenter', overHandle).on('mouseleave', leaveHandle);

    function overHandle(e) {
        cityTimer && clearTimeout(cityTimer);

        cityTrigger.addClass('hover-city');
        cityPopup.show();
    }

    function leaveHandle(e) {
        cityTimer && clearTimeout(cityTimer);

        cityTimer = setTimeout(function() {
            cityTrigger.removeClass('hover-city');
            cityPopup.hide();
        },
        100);
    }
    //弹窗城市关闭
    $("#js-dialog-city").find(".close").click(function() {
        $("#js-dialog-city").hide();
        $(".hb_ui_ui-mask").remove();
        return false;
    });

    /*退出按钮*/
    $(".userOut").click(function() {
        $.ajax({
            'url': '/index/signOut',
            'type': 'get',
            'dataType': 'json',
            'success': function(json) {
                if (json.success) {
                    var msg = '退出成功';
                    confirmBox.timeBomb(msg, {
                        name: 'success',
                        width: pWidth + msg.length * fontSize,
                        timeout: 1000
                    });
                    window.location.reload();
                } else {
                    var msg = '退出失败';
                    confirmBox.timeBomb(msg, {
                        name: 'fail',
                        width: pWidth + msg.length * fontSize,
                        timeout: 1000
                    });
                }
            }
        });
        return false;
    });

    //判断用户是否登录
    checkUser();

    function checkUser() {
        //判断用户类型
        var type = cookie.get("usertype");
        var isLogin = !!type;
        var userName = type == "c" ? '企业招聘中心': '我的汇博'; //cookie.get("nickname") === undefined ? '我的汇博' : decodeURI(cookie.get("nickname"));
        var userID = cookie.get("userid");
        var headphoto = decodeURIComponent(cookie.get("headphoto"));
        if (!type) {
            $(".befor,.login_reg").css("display", "block");
            $(".comAfter,.comLg,.psnAfter,.psnLg,.psnLg_new").css("display", "none");
        }
        if (type == "c") {
            $(".comAfter,.comLg").css("display", "block");
            $(".befor,.login_reg,.psnAfter,.psnLg").css("display", "none");
            $('#loginRight').removeClass('right').addClass('rightAfter');
            if (headphoto !== undefined && headphoto !== '' && headphoto !== 'undefined') {
                $('#comHeadphoto').attr("src", headphoto);
            }
            //免费发布职位连接修改：
            $('#free_put_job').attr('href', '' + companyLink + '/job/add');

            //$('#go_register_person').hide();
            //$('#go_register_person').prev().hide();
        } else if (type == "p") {
            $('.newfree-post').css('display', 'none');

            //$('.newschHigh').css('display','block');
            //$('#new_hight_search').hide();
            //$('#go_register_person').hide();
            //$('#go_register_person').prev().hide();
            $(".psnAfter,.psnLg_new").css("display", "block");
            $(".befor,.login_reg,.comAfter,.comLg").css("display", "none");
            $(".login_regAge").css("display", "block");
            $('#loginRight').removeClass('right').addClass('rightAfter');
            //$(".psnUserName").html(userName);
            if (headphoto !== undefined && headphoto !== '' && headphoto !== 'undefined') {
                $('#psnHeadphoto').attr("src", headphoto);
            }

            //获取用户信息
            $.getJSON("/loginindex/getinfo", {},
            function(data) {
                document.getElementById('user_info_ajax').innerHTML = data.content;
                var userEnterBox1 = $('.login_regAge');
                userEnterBox1.on('mouseenter mouseleave', '.personage',
                function(e) {
                    var target = $(e.currentTarget);
                    if (e.type === "mouseenter") {
                        target.addClass('hover');
                    } else {
                        target.removeClass('hover');
                    }
                });
                user_jianli_status = document.getElementById('user_jianli_1').value;
                //注册用户退出登录
                $(".userOut").click(function() {
                    $.ajax({
                        'url': '/index/signOut',
                        'type': 'get',
                        'dataType': 'json',
                        'success': function(json) {
                            if (json.success) {
                                $('.newfree-post').css('display', 'block');
                                $('.newschHigh').css('display', 'none');
                                $(".befor,.login_reg").css("display", "block");
                                $(".comAfter,.psnAfter,.psnLg,.comLg").css("display", "none");
                                $(".panelBox").css("display", "none");
                                $(".psnLg_new").css("display", "none");
                                $('#loginRight').removeClass('rightAfter').addClass('right');
                                //免费发布职位连接修改：
                                $('#free_put_job').attr('href', '' + indexLink + '/company/register');
                                $.anchorMsg("退出成功");
                                window.location.reload();
                            } else {
                                $.message("退出失败");
                            }
                        }
                    });
                    return false;
                });
            },
            'json');
        }
    }

    var search = new jobTopSearch($.extend({
        container: $('#search_box form'),
        search: {
            trigger: '.keys',
            align: {
                baseXY: [0, '100%']
            },
            width: 493,
            zIndex: 10000,
            target: $('#ui_hbsug_top')
        }
    },
    searchConfig));

    search.on('submit',
    function(e) {
        if (e.index == 0 && e.value && e.value != undefined) {
            $.getJSON('/head/SaveJobkey/?keyword=' + encodeURIComponent(e.value),
            function(result) {
                window.location.href = e.url;
            });
        } else {
            window.location.href = e.url;
        }
    });

    var searchInput = search.getSearch(),
    searchSelect = search.getSelect();

    searchInput.on('itemAllDelete',
    function(e) {
        $.getJSON('/head/ClearSearchKeywords/');
    });
    searchInput.on('itemDeleted',
    function(e) {
        var KeywordSchUrl = KeywordSch + "?keyword=" + e.value;
        $.getJSON(KeywordSchUrl);
    });
    searchInput.on('searchItemSelected',
    function(e) {
        //e.url是链接
        //e.data.text是对应的文字
        //e.index是索引号
        var index = searchSelect.get('selectedIndex'),
        key = e.data.value;
        if (e.url && index == 0 && key != undefined) {
            $.getJSON(saveJobkeySch + encodeURIComponent(key),
            function(result) {
                window.location.href = e.url;
            });
        } else {
            window.location.href = e.url;
        }
    });

    confirmBox_ = confirmBox;
    thisjquery = $;
    //判断用户输入是否包含"兼职"
    var havePartjob = (decodeURI(location.href)).indexOf('兼职') !== -1;
    if (havePartjob && !cookie.get("partjob_guid_alert")) {
        mask.show();
        $('#partjobPop').show(function() {
            var exp = new Date();
            exp.setTime(exp.getTime() + 24 * 3600000);
            cookie.set('partjob_guid_alert', true, {
                expires: exp,
                path: "/"
            });
        });
        $('#partjobPop').on('click', 'a',
        function() {
            $('#partjobPop').hide();
            mask.hide();
        });
    }

    //求职者登录
    $('.submit').on('click',function () {
        var phone = $('.phone').val();
        var captcha = $('.messageCaptcha').val();
        var p = phone == '' || phone == null;
        var c = captcha == '' || captcha == null;
        if(p&&!c) {
            confirmBox.alert("手机号未填写！");
        }else if(!p&&c) {
            confirmBox.alert("验证码未填写！");
        }else if(p&&c) {
            confirmBox.alert("手机号和验证码未填写！");
        }else{

        }
    });
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

    $('#j_person_phone').on('input',function(){
        var phone = $(this).val();
        if(phone.length == 11){
            //查询今日登录的次数
            var pattern = /^[1]\d{10}$/;
            if(pattern.exec(phone)){
                $.post("/login/GetPersonLoginTimes",{mobile_phone:phone},function(r){
                    if(r.status){
                        if(r.count>4){
                            $('#verifycodemobile').show();
                        }
                        $('#loginTimeCount').val(r.count);
                    }else{
                        confirmBox.alert('系统错误，请刷新后重试');
                        return false;
                    }
                },'json')
            }else{
                $('#verifycodemobile').hide();
            }
        }else{
            $('#verifycodemobile').hide();
        }
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

    //最近浏览展开收缩
    $('.showMore').on('click',function () {
        var isSpread = $(this).find('span').text();
        var image    = $(this).find('img');
        if(isSpread=='展开') {
            $('.moreScan').css({'display':'block'});
            $(this).find('span').text('收起');
            $(image[0]).css({'display':'none'});
            $(image[1]).css({'display':'inline-block'});
        }else {
            $('.moreScan').css({'display':'none'});
            $(this).find('span').text('展开');
            $(image[0]).css({'display':'inline-block'});
            $(image[1]).css({'display':'none'});
        }
    });

    $(window).scroll(function() {
        if ($(document).scrollTop() > 120) {
            $('a.backTop').css({
                'display': 'inline-block'
            });
        } else {
            $('a.backTop').css({
                'display': 'none'
            });
        }

        //滚动悬停header
        if($(document).scrollTop() > 29) {
            var top = $(document).scrollTop() + 64;
            $('.mask').addClass('fixed_mask');
            $('.hb_ui_search').css({
                'top': top,
                'z-index':'10000'
            })
        }else {
            $('.mask').removeClass('fixed_mask');
            $('.hb_ui_search').css({'top':'93px'})
        }
        if($('#fixed_box').attr('display') == 'block'){

        }
    });
    $('a.backTop').click(function() {
        $('html,body').animate({
            scrollTop: 0
        });
    });

    $(".goPart").click(function() {
        window.open(jianzhiLink);
    });
    
    //快米引流
    
    $('.km_flowClose').click(function(){
			$('.kuaimi_flow').hide();
			var exp = new Date();
            exp.setTime(exp.getTime() + 24 * 3600000);
            cookie.set('kmFlowDate', true, {
                expires: exp,
                path: "/"
            });
    });
    var flowDateShow = cookie.get('kmFlowDate');
    if(flowDateShow == 'true'){
    	$('.kuaimi_flow').css("display","none");
    }else{
    	$('.kuaimi_flow').css("display","block");
    }
    
    $('.km_flowCodeMin').hover(function(){
		$('.km_flowCode').show();
	});
	$('.km_flowCode').mouseleave(function(){
		$(this).hide();
	});
    
    

    var pWidth = 70,
    fontSize = 18;

    //底部搜索
    var bottomSearch = new jobTopSearch($.extend({
        container: $('#bottomSearchBox form'),
        search: {
            trigger: '.keys',
            align: {
                baseXY: [0, '100%+2']
            },
            width: 694,
            target: $('#ui_hbsug_bottom')
        }
    },
    searchConfig));
    bottomSearch.on('submit',
    function(e) {
        if (e.index == 0 && e.value && e.value != undefined) {
            $.getJSON('/head/SaveJobkey/?keyword=' + encodeURIComponent(e.value) + '',
            function(result) {
                window.location.href = e.url;
            });
        } else {
            window.location.href = e.url;
        }
    });
    var bottomSearchInput = bottomSearch.getSearch(),
    bottomSearchSelect = bottomSearch.getSelect();

    bottomSearchInput.on('itemAllDelete',
    function(e) {
        $.getJSON('/head/ClearSearchKeywords/');
    });
    bottomSearchInput.on('itemDeleted',
    function(e) {

        var KeywordSchUrl2 = KeywordSch + "?keyword=" + e.value;
        $.getJSON(KeywordSchUrl2);
    });
    bottomSearchInput.on('searchItemSelected',
    function(e) {
        //e.url是链接
        //e.data.text是对应的文字
        //e.index是索引号
        var index = bottomSearchSelect.get('selectedIndex'),
        key = e.data.value;
        if (e.url && index == 0 && key != undefined) {
            $.getJSON('/head/SaveJobkey/?keyword=' + encodeURIComponent(key),
            function(result) {
                window.location.href = e.url;
            });
        } else {
            window.location.href = e.url;
        }
    });

    $('.postSearchLeft .postIntro').mouseover(function() {
        $($($(this).children('div.title')).children('em.px_jpz')).addClass('px_jpzcut');
        //            $('.px_jpz').addClass('px_jpzcut');
    });
    $('.postSearchLeft .postIntro').mouseout(function() {

        $('.px_jpz').removeClass('px_jpzcut');
    });

    /*发布时间*/
    $('.sublistx01').hover(function() {
        $(this).addClass('sublistx01_cut');
    });
    $('.sublistx01').mouseleave(function() {
        $(this).removeClass('sublistx01_cut');
    });
    $('.sublistx01 a').click(function() {
        $(this).addClass('cut').siblings().removeClass('cut');
    });
    $('.sublistx02').hover(function() {
        $(this).addClass('sublistx02_cut');
    });
    $('.sublistx02').mouseleave(function() {
        $(this).removeClass('sublistx02_cut');
    });
    $('.sublistx02 a.mov').click(function() {
        $(this).toggleClass('cut');
    });
    //精准推广广告被点击的时候
    $(".spread_data_cur").click(function() {
        var spread_id = $(this).attr("data-spreadid");
        var spreadClickSchUrl = spreadClickSch + "?spread_id=" + spread_id;
        $.getJSON(spreadClickSchUrl,
        function(result) {});
    });
    //智能推荐精准推广点击
    $("#job_recommend").on("click",".recommendSpreadClass",function(){
        var spread_id = $(this).attr("data-spreadid");
        var spreadClickSchUrl = spreadClickSch + "?spread_id=" + spread_id;
        $.getJSON(spreadClickSchUrl,
        function(result) {});
    });

    var limitDialog = new Dialog({
        idName: 'apply_limit',
        title: '提示',
        isOverflow: true,
        close: 'x',
        isAjax: true,
        width: 360
    });
    limitDialog.get('element').on('click', '#btnCloseLimitMsg',
    function(e) {
        limitDialog.hide();
    });

    var jobDialog = new Dialog({
        idName: 'apply_job',
        isOverflow: true,
        close: 'x',
        isAjax: true,
        width: 586
    });

    jobDialog.get('element').on("click", "input[type='radio'][class='radio'][id^='re']",
    function(e) {
        jobDialog.query("input[type='radio'][class='radio'][id^='re']").removeAttr("checked");
        $(this).attr("checked", "checked");
    });

    var mismatchingDialog = new Dialog({
        idName: 'apply_mismatching',
        title: '投递确认',
        isOverflow: true,
        close: 'x',
        isAjax: true,
        width: 400
    });
    //确认投递
    mismatchingDialog.get('element').on("click", "#btnvYes",
    function(e) {
        jobDialog.query("#frmApply")[0].submit();
        return false;
    });
    //放弃投递
    mismatchingDialog.get('element').on("click", "#btnvClose",
    function(e) {
        mismatchingDialog.hide();
    });

    //立即投递
    var isApplySubmit = true;
    jobDialog.get('element').on("click", "#btnApply",
    function(e) {
        //是否需要提示完善简历
        var resume_id = jobDialog.query("input[type='radio'][class='radio'][name='resumeId'][checked]").val();
        $.getJSON('/job/needNoticeComplete/?resumeid=' + resume_id,
        function(result) {
            if (result.need_notice) {
                confirmBox.confirm("您的简历中有部分关键信息尚未完善，可能会影响投递效果。建议完善简历以后，再进行投递~", '提示',
                function() {
                    //不再提示
                    var _self = this;
                    $.getJSON('/job/setNotNoticeComplete/',
                    function(result) {
                        confirmBox.alert("设置成功",
                        function() {
                            _self.hide();
                        });
                    });
                },
                function() {
                    //完善简历
                    window.open(complete + resume_id);
                    this.hide();
                },
                {
                    confirmBtn: '<button class="button_a cancelbtn">不再提示</button>',
                    cancelBtn: '<button class="button_a button_a_red">完善简历</button>',
                    width: 300
                });
            } else {
                //原有投递简历逻辑
                if (!isApplySubmit) {
                    confirmBox.timeBomb("正在提交中, 请稍等", {
                        name: 'warning',
                        width: 240,
                        timeout: 2000
                    });
                    return;
                }
                isApplySubmit = false;
                if (auto_filter == "false") {
                    //未开启职位自动过滤
                    jobDialog.query("#frmApply")[0].submit();
                    return false;
                } else {
                    //已开启职位自动过滤
                    jobDialog.hide();
                    var sle_resumeId = jobDialog.query("input[type='radio'][class='radio'][name='resumeId'][checked]").val();
                    //投递职位信息匹配
                    $.ajax({
                        url: '/job/MatchingApplyResume/',
                        type: "post",
                        data: 'jobflag='+jobflagSch+'&resume_id=' + sle_resumeId,
                        dataType: "json",
                        success: function(json) {
                            if (json.status == false) {
                                //具有和投递职位不匹配信息进行弹窗提示
                                var msg = json.msg;
                                var applyMismatchSchUrl = applyMismatchSch + "?msg=" + msg + "-v-" + Math.random();
                                mismatchingDialog.setContent(applyMismatchSchUrl)
                                mismatchingDialog.show();
                                isApplySubmit = true;
                            } else {
                                jobDialog.query("#frmApply")[0].submit();
                            }
                        }
                    });
                }
                //原有投递逻辑结束
            }
        });
        //提示完善简历弹窗结束
    });

    var auto_filter;
    $('body').eq(0).on('click', '.btnApply',
    function() {
  		console.log('点击按钮');
        var jobflag = $(this).attr('data-value');
        var islogin = checkLogin.isLogin('ajaxLoginCallback-jobflag-' + jobflag + '-actiontype-apply-isReload-true');
        if (islogin) {
            auto_filter = $(this).attr('data-autofilter');

            if (jobflag.length) {
                //已达投递上线限弹窗提示    
                if (OverplusApplycount == 0) {

                    limitDialog.setContent('/job/Applylimit/' + '-v-' + Math.random());
                    limitDialog.show();

                    return false;
                }
                var postSuccessSchxUrl = postSuccessSchx + "?jobflag=" + jobflag + "&success=postSuccess" + "-v-" + Math.random();
                //未达投递上限 显示投递弹窗
                jobDialog.setContent({
                    title: '投个简历<label style="font-size:14px;color:#000000">&nbsp;&nbsp;(今日还可投递</label><label style="font-size:16px;color:red">' + OverplusApplycount + '</label><label style="font-size:14px;color:#000000">个职位)</label>',
                    content: postSuccessSchxUrl
                });
                jobDialog.show();

                jobDialog.query("input[type='radio'][class='radio'][id^='re']").removeAttr("checked");
                jobDialog.query("input[type='radio'][class='radio'][id^='re']").eq(0).attr("checked", "checked");

                jobDialog.query("input[type='radio'][class='radio'][id^='re']").removeAttr("checked");
                jobDialog.query("input[type='radio'][class='radio'][id^='re']").eq(0).attr("checked", "checked");

            }
        }
    });
    
    $('.registerResume').on('click',
    function(e) {
        checkLogin.dialog.set('title', null);
        checkLogin.dialog._updateHeader();
        var isLogin = checkLogin.isPersonLogin(null, 'person_dialog', '/personregister/applyreg/success-ajaxLoginCallback-fromurl-jobsearch');

        return false;
    });

    /*应届生*/
    $('.zwPost').click(function() {
        var _this = $(this);
        var dataSrc = _this.attr("data-src");
        if (_this.hasClass('cur')) {
            window.location.href = dataSrc;
        } else {
            window.location.href = _this.attr("data-freshurgent-src");
        }
    });
    
//  var zwpostCur = $('.filter a').hasClass('cur');
//  if(!zwpostCur){
//  	console.log('没选中的时候进来了');
//  	window.location.href = '/jobsearch/?key=';
//  }
    
    /*扫描下载APP/微信浮动栏*/
    $('.popzP').hover(function() {
        $('.popzSpd').toggle();
    });

    var isLogin = isLoginSch;
    var _showRefeshConfirm = cookie.get('_hideRefeshConfirm');
    if (isLogin && (_showRefeshConfirm != 1) && autoRefreshSch == 1) {
        setRefeshConfirmCookie();
        _checkRefesh('ajaxlogin');
    }
    //点击刷新按钮
    $("#refresh").on('click',
    function() {
        _checkRefesh('index');
    })

    function setRefeshConfirmCookie() {
        var tomorrow = tomorrowSch;
        cookie.set('_hideRefeshConfirm', 1, {
            expires: tomorrow,
            path: '/',
            domain: libConstantSch
        });
    }

    function doRefresh() {
        $.ajax({
            type: "get",
            url: "" + personLink + "/resume/refresh",
            dataType: "jsonp",
            jsonp: "callbackparam",
            success: function(json) {
                if (json.status) {
                    confirmBox.timeBomb("刷新成功", {
                        name: 'success',
                        timeout: 2000
                    });
                    $('#jian_li_shuaxin').hide();
                    $('#jianlishuaxin_line').hide();
                } else {
                    confirmBox.timeBomb("每天只能刷新一次简历", {
                        name: 'warning',
                        width: 240,
                        timeout: 2000
                    });
                }
            }
        });
    }

    function _checkRefesh(src) {
        var src = src || 'index';
        $.ajax({
            type: "get",
            url: "" + personLink + "/index/checkrefesh?src=" + src,
            dataType: "jsonp",
            jsonp: "jsonpCallback",
            success: function(json) {
                if (json.status) {
                    var tdialog = new Dialog({
                        close: 'x',
                        idName: 'refresh_dialog',
                        title: '温馨提示',
                        width: 500
                    });
                    tdialog.setContent(json.html).show();
                    tdialog.after('hide',
                    function() {
                        tdialog.destory();
                    });
                } else {
                    if (src != 'ajaxlogin') {
                        if (openModeSch == 1) {
                            doRefresh();
                            return;
                        }
                        confirmBox.confirm('简历当前为未公开状态，确认刷新后，将自动被公开', null,
                        function() {
                            this.hide();
                            doRefresh();
                            return;
                        },
                        function() {
                            this.hide();
                        },
                        {
                            confirmBtn: '<button class="button_a button_a_red">确定</button>',
                            cancelBtn: '<button class="button_a cancelbtn">取消</button>',
                            width: 320
                        });
                    }
                }
            }
        });
    }
    var guide_after = $('#guide_after'),
    guide_mask = $('#guide_mask'),
    guide_box = $('#guide_box');

    if (totalPageSch >= 6 && haveFiltSch == 0 && $(".page .cu").text() == 4 && cookie.get("jbosearch_guide") != "show_none" && isJobSearchx) {
        var str = window.location.href,
        ostr = window.location.origin;
        var html = '<div id="guide_mask" class="guide_mask"></div><div id="guide_box" class="guide_box"><style>.filter_box{position: relative;z-index: 100}</style></div>';
        $(html).appendTo($("body"));
        fixed.pin('#guide_mask', 0, 0);

        var guide_after = $('#guide_after'),
        guide_mask = $('#guide_mask'),
        guide_box = $('#guide_box');

        guide_box.on('click',
        function() {
            fixed.unpin('#guide_mask');
            guide_after.remove();
            guide_mask.remove();
            guide_box.off('click').remove();
        });

        var exp = new Date();
        exp.setTime(exp.getTime() + 7 * 24 * 3600000);
        cookie.set('jbosearch_guide', 'show_none', {
            expires: exp,
            path: "/"
        });
    }

    var fixed_box = $('#fixed_box');
    var jobListTable = $('#job_list_table');
    var win = $(window);
    if (fixed_box.length) {
        var scrollTop = $(document).scrollTop() + win.height(),
        lastEl = jobListTable.find('.postIntro').last(),
        eTop = lastEl.offset().top + lastEl.outerHeight();
        win.on('scroll',
        function() {
            scrollTop = $(document).scrollTop() + win.height();
            if (scrollTop >= eTop && !cookie.get('isBottomClose')) {
                fixed_box.show();
                //win.off('scroll');
            }
        });

        fixed_box.on('click', '.close',
        function(e) {
            var target = $(e.currentTarget);
            cookie.set('isBottomClose', 1);
            fixed_box.hide();
        });
    }

    $(".allResume").click(function() {
        var _this = $(this);
        if (_this.hasClass("hide")) {
            _this.parents(".postIntroList").find(".hidden").hide();
            _this.parents(".postIntroList").find(".allResume").show();
            _this.hide();
        } else {
            _this.parents(".postIntroList").find(".hidden").show();
            _this.parents(".postIntroList").find(".hide").css("display", "block");
            _this.hide();
        }
        return false;
    });

    $('.web_sub').on('click', web_sub);
    var isWebSubInit = true;

    function web_sub() {
        if (isWebSubInit) {
            $.post("/websubscribe", {
                'job_id': $('input[name="job_sort_id"]').val(),
                'job_name': $('input[name="job_sort_name"]').val()
            },
            function(data, status) {
                if (data.status == true) {
                    $('.main').css('display', 'none');
                    $('#web_sub_box').html(data.content).show();
                    //隐藏底部
                    $('.links_box').css('display', 'none');
                    isWebSubInit = false;
                } else {
                    alert('订阅暂不可用');
                }
            },
            'json');
        } else {
            $('.main').css('display', 'none');
            $('#web_sub_box').show();
            $('.links_box').css('display', 'none');
        }
    }
    $(".pxjgx").hover(function() {
        var html = '汇博提示：该企业为其他公司招聘人才（承诺不收求职者费用），如发现收费行为请及时向我们举报。';
        if ($(this).attr("recruit-type") == '2') {
            html = '汇博提示：该企业为<span>中介机构</span>，面试职位时可能会向求职者收取介绍费。';
        } else if ($(this).attr("recruit-type") == '3') {
            html = '汇博提示：该企业存在<span> 假招聘转招生</span>行为，面试时可能会要求付费培训，请根据自身情况选择是否投递该职位。';
        } else if ($(this).attr("recruit-type") == '4') {
            html = '汇博提示：该企业为其他公司招聘人才（承诺不收求职者费用），如发现收费行为请及时向我们举报。';
        } else if ($(this).attr("recruit-type") == '5') {
            html = '汇博提示：该企业已承诺发布的为真实招聘职位，不向求职者推销收费培训课程，若发现请举报，我们将进行处理。';
        }
        if (!$("#pxjg_tips").length) $("body").append('<p id="pxjg_tips" style="border:1px solid #e49492;padding:5px 10px;background: #fff2ef;position: absolute;top:100px;right:0;line-height:25px;font-size:14px;color:#666;width:365px"><i style="width:14px;height:8px;display: inline-block;overflow: hidden;background: url(//assets.huibo.com/img/job/newjob/pxjg_arr.png) no-repeat;position: absolute;top:-8px;left:180px"></i>' + html + '</p>');
        $("#pxjg_tips").html('<i style="width:14px;height:8px;display: inline-block;overflow: hidden;background: url(//assets.huibo.com/img/job/newjob/pxjg_arr.png) no-repeat;position: absolute;top:-8px;left:180px"></i>' + html).css({
            "left": $(this).offset().left - 155,
            "top": $(this).offset().top + 38
        }).show();
    },
    function() {
        $("#pxjg_tips").hide();
    });

    /*职业预览*/
    new jobPostipGroup({
        width: 670
    });

    function resetSalaryTipPosition(pin, base) {
        var pinObj = {
            element: pin,
            x: '50%',
            y: 0
        },
        baseObj = {
            element: base,
            x: '50%',
            y: -(pin.outerHeight())
        };
        position.pin(pinObj, baseObj);
    }

    function resetStatusTipPosition(pin, base) {
        var pinObj = {
            element: pin,
            x: 0,
            y: 0
        },
        baseObj = {
            element: base,
            x: '-23%',
            y: -(pin.outerHeight() + base.height() / 2)
        };
        position.pin(pinObj, baseObj);
    }

    var jobListTable = $('#job_list_table');
    jobListTable.on('mouseenter mouseleave', '.postIntroL, .money, .pxjg',
    function(e) {
        var target = $(e.currentTarget),
        promptTip;

        if (target.hasClass('money')) {
            promptTip = target.parent().children('.salaryTip');
            if (promptTip.length) {
                if (e.type === 'mouseenter') {
                    resetSalaryTipPosition(promptTip, target);
                    promptTip.show();
                } else {
                    promptTip.hide();
                }
            }
        } else if (target.hasClass('pxjg')) {
            promptTip = target.parent().children('.statusTip');
            if (promptTip.length) {
                if (e.type === 'mouseenter') {
                    resetStatusTipPosition(promptTip, target);
                    promptTip.show();
                } else {
                    promptTip.hide();
                }
            }
        } else {
            target.toggleClass('postIntroLcut');
        }
    });
    //**搜索公司的时候 推荐的好评企业**//
    if (goodCompanySch) {
        $.getJSON('/jobsearch/RecommendCompany/',
        function(result) {
            var good_appraise_company = $("#good_appraise_company");
            if (result.status) {
                var com_arr = [];
                $.each(result.data,
                function(i, n) {
                    if (parseInt(n.is_allow_appraise)) {
                        var html_tmp = '<div class="hot-star">' + '<p class="public-star"><span style="width: ' + (n.appraise_score) * 20 + '%"></span></p>' + '<span class="color-red2" style="">' + n.appraise_score + '分</span></div>';
                    } else {
                        var html_tmp = '<div class="hot-star">' + '<span>面试评价已关闭</span></div>';
                    }
                    com_arr.push('<dl class="job_item clearfix"><dt><a target="_blank" href="' + n.company_url + '"><img src="' + n.company_logo_url + '"></a></dt><dd>' + html_tmp + '<p class="hot-name"><a target="_blank" href="' + n.company_url + '">' + n.company_shortname + '</a></p></dd></dl>');
                });
                var html = ' <p class="title">好评企业</p><div class="cont">' + com_arr.join('') + '</div>';
                good_appraise_company.append(html);
            } else {
                good_appraise_company.remove();
            }
        });
    } else {
        // 搜索广告
        var _searchKeyword = $(".keys").val();
        $.getJSON('/searchannex/GetSearchAdvert/?keyword='+_searchKeyword,
        function(result) {

            var arr = [];
            if (result.data) {
                $.each(result.data,
                function(i, n) {
                    if (n.is_nofollow == 1) {
                        arr.push('<div class="gg_box"><a href="' + n.com_link + '" company_flag="' + n.company_flag + '" class="ad_jobsearch" rel="nofollow" advert_id="' + n.advert_id + '" area="img_jobsearch" target="_blank"><img src="' + n.img + '" title="' + n.subject + '" alt="' + n.subject + '" width="212px" height="140px"/></a></div>');
                    } else {
                        arr.push('<div class="gg_box"><a href="' + n.com_link + '" company_flag="' + n.company_flag + '" class="ad_jobsearch" advert_id="' + n.advert_id + '" area="img_jobsearch" target="_blank"><img src="' + n.img + '" title="' + n.subject + '" alt="' + n.subject + '" width="212px" height="140px"/></a></div>');
                    }
                });
            }

            var gg_box = $('#jobsearchAdvert');
            if (arr.length) {
                gg_box.append(arr.join(''));
                //广告位跳转
                gg_box.on('click', 'a',
                function(e) {
                    var self = $(e.currentTarget);
                    var advert_id = self.attr('advert_id');
                    var area = self.attr('area');
                    var company_flag = self.attr('company_flag');
                    var data = {
                        advert_id: advert_id,
                        area: area,
                        company_flag: company_flag
                    };
                    $.post('/ad/adverVisit', data);
                });
            } else {
                gg_box.remove();
            }
        });

    }
    /*智能推荐ajax*/
    $.getJSON('/searchannex/recomend/}',
    function(data) {
        var objcom = $('#company_recommend');
        var objjob = $('#job_recommend');
        var company = data.company_recommend_arr;
        if (company) {
            var com_arr = [];
            $.each(company,
            function(i, n) {
                var company_name = n.company_shortname ? n.company_shortname: n.company_name;
                com_arr.push('<td>' + '<a target="_blank" href="' + n.company_url + '" target="_blank" class="img">' + '    <img src="' + n.company_logo + '" alt="' + n.company_shortname + '" /> ' + '</a>' + '<a target="_blank" href="' + n.company_url + '" target="_blank" title="' + company_name + '" class="name">' + company_name + '</a>' + '</td>');
            });
            objcom.append(com_arr.join(''));
        } else {
            objcom.remove();
        }

        var job = data.intelligent_recomment_arr;
        if (job) {
            var job_arr = [],
            is_urgent;
            $.each(job,
            function(i, n) {
                var company_name = n.company_shortname ? n.company_shortname: n.company_name;
                is_urgent = n.is_urgent ? '<i class="jie"></i>': '';
                if(n.spread_id >0){
                    job_arr.push('<li>' + is_urgent + '<a target="_blank" data-spreadid="'+n.spread_id+'" class="recommendSpreadClass" href="' + n.url + '"><span style="margin:5px 5px 5px 1px;background-color:#F23C31;color:#FFF;font-size:12px;padding:0 2px 0 2px;">精</span>' + n.station + '</a>' + '	<p>' + '<a target="_blank" target="_blank" title="' + company_name + '" href="' + n.company_url + '">' + company_name + '</a>' + '</p>' + '<span style="color:rgb(255,107,80);margin-left: 0;">'  + '￥' + n.salary + '</span>' + '</li>');
                }else{
                    job_arr.push('<li>' + is_urgent + '<a target="_blank" href="' + n.url + '">' + n.station + '</a>' + '	<p>' + '<a target="_blank" target="_blank" title="' + company_name + '" href="' + n.company_url + '">' + company_name + '</a>' + '</p>' + '<span style="color:rgb(255,107,80);margin-left: 0;">'+ '￥'  + n.salary + '</span>' + '</li>');
                }
            });
            var intelligent_recomment_str = '<p class="title">智能推荐</p><div class="cont"><ul class="intel_item">' + job_arr.join('') + '</ul></div>';
            objjob.append(intelligent_recomment_str);
        } else {
            objjob.remove();
        }
    });
    /*这些公司正在招*/
    if (goodCompanySch) {

        $.getJSON("/searchannex/famous",
        function(data) {
            var objjob = $('#job_famous');
            if (data.length > 0) {
                var job_famous_arr = [];
                $.each(data,
                function(i, n) {
                    n.logo_path = n.logo_path ? n.logo_path: ''+styleLink+'/img/jobsearch/defalut_zw.jpg';
                    job_famous_arr.push('<dl class="job_item">' + '	<dt><a target="_blank" href="' + n.company_url + '"><img src="' + n.logo_path + '" /></a></dt>' + '	<dd>' + '		<a target="_blank" href="' + n.company_url + '">' + n.company_name + '</a>' + '		<p><a target="_blank" title="' + n.station + '" href="' + n.job_url + '">' + n.station + '</a></p>' + '		￥' + n.min_salary + "-" + n.max_salary + '	</dd>' + '</dl>');
                });
                var job_famous_str = '<p class="title">这些公司正在招</p><div class="cont">' + job_famous_arr.join('') + '</div>';
                objjob.append(job_famous_str);
            } else {
                objjob.remove();
            }
        });

    }

    function normalizeValue(el) {
        var ret = [],
        parent,
        p,
        ps,
        nodeName,
        status,
        f,
        index;
        el.each(function() {
            parent = $(this).parent(),
            p = parent.closest('dl'),
            ps = p.parent().children('dl'),
            nodeName = parent[0].nodeName.toLowerCase();

            if (index != ps.index(p)) {
                status = null;
            }

            if (nodeName === 'dt') {
                status = true;
                f = true;
            } else {
                f = status ? false: true;
            }
            if (f) {
                ret.push($(this).attr('data-value'));
            }

            index = ps.index(p);
        });
        return ret.join('_');
    }

    /*地点过滤*/
    var address_box = $('#address_box'),
    address_box_title = address_box.children('.title'),
    address_box_tab = address_box_title.children('.list'),
    address_box_cont = address_box.children('.two_address'),
    address_box_more = address_box_title.children('.more_select'),
    address_box_button = address_box.find('.button'),
    address_box_hid = address_box.find('#hddArea'),
    address_box_link = address_box_cont.children('dd').children('a'),
    address_box_useLink = address_box_link.filter(function() {
        return $(this).hasClass('cur');
    });

    address_box_title.on('click', 'a',
    function(e) {
        var target = $(e.currentTarget),
        index = address_box_tab.index(target);

        if (target.hasClass('list')) {
            if (target.hasClass('click')) {
                address_box_tab.removeClass('click');
                var index = address_box_tab.index(target);
                address_box_cont.hide();
            } else {
                address_box_tab.removeClass('click');
                target.addClass('click');
                var index = address_box_tab.index(target);
                address_box_cont.hide();
                address_box_cont.eq(index).show();
            }
        }
    });

    address_box_cont.on('click', 'a',
    function(e) {
        var target = $(e.currentTarget);
        if (address_box.hasClass('many_status')) {
            e.preventDefault();
            if (target.hasClass('cur')) {
                target.removeClass('cur');
            } else {
                target.addClass('cur');
            }
        }

    });
    $(".area_on_id").click(function() {

});

    address_box_button.on('click', 'a',
    function(e) {
        var target = $(e.currentTarget);
        switch (target.attr('id')) {
        case 'addressCancelBtn':
            address_box_link.removeClass('cur');
            address_box_useLink.addClass('cur');
            address_box_cont.hide();
            address_box.removeClass('many_status');
            break;
        case 'addressClearBtn':
            address_box_link.removeClass('cur');
            break;
        case 'addressYesBtn':
			var params=$('[name=params]');
			params[0].value=params[0].value.replace(/s[0-9_]+/,'')
            address_box_useLink = address_box_link.filter(function() {
                var self = $(this);
                return self.hasClass('cur') && !self.hasClass('first') && !self.hasClass('all');
            });
            if (!address_box_useLink.length) {
                address_box_hid.val('');
            } else {
                address_box_hid.val(address_box_hid.attr('type-value') + normalizeValue(address_box_useLink));
            }
            target.closest('form').submit();
            break;
        }
    });

    address_box_more.on('click',
    function(e) {
        address_box_tab.removeClass('click');
        address_box_cont.show();
		$('.subwayBox').hide()
        address_box.addClass('many_status');
    });
	
    var enter_url = "";

    //智能筛选
    $('.msure_m').click(function() {
        //重新定义m参数和n参数
        enter_url = document.location.href;
        if ($(this).attr('data-need-cut') == 'true') {
            $(this).toggleClass('cut');
            $(this).toggleClass('cur');
        }
        var c_arr = $('.params_m');
        var c_length = c_arr.length;
        var param_n = new Array();
        var param_m = new Array();
        var param_n_str = 'n';
        var param_m_str = 'm';

        for (var i = 0; i < c_length; i++) {
            if ($(c_arr[i]).attr('data-type') == 'n' && $(c_arr[i]).hasClass('cut')) {
                param_n.push($(c_arr[i]).attr('data-id'));
            } else if ($(c_arr[i]).attr('data-type') == 'm' && $(c_arr[i]).hasClass('cut')) {
                param_m.push($(c_arr[i]).attr('data-id'));
            }
        }
        if (param_n.length != 0) {
            param_n_str = param_n_str + param_n.join('_');
        }
        if (param_m.length != 0) {
            param_m_str = param_m_str + param_m.join('_');
        }

        //替换
        var _has_n_params = true;
        var _has_m_params = true;
        if (param_n_str == 'n') param_n_str = '';
        if (param_m_str == 'm') param_m_str = '';

        //查询是否已经存在查询条件  同时存在 v 和 params时
        if (enter_url.indexOf('v=') != -1 && enter_url.indexOf('params=') != -1) {
            enter_url = enter_url.replace(/\?v=|\&v=/, '');
        } else if (enter_url.indexOf('v=') != -1 && enter_url.indexOf('params=') == -1) {
            //将单个查询条件“V”换成多个查询条件的"params"
            enter_url = enter_url.replace('v=', 'params=');
        }

        var _has_selected_jobsort = $('input[name=has_selected_jobsort]').val();
        if (param_n_str != 'n') {
            if (/n[0-9_]+/i.test(enter_url)) {
                enter_url = enter_url.replace(/n[0-9_]+/i, param_n_str);
            } else {
                enter_url = _setUrl(_has_n_params, _has_selected_jobsort, enter_url, param_n_str);
            }
        }
        if (param_m_str != 'm') {
            if (/m[0-9_]+/i.test(enter_url)) {
                enter_url = enter_url.replace(/m[0-9_]+/i, param_m_str);
            } else {
                enter_url = _setUrl(_has_m_params, _has_selected_jobsort, enter_url, param_m_str);
            }
        }

        //翻页置空
        enter_url = enter_url.replace(/p[0-9]+/i, '');
        enter_url = enter_url.replace(/\/+$/i, '/');
        enter_url = enter_url.replace(/params=\//i, '');
        setTimeout(function() {
            //                            console.log(enter_url);
            //                            return false;
            window.location.href = enter_url;
        },
        300);

    });

    /**
											 * @has_params 是否选择了参数
											 * @_has_selected_jobsort 是否选择了职位类别
											 * @enter_url url
											 * @param_str 要替换或者拼接的参数
											 */
    function _setUrl(has_params, _has_selected_jobsort, enter_url, param_str) {
        if (has_params) {
            //                            if(_has_selected_jobsort){
            if (/\/([a-zA-Z][\d]+)+/i.test(enter_url)) {
				console.log('有参数')
                enter_url = enter_url.replace(/\/([a-zA-Z][\d]+)+/i,
                function(world) {
                    return world + param_str;
                });
            } else if (/\?key/.test(enter_url)&&!/params/.test(enter_url)) {
				console.log('有关键字没参数')
                enter_url = enter_url + "&params=" + param_str;
            } else if (/params=[\d\w]*/i.test(enter_url)) {
				console.log('有params')
                enter_url = enter_url.replace(/params=[\d\w]*/i,
                function(world) {
                    return world + param_str;
                });
            } else if(/jobsearch/.test(enter_url)&&!/\?/.test(enter_url)){
            	console.log('没有问号')
            	enter_url = enter_url + "?params=" + param_str;
            } else {
            	console.log('其他情况')
                if (/\/$/.test(enter_url)) enter_url = enter_url + param_str;
                else enter_url = enter_url + "/" + param_str;
            }
            //                            }
            // else{
            //                                if(/params=[\d\w]*/i.test(enter_url)){
            //                                    enter_url = enter_url.replace(/params=[\d\w]*/i,function(world){
            //                                        return world + param_str;
            //                                    });
            //                                }
            //                                else{
            //                                    if(/\?/.test(enter_url))
            //                                        enter_url = enter_url + "&params="+ param_str;
            //                                    else
            //                                        enter_url = enter_url + "?params="+ param_str;
            //                                }
            //                            }
        }
		
		if(/b[0-9_]+/.test(enter_url)){
			console.log('有地区')
			enter_url=enter_url.replace(/s[0-9]+/,'')
		}
		
        return enter_url;
    }

    /*福利过滤*/
    var welfare_box = $('#welfare_box'),
    welfare_box_title = welfare_box.children('.title'),
    welfare_box_cont = welfare_box.children('.two_address'),
    welfare_box_more = welfare_box_title.children('.more_select'),
    welfare_box_button = welfare_box.find('.button'),
    welfare_box_hid = welfare_box.find('#hddReward'),
    welfare_box_link = welfare_box_cont.children('dd').children('a'),
    welfare_box_useLink = welfare_box_link.filter(function() {
        return $(this).hasClass('cur');
    });

    welfare_box_more.on('click',
    function(e) {
        welfare_box_cont.show();
        welfare_box.addClass('many_status');
    });
    welfare_box_button.on('click', 'a',
    function(e) {
        var target = $(e.currentTarget);

        switch (target.attr('id')) {
        case 'welfareCancelBtn':
            welfare_box_link.removeClass('cur');
            welfare_box_useLink.addClass('cur');
            welfare_box_cont.hide();
            welfare_box.removeClass('many_status');
            break;
        case 'welfareClearBtn':
            welfare_box_link.removeClass('cur');
            break;
        case 'welfareYesBtn':
            welfare_box_useLink = welfare_box_link.filter(function() {
                var self = $(this);
                return self.hasClass('cur') && !self.hasClass('first') && !self.hasClass('all');
            });
            if (!welfare_box_useLink.length) {
                welfare_box_hid.val('');
            } else {
                welfare_box_hid.val(welfare_box_hid.attr('type-value') + normalizeValue(welfare_box_useLink));
            }
            target.closest('form').submit();
            break;
        }
    });
    welfare_box_cont.on('click', 'a',
    function(e) {
        var target = $(e.currentTarget);
        if (target.hasClass('cur')) {
            target.removeClass('cur');
        } else {
            target.addClass('cur');
        }
    });

    /*其它*/
    /*招聘行业*/
    var other_box = $('#other_box'),
    jobsortTrigger = $('#jobsortTrigger'),
    jobsortPopup = $('#jobsortPopup'),
    jobsortPopupParent = jobsortPopup.children('dl'),
    jobsortPopupAllLink = jobsortPopup.find('a'),
    jobsortPopupMenu = jobsortPopupParent.children('dt'),
    jobsortPopupMenuLink = jobsortPopupMenu.children('a'),
    jobsortPopupItem = jobsortPopupParent.children('dd'),
    jobsortPopupItemLink = jobsortPopupItem.children('a'),
    jobsortPopupHid = jobsortPopup.find('#hddcallingid'),
    jobsortSelectedIndex = 0,
    jobsortPopupSelectedLink = jobsortPopupAllLink.filter(function() {
        return $(this).hasClass('cur');
    });

    function resetJobsortPostion() {
        var pinObj = {
            element: jobsortPopup,
            x: 0,
            y: 0
        },
        baseObj = {
            element: jobsortTrigger,
            x: 0,
            y: '100%-1'
        };
        position.pin(pinObj, baseObj);
    };

    function jobsortShow() {
        jobsortTrigger.addClass('click');
        jobsortPopup.show();
        resetJobsortPostion();
    }

    function jobsortHide() {
        jobsortTrigger.removeClass('click');
        jobsortPopup.hide();
    }

    var jobsortIsListener = false;

    jobsortPopup.on('mouseenter', 'dt a',
    function(e) {
        if (!jobsortPopup.hasClass('idunt_float_select')) {
            var target = $(e.currentTarget),
            parent = target.parent(),
            index = jobsortPopupMenu.index(parent);
            if (!index) return;

            jobsortPopupMenuLink.removeClass('hover');
            target.addClass('hover');
            jobsortPopupItem.hide();
            jobsortPopupItem.eq(index).show();
            jobsortSelectedIndex = index;
        }
    });
    jobsortPopup.on('click', 'a',
    function(e) {
        var target = $(e.currentTarget);
        switch (target.attr('id')) {
        case 'jobsortMutilpleBtn':
            jobsortPopup.removeClass('idunt_float').addClass('idunt_float_select');
            jobsortPopupItem.show();
            break;
        case 'jobsortYesBtn':
            jobsortPopupSelectedLink = jobsortPopupAllLink.filter(function() {
                var self = $(this);
                return self.hasClass('cur') && !self.hasClass('first') && !self.hasClass('all');
            });
            jobsortPopupHid.val(jobsortPopupHid.attr('type-value') + normalizeValue(jobsortPopupSelectedLink));
            target.closest('form').submit();

            break;
        case 'jobsortClearBtn':
            jobsortPopupAllLink.removeClass('cur');
            break;
        case 'jobsortOneBtn':
            removeOtherBoxListener();
            jobsortPopupAllLink.removeClass('cur');
            jobsortPopupSelectedLink.addClass('cur');
            jobsortPopup.removeClass('idunt_float_select').addClass('idunt_float');
            jobsortPopupItem.hide().eq(jobsortSelectedIndex).show();
            setTimeout(function() {
                addOtherBoxListener();
                jobsortIsListener = true;
            },
            1);
            break;
        default:
            if (jobsortPopup.hasClass('idunt_float_select')) {
                e.preventDefault();
                var parent = target.closest('dl'),
                index = jobsortPopupParent.index(parent),
                p = target.parent();

                if (target.hasClass('cur')) {
                    target.removeClass('cur');
                } else {
                    target.addClass('cur');
                }
                if (p[0].nodeName.toLowerCase() == 'dt') {
                    var item = jobsortPopupItem.eq(index).children('a:gt(0)');
                    if (target.hasClass('cur')) {
                        item.addClass('cur');
                    } else {
                        item.removeClass('cur');
                    }
                } else if (p[0].nodeName.toLowerCase() == 'dd') {
                    var item = jobsortPopupItem.eq(index).children('a:gt(0)'),
                    length = item.length,
                    selectedItem = item.filter(function() {
                        return $(this).hasClass('cur');
                    }),
                    selectedLength = selectedItem.length,
                    firstLink = parent.children('dt').children('a');

                    if (selectedLength >= length) {
                        firstLink.addClass('cur');
                    } else {
                        firstLink.removeClass('cur');
                    }
                }
            }
            break;
        }
    });

    /*公司规模*/
    var companySizeTrigger = $('#companySize'),
    companySizePopup = $('#companySizePopup');

    function resetCompanySizePosition() {
        var pinObj = {
            element: companySizePopup,
            x: 0,
            y: 0
        },
        baseObj = {
            element: companySizeTrigger,
            x: 0,
            y: '100%-1'
        };
        position.pin(pinObj, baseObj);
    }

    function companySizeShow() {
        companySizeTrigger.addClass('click');
        companySizePopup.show();
        resetCompanySizePosition();
    }

    function companySizeHide() {
        companySizeTrigger.removeClass('click');
        companySizePopup.hide();
    }

    /*公司性质*/
    var companyTypeTrigger = $('#companyType'),
    companyTypePopup = $('#companyTypePopup'),
    companyTypeHid = companyTypePopup.find('#hddComproperty'),
    companyTypePopupLink = companyTypePopup.children('a');
    companyTypeSelectedLink = companyTypePopupLink.filter(function() {
        return $(this).hasClass('cur');
    });

    function resetCompanyTypePosition() {
        var pinObj = {
            element: companyTypePopup,
            x: 0,
            y: 0
        },
        baseObj = {
            element: companyTypeTrigger,
            x: 0,
            y: '100%-1'
        };
        position.pin(pinObj, baseObj);
    }

    function companyTypeShow() {
        companyTypeTrigger.addClass('click');
        companyTypePopup.show();
        resetCompanyTypePosition();
    }

    function companyTypeHide() {
        companyTypeTrigger.removeClass('click');
        companyTypePopup.hide();
    }

    companyTypePopup.on('click', 'a',
    function(e) {
        var target = $(e.currentTarget);

        switch (target.attr('id')) {
        case 'companyTypeMutilpleBtn':
            companyTypePopup.addClass('select_box_many').width(120);
            break;
        case 'companyTypeYesBtn':
            companyTypeSelectedLink = companyTypePopupLink.filter(function() {
                var self = $(this);
                return self.hasClass('cur') && !self.hasClass('first') && !self.hasClass('all');
            });
            if (!companyTypeSelectedLink.length) {
                //									var msg = '请选择一项';
                //									confirmBox.timeBomb(msg, {
                //										name: 'fail',
                //										width: pWidth + msg.length * fontSize,
                //										timeout: 500
                //									});
                target.closest('form').submit();
                return;
            }
            companyTypeHid.val(companyTypeHid.attr('type-value') + normalizeValue(companyTypeSelectedLink));
            target.closest('form').submit();
            break;
        case 'companyTypeCancelBtn':
            companyTypePopupLink.removeClass('cur');
            break;
        case 'companyTypeOneBtn':
            companyTypePopupLink.removeClass('cur');
            companyTypeSelectedLink.addClass('cur');
            companyTypePopup.removeClass('select_box_many').width(98);
            break;
        default:
            if (companyTypePopup.hasClass('select_box_many')) {
                e.preventDefault();
                if (target.hasClass('cur')) {
                    target.removeClass('cur');
                } else {
                    target.addClass('cur');
                }
            }
            break;
        }
    });

    /*工作类型*/
    var workTypeTrigger = $('#workType'),
    workTypePopup = $('#workTypePopup'),
    workTypePopupLink = workTypePopup.children('a');
    workTypeSelectedLink = workTypePopupLink.filter(function() {
        return $(this).hasClass('cur');
    });

    function resetWorkTypePosition() {
        var pinObj = {
            element: workTypePopup,
            x: 0,
            y: 0
        },
        baseObj = {
            element: workTypeTrigger,
            x: 0,
            y: '100%-1'
        };
        position.pin(pinObj, baseObj);
    }

    function workTypeShow() {
        workTypeTrigger.addClass('click');
        workTypePopup.show();
        resetWorkTypePosition();
    }

    function workTypeHide() {
        workTypeTrigger.removeClass('click');
        workTypePopup.hide();
    }

    /*工作经验*/
    var workExpTrigger = $('#workExp'),
    workExpPopup = $('#workExpPopup'),
    workExpPopupLink = workExpPopup.children('a');
    workExpSelectedLink = workExpPopupLink.filter(function() {
        return $(this).hasClass('cur');
    });

    function resetWorkExpPosition() {
        var pinObj = {
            element: workExpPopup,
            x: 0,
            y: 0
        },
        baseObj = {
            element: workExpTrigger,
            x: 0,
            y: '100%-1'
        };
        position.pin(pinObj, baseObj);
    }

    function workExpShow() {
        workExpTrigger.addClass('click');
        workExpPopup.show();
        resetWorkExpPosition();
    }

    function workExpHide() {
        workExpTrigger.removeClass('click');
        workExpPopup.hide();
    }

    /*学历要求*/
    var recordTrigger = $('#record'),
    recordPopup = $('#recordPopup'),
    recordPopupLink = recordPopup.children('a');
    recordSelectedLink = recordPopupLink.filter(function() {
        return $(this).hasClass('cur');
    });

    function resetRecordPosition() {
        var pinObj = {
            element: recordPopup,
            x: 0,
            y: 0
        },
        baseObj = {
            element: recordTrigger,
            x: 0,
            y: '100%-1'
        };
        position.pin(pinObj, baseObj);
    }

    function recordShow() {
        recordTrigger.addClass('click');
        recordPopup.show();
        resetRecordPosition();
    }

    function recordHide() {
        recordTrigger.removeClass('click');
        recordPopup.hide();
    }

    /*月薪范围*/
    var payRangeTrigger = $('#payRange'),
    payRangePopup = $('#payRangePopup'),
    payRangeForm = $('#frmSalary'),
    payRangeMinInput = payRangeForm.find('input[name=txtminSalary]'),
    payRangeMaxInput = payRangeForm.find('input[name=txtmaxSalary]');
    payRangeInput = payRangeForm.find('input[name=params]'),
    payRangeLink = payRangePopup.find('a').eq(1).attr('href');

    function resetPayRangePosition() {
        var pinObj = {
            element: payRangePopup,
            x: 0,
            y: 0
        },
        baseObj = {
            element: payRangeTrigger,
            x: 0,
            y: '100%-1'
        };
        position.pin(pinObj, baseObj);
    }

    function payRangeShow() {
        payRangeTrigger.addClass('click');
        payRangePopup.show();
        resetPayRangePosition();
    }

    function payRangeHide() {
        payRangeTrigger.removeClass('click');
        payRangePopup.hide();
    }
    payRangePopup.on('click', '#salaryBtn',
    function(e) {
        var min = Number(payRangeMinInput.val()),
        max = Number(payRangeMaxInput.val()),
        msg;

        if (!min && !max) {
            msg = '请输入数字';
        }
        if (msg) {
            confirmBox.timeBomb(msg, {
                name: 'fail',
                width: pWidth + msg.length * fontSize,
                timeout: 500
            });
            return;
        }

        var e = 'e' + min + '_' + max,
        url = payRangeLink.replace(/e\d+\_\d+/g, e);

        window.location.href = url;

        //payRangeMinInput.remove();
        //payRangeMaxInput.remove();
        //payRangeForm.submit();
    });

    var regesitID = ['#jobsortPopup', '#companySizePopup', '#companyTypePopup', '#workTypePopup', '#workExpPopup', '#recordPopup', '#payRangePopup'].join(',');

    function addOtherBoxListener() {
        $(document).on('mouseenter mouseleave', regesitID,
        function(e) {
            var target = $(e.currentTarget);
            switch (target.attr('id')) {
            case 'jobsortPopup':
                if (e.type == 'mouseenter') {
                    jobsortShow();
                } else {
                    jobsortHide();
                }
                break;
            case 'companySizePopup':
                if (e.type == 'mouseenter') {
                    companySizeShow();
                } else {
                    companySizeHide();
                }
                break;
            case 'companyTypePopup':
                if (e.type == 'mouseenter') {
                    companyTypeShow();
                } else {
                    companyTypeHide();
                }
                break;
            case 'workTypePopup':
                if (e.type == 'mouseenter') {
                    workTypeShow();
                } else {
                    workTypeHide();
                }
                break;
            case 'workExpPopup':
                if (e.type == 'mouseenter') {
                    workExpShow();
                } else {
                    workExpHide();
                }
                break;
            case 'recordPopup':
                if (e.type == 'mouseenter') {
                    recordShow();
                } else {
                    recordHide();
                }
                break;
            case 'payRangePopup':
                if (e.type == 'mouseenter') {
                    payRangeShow();
                } else {
                    payRangeHide();
                }
                break;
            }
        });
    }

    function removeOtherBoxListener() {
        $(document).off('mouseenter mouseleave');
    }

    addOtherBoxListener();

    function jobsortListenerHide() {
        if (jobsortIsListener) {
            jobsortIsListener = false;
            jobsortHide();
        }
    }

    var userEnterBox = $('.login_regAge');
    userEnterBox.on('mouseenter mouseleave', '.personage, .newPhone',
    function(e) {
        var target = $(e.currentTarget);
        if (e.type === "mouseenter") {
            target.addClass('hover');
        } else {
            target.removeClass('hover');
        }
    });

    other_box.on('mouseenter mouseleave', 'a',
    function(e) {
        var target = $(e.currentTarget);
        switch (target.attr('id')) {
        case 'jobsortTrigger':
            if (e.type == 'mouseenter') {
                jobsortShow();
            } else {
                jobsortHide();
            }
            break;
        case 'companySize':
            jobsortListenerHide();
            if (e.type == 'mouseenter') {
                companySizeShow();
            } else {
                companySizeHide();
            }
            break;
        case 'companyType':
            jobsortListenerHide();
            if (e.type == 'mouseenter') {
                companyTypeShow();
            } else {
                companyTypeHide();
            }
            break;
        case 'workType':
            jobsortListenerHide();
            if (e.type == 'mouseenter') {
                workTypeShow();
            } else {
                workTypeHide();
            }
            break;
        case 'workExp':
            jobsortListenerHide();
            if (e.type == 'mouseenter') {
                workExpShow();
            } else {
                workExpHide();
            }
            break;
        case 'record':
            jobsortListenerHide();
            if (e.type == 'mouseenter') {
                recordShow();
            } else {
                recordHide();
            }
            break;
        case 'payRange':
            jobsortListenerHide();
            if (e.type == 'mouseenter') {
                payRangeShow();
            } else {
                payRangeHide();
            }
            break;
        }
    });

    var win = $(window);
    win.resize(function() {
        resetJobsortPostion();
        resetCompanySizePosition();
        resetPayRangePosition();
    });

    $('#searchResInput').placeHolder().on('focus blur',
    function(e) {
        var parent = $(this).parent();
        if (e.type === 'focus') {
            parent.addClass('focus');
        } else {
            parent.removeClass('focus');
        }
    });

});
//结束
function ajaxLoginCallback() {
    window.location.href = window.location.href;
}

function cancelConcealed(company_flag, company_name) {

    confirmBox_.confirm('<input type="text" value="' + company_name + '" class="closeBtnx"><span class="keywordError"></span><span class="keywordTip">添加公司的关键字（长度不超过8个字）后，包含该关键字的公司都会被屏蔽；如：添加了“XX公司”、“XX公司123”、“123XX公司”将会被屏蔽。</span>', "提示",
    function() {
        var thisVal = $('.closeBtnx').val();
        if (thisVal == '') {
            $('.keywordError').text('公司关键字不能为空').css('display', 'block');
            return;
        } else if (thisVal.length > 8) {
            $('.keywordError').text('（公司关键字在8个字以内）').css('display', 'block');
            return;
        } else {
            $('.keywordError').text('').css('display', 'none');
            this.hide();
        }
        var self = this;
        thisjquery.post("/concealed/addConcealed/", {
            "keyword": thisVal
        },
        function(json) {
            if (json.status) {
                window.location.reload();
            } else {
                if (json.isredirect == true) {
                    window.location.href = "" + personLink + "/login";
                    return false;
                }
                confirmBox_.timeBomb(json.msg, {
                    name: 'warning',
                    width: 'auto',
                    timeout: 3000
                });
            }
        },
        'json')
    },
    {
        width: 450,
        close: 'x'
    });
}

// 9.20新增地铁
$('.subwayTitle a').on('click',function(){
	if($(this).hasClass('cur'))return
	$('.subwayTitle a').removeClass('cur');
	$(this).addClass('cur')
	$('.stationItem').removeClass('cur').eq($(this).index()).addClass('cur')
})
//获取url参数
function getUrlParams(str){
	var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
		   var pair = vars[i].split("=");
		   if(pair[0] == str){return pair[1];}
   }
   return false;
}
$('.stationItem a').on('click',function(){
	var href=location.href.replace(/\/$/,'');
	var keyword=getUrlParams('key');
	var params=getUrlParams('params')?getUrlParams('params').replace(/\/$/,''):false||href.match(/([a-zA-Z][0-9_]+)+/)?href.match(/([a-zA-Z][0-9_]+)+/)[0]:false||'';
	console.log(params)
	params=params.replace(/s[0-9_]+/,'').replace(/b[0-9_]+/,'').replace(/p[0-9_]+/,'')
	if(keyword){
		params.replace(keyword,'')
	}
	params+='s'+$(this).attr('data-value')
	
	location.href=siteUrl+"/jobsearch/?params=" + params + (keyword===false ? '' : ('&key='+keyword));
});

