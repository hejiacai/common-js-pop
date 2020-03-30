/**
 *   jQuery  skill plug-in 1.1
 *   Copyright (c)  2013 ZhangYu
 */
+function ($) {// "use strict"; 
	var Skill = function(element,opt) {
		this.$element = element;
		this._defaults = {
			  template:' <div class="dropLst" >'+
						'	<div class="dropLstCon">'+
						'		<div class="tecTab">'+
						'		</div>'+
						'		<div class="tecTabC">'+
						'		</div>'+
						'	</div>'+
						' </div>',
					  skillName:null
		};
		this.options = $.extend({}, this._defaults,opt);
		this.wrap = $(this.options.template).appendTo(this.$element);
		this.header = this.$element.find('.tecTab'); 
		this.content = this.$element.find('.tecTabC');
		var self = this;
		return {
			init: function() {
				var header = ['IT/计算机','家政/安保','美容/美发','健身/保健','烹饪/餐饮','影视/娱乐','汽车美容','物业维修'];
				var m = [{
					u: [{
						n: "Word",
						v: 0
					},
					{
						n: "Excel",
						v: 0
					},
					{
						n: "PowerPoint",
						v: 0
					},
					{
						n: "Visio",
						v: 0
					},
					{
						n: "Oracle ERP",
						v: 0
					},
					{
						n: "Photoshop",
						v: 0
					},
					{
						n: "CorelDraw",
						v: 0
					},
					{
						n: "Illustrator",
						v: 0
					},
					{
						n: "3DMAX",
						v: 0
					},
					{
						n: "Flash",
						v: 0
					},
					{
						n: "Java",
						v: 0
					},
					{
						n: "C",
						v: 0
					},
					{
						n: "C#",
						v: 0
					},
					{
						n: "C++",
						v: 0
					},
					{
						n: "PHP",
						v: 0
					},
					{
						n: "HTML ",
						v: 0
					},
					{
						n: "Dreamweaver",
						v: 0
					},
					{
						n: "JavaScript",
						v: 0
					},
					{
						n: "Fireworks",
						v: 0
					},
					{
						n: "AutoCAD",
						v: 0
					},
					{
						n: "Pro/E",
						v: 0
					},
					{
						n: "AutoCAD",
						v: 0
					},
					{
						n: "Solidworks",
						v: 0
					},
					{
						n: "UG",
						v: 0
					},
					{
						n: "单片机",
						v: 0
					}],
					s: [],
					m: [{
						n: "办公/企业管理",
						v: [{
							n: "Word",
							v: 0
						},
						{
							n: "Excel",
							v: 0
						},
						{
							n: "PowerPoint",
							v: 0
						},
						{
							n: "Outlook",
							v: 0
						},
						{
							n: "用友财务管理软件",
							v: 0
						},
						{
							n: "SAP",
							v: 0
						},
						{
							n: "SAS",
							v: 0
						},
						{
							n: "Visio",
							v: 0
						},
						{
							n: "Oracle ERP",
							v: 0
						},
						{
							n: "金蝶财务管理软件",
							v: 0
						}]
					},
					{
						n: "程序设计",
						v: [{
							n: "Java",
							v: 0
						},
						{
							n: "PHP",
							v: 0
						},
						{
							n: "Lisp",
							v: 0
						},
						{
							n: "Lua",
							v: 0
						},
						{
							n: "JPA",
							v: 0
						},
						{
							n: "C",
							v: 0
						},
						{
							n: "VB",
							v: 0
						},
						{
							n: "Delphi",
							v: 0
						},
						{
							n: "Ada",
							v: 0
						},
						{
							n: "IOS",
							v: 0
						},
						{
							n: "C#",
							v: 0
						},
						{
							n: "Python",
							v: 0
						},
						{
							n: "VB .net",
							v: 0
						},
						{
							n: "PL/SQL",
							v: 0
						},
						{
							n: "Android",
							v: 0
						},
						{
							n: "C++",
							v: 0
						},
						{
							n: "Perl",
							v: 0
						},
						{
							n: "Transact-SQL",
							v: 0
						},
						{
							n: "MATLAB",
							v: 0
						},
						{
							n: "SSH三大框架",
							v: 0
						},
						{
							n: "Objective-C",
							v: 0
						},
						{
							n: "Ruby",
							v: 0
						},
						{
							n: "Pascal",
							v: 0
						},
						{
							n: "VC++",
							v: 0
						},
						{
							n: "Ibatis",
							v: 0
						},
						{
							n: "Ajax",
							v: 0
						},
						{
							n: "ASP",
							v: 0
						},
						{
							n: "JSP",
							v: 0
						},
						{
							n: "MFC",
							v: 0
						},
						{
							n: "Qt",
							v: 0
						}]
					},
					{
						n: "电子/硬件设计类",
						v: [{
							n: "FPGA",
							v: 0
						},
						{
							n: "VHDL",
							v: 0
						},
						{
							n: "Protel",
							v: 0
						},
						{
							n: "DSP",
							v: 0
						},
						{
							n: "嵌入式系统",
							v: 0
						},
						{
							n: "PLC",
							v: 0
						},
						{
							n: "CPLD",
							v: 0
						},
						{
							n: "ARM",
							v: 0
						},
						{
							n: "单片机",
							v: 0
						},
						{
							n: "MCGS触屏软件",
							v: 0
						},
						{
							n: "仿真软件",
							v: 0
						}]
					},
					{
						n: "数据库类",
						v: [{
							n: "Access",
							v: 0
						},
						{
							n: "MySQL ",
							v: 0
						},
						{
							n: "SQLServer",
							v: 0
						},
						{
							n: "Oracle",
							v: 0
						},
						{
							n: "SPSS",
							v: 0
						},
						{
							n: "DB2",
							v: 0
						}]
					},
					{
						n: "操作系统类",
						v: [{
							n: "Linux",
							v: 0
						},
						{
							n: "Unix",
							v: 0
						},
						{
							n: "Windows",
							v: 0
						},
						{
							n: "Shell 编程",
							v: 0
						},
						{
							n: "Socket编程",
							v: 0
						},
						{
							n: "多线程编程",
							v: 0
						}]
					},
					{
						n: "网页技术类",
						v: [{
							n: "HTML ",
							v: 0
						},
						{
							n: "SOAP",
							v: 0
						},
						{
							n: "CSS+DIV",
							v: 0
						},
						{
							n: "JavaScript",
							v: 0
						},
						{
							n: "Fireworks",
							v: 0
						},
						{
							n: "jquery",
							v: 0
						},
						{
							n: "XML",
							v: 0
						},
						{
							n: "VBscript",
							v: 0
						},
						{
							n: "Web Service",
							v: 0
						},
						{
							n: "Dreamweaver",
							v: 0
						}]
					},
					{
						n: "工程制图类",
						v: [{
							n: "AutoCAD",
							v: 0
						},
						{
							n: "Solidworks",
							v: 0
						},
						{
							n: "UG",
							v: 0
						},
						{
							n: "3DMAX",
							v: 0
						},
						{
							n: "PFD/PID",
							v: 0
						},
						{
							n: "Pro/E",
							v: 0
						},
						{
							n: "NavisWorks",
							v: 0
						},
						{
							n: "Catia",
							v: 0
						},
						{
							n: "Plant 3D",
							v: 0
						},
						{
							n: "天正",
							v: 0
						},
						{
							n: "LabVIEW",
							v: 0
						},
						{
							n: "chemoffice",
							v: 0
						},
						{
							n: "origin",
							v: 0
						},
						{
							n: "ASPEN",
							v: 0
						},
						{
							n: "chemCAD",
							v: 0
						}]
					},
					{
						n: "设计类软件",
						v: [{
							n: "Photoshop",
							v: 0
						},
						{
							n: "Premiere",
							v: 0
						},
						{
							n: "Axure",
							v: 0
						},
						{
							n: "Pagemaker",
							v: 0
						},
						{
							n: "Illustrator",
							v: 0
						},
						{
							n: "CorelDraw",
							v: 0
						},
						{
							n: "After Effect",
							v: 0
						},
						{
							n: "3DMAX",
							v: 0
						},
						{
							n: "Painter",
							v: 0
						},
						{
							n: "Fireworks",
							v: 0
						},
						{
							n: "InDesign",
							v: 0
						},
						{
							n: "Edius",
							v: 0
						},
						{
							n: "Flash",
							v: 0
						},
						{
							n: "方正飞腾",
							v: 0
						},
						{
							n: "Rhino",
							v: 0
						},
						{
							n: "Authorware",
							v: 0
						},
						{
							n: "MAYA",
							v: 0
						}]
					},
					{
						n: "影视/后期",
						v: [{
							n: "After Effect",
							v: 0
						},
						{
							n: "Edius",
							v: 0
						},
						{
							n: "视频格式转换软件",
							v: 0
						},
						{
							n: "DS",
							v: 0
						},
						{
							n: "FinalCutPro",
							v: 0
						},
						{
							n: "AvidXpressPro",
							v: 0
						},
						{
							n: "Avid",
							v: 0
						},
						{
							n: "VCD/DVD光盘制作",
							v: 0
						},
						{
							n: "DPS",
							v: 0
						},
						{
							n: "Fire/Srnoke系统",
							v: 0
						},
						{
							n: "暗房技术",
							v: 0
						},
						{
							n: "DVStorm",
							v: 0
						}]
					}]
				},
				{
					u: [],
					s: [{
						n: "家政保洁",
						v: [{
							n: "早教",
							v: 0
						},
						{
							n: "烹饪",
							v: 0
						},
						{
							n: "催乳",
							v: 0
						},
						{
							n: "干洗",
							v: 0
						},
						{
							n: "婴儿抚触",
							v: 0
						},
						{
							n: "营养辅食",
							v: 0
						},
						{
							n: "产妇护理",
							v: 0
						},
						{
							n: "熨烫",
							v: 0
						},
						{
							n: "教婴儿游泳",
							v: 0
						},
						{
							n: "做月子餐",
							v: 0
						},
						{
							n: "心理疏导",
							v: 0
						},
						{
							n: "中医按摩",
							v: 0
						}]
					},
					{
						n: "安保",
						v: [{
							n: "散打",
							v: 0
						},
						{
							n: "擒拿",
							v: 0
						}]
					}],
					m: []
				},
				{
					u: [],
					s: [{
						n: "美发",
						v: [{
							n: "染烫",
							v: 0
						},
						{
							n: "吹风造型",
							v: 0
						},
						{
							n: "接发",
							v: 0
						},
						{
							n: "头发护理",
							v: 0
						}]
					},
					{
						n: "美容/美体",
						v: [{
							n: "刮痧",
							v: 0
						},
						{
							n: "眼部护理",
							v: 0
						},
						{
							n: "胃肠排毒",
							v: 0
						},
						{
							n: "八髎保养",
							v: 0
						},
						{
							n: "拔罐",
							v: 0
						},
						{
							n: "手部护理",
							v: 0
						},
						{
							n: "淋巴排毒",
							v: 0
						},
						{
							n: "乳腺保养（丰胸）",
							v: 0
						},
						{
							n: "针清粉刺",
							v: 0
						},
						{
							n: "脱毛护理",
							v: 0
						},
						{
							n: "美容沙龙",
							v: 0
						},
						{
							n: "卵巢保养",
							v: 0
						},
						{
							n: "问题性皮肤治疗",
							v: 0
						},
						{
							n: "美腿护理",
							v: 0
						},
						{
							n: "SPA熏香美体",
							v: 0
						}]
					},
					{
						n: "化妆师",
						v: [{
							n: "艺术写真造型",
							v: 0
						},
						{
							n: "舞台妆",
							v: 0
						},
						{
							n: "特效妆",
							v: 0
						},
						{
							n: "新娘妆",
							v: 0
						},
						{
							n: "立体矫正化术",
							v: 0
						},
						{
							n: "影视妆",
							v: 0
						},
						{
							n: "主持人妆",
							v: 0
						},
						{
							n: "时尚生活妆",
							v: 0
						}]
					},
					{
						n: "美甲师",
						v: [{
							n: "基础甲护理",
							v: 0
						},
						{
							n: "水晶美甲",
							v: 0
						},
						{
							n: "延长贴片",
							v: 0
						},
						{
							n: "嫁接睫毛",
							v: 0
						},
						{
							n: "手足营养护理",
							v: 0
						},
						{
							n: "光疗美甲",
							v: 0
						},
						{
							n: "艺术雕花",
							v: 0
						},
						{
							n: "蜜蜡脱毛",
							v: 0
						}]
					}],
					m: []
				},
				{
					u: [],
					s: [{
						n: "运动/健身教练",
						v: [{
							n: "营养学",
							v: 0
						},
						{
							n: "有氧训练",
							v: 0
						},
						{
							n: "抗阻力训练",
							v: 0
						},
						{
							n: "体适能基本技能",
							v: 0
						},
						{
							n: "急救",
							v: 0
						},
						{
							n: "拉伸技术",
							v: 0
						},
						{
							n: "运动损伤处理",
							v: 0
						},
						{
							n: "",
							v: 0
						}]
					},
					{
						n: "瑜伽/舞蹈老师",
						v: [{
							n: "街舞",
							v: 0
						},
						{
							n: "有氧派对",
							v: 0
						},
						{
							n: "动感单车",
							v: 0
						},
						{
							n: "时尚踏板操",
							v: 0
						},
						{
							n: "肚皮舞",
							v: 0
						},
						{
							n: "有氧舞蹈",
							v: 0
						},
						{
							n: "身心平衡",
							v: 0
						},
						{
							n: "极限搏击操",
							v: 0
						},
						{
							n: "尊巴",
							v: 0
						},
						{
							n: "有氧拉丁",
							v: 0
						},
						{
							n: "普拉提",
							v: 0
						},
						{
							n: "现代爵士舞",
							v: 0
						}]
					},
					{
						n: "推拿按摩/足疗",
						v: [{
							n: "拔罐",
							v: 0
						},
						{
							n: "中医美容",
							v: 0
						},
						{
							n: "乳腺保养",
							v: 0
						},
						{
							n: "嫁接睫毛",
							v: 0
						},
						{
							n: "针灸",
							v: 0
						},
						{
							n: "芳香SPA",
							v: 0
						},
						{
							n: "卵巢保养",
							v: 0
						},
						{
							n: "蜜蜡脱毛",
							v: 0
						},
						{
							n: "中医按摩",
							v: 0
						},
						{
							n: "胃肠排毒",
							v: 0
						},
						{
							n: "腰部保养",
							v: 0
						},
						{
							n: "手足营养护理",
							v: 0
						},
						{
							n: "中医减肥",
							v: 0
						},
						{
							n: "淋巴排毒",
							v: 0
						},
						{
							n: "八髎保养",
							v: 0
						},
						{
							n: "推十四经络",
							v: 0
						}]
					}],
					m: []
				},
				{
					u: [],
					s: [{
						n: "厨师/厨师长",
						v: [{
							n: "川菜",
							v: 0
						},
						{
							n: "湘菜",
							v: 0
						},
						{
							n: "鲁菜",
							v: 0
						},
						{
							n: "粤菜",
							v: 0
						},
						{
							n: "苏菜",
							v: 0
						},
						{
							n: "闽菜",
							v: 0
						},
						{
							n: "浙菜",
							v: 0
						},
						{
							n: "徽菜",
							v: 0
						},
						{
							n: "北京菜",
							v: 0
						},
						{
							n: "东北菜",
							v: 0
						},
						{
							n: "上海菜",
							v: 0
						},
						{
							n: "陕西菜",
							v: 0
						},
						{
							n: "台湾菜",
							v: 0
						},
						{
							n: "清真",
							v: 0
						},
						{
							n: "海鲜",
							v: 0
						},
						{
							n: "面点",
							v: 0
						}]
					},
					{
						n: "茶艺师",
						v: [{
							n: "准备与演示",
							v: 0
						},
						{
							n: "茶饮服务",
							v: 0
						},
						{
							n: "茶叶保健服务",
							v: 0
						},
						{
							n: "茶艺馆布局设计",
							v: 0
						},
						{
							n: "茶艺表演",
							v: 0
						},
						{
							n: "茶会组织",
							v: 0
						},
						{
							n: "茶艺创新",
							v: 0
						}]
					}],
					m: []
				},
				{
					u: [],
					s: [{
						n: "影视/娱乐",
						v: [{
							n: "电视主持",
							v: 0
						},
						{
							n: "车展主持",
							v: 0
						},
						{
							n: "婚宴主持",
							v: 0
						},
						{
							n: "展会主持",
							v: 0
						},
						{
							n: "广播主持",
							v: 0
						},
						{
							n: "年会主持",
							v: 0
						},
						{
							n: "拍卖会主持",
							v: 0
						}]
					}],
					m: []
				},
				{
					u: [],
					s: [{
						n: "汽车美容",
						v: [{
							n: "抛光",
							v: 0
						},
						{
							n: "清洗发动",
							v: 0
						},
						{
							n: "封釉",
							v: 0
						},
						{
							n: "精细镀膜",
							v: 0
						},
						{
							n: "打蜡",
							v: 0
						},
						{
							n: "内饰清洗",
							v: 0
						}]
					}],
					m: []
				},
				{
					u: [],
					s: [{
						n: "物业维修",
						v: [{
							n: "门窗维修",
							v: 0
						},
						{
							n: "电梯维修",
							v: 0
						},
						{
							n: "管道维修",
							v: 0
						},
						{
							n: "弱电维修",
							v: 0
						},
						{
							n: "空调维修",
							v: 0
						},
						{
							n: "电焊维修",
							v: 0
						},
						{
							n: "暖气维修",
							v: 0
						},
						{
							n: "给排水维修",
							v: 0
						}]
					}],
					m: []
				}];
				var k = new Array();
				for(var ij = 0,len = header.length; ij<len;++ij)　{
					var p = '';
					if(ij ==0 )
					{
						p='cu';
				    }
					k.push('<a href="javascript:void(0);" noclose="3" class="'+p+'">'+header[ij]+'</a>');
				}
				self.header.append(k.join(''));
				var content = new Array();; 
				for (var i = 0,
				len = m.length; i < len; ++i) {
					var n ='<div class="tecTabCon #class">';
					var s = m[i];
					if (s.u.length > 0) {
						n = n.replace('#class','cpt');
						n += '<div class="tecComUse">';
						n += '<ul>';
						for (var j = 0,
						lenj = s.u.length; j < lenj; ++j) {
							n += '<li><a href="javascript:;" noclose="0">' + s.u[j].n + '</a></li>'
						}
						n += '</ul><div class="clear"></div></div>'
					}
					if (s.s.length > 0) {
						n = n.replace('#class','same none');
						for (var j = 0,
						lenj = s.s.length; j < lenj; ++j) {
							var o = s.s[j];
							n += '<dl><dt>' + o.n + '</dt><dd><ul>';
							for (var k = 0,
							lenk = o.v.length; k < lenk; ++k) {
								n += '<li><a href="javascript:;" noclose="0">' + o.v[k].n + '</a></li>'
							}
							n += '</ul></dd></dl>'
						}
					}
					if (s.m.length > 0) {
						n += '<div class="tecComType"><ul>';
						for (var j = 0,
						lenj = s.m.length; j < lenj; ++j) {
							var q = s.m[j];
							n += '<li i="' + j + '"><a href="javascript:;" noclose="1">' + q.n + '<i class="hbFntWes">&#xf0d7;</i></a></li>';
							if (j % 5 == 4 || j == lenj - 1) {
								n += '<li style="display:none;" class="divJobCate3"></li>';
							}
							//n += '<li style="display:none;" class="divJobCate3"></li>';
						}
						n += '</ul></div>'
					}
					n += '</div>';
					content.push(n);
				}
				self.content.append(content.join(''));	
				$('#'+self.options.skillName).click(function() {
					if (!self.wrap.is(':hidden')) {
						self.wrap.hide();
					} else {
						self.wrap.show();
					}
				});
				var r = function() {
					var a = $(this);
					var b = a.attr("noclose");
					var c = self.wrap;
					var d = $('#'+self.options.skillName);
					switch (b) {
					case "0":
						d.val(a.text());
						c.hide();
						break;
					case "1":
						var e = a.parent();
						var f = e.attr("i");
						var g = e.hasClass("cu");
						if (g) {
							e.removeClass("cu");
							e.siblings(".divJobCate3").hide();
							return;
						}
						e.addClass("cu").siblings(".cu").removeClass("cu");
						var h = e.next();
						for (var i = 0; i < 4 && !h.hasClass("divJobCate3"); ++i) {
							if (h.next()) {
								h = h.next()
							}
						}
						var j = m[0].m[f].v;
						var k = '';
						for (var i = 0,
						len = j.length; i < len; ++i) {
							var l = j[i];
							k += '<div><a href="javascript:;" noclose="2">' + l.n + '</a></div>'
						}
						h.html(k).show().siblings(".divJobCate3").hide();
						h.find("a").bind("click", r);
						break;
					case "2":
						d.val(a.text());
						c.hide();
						a.parents(".divJobCate3").hide();
						a.parents("li").siblings(".cu").removeClass("cu");
				    case "3":
						var index = a.siblings('a').removeClass('cu').end().addClass('cu').index();
						self.content.find('.tecTabCon ').eq(index).siblings().addClass('none').end().removeClass('none');
						break;
					default:
						break
					}
				};
			   self.wrap.find('a').click(r);
			   $('body').click(function(e){
					// 检测发生在body中的点击事件，隐藏日历控件
					var cell = $(e.target);
					if (cell)
					{
						var tgID = $(cell).attr('id') == '' ? "string" : $(cell).attr('id');
						var inID = self.$element.attr('id');
						var isTagert = false;
						try
						{
							 // 如果事件触发元素不是Input元素 并且不是发生在时间控件区域
							 isTagert = (tgID != inID) && ($(cell).closest('#' + inID).length <= 0);
						}
						catch (e)
						{
							isTagert = true;
						}
						if (isTagert)
						{
							self.wrap.hide();
						}
					}
				});	 				
			}
		}
	}
  $.fn.skill = function (option) {
      var $this   = $(this);
      var data    = $this.data('bs.skill');
      var options = typeof option == 'object' && option;
      if (!data) {
		  data = new Skill($this, options);
		  data.init();
		  $this.data('bs.skill', data);
	  }
  }	
}(window.jQuery);