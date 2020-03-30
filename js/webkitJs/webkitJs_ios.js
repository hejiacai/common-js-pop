//app js 接口
/******************企业js*******************/
window.webkitJsAppCompany = {
    //拨打电话
    callPhone: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.callPhone(data);
        } else {
            window.webkit.messageHandlers.callPhone.postMessage(data);
        }
    },

    //头部返回按钮
    commonReturn: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.commonReturn(data);
        } else {
            window.webkit.messageHandlers.commonReturn.postMessage(data);
        }
    },

    //企业推广金
    moneyManager: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.moneyManager(data);
        } else {
            window.webkit.messageHandlers.moneyManager.postMessage(data);
        }
    },

    //简历详情备注
    resumeDetailMark: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.resumeDetailMark(data);
        } else {
            window.webkit.messageHandlers.resumeDetailMark.postMessage(data);
        }
    },

    //简历详情备注
    HBEChatWithUserIdAndUserNameAndUserImgPathAndJsonStr: function (userId, userName, userImgPath, jsonStr) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.HBEChatWithUserIdAndUserNameAndUserImgPathAndJsonStr(userId, userName, userImgPath, jsonStr);
        } else {
            window.webkit.messageHandlers.HBEChatWithUserIdAndUserNameAndUserImgPathAndJsonStr.postMessage({
                userId: userId,
                userName: userName,
                userImgPath: userImgPath,
                jsonStr: jsonStr,
            });
        }
    },

    //活动咨询
    HBEHRChatWithUserIdAndUserNameAndUserImgPathAndJsonStr: function (userId, userName, userImgPath, jsonStr) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.HBEHRChatWithUserIdAndUserNameAndUserImgPathAndJsonStr(userId, userName, userImgPath, jsonStr);
        } else {
            window.webkit.messageHandlers.HBEHRChatWithUserIdAndUserNameAndUserImgPathAndJsonStr.postMessage({
                userId: userId,
                userName: userName,
                userImgPath: userImgPath,
                jsonStr: jsonStr,
            });
        }
    },

    //活动咨询
    saveAccountPhoto: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.saveAccountPhoto(data);
        } else {
            window.webkit.messageHandlers.saveAccountPhoto.postMessage(data);
        }
    },

    //消息面打扰
    setChatNotify: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.setChatNotify(data);
        } else {
            window.webkit.messageHandlers.setChatNotify.postMessage(data);
        }
    },

    //分享功能
    shareUrlAndTitleAndContentAndHeadImageUrlAndType: function (url, title, content, headImageUrl, type) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.shareUrlAndTitleAndContentAndHeadImageUrlAndType(url, title, content, headImageUrl, type);
        } else {
            window.webkit.messageHandlers.shareUrlAndTitleAndContentAndHeadImageUrlAndType.postMessage({
                url: url,
                title: title,
                content: content,
                headImageUrl: headImageUrl,
                type: type,
            });
        }
    },

    //发布职位
    releasePosition: function (result, shareArray) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.releasePosition(result, shareArray);
        } else {
            window.webkit.messageHandlers.releasePosition.postMessage({
                result: result,
                shareArray: shareArray,
            });
        }
    },

    //是否绑定单位账号
    isBindCompnyAccount: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.isBindCompnyAccount(data);
        } else {
            window.webkit.messageHandlers.isBindCompnyAccount.postMessage(data);
        }
    },

    //去学习中心
    goLearnActivity: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.goLearnActivity(data);
        } else {
            window.webkit.messageHandlers.goLearnActivity.postMessage(data);
        }
    },

    //讲师主页
    goLecturerInfoActivity: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.goLecturerInfoActivity(data);
        } else {
            window.webkit.messageHandlers.goLecturerInfoActivity.postMessage(data);
        }
    },

    //上传广告图片
    commonUploadPosterImage: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.commonUploadPosterImage(data);
        } else {
            window.webkit.messageHandlers.commonUploadPosterImage.postMessage(data);
        }
    },

    //退出登录
    loginCommonOut: function () {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.loginCommonOut();
        } else {
            window.webkit.messageHandlers.loginCommonOut.postMessage();
        }
    },

    //提示流量还是wifi
    videoPlayEnviroment: function () {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.videoPlayEnviroment();
        } else {
            window.webkit.messageHandlers.videoPlayEnviroment.postMessage();
        }
    },

    //打开pdf
    openPdf: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.openPdf(data);
        } else {
            window.webkit.messageHandlers.openPdf.postMessage(data);
        }
    },

    //APP回调事件
    posterReturnData: function (data) {
        if (typeof window.webkit == 'undefined') {
            AndroidLocalInstance.posterReturnData(data);
        } else {
            window.webkit.messageHandlers.posterReturnData.postMessage(data);
        }
    },
};
/******************求职者js*******************/
window.webkitJsAppPerson = {
    //拨打电话
    callPhone: function (data) {
        if (typeof window.webkit == 'undefined') {
            androidShare.callPhone(data);
        } else {
            window.webkit.messageHandlers.callPhone.postMessage(data);
        }
    },

    //头部返回按钮
    commonReturn: function (data) {
        if (typeof window.webkit == 'undefined') {
            androidShare.commonReturn(data);
        } else {
            window.webkit.messageHandlers.commonReturn.postMessage(data);
        }
    },

    //分享
    shareUrlAndTitleAndContent: function (url, title, content) {
        if (typeof window.webkit == 'undefined') {
            androidShare.shareUrlAndTitleAndContent(url, title, content);
        } else {
            window.webkit.messageHandlers.shareUrlAndTitleAndContent.postMessage({
                url: url,
                title: title,
                content: content,
            });
        }
    },

    //分享
    shareUrlAndTitleAndContentAndLogoPath: function (url, title, content, logoPath) {
        if (typeof window.webkit == 'undefined') {
            androidShare.shareUrlAndTitleAndContentAndLogoPath(url, title, content, logoPath);
        } else {
            window.webkit.messageHandlers.shareUrlAndTitleAndContentAndLogoPath.postMessage({
                url: url,
                title: title,
                content: content,
                logoPath: logoPath,
            });
        }
    },

    //显示分享按钮 并传输分享数据
    shareShowUrlTitleContentLogoPath: function (is_whoe, link, imgUrl, title, desc) {
        if (typeof window.webkit == 'undefined') {

        } else {
            window.webkit.messageHandlers.shareShowUrlTitleContentLogoPath.postMessage({
                url: link,
                title: title,
                content: desc,
                logoPath: imgUrl,
                show: is_whoe,
            });
        }
    },

    //职位详情
    PushToJobDetailVCWithJobFlagAndIsRecommend: function (jobFlag, isRecommend) {
        if (typeof window.webkit == 'undefined') {
            androidShare.PushToJobDetailVCWithJobFlagAndIsRecommend(jobFlag, isRecommend);
        } else {
            window.webkit.messageHandlers.PushToJobDetailVCWithJobFlagAndIsRecommend.postMessage({
                jobFlag: jobFlag,
                isRecommend: isRecommend,
            });
        }
    },

    //职位详情
    PushToJobDetailVCWithJobFlagAndIsRecommendAndFromSchool: function (jobFlag, isRecommend, fromSchool) {
        if (typeof window.webkit == 'undefined') {
            androidShare.PushToJobDetailVCWithJobFlagAndIsRecommendAndFromSchool(jobFlag, isRecommend, fromSchool);
        } else {
            window.webkit.messageHandlers.PushToJobDetailVCWithJobFlagAndIsRecommendAndFromSchool.postMessage({
                jobFlag: jobFlag,
                isRecommend: isRecommend,
                fromSchool: fromSchool,
            });
        }
    },

    //单位详情
    PushToCompanyVCWithCompanyFlagAndShowJobListAndFromSchool: function (companyFlag, showJobList, fromSchool) {
        if (typeof window.webkit == 'undefined') {
            androidShare.PushToCompanyVCWithCompanyFlagAndShowJobListAndFromSchool(companyFlag, showJobList, fromSchool);
        } else {
            window.webkit.messageHandlers.PushToCompanyVCWithCompanyFlagAndShowJobListAndFromSchool.postMessage({
                companyFlag: companyFlag,
                showJobList: showJobList,
                fromSchool: fromSchool,
            });
        }
    },

    //反馈给客服
    goFeedBackActivity: function () {
        if (typeof window.webkit == 'undefined') {
            androidShare.goFeedBackActivity();
        } else {
            window.webkit.messageHandlers.goFeedBackActivity.postMessage();
        }
    },

    //反馈给客服
    goShowHeadWebView: function (data) {
        if (typeof window.webkit == 'undefined') {
            androidShare.goShowHeadWebView(data);
        } else {
            window.webkit.messageHandlers.goShowHeadWebView.postMessage(data);
        }
    },

    //我的面试申请
    goVideoInterviewResultList: function () {
        if (typeof window.webkit == 'undefined') {
            androidShare.goVideoInterviewResultList();
        } else {
            window.webkit.messageHandlers.goVideoInterviewResultList.postMessage();
        }
    },

    //我的面试申请
    goMessageCenter: function () {
        if (typeof window.webkit == 'undefined') {
            androidShare.goMessageCenter();
        } else {
            window.webkit.messageHandlers.goMessageCenter.postMessage();
        }
    },

    //单位详情
    goVideoInterviewCompanyDetailActivity: function (companyFlag, sid) {
        if (typeof window.webkit == 'undefined') {
            androidShare.goVideoInterviewCompanyDetailActivity(companyFlag, sid);
        } else {
            window.webkit.messageHandlers.goVideoInterviewCompanyDetailActivity.postMessage({
                companyFlag: companyFlag,
                sid: sid,
            });
        }
    },

    //职位详情
    goVideoInterviewJobDetailActivity: function (job_flag, sid) {
        if (typeof window.webkit == 'undefined') {
            androidShare.goVideoInterviewJobDetailActivity(job_flag, sid);
        } else {
            window.webkit.messageHandlers.goVideoInterviewJobDetailActivity.postMessage({
                jobFlag: job_flag,
                sid: sid,
            });
        }
    },

    //完善简历
    perfectResume: function (data) {
        if (typeof window.webkit == 'undefined') {
            androidShare.perfectResume(data);
        } else {
            window.webkit.messageHandlers.perfectResume.postMessage(data);
        }
    },

    //完善简历
    downloadBuleApp: function () {
        if (typeof window.webkit == 'undefined') {
            androidShare.downloadBuleApp();
        } else {
            window.webkit.messageHandlers.downloadBuleApp.postMessage();
        }
    },

    //打开app聊一聊
    gainHuiBoServiceIM: function (rong_id, rong_user_name, rong_photo) {
        if (typeof window.webkit == 'undefined') {
            // androidShare.gainHuiBoServiceIM(rong_id, rong_user_name, rong_photo);
        } else {
            window.webkit.messageHandlers.gainHuiBoServiceIM.postMessage({
                rong_id: rong_id,
                rong_user_name: rong_user_name,
                rong_photo: rong_photo,
            });
        }
    },
};
