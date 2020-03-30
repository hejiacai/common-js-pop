var layer_index;
var layer_index_title = '加载中...';
var is_layer_index = true;//是否启用ajax状态
var is_layer_dom = false;//是否指定ID展示 layer ajax状态
var dom_in_msg = '<div class="layui-layer-dialog @@layui_id" id="layui-layer2" title="@@layer_index_title">' +
    '<div id="" class="layui-layer-content layui-layer-padding" style="line-height: 32px;padding: 0 0 0 55px;">' +
    '<i class="layui-layer-ico layui-layer-ico@@icon" style="top:0;bace"></i>' +
    '<span class="layui_layer_msg_tip">@@layer_index_title</span>' +
    '</div>' +
    '<span class="layui-layer-setwin"></span>' +
    '</div>';
$(document).ajaxStart(function () {
    //指定ID展示
    if (is_layer_dom) {
        //is_layer_dom = "#id"; layer_index_title='正在加载....'; 根据layui_id_### css 调整样式
        var dom_in_msg_temp = get_dom_in_mag(is_layer_dom, layer_index_title, 16);
        $(is_layer_dom).html(dom_in_msg_temp);
        is_layer_dom = false;
        return true;
    }
    //是否启用ajax状态
    if (!is_layer_index) {
        is_layer_index = true;
        return false;
    }
    // layer_index = layer.load(1, {shade: [0.5, '#000']}); //换了种风格
    layer_index = layer.msg(layer_index_title, {
        icon: 16,
        shade: [0.5, '#000'],
        time: 25000
    }); //换了种风格
});
$(document).ajaxStop(function () {
    layer.close(layer_index);
});

function get_dom_in_mag(is_layer_dom, layer_index_title, icon) {
    var dom_in_msg_temp = dom_in_msg;
    dom_in_msg_temp = dom_in_msg_temp.replace(/@@layui_id/g, "layui_id_" + is_layer_dom.replace(/\.|\#/g, ''));
    if (layer_index_title) {
        dom_in_msg_temp = dom_in_msg_temp.replace(/@@layer_index_title/g, layer_index_title);
    } else {
        dom_in_msg_temp = dom_in_msg_temp.replace(/@@layer_index_title/g, "&nbsp;");
    }
    dom_in_msg_temp = dom_in_msg_temp.replace(/@@icon/g, icon);
    return dom_in_msg_temp;
}

//ajax 请求
function ajax_function(url, data, success_c, async, type) {
    success_c = success_c ? success_c : {
        success: function (data) {

        },
        error: function (data) {

        }
    };
    type = type ? type : 'POST';
    async = async ? async : false;//是否同步请求  //false-同步请求
    if (!url || !success_c) {
        layer.msg('参数错误', {icon: 5});
    }
    var re = false;
    $.ajax({
        type: type,
        url: url,
        data: data,//只要将表单序列化就可以了
        async: async,//false-同步请求
        dataType: 'json',
        success: function (data) {
            re = success_c.success(data);
        },
        error: function (request) {
            layer.msg("数据请求失败.请稍后重试", {icon: 7});
            re = success_c.error(request);
            re = false;
        }
    });
    return re;
}

//提交公用方法  统一处理拦截错误信息
function ajax_request_function(url, data, success_c, async, type) {
    success_c = success_c ? success_c : {
        success: function (data) {

        },
        error: function (data) {

        }
    };
    type = type ? type : 'POST';
    async = async ? async : false;//是否同步请求  //false-同步请求
    if (!url || !success_c) {
        layer.msg('参数错误', {icon: 5});
    }
    var re = false;
    $.ajax({
        type: type,
        url: url,
        data: data,//只要将表单序列化就可以了
        async: async,//false-同步请求
        dataType: 'json',
        success: function (data) {
            if (data.code == '200') {
//						layer.msg(data.msg, {icon: 6});
                if ('success' in success_c) {
                    re = success_c.success(data);
                }
            } else {
                //提示错误
                layer.msg(data.msg, {icon: 5});
                if ('error' in success_c) {
                    re = success_c.error(data);
                }
            }
        },
        error: function (request) {
            layer.msg("数据请求失败.请稍后重试", {icon: 7});
            re = false;
        }
    });
    return re;
}

//提交公用方法  表单  统一处理拦截错误信息
function ajax_form_function(form, success_c, async, type) {
    success_c = success_c ? success_c : {
        success: function (data) {

        },
        error: function (data) {

        }
    };
    type = type ? type : 'POST';
    async = async ? async : false;//是否同步请求  //false-同步请求
    if (!form || !success_c) {
        //信息框-例4
        layer.msg('参数错误', {icon: 5});
    }
    var re = false;
    $.ajax({
        type: type,
        url: $(form).attr('action'),
        data: $(form).serialize(),//只要将表单序列化就可以了
        async: async,//false-同步请求
        dataType: 'json',
        success: function (data) {
            if (data.code == '200') {
//						layer.msg(data.msg, {icon: 6});
                if ('success' in success_c) {
                    re = success_c.success(data);
                }
            } else {
                //提示错误
                layer.msg(data.msg, {icon: 5});
                if ("error" in success_c) {
                    re = success_c.error(data);
                }
            }
        },
        error: function (request) {
            layer.msg("数据请求失败.请稍后重试", {icon: 7});
            re = false;
        }
    });
    return re;
}

//跳转地址
function location_href(url) {
    window.location.href = url;
}

//时间插件
var start_times = start_times ? start_times : {
    skin: 'whyGreen',
    dateFmt: 'yyyy-MM-dd',
    maxDate: "%y-%M-{%d+2}", //最大日期
    readOnly: true,
    onpicking: function (datas) {
        end_times.minDate = datas.cal.newdate.y + "-" + datas.cal.newdate.M + "-" + datas.cal.newdate.d;
        //开始日选好后，重置结束日的最小日期
    }
};
var end_times = end_times ? end_times : {
    skin: 'whyGreen',
    dateFmt: 'yyyy-MM-dd',
    maxDate: '%y-%M-{%d+2}',
    readOnly: true,
    onpicking: function (datas) {
        start_times.maxDate = datas.cal.newdate.y + "-" + datas.cal.newdate.M + "-" + datas.cal.newdate.d;
        //开始日选好后，重置结束日的最小日期
    }
};

Date.prototype.format = function (fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

/*
 *   功能:实现VBScript的DateAdd功能.
 *   参数:interval,字符串表达式，表示要添加的时间间隔.
 *   参数:number,数值表达式，表示要添加的时间间隔的个数.
 *   参数:date,时间对象.
 *   返回:新的时间对象.
 *   var now = new Date();
 *   var newDate = DateAdd( "d", 5, now);
 *---------------   DateAdd(interval,number,date)   -----------------
 */
Date.prototype.DateAdd = function (interval, number, date) {
    interval = interval ? interval : 'd';//默认天数
    switch (interval) {
        case "y": {//年
            date.setFullYear(date.getFullYear() + number);
            return date;
        }
        case "q": {//季度
            date.setMonth(date.getMonth() + number * 3);
            return date;
        }
        case "M": {//月
            date.setMonth(date.getMonth() + number);
            return date;
        }
        case "w": {//星期
            date.setDate(date.getDate() + number * 7);
            return date;
        }
        case "d": {//天
            date.setDate(date.getDate() + number);
            return date;
        }
        case "h": {//小时
            date.setHours(date.getHours() + number);
            return date;
        }
        case "m": {//分钟
            date.setMinutes(date.getMinutes() + number);
            return date;
        }
        case "s": {//秒
            date.setSeconds(date.getSeconds() + number);
            return date;
        }
    }
};


function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

//默认数据
var per_owner_defaults = {
    e: '.per_owner_input',//生成的控件class
    title: '业绩人',//title
    id: 'per_owner',//控件name
    value: '',//控件默认值
    hi_input: [['per_owner_id', '', 'id'], ['per_owner_name', '', 'name'], ['per_owner_code', '', 'code']]//隐藏提交控件name 默认值
};
var per_owner_date;
//生成业绩人查询对象
function create_per_owner(queue_info) {
    var base_html = '<label style=" float: left; margin-top:9px;">@@title：</label>' +
        '<input class="text" type="text" id="@@id" name="@@id" value="@@value" style="width: 100px;"' +
        ' readonly="readonly" onclick="get_per_owner(this)"  placeholder="点击选择@@title">' +
        '<input type="button" class="btn3 btnsF12" onclick="close_per_owner_date()" style="background:#1FB5AD;float: left;" value="清除">';
    per_owner_date = $.extend({}, per_owner_defaults, queue_info);
    base_html = base_html.replace(/@@title/g, per_owner_date.title);
    base_html = base_html.replace(/@@id/g, per_owner_date.id);
    base_html = base_html.replace(/@@value/g, per_owner_date.value);
    var hi_html = '';
    $(per_owner_date.hi_input).each(function (i, n) {
        var hidden_html = '<input type="hidden" id="@@hi_input_name" name="@@hi_input_name" value="@@hi_input_value">';
        hidden_html = hidden_html.replace(/@@hi_input_name/g, n[0]);
        hidden_html = hidden_html.replace(/@@hi_input_value/g, n[1]);
        hi_html = hi_html + hidden_html;
    });
    $(per_owner_date.e).html(base_html + hi_html);
}
var GetArrangeBooth;
//获取业绩人列表
function get_per_owner(e, fun) {
    fun = fun ? fun : {};
    var url = "/user/GetPerOwner";
    ajax_request_function(url, {}, {
        success: function (data) {
            GetArrangeBooth = layer.open({
                type: 1,
                closeBtn: 0, //不显示关闭按钮
                title: null,
                anim: 5,
                shadeClose: true, //开启遮罩关闭
                area: ['580px', "120px"],
                btn: ['确认', '清除', '取消'],
                content: data.data,
                yes: function (index, layero) {
                    var dept_user_id = $("#dept_user_id option:selected").val();
                    var dept_user_html = trim($("#dept_user_id option:selected").html());
                    var dept_code = trim($("#dept_code option:selected").html());
                    if (dept_user_id && dept_user_html) {
                        console.log(dept_user_id, dept_user_html, dept_code);
                        if ("fun" in fun) {
                            fun.fun(dept_user_id, trim(dept_user_html), dept_code);
                        } else {
                            $("#" + per_owner_date.id).val(trim(dept_user_html) + "(" + trim(dept_code) + ")");
                            $(per_owner_date.hi_input).each(function (i, n) {
                                switch (n[2]) {
                                    case 'id':
                                        $("#" + n[0]).val(dept_user_id);
                                        break;
                                    case 'name':
                                        $("#" + n[0]).val(trim(dept_user_html));
                                        break;
                                    case 'code':
                                        $("#" + n[0]).val(dept_code);
                                        break;
                                    default:
                                        break;
                                }
                            });
                        }
                    } else {
                        layer.msg("未选择部门人员", {icon: 7});
                    }
                    layer.close(GetArrangeBooth);
//						layer.msg("选择成功", {icon: 6});
                },
                btn2: function (index, layero) {
                    close_per_owner_date();
                }
            });
        }
    });
}
//动态获取部门人员
function get_heap_user_list(e, heap_mode, option_type, heap_type) {
    option_type = option_type ? option_type : 1;//类型  1-heap_id  2-user_id
    heap_type = heap_type ? heap_type : '';
    var dept_id = $(e).find("option:selected").val(),
        url = "/user/GetHeapUserList",
        data = {dept_id: dept_id, option_type: option_type, heap_type: heap_type};
    if (dept_id == '') {
        return;
    }
    ajax_request_function(url, data, {
        success: function (data) {
            $('#' + heap_mode).html(data.data);
            $('[name=' + heap_mode + ']').searchableSelectDeleteOld().searchableSelect();
        }
    });
}

//业绩人清除数据
function close_per_owner_date() {
    $("#" + per_owner_date.id).val('');
    $(per_owner_date.hi_input).each(function (i, n) {
        $("#" + n[0]).val('');
    });
}

/*****
 * 动态修改get参数并跳转
 * @param get_obj 参数
 * @param is_blank 是否跳转
 * @param is_empty 是否重置
 * @param href_url
 * @param is_return_url
 */
function location_href_set_get(get_obj, is_blank, is_empty, href_url, is_return_url) {
    var GET_URL = is_empty ? {} : urlGet();
    if (typeof get_obj != 'object' && typeof get_obj == 'string') {
        get_obj = split_get_param(get_obj);
    }

    jQuery.each(get_obj, function (i_get, val) {
        GET_URL[i_get] = decodeURIComponent(val);
    });
    GET_URL = jQuery.param(GET_URL);
    href_url = href_url ? href_url : urlGet('url');
    if (is_return_url) {
        return href_url + '?' + GET_URL;
    }

    is_blank ? open_new_bleak(href_url + '?' + GET_URL) : window.location.href = href_url + '?' + GET_URL;
}
//获取get数据
function urlGet(get) {
    get = get ? get : 'get';
    var aQuery = window.location.href.split("?");//取得Get参数
    if (get == 'url') {
        return aQuery[0];
    }
    var aGET = {};
    if (aQuery[1] && aQuery[1].length > 1) {
        aGET = split_get_param(decodeURI(aQuery[1]));
    }
    return aGET;
}
//拆分 get 参数 返回数组
function split_get_param(get_param) {

    var aBuf = get_param.split("&"), aGET = {};
    for (var i = 0, iLoop = aBuf.length; i < iLoop; i++) {
        if (aBuf[i]) {
            var aTmp = aBuf[i].split("=");//分离key与Value
            if (aTmp[0] != '' && aTmp[1] != '') {
                aGET[aTmp[0]] = decodeURIComponent(aTmp[1]);
            }
        }
    }
    return aGET;
}
/**
 * 获取form表单的数据 生成为数组返回
 * id 表单ID
 * */
function get_form_data_array(id) {
    var form_data = $(id).serializeArray();
    var re_data = [];
    $(form_data).each(function (key, value) {
        // //使用动态生成全局变量 缺点:如果变量不存在会报错,终止执行
        // $.globalEval("var " + value.name + " = '" + value.value + "';");
        //利用数组接收数据
        re_data[value.name] = value.value;
    });

    return re_data;
}
//字符串转对象 实例: {scene_id:'65',type:2} 暂支持一维对象
function replace_data_info(data_info) {
    var re = {};
    if (data_info.length > 1) {
        data_info = data_info.replace(/\{|}/g, '');
        if (data_info) {
            data_info = data_info.split(",");
            $(data_info).each(function (key, value) {
                value = value.split(":");
                value[1] = value[1].replace(/'|"/g, '');
                re[value[0]] = value[1];
            });
        }
    }
    console.log(re);
    return re;
}
//新建窗口窗口
function open_new_bleak(url) {
    window.open(url);
}
//打开展示窗口
function open_new(url_obj, windowName, width, height, is_parent, offset, shadeClose, shade, is_iframeAuto) {
    is_parent = is_parent ? window.parent : window;
    is_iframeAuto = is_iframeAuto != undefined ? is_iframeAuto : true;
    shadeClose = shadeClose ? true : false;
    shade = shade == false ? shade : [0.2, '#393D49'];
    if (!(typeof url_obj == "object" ) || url_obj instanceof String) {
        url_obj = {url: url_obj, data: null};
    }

    if (url_obj.data) {
        url_obj.data = jQuery.param(url_obj.data);
    }
    if (!url_obj.url) {
        layer.msg("请指定打开窗体的地址", {icon: 7});
        return false;
    }
    if (offset) {
        var offset_t = $(offset.target).offset();
        var top = offset_t.top + $(offset.target).height();
        var left = offset_t.left;
        // console.log(top);
        // console.log(left);
        var clientHeight = document.body.clientHeight;//可见高度
        var clientWidth = document.body.clientWidth;//可见宽度
        left = clientWidth - left < width ? clientWidth - width : left;
        top = clientHeight - top < height ? clientHeight - height : top;
        offset = [top + "px", left + "px"];
    } else {
        offset = [];
    }

    var space_mark = url_obj.url.indexOf('?') > 0 ? url_obj.data ? "&" : '' : '?';
    url_obj.data = url_obj.data ? url_obj.data : '';
    width = width ? width + "px" : "auto";
    height = height ? height + "px" : "auto";
    windowName = windowName ? windowName : "信息";
    var parentlayer = is_parent.layer.open({
        type: 2,
        offset: offset,
        area: [width, height],
        shade: shade,
        maxmin: true, //开启最大化最小化按钮
        shadeClose: shadeClose,
        title: windowName,
        content: url_obj.url + space_mark + url_obj.data,
        is_iframeAuto: is_iframeAuto,
        success: function (layero, index) {
            $(window).resize(function () {
                layer.iframeAuto(parentlayer);
            });
        }
    });
    return parentlayer;

}


//捕捉层
function open_tips(Id_Obj, windowName, width, height, is_parent, offset, shadeClose, shade, is_iframeAuto) {
    is_parent = is_parent ? window.parent : window;
    is_iframeAuto = is_iframeAuto != undefined ? is_iframeAuto : true;
    shadeClose = shadeClose ? true : false;
    shade = shade == false ? shade : [0.2, '#393D49'];
    if (!Id_Obj) {
        layer.msg("请指定捕捉层的ID对象!", {icon: 7});
        return false;
    }
    if (offset) {
        var offset_t = $(offset.target).offset();
        var top = offset_t.top + $(offset.target).height();
        var left = offset_t.left;
        // console.log(top);
        // console.log(left);
        var clientHeight = document.body.clientHeight;//可见高度
        var clientWidth = document.body.clientWidth;//可见宽度
        left = clientWidth - left < width ? clientWidth - width : left;
        top = clientHeight - top < height ? clientHeight - height : top;
        offset = [top + "px", left + "px"];
    } else {
        offset = [];
    }

    width = width ? width + "px" : "auto";
    height = height ? height + "px" : "auto";
    windowName = windowName ? windowName : null;
    var parentlayer = is_parent.layer.open({
        type: 1,
        shade: shade,
        shadeClose: shadeClose,
        maxmin: true, //开启最大化最小化按钮
        offset: offset,
        area: [width, height],
        title: windowName,
        content: Id_Obj,
        is_iframeAuto: is_iframeAuto,
        success: function (layero, index) {
            $(window).resize(function () {
                layer.iframeAuto(parentlayer);
            });
        }
    });
    return parentlayer;
}
//获取元素的纵坐标
function getTop(e) {
    var offset = e.offsetTop;
    if (e.offsetParent != null) offset += getTop(e.offsetParent);
    return offset;
}
//获取元素的横坐标
function getLeft(e) {
    var offset = e.offsetLeft;
    if (e.offsetParent != null) offset += getLeft(e.offsetParent);
    return offset;
}

var msg_error_layer_tips_animate;
function msg_error_layer_tips(id, tip_msg, time, tips, area) {
    if (!msg_error_layer_tips_animate)
        msg_error_layer_tips_animate = $("html,body").animate({scrollTop: $(id).offset().top - 200}, 300);
    setTimeout(function () {
        layer.tips(tip_msg, $(id), {
            time: time ? time : 2000, area: area ? area : [], tipsMore: true
        });
        msg_error_layer_tips_animate = false;
    }, 400);
    return false;
}
function msg_error($msg) {
    layer.msg($msg, {icon: 7});
    return false;
}
function msg_success($msg) {
    layer.msg($msg, {icon: 6});
    return true;
}
function msg_error_tips(dom, time) {
    time = time ? time : 3;
    $("html,body").animate({scrollTop: $(dom).offset().top - 50}, 500);
    var background = $(dom).css('background');
    $(dom).css('background', 'rgba(198, 0, 0, 0.23)');
    setTimeout(function () {
        $(dom).css('background', background);
    }, time * 1000);
}

function checkSelect(name, min, max) {
    var c = 0;
    var chk = $(':checkbox[name=' + name + ']');
    for (var i = 0; i < chk.length; i++) {
        if (chk.get(i).checked)c++;
    }
    if (min && c < min) return false;
    if (max && c > max) return false;
    return c != 0;
}


$(function () {
    //电话号码输入 强制输入数字
    $("input[type=tel]").keyup(function () {
        var tmptxt = $(this).val();
        $(this).val(tmptxt.replace(/\D|^0/g, ''));
    }).bind("paste", function () {
        var tmptxt = $(this).val();
        $(this).val(tmptxt.replace(/\D|^0/g, ''));
    });

    /***
     * 共用点击提交
     * <input type="button" class="btn4 btnsF12 click_ajax_post"
     * href="{/get_url rule='/companyfair/CompanyProtectionMod'/}"
     * post_data="company_id={/$company_id/}" >
     */
    $(".click_ajax_post").on("click", function (e) {
        var url = $(this).attr('href'),
            data = $(this).attr('post_data'),
            is_reload = $(this).attr('is_reload');//reload  parent top
        //window.location.reload();
        //window.parent.document.location.reload();
        is_reload = is_reload == 'reload' ? window :
            is_reload == 'parent' ? window.parent :
                is_reload == 'top' ? window.top :
                    false;
        ajax_request_function(url, data, {
            success: function (data) {
                msg_success(data.msg);
                if (is_reload) {
                    setTimeout(function () {
                        is_reload.location.reload();
                    }, 600);

                }
            }
        });
    });

    //弹窗获取连接
    $(".layer_open_2").on("click", function (e) {
        e.preventDefault();//阻止默认提交
        var url = $(this).attr("layer_url"),
            layer_data = $(this).attr("layer_data"),
            layer_info = $(this).attr("layer_info");
        if (!layer_info)
            return false;
        layer_info = layer_info.split("/\\");
        var layer_title = layer_info[0],
            area_w = layer_info[1],
            area_h = layer_info[2];
        if (layer_data)
            layer_data = replace_data_info(layer_data);
        if (!url) {
            layer.msg("参数错误", {icon: 7});
            return false;
        }
        var url_obj = {url: url, data: layer_data};
        open_new(url_obj, layer_title, area_w, area_h);
    });
});

//动态执行 快捷操作
var set_id_type = "#";
var set_class_type = ".";
var html_style_type = {
    show: ['display'],
    css: [],
    attr: ['colspan', 'rowspan', 'href'],
    html: ['html'],
    val: ['val']
};
function dynamic_set_html_style(html_style) {
    if (html_style) {
        $.each(html_style, function (i, val) {
            $.each(val, function (i1, val1) {
                if ($.inArray(i1, html_style_type.css) != -1) {
                    $(set_id_type + i).css(i1, val1);
                    $(set_class_type + i).css(i1, val1);
                } else if ($.inArray(i1, html_style_type.attr) != -1) {
                    $(set_id_type + i).attr(i1, val1);
                    $(set_class_type + i).attr(i1, val1);
                } else if ($.inArray(i1, html_style_type.html) != -1) {
                    $(set_id_type + i).html(val1);
                    $(set_class_type + i).html(val1);
                } else if ($.inArray(i1, html_style_type.val) != -1) {
                    $(set_id_type + i).val(val1);
                    $(set_class_type + i).val(val1);
                } else if ($.inArray(i1, html_style_type.show) != -1) {
                    if (val1) {
                        $(set_id_type + i).show();
                        $(set_class_type + i).show();
                    } else {
                        $(set_id_type + i).hide();
                        $(set_class_type + i).hide();
                    }
                }
            });
        });
    }
}

(function ($) {

    //$("#SetArrangeBooth").all_chk();
    $.fn.all_chk = function (options) {
        $.all_chk(this.selector);
        console.log(this.selector);
    };

    $.extend({
        //$.all_chk("#dept_all_{/$dept['dept_id']/}");
        all_chk: function (all_chk_id) {
            console.log($(all_chk_id).selector);
            /****
             * <label><input type="checkbox" class="all">全选</label>
             * <a href="javascript:;" class="selectAll">全选</a>
             * <a href="javascript:;" class="unSelect">全不选</a>
             * <a href="javascript:;" class="reverse">反选</a>
             */
            //全选或全不选
            $(all_chk_id).on("click", ".all", function () {
                if (this.checked) {
                    $(all_chk_id + " :checkbox").prop("checked", true);
                } else {
                    $(all_chk_id + " :checkbox").prop("checked", false);
                }
            });

            //全选
            $(all_chk_id).on("click", ".selectAll", function () {
                $(all_chk_id + " :checkbox,#all").prop("checked", true);
            });
            //全不选
            $(all_chk_id).on("click", ".unSelect", function () {
                $(all_chk_id + " :checkbox,#all").prop("checked", false);
            });
            //反选
            $(all_chk_id).on("click", ".reverse", function () {
                $(all_chk_id + " :checkbox").each(function () {
                    $(this).prop("checked", !$(this).prop("checked"));
                });
                $.allchk(all_chk_id);
            });
            $(all_chk_id).on("click", " :checkbox", function () {
                $.allchk(all_chk_id);
            });
        },
        allchk: function (all_chk) {
            var chknum = $(all_chk + " :checkbox").not(".all").size();//选项总个数
            var chk = 0;
            $(all_chk + " :checkbox").not(".all").each(function () {
                if ($(this).prop("checked") == true) {
                    chk++;
                }
            });
            // console.log(chk);
            // console.log(all_chk);
            // console.log(chknum);
            if (chknum == chk) {
                //全选
                $(all_chk + " .all").prop("checked", true);
            } else {
                //不全选
                $(all_chk + " .all").prop("checked", false);
            }
        }
    });

    $.extend({
        tip_alt: function () {
            var body_tip_html = '<div ' +
                'style="display:none;overflow:hidden; margin-right: 20px;text-align:left;font-size:12px;position:fixed;padding:5px;" ' +
                'id="altlayer"></div>';
            $('body').append(body_tip_html);
            // $(document.body).find("#id").on('mousemove', function () {
            //     quickalt();
            // });
            var tempalt = '';
            var altlayer = $('#altlayer');
            var hei, wid;
            // event = event ? event : window.event;
            document.body.onmousemove = quickalt;
            document.body.onmouseover = getalt;
            document.body.onmouseout = restorealt;
            var evt, target;

            function get_event() {
                evt = window.event || arguments.callee.caller.arguments[0]; // 获取event对象
                target = evt.srcElement || evt.target; // 获取触发事件的源对象
            }

            function getalt() {
                get_event();
                if (target.title && (target.title != '' || (target.title == '' && tempalt != ''))) {
                    tempalt = target.title;
                    tempbg = target.altbg;
                    tempcolor = target.altcolor;
                    tempborder = target.altborder;
                    target.title = '';
                    altlayer.html(tempalt);

                    if (typeof(tempbg) != "undefined") {
                        altlayer.css('background', tempbg);
                    } else {
                        altlayer.css('background', "#E9E9F1");
                    }
                    if (typeof(tempcolor) != "undefined") {
                        altlayer.css('color', tempcolor);
                    } else {
                        altlayer.css('color', "black");
                    }
                    if (typeof(tempborder) != "undefined") {
                        altlayer.css('border', '1px solid ' + tempborder);
                    } else {
                        altlayer.css('border', "1px solid #ddd");
                    }
                    setTimeout(function () {
                        quickalt_x_y();
                    }, 100);

                }
            }

            function quickalt() {
                if (altlayer.css('display') != 'none') {
                    get_event();
                    quickalt_x_y('not_none');
                }
            }

            function quickalt_x_y(not_none) {
                hei = altlayer.height();
                var w_hei = $(window).height();
                var top_hei = parseInt(evt.y);
                if (w_hei - top_hei < hei) {
                    var top = top_hei - hei - 20 > 0 ? top_hei - hei - 20 : 0;
                    altlayer.css('top', top);
                } else {
                    altlayer.css('top', evt.y + 10);
                }

                wid = altlayer.width();
                var w_wid = $(window).width();
                var lef_wid = parseInt(evt.x);
                if (w_wid - lef_wid - 60 < wid) {
                    var lef = lef_wid - wid - 20 > 0 ? lef_wid - wid - 20 : 0;
                    altlayer.css('left', lef);
                } else {
                    altlayer.css('left', evt.x + 10);
                }

                if (not_none != 'not_none') {
                    // altlayer.css('display', '');

                    // altlayer.animate({
                    //     height: 'show',
                    //     // width: 'show',
                    // });
                    altlayer.slideDown(100);
                    // altlayer.fadeIn(300);
                }
            }

            function restorealt() {
                get_event();
                target.title = tempalt;
                tempalt = '';
                altlayer.css('display', 'none');
                altlayer.css('max-height', 'auto');

            }
        }
    });
})(jQuery);