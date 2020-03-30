// JavaScript Document

define('mobile.mobileSortable.mobileMultiplePopup1',
'mobile.mobilePopup, mobile.mobileSortable.mobileSortMenu, widge.overlay.confirmBox, widge.overlay.hbDialog', 
function(require, exports, module){

	var $ = module['jquery'],
		popup = module['mobile.mobilePopup'],
		mobileSortMenu = module['mobile.mobileSortable.mobileSortMenu'],
		hbDialog = module['widge.overlay.hbDialog'],
		ConfirmBox = module['widge.overlay.confirmBox'],
		util = require('base.util'),
		shape = module['base.shape'],
		loader = '<div class="loader" style="padding:20px 0;font-size:18px;text-align:center">正在加载数据中...</div>',
		loaderError = [
			'<div class="loader" style="padding:20px 0;font-size:18px;text-align:center">错误：加载数据失败</div>',
			'<div style="padding:10px 0;text-align:center"><a class="errorBtn" href="javascript:">确定</a></div>'
		].join(''),
		dialogHTML = [
        	'<div class="pop-pd15">',
            '<span class="sub-tit02">意向职位</span>',
            '<input class="pop-put" type="text" name="t" value="" />',
            '<div class="trance-btn-bd">',
			'<a href="javascript:" class="gray cancelButton">取消</a>&nbsp;',
			'<a href="javascript:" class="sure yesButton">确定</a>',
            '</div></div>'
		].join(''),
		template = {
			loader: loader,
			item: [
				'<span data-id="{value}" data-value="{label}">{label}<i class="icon-AI-_-24 "></i></span>'
			].join(''),
			navigation: [
				'<div class="promptBar"><a class="addButton blueBtn" href="javascript:">添加</a>没有找到合适的职位？</div>',
			].join(''),
			content: [
				'<div class="pose-p02 contentPanel">',
				'<div class="pose-lt"></div>',
				'<div class="popup-rt"><div class="pose-rt"></div></div>',
				'</div>'
			].join(''),
			footer: [
				'<div class="pose-p03 bottomPanel">',
				'<div class="topPanel">',
				'<span class="pose-tit">已选择<em>（只能选择{maxLength}个）</em></span>',
				'<div class="sub-pose statusPanel">',
				'</div></div>',
				<!--'<span class="pose-tit03">没有找到合适的职位？<a class="addButton" href="javascript:">添加</a></span>',-->
				'<div class="trance-btn-bd pose-btn15">',
                '<a href="javascript:" class="gray cancelButton">取消</a>&nbsp;&nbsp;&nbsp;',
                '<a href="javascript:" class="sure yesButton">确定</a>',
				'</div></div>'
			].join('')
		};
	var pWidth = 70, fontSize = 18;
	
	var mobileMultiplePopup1 = shape(function(o){
		mobileMultiplePopup1.parent().call(this, util.merge({
			maxLength: 3,
			popup: {
				title: '意向职位',
				yesBtn: false,
				close: false
			},
			url: '//assets.huibo.com/js/v2/data/blueJobSortData.js'
		}, o));
		this.init();
	});
	
	mobileMultiplePopup1.implement({
		init: function(){
			this._isInit = true;
			this._initPopup();
			this._initMenu();
			this._initEvents();
		},
		_initPopup: function(){
			this._popup = new popup(this.get('popup'));
			
			var nav = util.string.replace(template.navigation, {
				maxLength: this.get('maxLength')
			});
			var content = template.content;
			var footer = util.string.replace(template.footer, {
				maxLength: this.get('maxLength')
			});
			
			var html = loader + '<div class="popupContent" style="display:none">' + nav + content + footer + '</div>';
			this._popup.setContent(html);
			this._topPanel = this._popup.query('.topPanel');
			this._statusPanel = this._popup.query('.statusPanel');
		},
		_initMenu: function(){
			this._menu = new mobileSortMenu({
				element: this._popup.query('.pose-rt'),
				trigger: this._popup.query('.pose-lt'),
				selectedId: this.get('selectedId'),
				maxLength: this.get('maxLength'),
				url: this.get('url')
			});
		},
		_initDialog: function(){
			if(!this._dialog){
				this._dialog = new hbDialog({
					idName: 'trance-pop01',
					content: dialogHTML,
					width: '80%'
				});
				var self = this;
				this._dialog.query('.cancelButton').on('click',function(){
					self._dialog.hide();
          $("#register_marke_scan").show();
				});
				var dialogInput = this._dialog.query('input[name=t]');
				var data = this._menu.getData();
				var id = 100000;
				
				this._dialog.after('hide', function(){
					dialogInput.val('');
				});
				this._dialog.query('.yesButton').on('click',function(){
					var value = $.trim(dialogInput.val());
					var msg = '';
					if(!value.length){
						msg = '请填写意向职位';
					}
					if(data.object[value]){
						msg = '不能重复';
					}
					if(self._menu.isLimit()){
						msg = '不能超过' + self.get('maxLength') + '项';
					}
					if(msg){
						ConfirmBox.timeBomb(msg, {
							name: 'warning',
							width: pWidth + msg.length * fontSize,
							timeout: 800
						});
						return;
					}
					var cid = 'lvhe' + (id += 1);
					self._menu.addSelectedItem(cid, value);
					self._statusPanel.append(util.string.replace(template.item, {
						label: value,
						value: cid
					}));
					self.updateHeaderPanel();
					self.updateLayout();
					self._dialog.hide();
          $("#register_marke_scan").show();
				});
			}
		},
		_initEvents: function(){
			var self = this;
			this._menu.on('selected', function(e){
				if(!e.isSelected){
					self._updateStatusPanel(e);
				} else {
					self._updateStatusPanel(e, true);
				}
				self.updateHeaderPanel();
				self.updateLayout();
			});
			this._menu.on('limit', function(){
				var msg = '不能超过' + self.get('maxLength') + '项';
				ConfirmBox.timeBomb(msg, {
					name: 'warning',
					width: pWidth + msg.length * fontSize,
					timeout: 800
				});
			});
			this._menu.on('initError', function(){
				self._popup.setContent(loaderError);
				self._popup.query('.errorBtn').on('click', function(e){
					self._popup.hide();
				});
			});
			this._menu.on('loadComplete', function(){
				self._initDialog();
				self._popup.query('.loader').remove();
				self._popup.query('.popupContent').show();
				self.updateLayout();
			});
			this._popup.query('.cancelButton').on('click', function(e){
				self.clear();
				self._popup.hide();
			});
			this._popup.query('.yesButton').on('click', function(e){
				var arr = [];
				var ids = [];
				// console.log(self._menu.getData().object);
				$.each(self._menu.getData().object, function(key, val){
					arr.push(val);
					ids.push(key);
				});
				e.data = arr.join(',');
				e.ids = ids.join(',');
				e.jobDate = self._menu.getData().object;
				self.trigger('submit', e);
				self._popup.hide();
			});
			this._popup.query('.addButton').on('click', function(e){
				$("#register_marke_scan").hide();
				if(self._menu.isLimit()){
					var msg = '只能选三个';
					ConfirmBox.timeBomb(msg, {
						name: 'warning',
						width: pWidth + msg.length * fontSize,
						timeout: 800
					});
					return;
				}
				self._dialog.show();
			});
			this._popup.on('resize', function(){
				self.updateLayout();
				self._dialog && self._dialog.setPosition();
			});
			this._popup.after('hide', function(){
				self._dialog && self._dialog.hide();
			});
		},
		_initAfterEvents: function(){
			var self = this;
			this._statusPanel.on('click', 'span', function(e){
				var target = $(e.currentTarget);
				var eventObj = {
					label: target.attr('data-value'),
					value: target.attr('data-id')
				};
				self._updateStatusPanel(eventObj, true);
				self._menu.delSelectedItem(eventObj.value);
				self.updateHeaderPanel();
				self.updateLayout();
			});
		},
		clear: function(){
			this._menu.clearSelectedItem();
			this._statusPanel.empty();
			this.updateHeaderPanel();
			this.updateLayout();
		},
		updateLayout: function(){
			if(!this._topPanel){
				return;
			}
			var headerH = this._popup._header.outerHeight(true);
			var bottomPanelH = this._popup.query('.bottomPanel').outerHeight(true);
			var topPanelH = this._popup.query('.promptBar').outerHeight(true);
			var totalHeight = headerH + bottomPanelH + topPanelH;
			this._popup.query('.contentPanel').height($(window).outerHeight() - totalHeight);
		},
		updateHeaderPanel: function(){
			var data = this._menu.getData();
			if(data.array.length){
				this._topPanel.show();
			} else {
				this._topPanel.hide();
			}
		},
		_updateStatusPanel: function(data, f){
			var val = data.label;
			try{
				var selectedStatusEl = this._statusPanel.children('[data-value=' + val + ']');
			} catch (e) {
				var selectedStatusEl = this._statusPanel.children().filter(function(){
					if($(this).attr('data-value') == val){return true;}
				});
			}
			if(!selectedStatusEl.length && !f){
				this._statusPanel.append(util.string.replace(template.item, data));
			}
			if(selectedStatusEl.length && f){
				selectedStatusEl.remove();
			}
		},
		show: function(){
			if(this._isInit){
				var self = this;
				setTimeout(function(){
					self._menu.init();
					self.updateHeaderPanel();
					self.updateLayout();
					self._initAfterEvents();
				}, 1);
				delete this._isInit;
			}
			this._popup.show();
		},
		hide: function(){
			this._popup.hide();
		}
	});
	
	return mobileMultiplePopup1;

});