/* 
 * 聊一聊视频模式
 */
var chatVideo = {
    netApplyId          : 0, //校园招聘会投递编号
    canCreateResume     : true,
    isSupported         : true,
    supportedmsg        : "",
    sid                 : 0, //活动场次ID
    videoAuthInfoUrl    : null, //视频信息授权地址
    createRoomUrl       : null, //创建房间url
    baseInfoUrl         : null, //基本信息url
    nextUrl             : null, //下一条信息url
    schoolNetFairUrl    : null, //求职者大厅url
    aliWebrtc           : null,//RTC对象
    room                : 0,//房间号
    userName            : "", //聊天对象
    resume_id           : 0,//简历编号
    person_id           : 0,
    job_id              : 0,//职位编号
    localVideo          : null,//本地视频对象
    resumeVideo         : null,//聊天人的视频对象
    hasNext             : false,//是否有下一位面试者
    nextApplyId         : 0,//下一个面试者
    nextJobId           : 0,
    nextResumeId        : 0,
    lastTime            : 0,//剩余聊天时间
    roomTime            : 0,//剩余聊天时间
    statusType          : null,//面试结果
    intervalTime        : null,//定时器,
    inviteTimeLong      : 0,//面试时长
    companyName         : null,//企业名称
    intervalTime2       : null,//定时器发送消息
    //跳过的定时程序
    jumpIntervalTime    : null,//跳过定时程序
    showjumpTime        : 0, //显示跳过时间
    applySource         : 0, //投递来源
    interviewStatus     : 0, //0面试未开始 1面试中 2面试结束 -1已跳过
    show_apply_result   : false, //是否显示事情面试结果
    can_extend   : false, //是否可以延长
    show_apply_source   : "1", //是否显示倒计时
    is_first   : false, //是否初面
    surplusTime   :  0, //企业剩余时间
    //初始化视频界面数据
    init:function(videoInfo){
        this.netApplyId             = videoInfo.netApplyId;
        this.sid                    = videoInfo.sid;
        this.videoAuthInfoUrl       = videoInfo.videoAuthInfoUrl;
        this.createRoomUrl          = videoInfo.createRoomUrl;
        this.baseInfoUrl            = videoInfo.baseInfoUrl;
        this.nextUrl                = videoInfo.nextUrl;
        this.schoolNetFairUrl       = videoInfo.schoolNetFairUrl;
        this.companyName            = videoInfo.companyName;
        this.applySource            = videoInfo.applySource;
        this.resume_id              = videoInfo.resumeId;
        this.canCreateResume        = true;
        this.bindEvent();
    },
    //创建本地视频对象
    createLocalVideo:function(){
        var _local_html = $('<video autoplay playsinline style="height:100%;width:100%"></video>');
        $(".chatVideo .local-video").html(_local_html);
        this.localVideo = _local_html;
    },
    //移除本地视频对象
    deleteLocalVideo:function(){
        this.localVideo = null;
        $(".chatVideo .local-video").hide();
        $(".chatVideo .local-video").html("");
    },
    
    //创建房间 并且展示接画面
    createRoom:function(net_apply_id,resume_id,job_id){
        var _this           = this;
        if(!_this.isSupported){
            if(typeof(VideoaAnchorMsg) != "undefined"){
                VideoaAnchorMsg(_this.supportedmsg,{ icon: 'warning' });
                return;
            }else{
                alert(_this.supportedmsg);return;
            }
        }
        if(_this.canCreateResume == false){
            if(typeof(VideoaAnchorMsg) != "undefined"){
                VideoaAnchorMsg("已经在视频面试中了，请耐心等待",{ icon: 'warning' });
                return;
            }else{
                alert("已经在视频面试中了，请耐心等待");return;
            }
        }
        _this.netApplyId  = net_apply_id;
        _this.resume_id   = resume_id;
        _this.job_id      = job_id;

        var create_room_url = _this.createRoomUrl;
        $.post(create_room_url, {net_apply_id:net_apply_id,resume_id:resume_id,job_id:job_id}, function(re){
            if (re.status) {
                _this.room      = re.data.room_id;
                _this.show_apply_source      = re.data.apply_source;
                _this.userName  = re.data.user_name;
                _this.person_id = re.data.person_id;
                _this.job_id    = re.data.job_id;
                _this.can_extend    = re.data.can_extend;
                _this.show_apply_result = re.data.show_apply_result;
                _this.lastTime = re.data.room_time;
                //_this.lastTime = 10;
                _this.roomTime = re.data.room_time;
                _this.surplusTime = re.data.surplus_time;
               // _this.surplusTime = 0;
                //_this.roomTime = 10;
                _this.is_first = re.data.is_first;
                if(re.data.room_time<=0){
                    VideoaAnchorMsg("没有视频面试时间了",{ icon: 'warning' });
                    return;
                }
                _this.createLocalVideo();
                 //显示视频聊天
                _this.showVideoScreen();
                //创建房间
                //预览自己的视频
                _this.newAliWebrtc();
                //发送消息
                var message = _this.companyName + "邀请你视频面试";
                chatVideo.intervalTime2 = window.setInterval(function(){
                    if(myWebim.sess_id != ""){
                        myWebim.sendNormalMsg(message);
                        myWebim.changeShowResumeType(1);
                        clearInterval( chatVideo.intervalTime2);
                    }
                },1000);

                 _this.canCreateResume  = false;
                //显示聊天窗上面信息
                _this.showResumeInfo();
            } else {
                if(re.data.code == 1){
                    if(typeof(VideoConfirmBox) != "undefined"){
                        VideoConfirmBox.confirm(re.msg,'提示',function(){
                            this.hide();
                            window.location.href = chatVideo.nextUrl+"?resume_id="+re.data.next_resume_id+"&job_id="+re.data.next_job_id+"&net_apply_id="+re.data.net_apply_id;
                            return;
                        },{
							width:350
						});
                    }else{
                        alert(re.msg);return;
                    }
                }else{
                    if(typeof(VideoaAnchorMsg) != "undefined"){
                        VideoaAnchorMsg(re.msg,{ icon: 'warning' });
                        return;
                    }else{
                        alert(re.msg);return;
                    }
                }
            }
        },'json');
        
    },
    newAliWebrtc:function(){
        var _this = this;
        var userName = _this.userName;
        if(_this.aliWebrtc == null){ //如果没有创建实例 则创建实例
            _this.aliWebrtc = new AliRtcEngine("");
        }
//        _this.aliWebrtc.videoProfile = { 
//            frameRate:20,
//            width: 309,
//            height:600
//          };
        // remote用户加入房间
        _this.aliWebrtc.on('onJoin', (data) => {
            conole.log("onJoin");
            console.log(data);
        });
        // remote流发布事件
        _this.aliWebrtc.on('onPublisher', (publisher) => {
          console.log("onPublisher");
          console.log(publisher);
          _this.receivePublish(publisher);
        });
        // remote流结束发布事件
        _this.aliWebrtc.on('onUnPublisher', (publisher) => {
            console.log("onUnPublisher");
            console.log(publisher);
            _this.removePublish(publisher.userId);
            //对方挂断
            
        });
        // 错误信息
        _this.aliWebrtc.on('onError', (error) => {
          var msg = error && error.message ? error.message : error;
//          alert(msg);
            console.log(msg);
        });

        // 订阅remote流成功后，显示remote流
        _this.aliWebrtc.on('onMediaStream', (subscriber, stream) => {
            /*var video = _this.getDisplayRemoteVideo(subscriber.userId, subscriber.displayName);
            _this.aliWebrtc.setDisplayRemoteVideo(subscriber, video, stream);
            _this.onLiveVideoScreen();*/
        });

        _this.aliWebrtc.on('OnConnecting', (data) => {
          console.log(data.displayName + "正在建立连接中...");
        });
        _this.aliWebrtc.on('OnConnected', (data) => {
          console.log(data.displayName + "成功建立连接");
        });
        _this.aliWebrtc.on('onLeave', (data) => {
          _this.removePublish(data.userId);
        });
         var localVideo = _this.localVideo; //本地视频
        _this.aliWebrtc.startPreview(localVideo[0]).then((obj) => {
        //2. 获取频道鉴权令牌参数
        _this.getRTCAuthInfo().then((authInfo) => {
              //3. 加入房间
              _this.aliWebrtc.joinChannel(authInfo, userName).then(() => {
                    console.log('加入房间成功');
                // 4. 发布本地流
                _this.aliWebrtc.publish().then((res) => {
                  console.log('发布流成功');
                }, (error) => {
                  //alert(error.message);
                  console.log(error.message);
                });
              }).catch((error) => {
                //alert(error.message);
                console.log(error.message);
              })
            }).catch((error) => {
              //alert(error.message);
              console.log(error.message);
            });
        }).catch((error) => {
            //alert(error.message);
            console.log(error.message);
        });
    },
    //获取展示视频流
    getDisplayRemoteVideo:function(id,displayName){
        var _this = this;
        var videoWrapper = $('<div class="local-video-get" id="' + _this.resume_id + '" style="height:100%;width:100%"><video autoplay playsinline style="width:306px;height:510px"></video></div>');
        //将视频插入本地视频后
        $('.chatVideo .local-video').after(videoWrapper);
        _this.resumeVideo = videoWrapper;
        return videoWrapper.find('video')[0];
    },
    //对方$hr_person_id离开后删除视频
    removePublish:function(){
        //删除
        var _this = this;
        clearInterval(chatVideo.intervalTime);
       _this.overVideoScreen(1);
    },
    receivePublish:function(publisher){
        var _this = this;
        _this.aliWebrtc.subscribe(publisher.userId).then((subscribeCallId) => {
            console.log('订阅成功');
            var video = _this.getDisplayRemoteVideo(publisher.userId, publisher.displayName);
            console.log("video",video);
            _this.aliWebrtc.setDisplayRemoteVideo(publisher.userId, video, 1);
            _this.onLiveVideoScreen();
      }, (error) => {
        //alert(error.message);
        console.log(error.message)
      });
    },
    getRTCAuthInfo:function(){
        var _this       = this;
        var channelId   = this.room;
        var userName    = "test";
        var url     = "{/$siteurl.company/}/video/GetToken?room=" + channelId + "&user=" + userName + "&passwd=1234";
        var room    = this.room;
        var url = this.videoAuthInfoUrl + "/?room="+channelId;
       return new Promise(function (resolve, reject) {
            $.ajax({
              url: url, //"https://alirtc.ossrs.net/app/v1/login?room="+channelId + "&user="+ userName + "&passwd=1234",
              type: 'POST',
              contentType: 'application/json; charset=utf-8',
              dataType: 'json',
              success: (data) => {
                data.data.channel = channelId;
                console.log("进入房间成功，房间号："+channelId);
                resolve(data.data);
              },
              failed: (error) => {
                reject(error);
              }
            });
        });
    },
    //显示视频连接内容
    showVideoScreen:function(){
        var _this = this;
        //初始化界面 
        //判断是否是通过网络招聘会进入
        $(".chat-main").find(".chat-left").hide();
        $(".chat-main").find(".chatVideo").show();
        var beforeVideoHtml = '<div class="chatVideoInvite beforeVideoInfo" style="display: block;">'
                             + '<i class="invitex01 icon-AI-_-17"></i>'
                             + '<b class="invitex02">正在等待对方接受邀请…</b>'
                             + '<b class="invitex04 daojishi">请耐心等待<i class="priDownTime">30</i>s</b>'
                             + '<em class="invitex05 daojishi1">请勿直接关闭浏览器</em>'
                             + '<div class="inviteVideo">'
                             +'<span class="vidoJump" style="display:none"><i class="guaduan">挂断</i></span>'
                             +'<span class="tiaoguo1" style="display:none"><i class="tiaoguo">跳过</i></span>'
                             +'<p class="beforeWord" style="display:none"><i class="guaduan">挂断</i>后如需与该求职者联系，可在面试结果中寻找该求职者</p>'
                             +'</div>'
                             +'</div>';
        $(".chat-main").find(".chatVideoTop").append(beforeVideoHtml);
        //关闭视频面试按钮
        $('.chatOnceVideo').hide();
        //定时程序
        // if(_this.netApplyId!="0"){
        //     if(chatVideo.jumpIntervalTime != null){
        //         clearInterval(chatVideo.jumpIntervalTime);
        //     }
        //     var jumpIntervalTime = window.setInterval(function(){
        //         chatVideo.checkShowJump();
        //     },1000);
        //     chatVideo.jumpIntervalTime = jumpIntervalTime;
        // }
        if(chatVideo.jumpIntervalTime != null){
            clearInterval(chatVideo.jumpIntervalTime);
        }
        var jumpIntervalTime = window.setInterval(function(){
            chatVideo.checkShowJump();
        },1000);
        chatVideo.jumpIntervalTime = jumpIntervalTime;
    },
    //关闭视频聊天
    offVideoScreen:function(){
        this.canCreateResume = true;
        this.deleteLocalVideo();
        this.localVideo = null;
        this.aliWebrtc  = null;
        $(".chat-main").find(".chat-left").show();
        $(".chat-main").find(".chatVideo").hide();
        myWebim.closeIframeResume();
        myWebim.changeShowResumeType(0);
        this.room = 0;
        this.showjumpTime = 0;
        $(".chat-main").find(".overVideoInfo").remove();
        $(".chat-main").find(".OnVideoInfo").remove();
        $("body").find(".interviewerTop").remove();
        $("body").find(".beforeVideoInfo").remove();//删除预加载
        clearInterval(chatVideo.intervalTime);
        clearInterval(chatVideo.jumpIntervalTime);
    },
    //视频联通后事件并显示内容  并且设置该面试未面试中
    onLiveVideoScreen:function(){
        this.interviewStatus = 1; //面试中
        var _this = this;
        //关闭定时任务
        clearInterval(chatVideo.jumpIntervalTime);
//        _this.localVideo.hide();//隐藏本地视频域
//        $('.chatVideo .local-video').hide();
        $("body").find(".beforeVideoInfo").remove();//删除预加载
        //设置video 宽高
        $(".chatVideo .local-video").show();//本地视频显示出来
        $("body").find(".local-video-get video").css({"height":"542px","width":'306px'});
        //显示显示中内容
        var onVideoHtml =   '<div class="chatVideoInvite OnVideoInfo" style="width:100%;">'
            +'<div class="invitex03">'
			// +'<span style="display: none">本次视频剩余时间：<em class="netLastTime" style="font-size:16px;font-weight: bolder">--</em><span class="netLastTimeUnit">秒</span></span>'
            // +'<span style="display: none">套餐内剩余视频：<em class="packageSurplusTime" style="font-size:16px;font-weight: bolder">--</em><span class="packageSurplusTimeUnit">分钟</span></span>'
            +'<span style="display: none" class="videoRemainingTime"><em class="tipCon">本次视频剩余时间：</em><em class="netLastTime netLastTimeValue">--</em><span class="netLastTimeUnit">秒</span></span>'
            +'<span style="display: none" class="videoPackage"><em class="tipCon">套餐内剩余视频：</em><em class="packageSurplusTime packageSurplusTimeValue">--</em><span class="packageSurplusTimeUnit">分钟</span></span>'
			
			+'<b class="isExtendTime" style="display:none"><i></i>延长5分钟</b>'
            +'</div>'
            +'<div class="inviteVideo" style="padding-top:320px">'
            +'<span class="videoHang"><i>挂断</i></span>'
            +'</div>'
            +'</div>';
        //挂断
        _this.surplusTime
        $(".chat-main").find(".chatVideoTop").append(onVideoHtml);
        //console.log('can_extent',_this.can_extent);
        if(_this.can_extend && _this.is_first){
            $("body .chatVideo").find(".isExtendTime").show();
        }
        _this.showOnVideoTime();
        //设置为面试中
        var net_apply_id    = this.netApplyId; 
        var baseInfoUrl     = this.baseInfoUrl;
        var channel_id      = this.room;
        $.post(baseInfoUrl, {net_apply_id:net_apply_id,"type":"setApplyOn","channel_id":channel_id}, function(re){
            if (re.status) {
                console.log("设置为面试中成功");
            } else {
               alert(re.msg);
            }
        },'json');
    },
    showOnVideoTime:function(){
        
        var _this           = this;
        var net_apply_id    = this.netApplyId; 
        //var channel_id    = this.channel_id;
        var baseInfoUrl     = this.baseInfoUrl;
       // $.post(baseInfoUrl, {channel_id:_this.channel_id,net_apply_id:net_apply_id,"type":"getTime"}, function(re){
         //   if (re.status) {
                var lastTime = _this.lastTime;
                if (_this.netApplyId == "0") {
                    $("body .chatVideo").find(".netLastTimeUnit").text("分钟");
                    $("body .chatVideo").find(".netLastTime").parent().show();
                    $("body .chatVideo").find(".netLastTime").html(parseInt(lastTime/60));
                    if(_this.surplusTime<=20){
                        $("body .chatVideo").find(".packageSurplusTime").parent().show();
                        $("body .chatVideo").find(".packageSurplusTime").html(parseInt(_this.surplusTime));
                    }
                } else {
                    if (_this.is_first) {
                        $("body .chatVideo").find(".netLastTimeUnit").text("秒");
                        $("body .chatVideo").find(".netLastTime").parent().show();
                        $("body .chatVideo").find(".netLastTime").html(lastTime);
                    } else {
                        $("body .chatVideo").find(".netLastTime").parent().hide();
                    }
                }
                _this.startInterval();//计算时间
           // }
       // },'json');
    },
    //结束聊天后的事件并显示内容
    overVideoScreen:function(level_type){ 
        var _this = this;
        //显示视频面试按钮
        //console.log('overVideoScreen',level_type);
        $('.chatOnceVideo').show();
        if(_this.aliWebrtc == null){ //如果是主动关闭的 则不执行这个方法
            return;
        }
        this.interviewStatus = 2; //面试结束
        var level_word = "当前面试已结束";
        //level_type 如果是0 表示自己断开 如果是1  表示求职者已断开
        if(level_type == 1){
            level_word = "求职者已断开视频面试";
        }else if(level_type == 2){
            if(_this.netApplyId=="0"){
                level_word = "对方已拒绝";
            }else{
                level_word = "求职者已拒绝视频面试";
            }
        }else if(level_type == 3){
           // level_word = "求职者30秒未接";
            level_word = "对方无应答";
        }

        _this.deleteLocalVideo();
//         $('.chatVideo .local-video').remove();
        //_this.resumeVideo.remove();
        $("body .chatVideo .local-video-get").remove();
        $("body .chat-main").find(".OnVideoInfo").remove();
        $("body").find(".beforeVideoInfo").remove();//删除预加载
        
        var _html = '<span class="finterNext saveResult">保存</span>';
        if(_this.hasNext){
            var _html = '<span class="finterNext saveResult">保存并继续下一个</span>';
        }
        var _overVideoHtml = '<div class="overVideoInfo" style = "position: absolute;top: 0;left:15px;">'
                                +'<span class="closeVideo" style=display:none></span>' //关闭视频面试 已注释
                                +'<span class="endInterview"><i class="icon-job_position_selected"></i>'+level_word+'</span>'
                                +'<div class="finterviewResult">'
                                +'<span class="finterResult">请反馈面试结果</span>'
                                +'<p>'
                                    +'<em data-type="wait">待定</em>'
                                    +'<em data-type="no">不合适</em>'
                                    +'<em data-type="yes">初面通过</em>'
                                +'</p>'
                                +_html
                                +'<span class="finterTips">活动结束后，待定与初面通过的简历将发送到您的邮箱</span>'
                                +'</div>'
                                +'</div>';
        //console.log("overVideoScreen",_this.is_first);
        if(_this.is_first){
            $(".chat-main").find(".chatVideoTop").append(_overVideoHtml);
        }
        //离开房间 todo
        _this.aliWebrtc.leaveChannel();
        _this.aliWebrtc.dispose();
        //_this.aliWebrtc.unPublish();
        var channel_id      = this.room;
        var baseInfoUrl     = this.baseInfoUrl;
        var net_apply_id    = this.netApplyId;
        $.post(baseInfoUrl, {channel_id:channel_id,"type":"setApplyEnd","net_apply_id":net_apply_id}, function(re){
           console.log("结束状态成功");
        },'json'); 

        if(level_type == 0){
            //发送结束消息
            var timelong    = chatVideo.inviteTimeLong;
            var fen         = parseInt(timelong/60);
            var miao        = parseInt(timelong%60);
            if(fen < 10){
                fen = "0" + fen;
            }
            if(miao < 10){
                miao = "0" + miao;
            }
            var message     = "视频面试结束，面试时长 " + fen+":"+miao;
            myWebim.sendNormalMsg(message);
        }
        if(level_type == 1 || level_type == 2 || level_type == 3){
            if(_this.netApplyId=="0"){
                VideoaAnchorMsg(level_word,{ icon: 'warning' ,timeout:3});
            }
        }
        if(!_this.is_first){
            _this.offVideoScreen();
        }
    },
    //绑定聊天事件
    bindEvent:function(){
        //挂断
        var _this = this;
        $("body").on("click",".videoHang",function(){
           //结束聊天
           //挂断
            clearInterval(chatVideo.intervalTime);
           _this.overVideoScreen(0);
        });
        //跳过
        $("body").on("click",".vidoJump",function(){
            var net_apply_id    = chatVideo.netApplyId; 
            var baseInfoUrl     = chatVideo.baseInfoUrl;
            var next_job_id     = chatVideo.nextJobId;
            var next_apply_id   = chatVideo.nextApplyId;
            var next_resume_id  = chatVideo.nextResumeId;
            var channel_id      = chatVideo.room;
            var _msg = "<div>确定要挂断该求职者吗？</div>";
            if(chatVideo.hasNext){
                _msg = "<div>确定要挂断该求职者吗？</div>";
            }
            //普通挂断
            if(net_apply_id=="0"){
                myWebim.sendNormalMsg("视频面试已取消");
                _this.offVideoScreen();
                $('.chatOnceVideo').show();
                $.post(baseInfoUrl, {"type":"setInterviewResult",'status_type':"handup","channel_id":channel_id}, function(re){
                },'json');
            }else{
                VideoConfirmBox.confirm(_msg,"提示",function(){
                    this.hide();
                    $('.chatOnceVideo').show();
                    _this.aliWebrtc.leaveChannel();
                    _this.aliWebrtc.dispose();
                    _this.interviewStatus = -1; //跳过
                    $.post(baseInfoUrl, {net_apply_id:net_apply_id,"type":"setInterviewResult",'status_type':"handup","channel_id":channel_id}, function(re){
                        if (re.status) {
                            console.log("挂断");
                            _this.offVideoScreen();
                            //关闭聊天界面
                        } else {
                            alert(re.msg);
                        }
                    },'json');
					
                },
				function(){
					this.hide();
				},
				{
					width:400,
					confirmBtn: '<button class="chat_button chat_btnsSure">确定</button>',
					cancelBtn: '<button class="chat_button chat_btnsCancel">取消</button>',
				}
				);
            }
        });
        //跳过
        $("body").on("click",".tiaoguo1",function(){
            var net_apply_id    = chatVideo.netApplyId; 
            var baseInfoUrl     = chatVideo.baseInfoUrl;
            var next_job_id     = chatVideo.nextJobId;
            var next_apply_id   = chatVideo.nextApplyId;
            var next_resume_id  = chatVideo.nextResumeId;
            var channel_id      = chatVideo.room;
            var _msg = "确定要跳过该求职者吗？";
            VideoConfirmBox.confirm(_msg,"提示",function(){
                this.hide();
                _this.aliWebrtc.leaveChannel();
                _this.aliWebrtc.dispose();
                _this.interviewStatus = -1; //跳过
                $.post(baseInfoUrl, {net_apply_id:net_apply_id,"type":"setInterviewResult",'status_type':"jump","channel_id":channel_id}, function(re){
                    if (re.status) {
                        console.log("设置跳过成功");
                        if(_this.hasNext){
                            //跳到下一个
                            window.location.href = chatVideo.nextUrl+"?resume_id="+next_resume_id+"&job_id="+next_job_id+"&net_apply_id="+next_apply_id;
                        }else{
                            //window.location.href = chatVideo.schoolNetFairUrl;
                             _this.offVideoScreen();
                        }
                        //关闭聊天界面
                    } else {
                       alert(re.msg);
                    }
                },'json'); 
            },
				function(){
					this.hide();
				},
				{
					width:400,
					confirmBtn: '<button class="chat_button chat_btnsSure">确定</button>',
					cancelBtn: '<button class="chat_button chat_btnsCancel">取消</button>',
				});
        });
        
        //保存面试邀请
        $("body").on("click",".overVideoInfo em",function(){
            $(this).addClass("cut");
            $(this).siblings().removeClass("cut");
            var status_type = $(this).attr("data-type");
            chatVideo.statusType = status_type;
            console.log(status_type);
        });
        //保存面试结果
        $("body").on("click",".saveResult",function(){
            var _type = chatVideo.statusType;
            if(_type == null){
                VideoaAnchorMsg("请选择面试结果",{ icon: 'warning' });
                return;
            }
            _this.setInterResult(_type);
        });
        //返回面试大厅
        $("body").on("click",".backVido",function(){
            if(chatVideo.interviewStatus == 1){
                VideoaAnchorMsg(" 您正在面试中，暂时无法返回面试大厅 ",{ icon: 'warning' });
                return;
            }
            if(chatVideo.interviewStatus == 0){
                VideoaAnchorMsg("正在等待求职者接受邀请，暂时无法返回面试大厅",{ icon: 'warning' });
                return;
            }
            window.location.href = chatVideo.schoolNetFairUrl;
        });
        //延时 300秒
        $("body .chatVideo").on("click",".isExtendTime",function(){
            var last_time = chatVideo.lastTime;
            last_time     = parseInt(last_time) + 300;
            
            var net_apply_id    = _this.netApplyId; 
            var baseInfoUrl     = _this.baseInfoUrl;
            $.post(baseInfoUrl, {net_apply_id:net_apply_id,"type":"setExtend","last_time":last_time}, function(re){
                if(re.status){
                    chatVideo.lastTime = last_time;
                    $("body .chatVideo").find(".netLastTime").html(last_time);
                    $("body .chatVideo").find(".isExtendTime").remove();
                }else{
                    VideoaAnchorMsg("延时失败",{ icon: 'warning' });
                    return;
                }
            },'json'); 
        });
        //监听刷新页面时间
        
        
    },
     //设置面试结果
    setInterResult:function(status_type){
        var _this           = this;
        var net_apply_id    = this.netApplyId; 
        var baseInfoUrl     = this.baseInfoUrl;
        var next_job_id     = this.nextJobId;
        var next_apply_id   = this.nextApplyId;
        var next_resume_id  = this.nextResumeId;
        $.post(baseInfoUrl, {net_apply_id:net_apply_id,"type":"setInterviewResult",'status_type':status_type}, function(re){
            if (re.status) {
                console.log("设置面试状态成功");
               if(_this.hasNext){
                   //跳到下一个
                   window.location.href = _this.nextUrl+"?resume_id="+next_resume_id+"&job_id="+next_job_id+"&net_apply_id="+next_apply_id;
               }else{
                   //window.location.href = _this.schoolNetFairUrl;
                   _this.offVideoScreen();
               }
            } else {
                VideoaAnchorMsg(re.msg,{ icon: 'warning' });
            }
        },'json');
    },
    showResumeInfo:function(){
        var _this           = this;
        if(_this.applySource != 1){
            return;
        }
        var net_apply_id    = this.netApplyId; 
        var baseInfoUrl     = this.baseInfoUrl;
        $.post(baseInfoUrl, {net_apply_id:net_apply_id,"type":"nextApply"}, function(re){
            if (re.status) {
                var _data           = re.data;
                var userName        = _data.next_name;
                var age             = _data.age;
                var next_degree     = _data.next_degree;
                var next_station    = _data.station;
                var sex             = _data.next_sex;
                var w_time          = _data.wait_time;
                chatVideo.hasNext   = true;
                $("body").find(".beforeVideoInfo .tiaoguo").html("跳过，面试下一位")
                chatVideo.nextApplyId   = _data.next_apply_id;
                chatVideo.nextJobId     = _data.job_id;
                chatVideo.nextResumeId  = _data.resume_id;
                var html = '<div class="interviewerTop">'
                        +'<a href="javascript:void(0);" class="backVido">返回面试大厅</a>'
                        +'<div class="nextVideoInterviewer">'
                             +'<span>下一位面试者：'+userName+'（'+sex+'/'+age+'/'+next_degree+'）</span>'
                             +'<p>'
                             +'<em>面试职位：'+next_station+'</em>'
                             +'<i>已等待：'+w_time+'分钟</i>'
                             +'</p>'
                             +'</div>'
                         +'</div>';
                $(".chat-main").before(html);
                if(!_this.is_first){
                    $(".nextVideoInterviewer").hide();
                }
            } else {
               console.log(re.msg);
               var html = '<div class="interviewerTop">'
                        +'<a href="javascript:void(0);" class="backVido">返回面试大厅</a>'
                        +'<div class="nextVideoInterviewer" style="display:none">'
                             +'</div>'
                         +'</div>';
                $(".chat-main").before(html);
            }
        },'json');
    },
    startInterval:function(){
        var time = window.setInterval(function(){
            chatVideo.updateLastTime();
        },1000);
        chatVideo.intervalTime = time;
    },
    //接通后每秒的定时器
    updateLastTime:function(){
        var _this     = this;
        var last_time = this.lastTime;
        last_time     = parseInt(last_time) - 1;
        chatVideo.inviteTimeLong = chatVideo.inviteTimeLong + 1;
        if(_this.netApplyId=="0"){
            if(last_time>=60){
                $("body .chatVideo").find(".netLastTime").html(parseInt(last_time/60));
            }else{
                if(last_time>=0){
                    $("body .chatVideo").find(".netLastTime").html(parseInt(last_time));
                    $("body .chatVideo").find(".netLastTimeUnit").text("秒");
                }else{
                    $("body .chatVideo").find(".netLastTime").html(0);
                    $("body .chatVideo").find(".netLastTimeUnit").text("分钟");
                }
            }
        }else{
            $("body .chatVideo").find(".netLastTime").html(last_time);
        }

        if(last_time <= 100){
            if(last_time % 2 == 0){
                 $("body .chatVideo").find(".netLastTime").css({
                     color:'#f00',
                     fontSize:'20px'
                 });
            }else{
                 $("body .chatVideo").find(".netLastTime").css({
                     color:'#fff',
                     fontSize:'20px'
                 });
            }
           
        }else{
            $("body .chatVideo").find(".netLastTime").css({
                color:'#fff',
                fontSize:'16px'
            });
        }
        this.lastTime = last_time;
        //每过30秒保存一次面试时间
        if(last_time%30 == 0){
            _this.saveTnterViewTime();
        }
        if(_this.netApplyId=="0"){
            if(last_time == 0){
                //挂断
                payTip_Dialog.show();
                clearInterval(chatVideo.intervalTime);
                this.overVideoScreen(0);
            }
          /* if(_this.roomTime>=3600){
               //挂断
               if(last_time<=0){
                   if(_this.surplusTime==0){
                       payTip_Dialog.show();
                   }
                   clearInterval(chatVideo.intervalTime);
                   this.overVideoScreen(0);
               }
           }else{
               if(last_time==0){
                   payTip_Dialog.show();
               }
               //小于40分钟
               if(_this.roomTime<=2400){
                   if(last_time<=-1200){
                       clearInterval(chatVideo.intervalTime);
                       this.overVideoScreen(0);
                   }
               }else{
                   //大于40小于60
                 var lineTime =   _this.roomTime-3600;
                 if(last_time<=lineTime){
                     clearInterval(chatVideo.intervalTime);
                     this.overVideoScreen(0);
                 }
               }
           }*/

        }else{
            if(last_time == 0){
                //挂断
                clearInterval(chatVideo.intervalTime);
                this.overVideoScreen(0);
            }
        }

    },
    //保存面试时间
    saveTnterViewTime:function(){
        var _this           = this;
        var last_time       = this.lastTime;
        var net_apply_id    = this.netApplyId; 
        var baseInfoUrl     = this.baseInfoUrl;
        var channel_id      = this.room;
        $.post(baseInfoUrl, {net_apply_id:net_apply_id,"type":"setTime",last_time:last_time,channel_id:channel_id}, function(re){
            console.log("saveTnterViewTime",_this.netApplyId,re);
            if(_this.netApplyId=="0" && re.status && re.data.is_end){
                payTip_Dialog.show();
                clearInterval(chatVideo.jumpIntervalTime);
               _this.overVideoScreen(0);
            }

        },'json');
    },
    //检查是否显示跳过
    checkShowJump:function(){
        var _this = this;
        chatVideo.showjumpTime = chatVideo.showjumpTime + 1;
        //
        if(chatVideo.showjumpTime < 30 && _this.netApplyId=="0"){
            $(".chatVideo").find(".beforeVideoInfo .vidoJump").show();
        }

        if(chatVideo.showjumpTime >= 30 && _this.netApplyId=="0"){
            clearInterval(chatVideo.jumpIntervalTime);
            _this.overVideoScreen(3);
            return;
        }

        if(chatVideo.showjumpTime >= 30){
            //显示挂断
            $(".chatVideo").find(".beforeVideoInfo .vidoJump").show();
            // if(chatVideo.hasNext){
            //     $(".chatVideo").find(".beforeVideoInfo .tiaoguo1").show();
            // }else{
            //     $(".chatVideo").find(".beforeVideoInfo .tiaoguo1").hide();
            // }
            if(_this.is_first && _this.netApplyId!="0"){
                $(".chatVideo").find(".beforeVideoInfo .tiaoguo1").show();
            }else{
                $(".chatVideo").find(".beforeVideoInfo .tiaoguo1").hide();
            }
           // $(".chatVideo").find(".beforeVideoInfo .tiaoguo1").show();
            if(_this.netApplyId!="0"){
                $(".chatVideo").find(".beforeVideoInfo .beforeWord").show();
            }
            $(".chatVideo").find(".beforeVideoInfo .daojishi1").hide();
            $(".chatVideo").find(".beforeVideoInfo .daojishi").hide();
        }
        var _tt_time = $(".chatVideo").find(".beforeVideoInfo .daojishi .priDownTime").html();
        _tt_time     = parseInt(_tt_time) - 1;
        if(_tt_time >=0){
            $(".chatVideo").find(".beforeVideoInfo .daojishi .priDownTime").html(_tt_time);
        }
        
        //如果超过100 则清除
        if(chatVideo.showjumpTime >= 100){
            clearInterval(chatVideo.jumpIntervalTime);
        }
        var net_apply_id    = this.netApplyId; 
        var baseInfoUrl     = this.baseInfoUrl;
        var _t = chatVideo.showjumpTime % 3; //每3秒请求一次
        if(_t == 0){
            $.post(baseInfoUrl, {net_apply_id:net_apply_id,"type":"checkChannelStatus"}, function(re){
                if(!re.status){ //如果求职者已拒绝
                    clearInterval(chatVideo.jumpIntervalTime);
                    _this.overVideoScreen(2);
                }
            },'json');
        }
    }
    
    
}


