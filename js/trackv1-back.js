//trace
(function firstVisitAcquisition()
{
    var src_url = "";
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
    var flag = false;
    if (src_url.length > 0 && getHost(hostname) != getHost(src_url)) flag = true;
    if (getTraceCookie("unique_id") == "null") flag = true;
    console.log(flag);
    if (flag){
        document.write("<img style='width:0px; height:0px' src='//track.huibo.com/ref/?url=" + escape(enter_url) + "&src_url=" + escape(src_url) + "&rand=" + Math.random() + "' />");
    }
})();

function getTraceCookie(name){
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr != null) return unescape(arr[2]); return "null";
}

function getHost(url){
	var host = "";
	var regex = /.*\:\/\/([^\/]*).*/; 
	var match = url.match(regex); 
	if(typeof match != "undefined" && null != match){
		host = match[1];
	}
	if (typeof host != "undefined"
			&& null != host) {
		var strAry = host.split(".");
		if (strAry.length > 1) {
			host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
		}
	}
	return host;
}