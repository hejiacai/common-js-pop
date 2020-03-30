/**
 * 统一埋点 统计/新增记录 2019/6/12 16:23
 *
 优先使用 控件的 log_data
 <a class="btnApplyJob" log_data="job_flag={/$value['job_flag']/}">测试</a>
 <script type="text/javascript">
 var action_url = '{/$siteurl.style/}';
 var action_dom = [
 //0-需要监控的控件 1-log_type (base_service_person_statistics_recordSaveActionLog) 2-log_data
 ['.btnApplyJob', 2, {out_id: 123, info: 'test'},true],
 ['.njmNameXbox', 1, {out_id: 123, info: 'test'}],
 ];
 </script>
 <script type="text/javascript" language="javascript" src="{/version file='action.js'/}"></script>


 */
$(function () {
    window.action_log = function (log_type, log_data) {
        if (typeof (_static_visit_sys) == "undefined") {
            var _static_visit_sys = '';
            if ("ontouchstart" in window) {
                _static_visit_sys = window.isWeiXin() ? 'weixin' : 'mobile';//移动端 -  //区分 触屏端  微信

            } else {
                _static_visit_sys = 'pc';
            }
        }

        var img = new Image();
        var area_id = _static_visit_sys == 'pc' ? getCookie('ip_area_info') : getCookie('M_area_info');
        img.src = action_url + "/js/action_log.js?" + $.param({
            visit_sys: _static_visit_sys,
            log_type: log_type,
            log_data: log_data,
            area_id: area_id ? area_id : '0300',
            _time: Date.parse(new Date()),
        });
    };
    window.isWeiXin = function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    };

    function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    }

    if (typeof action_dom != 'undefined' && $.isArray(action_dom)) {
        $.each(action_dom, function (key, _this) {
            //当前监控按钮
            var log_type = Number(_this[1]);
            var log_data = $(this).attr('log_data') || (_this[2] && $.param(_this[2]));
            if (!log_type) {
                //提交监控失败[未指定
                return true;//跳过本次循环
            }
            //自动初始化触发
            if (_this[3]) {
                window.action_log(log_type, $(this).attr('log_data') || (_this[2] && $.param(_this[2])));
            } else {
                $(document).on('click', _this[0], function () {
                    window.action_log(log_type, $(this).attr('log_data') || (_this[2] && $.param(_this[2])));
                });
            }
        });
    }
});
