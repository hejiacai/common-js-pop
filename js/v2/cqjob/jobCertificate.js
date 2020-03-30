/**
 *  jquery certificate plug-in  1.1
 *  Copyright (c)  2013 ZhangYu
 */
define('cqjob.jobCertificate', function(require, exports, module){
	
	var $ = module['jquery'];
	var Cert = function (element,opt) {
		this.$element = element;
		this._defaults = {
			  template:'    <div class="dropLst">'+
						'	  <div class="dropLstCon">'+
						'		<div class="dipTab">'+
						'		  <div class="dipTabL"><a class="hbFntWes" href="#"></a></div>'+
						'		  <div class="con">'+
						'			<div class="scroll">'+
						'			</div>'+
						'		  </div>'+
						'		  <div class="dipTabR"><a class="hbFntWes" href="#"></a></div>'+
						'		</div>'+
						'		<div class="dipTabC">'+
						'		</div>'+
						'	  </div>'+
						'	</div>',
					  cerName:null 		
		};
		this.options = $.extend({}, this._defaults,opt);
		this.wrap = $(this.options.template).appendTo(this.$element);
		this.left = this.$element.find('.dipTabL a.hbFntWes');
		this.right = this.$element.find('.dipTabR a.hbFntWes');
		this.header = this.$element.find('.scroll'); 
		this.content = this.$element.find('.dipTabC');
		var self = this;		
		
		return {
			init: function (category) {
				var header = ['热门证书','服务行业','普工类','驾照/操作证','建筑/工程类','计算机证书','语言证书','财务/审计','商务类','教师/律师','医疗/卫生','职称证书'];
				var b = ["大学英语四级~C1驾照~健康证~秘书资格证~房地产经纪人~全国计算机二级证书~C2驾照~护工证~会计从业资格证~期货从业资格证~CAD绘图师~导游证~家政员资格证~助理工程师~企业培训师~一级建造师~厨师证~教师资格证~项目管理师~消防中控证~二级建造师~美容师资格证~早教资格证~物业管理师~安全员资格证", "导游证~厨师证~月嫂证~育婴师资格证~家政员资格证~早教资格证~护工证~宠物美容师资格证~发型师资格证~美容师资格证~化妆师资格证~按摩师资格证~美甲师资格证~救生员证~潜水证~公共营养师~调酒师资格证~音响调音师~放映师资格证~播音员主持人资格证", "制冷工上岗证~水暖工上岗证~防水工上岗证~管道工上岗证~锅炉工上岗证~司炉工上岗证~直燃机操作员上岗证~电工上岗证~水电工上岗证~空调工上岗证~焊工上岗证~装配钳工上岗证~机修钳工上岗证~木工上岗证~绿化工上岗证~车工上岗证~铣工上岗证~磨工上岗证~镗工上岗证~冷作钣金工上岗证~涂装工上岗证~砌筑工上岗证~电梯工上岗证~家电维修工上岗证", "A1驾照~A2驾照~A3驾照~B1驾照~B2驾照~C1驾照~C2驾照~C3驾照~客运资格证~货运资格证~机动车驾驶员资格证~危险物品运输证~特种车操作证~吊车操作证~叉车操作证~铲车操作证~挖掘机操作证", "一级建造师~建设工程造价员~造价工程师~建筑弱电工程师~注册咨询工程师~二级建造师~建筑施工员~注册建筑师~房地产估价师~质检工程师~CAD绘图师~建筑预算员~注册土木工程师~物业管理师~消防中控证~项目经理资格证~建筑材料员~注册结构工程师~装饰预算员~安全工程师~注册监理工程师~建筑安全员~电气工程师~设备监理师~园艺师资格证", "全国计算机软件证书~全国计算机一级证书~全国计算机二级证书~全国计算机三级证书~全国计算机四级证书~计算机初级证书~程序员证书~系统分析员证~MCSE~MCDST~MCAD~MCP~MCSA~MCSD~MCDBA~CCIE~CCNA~CCNP~CCCP~CCIP~CAD绘图师~MCT", "大学英语四级~中级口译证书~托业~全国公共英语~日语五级~大学英语六级~高级口译证书~GRE~俄语四级~日语四级~普通话一级乙等~英语专业四级~GMAT~法语四级~日语三级~普通话一级甲等~英语专业八级~雅思~法语六级~日语二级~普通话二级甲等~托福~剑桥商务英语~德语六级~日语一级", "会计上岗证~会计从业资格证~注册会计师~注册税务师~审计师资格证~国际财务会计", "秘书资格证~保险经纪人~保险代理人~精算师资格证~房地产经纪人~心理咨询师~企业法律顾问资格证~企业培训师~职业经理人~理财规划师~项目管理师~人力资源管理师~二手车评估师~汽车美容师~物流师资格证~策划师资格证~期货从业资格证~证券投资分析师~注册拍卖师~安全员资格证~报关员资格证~报检员资格证~单证员资格证", "教师~教师资格证~幼师资格证~亲子教师资格证~蒙氏教师资格证|律师~律师资格证~高级律师~副高级律师~中级律师~初级律师", "护士资格证~护师资格证~临床执业医师~临床助理医师~中医执业医师~中医助理医师~中西医执业医师~中西医助理医师~口腔执业医师~口腔助理医师~公共执业医师~公共助理医师~执业药师资格证~中医师资格证~主管护师资格证~检验师资格证", "会计~助理会计师~会计师~高级会计师|工程师~助理工程师~初级工程师~中级工程师~高级工程师|医师~医师~主治医师~副主任医师~主任医师|经济~助理经济师~初级经济师~中级经济师~高级经济师|统计~助理统计师~统计师~高级统计师"];	
				var h = new Array(),
					index = 0;
				for(var k = 0,lenk = header.length;k<lenk;++k) {
					var p = '';
					/*
					if(k ==0 )
					{
						p='cu';
				    }
					h.push('<a href="javascript:void(0);" class="'+p+'">'+header[k]+'</a>');
					*/
					if(typeof category =='string') {
						if(header[k]==category) {
							index = k;
							p='cu';
						}
						
					}else
					{
						if(k ==0 )
						{
							index = k ;
							p='cu';
						}	
					}
					h.push('<a href="javascript:void(0);" class="'+p+'">'+header[k]+'</a>');
				}
				self.header.append(h.join(''));
				var c = '';
				for (var i = 0, len = b.length; i < len; ++i) {
					var d = b[i];
					if (i != 9 && i != 11) {
						//var e = (i == 0) ? '' : ' none';
						var e = (i == index) ? '' : ' none';
						c += '<div class="dipTabCon pt '+e+'"><ul>';
						var f = d.split('~');
						for (var j = 0, lenj = f.length; j < lenj; ++j) {
							c += '<li><a href="javascript:;" incTag="false">' + f[j] + '</a></li>'
						}
						c += '</ul><div class="clear"></div></div>'
					} else {
						c += '<div class="dipTabCon oth none">';
						var g = d.split('|');
						for (var j = 0, lenj = g.length; j < lenj; ++j) {
							var h = g[j].split('~');
							c += '<dl><dt>' + h[0] + '</dt><dd><ul>';
							for (var k = 1, lenk = h.length; k < lenk; ++k) {
								c += '<li><a href="javascript:;">' + h[k] + '</a></li>'
							}
							c += '</ul><div class="clear"></div></dd></dl>'
						}
						c += '</div>'
					}
				}
				self.content.append(c);
				self.left.mouseover(function () {
					var a = $(this);
					self.header.animate({
						left: "0"
					}, 50);
				});
				self.right.mouseover(function () {
					var a = $(this);
					self.header.animate({
						left: "-587px"
					}, 50);
				});
				
				self.header.find('a').click(function() {
					var index = $(this).siblings('a.cu').removeClass('cu').end().addClass('cu').index();
					self.content.find('.dipTabCon ').eq(index).siblings().addClass('none').end().removeClass('none');
				
				});
				
				// 选择事件
				self.content.find("a").click(function () {
					$('#'+self.options.cerName).val($(this).text()).focus();
					self.wrap.hide();
					self.options.select && self.options.select();
				});
				
				// 显示隐藏
				var cerInput = $('#'+self.options.cerName),
					cerBtn = cerInput.prev();
				if(self.options.isBtn && cerBtn.length){
					cerBtn.click(toggleWrap);
				} else {
					cerInput.click(toggleWrap);
				}
				cerInput.on('keyup', function(){
					if(self.options.isBtn){
						if(self.wrap.is(':visible')){
							self.wrap.hide();
						}
					} else {
						if($(this).val()!='') {
							 self.wrap.hide();
						} else {
							 self.wrap.show();
						}
					}  
				}).on('blur', function(){
					self.options.blur && self.options.blur();
				});
				
			   function toggleWrap(){
					if (!self.wrap.is(':hidden')) {
						self.wrap.hide();
					} else {
						self.wrap.show();
					}  
			   }
		 
			   var inID = self.$element.attr('id');	
			   $('body').click(function(e){
					// 检测发生在body中的点击事件，隐藏日历控件
					var cell = $(e.target);
					if (cell)
					{
						var tgID = $(cell).attr('id') == '' ? "string" : $(cell).attr('id');
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
	};
	$.fn.certificate = function (option) {
		var $this   = $(this);
		var data    = $this.data('bs.cer');
		var options = typeof option == 'object' && option;
		if (!data) {
			data = new Cert($this, options);
			data.init(options.category);
			$this.data('bs.cer', data);
		}
	}	
	return $;
});
