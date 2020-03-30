var isHas = false;
//缓存已匹配数据关键字
var fazzArr = [];

//初始化缓存数据
function initSearchData (fazzSearchListDom){
	isHas = false;
	fazzArr = [];
	fazzSearchListDom.html("").show();
}
function initDomStyle(DomThis){
	var fazzSearchListDom = DomThis.siblings('.fazzSearchList');
	fazzSearchListDom.html('').show();
	fazzSearchListDom.parent().css('position','relative');
	fazzSearchListDom.css({'width':DomThis.outerWidth()},{'padding':'10px 0 10px 6px'});
	if(("ontouchstart" in window)){
		fazzSearchListDom.css('width',DomThis.parent().outerWidth());
		if(fazzSearchListDom.hasClass('liPc')){
			fazzSearchListDom.removeClass('liPc');
		}
		fazzSearchListDom.addClass('liMoblie');
		if(fazzSearchListDom.hasClass('special')){
			fazzSearchListDom.css('width','172px');
		}
	}else{
		if(fazzSearchListDom.hasClass('liMoblie')){
			fazzSearchListDom.removeClass('liMoblie')
		}
		fazzSearchListDom.addClass('liPc');
	}
	if(fazzSearchListDom.hasClass('special')){
		fazzSearchListDom.css('top',DomThis.outerHeight())
	}
}
//子节点选中值 关闭列表
function fazzReaultitemClick (item_myself){
	item_myself.parent().html("").hide();
}
//添加匹配字段子节点
function fazzAddChild(item, selector){
	return "<li class='" + selector + "' data-val='" + item + "'>"+item+"</li>";
}
//清空数据
function fazzCloseChild(fazzSearchListDom1){
	isHas = false;
	fazzArr = [];
	fazzSearchListDom1.html("").hide();
}
//无数据
function fazzNoValueChild(fazzSearchListDom){
	isHas = false;
	fazzArr = [];
	fazzSearchListDom.html("<li class='fazzSearchNoData'>暂无数据</li>");
}
//处理数据
function adEventInputChange (searchList, DomThis, selector){
	var fazzSearchListDom = DomThis.siblings('.fazzSearchList');
	var fazzSearchValue = DomThis.val();
	if(fazzSearchValue==''){
		fazzCloseChild(fazzSearchListDom);
		return;
	}
	initDomStyle(DomThis);
	initSearchData(fazzSearchListDom);
	for (var i = 0; i < searchList.length; i++) {
		var result = searchList[i].indexOf(fazzSearchValue);
		if( result > -1 && fazzArr.indexOf(searchList[i])== -1){
			fazzSearchListDom.append(fazzAddChild(searchList[i], selector));
			fazzArr.push(searchList[i]);
			if(!isHas){
				fazzSearchListDom.find('.fazzSearchNoData').hide();
				isHas=true
			};
		}
	}
}
$(function(){
	$('#j_edu_major').on('blur',function(e){
		var self = $(this);
		var setT = setTimeout(function(){
			isHas = false;
			self.siblings('.fazzSearchList').html('').hide();
			console.log('失交');
			clearTimeout(setT)
		},300)
	})
})
