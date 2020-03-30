//app js 接口
/******************企业js*******************/
window.webkitJsAppCompany = {
    //拨打电话
    callPhone: function (data) {
        AndroidLocalInstance.callPhone(data);
    },

    //头部返回按钮
    commonReturn: function (data) {
        AndroidLocalInstance.commonReturn(data);
    },

    //企业推广金
    moneyManager: function (data) {
        AndroidLocalInstance.moneyManager(data);
    },

    //简历详情备注
    resumeDetailMark: function (data) {
        AndroidLocalInstance.resumeDetailMark(data);
    },

    //简历详情备注
    HBEChatWithUserIdAndUserNameAndUserImgPathAndJsonStr: function (userId, userName, userImgPath, jsonStr) {
        AndroidLocalInstance.HBEChatWithUserIdAndUserNameAndUserImgPathAndJsonStr(userId, userName, userImgPath, jsonStr);
    },

    //活动咨询
    HBEHRChatWithUserIdAndUserNameAndUserImgPathAndJsonStr: function (userId, userName, userImgPath, jsonStr) {
        AndroidLocalInstance.HBEHRChatWithUserIdAndUserNameAndUserImgPathAndJsonStr(userId, userName, userImgPath, jsonStr);
    },

    //活动咨询
    saveAccountPhoto: function (data) {
        AndroidLocalInstance.saveAccountPhoto(data);
    },

    //消息面打扰
    setChatNotify: function (data) {
        AndroidLocalInstance.setChatNotify(data);
    },

    //分享功能
    shareUrlAndTitleAndContentAndHeadImageUrlAndType: function (url, title, content, headImageUrl, type) {
        AndroidLocalInstance.shareUrlAndTitleAndContentAndHeadImageUrlAndType(url, title, content, headImageUrl, type);
    },

    //发布职位
    releasePosition: function (result, shareArray) {
        AndroidLocalInstance.releasePosition(result, shareArray);
    },

    //是否绑定单位账号
    isBindCompnyAccount: function (data) {
        AndroidLocalInstance.isBindCompnyAccount(data);
    },

    //去学习中心
    goLearnActivity: function (data) {
        AndroidLocalInstance.goLearnActivity(data);
    },

    //讲师主页
    goLecturerInfoActivity: function (data) {
        AndroidLocalInstance.goLecturerInfoActivity(data);
    },

    //上传广告图片
    commonUploadPosterImage: function (data) {
        AndroidLocalInstance.commonUploadPosterImage(data);
    },

    //退出登录
    loginCommonOut: function () {
        AndroidLocalInstance.loginCommonOut();
    },

    //提示流量还是wifi
    videoPlayEnviroment: function () {
        AndroidLocalInstance.videoPlayEnviroment();
    },

    //打开pdf
    openPdf: function (data) {
        AndroidLocalInstance.openPdf(data);
    },

    //APP回调事件
    posterReturnData: function (data) {
        AndroidLocalInstance.posterReturnData(data);
    },
};
/******************求职者js*******************/
window.webkitJsAppPerson = {
    //拨打电话
    callPhone: function (data) {
        androidShare.callPhone(data);
    },

    //头部返回按钮
    commonReturn: function (data) {
        androidShare.commonReturn(data);
    },

    //分享
    shareUrlAndTitleAndContent: function (url, title, content) {
        androidShare.shareUrlAndTitleAndContent(url, title, content);
    },

    //分享
    shareUrlAndTitleAndContentAndLogoPath: function (url, title, content, logoPath) {
        androidShare.shareUrlAndTitleAndContentAndLogoPath(url, title, content, logoPath);
    },

    //显示分享按钮 并传输分享数据
    shareShowUrlTitleContentLogoPath: function (is_whoe, link, imgUrl, title, desc) {
        androidShare.isShowShareButton(is_whoe, link, imgUrl, title, desc);
    },

    //职位详情
    PushToJobDetailVCWithJobFlagAndIsRecommend: function (jobFlag, isRecommend) {
        androidShare.PushToJobDetailVCWithJobFlagAndIsRecommend(jobFlag, isRecommend);
    },

    //职位详情
    PushToJobDetailVCWithJobFlagAndIsRecommendAndFromSchool: function (jobFlag, isRecommend, fromSchool) {
        androidShare.PushToJobDetailVCWithJobFlagAndIsRecommendAndFromSchool(jobFlag, isRecommend, fromSchool);
    },

    //单位详情
    PushToCompanyVCWithCompanyFlagAndShowJobListAndFromSchool: function (companyFlag, showJobList, fromSchool) {
        androidShare.PushToCompanyVCWithCompanyFlagAndShowJobListAndFromSchool(companyFlag, showJobList, fromSchool);
    },

    //反馈给客服
    goFeedBackActivity: function () {
        androidShare.goFeedBackActivity();
    },

    //反馈给客服
    goShowHeadWebView: function (data) {
        androidShare.goShowHeadWebView(data);
    },

    //我的面试申请
    goVideoInterviewResultList: function () {
        androidShare.goVideoInterviewResultList();
    },

    //我的面试申请
    goMessageCenter: function () {
        androidShare.goMessageCenter();
    },

    //单位详情
    goVideoInterviewCompanyDetailActivity: function (companyFlag, sid) {
        androidShare.goVideoInterviewCompanyDetailActivity(companyFlag, sid);
    },

    //职位详情
    goVideoInterviewJobDetailActivity: function (job_flag, sid) {
        androidShare.goVideoInterviewJobDetailActivity(job_flag, sid);
    },

    //完善简历
    perfectResume: function (data) {
        androidShare.perfectResume(data);
    },

    //完善简历
    downloadBuleApp: function () {
        androidShare.downloadBuleApp();
    },

    //打开app聊一聊
    gainHuiBoServiceIM: function (rong_id, rong_user_name, rong_photo) {
        androidShare.gainHuiBoServiceIM(rong_id, rong_user_name, rong_photo);
    },
};
