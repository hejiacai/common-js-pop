var myWebim = {
    nim: {},  //网易云信对象
    nimType: 'p2p', //网易云信点对点的会话前缀
    nimType1: 'p2p-', //网易云信点对点的会话前缀
    companyInfo: null,
    currentPersonInfo: null,
    //设置账号信息
    setBaseInfo: function (companyInfo, currentPersonInfo) {
        myWebim.companyInfo = companyInfo;
        myWebim.currentPersonInfo = currentPersonInfo;
        //发送账号
        // var userInfoCompany = {"name": "{/$swy_info['nick_name']/}", "url": "{/$swy_info['photo']/}", "id": "{/$swy_info['accid']/}"};
        //接受人
        // var userInfoPerson = {"name": "{/$swy_person_info['nick_name']/}", "url": "{/$swy_person_info['photo']/}", "id": "{/$swy_person_info['accid']/}"}; //ResumeId
    },
    setNim: function (nim) {
        myWebim.nim = nim;
    },
    sendNormalMsg: function (msgtosend) {
        var cardInfo = {
            "chatCardType": "1",
        };
        var nimMsgCustom = {
            "userInfoFirst": myWebim.companyInfo,
            "userInfoSecond": myWebim.currentPersonInfo,
            "cardInfo": cardInfo
        };
        var msg = nim.sendText({
            scene: 'p2p',
            to: myWebim.currentPersonInfo.id,
            custom: nimMsgCustom,
            text: msgtosend,
            done: function sendMsgDone(error, msg) {
                console.log('error', error);
                console.log('msg', msg);
                // 此处为回调消息事件，仅仅通知开发者，消息是否发送成功
            }
        });
        console.log('var msg', msg);
    }

}