// JavaScript Document

define('product.resume.editMutilResume', 
	'product.resume.editResume',
function(require, exports, module) {

	var $ = module['jquery'],
		Class = require('base.class').Class,
		util = require('base.util'),
		editResume = module['product.resume.editResume'];
		
	var editMutilResume = Class(function(o){
			editMutilResume.parent().call(this, util.merge({
				element: $('#workInfor'),
				trigger: '.edt',
				addTrigger: '.edit',
				delTrigger: '.del',
				normalName: '.workRows',
				editName: '.edit-status-box',
				submitAddButton: '.saveAddBtn',
				isAll: false
			}, o));
		}).extend(editResume);
	
	editMutilResume.implement({
		_initElements: function(){
			editMutilResume.parent('_initElements').call(this);
			this._addTrigger = this.getDom(this.get('addTrigger'));
			this._delTrigger = this.getDom(this.get('delTrigger'));
			this._submitAddButton = this.getDom(this.get('submitAddButton'));
			if(this.get('isAll')){
				this._normalItem = this._normal.children();
			}
		},
		_initEvent: function(){
			editMutilResume.parent('_initEvent').call(this);
			var element = this.get('element'),
				self = this;
			this.before('_add', function(){
				this._edit.hide();
				if(this._isInit){
					setTimeout(function(){
						self.trigger('init');
						delete self._isInit;
					}, 2);
				}
			});
			element.on('click', this.get('submitAddButton'), function(e){
				e.otherEvent = "submitAdd";
				e.otherSubmitButton = self._submitAddButton;
				self._submit(e);
			});
			element.on('click', this.get('delTrigger'), util.bind(this._delete, this));
			element.on('click', this.get('addTrigger'), util.bind(this._add, this));
		},
		_toggle: function(e){
			var target = $(e.currentTarget), 
				index = this._trigger.index(target);

			if(e.status){
				this._oldIndex = index;
				if(this._normalItem){
					this._normalItem.show().eq(index).hide();
					this._edit.show();
				} else {
					this._normal.show();
					this._normal.eq(index).hide().after(this._edit.show());
				}
			} else {
				this._edit.hide();
				if(this._oldIndex != undefined){
					if(this._normalItem){
						this._normalItem.eq(this._oldIndex).show();
					} else {
						this._normal.eq(this._oldIndex).show();
					}
				}
			}
			if(e.isCancel) return;
			var self = this;
			this._submitAddButton.hide();
			setTimeout(function(){
				self._addTrigger.show();
				self.trigger('modify', e);
			},1);
		},
		getIndex: function(){
			return this._oldIndex;
		},
		_delete: function(e){
			e.target = $(e.currentTarget);
			var index = e.index = this._delTrigger.index(e.target);
			this.trigger('delete', e);
		},
		deleteList: function(index){
			if(index == undefined) return;
			if(this._normalItem){
				this._normalItem.eq(index).remove();
			} else {
				this._normal.show().eq(index).remove();
			}
			this._edit.hide();
			this._addTrigger.show();
			this.update();
			delete this._oldIndex;
			delete this._isAdd;
		},
		_handler: function(e){
			delete this._isAdd;
			e.status = true;
			this._toggle(e);
		},
		_cancel: function(e){
			delete this._isAdd;
			e.isCancel = true;
			this._addTrigger.show();
			editMutilResume.parent('_cancel').call(this, e);
		},
		_add: function(e){
			this.add();
			this.trigger('add', e);
		},
		add: function(){
			if(this._normalItem){
				this._edit.show();
				if(this._oldIndex != undefined)
					this._normalItem.eq(this._oldIndex).show();
			} else {
				this._normal.eq(0).before(this._edit.show());
				if(this._oldIndex != undefined)
					this._normal.eq(this._oldIndex).show();
			}
			delete this._oldIndex;
			if(this._isAdd) return;
			this._isAdd = true;
			this._addTrigger.hide();
			this._submitAddButton.show();
		},
		_submit: function(e){
			editMutilResume.parent('_submit').call(this, e);
		},
		update: function(){
			this._normal = this.getDom(this.get('normalName'));	
			this._trigger = this.getDom(this.get('trigger'));
			this._delTrigger = this.getDom(this.get('delTrigger'));
			if(this.get('isAll')){
				this._normalItem = this._normal.children();
			}
		},
		show: function(){
			if(this._normalItem){
				this._normalItem.show();
			}
			if(this._isAdd && this._addTrigger.is(':hidden')){
				this._addTrigger.show();
			}
			editMutilResume.parent('show').call(this);
		}
	});
	
	return editMutilResume;
	
});