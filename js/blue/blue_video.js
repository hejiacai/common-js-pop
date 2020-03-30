/*
 * 聊一聊视频模式
 */
var chatVideo = {
    //netApplyId          : 0, //校园招聘会投递编号
    canCreateResume     : true,
    isSupported         : true,
    supportedmsg        : "",
   // sid                 : 0, //活动场次ID
    videoAuthInfoUrl    : null, //视频信息授权地址
    createRoomUrl       : null, //创建房间url
    baseInfoUrl         : null, //基本信息url
    updateInfoUrl       : null, //更新信息url
    nextUrl             : null, //下一条信息url
    schoolNetFairUrl    : null, //求职者大厅url
    aliWebrtc           : null,//RTC对象
    room                : 0,//房间号
    userName            : "", //聊天对象
    person_id           : 0,
    job_id              : 0,//职位编号
    inviteId            : 0,//邀请id
    localVideo          : null,//本地视频对象
    resumeVideo         : null,//聊天人的视频对象
    lastTime            : 0,//剩余聊天时间
    statusType          : null,//面试结果
    intervalTime        : null,//定时器   视频开始，到视频结束,
    inviteTimeLong      : 0,//面试时长
    companyName         : null,//企业名称
    intervalTime2       : null,//定时器发送消息
    showjumpTime        : 0, //显示跳过时间
    interviewStatus     : 0, //0面试未开始 1面试中 2面试结束 -1已跳过
    show_apply_result   : false, //是否显示事情面试结果
    linkCountdownIntervalTime :30000, //连接时间倒计时
    linkInterval        : null,
    videoIntervalTime   :0,
    videoInterval       :null,  //企业时间倒计时
    isVideoEnd          :false,
    //初始化视频界面数据
    init:function(videoInfo){
       // this.netApplyId             = videoInfo.netApplyId;
        //this.sid                    = videoInfo.sid;
        this.videoAuthInfoUrl       = videoInfo.videoAuthInfoUrl;
        this.createRoomUrl          = videoInfo.createRoomUrl;
        this.baseInfoUrl            = videoInfo.baseInfoUrl;
        this.updateInfoUrl          = videoInfo.updateInfoUrl;
        this.nextUrl                = videoInfo.nextUrl;
        this.schoolNetFairUrl       = videoInfo.schoolNetFairUrl;
        this.companyName            = videoInfo.companyName;
        this.companyId              = videoInfo.companyId;
        this.canCreateResume        = true;
        this.job_id                 = videoInfo.jobId;
        this.inviteId               = videoInfo.inviteId;
        this.bindEvent();
    },

    //创建本地视频对象
    createLocalVideo:function(){
        //var _local_html = $('<video autoplay playsinline style="height:100%;width:100%"></video>');
       // $(".local-video").append(_local_html);
        this.localVideo = $(".local-video");
    },
    //移除本地视频对象
    deleteLocalVideo:function(){
        this.localVideo = null;
        $(".video-View").hide();
        //$(".local-video").html("");
    },

    //创建房间 并且展示接画面
    createRoom:function(person_id){
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

        var create_room_url = _this.createRoomUrl;
        $.post(create_room_url, {person_id:person_id,job_id:this.job_id,invite_id:this.inviteId}, function(re){
            if (re.status) {
                _this.room      = re.data.room_id;
                //_this.room      = 10000;
                _this.userName  = re.data.user_name;
                _this.person_id = re.data.person_id;
                _this.job_id    = re.data.job_id;
                _this.show_apply_result = re.data.show_apply_result;
                _this.createLocalVideo();
                //显示视频聊天
                //_this.showVideoScreen();
                _this.lastTime =  re.data.channel_time;
                _this.videoIntervalTime =  re.data.channel_time;
                //创建房间
                //预览自己的视频
                _this.newAliWebrtc();
                //发送消息 唤起app界面
                //_this.companyName +
                var message =  "邀请你视频面试";
                chatVideo.intervalTime2 = window.setInterval(function(){
                    if(myWebim.currentPersonInfo != ""){
                        myWebim.sendNormalMsg(message);
                       // console.log('发送视频面试邀请',message);
                        clearInterval( chatVideo.intervalTime2);
                    }
                },1000);
               //dao
                _this.linkInterval = setInterval(function(){
                    //$('.before-video-detail').hide();
                    //console.log('挂断');
                    myWebim.sendNormalMsg("无应答");
                    $(".before-video-detail").hide();//本地视频显示出来
                    $(".connection-video-detail").hide();//本地视频显示出来
                    $(".video-View").hide();//本地视频显示出来
                    var localVideo = $('.local-video video');
                    _this.aliWebrtc.stopPreview(localVideo[0]);
                    //离开房间 todo
                    _this.aliWebrtc.leaveChannel();
                    _this.aliWebrtc.dispose();
                    _this.isVideoEnd = true;
                    $.post(_this.updateInfoUrl, {channel_id:_this.room,"status":2,}, function(re){
                        console.log("结束状态成功");
                    },'json');
                    VideoConfirmBox.alert("求职者长时间未接听，请先致电对方打开app接收视频面试",function () {
                        window.close();
                        },{title:'提示',width:300});
                    clearInterval( _this.linkInterval);
                   /*var temp = window.setInterval(function(){
                       clearInterval(temp);
                        window.close();
                    },2000);*/

                },_this.linkCountdownIntervalTime);
                _this.canCreateResume  = false;

            } else {
                if(typeof(VideoaAnchorMsg) != "undefined"){
                    VideoaAnchorMsg(re.msg,{ icon: 'warning' });
                    return;
                }else{
                    alert(re.msg);return;
                }
            }
        },'json');
    },
    newAliWebrtc:function(){
        var _this = this;
        var userName = _this.companyName;
        if(_this.aliWebrtc == null){ //如果没有创建实例 则创建实例
            _this.aliWebrtc = new AliRtcEngine("");
        }
        _this.aliWebrtc.getDevices().then((re)=>{
            console.log(re)
        }).catch((error)=>{
            console.log(error)
        });
//        _this.aliWebrtc.videoProfile = {
//            frameRate:20,
//            width: 309,
//            height:600
//          };
        // remote用户加入房间
        _this.aliWebrtc.on('onJoin', (data) => {
            console.log(data.displayName  + " 加入频道");
        });
        // remote流发布事件
        _this.aliWebrtc.on('onPublisher', (publisher) => {
            console.log('onPublisher',publisher);
            _this.receivePublish(publisher);
           /* var video = _this.getDisplayRemoteVideo(publisher.userId, publisher.displayName);
             _this.aliWebrtc.setDisplayRemoteVideo(publisher.userId, video, 1);
             _this.onLiveVideoScreen();
            console.log('onPublisher',publisher,video);*/
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
            console.log("error",error);
            var msg = error && error.message ? error.message : error;
            if (msg && msg.indexOf('no session') > -1) {
                msg = "请重新登录：" + msg;
            }
            if (msg && msg.indexOf('screen share error') > -1) {
                msg = "屏幕共享已取消";
            }
            if (error.code == 15) {
                msg = "没有开启H5兼容";
            }
            if (error.type === "publish") {
                console.log("推流断开 需要停止推流");
                $(".push-stream").click();
            }
            if (error.type === "subscribe") {
                console.log("订阅断开 取消订阅该userId的所有订阅并移除所有该userId的dom")
                aliWebrtc.unSubscribe(error.userId).then(re => {
                    console.log("订阅断开 取消订阅成功");
                }).catch(err => console.log("订阅断开 取消订阅失败", err))
            }
            VideoaAnchorMsg("设备中断，请挂断了，刷新重新连接",{ icon: 'warning' });
        });

        // 订阅remote流成功后，显示remote流
        _this.aliWebrtc.on('onMediaStream', (subscriber, stream) => {
            // console.log("onMediaStream",subscriber);
            // var video = _this.getDisplayRemoteVideo(subscriber.userId, subscriber.displayName);
            // _this.aliWebrtc.setDisplayRemoteVideo(subscriber, video, stream);
            // _this.onLiveVideoScreen();
        });

        _this.aliWebrtc.on('OnConnecting', (data) => {
            console.log(data.displayName + "正在建立连接中...",data);
        });
        _this.aliWebrtc.on('OnConnected', (data) => {
            console.log(data.displayName + "成功建立连接",data);
        });
        _this.aliWebrtc.on('onLeave', (data) => {
            _this.removePublish(data.userId);
        });
        var localVideo = $('.local-video video');
        _this.aliWebrtc.startPreview(localVideo[0]).then((obj) => {
        }).catch((error) => {
            console.log(error.message);
        });
        _this.getRTCAuthInfo().then((authInfo) => {
            //3. 加入房间
            _this.aliWebrtc.joinChannel(authInfo, userName).then(() => {
                console.log('加入房间成功');
                // 4. 发布本地流
                _this.aliWebrtc.publish().then((res) => {
                    console.log('发布流成功');
                    //_this.aliWebrtc.configLocalCameraPublish= true;
                    //_this.aliWebrtc.configLocalAudioPublish= true;
                    //_this.aliWebrtc.configLocalScreenPublish=false;
                }, (error) => {
                    console.log('发布流失败',error);
                });
            }).catch((error) => {
                console.log('',error.message);
            })
        }).catch((error) => {
            console.log(error.message);
        });

    },
    //获取展示视频流
    getDisplayRemoteVideo:function(id,displayName){
        var _this = this;
        // var videoWrapper = $('<div class="local-video-get" id="' + _this.resume_id + '" style="height:100%;width:100%"><video autoplay playsinline style="width:306px;height:510px"></video></div>');
        // //将视频插入本地视频后
        // $('.local-video').after(videoWrapper);
        // _this.resumeVideo = videoWrapper;
        var localVideo = $('.local-video video');
        return  localVideo[1];
    },
    //对方$hr_person_id离开后删除视频
    removePublish:function(){
        //删除
        var _this = this;
        _this.isVideoEnd = true;
        clearInterval(chatVideo.intervalTime);
        clearInterval(_this.videoInterval);
        console.log('对方离开了');
        var localVideo = $('.local-video video');
        this.aliWebrtc.stopPreview(localVideo[0]);
        //离开房间 todo
        this.aliWebrtc.leaveChannel();
        this.aliWebrtc.dispose();
        _this.overVideoScreen(1,false);
        if(typeof(VideoaAnchorMsg) != "undefined"){
            VideoaAnchorMsg("对方已挂断",{ icon: 'info' });
            return;
        }else{
            alert("对方已挂断");return;
        }
    },
    receivePublish:function(publisher){
        var _this = this;

        console.log("subscribe1",publisher);
        _this.aliWebrtc.subscribe(publisher.userId).then((subscribeCallId) => {
            console.log('订阅成功',subscribeCallId,publisher);
            _this.aliWebrtc.configRemoteAudio(publisher.userId,true);
            _this.aliWebrtc.configRemoteCameraTrack(publisher.userId,true,true);
            var video = _this.getDisplayRemoteVideo(publisher.userId, publisher.displayName);
            _this.aliWebrtc.setDisplayRemoteVideo(publisher.userId, video, 1);
             _this.onLiveVideoScreen();
        }, (error) => {
            //alert(error.message);
            console.log("subscribe2",error)
        });
    },
    getRTCAuthInfo:function(){
        var channelId   = this.room;
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
    //关闭视频聊天
    offVideoScreen:function(){
        this.canCreateResume = true;
        this.deleteLocalVideo();
        this.localVideo = null;
        this.aliWebrtc  = null;
        this.room = 0;
        this.showjumpTime = 0;
        this.isVideoEnd  = true;
        $(".before-video-detail").hide();//本地视频显示出来
        $(".connection-video-detail").hide();//本地视频显示出来
        $(".video-View").hide();//本地视频显示出来
        clearInterval(chatVideo.linkInterval);
        clearInterval(chatVideo.intervalTime);
        var temp = window.setInterval(function(){
            clearInterval(temp);
            window.close();
        },2000);
    },
    hangupPerson:function(){
        this.isVideoEnd  = true;
        $(".before-video-detail").hide();//本地视频显示出来
        $(".connection-video-detail").hide();//本地视频显示出来
        $(".video-View").hide();//本地视频显示出来
        var localVideo = $('.local-video video');
        this.aliWebrtc.stopPreview(localVideo[0]);
        //离开房间 todo
        this.aliWebrtc.leaveChannel();
        this.aliWebrtc.dispose();
        this.canCreateResume = true;
        this.deleteLocalVideo();
        this.localVideo = null;
        this.aliWebrtc  = null;
        this.room = 0;
        this.showjumpTime = 0;
        clearInterval(chatVideo.linkInterval);
        clearInterval(chatVideo.intervalTime);

        if(typeof(VideoaAnchorMsg) != "undefined"){
            VideoaAnchorMsg("对方已挂断",{ icon: 'info' });
            var temp = window.setInterval(function(){
                clearInterval(temp);
                window.close();
            },2000);
            return;
        }else{
            alert("对方已挂断");return;
        }
    },
    //视频联通后事件并显示内容  并且设置该面试未面试中
    onLiveVideoScreen:function(){
        console.log('onLiveVideoScreen',"收到流");
        var _this = this;
        //关闭定时任务
        clearInterval(_this.linkInterval);
        //videoInterval
        $('#connectTimes').show();
        _this.videoInterval = window.setInterval(function(){
            _this.videoIntervalTime = _this.videoIntervalTime-1;
            if(0== _this.videoIntervalTime){
                clearInterval(_this.videoInterval);
            }
            let minutes =  parseInt(_this.videoIntervalTime/60) ;
            var minutesText = "";
            let seconds =  _this.videoIntervalTime%60 ;
            if(minutes<10){
                minutesText = "0"+minutes+':';
            }else{
                minutesText = minutes+':';
            }
            if(seconds<10){
                minutesText = minutesText+"0"+seconds;
            }else{
                minutesText = minutesText+seconds;
            }
            $('#connectTimes').text(minutesText);
        },1000);
        //设置video 宽高
        $(".before-video-detail").hide();//本地视频显示出来
        $(".connection-video-detail").show();//本地视频显示出来
        $(".video-View").show();//本地视频显示出来
       // $("body").find(".local-video-get video").css({"height":"542px","width":'306px'});
        _this.startInterval();//计算时间
    },

    //结束聊天后的事件并显示内容
    overVideoScreen:function(level_type,isSendMsg){
        var _this = this;
        if(_this.aliWebrtc == null){ //如果是主动关闭的 则不执行这个方法
            return;
        }

        $(".connection-video-detail").hide();
        $(".video-View").hide();
        $(".before-video-detail").hide();
        //离开房间 todo
        _this.aliWebrtc.leaveChannel();
        _this.aliWebrtc.dispose();
        $.post(_this.updateInfoUrl, {channel_id:_this.room,"status":2,}, function(re){
            console.log("结束状态成功");
        },'json');

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
        if(isSendMsg==true){
            myWebim.sendNormalMsg("已取消");
        }
        if(level_type == 0){
            //myWebim.sendNormalMsg(message);
        }
        _this.offVideoScreen();

    },
    //绑定聊天事件
    bindEvent:function(){
        //挂断
        var _this = this;
        $("body").on("click",".closeVideoBtn",function(){
            //结束聊天
            //挂断
            if(_this.isVideoEnd == true){
                return;
            }
            _this.isVideoEnd = true;
            console.log('挂断');
            clearInterval(chatVideo.intervalTime);
            clearInterval(_this.videoInterval);
            _this.overVideoScreen(0,true);
        });

    },
    startInterval:function(){
        var time = window.setInterval(function(){
            chatVideo.updateLastTime();
        },1000);
        chatVideo.intervalTime = time;
    },
    updateLastTime:function(){
        var _this     = this;
        var last_time = this.lastTime;
        last_time     = parseInt(last_time) - 1;
        console.log(last_time);
        chatVideo.inviteTimeLong = chatVideo.inviteTimeLong + 1;
        $("body .chatVideo").find(".netLastTime").html(last_time);
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
            _this.saveEnterViewTime();
        }
        if(last_time == 0){
            //挂断
            clearInterval(chatVideo.intervalTime);
            this.overVideoScreen(0,true);
        }
    },
    //保存面试时间
    saveEnterViewTime:function(){
        var _this           = this;
        var last_time       = _this.lastTime;
        $.post(_this.updateInfoUrl, {channel_id:_this.room,"status":3,last_time:last_time}, function(re){},'json');
    },
    levelRoom:function (isSendMsg) {
        var _this = this;

        if(_this.isVideoEnd == false){
            if(isSendMsg==true){
                myWebim.sendNormalMsg("已取消");
            }
        }
        //if(_this.aliWebrtc!=null){
            this.aliWebrtc.leaveChannel();
            this.aliWebrtc.dispose();
           // debugger;
        //}
        //离开房间 todo
        _this.isVideoEnd = true;
        clearInterval(_this.intervalTime);
        clearInterval(_this.videoInterval);
        $(".connection-video-detail").hide();
        $(".video-View").hide();
        $(".before-video-detail").hide();
        $.post(_this.updateInfoUrl, {channel_id:_this.room,"status":2,}, function(re){
            console.log("结束状态成功");
        },'json');

        var temp = window.setInterval(function(){
            clearInterval(temp);
            window.close();
        },2000);
    }
}


