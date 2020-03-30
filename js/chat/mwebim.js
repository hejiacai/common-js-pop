var myWebim = {
    defaultImgUrl       : "", //默认头像
    charUrl             : '', //聊天地址
    getResumeUrl        : '', //获取简历和职位地址
    facePath            : "", //qq表情图标地址
    sendMsgUrl          : "", //保存发送记录地址
    sessCount           : 30,  //最近30个聊天好友
    frendList           : [],//聊天好友
    frendFre            : "frendCard_",//前缀
    msgFre              : "msgCard_",//消息卡片
    initMsgList         : 2, //初始化时获取历史消息条数
    newSession          : [],//新会话
    sess_id             : "",//当前正在聊天的session
    reqMsgCount         : 10,//获取历史消息条数
    selSess             : null,
    state               :'hide',
    loginInfo          :{},//我的信息
    allFaceCodeObj    :{},//表情
    allFaceNickObj    :{},//表情
    lastMsgMap         :{},//最新消息时间可以key
    init:function(loginInfo,weibinfo,newSession){ //初始化页面
        myWebim.loginInfo       = loginInfo;
        myWebim.defaultImgUrl   = weibinfo.defaultImgUrl;//设置默认头像地址
        myWebim.facePath        = weibinfo.facePath;//获取qq图标地址
        myWebim.chatUrl         = weibinfo.charUrl;//聊天地址
        myWebim.getResumeUrl    = weibinfo.getResumeUrl;
        myWebim.sendMsgUrl      = weibinfo.sendMsgUrl;
        if(newSession.length > 0){
            myWebim.newSession      = newSession;
        }
        //初始化聊天列表
        myWebim.initRecentContactList(); 
        myWebim.bindEvent();
         //初始化未读消息数
        myWebim.setCookie("chatLoginStatus","true");
    },
    //初始化历史聊天记录
    initRecentContactList:function(){ 
        //获取最近联系人
        webim.getRecentContactList({
            'Count': myWebim.sessCount //最近的会话数 ,最大为 100
        },function(resp){
            var data = [];
            var tempSess,tempSessMap = {}; //临时会话变量
            if (resp.SessionItem && resp.SessionItem.length > 0) {
                for (var i in resp.SessionItem) {
                    var item = resp.SessionItem[i];
                    var type = item.Type; //接口返回的会话类型
                    var sessType, typeZh, sessionId, sessionNick = '',
                        sessionImage = '',
                        senderId = '',
                        senderNick = '';
                    var lastMsgContent      = ""; //最后一条消息发送内容
                    var sessionJobId        = ""; //消息职位ID
                    var sessionJobStation   = ""; //消息职位名称
                    var resumeId            = ""; //卡片附带简历编号
                    
                    if (type == webim.RECENT_CONTACT_TYPE.C2C) { //私聊
                        typeZh = '私聊';
                        sessType = webim.SESSION_TYPE.C2C; //设置会话类型
                        sessionId = item.To_Account; //会话id，私聊时为好友ID或者系统账号（值为@TIM#SYSTEM，业务可以自己决定是否需要展示），注意：从To_Account获取,
                        if (sessionId == '@TIM#SYSTEM') { //先过滤系统消息，，
                            webim.Log.warn('过滤好友系统消息,sessionId=' + sessionId);
                            continue;
                        }
                        var key = sessType + "_" + sessionId;
                        sessionNick  = item.C2cNick;
                        sessionImage = item.C2cImage;
                        senderId = senderNick = ''; //私聊时，这些字段用不到，直接设置为空
                        //最后一条消息信息
                        if(item.LastMsg.MsgBody.length >0){
                            var _sysMsg     = item.LastMsg.MsgBody[0];//系统消息内容
                            var _customMsg  = item.LastMsg.MsgBody[1];//自定义消息内容  
                           // debugger;
                            switch (_sysMsg.MsgType) {
                                case webim.MSG_ELEMENT_TYPE.TEXT:
                                    //文本消息
                                    //如果最后一条消息发送方是对方
                                    lastMsgContent  = _sysMsg.MsgContent.Text;
                                    var allFaces    = myWebim.getFaceCodeObj();//表情
                                    lastMsgContent  = myWebim.getMsgEmoji(lastMsgContent,allFaces);
                                    break;
                                case webim.MSG_ELEMENT_TYPE.FACE: //表情消息
                                    
                                    break;
                                case webim.MSG_ELEMENT_TYPE.IMAGE: //图片消息
                                    lastMsgContent = "[图片]";
                                    break;
                                case webim.MSG_ELEMENT_TYPE.SOUND: //语言消息
                                    lastMsgContent = "[语音]";
                                    break;
                                default:
                                    break;
                            }
                            //解析自定义消息
                            if(_customMsg && _customMsg.MsgType == webim.MSG_ELEMENT_TYPE.CUSTOM){
                                var customMsgData_str = _customMsg.MsgContent.Data;
                                if(customMsgData_str){
                                    var customMsgData = $.parseJSON(customMsgData_str);
                                    //用户名：customMsgData.userInfoFirst.name // userInfoFirst表示发送方   userInfoSecond：接收方
                                    if(customMsgData.userInfoFirst.id == sessionId){
                                       sessionNick = customMsgData.userInfoFirst.name;//重置姓名
                                       sessionImage = customMsgData.userInfoFirst.url;//重置头像
                                    }else if(customMsgData.userInfoSecond.id == sessionId){
                                        sessionNick = customMsgData.userInfoSecond.name;//重置姓名
                                        sessionImage = customMsgData.userInfoSecond.url;//重置头像
                                    }
                                    //解析卡片
                                    
                                    var cardInfo        = customMsgData.cardInfo; 
                                    if(typeof(cardInfo) != "undefined"){
                                        sessionJobId        = typeof(cardInfo.job_id)  != 'undefined' ? cardInfo.job_id : ""; //卡片中职位ID
                                        sessionJobStation   = typeof(cardInfo.station) != 'undefined' ? cardInfo.station : ""; //卡片中职位名称
                                        resumeId            = typeof(cardInfo.resume_id) != 'undefined' ? cardInfo.resume_id : "";;//简历编号
                                    }
                                }
                            }
                        }
                        
                    } else if (type == webim.RECENT_CONTACT_TYPE.GROUP) { //群聊
                        webim.Log.warn('过滤群聊消息,sessionId=' + sessionId); //暂时不需要群聊消息
                        continue; 
                    } else {
//                        typeZh = '未知类型';
//                        sessionId = item.ToAccount; //
                        webim.Log.warn('过滤未知类型,sessionId=' + sessionId); //
                        continue; 
                    }

                    if (!sessionId) { //会话id为空
                        webim.Log.warn('会话id为空,sessionId=' + sessionId);
                        continue;
                    }
                    if (sessionId == '@TLS#NOT_FOUND') { //会话id不存在，可能是已经被删除了
                        webim.Log.warn('会话id不存在,sessionId=' + sessionId);
                        continue;
                    }
                    
                    tempSess = tempSessMap[sessType + "_" + sessionId];
                    sessionImage = sessionImage != "" ? sessionImage : myWebim.defaultImgUrl; 
                    if (!tempSess) { //先判断是否存在（用于去重），不存在增加一个
                        tempSessMap[sessType + "_" + sessionId] = true;
                        data.push({
                            SessionType: sessType, //会话类型
                            SessionTypeZh: typeZh, //会话类型中文
                            SessionId: webim.Tool.formatText2Html(sessionId), //会话id
                            SessionNick: webim.Tool.formatText2Html(sessionNick), //会话昵称
                            SessionImage: sessionImage, //会话头像
                            C2cAccount: webim.Tool.formatText2Html(senderId), //发送者id
                            C2cNick: webim.Tool.formatText2Html(senderNick), //发送者昵称
                            UnreadMsgCount: item.UnreadMsgCount, //未读消息数
                            MsgSeq: item.MsgSeq, //消息seq
                            MsgRandom: item.MsgRandom, //消息随机数
                            MsgTimeStamp: item.MsgTimeStamp, //消息时间戳  webim.Tool.formatTimeStamp(item.MsgTimeStamp)
                            MsgShow: item.MsgShow, //消息内容
                            LastMsgContent:lastMsgContent, //最后一条消息内容
                            SessionJobId:sessionJobId, //消息中带的职位编号
                            SessionJobStation:sessionJobStation,//消息职位名称
                            ResumeId:resumeId,//简历编号
                            ApplyId:"", //投递编号
                            Account_id:sessionId, //账号
                            IsNewSession:false,
                            AreaName:"",
                            SalaryText:"",
                            JobUrl:""
                        });
                       
                    }
                }
            }
            
            //如果是新会话
            if(myWebim.newSession.length > 0){
                var _newSession;
                var new_session_id;
                
                for(var n in myWebim.newSession){
                    _newSession = myWebim.newSession[n];
                    new_session_id = _newSession.SessionId;
                    var new_sess_type = webim.SESSION_TYPE.C2C+"_"+new_session_id;
                    if(tempSessMap[new_sess_type]){
                       
                        //重置新会话中的job_id  todo
                        var new_job_id      = _newSession.SessionJobId;
                        var new_station     = _newSession.SessionJobStation;
                        var new_resume_id   = _newSession.ResumeId;
                        var area_name       = _newSession.AreaName;
                        var salaryText      = _newSession.SalaryText;
                        var jobUrl          = _newSession.JobUrl;
                        if(data.length > 0){
                            for(var z in data){
                                if(data[z].SessionId == new_session_id){
                                    data[z].SessionJobId = new_job_id;
                                    data[z].SessionJobStation = new_station;
                                    data[z].ResumeId          = new_resume_id;
                                    data[z].AreaName            = area_name;
                                    data[z].SalaryText          = salaryText;
                                    data[z].JobUrl              = jobUrl;
                                    _newSession = data[z];
                                }
                            }
                        }
                        
                    }else{
                        _newSession = myWebim.initNewSession(_newSession); //初始化新的会话
                        data.unshift(_newSession);
                    }
                    console.log(_newSession);
                    myWebim.sess_id = _newSession.SessionId;
                }
            }
            
            //左边导航栏，显示左边导航
            if(data.length > 0){
                myWebim.frendList   = data; //朋友列表
                myWebim.sessionMap  = tempSessMap;
                var html = "";
                for(var n in data){
                    myWebim.addMyFrend(data[n],false); //添加朋友
                    var is_show = true;
                    if(data[n].IsNewSession == true){
                        is_show = false;
                    }
                    myWebim.addChatMsgPart(data[n],is_show); //生成消息块
                }
                webim.syncMsgs(myWebim.initUnreadMsgCount); //初始化最近会话的消息未读数
               
                //刷新聊天界面信息
               myWebim.refreshMsgTopTips();
            }else{
                //todo
                if(myWebim.newSession.length == 0){
                    $(".notDate").show();
                }
                $(".msg_chat_list").hide();
                
            }
        },function(resp){
            //错误回调
            alert(resp.ErrorInfo);
        });
    },
    
    initNewSession:function(_newSession){ //初始化新的会话
        var newSession = {
                            SessionType: webim.SESSION_TYPE.C2C, //会话类型
                            SessionTypeZh: "私聊", //会话类型中文
                            SessionId: webim.Tool.formatText2Html(_newSession["SessionId"]), //会话id
                            SessionNick: webim.Tool.formatText2Html(_newSession["SessionNick"]), //会话昵称
                            SessionImage: _newSession["SessionImage"], //会话头像
                            C2cAccount: "", //发送者id
                            C2cNick: "", //发送者昵称
                            UnreadMsgCount: 0, //未读消息数
                            MsgSeq: "", //消息seq
                            MsgRandom: "", //消息随机数
                            MsgTimeStamp: _newSession["MsgTimeStamp"], //消息时间戳  webim.Tool.formatTimeStamp(item.MsgTimeStamp)
                            MsgShow: "", //消息内容
                            LastMsgContent:"", //最后一条消息内容
                            SessionJobId:_newSession["SessionJobId"], //消息中带的职位编号
                            SessionJobStation:_newSession["SessionJobStation"],//消息职位名称
                            ResumeId:_newSession["ResumeId"],//简历编号
                            ApplyId:"", //投递编号
                            Account_id:_newSession["SessionId"], //账号
                            IsNewSession:true,
                            AreaName:_newSession["AreaName"],
                            SalaryText:_newSession["SalaryText"],
                            JobUrl:_newSession["JobUrl"]
                        };
        return newSession;
    },
     //添加会话 添加会话列表
    addMyFrend:function(data,is_new){
        if(data.SessionId == ''){
            return false;
        }
        var _sessionId = data.SessionId;
        var frendClass = myWebim.frendFre+_sessionId;
        var _sessionImage       = data.SessionImage == '' ? myWebim.defaultImgUrl : data.SessionImage;
        var _sessionJobStation  = data.SessionJobStation;//职位名称
        var _sessionJobId       = data.SessionJobId;//职位编号
        var _sessionNick        = data.SessionNick;//昵称
        var _unreadMsgCount     = data.UnreadMsgCount;//未读数量
        var _LastMsgContent     = data.LastMsgContent;//最后一条消息记录
        var _msgTimeStamp       = data.MsgTimeStamp;//时间戳
        var _frendTime          = myWebim.timeToDate(_msgTimeStamp);//友好的时间戳
        var href                = "javascript:void(0)";
        var frend_li_data = $('<a href="'+href+'" data-sessionId="'+_sessionId+'" data-jobid="'+_sessionJobId+'" class="frendpart '+frendClass+'">'
                                +'<div class="msg_chat_titz">'
                                    +'<div class="msg_chat_titx">'
                                    +'<span>'
                                        +'<b class="frendUserName">张先生</b>'
                                        +'<i class="stationP"></i>'
                                        +'<em class="jobStation"></em>'
                                    +'</span>'
                                    +'<p class="msgContent"></p>'
                                    +'</div>'
                                    +'<img class="accountPhoto" src="" />'
                                    +'<font class="msg_time"></font>'
                                    +'<font class="msg_number notReadMsgCount" style="display:none"></font>'
                               +'</div>'
                            +'</a>');
        //frend_li_data.find("a").addClass("frendPart");
        frend_li_data.find(".accountPhoto").attr("src",_sessionImage);
        if(_sessionJobStation == ""){
             frend_li_data.find(".stationP").hide();
              frend_li_data.find(".jobStation").hide();
        }else{
            frend_li_data.find(".jobStation").html(_sessionJobStation);
        }
        var _showTitile     =  _sessionNick;
        frend_li_data.find(".frendUserName").html(_showTitile);
        frend_li_data.find(".msgContent").html(_LastMsgContent); //内容
        if(_unreadMsgCount > 0){
           // frend_li_data.find(".readStatus").addClass("unread").html("【未读】"); //内容状态//
            var _showCount = _unreadMsgCount > 99 ? "99+" : _unreadMsgCount;
            frend_li_data.find(".notReadMsgCount").html(_showCount).show();
        }
        if(_LastMsgContent == ""){
            frend_li_data.find(".msgPro").css({'display':'none'});
        }
        //修改时间
        frend_li_data.find(".msg_time").html(_frendTime); //时间
        if(is_new){
            $("#myFrendList").prepend(frend_li_data);
        }else{
            $("#myFrendList").append(frend_li_data);
        }
    },
    addChatMsgPart:function(data,is_show){ //添加消息模块
       //生成聊天界面
        //历史消息
        if(data.SessionId == ''){
            return false;
        }
        var _sessionId = data.SessionId;
        var partClass  = myWebim.msgFre+_sessionId;
        var hiddendClass    = "hiddenPart";
        if(myWebim.sess_id !="" && _sessionId == myWebim.sess_id){
            hiddendClass = "";
        }
        var msg_list = $('<div class="chatDivPart '+partClass+' '+hiddendClass+'">'
                            +'<a href="javascript:void(0)" target="_blank" class="chat_post chatJobPart">'
                                    +'<span class="chatStation"></span>'
                                    +'<b class="chatAreaName">地区未知</b>'
                                    +'<em class="chatSalary">薪资面议</em>'
                            +'</a>'
                        +'<div class="charDialog">'
                            +'<a href="javascript:void(0)" class="noMoreMsg">没有更多消息了</a>'
                            +'<a href="javascript:void(0)" class="moreMsg getMoreMsg"><i></i>查看更多消息</a>'
                            +'<div class="dropload-load">'
                                +'<span class="loading"></span>加载中..'
                            +'</div>'
                            +'<div class="chat_record">'
                                +'<div class="charDgScrollHeight"></div>'
                            +'</div>'
                        +'</div>'
                +'</div>') ;
           
        var _sessionImage       = data.SessionImage == '' ? myWebim.defaultImgUrl : data.SessionImage; //头像
        var _sessionJobStation  = data.SessionJobStation;//职位名称
        var _sessionJobId       = data.SessionJobId;//职位编号
        var _sessionNick        = data.SessionNick;//昵称
        var _resumeId           = data.ResumeId//简历编号
        var _area_name          = data.AreaName;
        var _salaryText         = data.SalaryText;
        var _job_url            = data.JobUrl;
        
        
        var windowHeight = $(window).height();
        
        var botton_height = 60;
        var top_height    = $("#mainChat .loginTopBg").height();
        var _fillHeight  = botton_height + top_height;
        if(_sessionJobId == 13225404 || _sessionJobId == 13225375){
            _sessionJobId = "";
        }
        if(_sessionJobId != ""){
            //var _stationHeight = msg_list.find(".chatJobPart").height()
          var  _stationHeight = 73;
            _fillHeight  = _fillHeight + _stationHeight;
        }
        if(is_show){
             _fillHeight  = _fillHeight + 45;
        }
	msg_list.find('.chat_record').css('height',windowHeight-_fillHeight);
        
        msg_list.find(".chatStation").html(_sessionJobStation);//姓名
        msg_list.find(".chatAreaName").html(_area_name);//姓名
        msg_list.find(".chatSalary").html(_salaryText);//姓名
        msg_list.find(".chatJobPart").attr("href",_job_url);
        
        msg_list.find(".noMoreMsg").hide();//姓名
        msg_list.find(".dropload-load").hide();//姓名
        if(!is_show){
            msg_list.find(".getMoreMsg").hide();//姓名
        }
        if(_sessionJobId == ''){
            msg_list.find(".chatJobPart").hide(); 
        }
        //绑定滚动条事件
//        msg_list.find(".chat_record").scroll(function(){
//            myWebim.scrollEvent(_sessionId);
//        });
        
        $(".chatRightList").append(msg_list);
        return true;
    },
    getFrendNewMsg:function(rspData){ //监听最新消息
        var MsgList     = rspData;
        var sess_id      = myWebim.sess_id;
        var sessionMap   = myWebim.sessionMap;
         var sessType = webim.SESSION_TYPE.C2C; //设置会话类型
        
        if(MsgList.length <= 0){
            return;
        }
        for(var i in MsgList){
            var msgData = MsgList[i];
            var _session = msgData.getSession();
            
            //会话对象
            var _session_id = msgData.sess._impl.id;
            if(sess_id !='' && _session_id == sess_id){
                var selSess = myWebim.getSession();
                webim.setAutoRead(selSess, true, true); //将当前的消息已读上报
            }
            if(!sessionMap[sessType + "_" + _session_id]){
                //如果是新的会话对象
                myWebim.addNewSession(_session_id,msgData);
            }else{
                //更新最新消息及消息时间
                var _msgData    = myWebim.anaMsgData(msgData);
                var frendPart   = myWebim.getFrendPart(_session_id);
                //console.log(_msgData.lastMsgContent);
                frendPart.find(".msgContent").html(_msgData.lastMsgContent);
                var msg_time = _msgData.msgTime;
                frendPart.find(".msg_time").html(myWebim.timeToDate(msg_time));
                //添加新消息
                myWebim._getTextMsgHtml(_session_id,msgData,true);
                myWebim.refressScroll(_session_id);
                
            }
        }
        //获取所有聊天会话
        var sessMap = webim.MsgStore.sessMap();
        for (var i in sessMap) {
            var sess = sessMap[i];
            if(sess.id() != sess_id){
                var unread = sess.unread();
                myWebim.refreshUnreadCount(sess.id(),sess.unread()); //刷新未读数量
                sess.unread(unread);
             }else{
                sess.unread(0);
             }
        };
        
    },
    addMsgHistory:function(_sessionId,MsgList){ //添加历史消息
        if(_sessionId == '' || MsgList.length < 0){
            return;
        }
        //消息块
        var msgPart         = myWebim.getSessionPart(_sessionId); //获取消息块
        var frendData       = myWebim.getSessDataBySessId(_sessionId);//获取信息
        var allFaces        = myWebim.getFaceCodeObj();//表情
        if(frendData == null){
            return;
        }
        //获取对方头像
        //消息块中添加历史消息
        var msgHtml = "";
        var lengh  = MsgList.length;
        MsgList.sort(myWebim._msgReSort);//消息排序反转
        for(var n = 0;n < lengh;n++){
            var msgDataInfo     = MsgList[n]; //消息列表是根据正序排列  需要反序解析
            myWebim._getTextMsgHtml(_sessionId,msgDataInfo,false); //蒋历史消息更新到对应消息块中
            
        }
    },
    refreshMsgTopTips:function(){//聊天头部信息 并且更新信息
        var session_list = this.frendList;
       
        var frend_count  = session_list.length;
        if(frend_count <= 0){
            return;
        }
        var account_ids = [];
        var job_ids     = [];
        for(var i =0;i< frend_count;i++){
            if(session_list[i].SessionJobStation == ""){
                account_ids.push(session_list[i].Account_id);
                job_ids.push(session_list[i].SessionJobId);
            }
        }
        
        if(job_ids.length > 0 || account_ids.length > 0){
            var postUrl = myWebim.getResumeUrl;
            $.ajax({
                url:postUrl,
                type:"post",
                dataType: "json",
                data: {job_ids:job_ids,account_ids:account_ids},
                success:function(json){
                    if(json.status){
                        var resume_list = json.resume_list;
                        var job_list    = json.job_list;
                        var job_data;
                        var person_data;
                        var session_info;
                        var session_id;
                        var freandPart;
                        var sessionPart;
                        for(var i =0;i< frend_count;i++){
                            session_id  = session_list[i]["SessionId"];
                            freandPart  = myWebim.getFrendPart(session_id); //朋友列表部分
                            sessionPart = myWebim.getSessionPart(session_id); //聊天部分
                            job_data    = job_list[session_list[i]["SessionJobId"]];
                            //person_data = resume_list[session_list[i]["Account_id"]];
                            if(typeof(job_data) != "undefined"){
                                session_list[i]["SessionJobStation"] = job_data["station"];
                                freandPart.find(".stationP").show();
                                freandPart.find(".jobStation").html(job_data["station"]).show();
                                if(typeof(job_data['account_photo']) != 'undefined' && job_data['account_photo'] != ""){
                                    freandPart.find(".accountPhoto").attr("src",job_data['account_photo']);
                                    session_list[i]["SessionImage"] = job_data['account_photo'];
                                }
                                //更新职位
                                sessionPart.find(".chatStation").html(job_data["station"]);
                                sessionPart.find(".chatJobPart").attr("href",job_data.job_url);
                                sessionPart.find(".chatAreaName").html(job_data["area_name"]);
                                sessionPart.find(".chatSalary").html(job_data["salary_text"]);
                            }
//                            if(typeof(person_data) != "undefined"){
//                                if(person_data["resume_id"]){
//                                    session_list[i]["ResumeId"] = String(person_data["resume_id"]); //更新简历编号
//                                }
//                                sessionPart.find(".chatSex").html(person_data["sex"]);
//                                sessionPart.find(".chatAge").html(person_data["age"]);
//                                sessionPart.find(".chatWorkYear").html(person_data["work_year"]); //工作经验
//                                sessionPart.find(".chatDegree").html(person_data["degree_name"]);//学历
//                                if(person_data["is_apply"]){
//                                    sessionPart.find(".applyStatus").show();//是否投递
//                                }
//                               
//                                if(person_data["resume_id"]){
//                                    sessionPart.find(".charResume").attr("href",myWebim.showResumeUrl+"?resumeid=" + person_data["resume_id"]);
//                                    sessionPart.find(".charResume").attr("target","_blank");
//                                }else{
//                                    sessionPart.find(".charResume").hide();
//                                }
//                            }else{
//                                sessionPart.find(".charResume").hide();
//                            }
                        }
                        
                    }
                }
            });
        }
        //getResumeUrl
    },
    _msgReSort:function(obj1,obj2){ //消息重排序
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
    //解析消息块内容
    _getTextMsgHtml:function(_sessionId,msgDataInfo,is_new){ //_sessionId 为消息对象
        var sessionMap      = myWebim.sessionMap;
        var sessType = webim.SESSION_TYPE.C2C; //设置会话类型
        if(!sessionMap[sessType + "_" + _sessionId]){
            //如果是新来源的消息 其他方法处理 todo
            
        }
        var msgTime         = msgDataInfo.time;
        var msgPart         = myWebim.getSessionPart(_sessionId); //获取消息块
        var frendData       = myWebim.getSessDataBySessId(_sessionId);//获取信息
        var allFaces        = myWebim.getFaceCodeObj();//表情
        var LoginSessionId  = myWebim.getLoginSessId();//登录人sess_id
        var LoginImg        = myWebim.getLoginSessImg(); //登录人头像
        var _msgTime        = myWebim.timeToDateV3(msgTime); //消息时间
        var frendPart       = myWebim.getFrendPart(_sessionId);
        
        var msgItems            = msgDataInfo.elems;//长度为2的数组 msgItems[0] 中是消息内容 msgItems[1]是卡片内容  暂时不更新卡片 卡片只在初始化的时候更新
        var MsgData             = msgItems[0]; 
        var dialogClass         = msgDataInfo.fromAccount == LoginSessionId ? "dialogMsgMe" : "dialogMsgOther"; //判断是自己的消息 还是别人的消息
        var dialogImgClass      = msgDataInfo.fromAccount == LoginSessionId ? "dialog_img" : "dialogo_img"; //判断是自己的消息 还是别人的消息
        var dialogImg           = msgDataInfo.fromAccount == LoginSessionId ? LoginImg : frendData.SessionImage;
        var showReadStatus      = msgDataInfo.fromAccount == LoginSessionId ? true : false;
        
        //判断是否显示时间
        var _show_time = true;
        if(is_new){
            //如果是新消息 
            var dialogMsgTimeObj = msgPart.find(".dialogTime:last");
            var dialogMsgTime    = dialogMsgTimeObj.attr("data-time");
            if(typeof dialogMsgTime !="undefined"){
                var _time_diff = msgTime - dialogMsgTime;
               if(_time_diff < 120){
                   _show_time = false //隐藏上一条消息时间
               }
            }
        }else{
            //获取第一条消息
            var dialogMsgTimeObj = msgPart.find(".dialogTime:first-child");
            var dialogMsgTime    = dialogMsgTimeObj.attr("data-time");
            if(typeof dialogMsgTime !="undefined"){
                var _time_diff = dialogMsgTime - msgTime;
               if(_time_diff < 120){
                   dialogMsgTimeObj.hide(); //隐藏上一条消息时间
               }
            }
        }
        var chat_icon = msgDataInfo.fromAccount == LoginSessionId ? "chat_icon_r" : "chat_icon_l";
        
        var msgHtml = "";
        var frendContent = "";
        var _timeStyle = "";
        if(!_show_time){
            _timeStyle = "display:none"
        }
        switch (MsgData.type) {
            case webim.MSG_ELEMENT_TYPE.TEXT://文本消息
                var msgContent = MsgData.content.text;
                    msgContent = myWebim.getMsgEmoji(msgContent,allFaces);
                    frendContent = myWebim.getMsgEmoji(MsgData.content.text,allFaces);
                //解析文本消息中的表情

               //添加消息
                var dialogTextClass = msgDataInfo.fromAccount == LoginSessionId ? "dialogMtit" : "dialogOtit";
               
                var _html = '<span class="dialogTime" style="'+_timeStyle+'" data-time="'+msgTime+'">'+_msgTime+'</span>'
                            +'<div class=" '+dialogClass+'">'
                                +'<img src="'+dialogImg+'" class="'+dialogImgClass+'" />'
                                +'<span class="'+chat_icon+'"></span>'
                                +'<div class="'+dialogTextClass+'">'+ msgContent + '</div>'
                            +'</div>';
                msgHtml += _html;
                break;
            case webim.MSG_ELEMENT_TYPE.FACE: //表情消息
                break;
            case webim.MSG_ELEMENT_TYPE.IMAGE: //图片消息
                //图片消息分 大中 小图片
                //图片数组
                frendContent = "[图片]";
                var imgClass        = msgDataInfo.fromAccount == LoginSessionId ? "dialogMimg" : "dialogoImg";
                var imgArray        = MsgData.content.ImageInfoArray;
                var bigImgData      = imgArray[0];
                var midImgData      = imgArray[1];
                var smallImgData    = imgArray[2];
                //此处展示中图
                var _html = '<span class="dialogTime">'+_msgTime+'</span>'
                +'<div class=" '+dialogClass+'">'
                    +'<img src="'+dialogImg+'" class="'+dialogImgClass+'" />'
                    +'<div class="'+imgClass+'">'
                        +'<img class="_showImage" data-big-src="'+bigImgData.url+'" src="'+smallImgData.url+'" />'
                    +'</div>'
                +'</div>';

                msgHtml += _html;
                break;
            case webim.MSG_ELEMENT_TYPE.SOUND: //语言消息
                //语言时长
                frendContent = "[语言]";
                var sound_url       = MsgData.content.downUrl;
                //var sound_url       = "http://oj8tkdyf9.bkt.clouddn.com/1500866880067hb.mp3";
                var sound_time      = MsgData.content.second;
                var uuid            = MsgData.uuid;
                var senderid        = MsgData.senderId;
                var dialogSoudClass = msgDataInfo.fromAccount == LoginSessionId ? "dialogmVoice" : "dialogoVoice";
                var leftClass       = msgDataInfo.fromAccount == LoginSessionId ? "" : "hiddenVoiceTime";
                var rightClass      = msgDataInfo.fromAccount == LoginSessionId ? "hiddenVoiceTime" : "";
                
                var new_sound_url   = "";
                var _html = '<span class="dialogTime">'+_msgTime+'</span>'
                +'<div class=" '+dialogClass+'">'
                    +'<img src="'+dialogImg+'" class="'+dialogImgClass+'" />'
                    +'<span class="'+chat_icon+'"></span>'
                    +'<div class="'+dialogSoudClass+'">'
                         +'<font class="'+leftClass+'">'+sound_time+'”</font>'
                        +'<span class="voiceSound notPlay" ><audio  src="'+sound_url+'" onended="myWebim.audioEnd(this)" preload="none"></audio></span>' //播放状态就是onPlay
                        +'<font class="'+rightClass+'">'+sound_time+'”</font>'
                    +'</div>'
                +'</div>';
                msgHtml += _html;
                //语音 second
                break;
                default:
                    break;
            }
        if(is_new){
             msgPart.find(".charDgScrollHeight").append(msgHtml);//添加新消息
             //更新最新消息和最新时间
             frendPart.find(".msgContent").html(frendContent);
             var _frendTime = myWebim.timeToDate(msgTime);
             frendPart.find(".msgTime").html(_frendTime);
        }else{
            msgPart.find(".charDgScrollHeight").prepend(msgHtml);//添加历史消息
        }
    },
    refressScroll:function(_session_id){ //刷新滚动框
        var part            = myWebim.getSessionPart(_session_id);
        var scrollPart      = part.find(".chat_record");//滚动框
        var docmentPart     = part.find(".charDgScrollHeight");//滚动框
        var scrollHeight    = docmentPart.height();//当前高度
        
        scrollPart.scrollTop(scrollHeight); //滚动到文档最底下
    },
    getMoreMsgCallBack:function(_session_id){
        var part            = myWebim.getSessionPart(_session_id);
        var scrollPart      = part.find(".chat_record");//滚动框
        var docmentPart     = part.find(".charDgScrollHeight");//滚动框
        var scrollHeight    = docmentPart.height();//当前高度
        var lastHeight      = scrollHeight;
        var lastMsgMap      = myWebim.lastMsgMap;
        var dialogHeight    = scrollPart.height();
        //文档高度
        if(lastMsgMap[_session_id]){
            lastHeight    = lastMsgMap[_session_id].scrollHeight; //历史高度
            //lastHeight    = lastHeight <= dialogHeight ? dialogHeight : lastHeight;
        }
         //重置滚动条
           //获取当前高度
           if(lastHeight <= dialogHeight){
               scrollPart.scrollTop(scrollHeight + dialogHeight);
           }else if(scrollHeight > lastHeight){
               var _diffHeight = scrollHeight - lastHeight;
               scrollPart.scrollTop(_diffHeight);
           }
        //判断是否还有更多消息
        var complete        = 0;//表示还有
        var lastMsgMap = myWebim.lastMsgMap;
        if(lastMsgMap[_session_id]){
            complete    = lastMsgMap[_session_id].complete;
        }  
        if(complete){
            part.find(".noMoreMsg").css('display','block');
            part.find(".getMoreMsg").hide();
            part.find(".dropload-load").hide();
            setTimeout(function(){
                 part.find(".noMoreMsg").slideUp();
                 scrollPart.css('height',dialogHeight + 45);
            },1000);
        }else{
            part.find(".getMoreMsg").show();
            part.find(".dropload-load").hide();
        }
    },
    //解析消息
    anaMsgData:function(msgData){
        var sessType        = webim.SESSION_TYPE.C2C; //设置会话类型
        var typeZh          = '私聊';
        var lastMsgContent  = "";
        var sessionNick;
        var sessionImage;
        var sessionJobId;
        var sessionJobStation;
        var resumeId;
        var senderId = "";
        var senderNick = "";
        
        var _session_id = msgData.sess._impl.id;
        var msgTime     = msgData.time;
        var msgItems    = msgData.elems;//长度为2的数组 msgItems[0] 中是消息内容 msgItems[1]是卡片内容  暂时不更新卡片 卡片只在初始化的时候更新
        var _sysMsg     = msgItems[0];//系统消息内容
        var _customMsg  = msgItems[1];//自定义消息内容  
        switch (_sysMsg.type) {
            case webim.MSG_ELEMENT_TYPE.TEXT:
                //文本消息
                //如果最后一条消息发送方是对方
                lastMsgContent  = _sysMsg.content.text;
                var allFaces    = myWebim.getFaceCodeObj();//表情
                lastMsgContent  = myWebim.getMsgEmoji(lastMsgContent,allFaces); 
                break;
            case webim.MSG_ELEMENT_TYPE.FACE: //表情消息
                lastMsgContent = "[表情]"
                break;
            case webim.MSG_ELEMENT_TYPE.IMAGE: //图片消息
                lastMsgContent = "[图片]"
                break;
            case webim.MSG_ELEMENT_TYPE.SOUND: //语言消息
                lastMsgContent = "[语音]"
                break;
            default:
                break;
        }
        //解析自定义消息
        if(_customMsg && _customMsg.type == webim.MSG_ELEMENT_TYPE.CUSTOM){
            var customMsgData_str = _customMsg.content.data;
            var customMsgData = $.parseJSON(customMsgData_str);

            //用户名：customMsgData.userInfoFirst.name // userInfoFirst表示发送方   userInfoSecond：接收方
            if(customMsgData.userInfoFirst.id == _session_id){
               sessionNick = customMsgData.userInfoFirst.name;//重置姓名
               sessionImage = customMsgData.userInfoFirst.url;//重置头像
            }else if(customMsgData.userInfoSecond.id = _session_id){
                sessionNick = customMsgData.userInfoSecond.name;//重置姓名
                sessionImage = customMsgData.userInfoSecond.url;//重置头像
            }
            
            //解析卡片
            var cardInfo        = customMsgData.cardInfo; 
            sessionJobId        = cardInfo.job_id; //卡片中职位ID
            sessionJobStation   = cardInfo.station == 'undefined' ? cardInfo.station : ""; //卡片中职位名称
            resumeId            = cardInfo.resume_id;//简历编号
        }
        sessionImage = sessionImage != "" ? sessionImage : myWebim.defaultImgUrl; 
        return {'lastMsgContent':lastMsgContent,'msgTime':msgTime,'sessionNick':sessionNick,'sessionImage':sessionImage,'sessionJobId':sessionJobId,'sessionJobStation':sessionJobStation,'resumeId':resumeId,'senderId':senderId,'senderNick':senderNick}
    },
    addNewSession:function(_session_id,msgData){ //添加新的会话
        //添加左边部分
        var sessType        = webim.SESSION_TYPE.C2C; //设置会话类型
        var typeZh          = '私聊';
        var lastMsgContent  = "";
        var sessionNick;
        var sessionImage;
        var sessionJobId;
        var sessionJobStation;
        var resumeId;
        var senderId = "";
        var senderNick = "";
        myWebim.sessionMap[sessType + "_" + _session_id] = true;
        //获取头像
        var UnreadMsgCount = 1; //todo
        var msgTime     = msgData.time;
        var msgItems    = msgData.elems;//长度为2的数组 msgItems[0] 中是消息内容 msgItems[1]是卡片内容  暂时不更新卡片 卡片只在初始化的时候更新
        var _sysMsg     = msgItems[0];//系统消息内容
        var _customMsg  = msgItems[1];//自定义消息内容  
        switch (_sysMsg.type) {
            case webim.MSG_ELEMENT_TYPE.TEXT:
                //文本消息
                //如果最后一条消息发送方是对方
                lastMsgContent  = _sysMsg.content.text;
                var allFaces    = myWebim.getFaceCodeObj();//表情
                lastMsgContent  = myWebim.getMsgEmoji(lastMsgContent,allFaces); 
                break;
            case webim.MSG_ELEMENT_TYPE.FACE: //表情消息
                lastMsgContent = "[表情]"
                break;
            case webim.MSG_ELEMENT_TYPE.IMAGE: //图片消息
                lastMsgContent = "[图片]"
                break;
            case webim.MSG_ELEMENT_TYPE.SOUND: //语言消息
                lastMsgContent = "[语音]"
                break;
            default:
                break;
        }
        //解析自定义消息
        if(_customMsg && _customMsg.type == webim.MSG_ELEMENT_TYPE.CUSTOM){
            var customMsgData_str = _customMsg.content.data;
            var customMsgData = $.parseJSON(customMsgData_str);

            //用户名：customMsgData.userInfoFirst.name // userInfoFirst表示发送方   userInfoSecond：接收方
            if(customMsgData.userInfoFirst.id == _session_id){
               sessionNick = customMsgData.userInfoFirst.name;//重置姓名
               sessionImage = customMsgData.userInfoFirst.url;//重置头像
            }else if(customMsgData.userInfoSecond.id = _session_id){
                sessionNick = customMsgData.userInfoSecond.name;//重置姓名
                sessionImage = customMsgData.userInfoSecond.url;//重置头像
            }
            //解析卡片
            var cardInfo        = customMsgData.cardInfo; 
            sessionJobId        = cardInfo.job_id; //卡片中职位ID
            sessionJobStation   = cardInfo.station == 'undefined' ? cardInfo.station : ""; //卡片中职位名称
            resumeId            = cardInfo.resume_id;//简历编号
            
        }
        sessionImage = sessionImage != "" ? sessionImage : myWebim.defaultImgUrl; 
        var sessionData = {
            SessionType: sessType, //会话类型
            SessionTypeZh: typeZh, //会话类型中文
            SessionId: webim.Tool.formatText2Html(_session_id), //会话id
            SessionNick: webim.Tool.formatText2Html(sessionNick), //会话昵称
            SessionImage: sessionImage, //会话头像
            C2cAccount: webim.Tool.formatText2Html(senderId), //发送者id
            C2cNick: webim.Tool.formatText2Html(senderNick), //发送者昵称
            UnreadMsgCount: msgData.sess._impl.unread, //未读消息数
            MsgSeq: msgData.seq, //消息seq
            MsgRandom: msgData.random, //消息随机数
            MsgTimeStamp: msgTime, //消息时间戳  webim.Tool.formatTimeStamp(item.MsgTimeStamp)
            MsgShow: msgData.MsgShow, //消息内容
            LastMsgContent:lastMsgContent, //最后一条消息内容
            SessionJobId:sessionJobId, //消息中带的职位编号
            SessionJobStation:sessionJobStation,//消息职位名称
            ResumeId:resumeId,//简历编号
            ApplyId:"", //投递编号
            Account_id:senderId, //账号
            IsNewSession:true,
            AreaName:"",
            SalaryText:"",
            JobUrl:""
        };
        //添加好友
        myWebim.frendList.unshift(sessionData);
        //生成聊天窗口
        myWebim.addMyFrend(sessionData,true);
        //新增聊天窗
        myWebim.addChatMsgPart(sessionData,false); //生成消息块
        myWebim.refreshMsgTopTips();
        myWebim._getTextMsgHtml(_session_id,msgData,true);
        myWebim.refressScroll(_session_id);
    },
    //刷新最新消息数量
    initUnreadMsgCount:function(msgList){ 
        var sess;
        var sessMap = webim.MsgStore.sessMap();
        var uncount_json = {};
        for (var i in sessMap) {
            sess = sessMap[i];
            uncount_json[sess.id()] = sess.unread() < 15 ? sess.unread() : 15 ;
            myWebim.refreshUnreadCount(sess.id(),sess.unread()); //刷新未读数量
        }
        //获取历史消息
       var data_list = myWebim.frendList;
        if(data_list.length > 0){
            for(var x in data_list){
                var __session_id = data_list[x].SessionId;
                var count        = myWebim.initMsgList;
                if(uncount_json[__session_id]){
                    count        = uncount_json[__session_id];
                }
                myWebim.getLastC2CHistoryMsgs(__session_id,count,function(){return;});//获取最新的历史消息
            }
        }
        
    },
    bindEvent:function(){
        //绑定事件
        $("#myFrendList").on("click",".frendpart",function(){
            //显示聊天部分
            var _session_id = $(this).attr("data-sessionid");
            myWebim.sess_id = _session_id;
            myWebim.showChartPart(_session_id);
            //将文档滚动到最下面
            myWebim.refressScroll(_session_id);
            
            var selSess = myWebim.getSession();
            webim.setAutoRead(selSess, true, true); //将当前的消息已读上报
            //这种未读数量
            var sessMap = webim.MsgStore.sessMap();
            for (var i in sessMap) {
                var sess = sessMap[i];
                if(sess.id() == _session_id){
                    sess.unread(0);//设置未读数量是0
                 }
            };
            window.history.pushState({"id":'chat'}, '', '#show');   
            myWebim.state = "show";
            myWebim.refreshUnreadCount(_session_id,0); //刷新未读数量
            
        });
        
        //获取历史消息
        $(".chatRightList").on("click",".getMoreMsg",function(){ //获取更多历史信息
            var _session_id = myWebim.sess_id; //当前聊天对象
            //隐藏当前 并且放开转圈
            $(this).hide();
            $(this).next(".dropload-load").show();
            myWebim.getLastC2CHistoryMsgs(_session_id,myWebim.reqMsgCount,myWebim.getMoreMsgCallBack);//获取历史消息
        });
        //语言播放事件
        $(".chatRightList").on("click",".voiceSound",function(){
//            var BROWSER_INFO = myWebim.getBrowserInfo();
//            if (BROWSER_INFO.type == 'ie' && parseInt(BROWSER_INFO.ver) <= 8) {
//                alert('当前浏览器版本过低，不支持播放');
//                return;
//            }
            var _this       = $(this);
            var audioObj    = _this.find("audio")
            var this_audio  = audioObj[0]
            if(_this.hasClass("notPlay")){
                //先暂停其他正在播放的语言  然后开始播放
                myWebim.closeAudio();
                this_audio.currentTime = 0; //重新开始播放
                this_audio.play();
                _this.removeClass("notPlay").addClass("onPlay");
                
            }else{
                this_audio.pause();
                _this.removeClass("onPlay").addClass("notPlay");
            }
        });
        //返回
        $("#mainChat").on("click",".chatBack",function(){
            myWebim.closeChartPart();
            myWebim.closeAudio();//停止播放
            window.history.replaceState({"id":""}, '', 'chat');
            window.history.go(-1);//返回一次历史
            myWebim.state = "hide";
        });
        
        //监听手机back键
        window.onpopstate = function(event){
            if(myWebim.state == "hide"){
                
            }else{
                myWebim.closeChartPart();
                myWebim.closeAudio();//停止播放
                window.history.replaceState({"id":""}, '', 'chat');
            }
            
        }
        
        //放大图片
        //图片放大
        $(".chatRightList").on("click","._showImage",function(){ //获取更多历史信息
            var big_scr = $(this).attr("data-big-src");
            var bigImgObj =  $('<div class="bigImagShow">'
                                +'<div class="m_masterchat"></div>'
                                +'<div class="chat_img_pop">'
                                    +'<div class="chat_popx">'
                                       +'<img src="'+big_scr+'" />'
                                    +'</div>'
                                +'</div>');
            bigImgObj.find(".m_masterchat").on("click",function(){
                $(this).off();
                $("body").find(".bigImagShow").remove();;
            });
            $(document).find("body").append(bigImgObj);
        });
        
        $(".chat_msg_pox").on("click",'.chat_btn',function(){
            //发送不同消息
            var msgtosend = $('.chat_msg_pox .chatTextarea').val(); //文本内容
            if (msgtosend.length < 1) {
                alert("发送的消息不能为空!");
                return;
            }
            var maxLen = webim.MSG_MAX_LENGTH.C2C;
            var msgLen = webim.Tool.getStrBytes(msgtosend);
            var errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
            if (msgLen > maxLen) {
                alert(errInfo);
                return;
            }
            //解析消息中的表情 todo
            myWebim.addOneMsg(msgtosend);
            $('.chatTextarea').blur();
        });
        //关闭聊天
        $(".chat_msg_pox").on("focus",".chatTextarea",function(){
            $(".chat_msg_pox .chat_face ").removeClass('chatPhiz_active');
            $("#facebox").hide();
            $("#facebox").remove();
        });
        //关闭页面
        window.addEventListener("beforeunload", function(event) {
            //如果已经离线了
            if(myWebim.onLineStatus == "on"){
                //去掉cookie
                 myWebim.setCookie("chatLoginStatus","false");
            }
        });
        $(".mainChatPart ").on("click",".chat_record",function(){
            if($(".chat_face ").hasClass("chatPhiz_active")){
                $("#facebox").hide();
                $("#facebox").remove();
                $(".chat_face ").removeClass("chatPhiz_active");
            }
        })
        
    },
    audioEnd:function(obj){ //当语音播放结束的时候
        $(".charDgScrollHeight").find(".onPlay").removeClass("onPlay").addClass("notPlay");
    },
    closeAudio:function(){ //关闭当前正在播放的语音
        var oldObj = $(".charDgScrollHeight").find(".onPlay audio"); //关闭正在播放的
        if(oldObj.length > 0){
            var old_audio = oldObj[0];
            old_audio.pause();
            $(".charDgScrollHeight").find(".onPlay").removeClass("onPlay").addClass("notPlay");
        }
    },
    //显示当前聊天
    showChartPart:function(sess_id){
        var msgPart         = myWebim.getSessionPart(sess_id);
        var session_data    = myWebim.getSessDataBySessId(sess_id);
        $("#mainChat .title").html(session_data.SessionNick);
        $("#myFrendList").hide();
        $(".psgSeekHead").hide();
       
        $("#mainChat").find(msgPart).removeClass("hiddenPart");
        
        $("#mainChat").slideDown();
        //$("#mainChat").stop().animate({width:"100%"},1000);
//        
       //$("#mainChat").find(msgPart).stop().animate({height:"100%"},1000);
    },
    closeChartPart:function(){
        var sess_id = myWebim.sess_id;
        myWebim.sess_id = "";
        var msgPart = myWebim.getSessionPart(sess_id);
        $("#mainChat").hide();
        $("#mainChat").find(msgPart).addClass("hiddenPart");
        $("#myFrendList").show();
        $(".psgSeekHead").show();
    },
    //获取历史消息
    getLastC2CHistoryMsgs:function(_sessionId,reqMsgCount,callback){
        var lastMsgTime     = 0;//拉去消息时间
        var msgKey          = '';//消息key
        var complete        = 0;//表示还有
        var part            = myWebim.getSessionPart(_sessionId);
        var scrollPart      = part.find(".charDgScrollHeight");//滚动框
        //当前文档高度
        var scrollHeight    = scrollPart.height();
        var lastMsgMap = myWebim.lastMsgMap;
        if(lastMsgMap[_sessionId]){
            lastMsgTime = lastMsgMap[_sessionId].lastMsgTime;
            msgKey      = lastMsgMap[_sessionId].msgKey;
            complete    = lastMsgMap[_sessionId].complete;
        }
        //获取消息列表
        var options = {
            'Peer_Account': _sessionId, //好友帐号
            'MaxCnt':reqMsgCount, //拉取消息条数
            'LastMsgTime': lastMsgTime, //最近的消息时间，即从这个时间点向前拉取历史消息
            'MsgKey': msgKey
        };
        var MsgList = [];
        webim.getC2CHistoryMsgs(
            options,
            function (resp) {
                var _complete   = complete;
                var complete    = resp.Complete;//是否还有历史消息可以拉取，1-表示没有，0-表示有
                var retMsgCount = resp.MsgCount;//返回的消息条数，小于或等于请求的消息条数，小于的时候，说明没有历史消息可拉取了
                if(resp.MsgList.length == 0) {
                    //todo 没有历史消息了
                    if(_complete == 0){
                        //隐藏查看更多
                         var msgPart         = myWebim.getSessionPart(_sessionId); //获取消息块
                         msgPart.find(".getMoreMsg").hide();
                    }
                }
                myWebim.lastMsgMap[_sessionId] = {//保留服务器返回的最近消息时间和消息Key,用于下次向前拉取历史消息
                    'lastMsgTime': resp.LastMsgTime,
                    'msgKey': resp.MsgKey,
                    'complete':complete,
                    "scrollHeight":scrollHeight //文档高度
                };
                MsgList = resp.MsgList; 
                myWebim.addMsgHistory(_sessionId,MsgList);
                if(typeof(callback) !="undefined"){
                    callback(_sessionId);
                }
            },function(resp){
                //错误
                alert(resp.ErrorInfo);
                if(typeof(callback) !="undefined"){
                    callback(_sessionId);
                }
                return;
            }
        );
    },
    //刷新未读消息数量
    refreshUnreadCount:function(session_id,unreadCount){ 
        //更新个数
        if(unreadCount > 0){
            var part = $("#myFrendList").find("."+myWebim.frendFre+session_id);
            part.find(".notReadMsgCount ").html(unreadCount).show();
        }else{
            var part = $("#myFrendList").find("."+myWebim.frendFre+session_id);
            part.find(".notReadMsgCount ").html(unreadCount).hide();
        }
    },
    addOneMsg:function(msgtosend){ //发送单条消息
        if(msgtosend == ""){
            return;
        }
        var newMsgArray = myWebim.sendMsgEmoji(msgtosend);
        var  _msgtosend         = newMsgArray[1];//发送的消息
        var _msgtoshow          = newMsgArray[0];//展示的消息
         
        var     selType         = webim.SESSION_TYPE.C2C;
        var     selToID         = myWebim.sess_id;
        var     sess_data       = myWebim.getSessDataBySessId(selToID);
        var     friendHeadUrl   = sess_data.SessionImage;
        var  selSess = new webim.Session(selType, selToID, selToID, friendHeadUrl, Math.round(new Date().getTime() / 1000));
       
        var isSend  = true;//是否为自己发送
        var seq     = -1;//消息序列，-1表示 SDK 自动生成，用于去重
        var random  = Math.round(Math.random() * 4294967296);//消息随机数，用于去重
        var msgTime = Math.round(new Date().getTime() / 1000);//消息时间戳
        var subType = webim.C2C_MSG_SUB_TYPE.COMMON;//消息子类型
        var loginInfo   = myWebim.loginInfo;
        var msg         = new webim.Msg(selSess, isSend, seq, random, msgTime, loginInfo.identifier, subType, loginInfo.identifierNick); 
        var text_obj = new webim.Msg.Elem.Text(_msgtosend);
            msg.addText(text_obj);//添加文本消息
            //添加自定义消息
            var customMsg = myWebim.getCustomMsg(selToID);
//            $.parseJSON(customMsgData_str);
            //蒋json 转换成字符串
            var customMsg_string = JSON.stringify(customMsg)
            var custom_obj = new webim.Msg.Elem.Custom(customMsg_string, "", "");
            msg.addCustom(custom_obj);
            //发送消息
            webim.sendMsg(msg, function (resp) {
                //聊天框中添加消息
                myWebim.addMsgToPart(selToID,_msgtoshow,msgTime);
                //聊天信息传进服务器
                myWebim.addMsgToServer(selToID);
           }, function (err) {
               alert(err.ErrorInfo);
               $("#send_msg_text").val('');
           });
    },
    addMsgToServer:function(sess_id){
        var  sess_data  = myWebim.getSessDataBySessId(sess_id);
        var  job_id     = sess_data.SessionJobId;
        var  sendUrl    = this.sendMsgUrl+"?job_id="+job_id+"&sess_id="+sess_id;
        $.getJSON(sendUrl,function(result){})
    },
    addMsgToPart:function(session_id,msgContent,msgTime){
        if(msgContent == ""){
            return false;
        }
        var _msgTime        = myWebim.timeToDateV3(msgTime);
        var sessionMsgPart  = myWebim.getSessionPart(session_id);
        var scrollPart      = sessionMsgPart.find(".chat_record");
        var LoginSessionId  = myWebim.getLoginSessId();//登录用户
        var LoginImg        = myWebim.getLoginSessImg();//登录用户头像
        
        var msgHtml = "";
        var dialogMsgTimeObj = sessionMsgPart.find(".dialogTime:last");
        var dialogMsgTime    = dialogMsgTimeObj.attr("data-time");
        var _show_time       = true;
        if(typeof dialogMsgTime !="undefined"){
            var _time_diff = msgTime - dialogMsgTime;
           if(_time_diff < 120){
               _show_time = false //隐藏上一条消息时间
           }
        }
        var _timeStyle = "";
        if(!_show_time){
            _timeStyle = "display:none";
        }
       //添加消息
        var msgHtml = '<span class="dialogTime" style="'+_timeStyle+'" data-time="'+msgTime+'">'+_msgTime+'</span>'
                    +'<div class="dialogMsgMe">'
                        +'<img src="'+LoginImg+'" class="dialog_img" />'
                        +'<span class="chat_icon_r"></span>'
                        +'<div class="dialogMtit">'+ msgContent + '</div>'
//                                        +'<span class="dialogUnread readStatus '+readStatusClass+'">未读</span>' //只有自己的消息才需要判断已读未读
                    +'</div>';
        sessionMsgPart.find(".charDgScrollHeight").append(msgHtml);
        //跳到文档底部
        $('.chat_msg_pox .chatTextarea').val("");//清空文本框
        var docmentPart     = scrollPart.find(".charDgScrollHeight");//滚动框
        var scrollHeight    = docmentPart.height();//当前高度
        scrollPart.scrollTop(scrollHeight);
        myWebim.addMsgToFrend(session_id,msgContent,_msgTime)
    },
    addMsgToFrend:function(_session_id,msgContent,_msgTime){
        var frendPart   = myWebim.getFrendPart(_session_id);
        //console.log(_msgData.lastMsgContent);
        frendPart.find(".msgContent").html(msgContent);
        frendPart.find(".msg_time").html(_msgTime);
    },
    sendMsgEmoji:function(msgtosend){ //解析发送消息中的表情
        var newMsgArray     =  msgtosend.split(/(\[em_[A-Za-z\u4E00-\u9FA5\uF900-\uFA2D]+?\])/);
        var path            = /^\[em_[A-Za-z\u4E00-\u9FA5\uF900-\uFA2D]+?\]$/;
        var newMsgString    = "";
        var sendMsgString   = "";
        var allFaces        = myWebim.getFaceNickObj();
        if(newMsgArray.length > 0){
            for(var i in newMsgArray){
                if(allFaces[newMsgArray[i]]){
                    var emoji       = allFaces[newMsgArray[i]];
                    var imgString   = '<img class="im_emojiImae" src="'+myWebim.facePath+emoji.name+'"/>';
                    var sendString  = emoji.code;
                    newMsgString = newMsgString + imgString;
                    sendMsgString = sendMsgString + sendString;
                }else{
                    newMsgString = newMsgString +newMsgArray[i];
                    sendMsgString = sendMsgString + newMsgArray[i];
                }
            }
        }
       
	newMsgString = newMsgString.replace(/\n/g,'<br/>'); //替换换行
        return [newMsgString,sendMsgString];
    },
    getFaceNickObj:function(){ //Nick表情
        if(myWebim.allFaceNickObj.length > 0){
            return myWebim.allFaceNickObj;
        }
        var allObj = this.getFaceElements();
        var newObj = {};
        for(var i=0;i<allObj.length;i++){
            var obj = allObj[i];
            newObj[obj.nick] = obj;
        }
         myWebim.allFaceNickObj = newObj;
        return newObj;
    },
    
    getCustomMsg:function(sess_id){
        var  logininfo  = myWebim.loginInfo;
        var  sess_data  = myWebim.getSessDataBySessId(sess_id);
        var customMsg = {};
        //自定义消息
        //发送人
        var userInfoFirst = {"name":logininfo.identifierNick,"url":logininfo.headurl,"id":logininfo.identifier};
        //接受人
        var userInfoSecond = {"name":sess_data.SessionNick,"url":sess_data.SessionImage,"id":sess_data.SessionId}; //ResumeId
        // NSDictionary *chatHeadDicInfos = @{@"chatCardType":@"1",@"in_flag":@"",@"out_flag":@"",@"job_id":rsumeJobId,@"resume_id":rsumeId,@"apply_id":resumeApplyId,@"activity_id":rsumeInviteId};
        //卡片信息  "company_id":"989786","job_id":"12359853"  chatCardType
        //职位信息卡片
        var cardInfo = {"chatCardType":"1","job_id":sess_data.SessionJobId.toString(),"resume_id":sess_data.ResumeId.toString(),"station":sess_data.sessionJobStation,"in_flag":"","out_flag":"","activity_id":"","apply_id":""};

        return {"userInfoFirst":userInfoFirst,"userInfoSecond":userInfoSecond,"cardInfo":cardInfo};
    },
    //获取朋友部分
    getFrendPart:function(_sessionId){
        return $("#myFrendList").find("."+myWebim.frendFre+_sessionId);
    },
    getSessionPart:function(_sessionId){
        return $(".chatRightList").find("."+myWebim.msgFre+_sessionId);
    },
    getThisSessionPart:function(){ //获取当前聊天块
        var _sessionId = myWebim.sess_id;
        return $(".chatRightList").find("."+myWebim.msgFre+_sessionId);
    },
    getLoginSessImg:function(){ //获取登录账号头像
        return this.loginInfo.headurl;
    },
    getSession:function(){ //获取当前会话  和 设置当前会话
        var     selType         = webim.SESSION_TYPE.C2C;
        var     selToID         = myWebim.sess_id;
        var     sess_data       = myWebim.getSessDataBySessId(selToID);
        var     friendHeadUrl   = sess_data.SessionImage;
        var     selSess = new webim.Session(selType, selToID, selToID, friendHeadUrl, Math.round(new Date().getTime() / 1000));
        myWebim.selSess = selSess;
        return selSess;
    },
    getSessDataBySessId:function(_sessionId){ //获取session的信息
        var data = myWebim.frendList;
        for(var n in data){
            var _data = data[n];
           if(_data.SessionId == _sessionId){
               return _data;
           }
        }
        return null;
    },
    getLoginSessId:function(){ //获取当前登录的SessId
        return this.loginInfo.identifier;
    },
    timeToDate:function(time){ //将时间戳转换为友好的时间
        // 获取当前时间戳
         // 获取当前时间戳
        var currentTime  = new Date();
        var now          = currentTime.getTime();
        var preTime       = new Date(now - 24*60*60*1000); //昨天
        var msgTime       = new Date(parseInt(time) * 1000);
        
        var _month        = myWebim.dayReplay(currentTime.getMonth()+1);
        var _day          = myWebim.dayReplay(currentTime.getDate());
        var _currentDay   = _month+"-"+_day;
        
        var _preMonth     = myWebim.dayReplay(preTime.getMonth()+1);
        var _preDay       = myWebim.dayReplay(preTime.getDate());
        var _preDate      = _preMonth+"-"+_preDay;
        
        var _msgMonth     = myWebim.dayReplay(msgTime.getMonth()+1);
        var _msgDay       = myWebim.dayReplay(msgTime.getDate());
        var _msgDate     = _msgMonth+"-"+_msgDay;
        
        var _msgHours     = myWebim.dayReplay(msgTime.getHours());
        var _msgMinite    = myWebim.dayReplay(msgTime.getMinutes());

        if(_msgDate == _currentDay){
            return _msgHours+":"+_msgMinite;
        }else if(_msgDate == _preDate){
            return "昨天 ";
        }else{
            return _msgDate
        }
    },
    timeToDateV2:function(time){
        // 获取当前时间戳
        var currentTime  = new Date();
        var now          = currentTime.getTime();
        var preTime       = new Date(now - 24*60*60*1000); //昨天
        var msgTime       = new Date(parseInt(time) * 1000);
        
        var _month        = currentTime.getMonth()+1;
        var _day          = currentTime.getDate();
        var _currentDay   = _month+"-"+_day;
        
        var _preMonth     = preTime.getMonth()+1;
        var _preDay       = preTime.getDate;
        var _preDate      = _preMonth+"-"+_preDay;
        
        var _msgMonth     = msgTime.getMonth()+1;
        var _msgDay       = msgTime.getDate;
        var _msgDate     = _msgMonth+"-"+_msgDay;
        
        var _msgHours     = msgTime.getHours();
        var _msgMinite    = msgTime.getMinutes();
        
        
        if(_msgDate == _currentDay){
            return _msgHours+":"+_msgMinite;
        }else if(_msgDate == _preDate){
            return "昨天 "+_msgHours+":"+_msgMinite;
        }else{
            return _msgDate + " "+_msgHours+":"+_msgMinite;
        }
    },
    dayReplay:function(day){
        if(parseInt(day) <= 9){
            return "0"+day;
        }
        return day;
    },
    timeToDateV3:function(time){
        var currentTime  = new Date();
        var now          = currentTime.getTime();
        var preTime       = new Date(now - 24*60*60*1000); //昨天
        var msgTime       = new Date(parseInt(time) * 1000);
        
        var _month        = myWebim.dayReplay(currentTime.getMonth()+1);
        var _day          = myWebim.dayReplay(currentTime.getDate());
        var _currentDay   = _month+"-"+_day;
        
        var _preMonth     = myWebim.dayReplay(preTime.getMonth()+1);
        var _preDay       = myWebim.dayReplay(preTime.getDate());
        var _preDate      = _preMonth+"-"+_preDay;
        
        var _msgMonth     = myWebim.dayReplay(msgTime.getMonth()+1);
        var _msgDay       = myWebim.dayReplay(msgTime.getDate());
        var _msgDate     = _msgMonth+"-"+_msgDay;
        
        var _msgHours     = myWebim.dayReplay(msgTime.getHours());
        var _msgMinite    = myWebim.dayReplay(msgTime.getMinutes());

        if(_msgDate == _currentDay){
            return _msgHours+":"+_msgMinite;
        }else if(_msgDate == _preDate){
            return "昨天 "+_msgHours+":"+_msgMinite;
        }else{
            return _msgDate + " "+_msgHours+":"+_msgMinite;
        }
    },
    getFaceCodeObj:function(){ //Code表情
        if(myWebim.allFaceCodeObj.length > 0){
            return myWebim.allFaceCodeObj;
        }
        var allObj = this.getFaceElements();
        var newObj = {};
        for(var i=0;i<allObj.length;i++){
            var obj = allObj[i];
            newObj[obj.code] = obj;
        }
        myWebim.allFaceCodeObj = newObj;
        return newObj;
    },
    scrollEvent:function(_session_id){ //滚动条事件
        //获取当前消息框
        var msgPart     = myWebim.getSessionPart(_session_id);
        var scrollPart  = msgPart.find(".chat_record");
        
        var complete        = 0;//表示还有
        var lastMsgMap = myWebim.lastMsgMap;
        if(lastMsgMap[_session_id]){
            complete    = lastMsgMap[_session_id].complete;
        } //判断还有历史消息
        
        //获取当前滚动条位置
        if(scrollPart.scrollTop() == 0 && complete == 0){
            myWebim.getLastC2CHistoryMsgs(_session_id,myWebim.reqMsgCount,myWebim.getMoreMsgCallBack);//获取历史消息
        }
    },
    getMsgEmoji:function(msgtosend,allFaces){ //解析获取消息中的表情
        var newMsgArray     =  msgtosend.split(/(\[[0-9A-Za-z]+?\])/);
        var path            = /^\[[0-9A-Za-z]+?\]$/;
        var newMsgString    = "";
        if(newMsgArray.length > 0){
            for(var i in newMsgArray){
                if(allFaces[newMsgArray[i]]){
                    var emoji       = allFaces[newMsgArray[i]];
                    var imgString   = '<img class="im_emojiImae" src="'+myWebim.facePath+emoji.name+'"/>';
                    newMsgString = newMsgString + imgString;
                }else{
                    newMsgString = newMsgString +newMsgArray[i];
                }
            }
        }
	newMsgString = newMsgString.replace(/\n/g,'<br/>'); //替换换行
        return newMsgString;
    },
    getMsgEmojiV2:function(msgtosend,allFaces){ //解析获取消息中的表情
        var newMsgArray     =  msgtosend.split(/(\[[0-9A-Za-z]+?\])/);
        var path            = /^\[[0-9A-Za-z]+?\]$/;
        var newMsgString    = "";
        if(newMsgArray.length > 0){
            for(var i in newMsgArray){
                if(allFaces[newMsgArray[i]]){
                    var emoji       = allFaces[newMsgArray[i]];
                    var imgString   = emoji.nick;
                    newMsgString = newMsgString + imgString;
                }else{
                    newMsgString = newMsgString +newMsgArray[i];
                }
            }
        }
       
	//newMsgString = newMsgString.replace(/\n/g,'<br/>'); //替换换行
        return newMsgString;
    },
    getFaceElements:function(){ //获取表情图标
        var face = [
                    {"name":"aa0001hb.png","code":"[aa0001hb]","nick":"[em_哈哈]"},
                    {"name":"aa0002hb.png","code":"[aa0002hb]","nick":"[em_吐舌]"},
                    {"name":"aa0003hb.png","code":"[aa0003hb]","nick":"[em_沉思]"},
                    {"name":"aa0004hb.png","code":"[aa0004hb]","nick":"[em_色]"},
                    {"name":"aa0005hb.png","code":"[aa0005hb]","nick":"[em_酷]"},
                    {"name":"aa0006hb.png","code":"[aa0006hb]","nick":"[em_假笑]"},
                    {"name":"aa0007hb.png","code":"[aa0007hb]","nick":"[em_亲嘴]"},
                    {"name":"aa0008hb.png","code":"[aa0008hb]","nick":"[em_调皮]"},
                    {"name":"aa0009hb.png","code":"[aa0009hb]","nick":"[em_开心]"},
                    {"name":"aa0010hb.png","code":"[aa0010hb]","nick":"[em_不开心]"},
                    {"name":"aa0011hb.png","code":"[aa0011hb]","nick":"[em_不会吧]"},
                    {"name":"aa0012hb.png","code":"[aa0012hb]","nick":"[em_叹气]"},
                    {"name":"aa0013hb.png","code":"[aa0013hb]","nick":"[em_难受]"},
                    {"name":"aa0014hb.png","code":"[aa0014hb]","nick":"[em_微笑]"},
                    {"name":"aa0015hb.png","code":"[aa0015hb]","nick":"[em_流泪]"},
                    {"name":"aa0016hb.png","code":"[aa0016hb]","nick":"[em_吃惊]"},
                    {"name":"aa0017hb.png","code":"[aa0017hb]","nick":"[em_震惊]"},
                    {"name":"aa0018hb.png","code":"[aa0018hb]","nick":"[em_大笑]"},
                    {"name":"aa0019hb.png","code":"[aa0019hb]","nick":"[em_呲牙]"},
                    {"name":"aa0020hb.png","code":"[aa0020hb]","nick":"[em_笑哭]"},
                    {"name":"aa0021hb.png","code":"[aa0021hb]","nick":"[em_欢喜]"},
                    {"name":"aa0022hb.png","code":"[aa0022hb]","nick":"[em_冷汗]"},
                    {"name":"aa0023hb.png","code":"[aa0023hb]","nick":"[em_闭眼]"},
                    {"name":"aa0024hb.png","code":"[aa0024hb]","nick":"[em_光环]"},
                    {"name":"aa0025hb.png","code":"[aa0025hb]","nick":"[em_撇眼]"},
                    {"name":"aa0026hb.png","code":"[aa0026hb]","nick":"[em_无脸]"},
                    {"name":"aa0027hb.png","code":"[aa0027hb]","nick":"[em_无语]"},
                    {"name":"aa0028hb.png","code":"[aa0028hb]","nick":"[em_汗]"},
                    {"name":"aa0029hb.png","code":"[aa0029hb]","nick":"[em_皱眉]"},
                    {"name":"aa0030hb.png","code":"[aa0030hb]","nick":"[em_傲慢]"},
                    {"name":"aa0031hb.png","code":"[aa0031hb]","nick":"[em_难受]"},
                    {"name":"aa0032hb.png","code":"[aa0032hb]","nick":"[em_爱你]"},
                    {"name":"aa0033hb.png","code":"[aa0033hb]","nick":"[em_尴尬]"},
                    {"name":"aa0034hb.png","code":"[aa0034hb]","nick":"[em_发怒]"},
                    {"name":"aa0035hb.png","code":"[aa0035hb]","nick":"[em_累]"},
                    {"name":"aa0036hb.png","code":"[aa0036hb]","nick":"[em_生气]"},
                    {"name":"aa0037hb.png","code":"[aa0037hb]","nick":"[em_害羞]"},
                    {"name":"aa0038hb.png","code":"[aa0038hb]","nick":"[em_害怕]"},
                    {"name":"aa0039hb.png","code":"[aa0039hb]","nick":"[em_困惑]"},
                    {"name":"aa0040hb.png","code":"[aa0040hb]","nick":"[em_冷汗]"},
                    {"name":"aa0041hb.png","code":"[aa0041hb]","nick":"[em_惊恐]"},
                    {"name":"aa0042hb.png","code":"[aa0042hb]","nick":"[em_刺瞎]"},
                    {"name":"aa0043hb.png","code":"[aa0043hb]","nick":"[em_脸红]"},
                    {"name":"aa0044hb.png","code":"[aa0044hb]","nick":"[em_困]"},
                    {"name":"aa0045hb.png","code":"[aa0045hb]","nick":"[em_瞎子]"},
                    {"name":"aa0046hb.png","code":"[aa0046hb]","nick":"[em_哑巴]"},
                    {"name":"aa0047hb.png","code":"[aa0047hb]","nick":"[em_口罩]"},
                    {"name":"aa0048hb.png","code":"[aa0048hb]","nick":"[em_恶魔]"},
                    {"name":"aa0049hb.png","code":"[aa0049hb]","nick":"[em_外星人]"},
                    {"name":"aa0050hb.png","code":"[aa0050hb]","nick":"[em_鬼脸]"},
                    {"name":"aa0051hb.png","code":"[aa0051hb]","nick":"[em_天使]"},
                    {"name":"aa0052hb.png","code":"[aa0052hb]","nick":"[em_全家]"},
                    {"name":"aa0053hb.png","code":"[aa0053hb]","nick":"[em_男女]"},
                    {"name":"aa0054hb.png","code":"[aa0054hb]","nick":"[em_便便]"},
                    {"name":"aa0055hb.png","code":"[aa0055hb]","nick":"[em_捂嘴]"},
                    {"name":"aa0056hb.png","code":"[aa0056hb]","nick":"[em_猪]"},
                    {"name":"aa0057hb.png","code":"[aa0057hb]","nick":"[em_马]"},
                    {"name":"aa0058hb.png","code":"[aa0058hb]","nick":"[em_狗]"},
                    {"name":"aa0059hb.png","code":"[aa0059hb]","nick":"[em_阴险]"},
                    {"name":"aa0060hb.png","code":"[aa0060hb]","nick":"[em_捂眼]"},
                    {"name":"aa0061hb.png","code":"[aa0061hb]","nick":"[em_捂耳朵]"},
                    {"name":"aa0062hb.png","code":"[aa0062hb]","nick":"[em_打你]"},
                    {"name":"aa0063hb.png","code":"[aa0063hb]","nick":"[em_手掌]"},
                    {"name":"aa0064hb.png","code":"[aa0064hb]","nick":"[em_耶]"},
                    {"name":"aa0065hb.png","code":"[aa0065hb]","nick":"[em_赞]"},
                    {"name":"aa0066hb.png","code":"[aa0066hb]","nick":"[em_OK]"},
                    {"name":"aa0067hb.png","code":"[aa0067hb]","nick":"[em_拳头]"},
                    {"name":"aa0068hb.png","code":"[aa0068hb]","nick":"[em_鄙视]"},
                    {"name":"aa0069hb.png","code":"[aa0069hb]","nick":"[em_鼓掌]"},
                    {"name":"aa0070hb.png","code":"[aa0070hb]","nick":"[em_拜托]"},
                    {"name":"aa0071hb.png","code":"[aa0071hb]","nick":"[em_太阳]"},
                    {"name":"aa0072hb.png","code":"[aa0072hb]","nick":"[em_笔]"} 
                ];
        return face
    },
    setCookie:function(name,value){
        document.cookie = name + '=' + escape(value);
    },
    getCookie:function(name){
        var cookieValue = '';
        var search = name + '=';
        if (document.cookie.length > 0){
            var offset = document.cookie.indexOf(search)
            if (offset != -1){
                offset += search.length;
                var end = document.cookie.indexOf(';', offset);
                if (end == -1) end = document.cookie.length;
                cookieValue = unescape(document.cookie.substring(offset, end));
            }
        }
        return cookieValue;
    },
}