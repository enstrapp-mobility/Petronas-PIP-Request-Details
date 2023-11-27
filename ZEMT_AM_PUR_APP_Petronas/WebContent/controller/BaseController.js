sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/core/Core",
	'sap/ui/model/json/JSONModel'
], function (Controller, History,MessageBox,Core,JSONModel) {
	return Controller.extend("ZEMT_AM_PUR_APP.controller.BaseController", {
		onInit: function() {
			
		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		// Load i18n for whole Application
		Loadi18n : function(){
			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			sap.ui.getCore().setModel(i18nModel, "i18n");
			Core.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
		},
		// Handle Error Response
		HandleError: function(err) {
			if(Core.DataSaveProgress._oDialog.isOpen() == true) {
				Core.DataSaveProgress.close();
			} else if(Core.DataSubmitProgress._oDialog.isOpen() == true) {
				Core.DataSubmitProgress.close();
			}
			if(err.response.statusCode == "401") {
				sap.m.MessageBox.error(Core.i18n.getText("SAP401msg"), {
					styleClass: "stock",
				});
				return false
			} else if(err.response.statusCode == "400") {
				var _Message = err.response.statusText;
				var _Gateway_Log = JSON.parse(err.response.body).error.message.value;
				var _error_msg = `${Core.i18n.getText("SAP400MSG")}
				${_Message} ${_Gateway_Log}`;
				sap.m.MessageBox.error(_error_msg , {
					styleClass: "stock",
				});
				return false
			} else if(err.response.statusCode == "500") {
				sap.m.MessageBox.error(Core.i18n.getText("SAP500MSGResubmit"), {
					styleClass: "stock",
				});
				return false
			} else {
				sap.m.MessageBox.error(Core.i18n.getText("SAP408Timeoutmsg"), {
					styleClass: "stock",
				});
				return false
			}
		},
		// Check Network status
		checkConnection: function() {
			if(sap.ui.Device.system.desktop == true) {
			Core.B_isonLine = navigator.onLine;
				if(Core.B_isonLine == false){
					if(Core.DataLoadProgress._oDialog.isOpen() == true){
						Core.DataLoadProgress.close();
					}else if(Core.DataSaveProgress._oDialog.isOpen() == true){
						Core.DataSaveProgress.close();
					}if(Core.DataSubmitProgress._oDialog.isOpen() == true){
						Core.DataSubmitProgress.close();
					}
				}
			}
        },
        // Format Date
        Format_Date : function(paramformat){
        	var Formatted_Date;
        	Formatted_Date = Core.DateFormat_yyyymmdd.format(new Date(paramformat));
        	return Formatted_Date;
        },
        showDocument : function() {
        	setTimeout(function(){
				var wrapper =	document.querySelector('.wrapper');
				wrapper.classList.add("fade");
				},50)
        },
        Calculate_Ageing : function(CompletionDate,ReportingDate){
        	var d1,d2,difference;
        	
        	d1 = Core.DateFormat_yyyy_mm_dd.format(new Date(CompletionDate));
        	d2 = Core.DateFormat_yyyy_mm_dd.format(new Date(ReportingDate));
        	
        	d1 = new Date(d1).getTime();
        	d2 = new Date(d2).getTime();
        	
        	difference = (d1 - d2) / 86400000;
        	return difference.toString();
        },
        // OdataModel for Whole Application
		oDataModel: function() {
			if(Core.is_Metadata_Failedto_Load == undefined || Core.is_Metadata_Failedto_Load == 'X') {
				var metadata = new sap.ui.model.odata.ODataModel(Core.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
				metadata.attachMetadataFailed(function() {
					Core.is_Metadata_Failedto_Load = 'X';
				});
				metadata.attachMetadataLoaded(function() {
					Core.is_Metadata_Failedto_Load = '';
				});
				return metadata;
			} else {
				Core.oDataModel.setHeaders({});
				return Core.oDataModel;
			}
		},
		
		// Service url's
		getService_Url: function(EntitySet, Headers, Filters) {
			var expand, filter, url, header_obj;
			var coockie = document.cookie;//;Path=/; Secure ; HttpOnly 'true'
			coockie != null && (coockie =`${coockie} ;Path=/; Secure ; HttpOnly 'true'`);
			var Authorization = btoa(`ENST1:2019`);
			Authorization = `Basic ${Authorization}`;
			
			var header_obj = {
				"X-Requested-With": "XMLHttpRequest",
				"Content-Type": "application/json",
				"DataServiceVersion": "2.0",
				"Accept": "application/json",
				"Permissions-Policy": "geolocation=(), camera=(), microphone=()",
				"X-Frame-Options": "DENY",
				"X-XSS-Protection": "1",
				"X-Content-Type-Options": "nosniff",
				"Referrer-Policy": "strict-origin-when-cross-origin",
				"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
				"Content-Security-Policy": "default-src 'self'; frame-ancestors 'self'; form-action 'self'",
				"Referrer-Policy": "strict-origin-when-cross-origin",
				"Cache-Control": "max-age=604800",
				"Feature-Policy": "camera 'self'; geolocation 'none'",
			//	"Access-Control-Allow-Headers": "Content-Type, Content-Disposition, Accept, responseType, X-MAC, X-TIME, Cookie",
			//	"Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
			//	"Access-Control-Allow-Origin": "*",
			//	"Access-Control-Expose-Headers": "Content-Type, Content-Disposition, Accept",
			//	"Connection": "keep-alive",
			//	"access-control-allow-credentials": "true",
			//	'Authorization': Authorization,
				"withCredentials" : 'true',
				"Cookie" : coockie
			}
			if(!jQuery.isEmptyObject(Headers) == true) {
				Headers = Object.assign({}, header_obj, Headers);
			}
			Core.oDataModel.setHeaders(Headers);
			if(EntitySet == 'GetMasterDataSet') {
				expand = 'EtDchkl,EtCompanyCode,EtPrctr,EtPlants,EtPrioroty,EtTagTypes,EtInspStatus,EtAssetClass,EtCostCenter,EtMobAppTiles,EtMobAppListView,EtViewAppScreen,EtAppScreenFields,EtUserData,EtInsuranceTyp,EtEquiCategory,EtObjectType,EtABCIndicator,EtLocation,EtUnits,EtPrctr,EtT005t,EtT087t,EtTa1tvt,EtDchklist,EtT090nat,EtT093t,EtAnkb,EtSaknr';
				if(!Filters.length == 0) {
					url = `${EntitySet}?$filter=${Filters}&$expand=${expand}`;
				} else {
					url = `${EntitySet}?$expand=${expand}`;
				}
				return url;
			} else if(EntitySet == 'GetAssetReqSet') {
				expand = 'EtAssetReqAlv,EtLongtext,EtAtrnb,EtWflogr,EtAtrni';
				if(!Filters.length == 0) {
					url = `${EntitySet}?$filter=${Filters}&$expand=${expand}`;
				} else {
					url = `${EntitySet}?$expand=${expand}`;
				}
				return url;
			} else if(EntitySet == 'GetAssetReqSet-EtDocs') {
				expand = 'EtDocs';
				if(!Filters.length == 0) {
					url = `${EntitySet.split('-')[0]}?$filter=${Filters}&$expand=${expand}`;
				} else {
					url = `${EntitySet.split('-')[0]}?$expand=${expand}`;
				}
				return url;
			} else if(EntitySet == 'SearchAssetSet') {
				expand = 'EtAssetSearch,EtAssetAnlb';
				if(!Filters.length == 0) {
					url = `${EntitySet}?$filter=${Filters}&$expand=${expand}`;
				} else {
					url = `${EntitySet}?$expand=${expand}`;
				}
				return url;
			} else if(EntitySet == 'SearchPKVDISet') {
				expand = 'EtPkvSearch';
				if(!Filters.length == 0) {
					url = `${EntitySet}?$filter=${Filters}&$expand=${expand}`;
				} else {
					url = `${EntitySet}?$expand=${expand}`;
				}
				return url;
			} else if(EntitySet == 'GetUserMasterSet') {
				expand = 'EtUserBukrs,EtUserWorkflow';
				if(!Filters.length == 0) {
					url = `${EntitySet}?$filter=${Filters}&$expand=${expand}`;
				} else {
					url = `${EntitySet}?$expand=${expand}`;
				}
				return url;
			} else if(EntitySet == 'SearchWBSSet') {
				expand = 'EtWbsSearch';
				if(!Filters.length == 0) {
					url = `${EntitySet}?$filter=${Filters}&$expand=${expand}`;
				} else {
					url = `${EntitySet}?$expand=${expand}`;
				}
				return url;
			} else if(EntitySet == 'GetChangeLogSet') {
				expand = 'EtWfChangeLog,EtDocs,EtWfChangeLogAlv';
				if(!Filters.length == 0) {
					url = `${EntitySet}?$filter=${Filters}&$expand=${expand}`;
				} else {
					url = `${EntitySet}?$expand=${expand}`;
				}
				return url;
			}
		},
		sModel: function(arr) {
			var Model = new JSONModel(arr);
			Model.iSizeLimit = arr.length;
			return Model;
		},
		Long_Text_Format(RequestId, Year, Description) {
			var Arr = [],
				Description_length = Description.length,
				has_newLines = Description.includes("\n"),
				parts;
			if(Description_length > 130 && has_newLines == false) {
				var parts = Description.split(/(.{130})/).filter(O => O);
			} else if(Description_length > 130 && has_newLines == true) {
				var parts = Description.split("\n");
			}
			var is_array = Array.isArray(parts);
			var len = is_array ? parts.length : 1;
			for(var d = 0; d < len; d++) {
				if(is_array) {
					if(parts[d].length > 130) {
						var ExceedeText = parts[d].split(/(.{130})/).filter(O => O);
						for(var n = 0; n < ExceedeText.length; n++) {
							if(ExceedeText != "") {
								var desc_obj = {
									"Atrnid": RequestId,
									"Fyear": Year,
									"Tdname": "",
									"Tdid": "",
									"Tdformat": "",
									"Tdline": ExceedeText[n].trim()
								};
								Arr.push(desc_obj);
							}
						}
						continue;
					}
				}
				var desc_obj = {
					"Atrnid": RequestId,
					"Fyear": Year,
					"Tdname": "",
					"Tdid": "",
					"Tdformat": "",
					"Tdline": is_array ? parts[d].trim() : Description
				};
				Arr.push(desc_obj);
			}
			return Arr;
		},
		Define_validations: function() {
			var _status = Core.that.getView().byId("Status").getValue(),
				approvertable_Model = Core.that.getView().byId("approvertable_id").getModel(),
				_bvalidate,
				_adata;
			if(_status == "NEW" || _status == "REJT"){
				return _bvalidate = false;
			}
			if(approvertable_Model != undefined) {
				_adata = approvertable_Model.getData();
				if(_adata != undefined) {
					_adata[0].Uname == Core.O_Login_user.Muser ? _bvalidate = false : _bvalidate = true;
				}
				var arr = _adata.filter(x => {
					return x.Uname == Core.O_Login_user.Muser && x.Seq != "1";
				});
				if(arr.length > 0){
					_bvalidate = true;
				}
			}else if(approvertable_Model == undefined && Core.is_Cross_App == "Y"){
				_adata = Core.AssetRequests_Data[0].EtAtrnw.results;
				if(_adata != undefined) {
					_adata[0].Uname == Core.O_Login_user.Muser ? _bvalidate = false : _bvalidate = true;
				}
				var arr = _adata.filter(x => {
					return x.Uname == Core.O_Login_user.Muser && x.Seq != "1";
				});
				if(arr.length > 0){
					_bvalidate = true;
				}
			}else{
				_bvalidate = true;
			}
			return _bvalidate;
		}
	});
});