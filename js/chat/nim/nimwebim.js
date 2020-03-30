//聊天开始
var myWebim = {
    nim: {},  //网易云信对象
    nimType: 'p2p', //网易云信点对点的会话前缀
    nimType1: 'p2p-', //网易云信点对点的会话前缀
    maxNameLen: 5,//昵称最长字符
    frendList: [],//聊天好友
    frendFre: "frendCard_",//前缀
    msgFre: "msgCard_",//消息卡片
    defaultImgUrl: "",//求职者默认头像
    getResumeUrl: "",
    showResumeUrl: "",//简历信息访问地址
    facePath: "",//表情地址
    sendMsgUrl: "", //保存发送记录地址
    sess_id: "",//当前正在聊天的session
    selectedSessionId: "",//当前正在聊天的session
    selectResumeId: "",//当前正在聊天的session
    initMsgList: 3, //初始化时获取历史消息条数
    reqMsgCount: 10,//获取历史消息条数
    sessCount: 30,
    newSession: [],//会话
    allFaceCodeObj: {},//表情
    allFaceNickObj: {},//表情
    loginInfo: {},//我的信息
    sessionMap: {}, //用户会话的判断是否在会话中
    resumeMap: {}, //简历信息
    lastMsgMap: [], //最新消息时间可以key
    unreadCountMap: {},//未读消息
    msgTimeMap: {},//消息时间
    showResumeType: 0,
    selSess: null,
    documentIsHidden: false,//浏览器默认没有隐藏
    chatinterval: null,
    onLineStatus: "on",
    onNimBlacklist:{},   //黑名单列表
    searchJobList:{},    //搜索的职位列表
    siteUrlStyle:"",
    //初始参数
    init: function (loginInfo, weibinfo, newSession) {
       // myWebim.nim = nim;
        myWebim.loginInfo = loginInfo;
        myWebim.defaultImgUrl = weibinfo.defaultImgUrl;//设置默认头像地址
        myWebim.getResumeUrl = weibinfo.getResumeUrl;//设置获取简历信息url
        myWebim.facePath = weibinfo.facePath;//获取qq图标地址
        myWebim.showResumeUrl = weibinfo.showResumeUrl;//设置获取简历信息url
        myWebim.sendMsgUrl = weibinfo.sendMsgUrl;
        myWebim.selectResumeId = weibinfo.selectResumeId;
        myWebim.showResumeType = weibinfo.showResumeType;
        myWebim.siteUrlStyle = weibinfo.siteUrlStyle;
        if (newSession.length > 0) {
            myWebim.newSession = newSession;
        }
        // myWebim.initRecentContactList();
        myWebim.bindEvent();
        //初始化未读消息数
        myWebim.setCookie("chatLoginStatus", "true");
    },
    initNim:function(nim){
        myWebim.nim = nim;
    },
    //会话切换 设置当前会话  为了收到消息之后不会更新未读数
    setNowSession: function (sessionId) {
        myWebim.nim.setCurrSession(sessionId);
    },
    //会话数据整合 为了显示求职者的信息
    sessionMergeDataNew:function (objSessions) {
        var tempArray = new Array();
        for (var i=0; i<objSessions.length;i++){
            if( myWebim.nimType!=objSessions[i].scene){
                 continue;
            }
            if(!objSessions[i].hasOwnProperty('Account_id')){
                var tempContent = objSessions[i].lastMsg.custom;
                objSessions[i].is_show_video = '0';
                objSessions[i].net_apply_id  = '0';
                if(tempContent&&tempContent!=''){
                    var tempContentJson = JSON.parse(tempContent);
                    if(tempContentJson.hasOwnProperty('cardInfo')){
                        objSessions[i].ResumeId = tempContentJson.cardInfo.resume_id;
                        objSessions[i].SessionJobId = tempContentJson.cardInfo.job_id;
                    }else{
                        objSessions[i].ResumeId = '';
                        objSessions[i].SessionJobId = '';
                    }
                    objSessions[i].SessionImage = '';
                    objSessions[i].SessionNick = '姓名';
                    objSessions[i].SessionJobStation = '暂无职位';
                    objSessions[i].MsgTimeStamp = objSessions[i].lastMsg.time;
                    if('in'==objSessions[i].lastMsg.flow){
                        objSessions[i].Account_id = objSessions[i].lastMsg.from;
                        objSessions[i].SessionId = objSessions[i].lastMsg.from;
                        if(tempContentJson.hasOwnProperty('userInfoFirst')){
                            objSessions[i].SessionImage = tempContentJson.userInfoFirst.url;
                            objSessions[i].SessionNick =  tempContentJson.userInfoFirst.name;
                        }
                        // "userInfoFirst": userInfoFirst, "userInfoSecond":
                    }else{
                        objSessions[i].Account_id = objSessions[i].lastMsg.to;
                        objSessions[i].SessionId = objSessions[i].lastMsg.to;
                        if(tempContentJson.hasOwnProperty('userInfoSecond')){
                            objSessions[i].SessionImage = tempContentJson.userInfoSecond.url;
                            objSessions[i].SessionNick =  tempContentJson.userInfoSecond.name;
                        }
                    }
                }else{
                    objSessions[i].ResumeId = '';
                    objSessions[i].SessionJobId = '';
                    objSessions[i].SessionImage = '';
                    objSessions[i].SessionNick = '姓名';
                    objSessions[i].SessionJobStation = '暂无职位';
                    objSessions[i].MsgTimeStamp = objSessions[i].lastMsg.time;
                    if('in'==objSessions[i].lastMsg.flow){
                        objSessions[i].Account_id = objSessions[i].lastMsg.from;
                        objSessions[i].SessionId = objSessions[i].lastMsg.from;
                    }else{
                        objSessions[i].Account_id = objSessions[i].lastMsg.to;
                        objSessions[i].SessionId = objSessions[i].lastMsg.to;
                    }
                }


            }
            tempArray.push(objSessions[i]);
        }
        return tempArray;
    },
    //初始化的会话列表
    initSessionsUI: function() {
            //左边导航栏，显示左边导航
            if (myWebim.newSession.length > 0) {
                var tempSession = myWebim.newSession;
                myWebim.frendList = tempSession;
                var tempSessMap = {};
                var initSessionId = '';
                var initKey = 0;
                for (var n in tempSession) {
                    tempSessMap[myWebim.nimType1+tempSession[n].SessionId] = true;
                    if (n == 0 && myWebim.sess_id == "") {
                        initSessionId = tempSession[n].SessionId;
                    }
                    if(tempSession[n].SessionId==myWebim.selectedSessionId){
                        initSessionId = myWebim.selectedSessionId;
                        initKey = n;
                    }
                    myWebim.addMyFrend(tempSession[n], false); //添加朋友
                    var is_show = true;
                    var _hasAdd = myWebim.addChatMsgPart(tempSession[n], is_show,true); //生成消息块
                }
                myWebim.sessionMap = tempSessMap;
               //  myWebim.changeSession(initSessionId);
               //  myWebim.sess_id = initSessionId;//当前聊天对象为 第一个
               //  myWebim.setNowSession(myWebim.nimType1 + initSessionId);
               //  if(initKey!=0){
               //      myWebim.preSessionPart(initSessionId);
               //  }
               //
               //  myWebim.sessionMap = tempSessMap;
               //  //初始化 当前聊天对象
               //  $("#myFrendList").find("." + myWebim.frendFre + myWebim.sess_id).find(".notReadMsgCount").hide();
               //  $("#myFrendList").find("." + myWebim.frendFre + myWebim.sess_id).addClass("cut");
               //  $(".chatRightList").find("." + myWebim.msgFre + myWebim.sess_id).removeClass("hiddenPart");
               //  //查询当前对话的求职者14天内是否有过聊天记录
               //  var selToID = myWebim.sess_id;
               //  //var sess_data = myWebim.getNowNewSession(selToID);
               // // var resume_id = sess_data.ResumeId;
               //  var url = "/chat/checkChatHistoryV2";
               //  $.post(url, {session_id: selToID}, function (re) {
               //      if (!re.status) {
               //          $('.j_have_chat_notice').html(re.msg);
               //          $('.chat-right').addClass('tipShow')
               //      } else {
               //          $('.j_have_chat_notice').html('');
               //          $('.chat-right').removeClass('tipShow')
               //      }
               //  }, 'json');
                myWebim.refreshMsgTopTips(tempSession,1,1);

            } else {
                $(".chat-main").hide();
                $(".notChart").show();
            }
        },
    initNewSession: function (_newSession) { //初始化新的会话
        var newSession = {
            id: myWebim.nimType1+_newSession["SessionId"], //会话id
            SessionId: _newSession["SessionId"], //会话id
            SessionNick: _newSession["SessionNick"], //会话昵称
            SessionImage: _newSession["SessionImage"], //会话头像
            unread: 0, //未读消息数
            MsgTimeStamp: _newSession["MsgTimeStamp"], //消息时间戳  webim.Tool.formatTimeStamp(item.MsgTimeStamp)
            MsgShow: "", //消息内容
            LastMsgContent: "", //最后一条消息内容
            SessionJobId: _newSession["SessionJobId"], //消息中带的职位编号
            SessionJobStation: _newSession["SessionJobStation"],//消息职位名称
            ResumeId: _newSession["ResumeId"],//简历编号
            ApplyId: "", //投递编号
            Account_id: _newSession["SessionId"], //账号
            IsNewSession: true
        };
        return newSession;
    },
    getNowNewSession:function(sessionId){
         for (var i = 0;i<myWebim.newSession.length;i++){
             if(myWebim.newSession[i].SessionId==sessionId){
                 return myWebim.newSession[i];
             }
         }
         return  false;
    },
    //添加会话，左侧会话列表
    addMyFrend: function (data, is_new) {
        if (data.SessionId == '') {
            return false;
        }
        var _sessionId = data.SessionId;
        var frendClass = myWebim.frendFre + _sessionId;
        var frend_li_data = '';
        if ($('.' + myWebim.frendFre + _sessionId).length == 0) {
            frend_li_data = $('<li>'
                + '<a href="javascript:void(0);" class="frendPart ' + frendClass + '" data-chatstatus="">'
                + '<img class="head-img" src="" />'
                + '<p>'
                + '<span class="chat-list-tit01">'
                // + '<span class="frendUserName">姓名</span><span><em></em></span><span class="frendStation">暂无职位</span><i class="chat-list-icon01 jobstatus"></i></span>'
                + '<span class="frendUserName">姓名</span><span></span><span class="frendStation"></span><i class="chat-list-icon01 jobstatus"></i></span>'
                + '<span class="chat-list-tit02 msgPro">'
                + '<em class="readStatus"></em><span class="msgContent"><span>'
                + '</span>'
                + '</p>'
                + '<span class="chat-list-time msgTime">时间</span>'
                + '<span class="chat-list-msg notReadMsgCount msgPro" style="display:none">0</span>'
                + '<span class="j_close_chat close-chat" style="display: none;">×</span>'
                + '</a>'
                + '</li>');
            var _sessionImage = data.SessionImage == '' ? myWebim.defaultImgUrl : data.SessionImage;
            var _sessionJobStation = data.SessionJobStation;//职位名称
            var _sessionJobId = data.SessionJobId;//职位编号
            var _sessionNick = data.SessionNick;//昵称
            if( myWebim.sess_id==_sessionId){
                var _unreadMsgCount = 0;//未读数量
            }else{
                var _unreadMsgCount = data.unread;//未读数量
            }
            //var _LastMsgContent = data.LastMsgContent;//最后一条消息记录
            var allFaces = myWebim.getFaceNickObj();//表情
            var _LastMsgContent = '';
            if (data.hasOwnProperty('lastMsg')) {
                if("text"==data.lastMsg.type){
                    $sendMsgEmoji = myWebim.sendMsgEmoji(data.lastMsg.text, allFaces);//最后一条消息记录
                    _LastMsgContent = $sendMsgEmoji[1];
                }
                if("image"==data.lastMsg.type){
                    _LastMsgContent = "[图片]";//最后一条消息记录
                }
                if("audio"==data.lastMsg.type){
                    _LastMsgContent = "[语音]";//最后一条消息记录
                }
                if(data.hasOwnProperty('msgReceiptTime')){
                     if("in"==data.lastMsg.flow){
                        // frend_li_data.find(".readStatus").html('<span style="color: green">[已读]</span>');
                     }else{
                         if(data.lastMsg.time>data.msgReceiptTime){
                             frend_li_data.find(".readStatus").addClass("unread").html("【未读】");
                         }else{
                             frend_li_data.find(".readStatus").html("【已读】");
                         }
                     }
                }else{
                    if("in"==data.lastMsg.flow){
                       // frend_li_data.find(".readStatus").html('<span style="color: green">[已读]</span>');
                    }else{
                        frend_li_data.find(".readStatus").addClass("unread").html("【未读】");
                    }
                }
            }
            //if(data.hasOwnProperty('lastMsg')){}
            var _msgTimeStamp = data.MsgTimeStamp / 1000;//时间戳
            var _frendTime = myWebim.timeToDate(_msgTimeStamp);//友好的时间戳
            var _resumeId = data.ResumeId;//简历编号
            //frend_li_data.find("a").addClass("frendPart");
            frend_li_data.find("a").attr("data-sessionId", _sessionId);
            frend_li_data.find("a").attr("data-jobid", _sessionJobId);
            frend_li_data.find("a").attr("data-resumeId", _resumeId);
            frend_li_data.find("img").attr("src", _sessionImage);
            var _showTitile = _sessionNick;
            frend_li_data.find(".frendUserName").html(_showTitile);
            frend_li_data.find(".msgContent").html(_LastMsgContent); //内容
            if (_unreadMsgCount > 0) {
                var _showCount = _unreadMsgCount > 99 ? "99+" : _unreadMsgCount;
                frend_li_data.find(".notReadMsgCount").html(_showCount).show();
            }
            if (_LastMsgContent == "") {
                frend_li_data.find(".msgPro").css({'display': 'none'});
            }
            //修改时间
            frend_li_data.find(".msgTime").html(_frendTime); //时间
            frend_li_data.find(".jobstatus").hide(); //时间
            if (is_new) {
                $("#myFrendList").prepend(frend_li_data);
            } else {
                $("#myFrendList").append(frend_li_data);
            }
        }
    },
    //添加消息模块
    //生成聊天界面
    //历史消息
    addChatMsgPart: function (data, is_show ,initHistoryMsg) {
        if (data.SessionId == '') {
            return false;
        }
        var _sessionId = data.SessionId;
        var partClass = myWebim.msgFre + _sessionId;
        var showResumeType = myWebim.showResumeType;
        var _url1 = "/resume/resumeshow?resumeid=" + data.ResumeId;
        var resume_html = '<a href="' + _url1 + '" target="_blank" class="charResume norMalResume">查看简历</a>';
        var _url2 = 'javascript:myWebim.showIframeResume(' + data.ResumeId + ',this);';
        var _other_resume_html = '<a href="' + _url2 + '" class="charResume iframeShowResume" style="display:none">查看简历</a>';
        if (showResumeType == "1") {
            _other_resume_html = '<a href="' + _url2 + '" class="charResume iframeShowResume">查看简历</a>';
            resume_html = '<a href="' + _url1 + '" target="_blank" class="charResume norMalResume" style="display:none">查看简历</a>';
        }
        var msg_list = $('<div class="chatDivPart ' + partClass + ' hiddenPart"  data-resume-id="'+data.ResumeId+'" >'
            + '<div class="charRtop">'+
			'<div class="chat-right-tab-bar">'+
				'<div class="tabBarIcon tab_chat"><span class="tabBarActive">聊天</span></div>'+
				'<div class="tabBarIcon tab_resume_detail"><span>简历详情</span></div>'+
				'<div class="rightOperatingIcon"  data-resume-id="'+data.ResumeId+'" >'+
						'<i class="icon-enterprise_chat_blacklist chatAddToBlacklist"></i>'+
						'<i class="icon-enterprise_chat_report chat_resume_report"></i>'+
						'<i class="icon-enterprise_chat_collection chatResumeFav"></i>'+
						'<i class="icon-enterprise_chat_share chatForwarding"></i>'+
				'</div>'+
			'</div>'+
			'<div class="chat-card-header">'+
				'<div class="user_info">'+
					'<div class="userheaderImg">'+
						'<img class="userImg" width="56" height="56" src="'+ myWebim.siteUrlStyle+'//img/user_img.png" >'+
						'<img class="userSexImg" src="" >'+
					'</div>'+
					'<div class="user_detail">'+
						'<p class="myself_Info"><a href="/resume/resumeshow/type-network-resumeid-'+data.ResumeId+'" class="user_name chatUserName" target="_blank"></a><span class="chatAge">0岁</span>' +
                         '<i class="linePd">|</i><span class="chatWorkYear">工作经验未知</span><i class="linePd">|</i><span class="chatDegree">学历未知</span>' +
                         '<i class="linePd">|</i><span class="chatSalary">保密</span></p>'+
						'<div class="workExperience">'+
							'<div class="user_info_jobWant user_info_jobtype">'+
								'<em class="color-999">意向 : </em><span class="chatJobsort">未填写</span>'+
							'</div>'+
							'<div class="workExpCompany color-999  chatWorkInfo"><em class="chatWorkInfoDate"> </em>'+
								'<em class="chatWorkInfoCompany"></em>'+
								'<em class="chatWorkInfoYears"></em>'+
								'<em class="chatWorkInfoStation"></em>'+
							'</div>'+
						'</div>'+
						'<div class="jobSign chatRemark">'+
							'<div class="jobSignUl chatNotesList">'+
								'</div><div class="showNotesAll">...</div>'+
								'<div class="addNotes chatAddNotes addNotesBtn"><i class="icon-152"></i>添加备注</div>'+
							'</div>'+
						'<div class="showSpanAllCon"></div>'+
						'</div>'+
						'<div class="chatJOb"><span class="chatJobname">沟通职位:</span> <span class="gotoJobDetail chatStation"></span><i class="icon-enterprise_chat_switch"></i></div>'+
						'<div class="showchatJObAllCon">是的撒as飞洒发发生法萨芬撒</div>'+
					'</div>'+
				'</div>'+
			'</div>'
            // + '<!--<img src="" class="char-img-top" />'
            // + '<div class="charRtix">'
            // + '<span class="charTix01"><b class="chatUserName"></b>'
            // + '<span class="chatSex">男</span><i></i><span class="chatAge">0岁</span><i></i><span class="chatWorkYear">工作经验未知</span><i></i><span class="chatDegree">学历未知</span></span>'
            // + '<span class="charTix02 chatJobPart"><i></i>正在沟通的职位：<span class="chatStation"></span></span>'
            // + '</div>'
            // + '<div class="charRbtn">'
            // + '<a href="javascript:;" class="charSend applyStatus" style="display:none">已投递</a>'
            // + resume_html
            // + _other_resume_html
           // + '</div>'
           // + '</div>'
            + '<div class="charDialog">'
            + '<a href="javascript:void(0)" class="noMoreMsg">没有更多消息了</a>'
            + '<a href="javascript:void(0)" class="moreMsg getMoreMsg"><i></i>查看更多消息</a>'
            + '<div class="dropload-load">'
            + '<span class="loading"></span>加载中...'
            + '</div>'
            + '<div class="charDgScrollHeight">'
            + '</div>'
            + '</div>'
            + '</div>');

        var _sessionImage = data.SessionImage == '' ? myWebim.defaultImgUrl : data.SessionImage; //头像
        var _sessionJobStation = data.SessionJobStation;//职位名称
        var _sessionJobId = data.SessionJobId;//职位编号
        var _sessionNick = data.SessionNick;//昵称
        //添加类
        //msg_list.find(".chatDivPart").addClass();
        msg_list.find(".char-img-top").attr("src", _sessionImage);//图片
        msg_list.find(".chatUserName").html(_sessionNick);//姓名
        msg_list.find(".chatStation").html(_sessionJobStation);//姓名
        if (!is_show) {
            msg_list.find(".getMoreMsg").hide();//姓名
        }
        if (_sessionJobStation == '') {
            msg_list.find(".chatJobPart").hide();
        }
		
        //绑定滚动条事件
        msg_list.find(".charDialog").scroll(function () {
            myWebim.scrollEvent(_sessionId);
        });
        if(initHistoryMsg){
            myWebim.initHistoryMsg(_sessionId);
        }
        $(".chatRightList").append(msg_list);
        return true;
    },
    //初始化历史消息
    initHistoryMsg: function (_sessionId) {

        myWebim.lastMsgMap[_sessionId] = {
            beginTime: 0,
            complete: 0,
        };
        nim.getHistoryMsgs({
            scene: myWebim.nimType,
            to: _sessionId,
            beginTime: 0,
            limit: myWebim.initMsgList,
            done: getHistoryMsgsDone
        });
        function getHistoryMsgsDone(error, obj) {
            //console.log('getHistoryMsgsDone',error,obj);
            if (!error) {
                if (obj.msgs.length > 0) {
                    for (var i = 0; i < obj.msgs.length; i++) {
                        myWebim.lastMsgMap[_sessionId].beginTime = obj.msgs[i].time;
                        myWebim._getTextMsgHtml(_sessionId, obj.msgs[i], false);
                    }
                    //滑动到底部
                   // myWebim.getMoreMsgCallBack(_sessionId);
                    myWebim.refressScroll(_sessionId);
                } else {
                    myWebim.lastMsgMap[_sessionId].complete = 1;
                }
            }
        }
    },
    //获取历史消息
    getLastC2CHistoryMsgs: function (_sessionId) {
        var beginTime = 0;//拉去消息时间
        var complete = 0;//表示还有
        var part = myWebim.getSessionPart(_sessionId);
        var docmentPart = part.find(".charDgScrollHeight");//滚动框
        var scrollHeight = docmentPart.height();//当前高度
        var lastMsgMap = myWebim.lastMsgMap;
        if (lastMsgMap[_sessionId]) {
            beginTime = lastMsgMap[_sessionId].beginTime;
            complete = lastMsgMap[_sessionId].complete;
            lastMsgMap[_sessionId].scrollHeight = scrollHeight;
            if (1 == complete) {
                var msgPart = myWebim.getSessionPart(_sessionId);
                msgPart.find(".noMoreMsg").css('display', 'block');
                msgPart.find(".getMoreMsg").next(".dropload-load").hide();
                return;
            }
        } else {
            myWebim.lastMsgMap[_sessionId] = {
                beginTime: 0,
                complete: 0,
                scrollHeight:scrollHeight,
            };
        }
        //console.log('getHistoryMsgsDone',_sessionId,beginTime);
        /*nim.getHistoryMsgs({
            scene: myWebim.nimType,
            to: _sessionId,
            endTime: beginTime,
            limit: myWebim.reqMsgCount,
            done: getHistoryMsgsDone
        });*/
       // console.log('aaaaa',beginTime);
        nim.getHistoryMsgs({
            scene: myWebim.nimType,
            to: _sessionId,
            endTime: beginTime,
            limit: myWebim.reqMsgCount,
            done: getHistoryMsgsDone
        });

        function getHistoryMsgsDone(error, obj) {
           // console.log('getHistoryMsgsDone',error,obj);
            if (!error) {
                var msgPart = myWebim.getSessionPart(_sessionId); //获取消息块
                if (obj.msgs.length < myWebim.reqMsgCount) {
                    myWebim.lastMsgMap[_sessionId].complete = 1;
                    for (var i = 0; i < obj.msgs.length; i++) {
                        myWebim.lastMsgMap[_sessionId].beginTime = obj.msgs[i].time;
                        myWebim._getTextMsgHtml(_sessionId, obj.msgs[i], false);
                    }
                    //隐藏查看更多
                    msgPart.find(".getMoreMsg").hide();
                    msgPart.find(".noMoreMsg").show();
                    msgPart.find(".noMoreMsg").css('display', 'block');
                    msgPart.find(".getMoreMsg").next(".dropload-load").hide();
                } else {
                    for (var i = 0; i < obj.msgs.length; i++) {
                        myWebim.lastMsgMap[_sessionId].beginTime = obj.msgs[i].time;
                        myWebim._getTextMsgHtml(_sessionId, obj.msgs[i], false);
                    }
                    msgPart.find(".getMoreMsg").show();
                    msgPart.find(".getMoreMsg").next(".dropload-load").hide();
                }
               myWebim.getMoreMsgCallBack(_sessionId);
            }
        }
    },
    _msgReSort: function (obj1, obj2) { //消息重排序
        var val1 = obj1.time;
        var val2 = obj2.time;
        if (val1 < val2) {
            return 1;
        } else if (val1 > val2) {
            return -1;
        } else {
            return 0;
        }
    },
    //_sessionId 为消息对象  拼接消息
    _getTextMsgHtml: function (_sessionId, msgDataInfo, is_new) {
        var sessionMap = myWebim.sessionMap;
        var sessType = myWebim.nimType; //设置会话类型
        if (!sessionMap[sessType + "_" + _sessionId]) {
            //如果是新来源的消息 其他方法处理 todo

        }
        var msgTime = msgDataInfo.time / 1000;
        var msgPart = myWebim.getSessionPart(_sessionId); //获取消息块
        var frendData = myWebim.getSessDataBySessId(_sessionId);//获取信息
        if(''==frendData.SessionImage){
            var  friendDataSessionImage = myWebim.defaultImgUrl;
        }else{
            var  friendDataSessionImage = frendData.SessionImage;
        }
        var allFaces = myWebim.getFaceNickObj();//表情
        var LoginSessionId = myWebim.getLoginSessId();//登录人sess_id
        var LoginImg = myWebim.getLoginSessImg(); //登录人头像
        var _msgTime = myWebim.timeToDateV3(msgTime); //消息时间
        var frendPart = myWebim.getFrendPart(_sessionId);

        //var msgItems            = msgDataInfo.elems;//长度为2的数组 msgItems[0] 中是消息内容 msgItems[1]是卡片内容  暂时不更新卡片 卡片只在初始化的时候更新
        // var MsgData             = msgItems[0];
        var dialogClass = msgDataInfo.flow == 'out' ? "dialogMsgMe" : "dialogMsgOther"; //判断是自己的消息 还是别人的消息
        var dialogImgClass = msgDataInfo.flow == 'out' ? "dialog_img" : "dialogo_img"; //判断是自己的消息 还是别人的消息
        var dialogImg = msgDataInfo.flow == 'out' ? LoginImg : friendDataSessionImage;
        var showReadStatus = msgDataInfo.flow == 'out' ? true : false;

        //判断是否显示时间
        var _show_time = true;
        if (is_new) {
            //如果是新消息 
            var dialogMsgTimeObj = msgPart.find(".dialogTime:last");
            var dialogMsgTime = dialogMsgTimeObj.attr("data-time");
            if (typeof dialogMsgTime != "undefined") {
                var _time_diff = msgTime - dialogMsgTime;
                if (_time_diff < 120) {
                    _show_time = false //隐藏上一条消息时间
                }
            }
        } else {
            //获取第一条消息
            var dialogMsgTimeObj = msgPart.find(".dialogTime:first-child");
            var dialogMsgTime = dialogMsgTimeObj.attr("data-time");
            if (typeof dialogMsgTime != "undefined") {
                var _time_diff = dialogMsgTime - msgTime;
                if (_time_diff < 120) {
                    dialogMsgTimeObj.hide(); //隐藏上一条消息时间
                }
            }
        }

        var msgHtml = "";
        var frendContent = "";
        var _timeStyle = "";
        if (!_show_time) {
            _timeStyle = "display:none"
        }
        var tempContentJson = JSON.parse(msgDataInfo.custom);
        switch (msgDataInfo.type) {
            case "text"://文本消息
                var msgContent = msgDataInfo.text;
                var tempMsgContent = myWebim.sendMsgEmoji(msgContent, allFaces);
                msgContent = tempMsgContent[0];
                frendContent = tempMsgContent[1];
                //解析文本消息中的表情

                //添加消息
                var dialogTextClass = msgDataInfo.flow == 'out' ? "dialogMtit" : "dialogOtit";
                var _html = '<span class="dialogTime" style="' + _timeStyle + '" data-time="' + msgTime + '">' + _msgTime + '</span>'
                    + '<div class=" ' + dialogClass + '">'
                    + '<img src="' + dialogImg + '" class="' + dialogImgClass + '" />'
                    + '<div class="' + dialogTextClass + '">' + msgContent + '</div>';
                if (msgDataInfo.flow == 'out') {
                    if (myWebim.nim.isMsgRemoteRead(msgDataInfo)) {
                        _html += '<span class="dialogRead readStatus ">已读</span>';//只有自己的消息才需要判断已读未读
                    }else{
                        _html += '<span class="dialogUnread readStatus ">未读</span>';
                    }
                }
                if(tempContentJson.hasOwnProperty("chatType") && tempContentJson.chatType=="1" && msgDataInfo.flow == 'out'){
                    _html += '<span class="set_hello_item">打招呼设置</span>';
                }
                _html += '</div>';
                msgHtml += _html;
                break;
            case 'image': //图片消息
                //图片消息分 大中 小图片
                //图片数组
                frendContent = "[图片]";
                var imgClass = msgDataInfo.flow == 'out' ? "dialogMimg" : "dialogoImg";
                //var imgArray        = msgDataInfo.file.ImageInfoArray;
                /*var bigImgData      = imgArray[0];
                var midImgData      = imgArray[1];
                var smallImgData    = imgArray[2];*/
                var imgDataUrl = msgDataInfo.file.url;
                //此处展示中图
                var _html = '<span class="dialogTime">' + _msgTime + '</span>'
                    + '<div class=" ' + dialogClass + '">'
                    + '<img src="' + dialogImg + '" class="' + dialogImgClass + '" />'
                    + '<div class="' + imgClass + '">'
                    + '<img class="_showImage" data-big-src="' + imgDataUrl + '" src="' + imgDataUrl + '" />'
                    + '</div>';
                if (msgDataInfo.flow == 'out') {
                    if (myWebim.nim.isMsgRemoteRead(msgDataInfo)) {
                        _html += '<span class="dialogRead readStatus ">已读</span>'//只有自己的消息才需要判断已读未读
                    }else{
                        _html += '<span class="dialogUnread readStatus ">未读</span>'
                    }
                }
                _html += '</div>';
                msgHtml += _html;
                break;
            case 'audio': //语言消息
                frendContent = "[语音]";
                //语音地址
                var sound_url = msgDataInfo.file.url;
                //语音时长
                var sound_time = parseInt(msgDataInfo.file.dur/1000);
                var dialogSoudClass = msgDataInfo.flow == 'out' ? "dialogmVoice" : "dialogoVoice";
                var leftClass = msgDataInfo.flow == 'out' ? "" : "hiddenVoiceTime";
                var rightClass = msgDataInfo.flow == 'out' ? "hiddenVoiceTime" : "";
                var _html = '<span class="dialogTime">' + _msgTime + '</span>'
                    + '<div class=" ' + dialogClass + '">'
                    + '<img src="' + dialogImg + '" class="' + dialogImgClass + '" />'
                    + '<div class="' + dialogSoudClass + '">'
                    + '<font class="' + leftClass + '">' + sound_time + '”</font>'
                    + '<span class="voiceSound notPlay" ><audio  src="' + sound_url + '" onended="myWebim.audioEnd(this)" preload="none"></audio></span>' //播放状态就是onPlay
                    + '<font class="' + rightClass + '">' + sound_time + '”</font>'
                    + '</div>';
                if (msgDataInfo.flow == 'out') {
                    if (myWebim.nim.isMsgRemoteRead(msgDataInfo)) {
                        _html += '<span class="dialogRead readStatus ">已读</span>'//只有自己的消息才需要判断已读未读
                    }else{
                        _html += '<span class="dialogUnread readStatus ">未读</span>'
                    }
                }
                _html += '</div>';
                msgHtml += _html;
                //语音 second
                break;
            default:
                break;
        }
        if (is_new) {
            msgPart.find(".charDgScrollHeight").append(msgHtml);//添加新消息
            //更新最新消息和最新时间
            frendPart.find(".msgContent").html(frendContent);
            frendPart.find(".chat-list-tit02").css({'display': 'block'});
            var _frendTime = myWebim.timeToDate(msgTime);
            frendPart.find(".msgTime").html(_frendTime);
        } else {
            msgPart.find(".charDgScrollHeight").prepend(msgHtml);//添加历史消息
        }
    },
    //聊天头部信息 并且更新信息
    refreshMsgTopTips: function (session_list,isAddJobList,isInit) {
        //var session_list = this.frendList;
        var frend_count = session_list.length;
        if (frend_count <= 0) {
            return;
        }
        var account_ids = [];
        var job_ids = [];
        for (var i = 0; i < frend_count; i++) {
            account_ids.push(session_list[i].Account_id);
            job_ids.push(session_list[i].SessionJobId);
        }
        if (job_ids.length > 0 || account_ids.length > 0) {
            var postUrl = myWebim.getResumeUrl;
           // console.log(postUrl);
            $.ajax({
                url: postUrl,
                type: "post",
                dataType: "json",
                data: {job_ids: job_ids, account_ids: account_ids,resume_id:myWebim.selectResumeId,select_person_id:myWebim.selectedSessionId},
                success: function (json) {
                    if (json.status) {
                        var resume_list = json.resume_list;
                        var job_list = json.job_list;
                        var job_list_sort = json.job_list_sort;
                        var job_data;
                        var person_data;
                        var session_info;
                        var session_id;
                        var freandPart;
                        var sessionPart;
                        var isChangeSession = false;
                        //搜索职位列表
                        if(1==isAddJobList){
                            for (var obj in job_list_sort){
                                if(myWebim.searchJobList[obj]==undefined || !myWebim.searchJobList[job_list_sort[obj]['job_id']]){
                                    myWebim.searchJobList[job_list_sort[obj]['job_id']] = true;
                                    if(0==job_list_sort[obj]['job_status']){
                                        var html='<li data-job-id="'+job_list_sort[obj]['job_id']+'">'+job_list_sort[obj]['station'];
                                        if(0==job_list_sort[obj]['job_status']){
                                            html +='<span class="">(停招)</span>';
                                        }
                                        html +='</li>';
                                        $('.search_job_sort').children().last().after(html);
                                    }else{
                                        var html='<li data-job-id="'+job_list_sort[obj]['job_id']+'">'+job_list_sort[obj]['station'];
                                        html +='</li>';
                                        $('.search_job_sort').children().first().after(html);
                                    }
                                }
                            }
                           // console.log('searchJobList',111);
                        }
                        for (var i = 0; i < frend_count; i++) {
                            session_id = session_list[i]["SessionId"];
                            freandPart = myWebim.getFrendPart(session_id); //朋友列表部分
                            sessionPart = myWebim.getSessionPart(session_id); //聊天部分
                            job_data = job_list[session_list[i]["SessionJobId"]];
                            person_data = resume_list[session_list[i]["Account_id"]];
                            session_list[i]["is_show_video"] = session_list[i]["is_show_video"] == 1 ? session_list[i]["is_show_video"] : person_data["is_show_video"];
                            session_list[i]["net_apply_id"] = session_list[i]["net_apply_id"] != 0 ? session_list[i]["net_apply_id"] : person_data["net_apply_id"];
                            if (typeof (job_data) != "undefined") {
                                session_list[i]["SessionJobStation"] = job_data["station"];
                                //更新职位
                               // freandPart.find(".frendStation").html(job_data["station"]);
                                if (job_data["job_status"] == 0) {
                                    freandPart.find(".jobstatus").show();
                                    //$('#myHistoryList').find('.frendCard_'+session_id).find(".jobstatus").show();
                                }
                                sessionPart.find(".chatStation").html(job_data["station"]);
                            }

                            if (typeof (person_data) != "undefined") {
                                if (person_data["resume_id"] ) {
                                    session_list[i]["ResumeId"] = String(person_data["resume_id"]); //更新简历编号
                                    freandPart.attr('data-resumeid',String(person_data["resume_id"])); //更新简历编号
                                }
                                freandPart.attr("data-chatstatus", person_data["chat_status"]);
                                freandPart.find(".frendUserName").html(person_data["user_name"]);
                                sessionPart.find(".chatUserName").html(person_data["user_name"]);
                                sessionPart.find(".chatSex").html(person_data["sex"]);
                                sessionPart.find(".userSexImg").attr("src", person_data["sex_img"]);
                                sessionPart.find(".chatAge").html(person_data["age"]);
                                sessionPart.find(".chatWorkYear").html(person_data["work_year"]); //工作经验
                                sessionPart.find(".chatDegree").html(person_data["degree_name"]);//学历
                                if(''==person_data["salary"]){
                                    sessionPart.find(".chatSalary").hide();//薪水
                                    sessionPart.find(".chatSalary").prev().hide();//薪水
                                }else{
                                    sessionPart.find(".chatSalary").html(person_data["salary"]);//薪水
                                }
                                sessionPart.find(".chatWorkInfoDate").html(person_data["work_desc_date"]);//最近工作经历
                                sessionPart.find(".chatWorkInfoCompany").html(person_data["work_company_name"]);//最近工作经历
                                if(person_data["work_desc"]!='()'){
                                    sessionPart.find(".chatWorkInfoYears").html(person_data["work_desc"]);//最近工作经历
                                }
                                sessionPart.find(".chatWorkInfoStation").html(person_data["work_station"]);//最近工作经历
                                sessionPart.find(".char-img-top").attr("src", person_data["photo"]);//头像
                                sessionPart.find(".charDgScrollHeight .dialogo_img").attr("src", person_data["photo"]);//头像
                                freandPart.find(".head-img").attr("src", person_data["photo"]);
                                sessionPart.find(".userImg").attr("src", person_data["photo"]);
                                session_list[i]["SessionImage"] = person_data["photo"];
                                session_list[i]["SessionNick"] = person_data["user_name"];
                                if(person_data["resume_remarks"].length>0){
                                    var chatAddNotesPart =  sessionPart.find(".chatNotesList");
                                    for (var j=0;j<person_data["resume_remarks"].length;j++){
                                        chatAddNotesPart.append('<span class="showNotesItem" data-date="'+person_data["resume_remarks"][j]['update_time']+'">'+person_data["resume_remarks"][j]['remark']+'<i data-remarkid="'+person_data["resume_remarks"][j]['remark_id']+'" class="icon-042 deleteSign deleteChatRemark"></i></span>');
                                    }
									
                                }
                                if(person_data["jobsort"]){
                                    sessionPart.find(".chatJobsort").html(person_data["jobsort"]);//意向职位
                                }else{
                                    sessionPart.find(".user_info_jobWant").hide();
                                }
                                if(1==person_data["is_fav"]){
                                    sessionPart.find(".chatResumeFav").addClass('isFav');
                                }
                                if (person_data["is_apply"]) {
                                    sessionPart.find(".applyStatus").show();//是否投递
                                }
                                if (person_data["resume_id"]) {
                                    var _url1 = myWebim.showResumeUrl + "?resumeid=" + person_data["resume_id"];
                                    var _url2 = 'javascript:myWebim.showIframeResume(' + person_data["resume_id"] + ',this);';
                                    sessionPart.find(".norMalResume").attr("href", _url1);
                                    sessionPart.find(".iframeShowResume").attr("href", _url2);
                                    sessionPart.find(".norMalResume").attr("target", "_blank");
                                } else {
                                    sessionPart.find(".charResume").hide();
                                }
                            } else {
                                sessionPart.find(".charResume").hide();
                            }
                            //黑名单判断
                            if(myWebim.onNimBlacklist[session_id]){
                                sessionPart.find('.chatAddToBlacklist').addClass('isBlack');
                            }
                        }
                        myWebim.newSession =  myWebim.nim.mergeSessions( myWebim.newSession,session_list);
                        //console.log('11111111',session_list,myWebim.newSession);
                        if(1==isInit){
                            var initSessionId = '';
                            if(myWebim.selectedSessionId){
                                initSessionId =myWebim.selectedSessionId;
                            }else{
                                $('#myFrendList').find('li').each(function (i) {
                                    var partDiv = $(this).find('.frendPart');
                                    if (6 != partDiv.attr('data-chatstatus')) {
                                        initSessionId = partDiv.attr('data-sessionid');
                                        return false;
                                    }
                                })
                            }
                            if(''==initSessionId){
                                initSessionId = myWebim.newSession[0].SessionId;
                                $('.chatSearchStatus').removeClass('liActive');
                                $('.chatSearchStatus_6').addClass('liActive');
                                $('.search_chat_status').attr('data-status',6);
                                myWebim.searchChange();
                            }
                            myWebim.changeSession(initSessionId);
                            myWebim.sess_id = initSessionId;//当前聊天对象为 第一个
                            myWebim.setNowSession(myWebim.nimType1 + initSessionId);
                            if(myWebim.selectedSessionId){
                                myWebim.preSessionPart(initSessionId);
                            }
                            //初始化 当前聊天对象
                            $("#myFrendList").find("." + myWebim.frendFre + myWebim.sess_id).find(".notReadMsgCount").hide();
                            $("#myFrendList").find("." + myWebim.frendFre + myWebim.sess_id).find(".notReadMsgCount").text(0);
                            $("#myFrendList").find("." + myWebim.frendFre + myWebim.sess_id).addClass("cut");
                            $(".chatRightList").find("." + myWebim.msgFre + myWebim.sess_id).removeClass("hiddenPart");
							
							
                            //聊天状态栏标记小红点
                            myWebim.chatStatusRemarkRed();
                            //查询当前对话的求职者14天内是否有过聊天记录
                            var url = "/chat/checkChatHistoryV2";
                            $.post(url, {session_id: myWebim.sess_id}, function (re) {
                                if (!re.status) {
                                    $('.j_have_chat_notice').html(re.msg);
                                    $('.chat-right').addClass('tipShow')
                                } else {
                                    //$('.j_have_chat_notice').html('');
                                   // $('.chat-right').removeClass('tipShow')
                                }
                            }, 'json');

                        }else{
                            myWebim.chatStatusRemarkRed();
                        }



                        myWebim.frendList = myWebim.newSession;
                        var nowSessionId = myWebim.sess_id;
                        var nowSession = myWebim.getNowNewSession(nowSessionId);
                        myWebim.personRemarkDo(nowSession);
                        myWebim.searchChange();
                        $('.chatOnceVideo').attr('data-resume-id',nowSession.ResumeId);
                        $('.chatOnceVideo').attr('data-netapply-id',nowSession.net_apply_id);
                        $('.chatOnceVideo').show();
                        if(1==isInit){
                            //发送打招呼
                            //&& nowSession.net_apply_id=="0"
                            if(myWebim.selectResumeId && myWebim.selectResumeId!="0" ){
                                var url = "/chat/isHello";
                                $.post(url, {resume_id: myWebim.selectResumeId}, function (re) {
                                    console.log("isHello",re);
                                    if(re.status){
                                        myWebim.addOneMsg(re.msg,"1");
                                    }
                                }, 'json');
                            }
                        }
                        /*if(nowSession.is_show_video=='1'){
                            $('.chatOnceVideo').attr('data-resume-id',nowSession.ResumeId);
                            $('.chatOnceVideo').attr('data-netapply-id',nowSession.net_apply_id);
                            $('.chatOnceVideo').show();
                        }else{
                            $('.chatOnceVideo').hide();
                        }*/

                    }
                }
            });
        }
        //getResumeUrl
    },

    //获取当前登录的SessId
    getLoginSessId: function () {
        return this.loginInfo.identifier;
    },
    //聊天记录的块
    getSessionPart: function (_sessionId) {
        return $(".chatRightList").find("." + myWebim.msgFre + _sessionId);
    },
    //会话列表块
    getFrendPart: function (_sessionId) {
        return $("#myFrendList").find("." + myWebim.frendFre + _sessionId);
    },
    //获取当前聊天块
    getThisSessionPart: function () {
        var _sessionId = myWebim.sess_id;
        return $(".chatRightList").find("." + myWebim.msgFre + _sessionId);
    },
    //企业账户的 获取登录账号头像
    getLoginSessImg: function () {
        return this.loginInfo.headurl;
    },
    //刷新消息历史记录
    //刷新消息记录 优先刷新 当前会话
    refreshMsgList: function () {
        var msgCount = myWebim.initMsgList; //初始化消息条数
        if (myWebim.sess_id != '') {
            myWebim.getLastC2CHistoryMsgs(myWebim.sess_id, msgCount);
        }
        var frendList = myWebim.frendList;
        //批量拉取消息
        if (frendList.length > 0) {
            for (var n in frendList) {
                var _data = frendList[n];
                if (_data.SessionId != myWebim.sess_id) {
                    myWebim.getLastC2CHistoryMsgs(_data.SessionId, msgCount);
                }
            }
        }
    },
    //获取session的信息
    getSessDataBySessId: function (_sessionId) {
        var data = myWebim.frendList;
        for (var n in data) {
            var _data = data[n];
            if (_data.SessionId == _sessionId) {
                return _data;
            }
        }
        return null;
    },
    //将时间戳转换为友好的时间
    timeToDate: function (time) {
        // 获取当前时间戳
        // 获取当前时间戳
        var currentTime = new Date();
        var now = currentTime.getTime();
        var preTime = new Date(now - 24 * 60 * 60 * 1000); //昨天
        var msgTime = new Date(parseInt(time) * 1000);

        var _month = myWebim.dayReplay(currentTime.getMonth() + 1);
        var _day = myWebim.dayReplay(currentTime.getDate());
        var _currentDay = _month + "-" + _day;

        var _preMonth = myWebim.dayReplay(preTime.getMonth() + 1);
        var _preDay = myWebim.dayReplay(preTime.getDate());
        var _preDate = _preMonth + "-" + _preDay;

        var _msgMonth = myWebim.dayReplay(msgTime.getMonth() + 1);
        var _msgDay = myWebim.dayReplay(msgTime.getDate());
        var _msgDate = _msgMonth + "-" + _msgDay;

        var _msgHours = myWebim.dayReplay(msgTime.getHours());
        var _msgMinite = myWebim.dayReplay(msgTime.getMinutes());

        if (_msgDate == _currentDay) {
            return _msgHours + ":" + _msgMinite;
        } else if (_msgDate == _preDate) {
            return "昨天 ";
        } else {
            return _msgDate
        }
    },
    // 获取当前时间戳
    timeToDateV2: function (time) {

        var currentTime = new Date();
        var now = currentTime.getTime();
        var preTime = new Date(now - 24 * 60 * 60 * 1000); //昨天
        var msgTime = new Date(parseInt(time) * 1000);

        var _month = currentTime.getMonth() + 1;
        var _day = currentTime.getDate();
        var _currentDay = _month + "-" + _day;

        var _preMonth = preTime.getMonth() + 1;
        var _preDay = preTime.getDate;
        var _preDate = _preMonth + "-" + _preDay;

        var _msgMonth = msgTime.getMonth() + 1;
        var _msgDay = msgTime.getDate;
        var _msgDate = _msgMonth + "-" + _msgDay;

        var _msgHours = msgTime.getHours();
        var _msgMinite = msgTime.getMinutes();


        if (_msgDate == _currentDay) {
            return _msgHours + ":" + _msgMinite;
        } else if (_msgDate == _preDate) {
            return "昨天 " + _msgHours + ":" + _msgMinite;
        } else {
            return _msgDate + " " + _msgHours + ":" + _msgMinite;
        }
    },
    dayReplay: function (day) {
        if (parseInt(day) <= 9) {
            return "0" + day;
        }
        return day;
    },
    timeToDateV3: function (time) {
        var currentTime = new Date();
        var now = currentTime.getTime();
        var preTime = new Date(now - 24 * 60 * 60 * 1000); //昨天
        var msgTime = new Date(parseInt(time) * 1000);

        var _month = myWebim.dayReplay(currentTime.getMonth() + 1);
        var _day = myWebim.dayReplay(currentTime.getDate());
        var _currentDay = _month + "-" + _day;

        var _preMonth = myWebim.dayReplay(preTime.getMonth() + 1);
        var _preDay = myWebim.dayReplay(preTime.getDate());
        var _preDate = _preMonth + "-" + _preDay;

        var _msgMonth = myWebim.dayReplay(msgTime.getMonth() + 1);
        var _msgDay = myWebim.dayReplay(msgTime.getDate());
        var _msgDate = _msgMonth + "-" + _msgDay;

        var _msgHours = myWebim.dayReplay(msgTime.getHours());
        var _msgMinite = myWebim.dayReplay(msgTime.getMinutes());

        if (_msgDate == _currentDay) {
            return _msgHours + ":" + _msgMinite;
        } else if (_msgDate == _preDate) {
            return "昨天 " + _msgHours + ":" + _msgMinite;
        } else {
            return _msgDate + " " + _msgHours + ":" + _msgMinite;
        }
    },
    getStrBytes : function (str) {
        if (str == null || str === undefined) return 0;
        if (typeof str != "string") {
            return 0;
        }
        var total = 0,
            charCode, i, len;
        for (i = 0, len = str.length; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode <= 0x007f) {
                total += 1; //字符代码在000000 – 00007F之间的，用一个字节编码
            } else if (charCode <= 0x07ff) {
                total += 2; //000080 – 0007FF之间的字符用两个字节
            } else if (charCode <= 0xffff) {
                total += 3; //000800 – 00D7FF 和 00E000 – 00FFFF之间的用三个字节，注: Unicode在范围 D800-DFFF 中不存在任何字符
            } else {
                total += 4; //010000 – 10FFFF之间的用4个字节
            }
        }
        return total;
    },
    bindEvent: function () {//事件绑定
        $(".chatRightList").on("click", ".getMoreMsg", function () { //获取更多历史信息
            var _session_id = myWebim.sess_id; //当前聊天对象
            //隐藏当前 并且放开转圈
            $(this).hide();
            $(this).next(".dropload-load").show();
            myWebim.getLastC2CHistoryMsgs(_session_id);//获取历史消息
        });
        //语言播放事件
        $(".chatRightList").on("click", ".voiceSound", function () {
            var BROWSER_INFO = myWebim.getBrowserInfo();
            if (BROWSER_INFO.type == 'ie' && parseInt(BROWSER_INFO.ver) <= 8) {
                myWebim.setTip('当前浏览器版本过低，不支持播放','fail');
                //alert('当前浏览器版本过低，不支持播放');
                return;
            }
            var _this = $(this);
            var audioObj = _this.find("audio");
            var this_audio = audioObj[0];

            if (_this.hasClass("notPlay")) {
                //先暂停其他正在播放的语言  然后开始播放
                myWebim.closeAudio();
                this_audio.currentTime = 0; //重新开始播放
                this_audio.play();
                _this.removeClass("notPlay").addClass("onPlay");

            } else {
                this_audio.pause();
                _this.removeClass("onPlay").addClass("notPlay");
            }
        });
        //发送普通消息
        $(".chartSend").on("click", function () {
            var sessionMap = myWebim.sessionMap;
            var sessType = myWebim.nimType;
            //发送不同消息
            var msgtosend = $('.chatTextarea').val(); //文本内容
            if (msgtosend.length < 1) {
                myWebim.setTip('发送的消息不能为空','fail');
                //alert("发送的消息不能为空!");
                return;
            }
            var maxLen = 12000;
            var msgLen = myWebim.getStrBytes(msgtosend);
            var errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
            if (msgLen > maxLen) {
                myWebim.setTip(errInfo,'fail');
                //alert(errInfo);
                return;
            }
            myWebim.addOneMsg(msgtosend);
            var sess_data = myWebim.getSessDataBySessId(myWebim.sess_id);
            var html = '<li>\n' +
                '                        <a href="javascript:void(0);" class="frendPart frendCard_' + sess_data.SessionId + '" data-sessionid="' + sess_data.SessionId + '" data-jobid="' + sess_data.SessionJobId + '" data-starttime="' + sess_data.start_timestamp + '" data-endtime="' + sess_data.end_timestamp + '" data-timestamp="' + sess_data.MsgTimeStamp + '">\n' +
                '                            <img class="head-img" src="' + sess_data.SessionImage + '">\n' +
                '                            <p>\n' +
                '                                <span class="chat-list-tit01">\n' +
                '                                    <span class="frendUserName">' + sess_data.SessionNick + '</span>\n' +
                '                                    <span></span>\n' +
                //'                                    <span><em></em></span>\n' +
                // '                                    <span class="frendStation">' + sess_data.SessionJobStation + '</span>\n' +
                '                                    <span class="frendStation"></span>\n' +
                '                                    <i class="chat-list-icon01 jobstatus" style="display: none;"></i>\n' +
                '                                </span>\n' +
                '                                <span class="chat-list-tit02 msgPro">\n' +
                '                                    <em class="readStatus"></em>\n' +
                '                                    <span class="msgContent">' + msgtosend + '</span>\n' +
                '                                </span>\n' +
                '                            </p>\n' +
                '                            <span class="chat-list-time msgTime">' + myWebim.timeToDate(sess_data.MsgTimeStamp) + '</span>\n' +
                '                            <span class="chat-list-msg notReadMsgCount msgPro" style="display:none">0</span>\n' +
                '                            <span class="j_close_chat close-chat" style="display: none;">×</span>' +
                '                        </a>\n' +
                '                    </li>';
            if (!sessionMap[sessType + sess_data.SessionId] && $('.msgCard_' + sess_data.SessionId).length === 0) {
                myWebim.addChatMsgPart(myWebim.initNewSession(sess_data), true,true);
            }
            if (!sessionMap[sessType + sess_data.SessionId] && $('#myFrendList .frendCard_' + sess_data.SessionId).length === 0) {
                $('#myFrendList').prepend(html);
            }
            if (!sessionMap[sessType + sess_data.SessionId]){
                sessionMap[sessType + sess_data.SessionId] = true;
            }
        });
        //键盘事件  ctrl+enter
        $('.chatTextarea').keydown(function (event) {
            if (event.ctrlKey && event.keyCode == 13) {
                $(".chartSend").click();
            }
        });
        //图片放大
        $(".chatRightList").on("click", "._showImage", function () { //获取更多历史信息
            var big_scr = $(this).attr("data-big-src");
            var bigImgObj = $('<div class="bigImagShow">'
                + '<div class="m_master"></div>'
                + '<div class="chat_img_pop">'
                + '<a href="javascript:void(0)" class="chat_pop_close"></a>'
                + '<div class="chat_popx">'
                + '<img src="' + big_scr + '" />'
                + '</div>'
                + '</div>');
            bigImgObj.find(".chat_pop_close").on("click", function () {
                $(this).off();
                $("body").find(".bigImagShow").remove();
            });
            $(document).find("body").append(bigImgObj);
        });

        //聊天卡片切换
        $("#myFrendList").on("click", "a", function (e) {
            var _this = $(this);
            var session_id = _this.attr('data-sessionid');

            if ($(e.target).is('.j_close_chat')) {
                if ($('.j_close_chat').length == 1) {
                    // alert('最少保持一个会话');
                    return false;
                }
                myWebim.deleteChat(session_id,$(this));
                return ;
            }
            if (session_id == myWebim.sess_id) {
                return;
            }
            $('#j_history_list').html('');
            $("#myFrendList").find("a.cut").removeClass("cut");
            $('.chatDivPart').addClass('hiddenPart');
            $('.historyKey').val('');
            $('.chat-right').removeClass('tipShow');
            //hideHistoryR();
            $(".chatRightList").find(".msgCard_" + session_id).removeClass("hiddenPart");
            firstDate.setTime($(this).attr('data-starttime'))
            lastDate.setTime($(this).attr('data-endtime') || formatDate(new Date()));
            //$('.historyTimeIpt').val(formatDate(lastDate))
			if($(".chatRightList").find("." + myWebim.msgFre + session_id).find('.chatNotesList')[0].offsetWidth >= 520){
				$('.showNotesAll').show();
			}else{
				$('.showNotesAll').hide()
			}
            myWebim.changeSession(session_id);
            //设置视频面试隐藏
            var nowSession =  myWebim.getNowNewSession(session_id);
            $('.chatOnceVideo').attr('data-resume-id',nowSession.ResumeId);
            $('.chatOnceVideo').attr('data-netapply-id',nowSession.net_apply_id);
            $('.chatOnceVideo').show();

            //查询当前对话的求职者14天内是否有过聊天记录
         /*   var selToID = myWebim.sess_id;
            var sess_data = myWebim.getSessDataBySessId(selToID);
            var resume_id = sess_data.ResumeId;*/
            var url = "/chat/checkChatHistoryV2";
            $.post(url, {session_id: session_id}, function (re) {
                if (!re.status) {
                    $('.j_have_chat_notice').html(re.msg);
                    $('.chat-right').addClass('tipShow');
                    $('.tipBox').show();
					
                } else {
                    $('.j_have_chat_notice').html('');
					if($('.tipBoxBlackName').css('display')=='none'){
						$('.chat-right').removeClass('tipShow')
					}
					$('.tipBox').hide();
                }
            }, 'json');
            //切换后关闭语言
            myWebim.closeAudio();
        });
        $('body').on('click', '.frendPart', function () {
            hideHistoryR();
        });

        $("body").on("mouseenter", "#myFrendList li a", function () {
            var _this = $(this);
            _this.find('.notReadMsgCount').hide();
            _this.find('.j_close_chat').show();
        });
        $("body").on("mouseleave", "#myFrendList li a", function () {
            var _this = $(this);
            var count = _this.children('.notReadMsgCount').html();
            if (parseInt(count) > 0) {
                _this.find('.notReadMsgCount').show();
            }
            _this.find('.j_close_chat').hide();
        });

        //页面切换
        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState == "hidden") {
                myWebim.documentIsHidden = true;
//                document.title = "离开页面了";
            } else {
                myWebim.documentIsHidden = false;
                if (myWebim.chatinterval) {
                    var sess_id = myWebim.sess_id;
                    var nowNewSession = myWebim.getNowNewSession(sess_id);
                    //会话对象
                    if (nowNewSession) {
                        if (nowNewSession.hasOwnProperty('lastMsg')) {
                            if (nowNewSession.lastMsg.flow == 'in') {
                                if (nowNewSession.msgReceiptTime != nowNewSession.lastMsg.time)
                                    myWebim.nim.sendMsgReceipt({
                                        msg: nowNewSession.lastMsg,
                                    });
                            }
                        }
                    }
                    window.clearInterval(myWebim.chatinterval);
                }
                document.title = "聊一聊";
            }
        });
        //关闭页面
        window.addEventListener("beforeunload", function (event) {
            //如果已经离线了
            if (myWebim.onLineStatus == "on") {
                //去掉cookie
                myWebim.setCookie("chatLoginStatus", "false");
            }
            if (typeof (chatVideo) != "undefined") {
                var channel_id = chatVideo.room;
                var baseInfoUrl = chatVideo.baseInfoUrl;
                var net_apply_id = chatVideo.netApplyId;
                $.post(baseInfoUrl, {
                    channel_id: channel_id,
                    "type": "setApplyEnd",
                    "net_apply_id": net_apply_id
                }, function (re) {
                    console.log("结束状态成功");
                }, 'json');
                if(chatVideo.aliWebrtc != null){
                    chatVideo.aliWebrtc.leaveChannel();
                    chatVideo.aliWebrtc.dispose();
                }
            }
        });
    },
    //卡片的切换
    changeSession: function (_session_id) {

        var old_session_id = myWebim.sess_id;
        //console.log('changeSession',old_session_id,_session_id);

        if (_session_id == old_session_id) {
            return;
        }

        //console.log('onNimBlacklist',myWebim.onNimBlacklist[_session_id]);
         if(myWebim.onNimBlacklist[_session_id]){
             $('.tipBoxBlackName').show();
             $('.chat-right').addClass('tipShow'); 
         }else{
			 if($('.tipBox').css('display')=='none'){
			 	$('.chat-right').removeClass('tipShow')
			 }
			 	$('.tipBoxBlackName').hide();
         }
       /* if(!myWebim.sessionMap[myWebim.nimType1 +_session_id]){
            return;
        }*/
        myWebim.sess_id = _session_id;
        myWebim.setNowSession(myWebim.nimType1 + _session_id);
        $("#myFrendList").find("a.cut").removeClass("cut");
        $(".chatRightList").find(".chatDivPart ").addClass("hiddenPart");
        $("#myFrendList").find("." + myWebim.frendFre + _session_id).addClass("cut");
        $(".chatRightList").find("." + myWebim.msgFre + _session_id).removeClass("hiddenPart");
        //取消消息小红数量
        var nowNewSession = myWebim.getNowNewSession(_session_id);
        if(nowNewSession.hasOwnProperty('lastMsg')){
           // if(nowNewSession.msgReceiptTime!=nowNewSession.lastMsg.time)
                myWebim.nim.sendMsgReceipt({
                    msg: nowNewSession.lastMsg,
                    done: sendMsgReceiptDone
                });
        }
        function sendMsgReceiptDone(error, obj) {
            //console.log(_session_id+'发送消息已读回执' + (!error?'成功':'失败'), error, obj)
        }
        //面试邀请、不合适、发offer功能显示条件按钮显示
        myWebim.personRemarkDo(nowNewSession);
        myWebim.setHotTip(_session_id,nowNewSession.unread);
        var status = $('.frendCard_'+_session_id).attr('data-chatstatus');
       // var jobId = $('.frendCard_'+_session_id).attr('data-jobid');
        //面试邀请、不合适、发offer功能显示条件按钮显示 的小红点
        myWebim.chatStatusRemarkRedStatus(status);
        $('.chatPutx').show();
        //myWebim.addRemoveJob(jobId,'del');
        //将文档滚动到最下面
        myWebim.refressScroll(_session_id);
        var sessionPart = myWebim.getSessionPart(_session_id); //聊天部分
        sessionPart.find('.tab_chat').find('span').addClass('tabBarActive');
        sessionPart.find('.tab_resume_detail').find('span').removeClass('tabBarActive');
        $('.windowResumeshow').hide();
        $('.chat-card-header').show();
        $('.charDialog').show();
        //结算备注的...
        if($(".chatRightList").find("." + myWebim.msgFre + _session_id).find('.chatNotesList')[0].offsetWidth >= 520){
            $('.showNotesAll').show();
        }else{
            $('.showNotesAll').hide()
        }
    },
    //监听最新消息
    getNewMsg: function (msgData) {
        var sess_id = myWebim.sess_id;
        var sessionMap = myWebim.sessionMap;
        //判断自己发的还是对方发的
        if('in'==msgData.flow){
            var _session_id = msgData.from;
            myWebim.chatStatusRemarkRedGetNew(_session_id);
        }else{
            var _session_id = msgData.to;
        }
        var nowNewSession = myWebim.getNowNewSession(_session_id);
        //会话对象
        if (_session_id == sess_id && !myWebim.documentIsHidden) {
            //设置为已读
            myWebim.nim.sendMsgReceipt({
                msg: nowNewSession.lastMsg,
            });
        }
        //console.log('nowNewSession',nowNewSession);
        if (sessionMap[ myWebim.nimType1 + _session_id]) {
           // console.log('nowNewSession1',nowNewSession);
            myWebim._getTextMsgHtml(_session_id, msgData, true);
            myWebim.refressScroll(_session_id);
            //将该消息提前
            myWebim.preSessionPart(_session_id);
            //设置小红点
            myWebim.setHotTip(_session_id,nowNewSession.unread);

            if ('in' == msgData.flow) {
                myWebim.setFriendReadStatus(_session_id, 2);
                myWebim.setReadStatus(_session_id);
            } else {
                myWebim.setFriendReadStatus(_session_id, 0);
            }

        } else {
           // console.log('addNewSession2');
            //如果是新的会话对象
            myWebim.addNewSession(_session_id, msgData);
        }
        //如果页面已经切换 则用定时器修改页面title
        if (myWebim.documentIsHidden && 'in' == msgData.flow) {
            myWebim.changeTitle();
        }
    },
    //设置会话消息提醒小红数目
    setHotTip:function(_session_id,unread){
        var frend_li_data = myWebim.getFrendPart(_session_id);
        if(myWebim.sess_id==_session_id){
            unread = 0;
        }
        if (unread > 0) {
            var _showCount = unread > 99 ? "99+" : unread;
            frend_li_data.find(".notReadMsgCount").html(_showCount).show();
        }else{
            _showCount = 0;
            frend_li_data.find(".notReadMsgCount").html(_showCount).hide();
        }

    },
    //消息记录设置阅读状态
    setReadStatus:function(_session_id){
        //阅读状态设置
        $(".chatRightList").find("." + myWebim.msgFre + _session_id).find('.dialogUnread').each(function(i){
            $(this).html('已读');
            $(this).removeClass('dialogUnread');
            $(this).addClass('dialogRead');
        });
    },
    //好友列表设置阅读状态
    setFriendReadStatus: function (sessionId, type) {
        var friend_li_data = $("#myFrendList").find("." + myWebim.frendFre + sessionId);
        if (1 == type) {
            friend_li_data.find(".readStatus").removeClass('unread').html("【已读】");
        } else if(2 == type){
            friend_li_data.find(".readStatus").removeClass('unread').html('');
        }else{
            friend_li_data.find(".readStatus").addClass("unread").html("【未读】");
        }
    },
    //会话中设置消息已读未读
    setReadOnUpSession: function (sessionObj) {
        if ("in" == sessionObj.lastMsg.flow) {
            var _sessionId = sessionObj.lastMsg.from;
        } else {
            var _sessionId = sessionObj.lastMsg.to;
        }

        if (sessionObj.hasOwnProperty('msgReceiptTime')) {
            if ("in" == sessionObj.lastMsg.flow) {
                myWebim.setFriendReadStatus(_sessionId, 2);
                myWebim.setReadStatus(_sessionId);
            } else {
                if (sessionObj.lastMsg.time > sessionObj.msgReceiptTime) {
                    myWebim.setFriendReadStatus(_sessionId, 0);
                } else {
                    myWebim.setFriendReadStatus(_sessionId, 1);
                    myWebim.setReadStatus(_sessionId);
                }
            }
        } else {
            if("in" == sessionObj.lastMsg.flow){
                myWebim.setFriendReadStatus(_sessionId, 2);
            }else{
                myWebim.setFriendReadStatus(_sessionId, 0);
            }
        }
    },
    //会话列表设置到最前端
    preSessionPart: function (session_id) {
        var part = myWebim.getFrendPart(session_id);
        var part_li = part.parent("li");
        part_li.remove();
        $("#myFrendList").prepend(part_li);
    },
    //添加新的会话
    //添加左边部分
    addNewSession: function (_session_id,msgData) {
       var selectedSession = myWebim.getNowNewSession(_session_id);
       myWebim.sessionMap[myWebim.nimType1 +_session_id] = true;
        //添加好友
        myWebim.frendList = myWebim.newSession;
        //生成聊天窗口
        myWebim.addMyFrend(selectedSession, true); //添加朋友
        var _hasAdd = myWebim.addChatMsgPart(selectedSession, true,true); //生成消息块
       // var _hasAdd = myWebim.addMsgToPart(_session_id, msgData,msgData.time); //生成消息块
        //将消息块中的更多隐藏 todo; //添加消息块消息
        //将消息加入到消息块中
        //myWebim.initHistoryMsg(_session_id);
       // myWebim._getTextMsgHtml(_session_id, msgData, true);
        myWebim.refreshMsgTopTips([selectedSession],1,0);
        myWebim.refressScroll(_session_id);
    },
    //发送单条消息
    addOneMsg: function (msgtosend,chatType) {
        if (msgtosend == "") {
            return;
        }

       // console.log(newMsgArray);
        //var _msgtosend = newMsgArray[1];//发送的消息
        var selToID = myWebim.sess_id;
        var sess_data = myWebim.getNowNewSession(selToID);
        var logininfo = myWebim.loginInfo;
        //发送人
        var userInfoFirst = {"name": logininfo.identifierNick, "url": logininfo.headurl, "id": logininfo.identifier};
        //接受人
        var userInfoSecond = {"name": sess_data.SessionNick, "url": sess_data.SessionImage, "id": sess_data.SessionId}; //ResumeId
        //卡片信息  "company_id":"989786","job_id":"12359853"  chatCardType
        //职位信息卡片
        //console.log(sess_data);
        var cardInfo = {
            "chatCardType": "1",
            "job_id": String(sess_data.SessionJobId),
            "resume_id": String(sess_data.ResumeId),
            "station": sess_data.sessionJobStation,
            "in_flag": "",
            "out_flag": "",
            "activity_id": "",
            "apply_id": "",
        };
        if(!chatType){
            chatType = "0";
        }
        var content = {"userInfoFirst": userInfoFirst, "userInfoSecond": userInfoSecond, "cardInfo": cardInfo ,"chatType":chatType};
        var nimMsg = nim.sendText({
            scene: 'p2p',
            to: selToID,
            custom: content,
            text:  msgtosend,
            cc:true,
            done: function sendMsgDone(error, msg) {
                //console.log('error' , error,'msg',msg);
                if(!error){
                    $("#myFrendList").find("." + myWebim.frendFre + selToID).find(".readStatus").addClass("unread").html("【未读】");
                    myWebim._getTextMsgHtml(selToID, msg, 1);
                    myWebim.addMsgToServer(selToID);
                    //$("#send_msg_text").val('');
                    $("#chatTextarea").val('');
                    myWebim.refressScroll(selToID);
                }else{
                    if(7101==error.code){
                        $("#myFrendList").find("." + myWebim.frendFre + selToID).find(".readStatus").addClass("unread").html("【未读】");
                        myWebim._getTextMsgHtml(selToID, msg, 1);
                        myWebim.addMsgToServer(selToID);
                        //$("#send_msg_text").val('');
                        $("#chatTextarea").val('');
                        myWebim.refressScroll(selToID);
                        //alert('你已被对方屏蔽，对方将收不到你发的消息');
                        myWebim.setTip('你已被对方屏蔽，对方将收不到你发的消息','fail');
                    }else{
                        myWebim.setTip('发送失败','fail');
                       // alert('发送失败');
                    }
                    console.log(error);
                }
            }
        });
    },
    //解析发送消息中的表情 0 显示图片，1以文字显示
    sendMsgEmoji: function (msgtosend,allFaces) {
        var newMsgArray = msgtosend.split(/(\[[A-Za-z\u4E00-\u9FA5\uF900-\uFA2D]+?\])/);
        //var path = /^\[em_[A-Za-z\u4E00-\u9FA5\uF900-\uFA2D]+?\]$/;
        var newMsgString = "";
        var sendMsgString = "";
        if (newMsgArray.length > 0) {
            for (var i in newMsgArray) {
                if (allFaces[newMsgArray[i]]) {
                    var emoji = allFaces[newMsgArray[i]];
                    var imgString = '<img class="im_emojiImae" src="' + myWebim.facePath + emoji.name + '"/>';
                    var sendString = emoji.nick;
                    newMsgString = newMsgString + imgString;
                    sendMsgString = sendMsgString + sendString;
                } else {
                    newMsgString = newMsgString + newMsgArray[i];
                    sendMsgString = sendMsgString + newMsgArray[i];
                }
            }
        }

        newMsgString = newMsgString.replace(/\n/g, '<br/>'); //替换换行
        return [newMsgString, sendMsgString];
    },
    addMsgToServer: function (sess_id) {

        var sess_data = myWebim.getSessDataBySessId(sess_id);
        //console.log('addMsgToServer',sess_data);
        var resume_id = sess_data.ResumeId;
        var sendUrl = this.sendMsgUrl + "?resume_id=" + resume_id + "&sess_id=" + sess_id;
        $.getJSON(sendUrl, function (result) {
        })
    },
    addMsgToPart: function (session_id, msgContent, msgTime) {
        if (msgContent == "") {
            return false;
        }
        var _msgTime = myWebim.timeToDateV3(msgTime);
        var sessionMsgPart = myWebim.getSessionPart(session_id);
        var scrollPart = sessionMsgPart.find(".charDialog");
        var LoginSessionId = myWebim.getLoginSessId();//登录用户
        var LoginImg = myWebim.getLoginSessImg();//登录用户头像

        var msgHtml = "";
        var dialogMsgTimeObj = sessionMsgPart.find(".dialogTime:last");
        var dialogMsgTime = dialogMsgTimeObj.attr("data-time");
        var _show_time = true;
        if (typeof dialogMsgTime != "undefined") {
            var _time_diff = msgTime - dialogMsgTime;
            if (_time_diff < 120) {
                _show_time = false //隐藏上一条消息时间
            }
        }
        var _timeStyle = "";
        if (!_show_time) {
            _timeStyle = "display:none";
        }
        //添加消息
        var msgHtml = '<span class="dialogTime" style="' + _timeStyle + '" data-time="' + msgTime + '">' + _msgTime + '</span>'
            + '<div class="dialogMsgMe">'
            + '<img src="' + LoginImg + '" class="dialog_img" />'
            + '<div class="dialogMtit">' + msgContent + '</div>'
            //                                        +'<span class="dialogUnread readStatus '+readStatusClass+'">未读</span>' //只有自己的消息才需要判断已读未读
            + '</div>';
        sessionMsgPart.find(".charDgScrollHeight").append(msgHtml);
        //跳到文档底部
        $('#chatTextarea').val("");//清空文本框
        var docmentPart = scrollPart.find(".charDgScrollHeight");//滚动框
        var scrollHeight = docmentPart.height();//当前高度
        scrollPart.scrollTop(scrollHeight);
    },
    getCustomMsg: function (sess_id) {
        var logininfo = myWebim.loginInfo;
        var sess_data = myWebim.getSessDataBySessId(sess_id);
        var customMsg = {};
        //自定义消息
        //发送人
        var userInfoFirst = {"name": logininfo.identifierNick, "url": logininfo.headurl, "id": logininfo.identifier};
        //接受人
        var userInfoSecond = {"name": sess_data.SessionNick, "url": sess_data.SessionImage, "id": sess_data.SessionId}; //ResumeId
        // NSDictionary *chatHeadDicInfos = @{@"chatCardType":@"1",@"in_flag":@"",@"out_flag":@"",@"job_id":rsumeJobId,@"resume_id":rsumeId,@"apply_id":resumeApplyId,@"activity_id":rsumeInviteId};
        //卡片信息  "company_id":"989786","job_id":"12359853"  chatCardType
        //职位信息卡片
        var cardInfo = {
            "chatCardType": "1",
            "job_id": sess_data.SessionJobId.toString(),
            "resume_id": sess_data.ResumeId.toString(),
            "station": sess_data.sessionJobStation,
            "in_flag": "",
            "out_flag": "",
            "activity_id": "",
            "apply_id": ""
        };

        return {"userInfoFirst": userInfoFirst, "userInfoSecond": userInfoSecond, "cardInfo": cardInfo};
    },
    scrollEvent: function (_session_id) {
        //滚动条事件
        //获取当前消息框
        var msgPart = myWebim.getSessionPart(_session_id);
        var scrollPart = msgPart.find(".charDialog");
        var complete = 0;//表示还有
        var lastMsgMap = myWebim.lastMsgMap;
        if (lastMsgMap[_session_id]) {
            complete = lastMsgMap[_session_id].complete;
        } //判断还有历史消息
        //获取当前滚动条位置
        if (scrollPart.scrollTop() == 0 && complete == 0) {
            myWebim.getLastC2CHistoryMsgs(_session_id);//获取历史消息
        }
    },
    //当语音播放结束的时候
    audioEnd: function (obj) {
        $(".charDgScrollHeight").find(".onPlay").removeClass("onPlay").addClass("notPlay");
    },
    //关闭当前正在播放的语音
    closeAudio: function () {
        var oldObj = $(".charDgScrollHeight").find(".onPlay audio"); //关闭正在播放的
        if (oldObj.length > 0) {
            var old_audio = oldObj[0];
            old_audio.pause();
            $(".charDgScrollHeight").find(".onPlay").removeClass("onPlay").addClass("notPlay");
        }
    },
    //历史消息滑动后回调
    getMoreMsgCallBack: function (_session_id) {
        var part = myWebim.getSessionPart(_session_id);
        var scrollPart = part.find(".charDialog");//滚动框
        var docmentPart = part.find(".charDgScrollHeight");//滚动框
        var scrollHeight = docmentPart.height();//当前高度
        var lastHeight = scrollHeight;
        var lastMsgMap = myWebim.lastMsgMap;
        var dialogHeight = scrollPart.height();
        //文档高度
        if (lastMsgMap[_session_id]) {
            lastHeight = lastMsgMap[_session_id].scrollHeight; //历史高度
            //lastHeight    = lastHeight <= dialogHeight ? dialogHeight : lastHeight;
        }
        //重置滚动条
        //获取当前高度
        if (lastHeight <= dialogHeight) {
            scrollPart.scrollTop(scrollHeight + dialogHeight);
        } else if (scrollHeight > lastHeight) {
            var _diffHeight = scrollHeight - lastHeight;
            scrollPart.scrollTop(_diffHeight);
        }
        //判断是否还有更多消息
        var complete = 0;//表示还有
        var lastMsgMap = myWebim.lastMsgMap;
        if (lastMsgMap[_session_id]) {
            complete = lastMsgMap[_session_id].complete;
        }
        if (complete) {
            part.find(".noMoreMsg").css('display', 'block');
            part.find(".getMoreMsg").hide();
            part.find(".dropload-load").hide();
        } else {
            part.find(".getMoreMsg").show();
            part.find(".dropload-load").hide();
        }
    },
    //刷新滚动框 消息框滑到底部
    refressScroll: function (_session_id) {
        var part = myWebim.getSessionPart(_session_id);
        var scrollPart = part.find(".charDialog");//滚动框
        var docmentPart = part.find(".charDgScrollHeight");//滚动框
        var scrollHeight = docmentPart.height();//当前高度
        scrollPart.scrollTop(scrollHeight); //滚动到文档最底下
    },
    //刷新未读消息数量
    //更新个数
    refreshUnreadCount: function (session_id, unreadCount) {

        if (unreadCount > 0) {
            var part = $("#myFrendList").find("." + myWebim.frendFre + session_id);
            part.find(".notReadMsgCount ").html(unreadCount).show();
            myWebim.unreadCountMap[session_id] = unreadCount;
        } else {
            var part = $("#myFrendList").find("." + myWebim.frendFre + session_id);
            part.find(".notReadMsgCount ").html(unreadCount).hide();
            myWebim.unreadCountMap[session_id] = unreadCount;
        }
    },
    //获取浏览器版本
    getBrowserInfo: function () {
        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
            (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
        if (Sys.ie) { //Js判断为IE浏览器
            //ie10的判断这里有个问题
            // Mozilla/5.0 (compatible; MSIE 9.0; qdesk 2.5.1277.202; Windows NT 6.1; WOW64; Trident/6.0)
            // 是IE10 而不是IE9
            if (ua.match(/trident\/(\d)\./) && ua.match(/trident\/(\d)\./)[1] == 6) {
                Sys.ie = 10
            }
            return {
                'type': 'ie',
                'ver': Sys.ie
            };
        }
        if (Sys.firefox) { //Js判断为火狐(firefox)浏览器
            return {
                'type': 'firefox',
                'ver': Sys.firefox
            };
        }
        if (Sys.chrome) { //Js判断为谷歌chrome浏览器
            return {
                'type': 'chrome',
                'ver': Sys.chrome
            };
        }
        if (Sys.opera) { //Js判断为opera浏览器
            return {
                'type': 'opera',
                'ver': Sys.opera
            };
        }
        if (Sys.safari) { //Js判断为苹果safari浏览器
            return {
                'type': 'safari',
                'ver': Sys.safari
            };
        }
        return {
            'type': 'unknow',
            'ver': -1
        };
    },
    //Nick表情
    getFaceNickObj: function () {
        if (myWebim.allFaceNickObj.length > 0) {
            return myWebim.allFaceNickObj;
        }
        var allObj = this.getFaceElements();
        var newObj = {};
        for (var i = 0; i < allObj.length; i++) {
            var obj = allObj[i];
            newObj[obj.nick] = obj;
        }
        myWebim.allFaceNickObj = newObj;
        return newObj;
    },
    //获取表情图标
    getFaceElements: function () {
        var face = [
            {name: "emoji_01.png", code: "emoticon_emoji_01", nick: "[可爱]"},
            {
                name: "emoji_00.png", code: "emoticon_emoji_0", nick: "[大笑]"
            },
            {
                name: "emoji_02.png",
                code: "emoticon_emoji_02",
                nick: "[色]"
            },
            {
                name: "emoji_03.png",
                code: "emoticon_emoji_03",
                nick: "[嘘]"
            },
            {
                name: "emoji_04.png",
                code: "emoticon_emoji_04",
                nick: "[亲]"
            },
            {
                name: "emoji_05.png",
                code: "emoticon_emoji_05",
                nick: "[呆]"
            },
            {
                name: "emoji_06.png",
                code: "emoticon_emoji_06",
                nick: "[口水]"
            },
            {
                name: "emoji_145.png",
                code: "emoticon_emoji_145",
                nick: "[汗]"
            },
            {
                name: "emoji_07.png",
                code: "emoticon_emoji_07",
                nick: "[呲牙]"
            },
            {
                name: "emoji_08.png",
                code: "emoticon_emoji_08",
                nick: "[鬼脸]"
            },
            {
                name: "emoji_09.png",
                code: "emoticon_emoji_09",
                nick: "[害羞]"
            },
            {
                name: "emoji_10.png",
                code: "emoticon_emoji_10",
                nick: "[偷笑]"
            },
            {
                name: "emoji_11.png",
                code: "emoticon_emoji_11",
                nick: "[调皮]"
            },
            {
                name: "emoji_12.png",
                code: "emoticon_emoji_12",
                nick: "[可怜]"
            },
            {
                name: "emoji_13.png",
                code: "emoticon_emoji_13",
                nick: "[敲]"
            },
            {
                name: "emoji_14.png",
                code: "emoticon_emoji_14",
                nick: "[惊讶]"
            },
            {
                name: "emoji_15.png",
                code: "emoticon_emoji_15",
                nick: "[流感]"
            },
            {
                name: "emoji_16.png",
                code: "emoticon_emoji_16",
                nick: "[委屈]"
            },
            {
                name: "emoji_17.png",
                code: "emoticon_emoji_17",
                nick: "[流泪]"
            },
            {
                name: "emoji_18.png",
                code: "emoticon_emoji_18",
                nick: "[嚎哭]"
            },
            {
                name: "emoji_19.png",
                code: "emoticon_emoji_19",
                nick: "[惊恐]"
            },
            {
                name: "emoji_20.png",
                code: "emoticon_emoji_20",
                nick: "[怒]"
            },
            {
                name: "emoji_21.png",
                code: "emoticon_emoji_21",
                nick: "[酷]"
            },
            {
                name: "emoji_22.png",
                code: "emoticon_emoji_22",
                nick: "[不说]"
            },
            {
                name: "emoji_23.png",
                code: "emoticon_emoji_23",
                nick: "[鄙视]"
            },
            {
                name: "emoji_24.png",
                code: "emoticon_emoji_24",
                nick: "[阿弥陀佛]"
            },
            {
                name: "emoji_25.png",
                code: "emoticon_emoji_25",
                nick: "[奸笑]"
            },
            {
                name: "emoji_26.png",
                code: "emoticon_emoji_26",
                nick: "[睡着]"
            },
            {
                name: "emoji_27.png",
                code: "emoticon_emoji_27",
                nick: "[口罩]"
            },
            {
                name: "emoji_28.png",
                code: "emoticon_emoji_28",
                nick: "[努力]"
            },
            {
                name: "emoji_29.png",
                code: "emoticon_emoji_29",
                nick: "[抠鼻孔]"
            },
            {
                name: "emoji_30.png",
                code: "emoticon_emoji_30",
                nick: "[疑问]"
            },
            {
                name: "emoji_31.png",
                code: "emoticon_emoji_31",
                nick: "[怒骂]"
            },
            {
                name: "emoji_32.png",
                code: "emoticon_emoji_32",
                nick: "[晕]"
            },
            {
                name: "emoji_33.png",
                code: "emoticon_emoji_33",
                nick: "[呕吐]"
            },
            {
                name: "emoji_160.png",
                code: "emoticon_emoji_160",
                nick: "[拜一拜]"
            },
            {
                name: "emoji_161.png",
                code: "emoticon_emoji_161",
                nick: "[惊喜]"
            },
            {
                name: "emoji_162.png",
                code: "emoticon_emoji_162",
                nick: "[流汗]"
            },
            {
                name: "emoji_163.png",
                code: "emoticon_emoji_163",
                nick: "[卖萌]"
            },
            {
                name: "emoji_164.png",
                code: "emoticon_emoji_164",
                nick: "[默契眨眼]"
            },
            {
                name: "emoji_165.png",
                code: "emoticon_emoji_165",
                nick: "[烧香拜佛]"
            },
            {
                name: "emoji_166.png",
                code: "emoticon_emoji_166",
                nick: "[晚安]"
            },
            {
                name: "emoji_34.png",
                code: "emoticon_emoji_34",
                nick: "[强]"
            },
            {
                name: "emoji_35.png",
                code: "emoticon_emoji_35",
                nick: "[弱]"
            },
            {
                name: "emoji_36.png",
                code: "emoticon_emoji_36",
                nick: "[OK]"
            },
            {
                name: "emoji_37.png",
                code: "emoticon_emoji_37",
                nick: "[拳头]"
            },
            {
                name: "emoji_38.png",
                code: "emoticon_emoji_38",
                nick: "[胜利]"
            },
            {
                name: "emoji_39.png",
                code: "emoticon_emoji_39",
                nick: "[鼓掌]"
            },
            {
                name: "emoji_167.png",
                code: "emoticon_emoji_167",
                nick: "[握手]"
            },
            {
                name: "emoji_40.png",
                code: "emoticon_emoji_40",
                nick: "[发怒]"
            },
            {
                name: "emoji_41.png",
                code: "emoticon_emoji_41",
                nick: "[骷髅]"
            },
            {
                name: "emoji_42.png",
                code: "emoticon_emoji_42",
                nick: "[便便]"
            },
            {
                name: "emoji_43.png",
                code: "emoticon_emoji_43",
                nick: "[火]"
            },
            {
                name: "emoji_44.png",
                code: "emoticon_emoji_44",
                nick: "[溜]"
            },
            {
                name: "emoji_45.png",
                code: "emoticon_emoji_45",
                nick: "[爱心]"
            },
            {
                name: "emoji_46.png",
                code: "emoticon_emoji_46",
                nick: "[心碎]"
            },
            {
                name: "emoji_47.png",
                code: "emoticon_emoji_47",
                nick: "[钟情]"
            },
            {
                name: "emoji_48.png",
                code: "emoticon_emoji_48",
                nick: "[唇]"
            },
            {
                name: "emoji_49.png",
                code: "emoticon_emoji_49",
                nick: "[戒指]"
            },
            {
                name: "emoji_50.png",
                code: "emoticon_emoji_50",
                nick: "[钻石]"
            },
            {
                name: "emoji_51.png",
                code: "emoticon_emoji_51",
                nick: "[太阳]"
            },
            {
                name: "emoji_52.png",
                code: "emoticon_emoji_52",
                nick: "[有时晴]"
            },
            {
                name: "emoji_53.png",
                code: "emoticon_emoji_53",
                nick: "[多云]"
            },
            {
                name: "emoji_54.png",
                code: "emoticon_emoji_54",
                nick: "[雷]"
            },
            {
                name: "emoji_55.png",
                code: "emoticon_emoji_55",
                nick: "[雨]"
            },
            {
                name: "emoji_56.png",
                code: "emoticon_emoji_56",
                nick: "[雪花]"
            },
            {
                name: "emoji_57.png",
                code: "emoticon_emoji_57",
                nick: "[爱人]"
            },
            {
                name: "emoji_58.png",
                code: "emoticon_emoji_58",
                nick: "[帽子]"
            },
            {
                name: "emoji_59.png",
                code: "emoticon_emoji_59",
                nick: "[皇冠]"
            },
            {
                name: "emoji_60.png",
                code: "emoticon_emoji_60",
                nick: "[篮球]"
            },
            {
                name: "emoji_61.png",
                code: "emoticon_emoji_61",
                nick: "[足球]"
            },
            {
                name: "emoji_62.png",
                code: "emoticon_emoji_62",
                nick: "[垒球]"
            },
            {
                name: "emoji_63.png",
                code: "emoticon_emoji_63",
                nick: "[网球]"
            },
            {
                name: "emoji_64.png",
                code: "emoticon_emoji_64",
                nick: "[台球]"
            },
            {
                name: "emoji_65.png",
                code: "emoticon_emoji_65",
                nick: "[咖啡]"
            },
            {
                name: "emoji_66.png",
                code: "emoticon_emoji_66",
                nick: "[啤酒]"
            },
            {
                name: "emoji_67.png",
                code: "emoticon_emoji_67",
                nick: "[干杯]"
            },
            {
                name: "emoji_68.png",
                code: "emoticon_emoji_68",
                nick: "[柠檬汁]"
            },
            {
                name: "emoji_69.png",
                code: "emoticon_emoji_69",
                nick: "[餐具]"
            },
            {
                name: "emoji_70.png",
                code: "emoticon_emoji_70",
                nick: "[汉堡]"
            },
            {
                name: "emoji_71.png",
                code: "emoticon_emoji_71",
                nick: "[鸡腿]"
            },
            {
                name: "emoji_72.png",
                code: "emoticon_emoji_72",
                nick: "[面条]"
            },
            {
                name: "emoji_73.png",
                code: "emoticon_emoji_73",
                nick: "[冰淇淋]"
            },
            {
                name: "emoji_74.png",
                code: "emoticon_emoji_74",
                nick: "[沙冰]"
            },
            {
                name: "emoji_75.png",
                code: "emoticon_emoji_75",
                nick: "[生日蛋糕]"
            },
            {
                name: "emoji_76.png",
                code: "emoticon_emoji_76",
                nick: "[蛋糕]"
            },
            {
                name: "emoji_77.png",
                code: "emoticon_emoji_77",
                nick: "[糖果]"
            },
            {
                name: "emoji_78.png",
                code: "emoticon_emoji_78",
                nick: "[葡萄]"
            },
            {
                name: "emoji_79.png",
                code: "emoticon_emoji_79",
                nick: "[西瓜]"
            },
            {
                name: "emoji_80.png",
                code: "emoticon_emoji_80",
                nick: "[光碟]"
            },
            {
                name: "emoji_81.png",
                code: "emoticon_emoji_81",
                nick: "[手机]"
            },
            {
                name: "emoji_82.png",
                code: "emoticon_emoji_82",
                nick: "[电话]"
            },
            {
                name: "emoji_83.png",
                code: "emoticon_emoji_83",
                nick: "[电视]"
            },
            {
                name: "emoji_84.png",
                code: "emoticon_emoji_84",
                nick: "[声音开启]"
            },
            {
                name: "emoji_85.png",
                code: "emoticon_emoji_85",
                nick: "[声音关闭]"
            },
            {
                name: "emoji_86.png",
                code: "emoticon_emoji_86",
                nick: "[铃铛]"
            },
            {
                name: "emoji_87.png",
                code: "emoticon_emoji_87",
                nick: "[锁头]"
            },
            {
                name: "emoji_88.png",
                code: "emoticon_emoji_88",
                nick: "[放大镜]"
            },
            {
                name: "emoji_89.png",
                code: "emoticon_emoji_89",
                nick: "[灯泡]"
            },
            {
                name: "emoji_90.png",
                code: "emoticon_emoji_90",
                nick: "[锤头]"
            },
            {
                name: "emoji_91.png",
                code: "emoticon_emoji_91",
                nick: "[烟]"
            },
            {
                name: "emoji_92.png",
                code: "emoticon_emoji_92",
                nick: "[炸弹]"
            },
            {
                name: "emoji_93.png",
                code: "emoticon_emoji_93",
                nick: "[枪]"
            },
            {
                name: "emoji_94.png",
                code: "emoticon_emoji_94",
                nick: "[刀]"
            },
            {
                name: "emoji_95.png",
                code: "emoticon_emoji_95",
                nick: "[药]"
            },
            {
                name: "emoji_96.png",
                code: "emoticon_emoji_96",
                nick: "[打针]"
            },
            {
                name: "emoji_97.png",
                code: "emoticon_emoji_97",
                nick: "[钱袋]"
            },
            {
                name: "emoji_98.png",
                code: "emoticon_emoji_98",
                nick: "[钞票]"
            },
            {
                name: "emoji_99.png",
                code: "emoticon_emoji_99",
                nick: "[银行卡]"
            },
            {
                name: "emoji_100.png",
                code: "emoticon_emoji_100",
                nick: "[手柄]"
            },
            {
                name: "emoji_101.png",
                code: "emoticon_emoji_101",
                nick: "[麻将]"
            },
            {
                name: "emoji_102.png",
                code: "emoticon_emoji_102",
                nick: "[调色板]"
            },
            {
                name: "emoji_103.png",
                code: "emoticon_emoji_103",
                nick: "[电影]"
            },
            {
                name: "emoji_104.png",
                code: "emoticon_emoji_104",
                nick: "[麦克风]"
            },
            {
                name: "emoji_105.png",
                code: "emoticon_emoji_105",
                nick: "[耳机]"
            },
            {
                name: "emoji_106.png",
                code: "emoticon_emoji_106",
                nick: "[音乐]"
            },
            {
                name: "emoji_107.png",
                code: "emoticon_emoji_107",
                nick: "[吉他]"
            },
            {
                name: "emoji_108.png",
                code: "emoticon_emoji_108",
                nick: "[火箭]"
            },
            {
                name: "emoji_109.png",
                code: "emoticon_emoji_109",
                nick: "[飞机]"
            },
            {
                name: "emoji_110.png",
                code: "emoticon_emoji_110",
                nick: "[火车]"
            },
            {
                name: "emoji_111.png",
                code: "emoticon_emoji_111",
                nick: "[公交]"
            },
            {
                name: "emoji_112.png",
                code: "emoticon_emoji_112",
                nick: "[轿车]"
            },
            {
                name: "emoji_113.png",
                code: "emoticon_emoji_113",
                nick: "[出租车]"
            },
            {
                name: "emoji_114.png",
                code: "emoticon_emoji_114",
                nick: "[警车]"
            },
            {
                name: "emoji_115.png",
                code: "emoticon_emoji_115",
                nick: "[自行车]"
            }
        ];
        return face
    },
    setCookie: function (name, value) {
        document.cookie = name + '=' + escape(value)+';path=/';
        document.cookie = name + '=' + escape(value)+';path=/;domain=.huibo.com';
    },
    getCookie: function (name) {
        var cookieValue = '';
        var search = name + '=';
        if (document.cookie.length > 0) {
            var offset = document.cookie.indexOf(search)
            if (offset != -1) {
                offset += search.length;
                var end = document.cookie.indexOf(';', offset);
                if (end == -1) end = document.cookie.length;
                cookieValue = unescape(document.cookie.substring(offset, end));
            }
        }
        return cookieValue;
    },
    //定时器修改title
    changeTitle: function () {
        var time = 16;
        var countdown = function () {
            if (time > 0) {
                if (time % 2 == 0) {
                    document.title = "您有新消息了";
                } else {
                    document.title = '\u200E';
                }
                time--;
            } else {
                window.clearInterval(myWebim.chatinterval);
                document.title = "聊一聊";
            }
        };
        myWebim.chatinterval = window.setInterval(countdown, 500);
    },
    //删除会话
    deleteChat: function (session_id, _this) {
        //删除会话及聊天信息
        myWebim.nim.deleteLocalSession({
            id: myWebim.nimType1 + session_id,
        });
        myWebim.nim.deleteSession({
            scene: myWebim.nimType,
            to: session_id,
        });
        myWebim.nim.deleteLocalMsgsBySession({
            scene: myWebim.nimType,
            to: session_id,
            delLastMsg: true,
        });
        myWebim.nim.clearServerHistoryMsgs({
            account: session_id,
            delRoam: true,
        });
        var jobId = $('.frendCard_'+session_id).attr('data-jobid');
        var status = $('.frendCard_'+session_id).attr('data-chatstatus');
        //面试邀请、不合适、发offer功能显示条件按钮显示 的小红点


        //删除好友节点 和 聊天节点
        _this.parent().remove();
        myWebim.chatStatusRemarkRedStatus(status);
        myWebim.addRemoveJob(session_id,jobId,'del','');

        $('.' + myWebim.msgFre + session_id).remove();
        myWebim.sessionMap[myWebim.nimType1 + session_id] = false;
        var nowSessionId = myWebim.sess_id;
        //console.log('deleteChat',session_id,nowSessionId);
        //切换会话

        if (session_id == nowSessionId) {
            var first_session_id = $('.frendPart:eq(0)').attr('data-sessionid');
            $('#myFrendList').find('li').each(function (i) {
                var chatStatus = $(this).children('a').attr('data-chatstatus');
                if (chatStatus == status) {
                    first_session_id = $(this).children('a').attr('data-sessionid');
                    return true;
                }
            });

            //删除会话 切换但聊天
            //console.log('first_session_id',first_session_id);
            $('.chat-right').removeClass('tipShow');
            myWebim.changeSession(first_session_id);
        }

    },
    setTip:function(tipContent,status){
        hbjs.use('@hbCommon, @jobDialog, @validator, @confirmBox', function(m) {
            var $ = m['product.hbCommon'].extend(m['cqjob.jobDialog']);
            $.anchorMsg(tipContent,{icon:status});
        });
    },
    //发送普通文本消息
    sendNormalMsg: function (msgtosend) {
       // console.log('发送普通文本消息');
        var sessionMap = myWebim.sessionMap;
        var sessType = 'p2p'; //设置会话类型
        if (msgtosend.length < 1) {
            myWebim.setTip('发送的消息不能为空','fail');
            //alert("发送的消息不能为空!");
            return;
        }
        var maxLen = 12000;
        var msgLen = myWebim.getStrBytes(msgtosend);
        var errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
        if (msgLen > maxLen) {
           // alert(errInfo);
            myWebim.setTip(errInfo,'fail');
            return;
        }
        //解析消息中的表情 todo
        myWebim.addOneMsg(msgtosend);
        var sess_data = myWebim.getSessDataBySessId(myWebim.sess_id);
        var html = '<li>\n' +
            '                        <a href="javascript:void(0);" class="frendPart frendCard_' + sess_data.SessionId + '" data-sessionid="' + sess_data.SessionId + '" data-jobid="' + sess_data.SessionJobId + '" data-starttime="' + sess_data.start_timestamp + '" data-endtime="' + sess_data.end_timestamp + '" data-timestamp="' + sess_data.MsgTimeStamp + '">\n' +
            '                            <img class="head-img" src="' + sess_data.SessionImage + '">\n' +
            '                            <p>\n' +
            '                                <span class="chat-list-tit01">\n' +
            '                                    <span class="frendUserName">' + sess_data.SessionNick + '</span>\n' +
            '                                    <span></span>\n' +
            //'                                    <span><em></em></span>\n' +
           // '                                    <span class="frendStation">' + sess_data.SessionJobStation + '</span>\n' +
            '                                    <span class="frendStation"></span>\n' +
            '                                    <i class="chat-list-icon01 jobstatus" style="display: none;"></i>\n' +
            '                                </span>\n' +
            '                                <span class="chat-list-tit02 msgPro">\n' +
            '                                    <em class="readStatus"></em>\n' +
            '                                    <span class="msgContent">' + msgtosend + '</span>\n' +
            '                                </span>\n' +
            '                            </p>\n' +
            '                            <span class="chat-list-time msgTime">' + myWebim.timeToDate(sess_data.MsgTimeStamp) + '</span>\n' +
            '                            <span class="chat-list-msg notReadMsgCount msgPro" style="display:none">0</span>\n' +
            '                            <span class="j_close_chat close-chat" style="display: none;">×</span>' +
            '                        </a>\n' +
            '                    </li>';
        if (!sessionMap[sessType + sess_data.SessionId] && $('.msgCard_' + sess_data.SessionId).length === 0) {
            myWebim.addChatMsgPart(myWebim.initNewSession(sess_data), true,true);
        }
        if (!sessionMap[sessType + sess_data.SessionId] && $('#myFrendList .frendCard_' + sess_data.SessionId).length === 0) {
            $('#myFrendList').prepend(html);
        }
        if(!sessionMap[sessType + sess_data.SessionId]){
            sessionMap[sessType + sess_data.SessionId] = true;
        }
    },
    showIframeResume: function (resume_id, _this) {
        var hasCut = $("body").find(".viewProfileDetail").hasClass("cut");
        if (hasCut) {
            myWebim.closeIframeResume(_this);
            return;
        }
        var url = $("body").find(".viewProfileDetail").attr("data-attr") + resume_id;
        var html = '<iframe src="' + url + '" width="693" height="650"></iframe>';
        $("body").find(".viewProfileDetail").html(html);
        $("body").find(".viewProfileDetail").show();
        $("body").find(".viewProfileDetail").addClass("cut");
        var MsgPart = this.getThisSessionPart();
        MsgPart.find(".iframeShowResume").text('收起简历');

    },
    closeIframeResume: function (_this) {
        var MsgPart = this.getThisSessionPart();
        $("body").find(".viewProfileDetail").html("");
        $("body").find(".viewProfileDetail").hide();
        $("body").find(".viewProfileDetail").removeClass("cut");
        MsgPart.find(".iframeShowResume").text('查看简历');
    },
    
    changeShowResumeType: function (type) {
        if (type == 0) {
            $("body").find(".iframeShowResume").hide();
            $("body").find(".norMalResume").show();
            $(".chat-right").find(".chat_resume_tip").hide();
        } else {
            $("body").find(".iframeShowResume").show();
            $("body").find(".norMalResume").hide();
            var hasCookie = myWebim.getCookie("chatCloseResumeTip");
            console.log(hasCookie);
            if(hasCookie != "true"){
                $(".chat-right").find(".chat_resume_tip").show();
            }
        }
    },
    getCookie:function(name){
        var cookieValue = '';
        var search = name + '=';
        if (document.cookie.length > 0) {
            var offset = document.cookie.indexOf(search)
            if (offset != -1) {
                offset += search.length;
                var end = document.cookie.indexOf(';', offset);
                if (end == -1) end = document.cookie.length;
                cookieValue = unescape(document.cookie.substring(offset, end));
            }
        }
        return cookieValue;
    },
    //职位切换和未读勾选 刷选
    searchChange: function () {
        var chatStatus = $('.search_chat_status').attr('data-status');
        var jobId = $('.search_job_sort').attr('data-job-id');
        var readStatus = $('.search_is_read').attr('data-status');
        //console.log('chatStatus',chatStatus);
        $('#myFrendList').find('li').each(function (i) {
            var isShow = true;
            var liChatStatus = $(this).children('a').attr('data-chatstatus');
            if ("" != chatStatus) {
                if("-1"==chatStatus ){
                    if('6'==liChatStatus){
                        isShow = false;
                    }
                }else{
                    if (liChatStatus != chatStatus) {
                        isShow = false;
                    }
                }
            }
            var liJobId = $(this).children('a').attr('data-jobid');
            if ("" != jobId) {
                if (liJobId != jobId) {
                    isShow = false;
                }
            }
            if ('1'==readStatus) {
                if (!$(this).find('.readStatus').hasClass('unread')) {
                    isShow = false;
                }
            }
            if(isShow){
                $(this).show();
            }else{
                $(this).hide();
            }
        })
    },
    //职位切换
    personJobIdChangRemove:function (jobId,jobStation ) {
        var currentSessId = myWebim.sess_id;
        var  nowSession = myWebim.getNowNewSession(currentSessId);
        var oldJobId = nowSession.SessionJobId;
        if(oldJobId==jobId){
            return false;
        }
        nowSession.SessionJobId = jobId;
        nowSession.SessionJobStation = jobStation;
        //console.log('personJobIdChangRemove',nowSession);
        myWebim.newSession =  myWebim.nim.mergeSessions(myWebim.newSession,[nowSession]);
       //var freandPart = myWebim.getFrendPart(currentSessId); //朋友列表部分
       var  sessionPart = myWebim.getSessionPart(currentSessId); //聊天部分
        var freandPart = myWebim.getFrendPart(nowSession.SessionId);
        sessionPart.find('.chatStation').text(jobStation);
        freandPart.attr('data-jobid',jobId);
        myWebim.addRemoveJob(currentSessId,oldJobId,'del',jobStation);
        myWebim.addRemoveJob(currentSessId,jobId,'add',jobStation);
    },
    //标记面试邀请、不合适、发offer功能显示条件按钮显示
    personRemarkDo:function (nowSession) {
        var freandPart = myWebim.getFrendPart(nowSession.SessionId);
        var status = freandPart.attr('data-chatstatus');

        if(1==status){
            $('.personRemarkDo').find('.rightjoberStatus').show();
            $('.personRemarkDo').find('.dislikeWord').show();
            $('.personRemarkDo').find('.rightjoberStatus').find('em').text('发送面试邀请');
            $('.personRemarkDo').find('.dislikeWord').find('em').text('不合适');
        }
        if(2==status){
            $('.personRemarkDo').find('.rightjoberStatus').show();
            $('.personRemarkDo').find('.dislikeWord').show();
            $('.personRemarkDo').find('.rightjoberStatus').find('em').text('发送面试邀请');
            $('.personRemarkDo').find('.dislikeWord').find('em').text('不合适');
        }
        if(3==status){
            $('.personRemarkDo').find('.rightjoberStatus').show();
            $('.personRemarkDo').find('.dislikeWord').show();
            $('.personRemarkDo').find('.rightjoberStatus').find('em').text('发送offer');
            $('.personRemarkDo').find('.dislikeWord').find('em').text('不合适');
        }
        if(4==status){
            $('.personRemarkDo').find('.rightjoberStatus').show();
            $('.personRemarkDo').find('.rightjoberStatus').find('em').text('发送offer');
            $('.personRemarkDo').find('.dislikeWord').hide();
        }
        if(5==status){
            $('.personRemarkDo').find('.rightjoberStatus').show();
            $('.personRemarkDo').find('.rightjoberStatus').find('em').text('发送offer');
            $('.personRemarkDo').find('.dislikeWord').hide();
        }
        if(6==status){
            $('.personRemarkDo').find('.rightjoberStatus').hide();
            $('.personRemarkDo').find('.dislikeWord').show();
            $('.personRemarkDo').find('.dislikeWord').find('em').text('取消不合适');
        }
    },
    //标记面试邀请、不合适、发offer功能显示条件按钮显示 初始化小红点
    chatStatusRemarkRed:function () {
      $('#myFrendList').find('li').each(function (i) {
            var notReadMsgCount  = $(this).find('.notReadMsgCount').text();
            //console.log('chatStatusRemarkRed',notReadMsgCount);
            if(notReadMsgCount>0){
               var status = $(this).find('a').attr('data-chatstatus');
               if(!$('.chatSearchStatus_'+status).hasClass('liNoRead')){
                   $('.chatSearchStatus_'+status).addClass('liNoRead');
                   //console.log('chatStatusRemarkRed',notReadMsgCount,status);
               }
            }
      });
    },
    //标记面试邀请、不合适、发offer功能显示条件按钮显示刷新小红点
    chatStatusRemarkRedStatus:function (status) {
        $('.chatSearchStatus_'+status).removeClass('liNoRead');
        $('#myFrendList').find('li').each(function (i) {
            var notReadMsgCount  = $(this).find('.notReadMsgCount').text();
            //console.log('chatStatusRemarkRed',notReadMsgCount);
            if(notReadMsgCount>0){
                var status = $(this).find('a').attr('data-chatstatus');
                if(!$('.chatSearchStatus_'+status).hasClass('liNoRead')){
                    $('.chatSearchStatus_'+status).addClass('liNoRead');
                    //console.log('chatStatusRemarkRed',notReadMsgCount,status);
                }
            }
        });
    },
    //标记面试邀请、不合适、发offer功能显示条件按钮显示刷新小红点
    chatStatusRemarkRedGetNew:function (sessionId) {
        if(sessionId==myWebim.sess_id){
            return ;
        }
       var status = $('.frendCard_'+sessionId).attr('data-chatstatus');
        //console.log('chatStatusRemarkRedGetNew',status);
        if(!$('.chatSearchStatus_'+status).hasClass('liNoRead')){
            $('.chatSearchStatus_'+status).addClass('liNoRead');
            //console.log('chatStatusRemarkRed',notReadMsgCount,status);
        }

    },
    //会话删除删除职位搜所数据
    addRemoveJob: function (sessionId,jobId, status , jobStation) {
        if ('del' == status) {
            var isDel = true;
            $('#myFrendList').find('li').each(function (i) {
                var liJobId = $(this).children('a').attr('data-jobid');
                if (liJobId == jobId) {
                    if(sessionId!=$(this).children('a').attr('data-sessionid')){
                        isDel = false;
                        return true;
                    }
                }
            });
            if (isDel) {
                $('.search_job_sort').find('li').each(function (i) {
                    var liJobId = $(this).attr('data-job-id');
                    if (liJobId == jobId) {
                        myWebim.searchJobList[jobId] = false;
                        $(this).remove();
                        return true;
                    }
                })
            }
        }
        if ('add' == status) {
            var isAdd = true;
            $('#myFrendList').find('li').each(function (i) {
                var liJobId = $(this).children('a').attr('data-jobid');
                if (liJobId == jobId) {
                    isDel = false;
                    return true;
                }
            });
            if (isAdd) {
                myWebim.searchJobList[jobId] = true;
                var html = '<li data-job-id="' + jobId + '">' + jobStation;
                html += '</li>';
                $('.search_job_sort').children().first().after(html);
            }
        }
    },
}