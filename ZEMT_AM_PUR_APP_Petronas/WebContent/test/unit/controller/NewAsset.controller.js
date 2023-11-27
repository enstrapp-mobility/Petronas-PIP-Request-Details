/*global QUnit*/

sap.ui.define([
	"ZEMT_AM_PUR_APP/controller/MasterDataManagement.controller"
], function (Controller) {
	"use strict";
	QUnit.module("MasterDataManagement Controller");

	QUnit.test("I should test the MasterDataManagement controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});