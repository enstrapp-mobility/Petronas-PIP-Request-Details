/* global QUnit */
QUnit.config.autostart = false;


sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ZEMT_AM_PUR_APP/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});