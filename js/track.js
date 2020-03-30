//trace
(function firstVisitAcquisition()
{
    var src_url = "";
    var visit_sys = '';
    var title = '';
    var visit_dev = '';
    var enter_url = "";
    enter_url = document.location;


    if (document.referrer.length > 0) src_url = document.referrer;
    if (src_url.length == 0 && (window.opener != undefined || window.opener != null)) {
        try{
            src_url = window.opener.location.href;
        } catch (e)
        {}
    }
    var hostname = '//' + window.location.hostname;
    title = document.getElementsByTagName('title')[0].innerHTML;
    var _visit_dev = getExplorerInfo();
    visit_dev = _visit_dev['type'];
    if(_visit_dev['ver'])
        visit_dev = visit_dev + ' ' + _visit_dev['ver'];

    /*if(isPc()){
        visit_sys = 'PC';
    }else{
        visit_sys = '触屏版';
        if(isAndrio()){
            visit_sys = 'Android';
        }else{
            visit_sys = 'IOS';
        }
    }*/

    if("ontouchstart" in window){
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
            visit_sys = 'IOS';
        } else if (/(Android)/i.test(navigator.userAgent)) {
            visit_sys = 'Android';
        } else {
            visit_sys = '触屏版';
        }
    }else{
        visit_sys = 'PC';
    }

    var flag = true;
    //todo 上传时改成线上的
    //var visit_host_name = 'track.hb.com';//本地
    //var visit_host_name = 'www.beta.huibo.com';//测试
     var visit_host_name = 'track.huibo.com';//线上
    if (flag){
        document.write("<img style='width:0px; height:0px;display:none;' src='//"+ visit_host_name +"/refv2/?" +
            "url=" + escape(enter_url) + "&src_url=" + escape(src_url) + "&rand=" + Math.random() + "" + "" +
            "&visit_sys="+visit_sys+"&title="+title+"&visit_dev="+visit_dev+"' />");
    }
})();

function isPc() {
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        return false;
    }
    else {
        return true;
    }
}

function isAndrio()
{
    var ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
        return false;
    } else if (/android/.test(ua)) {
        return true;
    }
}

function getExplorerInfo() {
    var explorer = window.navigator.userAgent.toLowerCase();
    //ie
    if (explorer.indexOf("msie") >= 0) {
        var ver=explorer.match(/msie ([\d.]+)/)[1];
        return {type:"IE",version:ver};
    }
    //firefox
    else if (explorer.indexOf("firefox") >= 0) {
        var ver=explorer.match(/firefox\/([\d.]+)/)[1];
        return {type:"Firefox",version:ver};
    }
    //Chrome
    else if(explorer.indexOf("chrome") >= 0){
        var ver=explorer.match(/chrome\/([\d.]+)/)[1];
        return {type:"Chrome",version:ver};
    }
    //Opera
    else if(explorer.indexOf("opera") >= 0){
        var ver=explorer.match(/opera.([\d.]+)/)[1];
        return {type:"Opera",version:ver};
    }
    //Safari
    else if(explorer.indexOf("Safari") >= 0){
        var ver=explorer.match(/version\/([\d.]+)/)[1];
        return {type:"Safari",version:ver};
    }else
    {
        return {type:"IE",version:'EDEG'};
    }
}
