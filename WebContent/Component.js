sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "ZEMT_AM_PUR_APP/model/models", "sap/ui/core/Core"], function(UIComponent, Device, models, Core) {
	jQuery.sap.require("sap.ui.core.format.DateFormat");
	jQuery.sap.require("sap.m.MessageBox");
	// for Loading Excel read libs
	jQuery.sap.require("ZEMT_AM_PUR_APP/libs/jszip");
	jQuery.sap.require("ZEMT_AM_PUR_APP/libs/xlsx");
	// For connect Local or inside SAP
	jQuery.sap.require("ZEMT_AM_PUR_APP/connection/connection");
	return UIComponent.extend("ZEMT_AM_PUR_APP.Component", {
		metadata: {
			manifest: "json"
		},
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// enable routing
			this.getRouter().initialize();
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			Core.O_Login_user = {};
			var User_Url = "/sap/bc/ui2/start_up";
			var xmlHttp = null;
			xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function() {
				if(xmlHttp.readyState === 4 && xmlHttp.status === 200) {
					var obj = {};
					var User_details = JSON.parse(xmlHttp.responseText);
					obj.Muser = User_details.id;
					obj.Firstname = User_details.firstName;
					obj.LastName = User_details.lastName;
					obj.FullName = User_details.fullName;
					if(sap.ui.Device.system.desktop == true) {
						obj.DeviceUUID = "";
						obj.DeviceVersion = "1";
					} else {
						obj.DeviceUUID = device.uuid;
						obj.DeviceVersion = device.version;
					}
					Core.O_Login_user = obj;
				}
			};
			xmlHttp.open("GET", User_Url, false);
			xmlHttp.send(null);
		}
	});
});