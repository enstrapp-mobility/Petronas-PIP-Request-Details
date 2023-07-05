sap.ui.define(["ZEMT_AM_PUR_APP/controller/BaseController", "ZEMT_AM_PUR_APP/Format/Formatter", 'sap/ui/model/Filter', 'sap/ui/core/Core', 'sap/ui/model/json/JSONModel', 'sap/ui/model/Sorter', 'sap/m/MessageToast', 'sap/m/Dialog', 'sap/m/Button', 'sap/m/Text', 'sap/m/MessageBox', 'sap/ui/table/RowAction', "sap/ui/table/RowActionItem", "sap/ui/table/RowSettings", "sap/ui/core/Fragment", 'sap/ui/export/library', 'sap/ui/export/Spreadsheet'], function(BaseController, formatter, Filter, Core, JSONModel, Sorter, MessageToast, Dialog, Button, Text, MessageBox, RowAction, RowActionItem, RowSettings, Fragment, exportLibrary, Spreadsheet) {
	'use strict';
	var EdmType = exportLibrary.EdmType;
	formatter: formatter;
	Core.formatter = formatter;
	return BaseController.extend("ZEMT_AM_PUR_APP.controller.Project_Update_Request_Main", {
		onInit: function() {
			Core.that = this;
			Core.Deleted_Records = [];
			this.Loadi18n();
			Core.DataSubmitProgress = new sap.m.BusyDialog({
				text: Core.i18n.getText('SubmitforApprProgress')
			});
			Core.DataSaveProgress = new sap.m.BusyDialog({
				text: Core.i18n.getText('DataSaveProgress')
			});
			Core.DataLoadProgress = new sap.m.BusyDialog({
				text: Core.i18n.getText('DataLoadProgress')
			});
			this.Empty_Model = new JSONModel([]);
			Core.Update_Request_Search = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/Update_Request_Search", this);
			this.getView().addDependent(Core.Update_Request_Search);
			Core.F4_ExcelUpload = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/ExcelUpload", this);
			this.getView().addDependent(Core.F4_ExcelUpload);
			Core.F4_PersonnelVendorSearch = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/PersonnelVendorSearch", this);
			this.getView().addDependent(Core.F4_AddDepreciationAreas);
			Core.F4_WbsNoSearch = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/WbsNoSearch", this);
			this.getView().addDependent(Core.F4_WbsNoSearch);
			Core.F4_AddNewAsset = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/AddNewAsset", this);
			this.getView().addDependent(Core.F4_AddNewAsset);
			Core.F4_AssetSearch = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/AssetSearch", this);
			this.getView().addDependent(Core.F4_AssetSearch);
			Core.F4_AttachmentUpload = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/AttachmentUpload", this);
			this.getView().addDependent(Core.F4_AttachmentUpload);
			Core.F4_AttachmentView = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/AttachmentView", this);
			this.getView().addDependent(Core.F4_AttachmentView);
			Core.F4_MessageView = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/MessageView", this);
			this.getView().addDependent(Core.F4_ResponsivePopover);
			Core.F4_Update_Request = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/Update_Request", this);
			this.getView().addDependent(Core.F4_Update_Request);
			Core.F4_EnterRemarks = sap.ui.xmlfragment("ZEMT_AM_PUR_APP/Fragments/Remarks", this);
			this.getView().addDependent(Core.F4_Update_Request);
			this.getView().byId("Year").setValue(Core.DateFormat_year_Month.format(new Date()));
			this.getRouter().getRoute("Project_Update_Request_Main").attachPatternMatched(this._onObjectMatched, this);
			
		},
		_onObjectMatched: function(oEvent) {
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				Core.that.showDocument();
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			setTimeout(function() {
				var GetMasterData = Core.that.oDataModel();
				GetMasterData.setHeaders({
					"muser": Core.O_Login_user.Muser,
				});
				GetMasterData.read("GetMasterDataSet?$expand=EtDchkl,EtCompanyCode,EtPrctr,EtPlants,EtPrioroty,EtTagTypes,EtInspStatus,EtAssetClass,EtCostCenter," + "EtMobAppTiles,EtMobAppListView,EtViewAppScreen,EtAppScreenFields,EtUserData,EtInsuranceTyp,EtEquiCategory,EtObjectType,EtABCIndicator,EtLocation,EtUnits,EtPrctr,EtT005t,EtT087t,EtTa1tvt,EtDchklist,EtT090nat,EtT093t,EtAnkb", null, "", true, function(oData, response) {
					Core.A_MasterDataForF4Helps = oData.results[0];
					var EtCompanyCode = oData.results[0].EtCompanyCode.results;
					var EtPlants = oData.results[0].EtPlants.results;
					var EtAssetClass = oData.results[0].EtAssetClass.results;
					var EtCostCenter = oData.results[0].EtCostCenter.results;
					var EtLocation = oData.results[0].EtLocation.results;
					var CompanyCode_Model = new JSONModel(EtCompanyCode);
					CompanyCode_Model.iSizeLimit = 10000;
					var Plants_Model = new JSONModel(EtPlants);
					Plants_Model.iSizeLimit = 10000;
					var AssetClass_Model = new JSONModel(EtAssetClass);
					AssetClass_Model.iSizeLimit = 10000;
					var CostCenter_Model = new JSONModel(EtCostCenter);
					CostCenter_Model.iSizeLimit = 10000;
					var Location_Model = new JSONModel(EtLocation);
					Location_Model.iSizeLimit = 10000;
					//Core.byId("VhCompanyCodeId").setModel(CompanyCode_Model);
					Core.byId("VhPlantCodeId").setModel(Plants_Model);
					Core.byId("Plants").setModel(Plants_Model);
					Core.byId("VhCostCenterId").setModel(CostCenter_Model);
					Core.byId("VhAssetClassId").setModel(AssetClass_Model);
					Core.byId("VhLocationId").setModel(Location_Model);
					var Url_params = window.location.href.split("?")[1];
					Core.that.UserMaster();
					// If Navigated from Asset Request Dashboard
					if(Url_params != undefined && Url_params.charAt(0) != "s") {
						Core.is_Cross_App = "Y";
						var Data = JSON.parse(decodeURI(window.location.href.split("?")[1]));
						var EntityInputs = [];
						var Fyear = Data.Fyear;
						var Atrnid = Data.Atrnid;
						if(Fyear != "") {
							var data = "Fyear eq '".concat(Fyear).concat("'");
							EntityInputs.push(data);
						}
						if(Atrnid != "") {
							var Atrnid = "Atrnid eq '".concat(Atrnid).concat("'");
							EntityInputs.push(Atrnid);
						}
						var EntityValue = "GetAssetReqSet?$expand=EtAssetReqAlv,EtLongtext,EtAtrnb,EtWflogr,EtAtrni";
						if(EntityInputs.length > 0) {
							EntityInputs = EntityInputs.toString();
							EntityInputs = EntityInputs.split(',').join(' and ');
							EntityInputs = encodeURIComponent(EntityInputs);
							var EntityValue = "GetAssetReqSet?$filter=" + EntityInputs + "&$expand=EtAssetReqAlv,EtLongtext,EtAtrnb,EtWflogr,EtAtrni";
						}
						
						var getData = Core.that.oDataModel();
						getData.setHeaders({
							"muser": Core.O_Login_user.Muser,
						});
						getData.read(EntityValue, null, null, false, function(oData, response) {
							if(oData.results.length == 0) {
								Core.DataLoadProgress.close();
							} else {
								Core.AssetRequestsThisMainData = oData.results;
								Core.A_AssetData = oData.results[0].EtAssetReqAlv.results;
								var AssetData = Core.A_AssetData;
								AssetData = AssetData.filter(function(x) {
									return x.Atrnid == Data.Atrnid;
								});
								if(AssetData.length != 0) {
									var view = Core.that.getView();
									if(AssetData[0].Rstatus == "NEW" || AssetData[0].Rstatus == "REJT") {
										view.byId("Submit_btn").setVisible(true);
									} else {
										view.byId("Submit_btn").setVisible(false);
									}
									if(AssetData[0].Rstatus == "COMP") {
										view.byId("Save_btn").setVisible(false);
									} else {
										view.byId("Save_btn").setVisible(true);
									}
									if(AssetData[0].Rstatus == "WAPPR") {
										if(AssetData[0].Editm == "X") {
											view.byId("Save_btn").setVisible(true);
										} else {
											view.byId("Save_btn").setVisible(false);
										}
									}
									if(AssetData[0].Rstatus == "NEW" || AssetData[0].Rstatus == "REJT") {
										view.byId("StatusIcon").setSrc("./images/red.png");
									}
									if(AssetData[0].Rstatus == "WAPPR" || AssetData[0].Rstatus == "APPR") {
										view.byId("StatusIcon").setSrc("./images/yellow.png");
									}
									if(AssetData[0].Rstatus == "COMP") {
										view.byId("StatusIcon").setSrc("./images/green.png");
									}
									view.byId("RequestId").setValue(AssetData[0].Atrnid);
									view.byId("AssetTitleId").setValue(AssetData[0].Txt50);
									view.byId("RequestTypeId").setSelectedKey(AssetData[0].Action);
									view.byId("Status").setValue(AssetData[0].Rstatus);
									view.byId("CompanyCode").setSelectedKey(AssetData[0].Bukrs);
									var Longtext_arr = oData.results[0].EtLongtext.results;
									view.byId("CreatedById").setValue(`${AssetData[0].Empid} ${AssetData[0].Empname}`);
									view.byId("CreatedOnId").setValue(Core.formatter.formatddmmyyy(AssetData[0].Erdat));
									view.byId("ChangedOnId").setValue(Core.formatter.formatddmmyyy(AssetData[0].Aedat));
									view.byId("ChangedById").setValue(AssetData[0].Aenam);
									if(Longtext_arr.length > 0) {
										var description = '';
										for(var i = 0; i < Longtext_arr.length; i++) {
											description += Longtext_arr[i].Tdline + "\n"
										}
										view.byId("Description").setValue(description);
									}
									
									var Etwflogr_arr = oData.results[0].EtWflogr.results;
									var EtArni_Arr = oData.results[0].EtAtrni.results;
									if(Etwflogr_arr.length != 0) {
										function compare(a, b) {
											if(a.Fenum < b.Fenum) {
												return -1;
											}
											if(a.Fenum > b.Fenum) {
												return 1;
											}
											return 0;
										}
										Etwflogr_arr.sort(compare);
										view.byId("ASignOffpprovedById").setValue(Etwflogr_arr[0].Wfappr);
										view.byId("AppNameId").setValue(Etwflogr_arr[0].Ausername);
										view.byId("ApprovedById").setValue(Etwflogr_arr[0].Adate);
									}
									var Proj_update_data = oData.results[0].EtAtrni.results;
									
									var Proj_Update_record = new JSONModel(Proj_update_data);
									Proj_Update_record.iSizeLimit = 10000;
									view.byId("Project_Update_Request_Table").setModel(Proj_Update_record);
								}
							}
						}, function(oError) {
							
						});
					} else {
						Core.is_Cross_App = "N";
					}
					Core.that.showDocument();
				}, function(oError) {
					Core.that.showDocument();
				});
			}, 100)
		},
		onAfterRendering: function() {
			this.getView().byId("CreatedOnId").setValue(Core.DateFormat_yyyy_mm_dd.format(new Date()));
			if(Core.O_Login_user != "") {
				this.getView().byId("CreatedById").setValue(Core.O_Login_user.Muser + " " + Core.O_Login_user.FullName);
				this.getView().byId("StaffNoId").setValue(Core.O_Login_user.Muser);
			}
		},
		VhCompanyCodeChange: function(oEvent) {
			Core.byId("VhAssetClassId").setSelectedKey("");
			Core.byId("VhCostCenterId").setSelectedKey("");
			if(oEvent.getSource().getSelectedItem() != null) {
				Core.byId("VhPlantCodeId").setEnabled(true);
				Core.byId("VhCostCenterId").setEnabled(true);
				Core.byId("VhAssetClassId").setEnabled(true);
				Core.byId("VhLocationId").setEnabled(true);
				var SelectedIndex = oEvent.getSource().getSelectedItem().sId.split("VhCompanyCodeId-")[1];
				var SelectedData = Core.byId("VhCompanyCodeId").getModel().getData()[SelectedIndex];
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, SelectedData.Bukrs));
				var filter = new sap.ui.model.Filter(aFilters, false);
				Core.byId("VhAssetClassId").getBinding("items").filter(filter, "Application");
				Core.byId("VhCostCenterId").getBinding("items").filter(filter, "Application");
			} else {
				Core.byId("VhAssetClassId").getBinding("items").filter([], "Application");
				Core.byId("VhCostCenterId").getBinding("items").filter([], "Application");
			}
		},
		VhPlantCodeChange: function(oEvent) {
			Core.byId("VhLocationId").setSelectedKey("");
			if(oEvent.getSource().getSelectedItem() != null) {
				var SelectedIndex = oEvent.getSource().getSelectedItem().sId.split("VhPlantCodeId-")[1];
				var SelectedData = Core.byId("VhPlantCodeId").getModel().getData()[SelectedIndex];
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, SelectedData.Werks));
				var filter = new sap.ui.model.Filter(aFilters, false);
				Core.byId("VhLocationId").getBinding("items").filter(filter, "Application");
			} else {
				Core.byId("VhLocationId").getBinding("items").filter([], "Application");
			}
		},
		VhCompanyCodeEmptyCheck: function(oEvent) {
			var CompanyCode = Core.byId("VhCompanyCodeId").getSelectedKey();
			var SelectedKey = oEvent.getSource().getSelectedKey();
			if(CompanyCode == "" && SelectedKey != "") {
				var Msg = Core.i18n.getText("CompanyCodeMandatoryTxt");
				MessageBox.information(Msg, {
					actions: [MessageBox.Action.NO],
					onClose: function(oAction) {
						Core.byId("VhAssetClassId").setSelectedKey("");
						Core.byId("VhCostCenterId").setSelectedKey("");
					}
				});
			}
		},
		VhLocationChange: function(oEvent) {
			var PlantCode = Core.byId("VhPlantCodeId").getSelectedKey();
			var PlantCodeMandatoryTxt = Core.i18n.getText("PlantCodeMandatoryTxt");
			if(PlantCode == "") {
				MessageBox.information(PlantCodeMandatoryTxt, {
					actions: [MessageBox.Action.NO],
					onClose: function(oAction) {
						Core.byId("VhLocationId").setSelectedKey("");
					}
				});
			}
		},
		// Exit App
		ExitAction: function() {
			var informationDialog = new Dialog({
				title: Core.i18n.getText("MsgWarning"),
				type: 'Message',
				state: 'Warning',
				content: new sap.m.Text({
					text: Core.i18n.getText("AssetBackExit")
				}),
				beginButton: new sap.m.Button({
					text: Core.i18n.getText("MsgYes"),
					type: 'Accept',
					press: function() {
						informationDialog.close();
						if(Core.is_Cross_App == "Y") {
							setTimeout(function() {
								window.close();
							}, 500)
						} else {
							window.history.go(-1); //Back to FioriLaunchpad
						}
					}
				}),
				endButton: new sap.m.Button({
					text: Core.i18n.getText("MsgNo"),
					type: 'Reject',
					press: function() {
						informationDialog.close();
					}
				}),
				afterClose: function() {
					informationDialog.destroy();
				}
			});
			informationDialog.open();
		},
		// Save  Operation
		on_Save: function() {
			// Check user is online or offline
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			var view = this.getView();
			var RequestId = view.byId("RequestId").getValue();
			var AssetTitle = view.byId("AssetTitleId").getValue();
			var Name = view.byId("NameId").getValue();
			var RequestType = view.byId("RequestTypeId").getSelectedKey();
			var Year = Core.DateFormat_yyyy.format(new Date());
			var Description = view.byId("Description").getValue();
			var Status = view.byId("Status").getValue('NEW');
			var StaffNo = view.byId("StaffNoId").getValue();
			var CompanyCode = view.byId("CompanyCode").getSelectedKey();
			var DocTabelModel = Core.byId("AttachmentTabel").getModel();
			var DocTabelData = [];
			if(CompanyCode === "") {
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
				MessageBox.information(Core.i18n.getText("EnterCompanyCode"));
				return false;
			}
			if(DocTabelModel != undefined) {
				DocTabelData = DocTabelModel.getData();
			}
			var Project_Update_Request_Table = this.getView().byId("Project_Update_Request_Table").getModel();
			if(Project_Update_Request_Table != undefined){
				var Update_request_data = Project_Update_Request_Table.getData();
			}else if(Project_Update_Request_Table == undefined){
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("PIP Request");
				MessageBox.warning(Core.i18n.getText("AddatleaseoneRecord"));
				return false;
			}else if(Update_request_data.length == 0){
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("PIP Request");
				MessageBox.warning(Core.i18n.getText("AddatleaseoneRecord"));
				return false;
			}
			
			var length = Update_request_data.length;
			var Data = Update_request_data.concat(Core.Deleted_Records);
			var Update_Request_Data = [];
			for(var i = 0; i < length; i++) {
				Data[i].Repdate == '' && (Data[i].Repdate = null);
				Data[i].Compd == '' && (Data[i].Compd = null);
				Data[i].Rcompd == '' && (Data[i].Rcompd = null);
				if(Data[i].Repdate != null && Data[i].Repdate.length != 8){
					Data[i].Repdate = this.Format_Date(Data[i].Repdate);
				}
				if(Data[i].Compd != null && Data[i].Compd.length != 8){
					Data[i].Compd = this.Format_Date(Data[i].Compd);
				}
				if(Data[i].Rcompd != null && Data[i].Rcompd.length != 8){
					Data[i].Rcompd = this.Format_Date(Data[i].Rcompd);
				}
				var obj = {
						"Pspid": Data[i].Pspid,
						"Posid": Data[i].Posid,
						"Bukrs":  CompanyCode,//Data[i].Bukrs,
						"Anln1": Data[i].Anln1,
						"Anln2": Data[i].Anln2,
						"Prjcost": Data[i].Prjcost,
						"Rprjcost": Data[i].Rprjcost,
						"Wert1": Data[i].Wert1,
						"Answt": Data[i].Answt == '' ? Data[i].Answt = "0" : Data[i].Answt = Data[i].Answt,
						"Yepcost": Data[i].Yepcost,
						"Repdate": Data[i].Repdate,// == '' ? Data[i].Repdate = null : Data[i].Repdate = this.Format_Date(Data[i].Repdate),
						"Compd": Data[i].Compd ,//== '' ? Data[i].Compd = null : Data[i].Compd = this.Format_Date(Data[i].Compd),
						"Rcompd": Data[i].Rcompd ,//== '' ? Data[i].Rcompd = null : Data[i].Rcompd = this.Format_Date(Data[i].Rcompd),
						"Prozs": Data[i].Prozs,
						"Pstatus": Data[i].Pstatus,
						"Dageing": Data[i].Dageing.toString(),
						"Waers": Data[i].Waers,
						"Werks": Data[i].Werks,
					//	"Action": Data[i].Action,
					}
					Update_Request_Data.push(obj);
			}
			
			var oEntity = {
				"Muser": Core.O_Login_user.Muser,
				"Deviceid": "",
				"Devicesno": "",
				"Udid": "",
				"IvTransmitType": "LOAD",
				"IvCommit": true,
				"Operation": "NWAST",
				"IsAssetReqKey": [{
					"Muser": Core.O_Login_user.Muser,
					"Atrnid": "",
					"Fyear": Year,
					"Rstatus": Status,
					"Bukrs": CompanyCode,
					"Anln1": "",
					"Iwerk": "",
					"Action": "J",
					"Activity": "PQ"
				}],
				"IsEquiAsset": [{
					"Aucanln1" : "",
					"Aucanln2" : "",
					"Kfzkz": "",
					"Txt50": AssetTitle,
					"Txa50": Name,
					"Werks": "",
					"Bukrs": CompanyCode,
					"Anln1": "",
					"Anln2":"",
					"Anlkl": "",
					"Kostl": "",
					"Prctr": "",
					"Stort": "",
					"Posid": "",
					"Ktogr": "",
					"Pernr": "",
					"Astatus": "",
					"Iwerk": "",
					"Msgrp": "",
					"Gsber": "",
					"Kostlv": "",
					"Xafabch": "",
					"Menge": "0",
					"Meins": "",
					"Aneqk": "",
					"Xnach": "",
					"Aktiv": null,
					"Zugdt": null,
					"Deakt": null,
					"Gplab": null,
					"Bstdt": null,
					"Inken": "",
					"Ivdat": null,
					"Invnr": "",
					"Invzu": "",
					"Land1": "",
					"Lifnr": "",
					"Liefe": "",
					"Typbz": "",
					"Answt": "0",
					"Grund": "",
					"Wrtma": "0",
					"Wert1": "0",
					"Urwrt": "0",
					"Waers": "",
					"Urjhr": "",
					"Aibdt": "",
					"Pspid": "",
					"Posnr": "",
					"Ord41": "",
					"Ord42": "",
					"Ord43": "",
					"Ord44": "",
					"Gdlgrp": "",
					"Repld": null,
					"Izwek": "",
					"Umwkz": "",
					"Anlue": "",
					"Vsges": "",
					"Vsart": "",
					"Vsstx": "",
					"Vsztx": "",
					"Vrsbg": null,
					"Vrseg": null,
					"Vrsdu": "",
					"Vstar": "",
					"Vrsma": "0",
					"Herst": "",
					"Typbz1": "0",
					"Sernr": "",
					"Gwldt": null,
					"Gwlen": null,
					"Ktext": "",
					"Name1": "",
					"Name2": "",
					"Zipcode": "",
					"City": "",
					"Street": "",
					"Housenum": "",
					"Region": "",
					"Country": "",
					"Latitude": "",
					"Longitude": "",
					"Empid": "",
					"Zacapm": "",
					"Zacomp": "",
					"Zarepl": "",
					"Zacosa": "",
				}],
				"IsAssetReq": [{
					"Compd": null,
					"Priok": "",
					"Kfzkz": "",
					"Werks": "",
					"Activity": "PQ",
					"Txt50": AssetTitle,
					"Txa50": Name,
					"Fyear": Year,
					"Rstatus": Status,
					"Empid": "",
					"Bukrs": CompanyCode,
					"Anln1": "",
					"Anlkl": "",
					"Kostl": "",
					"Prctr": "",
					"Stort": "",
					"Posid": "",
					"Ktogr": "",
					"Pernr": "",
					"Astatus": "",
					"Iwerk": "",
					"Msgrp": "",
					"Gsber": "",
					"Kostlv": "",
					"Xafabch": "",
					"Menge": "0",
					"Meins": "",
					"Aneqk": "",
					"Xnach": "",
					"Aktiv": null,
					"Zugdt": null,
					"Deakt": null,
					"Gplab": null,
					"Bstdt": null,
					"Inken": "",
					"Ivdat": null,
					"Invnr": "",
					"Invzu": "",
					"Land1": "",
					"Lifnr": "",
					"Liefe": "",
					"Typbz": "",
					"Answt": "0",
					"Grund": "",
					"Urwrt": "0",
					"Waers": "",
					"Urjhr": "",
					"Aibdt": null,
					"Pspid": "",
					"Posnr": "",
					"Ord41": "",
					"Ord42": "",
					"Ord43": "",
					"Ord44": "",
					"Gdlgrp": "",
					"Repld": null,
					"Izwek": "",
					"Umwkz": "",
					"Anlue": "",
					"Vsges": "",
					"Vsart": "",
					"Vsstx": "",
					"Vsztx": "",
					"Vrsbg": null,
					"Vrseg": null,
					"Vrsdu": "",
					"Vstar": "",
					"Vrsma": "0",
					"Herst": "",
					"Typbz1": "0",
					"Sernr": "",
					"Gwldt": null,
					"Gwlen": null,
					"Ktext": "",
					"Name1": "",
					"Name2": "",
					"Zipcode": "",
					"City": "",
					"Street": "",
					"Housenum": "",
					"Region": "",
					"Country": "",
					"Latitude": "",
					"Longitude": "",
					"Zacapm": "",
					"Zacomp": "",
					"Zarepl": "",
					"Zacosa": "",
				}],
				"ItLongtext": [],
				"ItDocs": [],
				"EtMessage": [],
				"EtRetrun": [],
				"EsRequest": [],
				"EtLongtext": [],
				"ItAtrnb": [],
				"ItAtrni": Update_Request_Data,
				"EtDocs": []
			}
			if(Description != "") {
				var desc = {
					"Atrnid": RequestId == "$000000001" ? "" : RequestId,
					"Fyear": Year,
					"Tdname": "",
					"Tdid": "",
					"Tdformat": "",
					"Tdline": Description
				};
				oEntity.ItLongtext.push(desc);
			}
			var i;
			for(i = 0; i < DocTabelData.length; i++) {
				if(DocTabelData[i].Objid == undefined || DocTabelData[i].Objid == "") {
					var DocJsonObj = {
						"Filename": DocTabelData[i].FileName,
						"Filetype": DocTabelData[i].FileType,
						"Fsize": DocTabelData[i].FileSize,
						"Content": DocTabelData[i].FileContent
					};
					oEntity.ItDocs.push(DocJsonObj);
				}
			}
			if(RequestId.indexOf("$") == -1) {
				oEntity.IsAssetReqKey[0].Atrnid = RequestId;
				oEntity.IsAssetReq[0].Atrnid = RequestId;
				oEntity.Operation = "UPAST";
			}
			
			
			/*var oEntity = {
				"Muser": Core.O_Login_user.Muser,
				"Deviceid": "",
				"Devicesno": "",
				"Udid": "",
				"IvTransmitType": "",
				// "IvCommit": "",
				//  "Error": "",
				"Operation": "",
				"ItProjUpdData": Update_Request_Data,
				"EtMessage": [{}],
				"EtReturn": [{}]
			}*/
			var informationDialog = new Dialog({
				title: Core.i18n.getText("Confirmation"),
				type: 'Message',
				content: new sap.m.Text({
					text: Core.i18n.getText("SaveDailogMsg")
				}),
				beginButton: new sap.m.Button({
					text: Core.i18n.getText("MsgYes"),
					type: 'Accept',
					press: function() {
						informationDialog.close();
						Core.that.SavePress(oEntity);
					}
				}),
				endButton: new sap.m.Button({
					text: Core.i18n.getText("MsgNo"),
					type: 'Reject',
					press: function() {
						informationDialog.close();
					}
				}),
				afterClose: function() {
					informationDialog.destroy();
				}
			});
			informationDialog.open();
		},
		// save operation
		SavePress: function(oEntity) {
			Core.DataSaveProgress.open();
			setTimeout(function() {
				var Submit = Core.that.oDataModel();
				Submit.create("AssetApiSet", oEntity, null, function(oData, response) {
					var RequestId = oData.EtMessage.results[0].EvAtrnid;
					var Resp_Error = oData.EtMessage.results[0].EvError;
					var title;
					// Set Title Based on Flag
					if(Resp_Error == true) {
						title = Core.i18n.getText("Error");
						Core.byId("Msg_icon").removeStyleClass("ResponseIconColorSuccess");
						Core.byId("Msg_icon").addStyleClass("ResponseIconColorError");
						Core.byId("Msg_icon").setSrc("sap-icon://error");
					} else if(Resp_Error == false) {
						Core.that.getView().byId("Project_Update_Request_Table").clearSelection();
						title = Core.i18n.getText("Success");
						Core.byId("Msg_icon").removeStyleClass("ResponseIconColorError");
						Core.byId("Msg_icon").addStyleClass("ResponseIconColorSuccess");
						Core.byId("Msg_icon").setSrc("sap-icon://message-success");
					}
					var ErrorMsg = [];
					// Show Messages based on Response
					for(var i = 0; i < oData.EtMessage.results.length; i++) {
						var obj = {
							text: oData.EtMessage.results[i].Message
						};
						ErrorMsg.push(obj);
					}
					var oModel = new JSONModel();
					oModel.setData(ErrorMsg);
					Core.byId("MessageViewTitleId").setText(title);
					Core.byId("MessaheViewListId").setModel(oModel);
					if(Resp_Error == false) {
						var SelectedData = oData.IsAssetReq.results[0];
						Core.that.getView().byId("RequestId").setValue(RequestId);
						Core.that.getView().byId("RequestTypeId").setEditable(false);
						Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
						var DocTabelModel = Core.byId("AttachmentTabel").getModel();
						var DocTabelData = [];
						if(DocTabelModel != undefined) {
							DocTabelData = DocTabelModel.getData();
						}
						if(DocTabelData.length != 0) {
							DocTabelData = DocTabelModel.getData();
							for(var j = 0; j < DocTabelData.length; j++) {
								DocTabelData[j].Objid = RequestId;
							}
						}
					}
					Core.F4_MessageView.open();
					// If success Show and bind request id from response
					Core.DataSaveProgress.close();
				}, function(err) {
					Core.that.HandleError(err);
				});
			}, 500);
		},
		ClearData: function() {
			var view = Core.that.getView();
			view.byId("RequestId").setValue('$000000001');
			view.byId("AssetTitleId").setValue();
			view.byId("NameId").setValue();
			view.byId("RequestTypeId").setSelectedKey();
			view.byId("Year").setValue(Core.DateFormat_year_Month.format(new Date()));
			view.byId("Description").setValue();
			view.byId("Status").setValue();
			view.byId("CompanyCode").setSelectedKey();
			view.byId("StaffNoId").setValue();
			view.byId("ASignOffpprovedById").setValue();
			view.byId("AppNameId").setValue();
			view.byId("ApprovedById").setValue();
			view.byId("approvertable_id").setModel(this.Empty_Model);
			view.byId("Project_Update_Request_Table").setModel(this.Empty_Model);
		},
		UpdateDocumentsPress: function() {
			var Document_arr = Core.A_MasterDataForF4Helps.EtDchkl.results;
			var Default_Doc_option = [];
			var obj = {
				Bukrs: "",
				Docname: "Others",
				Doctype: "ASSET",
				Ismandatory: "",
				Method: "",
				Raction: "",
				Seq: "",
				Tglobal: "",
			}
			Default_Doc_option.push(obj);
			/*var CompanyCode = this.getView().byId("CompanyCode").getSelectedKey();
			var key = this.getView().byId("RequestTypeId").getSelectedKey();
			var Arr = Document_arr.filter(function(x, i, a) {
				return x.Bukrs == CompanyCode && x.Raction == key
			});*/
			var Arr = Default_Doc_option //Arr.concat(Default_Doc_option);
			// show Required Doc's
			var Doc_Model = new JSONModel(Arr);
			Core.byId("requireddocs_list").setModel(Doc_Model);
			Core.byId("requireddocs_list").setVisible(true);
			Core.F4_AttachmentUpload.open();
		},
		onAttachmentCancel: function() {
			Core.F4_AttachmentUpload.close();
		},
		onUploadFile: function(oEvent) {
			var id = oEvent.getSource().getId();
			var file = oEvent.getParameter("files")[0];
			var obj = [{
				FileName: "",
				FileSize: "",
				FileContent: "",
				FileType: "",
				Objid: ""
			}];
			if(file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = (function(theFile) {
					return function(evt) {
						if(evt.target.result.indexOf("base64,") != -1) {
							var splitValue = evt.target.result.split("base64,");
							obj[0].FileContent = splitValue[1];
						}
						var fileName = Core.byId("AttachmentUploader").getValue();
						var data = [];
						var AttachmentUploadModel = new JSONModel();
						var uploadTable = Core.byId("AttachmentTabel");
						if(uploadTable.getModel() == undefined || uploadTable.getModel().getData() == null) {
							AttachmentUploadModel.setData(obj);
						} else {
							data = uploadTable.getModel().getData();
							data.push(obj[0]);
							AttachmentUploadModel.setData(data);
						}
						AttachmentUploadModel.refresh(true);
						uploadTable.setModel(AttachmentUploadModel);
						Core.byId(id).setValue("");
						// console.log(auM);
						AttachmentUploadModel.refresh(true);
					}
				})(file);
				var Data = Core.byId("AttachmentTabel").getModel();
				var flag = true;
				var size = 0;
				if(Data != undefined) {
					var dataDoc = Data.getData();
					for(var i = 0; i < dataDoc.length; i++) {
						size = size + (dataDoc[i].FileSize / 1024).toFixed(2);
					}
					size = size + parseFloat((file.size / 1024).toFixed(2));
					if(size > 5120) {
						var maxFiveMB = new Dialog({
							title: 'Delete',
							type: 'Message',
							state: 'Warning',
							content: new Text({
								text: 'Total file size exceeded 5MB'
							}),
							beginButton: new Button({
								text: 'OK',
								type: 'Accept',
								press: function() {
									maxFiveMB.close();
								}
							}),
							afterClose: function() {
								maxFiveMB.destroy();
							}
						});
						maxFiveMB.open();
						flag = false;
					}
				} else if(parseFloat((file.size / 1024).toFixed(2)) > 5120) {
					var maxFiveMB = new Dialog({
						title: 'Delete',
						type: 'Message',
						state: 'Warning',
						content: new Text({
							text: 'Total file size exceeded 5MB'
						}),
						beginButton: new Button({
							text: 'OK',
							type: 'Accept',
							press: function() {
								maxFiveMB.close();
							}
						}),
						endButton: new Button({
							text: 'No',
							type: 'Reject',
							press: function() {
								maxFiveMB.close();
							}
						}),
						afterClose: function() {
							maxFiveMB.destroy();
						}
					});
					maxFiveMB.open();
					flag = false;
				}
				if(flag == true) {
					reader.readAsDataURL(file);
					var fileSize = (file.size / 1024).toFixed(2) + ' KB';
					obj[0].FileName = file.name;
					obj[0].FileSize = file.size.toString();
					obj[0].FileType = file.type;
					if(file.name.indexOf(".msg") != -1) {
						obj[0].FileType = "application/msoutlook";
					}
				}
			}
		},
		ViewDocumentsPress: function() {
			var RequestNotCreated = Core.i18n.getText("RequestNotCreated");
			var Asset = this.getView().byId("RequestId").getValue();
			if(Asset.indexOf("$") != -1) {
				MessageBox.information(RequestNotCreated);
			} else {
				Core.that.checkConnection();
				if(Core.B_isonLine == false) {
					MessageBox.warning(Core.i18n.getText("msgoffline"));
					return false;
				}
				Core.DataLoadProgress.open();
				var EntityValue = "GetAssetReqSet?$filter=Atrnid eq '" + Asset + "'&$expand=EtDocs";
				setTimeout(function() {
					var getData = Core.that.oDataModel();
					getData.read(EntityValue, null, null, false, function(oData, response) {
						if(oData.results[0].EtDocs.results.length == 0) {
							Core.DataLoadProgress.close();
							MessageBox.information("No Documents Found");
						} else {
							Core.F4_AttachmentView.open();
							var DataJson = new JSONModel(oData.results[0].EtDocs.results);
							DataJson.iSizeLimit = 10000;
							Core.byId("AttachmentTabelView").setModel(DataJson);
							Core.DataLoadProgress.close();
						}
					}, function(oError) {
						Core.DataLoadProgress.close();
						var errMessage = oError.response.statusText;
						var MessageText = JSON.parse(oError.response.body).error.message.value;
						MessageBox.error(errMessage + "  (" + MessageText + ")");
					});
				}, 500);
			}
		},
		onAttachmentViewCancel: function() {
			Core.F4_AttachmentView.close();
		},
		downloadDocuments: function(oEvent) {
			var sId = oEvent.oSource.sId;
			if(oEvent.mParameters.listItem != undefined) {
				var index = parseInt(oEvent.mParameters.listItem.sId.split("AttachmentTabelView-")[1]);
			} else {
				var index = parseInt(sId.split("AttachmentTabelView-")[1]);
			}
			var modelData = Core.byId("AttachmentTabelView").getModel();
			var data = modelData.getData();
			var content = data[index].Content;
			var file_path = 'data:application/octet-stream;base64,' + content;
			var a = document.createElement('A');
			a.href = file_path;
			a.download = data[index].Filename;
			document.body.appendChild(a);
			a.click();
			a.emphasized = true;
			document.body.removeChild(a);
		},
		// Can Enter only Alphabets
		onlyAlphabets: function(oEvent) {
			var regex = /^[A-Za-z]+$/;
			var input = oEvent.getSource().getValue();
			if(!input.match(regex) && input != "") {
				var Msg = Core.i18n.getText("OnlyAlphabetsText");
				MessageBox.information(Msg);
				oEvent.getSource().setValue("");
			}
		},
		RemarksClose: function() {
			Core.F4_EnterRemarks.close();
		},
		ApprovePress: function() {
			var RemarksMsg = Core.i18n.getText("RemarksMsg");
			var remarks = Core.byId("RemarksId").getValue();
			if(remarks == "") {
				MessageBox.information(RemarksMsg);
			} else {
				Core.F4_EnterRemarks.close();
				Core.that.SubmitAction();
			}
		},
		SubmitValidation: function() {
			var view = this.getView();
			var AssetTitle = view.byId("AssetTitleId").getValue();
			var CompanyCode = view.byId("CompanyCode").getSelectedKey();
			if(AssetTitle === "") {
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
				MessageBox.information(Core.i18n.getText("AssetTitleMandatoryTxt"));
				return false;
			}else if(CompanyCode === "") {
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
				MessageBox.information(Core.i18n.getText("EnterCompanyCode"));
				return false;
			}
			var RequestNotCreated = Core.i18n.getText("RequestNotCreated");
			var Asset = view.byId("RequestId").getValue();
			if(Asset.indexOf("$") != -1) {
				MessageBox.information(Core.i18n.getText("RequestNotCreated"));
				return false;
			} else {
				var SubmitApprovalMsg = Core.i18n.getText("SubmitApprovalMsg");
				var Confirmation = Core.i18n.getText("Confirmation");
				var informationDialog = new Dialog({
					title: Confirmation,
					type: 'Message',
					content: new sap.m.Text({
						text: SubmitApprovalMsg
					}),
					beginButton: new sap.m.Button({
						text: 'Yes',
						type: 'Accept',
						press: function() {
							Core.byId("RemarksId").setValue("");
							informationDialog.close();
							Core.F4_EnterRemarks.open();
						}
					}),
					endButton: new sap.m.Button({
						text: 'No',
						type: 'Reject',
						press: function() {
							informationDialog.close();
						}
					}),
					afterClose: function() {
						informationDialog.destroy();
					}
				});
				informationDialog.open();
			}
		},
		SubmitAction: function() {
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			var view = this.getView();
			Core.DataSubmitProgress.open();
			var remarks = Core.byId("RemarksId").getValue();
			var RequestId = view.byId("RequestId").getValue();
			var Year = Core.DateFormat_yyyy.format(new Date());
			var AssetTitle = view.byId("AssetTitleId").getValue();
			var Name = view.byId("NameId").getValue();
			var Description = view.byId("Description").getValue();
			var Status = view.byId("Status").getValue();
			var RequestType = view.byId("RequestTypeId").getSelectedKey();
			var CompanyCode = view.byId("CompanyCode").getSelectedKey();
			var Year = Core.DateFormat_yyyy.format(new Date());
			var oEntity = {
				"IsWFMaintain": [{
					"Compd": "",
					"Priok": "",
					"Werks": "",
					"Txt50": AssetTitle,
					//"Txa50": Name,
					"Atrnid": RequestId,
					"Fyear": Year,
					"Rstatus": "WAPPR",
					"Activity": "PQ",
					"Action" : "J",
					"Bukrs": CompanyCode,
					"Anln1": "",
					"Anln2": "",
					"Anlkl": "",
					"Kostl": "",
					"Prctr": "",
					"Stort": "",
					"Posid": "",
					"Ktogr": "",
					"Pernr": "",
					"Astatus": "",
					"Iwerk": "",
					"Msgrp": "",
					"Gsber": "",
					"Kostlv": "",
					"Xafabch": "",
					"Meins": "",
					"Aneqk": "",
					"Xnach": "",
					"Aktiv": "",
					"Zugdt": null,
					"Deakt": null,
					"Gplab": "",
					"Bstdt": "",
					"Inken": "",
					"Ivdat": "",
					"Invnr": "",
					"Invzu": "",
					"Land1": "",
					"Lifnr": "",
					"Liefe": "",
					"Typbz": "",
					"Answt": "0",
					"Grund": "",
					"Wrtma": "0",
					"Wert1": "0",
					"Urwrt": "0",
					"Waers": "",
					"Urjhr": "",
					"Aibdt": "",
					"Pspid": "",
					"Posnr": "",
					"Ord41": "",
					"Ord42": "",
					"Ord43": "",
					"Ord44": "",
					"Gdlgrp": "",
					"Repld": "",
					"Izwek": "",
					"Kfzkz": "",
					"Umwkz": "",
					"Anlue": "",
					"Vsges": "",
					"Vsart": "",
					"Vsstx": "",
					"Vsztx": "",
					"Vrsbg": null,
					"Vrseg": null,
					"Vrsdu": "",
					"Vstar": "",
					"Vrsma": "0",
					"Herst": "",
					"Typbz1": "",
					"Sernr": "",
					"Gwldt": "",
					"Gwlen": "",
					"Name1": "",
					"Name2": "",
					"Zipcode": "",
					"City": "",
					"Street": "",
					"Housenum": "",
					"Region": "",
					"Country": "",
					"Latitude": "",
					"Longitude": "",
					"Rmenge": "0",
					"Zacapm": "",
					"Zacomp": "",
					"Zarepl": "",
					"Zacosa": ""
				}],
				"ItWorkFlowLog": [{
					"Werks": "",
					"Txt50": "",
					"Atrnid": RequestId,
					"Fyear": Year,
					"Bukrs": CompanyCode,
					"Anlkl": "",
					"Wfstatus": "WAPPR"
				}],
				"EtAssetReqKey": [],
				"EtMessage": [],
				"EtReturn": []
			};
			setTimeout(function() {
				var Submit = Core.that.oDataModel();
				Submit.setHeaders({
					"ivdoctype": "ASSET",
					"ivremarks": remarks,
					"ivwfstatus": "WAPPR"
				});
				Submit.create("WorkflowMaintainSet", oEntity, null, function(oData, response) {
					// Read success or Error From Odata Response
					var Resp_Error = oData.EtMessage.results[0].EvError;
					var title;
					// Set Title Based on Flag
					if(Resp_Error == true) {
						title = Core.i18n.getText("Error");
						Core.byId("Msg_icon").removeStyleClass("ResponseIconColorSuccess");
						Core.byId("Msg_icon").addStyleClass("ResponseIconColorError");
						Core.byId("Msg_icon").setSrc("sap-icon://error");
					} else if(Resp_Error == false) {
						title = Core.i18n.getText("Success");
						Core.byId("Msg_icon").removeStyleClass("ResponseIconColorError");
						Core.byId("Msg_icon").addStyleClass("ResponseIconColorSuccess");
						Core.byId("Msg_icon").setSrc("sap-icon://message-success");
					}
					var ErrorMsg = [];
					// Show Messages based on Response
					for(var i = 0; i < oData.EtMessage.results.length; i++) {
						var obj = {
							text: oData.EtMessage.results[i].Message
						};
						ErrorMsg.push(obj);
					}
					var oModel = new JSONModel();
					oModel.setData(ErrorMsg);
					Core.byId("MessageViewTitleId").setText(title);
					Core.byId("MessaheViewListId").setModel(oModel);
					Core.F4_MessageView.open();
					// If success Show and bind request id from response
					if(Resp_Error == false) {
						Core.Navto_Launchpad = "X";
						Core.that.ClearData();
					}
					Core.DataSubmitProgress.close();
				}, function(err) {
					Core.that.HandleError(err);
				});
			}, 500);
		},
		AssetValueHelp: function(oEvent) {
			Core.F4_AssetSearch.open();
			this.ClearBtnPress();
			Core.byId("AssetSearchPage").setExpanded(true);
			var EtCompanyCode = Core.A_UserMasterData.EtUserBukrs.results;
			var EtPlants = Core.A_MasterDataForF4Helps.EtPlants.results;
			var EtCostCenter = Core.A_MasterDataForF4Helps.EtCostCenter.results;
			var EtAssetClass = Core.A_MasterDataForF4Helps.EtAssetClass.results;
			var EtLocation = Core.A_MasterDataForF4Helps.EtLocation.results;
			var CompanyCodeJson = new sap.ui.model.json.JSONModel(EtCompanyCode);
			CompanyCodeJson.iSizeLimit = 10000;
			var PlantsJson = new sap.ui.model.json.JSONModel(EtPlants);
			PlantsJson.iSizeLimit = 10000;
			var CostCenterJson = new sap.ui.model.json.JSONModel(EtCostCenter);
			CostCenterJson.iSizeLimit = 10000;
			var AssetClassJson = new sap.ui.model.json.JSONModel(EtAssetClass);
			AssetClassJson.iSizeLimit = 10000;
			var LocationJson = new sap.ui.model.json.JSONModel(EtLocation);
			LocationJson.iSizeLimit = 10000;
			Core.byId("VhCompanyCodeId").setModel(CompanyCodeJson);
			Core.byId("VhPlantCodeId").setModel(PlantsJson);
			Core.byId("VhCostCenterId").setModel(CostCenterJson);
			Core.byId("VhAssetClassId").setModel(AssetClassJson);
			Core.byId("VhLocationId").setModel(LocationJson);
			Core.byId("VhPlantCodeId").setEnabled(false);
			Core.byId("VhCostCenterId").setEnabled(false);
			Core.byId("VhAssetClassId").setEnabled(false);
			Core.byId("VhLocationId").setEnabled(false);
		},
		AssetSearchClose: function() {
			Core.F4_AssetSearch.close();
			var emptyJson = new JSONModel([]);
			emptyJson.iSizeLimit = 10000;
			Core.byId("AssetTableId").setModel(emptyJson);
		},
		ClearBtnPress: function() {
			Core.byId("VhPlantCodeId").setEnabled(false);
			Core.byId("VhCostCenterId").setEnabled(false);
			Core.byId("VhAssetClassId").setEnabled(false);
			Core.byId("VhLocationId").setEnabled(false);
			Core.byId("VhCompanyCodeId").setSelectedKey("");
			Core.byId("VhPlantCodeId").setSelectedKey("");
			Core.byId("VhCostCenterId").setSelectedKey("");
			Core.byId("VhAssetClassId").setSelectedKey("");
			Core.byId("VhLocationId").setSelectedKey("");
			Core.byId("VhAssetNameId").setValue("");
			var emptyJson = new JSONModel([]);
			emptyJson.iSizeLimit = 10000;
			Core.byId("AssetTableId").setModel(emptyJson);
			Core.byId("AssetTabelPanelId").setVisible(false);
			var AssetTitle = Core.i18n.getText("AssetSearchTitle");
			Core.byId("AssetSearchTitleId").setText(AssetTitle);
		},
		Serach_Reqest_Data: function() {
			var wbsNo = Core.byId("WBSNoId").getValue();
			var ProjectNo = Core.byId("ProjNoId").getValue();
			var pipp_Asset = Core.byId("Asset_id").getValue();
			if(ProjectNo == "") {
				MessageBox.information(Core.i18n.getText("ProjectNoMandatoryTxt"));
				return false;
			} else {
				Core.DataLoadProgress.open();
				var EntityInputs = [];
				if(ProjectNo != "") {
					var data = "Pspid eq '".concat(ProjectNo).concat("'");
					EntityInputs.push(data);
					var data = "Pspnr eq '".concat(Core.Pspnr).concat("'");
					EntityInputs.push(data);
					var data = "Psphi eq '".concat(Core.Psphi).concat("'");
					EntityInputs.push(data);
				}
				if(wbsNo != "") {
					var data = "Posid eq '".concat(Core.Poski).concat("'");
					EntityInputs.push(data);
				}
				if(pipp_Asset != "") {
					var data = "Anln1 eq '".concat(pipp_Asset).concat("'");
					EntityInputs.push(data);
					var data = "Anln2 eq '".concat(Core.Anln2).concat("'");
					EntityInputs.push(data);
					var data = "Bukrs eq '".concat(Core.Bukrs).concat("'");
					EntityInputs.push(data);
				}
				var EntityValue = "GetProjUpdSet?$expand=EtProjUpdData";
				if(EntityInputs.length > 0) {
					EntityInputs = EntityInputs.toString();
					EntityInputs = EntityInputs.split(',').join(' and ');
					EntityInputs = encodeURIComponent(EntityInputs);
					EntityValue = "GetProjUpdSet?$filter=" + EntityInputs + "&$expand=EtProjUpdData";
				}
				Core.that.checkConnection();
				if(Core.B_isonLine == false) {
					MessageBox.warning(Core.i18n.getText("msgoffline"));
					return false;
				}
				setTimeout(function() {
					var Update_Request_Serach_Model = Core.that.oDataModel();
					Update_Request_Serach_Model.read(EntityValue, null, null, false, function(oData, response) {
						if(oData.results.length != 0) {
							var ProjUpdData = oData.results[0].EtProjUpdData.results;
							var Project_Update_Model = new JSONModel(ProjUpdData);
							Project_Update_Model.iSizeLimit = 10000;
							Core.that.getView().byId("Project_Update_Request_Table").setModel(Project_Update_Model);
							Core.Update_Request_Search.close();
						}else{
							Core.that.getView().byId("Project_Update_Request_Table").setModel(Core.that.Empty_Model);
						}
						Core.DataLoadProgress.close();
					}, function(oError) {
						Core.DataLoadProgress.close();
						var errMessage = oError.response.statusText;
						var MessageText = JSON.parse(oError.response.body).error.message.value;
						MessageBox.error(errMessage + "  (" + MessageText + ")");
					});
				}, 500);
			}
		},
		AssetBtnPress: function() {
			var CompanyCode = Core.byId("VhCompanyCodeId").getSelectedKey();
			var PlanningPlant = Core.byId("VhPlantCodeId").getSelectedKey();
			var CostCenter = Core.byId("VhCostCenterId").getSelectedKey();
			var AssetClass = Core.byId("VhAssetClassId").getSelectedKey();
			var Location = Core.byId("VhLocationId").getSelectedKey();
			var AssetName = Core.byId("VhAssetNameId").getValue();
			if(CompanyCode == "") {
				var Msg = Core.i18n.getText("CompanyCodeMandatoryTxt");
				MessageBox.information(Msg);
			} else if(AssetClass == "") {
				var Msg = Core.i18n.getText("AsserClassMandatoryTxt");
				MessageBox.information(Msg);
			} else {
				Core.DataLoadProgress.open();
				Core.byId("AssetSearchPage").setExpanded(false);
				Core.byId("AssetTabelPanelId").setVisible(true);
				var EntityInputs = [];
				if(CompanyCode != "") {
					var data = "Bukrs eq '".concat(CompanyCode).concat("'");
					EntityInputs.push(data);
				}
				if(PlanningPlant != "") {
					var data = "Werks eq '".concat(PlanningPlant).concat("'");
					EntityInputs.push(data);
				}
				if(CostCenter) {
					var data = "Kostl eq '".concat(CostCenter).concat("'");
					EntityInputs.push(data);
				}
				if(AssetClass) {
					var data = "Anlkl eq '".concat(AssetClass).concat("'");
					EntityInputs.push(data);
				}
				if(Location) {
					var data = "Stort eq '".concat(Location).concat("'");
					EntityInputs.push(data);
				}
				if(AssetName) {
					var data = "Txt50 eq '".concat(AssetName).concat("'");
					EntityInputs.push(data);
				}
				var EntityValue = "SearchAssetSet?$expand=EtAssetSearch,EtAssetAnlb";
				if(EntityInputs.length > 0) {
					EntityInputs = EntityInputs.toString();
					EntityInputs = EntityInputs.split(',').join(' and ');
					EntityInputs = encodeURIComponent(EntityInputs);
					EntityValue = "SearchAssetSet?$filter=" + EntityInputs + "&$expand=EtAssetSearch,EtAssetAnlb";
				}
				Core.that.checkConnection();
				if(Core.B_isonLine == false) {
					MessageBox.warning(Core.i18n.getText("msgoffline"));
					return false;
				}
				setTimeout(function() {
					var getData = Core.that.oDataModel();
					getData.setHeaders({
						"muser": Core.O_Login_user.Muser
					});
					getData.read(EntityValue, null, null, false, function(oData, response) {
						var DataJson = new JSONModel([]);
						DataJson.iSizeLimit = 10000;
						var AssetTitle = Core.i18n.getText("AssetSearchTitle");
						if(oData.results.length == 0) {
							var Msg = Core.i18n.getText("NoDataMsg");
							MessageBox.information(Msg);
							Core.byId("AssetTableId").setModel(DataJson);
							Core.byId("AssetSearchTitleId").setText(AssetTitle);
						} else {
							DataJson.setData(oData.results[0].EtAssetSearch.results);
							Core.byId("AssetTableId").setModel(DataJson);
							var Depc_arr = oData.results[0].EtAssetAnlb.results;
							var Depc_arrlen = Depc_arr.length;
							if(Depc_arrlen > 0) {
								for(var k = 0; k < Depc_arrlen; k++) {
									var date = Depc_arr[k].Afabg;
									if(date != "" && date != "00000000") {
										var d = date;
										var day = d.slice(6);
										var q = d.substring(4, 0);
										var w = d.substring(6, 4);
										var myYear = q;
										var sptdate = String(w).split(" ");
										var ab = Number(sptdate);
										var months = [' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
										var myMonth = months[ab];
										var combineDatestr = day + " " + myMonth + " " + myYear;
										Depc_arr[k].Afabg = combineDatestr;
									} else {
										Depc_arr[k].Afabg = "";
									}
								}
								Core.A_DeprecationArea = Depc_arr;
							} else {
								Core.A_DeprecationArea = Depc_arr;
							}
							Core.byId("AssetSearchTitleId").setText(AssetTitle + " (" + oData.results[0].EtAssetSearch.results.length + ")");
						}
						Core.DataLoadProgress.close();
					}, function(oError) {
						Core.DataLoadProgress.close();
						console.log("Error in Search SearchIpset");
						var errMessage = oError.response.statusText;
						var MessageText = JSON.parse(oError.response.body).error.message.value;
						MessageBox.error(errMessage + "  (" + MessageText + ")");
					});
				}, 500);
			}
		},
		ReferehData: function() {
			var ProjectNo = Core.byId("ProjNoId").getValue();
			if(ProjectNo == "") {
				Core.Update_Request_Search.open();
			} else {
				MessageBox.confirm(Core.i18n.getText("RefershText"), {
					title: "Confirm", // default
					onClose: function(sAction) {
						if(sAction == 'YES') {
							Core.that.Serach_Reqest_Data();
						}
					}, // default
					styleClass: "", // default
					actions: [sap.m.MessageBox.Action.YES,
						sap.m.MessageBox.Action.NO
					], // default
					emphasizedAction: sap.m.MessageBox.Action.YES, // default
					initialFocus: null, // default
					textDirection: sap.ui.core.TextDirection.Inherit // default
				});
			}
		},
		AssetLiveSearch: function(oEvt) {
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			var list = Core.byId("AssetTableId");
			if(list != undefined) {
				var binding = list.getBinding("items");
				if(sQuery && sQuery.length > 0) {
					aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Anlkl", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Stort", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Kostl", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Anln1", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Anln2", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Txt50", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Invnr", sap.ui.model.FilterOperator.Contains, sQuery));
					aFilters.push(new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, sQuery));
					var filter = new sap.ui.model.Filter(aFilters, false);
					binding.filter(filter, "Application");
				} else {
					binding.filter([]);
				}
			}
			var AssetTitle = Core.i18n.getText("AssetTitle");
			Core.byId("AssetSearchTitleId").setText(AssetTitle + " (" + binding.iLength + ")");
		},
		AddAssetPress: function() {
			var AssetTable = Core.byId("AssetTableId");
			var SelectedContext = AssetTable.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			if(SelectedContextLength == 0) {
				MessageBox.information(Core.i18n.getText("selectRecord"));
				return false;
			} else if(SelectedContextLength > 1) {
				MessageBox.information(Core.i18n.getText("selectRecordOnlyOne"));
				return false;
			} else {
				var AssetTableData = AssetTable.getContextByIndex(AssetTable.getSelectedIndices()[0]).getObject();
				if(Core.F4_Update_Request.isOpen() == true) {
					Core.byId("SubAsset_id").setValue(AssetTableData.Anln2);
					Core.byId("CostCenter_id").setText(AssetTableData.Bukrs);
					Core.byId("pip_asset_f4").setValue(AssetTableData.Anln1);
					Core.byId("pipbalance_f4").setValue(AssetTableData.Netbv);
				} else {
					Core.Anln2 = AssetTableData.Anln2;
					Core.Bukrs = AssetTableData.Bukrs;
					Core.byId("Asset_id").setValue(AssetTableData.Anln1);
				}
				Core.F4_AssetSearch.close();
			}
		},
		Clear_Serach: function() {
			Core.byId("WBSNoId").setValue();
			Core.byId("ProjNoId").setValue();
			Core.byId("Asset_id").setValue();
		},
		// Delete attachments
		deleteRowAttachment: function(oEvent) {
			var deleteMsg = Core.i18n.getText("deleteMsg");
			var item = oEvent.getParameter('listItem');
			var path = item.getBindingContext().getPath();
			var idx = parseInt(path.substring(path.lastIndexOf('/') + 1), 10);
			var model = Core.byId("AttachmentTabel").getModel();
			var data = model.getData();
			var Delete_dialog = new Dialog({
				title: Core.i18n.getText("MsgDelete"),
				type: 'Message',
				state: 'Warning',
				content: new Text({
					text: deleteMsg
				}),
				beginButton: new Button({
					text: Core.i18n.getText("MsgYes"),
					type: 'Accept',
					press: function() {
						Delete_dialog.close();
						data.splice(idx, 1);
						var i = 0;
						for(i = 0; i < data.length; i++) {
							var index = i + 1;
							data[i].PR_Item = index.toString();
						}
						model.setData(data);
						model.refresh;
					}
				}),
				endButton: new Button({
					text: Core.i18n.getText("MsgNo"),
					type: 'Reject',
					press: function() {
						Delete_dialog.close();
					}
				}),
				afterClose: function() {
					// Delete_dialog.destroy();
				}
			});
			Delete_dialog.open();
		},
		// Response Error Message close
		OkClose: function() {
			Core.F4_MessageView.close();
			if(Core.is_Cross_App == "Y" && Core.Navto_Launchpad == "X") {
				setTimeout(function() {
					window.close();
				}, 500)
			} else if(Core.is_Cross_App == "N" && Core.Navto_Launchpad == "X") {
				Core.Navto_Launchpad = "";
				window.history.go(-1); //Back to FioriLaunchpad
			}
		},
		// Download Attachment
		AttachmentTabelPress: function(oEvent) {
			var sId = oEvent.oSource.sId;
			if(oEvent.mParameters.listItem != undefined) {
				var index = parseInt(oEvent.mParameters.listItem.sId.split("AcquisitionTabelView-")[1]);
			} else {
				var index = parseInt(sId.split("AcquisitionTabelView-")[1]);
			}
			var modelData = Core.byId("AcquisitionTabelView").getModel();
			var data = modelData.getData();
			var content = data[index].Content;
			var file_path = 'data:application/octet-stream;base64,' + content;
			var a = document.createElement('A');
			a.href = file_path;
			a.download = data[index].Filename;
			document.body.appendChild(a);
			a.click();
			a.emphasized = true;
			document.body.removeChild(a);
		},
		AssetDeletePress: function() {
			var DataTable = this.getView().byId("AssetListDataTable");
			var SelectedContext = DataTable.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			var AssetData = DataTable.getModel().getData();
			for(var j = SelectedContextLength - 1; j >= 0; j--) {
				AssetData.splice(SelectedContext[j], 1);
			}
			DataTable.clearSelection();
			var DataLength = AssetData.length;
			for(var i = 0; i < DataLength; i++) {
				var Fenum = i + 1;
				AssetData[i].Fenum = Fenum.toString();
			}
			DataTable.getModel().refresh(true);
		},
		AddNewAssetPress: function() {
			Core.F4_AddNewAsset.open();
			var EtCompanyCode = Core.A_UserMasterData.EtUserBukrs.results;
			var EtAssetClass = Core.A_A_MasterDataForF4Helps.EtAssetClass.results;
			var EtCostCenter = Core.A_MasterDataForF4Helps.EtCostCenter.results;
			var EtUnits = Core.A_MasterDataForF4Helps.EtUnits.results;
			var EtPlants = Core.A_MasterDataForF4Helps.EtPlants.results;
			//var EtWbs = Core.A_MasterDataForF4Helps.EtWbs.results;
			var CompanyCodeJson = new JSONModel(EtCompanyCode);
			CompanyCodeJson.iSizeLimit = 10000;
			var AssetClassJson = new JSONModel(EtAssetClass);
			AssetClassJson.iSizeLimit = 10000;
			var CostCenterJson = new JSONModel(EtCostCenter);
			CostCenterJson.iSizeLimit = 10000;
			var UnitsJson = new JSONModel(EtUnits);
			UnitsJson.iSizeLimit = 10000;
			var PlantsJson = new JSONModel(EtPlants);
			PlantsJson.iSizeLimit = 10000;
			Core.byId("NewAssetCompanyCode").setModel(CompanyCodeJson);
			Core.byId("NewAssetClassId").setModel(AssetClassJson);
			Core.byId("NewAssetCostCenter").setModel(CostCenterJson);
			Core.byId("NewAssetBaseUnit").setModel(UnitsJson);
			Core.byId("NewAssetPlaningPlantId").setModel(PlantsJson);
			Core.byId("NewAssetWBSNoId").setModel(PlantsJson);
			Core.byId("NewAssetAsset").setValue("");
			Core.byId("NewAssetSubAsset").setValue("");
			Core.byId("NewAssetQuantity").setValue("");
			Core.byId("NewAssetNameId").setValue("");
		},
		AddNewAssetClose: function() {
			Core.F4_AddNewAsset.close();
		},
		AddAsset: function() {
			var CompanyCode = Core.byId("NewAssetCompanyCode").getSelectedKey();
			var AssetClass = Core.byId("NewAssetClassId").getSelectedKey();
			var CostCenter = Core.byId("NewAssetCostCenter").getSelectedKey();
			var Unit = Core.byId("NewAssetBaseUnit").getSelectedKey();
			var Plant = Core.byId("NewAssetPlaningPlantId").getSelectedKey();
			var WBSNo = Core.byId("NewAssetWBSNoId").getSelectedKey();
			var Asset = Core.byId("NewAssetAsset").getValue();
			var SubAsset = Core.byId("NewAssetSubAsset").getValue();
			var Quantity = Core.byId("NewAssetQuantity").getValue();
			var Name = Core.byId("NewAssetNameId").getValue();
			if(CompanyCode == "") {
				var Msg = Core.i18n.getText("CompanyCodeMandatoryTxt");
				MessageBox.information(Msg);
			} else if(AssetClass == "") {
				var Msg = Core.i18n.getText("AsserClassMandatoryTxt");
				MessageBox.information(Msg);
			} else {
				var DataModel = this.getView().byId("AssetListDataTable").getModel();
				var DataTable = [];
				if(DataModel != undefined) {
					DataTable = DataModel.getData();
				}
				var Sno = 0;
				var DataTableLength = DataTable.length;
				if(DataTableLength == 0) {
					Sno = 1;
				} else {
					Sno = DataTableLength + 1;
				}
				var obj = {
					Sno: Sno,
					Bukrs: CompanyCode,
					Anlkl: AssetClass,
					Werks: Plant,
					Stort: "",
					Kostl: CostCenter,
					Anln1: Asset,
					Anln2: SubAsset,
					Txt50: Name,
					Aktiv: "",
					Lifnr: "",
					Invnr: "",
					Prctr: "",
					Meins: Unit,
					Menge: Quantity,
					Posid: WBSNo
				};
				DataTable.push(obj);
				var AssetModel = new JSONModel(DataTable);
				AssetModel.iSizeLimit = 10000;
				Core.that.getView().byId("AssetListDataTable").setModel(AssetModel);
				Core.F4_AddNewAsset.close();
			}
		},
		VendorClose: function() {
			Core.F4_PersonnelVendorSearch.close();
		},
		ClearVendorPress: function() {
			Core.byId("VendorCompanyCode").setSelectedKey("");
			Core.byId("VendorNoId").setValue("");
			Core.byId("VendorNameId").setValue("");
			Core.byId("VendorPersonnelNoId").setValue("");
			Core.byId("VendorFirstNameId").setValue("");
			Core.byId("VendorLastNameId").setValue("");
			var emptyJson = new JSONModel([]);
			emptyJson.iSizeLimit = 10000;
			Core.byId("VendorTableId").setModel(emptyJson);
			Core.byId("VendorTabelPanelId").setVisible(false);
			var TitleText = Core.byId("VendorTitleId").getText().indexOf("Vendor");
			var Title = "";
			if(TitleText != -1) {
				Title = Core.i18n.getText("SearchVendorTitle");
			} else {
				Title = Core.i18n.getText("SearchPersonnelInChargeTitle");
			}
			Core.byId("VendorTitleId").setText(Title);
		},
		GetVendorPress: function() {
			var CompanyCode = Core.byId("VendorCompanyCode").getSelectedKey();
			var VendorNo = Core.byId("VendorNoId").getValue();
			var VendorName = Core.byId("VendorNameId").getValue();
			var PersonnelNo = Core.byId("VendorPersonnelNoId").getValue();
			var FirstName = Core.byId("VendorFirstNameId").getValue();
			var LastName = Core.byId("VendorLastNameId").getValue();
			var TitleText = Core.byId("VendorTitleId").getText().indexOf("Vendor");
			if(CompanyCode == "" && TitleText != -1) {
				var Msg = Core.i18n.getText("CompanyCodeMandatoryTxt");
				MessageBox.information(Msg);
			} else {
				Core.DataLoadProgress.open();
				Core.byId("VendorSearchPageId").setExpanded(false);
				Core.byId("VendorTabelPanelId").setVisible(true);
				var Obj = {};
				var EntityInputs = [];
				if(CompanyCode != "") {
					var data = "Bukrs eq '".concat(CompanyCode).concat("'");
					EntityInputs.push(data);
					Obj.Bukrs = CompanyCode;
				}
				if(VendorNo != "") {
					var data = "Lifnr eq '".concat(VendorNo).concat("'");
					EntityInputs.push(data);
					Obj.Lifnr = VendorNo;
				}
				if(VendorName) {
					var data = "Mcod1 eq '".concat(VendorName).concat("'");
					EntityInputs.push(data);
					Obj.Mcod1 = VendorName;
				}
				if(PersonnelNo != "") {
					var data = "Pernr eq '".concat(PersonnelNo).concat("'");
					EntityInputs.push(data);
					Obj.Pernr = PersonnelNo;
				}
				if(FirstName != "") {
					var data = "Vnamc eq '".concat(FirstName).concat("'");
					EntityInputs.push(data);
					Obj.Vnamc = FirstName;
				}
				if(LastName) {
					var data = "Nchmc eq '".concat(LastName).concat("'");
					EntityInputs.push(data);
					Obj.Nchmc = LastName;
				}
				var data = "Pkv eq '".concat("P").concat("'");
				Obj.Pkv = "P";
				if(TitleText != -1) {
					var data = "Pkv eq '".concat("V").concat("'");
					Obj.Pkv = "V";
				}
				EntityInputs.push(data);
				var EntityValue = "SearchPKVDISet?$expand=EtPkvSearch";
				if(EntityInputs.length > 0) {
					EntityInputs = EntityInputs.toString();
					EntityInputs = EntityInputs.split(',').join(' and ');
					EntityInputs = encodeURIComponent(EntityInputs);
					EntityValue = "SearchPKVDISet?$filter=" + EntityInputs + "&$expand=EtPkvSearch";
				}
				Core.that.checkConnection();
				if(Core.B_isonLine == false) {
					MessageBox.warning(Core.i18n.getText("msgoffline"));
					return false;
				}
				setTimeout(function() {
					var getData = Core.that.oDataModel();
					getData.setHeaders(Obj);
					getData.read(EntityValue, null, null, false, function(oData, response) {
						var TitleText = Core.byId("VendorTitleId").getText().indexOf("Vendor");
						var DataJson = new JSONModel([]);
						DataJson.iSizeLimit = 10000;
						var Title = "";
						if(TitleText != -1) {
							Title = Core.i18n.getText("SearchVendorTitle");
						} else {
							Title = Core.i18n.getText("SearchPersonnelInChargeTitle");
						}
						if(oData.results.length == 0) {
							var Msg = Core.i18n.getText("NoDataMsg");
							MessageBox.information(Msg);
							Core.byId("VendorTableId").setModel(DataJson);
							Core.byId("VendorTitleId").setText(Title);
						} else {
							DataJson.setData(oData.results[0].EtPkvSearch.results);
							Core.byId("VendorTableId").setModel(DataJson);
							Core.byId("VendorTitleId").setText(Title + " (" + oData.results[0].EtPkvSearch.results.length + ")");
						}
						Core.DataLoadProgress.close();
					}, function(oError) {
						Core.DataLoadProgress.close();
						console.log("Error in Search SearchPKVSet");
						var errMessage = oError.response.statusText;
						var MessageText = JSON.parse(oError.response.body).error.message.value;
						MessageBox.error(errMessage + "  (" + MessageText + ")");
					});
				}, 2000);
			}
		},
		Addvendor: function(oEvent) {
			var TitleText = Core.byId("VendorTitleId").getText().indexOf("Vendor");
			var VendorTable = Core.byId("VendorTableId");
			var SelectedContext = VendorTable.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			if(SelectedContextLength == 0) {
				var Msg = Core.i18n.getText("selectRecord");
				MessageBox.information(Msg);
			} else {
				var VendorTableData = VendorTable.getContextByIndex(VendorTable.getSelectedIndices()[0]).getObject();
				if(TitleText != -1) {} else {}
				Core.F4_PersonnelVendorSearch.close();
			}
		},
		WBSNoValueHelp: function(oEvent) {
			Core.opened_Input = oEvent.getSource().getId();
			Core.F4_WbsNoSearch.open();
			Core.byId("WbsNoSearchPageId").setExpanded(true);
			this.ClearWbsPress();
		},
		WbsNoClose: function() {
			Core.F4_WbsNoSearch.close();
		},
		ClearWbsPress: function() {
			Core.byId("WbsProjectId").setValue("");
			Core.byId("WbsProjectNameId").setValue("");
			Core.byId("WbsWBSNoId").setValue("");
			Core.byId("WbsWbsNameId").setValue("");
			var emptyJson = new JSONModel([]);
			emptyJson.iSizeLimit = 10000;
			Core.byId("WbsTableId").setModel(emptyJson);
			Core.byId("WbsTabelPanelId").setVisible(false);
			var Title = Core.i18n.getText("SearchWbsNoTitle");
			Core.byId("SearchWbsNoTitleId").setText(Title);
		},
		GetWbsPress: function() {
			var Project = Core.byId("WbsProjectId").getValue();
			var ProjectName = Core.byId("WbsProjectNameId").getValue();
			var WBSNo = Core.byId("WbsWBSNoId").getValue("");
			var WbsName = Core.byId("WbsWbsNameId").getValue("");
			Core.DataLoadProgress.open();
			Core.byId("WbsNoSearchPageId").setExpanded(false);
			Core.byId("WbsTabelPanelId").setVisible(true);
			var EntityInputs = [];
			var Obj = {};
			if(Project != "") {
				var data = "Pspid eq '".concat(Project).concat("'");
				EntityInputs.push(data);
				Obj.Pspid = Project;
			}
			if(ProjectName != "") {
				var data = "Postu eq '".concat(ProjectName).concat("'");
				EntityInputs.push(data);
				Obj.Postu = ProjectName;
			}
			if(WBSNo) {
				var data = "Posid eq '".concat(WBSNo).concat("'");
				EntityInputs.push(data);
				Obj.Posid = WBSNo;
			}
			if(WbsName != "") {
				var data = "Postu eq '".concat(WbsName).concat("'");
				EntityInputs.push(data);
				Obj.Uname = WbsName;
			}
			var EntityValue = "SearchWBSSet?$expand=EtWbsSearch";
			if(EntityInputs.length > 0) {
				EntityInputs = EntityInputs.toString();
				EntityInputs = EntityInputs.split(',').join(' and ');
				EntityInputs = encodeURIComponent(EntityInputs);
				EntityValue = "SearchWBSSet?$filter=" + EntityInputs + "&$expand=EtWbsSearch";
			}
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			setTimeout(function() {
				var getData = Core.that.oDataModel();
				getData.setHeaders(Obj);
				getData.read(EntityValue, null, null, false, function(oData, response) {
					var DataJson = new JSONModel([]);
					DataJson.iSizeLimit = 10000;
					var Title = Core.i18n.getText("SearchWbsNoTitle");
					if(oData.results.length == 0) {
						var Msg = Core.i18n.getText("NoDataMsg");
						MessageBox.information(Msg);
						Core.byId("WbsTableId").setModel(DataJson);
						Core.byId("SearchWbsNoTitleId").setText(Title);
					} else {
						DataJson.setData(oData.results[0].EtWbsSearch.results);
						Core.byId("WbsTableId").setModel(DataJson);
						Core.byId("SearchWbsNoTitleId").setText(Title + " (" + oData.results[0].EtWbsSearch.results.length + ")");
					}
					Core.DataLoadProgress.close();
				}, function(oError) {
					Core.DataLoadProgress.close();
					console.log("Error in Search SearchPKVSet");
					var errMessage = oError.response.statusText;
					var MessageText = JSON.parse(oError.response.body).error.message.value;
					MessageBox.error(errMessage + "  (" + MessageText + ")");
				});
			}, 500);
		},
		AddWbsNo: function() {
			var WbsTable = Core.byId("WbsTableId");
			var SelectedContext = WbsTable.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			if(SelectedContextLength == 0) {
				var Msg = Core.i18n.getText("selectRecord");
				MessageBox.information(Msg);
				return false;
			} else {
				var Data = WbsTable.getContextByIndex(WbsTable.getSelectedIndices()[0]).getObject();
				if(Core.opened_Input == 'ProjNoId') {
					Core.Poski = Data.Poski;
					Data.Pspnr.length > 8 && (Data.Pspnr = Data.Pspnr.slice(-8));
					Core.Pspnr = Data.Pspnr;
					Data.Psphi.length > 8 && (Data.Psphi = Data.Psphi.slice(-8));
					Core.Psphi = Data.Psphi;
					Core.byId("ProjNoId").setValue(Data.Pspid);
					Core.byId("WBSNoId").setValue(Data.Posid);
				} else if(Core.opened_Input == 'WBSNoId') {
					Core.Poski = Data.Poski;
					Data.Pspnr.length > 8 && (Data.Pspnr = Data.Pspnr.slice(-8));
					Core.Pspnr = Data.Pspnr;
					Data.Psphi.length > 8 && (Data.Psphi = Data.Psphi.slice(-8));
					Core.Psphi = Data.Psphi;
					Core.byId("WBSNoId").setValue(Data.Posid);
					Core.byId("ProjNoId").setValue(Data.Pspid);
				} else if(Core.opened_Input == 'wbsNo_f4') {
					Core.byId("wbsNo_f4").setValue(Data.Posid);
					Core.byId("ProjectNo_f4").setValue(Data.Pspid);
					Core.byId("CompletionDate_f4").setValue(Core.formatter.formatddmmyyy(Data.Plsez));
					Core.byId("pipbalance_f4").setValue(Data.Answt);
					Core.byId("pip_asset_f4").setValue(Data.Anln1);
					Core.byId("SubAsset_id").setValue(Data.Anln2);
				} else if(Core.opened_Input == 'ProjectNo_f4') {
					Core.byId("wbsNo_f4").setValue(Data.Posid);
					Core.byId("ProjectNo_f4").setValue(Data.Pspid);
				}
				Core.F4_WbsNoSearch.close();
			}
		},
		ExcelTemplatePress: function() {
			var content = Core.FAPFormExcelTemplate;
			var file_path = 'data:application/octet-stream;base64,' + content;
			var a = document.createElement('A');
			a.href = file_path;
			a.download = "FAP Form Excel Template.xlsx";
			document.body.appendChild(a);
			a.click();
			a.emphasized = true;
			document.body.removeChild(a);
		},
		AssetTitlePress: function(oEvent) {
			var AssetName = Core.i18n.getText("AssetName");
			var oButton = oEvent.getSource();
			Core.byId("Poptext").setText(AssetName);
			Core.delayedCall(0, this, function() {
				Core.F4_ResponsivePopover.openBy(oButton);
			});
		},
		AssetNamePress: function(oEvent) {
			var AdditionalAssetName = Core.i18n.getText("AdditionalAssetName");
			Core.byId("Poptext").setText(AdditionalAssetName);
			var oButton = oEvent.getSource();
			Core.delayedCall(0, this, function() {
				Core.F4_ResponsivePopover.openBy(oButton);
			});
		},
		AssetTypePress: function(oEvent) {
			var AssetTypeHelp = Core.i18n.getText("AssetTypeHelp");
			Core.byId("Poptext").setText(AssetTypeHelp);
			var oButton = oEvent.getSource();
			Core.delayedCall(0, this, function() {
				Core.F4_ResponsivePopover.openBy(oButton);
			});
		},
		UpdateRequest_Data: function() {
			var F4_view = Core;
			var ProjectNo = F4_view.byId("ProjectNo_f4").getValue();
			var pip_asset = F4_view.byId("pip_asset_f4").getValue();
			var wbsNo = F4_view.byId("wbsNo_f4").getValue();
			var ProjectCost = F4_view.byId("ProjectCost_f4").getValue();
			var ApprCost = F4_view.byId("ApprCost_f4").getValue();
			var Budget = F4_view.byId("Budget_f4").getValue();
			var pipbalance = F4_view.byId("pipbalance_f4").getValue();
			var YEP = F4_view.byId("YEP_f4").getValue();
			var CompletionDate = F4_view.byId("CompletionDate_f4").getValue();
			var ReportingDate = F4_view.byId("ReportingDate_f4").getValue();
			var RevisedCompletionDate = F4_view.byId("RevisedCompletionDate_f4").getValue();
			var PercentCompletion = F4_view.byId("PercentCompletion_f4").getValue();
			var Status = F4_view.byId("Status_f4").getValue();
			var Ageing = F4_view.byId("Ageing_f4").getValue();
			var Cost_Center = F4_view.byId("CostCenter_id").getText();
			var Sub_Asset = F4_view.byId("SubAsset_id").getValue();
			Ageing = CompletionDate != "" && CompletionDate != "" ? this.Calculate_Ageing(CompletionDate,ReportingDate) : "";
			/*d1 = this.Format_Date(CompletionDate);
			d2 = this.Format_Date(ReportingDate);
			Ageing = new Date(+d1.slice(0,4),+d1.slice(4,2),+d1.slice(6,8)).getTime() - new Date(+d2.slice(0,4),+d2.slice(4,2),+d2.slice(6,8)).getTime() / 86400000;*/
			Ageing = Ageing.replace('-','');
			if(ProjectNo == "") {
				MessageBox.information(Core.i18n.getText("ProjectNoMandatoryTxt"));
				return false;
			} else if(Budget === "") {
				MessageBox.warning(Core.i18n.getText("EnterApprovedBudget"));
				return false;
			} else if(YEP === "") {
				MessageBox.warning(Core.i18n.getText("EnterYEP"));
				return false;
			} else if(CompletionDate === "") {
				MessageBox.warning(Core.i18n.getText("EnterCompletionDate"));
				return false;
			} else if(ReportingDate === "") {
				MessageBox.warning(Core.i18n.getText("EnterReportingDate"));
				return false;
			} else if(RevisedCompletionDate === "") {
				MessageBox.warning(Core.i18n.getText("EnterRevisedCompletionDate"));
				return false;
			} else if(PercentCompletion == '') {
				MessageBox.warning(Core.i18n.getText("EnterPercentCompletion"));
				return false;
			}  else if(Number(PercentCompletion) > 100) {
				MessageBox.warning(Core.i18n.getText("PercentageCannotgreater100"));
				return false;
			} else if(Status === "") {
				MessageBox.warning(Core.i18n.getText("EnterStatus"));
				return false;
			}
			var Selected_index = this.getView().byId("Project_Update_Request_Table").getSelectedIndex();
			var Model = this.getView().byId("Project_Update_Request_Table").getModel();
			var Array_of = Model.getData()[Selected_index];
			Array_of.Pspid = ProjectNo;
			Array_of.Anln1 = pip_asset;
			Array_of.Posid = wbsNo;
			Array_of.Anln2 = Sub_Asset,
			Array_of.Bukrs = Cost_Center;
			Array_of.Prjcost = ProjectCost;
			Array_of.Rprjcost = ApprCost;
			Array_of.Wert1 = Budget;
			Array_of.Answt = pipbalance;
			Array_of.Yepcost = YEP;
			Array_of.Compd = CompletionDate;
			Array_of.Repdate = ReportingDate;
			Array_of.Rcompd = RevisedCompletionDate;
			Array_of.Prozs = PercentCompletion;
			Array_of.Pstatus = Status;
			Array_of.Dageing = Ageing
			Model.refresh(true);
			Core.F4_Update_Request.close();
		},
		AddRequest_Data: function() {
			var F4_view = Core;
			var ProjectNo = F4_view.byId("ProjectNo_f4").getValue();
			var pip_asset = F4_view.byId("pip_asset_f4").getValue();
			var wbsNo = F4_view.byId("wbsNo_f4").getValue();
			var ProjectCost = F4_view.byId("ProjectCost_f4").getValue();
			var ApprCost = F4_view.byId("ApprCost_f4").getValue();
			var Budget = F4_view.byId("Budget_f4").getValue();
			var pipbalance = F4_view.byId("pipbalance_f4").getValue();
			var YEP = F4_view.byId("YEP_f4").getValue();
			var CompletionDate = F4_view.byId("CompletionDate_f4").getValue();
			var ReportingDate = F4_view.byId("ReportingDate_f4").getValue();
			var RevisedCompletionDate = F4_view.byId("RevisedCompletionDate_f4").getValue();
			var PercentCompletion = F4_view.byId("PercentCompletion_f4").getValue();
			var Status = F4_view.byId("Status_f4").getValue();
			var Ageing = F4_view.byId("Ageing_f4").getValue();
			var Cost_Center = F4_view.byId("CostCenter_id").getText();
			var Sub_Asset = F4_view.byId("SubAsset_id").getValue();
			var Plant = F4_view.byId("Plants").getSelectedKey();
			Ageing = CompletionDate != "" && CompletionDate != "" ? this.Calculate_Ageing(CompletionDate,ReportingDate) : "";
			Ageing = Ageing.replace('-','');
			if(ProjectNo == "") {
				MessageBox.information(Core.i18n.getText("ProjectNoMandatoryTxt"));
				return false;
			} else if(Budget === "") {
				MessageBox.warning(Core.i18n.getText("EnterApprovedBudget"));
				return false;
			} else if(YEP === "") {
				MessageBox.warning(Core.i18n.getText("EnterYEP"));
				return false;
			} else if(CompletionDate === "") {
				MessageBox.warning(Core.i18n.getText("EnterCompletionDate"));
				return false;
			} else if(ReportingDate === "") {
				MessageBox.warning(Core.i18n.getText("EnterReportingDate"));
				return false;
			} else if(RevisedCompletionDate === "") {
				MessageBox.warning(Core.i18n.getText("EnterRevisedCompletionDate"));
				return false;
			} else if(PercentCompletion == '') {
				MessageBox.warning(Core.i18n.getText("EnterPercentCompletion"));
				return false;
			} else if(Number(PercentCompletion) > 100) {
				MessageBox.warning(Core.i18n.getText("PercentageCannotgreater100"));
				return false;
			} else if(Status === "") {
				MessageBox.warning(Core.i18n.getText("EnterStatus"));
				return false;
			}
			var obj = {
				Pspid: ProjectNo,
				Anln1: pip_asset,
				Bukrs: Cost_Center,
				Anln2: Sub_Asset,
				Posid: wbsNo,
				Prjcost: ProjectCost,
				Rprjcost: ApprCost,
				Wert1: Budget,
				Answt: pipbalance,
				Yepcost: YEP,
				Compd: CompletionDate,
				Repdate: ReportingDate,
				Rcompd: RevisedCompletionDate,
				Prozs: PercentCompletion,
				Pstatus: Status,
				Dageing: Ageing,
				Action : "I",
				Werks : Plant
			};
			var Arr = [];
			Arr.push(obj);
			var Model = this.getView().byId("Project_Update_Request_Table").getModel();
			if(Model == undefined) {
				var oModel = new JSONModel(Arr);
				this.getView().byId("Project_Update_Request_Table").setModel(oModel);
			} else if(Model != undefined && Model.getData()) {
				Model.getData().push(obj);
				Model.refresh(true);
			}
			Core.F4_Update_Request.close();
		},
		// Clear Proj Comp F4
		Clear_Request_Data: function() {
			var F4_view = Core;
			F4_view.byId("ReportingDate_f4").setValue();
			F4_view.byId("ProjectNo_f4").setValue();
			F4_view.byId("pip_asset_f4").setValue();
			F4_view.byId("wbsNo_f4").setValue();
			F4_view.byId("ProjectCost_f4").setValue();
			F4_view.byId("ApprCost_f4").setValue();
			F4_view.byId("Budget_f4").setValue();
			F4_view.byId("pipbalance_f4").setValue();
			F4_view.byId("YEP_f4").setValue();
			F4_view.byId("CompletionDate_f4").setValue();
			F4_view.byId("RevisedCompletionDate_f4").setValue();
			F4_view.byId("PercentCompletion_f4").setValue();
			F4_view.byId("Status_f4").setValue();
			F4_view.byId("Ageing_f4").setValue();
			F4_view.byId("CostCenter_id").setText();
			F4_view.byId("SubAsset_id").setValue();
			F4_view.byId("Plants").setValue();
		},
		// Close Proj Comp F4
		UpdateRequest_Close: function() {
			Core.F4_Update_Request.close();
		},
		// Change event for DatePicker
		changeDateHandler: function(oEvent) {
			var Date = oEvent.getParameter("value");
			var F4_view = Core;
			var view = this.getView();
			if(view.byId(Core.OpenedDate_id) != undefined) {
				view.byId(Core.OpenedDate_id).setValue(Date);
			} else if(F4_view.byId(Core.OpenedDate_id) != undefined) {
				F4_view.byId(Core.OpenedDate_id).setValue(Date);
			}
		},
		// Global Datepicker
		openDatePicker: function(oEvent) {
			var view_id = oEvent.mParameters.id.lastIndexOf("-");
			view_id = oEvent.mParameters.id.slice(view_id + 1, 100);
			Core.OpenedDate_id = view_id;
			this.getView().byId("HiddenDP").setValue(new Date());
			this.getView().byId("HiddenDP").openBy(oEvent.getSource().getDomRef());
		},
		Add_Record: function() {
			Core.byId("pip_addorupdate").setText(Core.i18n.getText("AddProjectWBS"));
			Core.byId("btnAdd_F4").setVisible(true);
			Core.byId("btnUpdate_F4").setVisible(false);
			Core.F4_Update_Request.open();
			Core.byId("ReportingDate_f4").setValue(Core.DateFormat_ddMMMyyyy.format(new Date()));
		},
		Edit_Record: function(oEvent) {
			var _Model = this.getView().byId("Project_Update_Request_Table");
			var SelectedContext = _Model.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			if(SelectedContextLength === 0) {
				MessageBox.warning(Core.i18n.getText("SelectRecord"));
				return false;
			} else if(SelectedContextLength > 1) {
				MessageBox.information(Core.i18n.getText("selectRecordOnlyOne"));
				return false;
			}
			Core.F4_Update_Request.open();
			Core.byId("pip_addorupdate").setText(Core.i18n.getText("UpdateProjectWBS"));
			Core.byId("btnAdd_F4").setVisible(false);
			Core.byId("btnUpdate_F4").setVisible(true);
			var Selected_index = this.getView().byId("Project_Update_Request_Table").getSelectedIndex();
			var F4_view = Core;
			var obj = _Model.getModel().getData()[Selected_index];
			F4_view.byId("ProjectNo_f4").setValue(obj.Pspid);
			F4_view.byId("pip_asset_f4").setValue(obj.Anln1);
			F4_view.byId("wbsNo_f4").setValue(obj.Posid);
			F4_view.byId("ProjectCost_f4").setValue(obj.Prjcost);
			F4_view.byId("ApprCost_f4").setValue(obj.Rprjcost);
			F4_view.byId("Budget_f4").setValue(obj.Wert1);
			F4_view.byId("pipbalance_f4").setValue(obj.Answt);
			F4_view.byId("YEP_f4").setValue(obj.Yepcost);
			if(obj.Compd != ""){
				Core.byId("CompletionDate_f4").setValue(Core.formatter.formatddmmyyy(obj.Compd));
			}
			if(obj.Rcompd != ""){
				Core.byId("RevisedCompletionDate_f4").setValue(Core.formatter.formatddmmyyy(obj.Rcompd));
			}
			if(obj.Repdate != ""){
				Core.byId("ReportingDate_f4").setValue(Core.formatter.formatddmmyyy(obj.Repdate));
			}
			F4_view.byId("PercentCompletion_f4").setValue(obj.Prozs);
			F4_view.byId("Status_f4").setValue(obj.Pstatus);
			F4_view.byId("Ageing_f4").setValue(obj.Dageing);
			F4_view.byId("CostCenter_id").setText(obj.Bukrs);
			F4_view.byId("SubAsset_id").setValue(obj.Anln2);
			F4_view.byId("Plants").setSelectedKey(obj.Werks);
		},
		Delete_Record: function() {
			var _Model = this.getView().byId("Project_Update_Request_Table");
			var SelectedContext = _Model.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			if(SelectedContextLength === 0) {
				MessageBox.warning(Core.i18n.getText("SelectRecord"));
				return false;
			}
			var that = this;
			var Delete_Dialog = new Dialog({
				title: Core.i18n.getText("MsgWarning"),
				type: 'Message',
				state: 'Warning',
				content: new sap.m.Text({
					text: Core.i18n.getText("DeleteMsg")
				}),
				beginButton: new sap.m.Button({
					text: Core.i18n.getText("MsgYes"),
					type: 'Accept',
					press: function() {
						Delete_Dialog.close();
						var Table = that.getView().byId("Project_Update_Request_Table");
						var SelectedContext = Table.getSelectedIndices();
						var SelectedContextLength = SelectedContext.length;
						var TableData = Table.getModel().getData();
						for(var j = SelectedContextLength - 1; j >= 0; j--) {
							TableData[j].Action = "D";
							Core.Deleted_Records.push(TableData[j]);
							TableData.splice(SelectedContext[j], 1);
						}
						Table.clearSelection();
						Table.getModel().refresh(true);
					}
				}),
				endButton: new sap.m.Button({
					text: Core.i18n.getText("MsgNo"),
					type: 'Reject',
					press: function() {
						Delete_Dialog.close();
					}
				}),
				afterClose: function() {
					Delete_Dialog.destroy();
				}
			});
			Delete_Dialog.open();
		},
		beforeOpen: function() {},
		Budget_livechange: function(oEvent) {
			var id = oEvent.getSource().getId();
			var inputvalue = Core.byId(id).getValue();
			var value = inputvalue.replace(/[^0-9\.]/g, '');
			Core.byId(id).setDOMValue(value.substring(0, 10));
		},
		Amount_livechange: function(oEvent) {
			var inputvalue = Core.byId("Amount_id").getValue();
			var value = inputvalue.replace(/[^0-9\.]/g, '');
			Core.byId("Amount_id").setDOMValue(value.substring(0, 10));
		},
		PercentCompletion_livechange: function(oEvent) {
			var inputvalue = Core.byId("PercentCompletion_f4").getValue();
			var value = inputvalue.replace(/[^0-9\.]/g, '');
			Core.byId("PercentCompletion_f4").setDOMValue(value.substring(0, 3));
		},
		// Excel 
		ExcelUpdatePress: function() {
			var DataModel = this.getView().byId("Project_Update_Request_Table").getModel();
			var DataTable = [];
			if(DataModel != undefined) {
				DataTable = DataModel.getData();
			}
			if(DataTable.length != 0) {
				var informationDialog = new Dialog({
					title: Core.i18n.getText("Confirmation"),
					type: 'Message',
					state: 'Information',
					content: new sap.m.Text({
						text: Core.i18n.getText("DataErased")
					}),
					beginButton: new sap.m.Button({
						text: Core.i18n.getText("MsgYes"),
						type: 'Accept',
						press: function() {
							Core.F4_ExcelUpload.open();
							informationDialog.close();
						}
					}),
					endButton: new sap.m.Button({
						text: Core.i18n.getText("MsgNo"),
						type: 'Reject',
						press: function() {
							informationDialog.close();
						}
					}),
					afterClose: function() {
						informationDialog.destroy();
					}
				});
				informationDialog.open();
			}else{
				Core.F4_ExcelUpload.open();
			}
		},
		ExcelUploadClose: function() {
			Core.F4_ExcelUpload.close();
		},
		// Upload Excel
		ExcelUpload: function(e) {
			var that = this;
			var id = e.getSource().getId();
			var excelData = {};
			var fileContent = e.getParameter("files") && e.getParameter("files")[0];
			if(fileContent && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {
						type: 'binary'
					});
					workbook.SheetNames.forEach(function(sheetName) {
						// Here is your object for every sheet in workbook
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
					});
					var excel_arr = [];
					var length = excelData.length;
					for(var i = 0; i < length; i++) {
						var obj = {};
						var ExcelData = excelData[i];
						obj.Pspid = ExcelData['Project No'];
						obj.Anln1 = ExcelData['PIP Asset No'];
						obj.Anln2 = ExcelData['PIP Sub Asset No'];
						obj.Posid = ExcelData['WBS No'];
						obj.Prjcost = ExcelData['Project Cost'];
						obj.Rprjcost = ExcelData['Approved Revised Project Cost'];
						obj.Wert1 = ExcelData['Approved Budget for FY'];
						obj.Answt = ExcelData['PIP Balance'];
						obj.Yepcost = ExcelData['YEP'];
						obj.Repdate = ExcelData['Reporting Date'];
						obj.Compd = ExcelData['Completion Date'];
						obj.Rcompd = ExcelData['Revised Completion Date'];
						obj.Prozs = ExcelData['% Cost Allocation'];
						obj.Pstatus = ExcelData['Status'];
						obj.Dageing = ExcelData['Ageing'];
						obj.Werks = ExcelData['Plant Code'];
						obj.Action = "I";
						obj.Bukrs = "";
						obj.Pspid != undefined ? obj.Pspid = unescape(obj.Pspid) : obj.Pspid = "";
						obj.Anln1 != undefined ? obj.Anln1 = unescape(obj.Anln1) : obj.Anln1 = "";
						obj.Anln2 != undefined ? obj.Anln2 = unescape(obj.Anln2) : obj.Anln2 = "";
						obj.Posid != undefined ? obj.Posid = unescape(obj.Posid) : obj.Posid = "";
						obj.Prjcost != undefined ? obj.Prjcost = unescape(obj.Prjcost) : obj.Prjcost = "";
						obj.Rprjcost != undefined ? obj.Rprjcost = unescape(obj.Rprjcost) : obj.Rprjcost = "";
						obj.Wert1 != undefined ? obj.Wert1 = unescape(obj.Wert1) : obj.Wert1 = "";
						obj.Answt != undefined ? obj.Answt = unescape(obj.Answt) : obj.Answt = "";
						obj.Yepcost != undefined ? obj.Yepcost = unescape(obj.Yepcost) : obj.Yepcost = "";
						obj.Repdate != undefined ? obj.Repdate = unescape(obj.Repdate) : obj.Repdate = "";
						obj.Compd != undefined ? obj.Compd = unescape(obj.Compd) : obj.Compd = "";
						obj.Rcompd != undefined ? obj.Rcompd = unescape(obj.Rcompd) : obj.Rcompd = "";
						obj.Prozs != undefined ? obj.Prozs = unescape(obj.Prozs) : obj.Prozs = "";
						obj.Pstatus != undefined ? obj.Pstatus = unescape(obj.Pstatus) : obj.Pstatus = "";
						obj.Dageing != undefined ? obj.Dageing = unescape(obj.Dageing) : obj.Dageing = "";
						obj.Werks != undefined ? obj.Werks = unescape(obj.Werks) : obj.Werks = "";
						excel_arr.push(obj);
					}
					/*var is_Model_exist = Core.that.getView().byId("Project_Update_Request_Table").getModel();
					if(is_Model_exist != undefined) {
						var Data = Core.that.getView().byId("Project_Update_Request_Table").getModel().getData();
						var Arr = Data.concat(excel_arr);
						var model = new JSONModel(Arr);
						Core.that.getView().byId("Project_Update_Request_Table").setModel(model);
					} else {
						var model = new JSONModel(excel_arr);
						Core.that.getView().byId("Project_Update_Request_Table").setModel(model);
					}*/
					var model = new JSONModel(excel_arr);
					Core.that.getView().byId("Project_Update_Request_Table").setModel(model);
					Core.byId(id).setValue("");
					Core.F4_ExcelUpload.close();
				};
				reader.onerror = function(ex) {	
					Core.byId("ExcelUploadId").setValue("");
					Core.F4_ExcelUpload.close();
					sap.m.MessageBox.error(ex);
				};
				reader.readAsBinaryString(fileContent);
			}
			
		},
		createColumnConfig: function() {
			var aCols = [];
			aCols.push({
				label: 'Project No',
				property: 'Pspid',
				type: EdmType.String,
				width: 8
			});
			aCols.push({
				label: 'WBS No',
				property: 'Posid',
				type: EdmType.String,
				width: 8
			});
			aCols.push({
				label: 'PIP Asset No',
				property: 'Anln1',
				type: EdmType.String,
				width: 7
			});
			aCols.push({
				label: 'PIP Sub Asset No',
				property: 'Anln2',
				type: EdmType.String,
				width: 10
			});
			aCols.push({
				label: 'Plant Code',
				property: 'Werks',
				type: EdmType.String,
				width: 7
			});
			aCols.push({
				label: 'Project Cost',
				property: 'Prjcost',
				type: EdmType.String,
				width: 8
			});
			
			aCols.push({
				label: 'Approved Revised Project Cost',
				property: 'Rprjcost',
				type: EdmType.String,
				width: 15
			});
			aCols.push({
				label: 'Approved Budget for FY',
				property: 'Wert1',
				type: EdmType.String,
				width: 14
			});
			aCols.push({
				label: 'PIP Balance',
				property: 'Answt',
				type: EdmType.String,
				width: 7
			});
			aCols.push({
				label: 'YEP',
				property: 'Yepcost',
				type: EdmType.String,
				width: 10
			});
			aCols.push({
				label: 'Reporting Date',
				property: 'Repdate',
				type: EdmType.String,
				width: 10
			});
			aCols.push({
				label: 'Completion Date',
				property: 'Compd',
				type: EdmType.String,
				width: 10
			});
			aCols.push({
				label: 'Revised Completion Date',
				property: 'Rcompd',
				type: EdmType.String,
				width: 14
			});
			aCols.push({
				label: '% Cost Allocation',
				property: 'Prozs',
				type: EdmType.String,
				width: 9
			});
			aCols.push({
				label: 'Status',
				property: 'Pstatus',
				type: EdmType.String,
				width: 7
			});
			aCols.push({
				label: 'Ageing',
				property: 'Dageing',
				type: EdmType.String,
				width: 8
			});
			return aCols;
		},
		onExport1: function() {
			var oTable = Core.that.getView().byId("Project_Update_Request_Table").getBinding("rows");
			/*if(oTable == undefined) {
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("PIP Request");
				MessageBox.warning(Core.i18n.getText("NodatatoDownload"));
				return false;
			} else if(oTable.iLength == 0) {
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("PIP Request");
				MessageBox.warning(Core.i18n.getText("NodatatoDownload"));
				return false;
			}*/
			var that = this;
			var dialog = new Dialog("buttonid", {
				type: "Message",
				title: "File name",
				content: new sap.m.Input("input_id", {
					value: "",
					width: "100%"
				}),
				beginButton: new sap.m.Button({
					text: 'Ok',
					press: function() {
						var filename = sap.ui.getCore().byId("input_id").getValue();
						if(filename == "") {
							MessageBox.warning(Core.i18n.getText("EnterFilename"));
							return false;
						} else {
							that.onExport1();
							dialog.close();
						}
					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		onExport: function() {
			var aCols, mDataSource, mSettings, oSpreadsheet, oTable;
			oTable = Core.that.getView().byId("Project_Update_Request_Table");
			mDataSource = oTable.getBinding("rows");
			if(mDataSource == undefined) {
				this.getView().byId("Proj_comp_table").setModel(this.Empty_Model);
				mDataSource = oTable.getBinding("rows");
			}
			aCols = this.createColumnConfig();
			var mSettings = {
				workbook: {
					columns: aCols,
				},
				dataSource: mDataSource,
				fileName: "ZEMT_AM_PUR_Data.xlxs", //`${sap.ui.getCore().byId("input_id").getValue()}.xlsx`,
				worker: false
			};
			oSpreadsheet = new sap.ui.export.Spreadsheet(mSettings);
			oSpreadsheet.build().then(function() {
				sap.m.MessageToast.show("Export is finished");
			}).finally(function() {
				oSpreadsheet.destroy();
			}).catch(function(sMessage) {
				sap.m.MessageToast.show("Export error: " + sMessage)
			})
		},
		Numeric_livechange: function(oEvent) {
			var id = oEvent.oSource.sId.split("--")[1];
			var inputvalue = Core.byId(id).getValue();
			var value = inputvalue.replace(/[^0-9\.]/g, '');
			if(id == "Validto_yearid" || id == "Validfrom_yearid") {
				this.getView().byId(id).setDOMValue(value.substring(0, 4));
			} else {
				this.getView().byId(id).setDOMValue(value.substring(0, 3));
			}
		},
		suggest: function(oEvent) {},
		OpenCostCenter_F4: function(oEvent) {},
		Close_Update_Request_Search: function() {
			Core.Update_Request_Search.close();
		},
		Search_Records: function() {
			Core.Update_Request_Search.open();
		},
		IconTabBarSelect: function(oEvent) {
			var key = oEvent.mParameters.key;
			if(key == 'Approver') {
				var Model = this.getView().byId("approvertable_id").getModel();
				if(Model != undefined) {
					if(Model.getData().length == 0) {
						this.UserMaster(key);
					}
				}else{
					this.UserMaster(key);
				}
			}
		},
		UserMaster: function(key) {
			var Fyear, Atrnid, Bukrs, Anlkl, Kostl, Werks, Mass_Data,timeout;
			timeout = 0;
			if(Core.is_Cross_App == "Y") {
				var Data = JSON.parse(decodeURI(window.location.href.split("?")[1]));
				Fyear = Data.Fyear;
				Atrnid = Data.Atrnid;
				Werks = "";
				Bukrs = this.getView().byId("CompanyCode").getSelectedKey();
				Kostl = "";
				Anlkl = "";
			} else {
				Fyear = null;
				Atrnid = '';
			}
			if(key == 'Approver') {
				timeout = 100;
				Core.DataLoadProgress.open();
				Werks = "";
				Bukrs = this.getView().byId("CompanyCode").getSelectedKey();
				Kostl = "";
				Anlkl = "";
			}
			var UserMaster = Core.that.oDataModel();
			UserMaster.setHeaders({
				"Muser": Core.O_Login_user.Muser,
				"Uname": Core.O_Login_user.Muser,
				"Bukrs": Bukrs,
				"Anlkl": Anlkl,
				"Kostl": Kostl,
				"Werks": Werks,
				"Atrnid": Atrnid,
				"Fyear": Fyear,
				"Doctype": "ASSET",
				"Action": "J",
			});
			setTimeout(function() {
				UserMaster.read("GetUserMasterSet?$expand=EtUserBukrs,EtUserWorkflow&$format=json", null, "", true, function(oData, oResponse) {
					key == 'Approver' && (Core.DataLoadProgress.close());
					var view = Core.that.getView();
					Core.A_UserMasterData = oData.results[0];
					var CompanyCode = Core.A_UserMasterData.EtUserBukrs.results;
					var CompanyCode_Model = new JSONModel(CompanyCode);
					CompanyCode_Model.iSizeLimit = 10000;
					var EtUserWorkflow = Core.A_UserMasterData.EtUserWorkflow.results;
					var EtUserWorkflow_Model = new JSONModel(EtUserWorkflow);
					EtUserWorkflow_Model.iSizeLimit = 10000;
					if(key == 'Approver'){
						view.byId("approvertable_id").setModel(EtUserWorkflow_Model);
					}
					if(key != 'Approver' && Core.A_AssetData != undefined) {
						view.byId("CompanyCode").setModel(CompanyCode_Model);
						Core.byId("VhCompanyCodeId").setModel(CompanyCode_Model);
						view.byId("CompanyCode").setSelectedKey(Core.A_AssetData[0].Bukrs);
					} else if(key != 'Approver') {
						view.byId("CompanyCode").setModel(CompanyCode_Model);
						Core.byId("VhCompanyCodeId").setModel(CompanyCode_Model);
						if(CompanyCode.length == 1) {
							view.byId("CompanyCode").setSelectedKey(CompanyCode[0].Bukrs);
						}
					}
				}, function(err) {
					key == 'Approver' && (Core.DataLoadProgress.close());
				});
			}, timeout);
		},
		ApprTable_LiveChange: function(oEvent) {
			var id = oEvent.getSource().sId;
			var value = oEvent.mParameters.newValue;
			Core.byId(id).setValue(value);
		}
	});
});