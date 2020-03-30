/**
 * jquery表格插件
 * @author ZouHao
 * @param ascImgUrl  升序图片地址
 * @param descImgUrl 降序图片地址
 * 例子:
 * 1:默认使用语法
 * $("table").sort();
 * 2:参数使用语法
 * $("table").sort({
 *   'ascImgUrl':'/static/images/bullet_arrow_up.png',
  'descImgUrl':'/static/images/bullet_arrow_down.png',
  'endRow':0,  //最后一行
  'isHeaderTh':true    //头部是th或者td
 * });
 */
;(function ($) {
    $.fn.sort = function (options) {
        var settings = $.extend({
            'ascImgUrl': '/static/images/bullet_arrow_up.png', //升序图片
            'descImgUrl': '/static/images/bullet_arrow_down.png', //降序图片
            'ascDefaultImgUrl': '/jquery_table/sort_asc_default.png', //降序图片
            'descDefaultImgUrl': '/jquery_table/sort_desc_default.png', //降序图片
            'endRow': 0,  //最后一行
            'isHeaderTh': true    //头部是th或者td
        }, options);
        //初始化一些变量
        var node = settings.isHeaderTh ? 'th' : 'td';
        var trList = $(this).find("tr " + node + "[sort='true']");
        init(this);
        function init(p) {
            if (settings.endRow == 0) {
                settings.endRow = $(p).find("tr").size();
            } else if (settings.endRow < 0) {
                settings.endRow = $(p).find("tr").size() + settings.endRow;
            } else {
                settings.endRow = $(p).find("tr").size() - settings.endRow;
            }
            //初始化点击表格头部事件
            trList.click(function () {
                //获取当前行数
                settings.startRow = $(this).parent().index();
                settings.index = $(this).index();
                // if ($(this).find("img").size() == 2) {
                //     // addImg(trList, '');
                //     removeImg(this, 'desc');
                //     // changeTableBody(p, 'asc');
                // } else {
                if ($(this).attr("sort_order") == 'asc') {
                    // addImg(trList, '');
                    removeImg(this, 'desc');
                    // changeTableBody(p, 'desc');
                } else {
                    // addImg(trList, '');
                    removeImg(this, 'asc');
                    // changeTableBody(p, 'asc');
                }
                // }
            });
            for (var i = 0; i <= trList.size(); i++) {
                //初始化头部图片
                if ($(trList[i]).attr('sort_name') == sort_name) {
                    addImg($(trList[i]), sort_order);
                } else {
                    addImg($(trList[i]), '');
                }
            }
        }

        //将数据进行排序
        function changeTableBody(p, sort) {
            data = new Array();
            //所选的行
            var trBodyList = $(p).find("tr:lt(" + settings.endRow + "):gt(" + settings.startRow + ")");
            trBodyList.each(function (i) {
                data[i] = new Array();
                $(this).find("td").each(function (j) {
                    data[i][j] = $(this).html();
                });
            });
            data.sort(function (x, y) {
                if (sort == 'asc') {
                    return x[settings.index].localeCompare(y[settings.index]);
                } else {
                    return y[settings.index].localeCompare(x[settings.index]);
                }
            });
            trBodyList.each(function (i) {
                $(this).find("td").each(function (j) {
                    $(this).html(data[i][j]);
                });
            });
        }

        /**
         * 为每个表格头部添加图片
         */
        function addImg(trList, sort_name) {
            sort_name = sort_name ? sort_name : '';
            if (sort_name) {
                trList.find("img").remove();
                if (sort_name == 'desc') {
                    trList.append('<img src="' + settings.ascDefaultImgUrl + '" style="position: absolute; margin-left: 5px;" />');
                    trList.append('<img src="' + settings.descImgUrl + '" style="position: absolute;margin-left: 5px;margin-top: 10px;" />');
                    trList.attr('sort_order', 'desc');
                } else {
                    trList.append('<img src="' + settings.ascImgUrl + '" style="position: absolute; margin-left: 5px;" />');
                    trList.append('<img src="' + settings.descDefaultImgUrl + '" style="position: absolute;margin-left: 5px;margin-top: 10px;" />');
                    trList.attr('sort_order', 'asc');
                }
            } else {
                trList.find("img").remove();
                trList.append('<img src="' + settings.ascDefaultImgUrl + '" style="position: absolute; margin-left: 5px;" />' +
                    '<img src="' + settings.descDefaultImgUrl + '" style="position: absolute;margin-left: 5px;margin-top: 10px;" />');
                trList.attr('sort_order', 'asc');
            }
            trList.css('cursor', 'pointer');
            trList.attr('title', '点击进行排序');
            trList.find("img:first-child").css('margin-left', '5px');

        }

        /**
         * 移出当前点击表格升序/降序图片
         */
        function removeImg(p, sort) {
            var sort_name = $(p).attr('sort_name');//排序字段
            // var re_la = layer.load(3); //换了种风格
            location_href_sort({sort_name: sort_name, sort_order: sort});
            // $iframe.attr("src", sort_url + "?sort_name=" + sort_name + "&sort_order=" + sort);
            // var imgUrl = sort == 'desc' ? settings.ascImgUrl : settings.descImgUrl;
            // $(p).find("img").each(function () {
            //     if ($(this).attr("src") == imgUrl) {
            //         $(this).remove();
            //         return false;
            //     }
            // });
        }

        function location_href_sort(get_obj) {
            debugger;
            var GET_URL = urlGet();
            jQuery.each(get_obj, function (i_get, val) {
                GET_URL[i_get] = decodeURIComponent(val);
            });
            GET_URL = jQuery.param(GET_URL);
            window.location.href = urlGet('url') + '?' + GET_URL;
        }

        function urlGet(get) {
            get = get ? get : 'get';
            var aQuery = window.location.href.split("?");//取得Get参数
            if (get == 'url') {
                return aQuery[0];
            }
            var aGET = {};
            if (aQuery[1] && aQuery[1].length > 1) {
                var aBuf = aQuery[1].split("&");
                for (var i = 0, iLoop = aBuf.length; i < iLoop; i++) {
                    var aTmp = aBuf[i].split("=");//分离key与Value
                    aGET[aTmp[0]] = decodeURIComponent(aTmp[1]);
                }
            }
            return aGET;
        }

        return this;
    };
})(jQuery);
