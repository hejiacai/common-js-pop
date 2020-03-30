/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.toolbar = 'Cms';
	config.toolbar_Cms =
	[
	['Source','-'],
	['Cut','Copy','Paste','PasteText','PasteFromWord','-'],
	['Undo','Redo','-','Find','Replace','RemoveFormat'],['Link','Unlink'],
	['Image','Table','HorizontalRule', '-'],['Maximize'],
	'/',
	['Bold','Italic','Underline','Strike','-'],
	['FontSize'],['TextColor','BGColor'],
	['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
	['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
	['PageBreak', 'Page']
	];
	config.filebrowserUploadUrl = '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files';
	config.fontSize_sizes = '10/10px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;28/28px;32/32px;48/48px;';
	config.filebrowserImageUploadUrl = 'http://cp.boss.huibo.com/file/savecontentfile/type-img'; //图片上传
};
