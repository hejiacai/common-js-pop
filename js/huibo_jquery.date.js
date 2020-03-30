(function($) {
	var v = (function() {
		// j:索引,k:id ， l:编号 m:类型，n:显示个数,o:最小年 p:最大年,q:年编号, r:月编号,s：月日对象
		var u = function(j, k, l, m, n, o, p, q, r, s) {
			var t = null,
			_index = j,
			_keyword = k,
			_id = l,
			_input = $("#" + _id),
			_div = null,
			_type = m,
			_size = n,
			_min = o,
			_max = p,
			_now = p,
			_next = s,
			_identity =true,
			_isLeapYear = function(a) {
				// 瑞年判断
				if (a) {
					a = parseInt(a);
					if (a % 400 == 0 || (a % 4 == 0 && a % 100 != 0)) {
						return true;
					}
				}
				return false;
			},
			_hideAlert = function() {
				// 隐藏弹窗
				var a = $("#sp" + _keyword + "Info");
				if (a[0]) {
					a.hide();
				}
			},
			_filter = function() {
				// 过滤
				var a = 0,
				stop = 0;
				if ("y" == _type) {
					stop = _now;
					a = _now - _size + 1;
					if (3 == _index) {
						var b = $("#" + _id.replace("End", "Start")).val();
						if (b != "") {
							b = parseInt(b);
							if (b > a) {
								a = b;
								if (stop - a < _size) {
									stop = a + _size - 1;
									if (stop > _max) {
										stop = _max
									}
								}
							}
						}
					}
					var c = new Array();
					for (var i = a; i <= stop; ++i) {
						 c.push('<li><a href="javascript:;">' + i + '</a></li>');
					}
					_div.find("ul").html(c.join(''));
					_div.find("ul a").click(t.onSelect)
				} else if ("d" == _type) {
					var d = 31;
					var e = _id.replace("Date", "");
					var f = $("#" + e + "Year").val();
					var g = $("#" + e + "Month").val();
					if ("4" == g || "6" == g || "9" == g || "11" == g) {
						d = 30
					} else {
						if (_isLeapYear(f)) {
							// 瑞年29天
							if ("2" == g) {
								d = 29
							}
						} else {
							if ("2" == g) {
								d = 28
							}
						}
					}
					//alert(d);
					var h = _div.find("ul");
					h.find("li:gt(27)").show();
					h.find("li:gt(" + (d - 1) + ")").hide();
				}
			},
			_arrow = function() {
				//箭头指示
				var a = _min;
				if (3 == _index) {
					var b = $("#" + _id.replace("End", "Start")).val();
					if (b != "") {
						b = parseInt(b);
						a = b
					}
				}
				//alert(_max - a < _size);
				if (_max - a < _size) {
					_div.find("[class^=box]").hide();
					return;
				} else {
					if (_now - a < _size) {
						_div.find(".pro").hide();
					} else {
						_div.find(".pro").show();
					}
					if (_now >= _max) {
						_div.find(".next").hide();
					} else {
						_div.find(".next").show();
					}
				}
			},
			_hideAll = function() {
				$('.dateDrop').hide();
			};
			this.onFocus = function(e) {
  				_identity = false;
				_hideAlert();
				_hideAll();
				_filter();
				_arrow();
				_div.show();
			};
			this.onPreNext = function() {
				var a = $(this).attr("class");
				if ("pro" == a) {
					// 年的上一页，下一页
					_now -= _size;
					if (_now < _min + _size) {
						_now = _min + _size - 1
					}
				} else if ("next" == a) {
					_now += _size;
					if (_now > _max) {
						_now = _max
					}
				}
				_filter();
				_arrow();
				return this;
			};
			this.onSelect = function() {
				 //选中
				_input.val($(this).text());
				_hideAll();
				if (_next) {
					// 判断下一个日期输入框是否有值，如果么有，自动获取焦点，显示选择项
					if (_next.val() == ""||(parseInt(_next.val())>12&&parseInt(_next.val())<32)) {
						if (3 == _index) {
							_input.parent().next().show();
						}
						_next.focus();
					}
				}
				return this;
			};
			this.onNowClear = function() {
				_div.hide();
				var a = _id.replace("inp", "sp").replace("Year", "");  // 当在选年的时候选择至今项时，隐藏月的控件
				var b = $(this).text();
				if ("至今" == b) {
					_input.val("至今");
					$("#" + a).hide();
					_next.val("")
				} else {
					_input.val("");
					$("#" + a).show();
					_next.val("")
				}
			};
			this.init = function() {
				t = this;
				var a = {
					y: "year",
					m: "month",
					d: "date"
				};
				var elID = 'divsel'+ a[_type];
				var b = '<div style="display:none; z-index:2;" class="dateDrop dateYear" id="' + elID + '" i="' + _index + '"><ul class="yearLst">';
				var c = _min;
				var d = _max;
				if ("d" == _type) {
					b = '<div style="display:none;" class="dateDrop dateDay" id="' + elID + '" i="' + _index + '"><ul class="yearLst">';
					c = 1;
					d = 31
				} else if ("m" == _type) {
					 b = '<div style="display:none;" class="dateDrop dateMon" id="' + elID + '" i="' + _index + '"><ul class="yearLst">';
					c = 1;
					d = 12
				}
				for (var i = c; i <= d && _type != "y"; ++i) {
					b += '<li><a href="javascript:;">' + i + '</a></li>';
				}
				b += '</ul>';
				if ("y" == _type) {
					b += '<div class="pro" i="' + _index + '"><a href="javascript:;"><i class="hbFntWes">&#xf053;</i></a></div><div class="next" i="' + _index + '"><a href="javascript:;"><i class="hbFntWes">&#xf054;</i></a></div>';
				}
				 b += '</div>';
				_input.after(b);
				_div = _input.next();
				_input.focus(this.onFocus);
				_div.find("ul a").click(this.onSelect);
				if (3 == _index) {
					_div.find("ul").after('<div style="height:25px; margin-bottom:2px; text-align:center;">[<a href="javascript:void(0);" class="nowclear">至今</a>] [<a href="javascript:void(0);" class="nowclear">清除</a>]</div>');
					_div.find(".nowclear").click(t.onNowClear)
				}
				_div.find("div[class^=pro]").click(this.onPreNext);
				_div.find("div[class^=next]").click(this.onPreNext);
                // body click event
				
                $('body').click(function(e)
                {
					// 检测发生在body中的点击事件，隐藏日历控件
                    var cell = $(e.target);
                    if (cell)
                    {
						
					    var tgID = $(cell).attr('id') == '' ? "string" : $(cell).attr('id');
                        var inID = $(_input).attr('id');
                        var isTagert = false;
                        try
                        {
							 // 如果事件触发元素不是Input元素 并且不是发生在时间控件区域
                             isTagert = (tgID != inID) && ($(cell).closest('#' + elID).length <= 0) && (tgID != elID);
                        }
                        catch (e)
                        {
                            isTagert = false;
                        }
                        if (_identity&&isTagert)
                        {
                            _div.hide();
                        }
						_identity = true;
                    }
                });						
				return this;
			}
		};
		u.bind = function(p) {
			var a = [{
				id: "StartYear",
				t: "y"
			},
			{
				id: "StartMonth",
				t: "m"
			},
			{
				id: "StartDate",
				t: "d"
			},
			{
				id: "EndYear",
				t: "y"
			},
			{
				id: "EndMonth",
				t: "m"
			},
			{
				id: "EndDate",
				t: "d"
			}];
			var b = p.f6;
			for (var i = 0,
			len = b.length; i < len; ++i) {
				var f = b[i];
				var c = p.id;
				var d = "inp" + p.id + a[f].id;
				if (len < 4) {
					d = d.replace("Start", "").replace("End", "");// 编号
				}
				var e = a[f].t;  // type类型
				var g = ((i % 3 == 2) && p["onajiyear"]) ? $("#inp" + p.id + a[i - 2].id) : null; 
				var h = ((i % 3 == 2) && p["onajimonth"]) ? $("#inp" + p.id + a[i - 1].id) : null; 
				var j = "";
				if (i != len - 1) {
					// 不是最后一个
					j = "inp" + p.id + a[b[i + 1]].id;
					if (len < 4) {
						//  设置id
						j = j.replace("Start", "").replace("End", "")
						
					}
				}
				var k = (i != len - 1) ? $("#" + j) : null;
				var l = (new Date()).getFullYear();  // 当前年
				var m = (e == "y") ? p.size: 0;  //类型年 控制显示的个数
				var n = l + p.min + 1;  // 最小年
				var o = l + p.max;  //最大年
				var q = new huibo.date(f, c, d, e, m, n, o, g, h, k);
				// j:索引,k:id ， l:编号 m:类型，n:显示个数,p:最大年,q:年编号, r:月编号,s：月日对象
				q.init();
			}
		};
		return u
	})();
	window.huibo = window.huibo || {};
	window.huibo.date = v;
	$(function() {
		huibo.date.bind({
			id: "Pos",
			f6: [0, 1, 2],
			size: 20,
			min: -50,
			max: 0
		});
		huibo.date.bind({
			id: "Pos",
			f6: [0, 1,3, 4],
			size: 20,
			min: -50,
			max: 0
		});	
		huibo.date.bind({
			id: "Birth",
			f6: [0, 1, 2],
			size: 20,
			min: -55,
			max: 0
		})
	})
})(jQuery);