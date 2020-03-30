// JavaScript Document

define('template.follow', function(require, exports){
	
	exports.success = [
		'<div class="gzSuc">',
		'<p class="alt"><em class="hbIconMoon">&#xe0fb;</em>关注成功</p>',
		'<p class="gzNum">您已关注{count}个搜索项目<a href="{url}">查看我的关注&gt;&gt;</a></p>',
		'</div>',
		'<div class="setName">',
		'请将您关注的项目设定一个名称，以便查找和管理',
		'<form class="mgt15"><input type="text" class="input-txt" /> ',
		'<button type="button" class="button_a button_a_red">确定</button> ',
		'<button type="button" class="button_a cancelbtn">取消</button></form>',
		'</div>'
	].join('');
	exports.failed = [
		'<div class="gzFall">',
		'<p class="alt"><em class="hbIconMoon">&#xe0fb;</em>关注失败</p>',
		'</div>'
	].join('');
	
	return exports;
}); 