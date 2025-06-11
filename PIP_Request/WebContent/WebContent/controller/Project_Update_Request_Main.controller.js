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
			Core.ApproveProgress = new sap.m.BusyDialog({
				text: Core.i18n.getText('WorkFlowApproveinProgress')
			});
			Core.RejectProgress = new sap.m.BusyDialog({
				text: Core.i18n.getText('WorkFlowRejectinProgress')
			});
			Core.ReCallProgress = new sap.m.BusyDialog({
				text: Core.i18n.getText('WorkFlowRecallProgress')
			});
			this.Empty_Model = new JSONModel([]);
			function set_dbl_Click (table_id){
				var oTable = Core.byId(table_id);
				oTable.attachBrowserEvent("dblclick", Core.that.on_Table_DblClick);
				$(document).on("mouseover", "#" + oTable.getId() + " tbody tr", function() {
				    this.setAttribute("title", Core.i18n.getText("Doubleclicktoselect"));
				});
			}
			// Initializing all the Fragments
			// load asynchronous XML fragment
			var oView = Core.that.getView();
			var Fragments_Path = "ZEMT_AM_PUR_APP.Fragments";
			if(Core.F4_EnterRemarks == undefined) {
				Fragment.load({
					name: `${Fragments_Path}.Remarks`,
					controller: this
				}).then(function(oDialog) {
					// connect dialog to the root view 
					//of this component (models, lifecycle)
					oView.addDependent(oDialog);
					Core.F4_EnterRemarks = oDialog;
				});
				Fragment.load({
					name: `${Fragments_Path}.Update_Request_Search`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.Update_Request_Search = oDialog;
				});
				Fragment.load({
					name: `${Fragments_Path}.ExcelUpload`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_ExcelUpload = oDialog;
				});
				Fragment.load({
					name: `${Fragments_Path}.PersonnelVendorSearch`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_PersonnelVendorSearch = oDialog;
				});
				Fragment.load({
					name: `${Fragments_Path}.WbsNoSearch`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_WbsNoSearch = oDialog;
				//	set_dbl_Click("WbsTableId");
				});
				Fragment.load({
					name: `${Fragments_Path}.AssetSearch`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_AssetSearch = oDialog;
					set_dbl_Click("AssetTableId");
				});
				Fragment.load({
					name: `${Fragments_Path}.AttachmentUpload`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_AttachmentUpload = oDialog;
				});
				Fragment.load({
					name: `${Fragments_Path}.AttachmentView`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_AttachmentView = oDialog;
				});
				Fragment.load({
					name: `${Fragments_Path}.MessageView`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_MessageView = oDialog;
				});
				Fragment.load({
					name: `${Fragments_Path}.Update_Request`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_Update_Request = oDialog;
				});
				Fragment.load({
					name: `${Fragments_Path}.Search_User`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_Search_User = oDialog;
					set_dbl_Click("Users_table_id");
				});
				Fragment.load({
					name: `${Fragments_Path}.CostCenter`,
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					Core.F4_CostCenter = oDialog;
					Core.F4_CostCenter._oDialog.mAggregations.beginButton.oParent.addButton(new sap.m.Button({
						text: 'Cancel',
						press: Core.that.onCostCenter_DialogClose
					}));
					Core.F4_CostCenter._oDialog.mAggregations.beginButton.oParent.addButton(new sap.m.Button({
						text: 'Clear',
						press: Core.that.onCostCenter_DialogClose
					}));
				});
			}
			this.Apply_Filter_Functionto_dropdowns();
			this.getView().byId("Year").setValue(Core.DateFormat_year_Month.format(new Date()));
			this.getView().byId("CreatedOnId").setValue(Core.DateFormat_yyyy_mm_dd.format(new Date()));
			this.getRouter().getRoute("Project_Update_Request_Main").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function(oEvent) {
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				Core.that.showPage();
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			setTimeout(function() {
				Core.oDataModel = Core.that.oDataModel();
				Core.oDataModel.setHeaders({
					"muser": Core.O_Login_user.Muser,
				});
				Core.oDataModel.read("GetMasterDataSet?$expand=EtDchkl,EtCompanyCode,EtPrctr,EtPlants,EtPrioroty,EtTagTypes,EtInspStatus,EtAssetClass,EtCostCenter," + "EtMobAppTiles,EtMobAppListView,EtViewAppScreen,EtAppScreenFields,EtUserData,EtInsuranceTyp,EtEquiCategory,EtObjectType,EtABCIndicator,EtLocation,EtUnits,EtPrctr,EtT005t,EtT087t,EtTa1tvt,EtDchklist,EtT090nat,EtT093t,EtAnkb", null, "", true, function(oData, response) {
					Core.A_MasterDataForF4Helps = oData.results[0];
					var EtCompanyCode = oData.results[0].EtCompanyCode.results;
					var EtPlants = oData.results[0].EtPlants.results;
					var EtAssetClass = oData.results[0].EtAssetClass.results;
					var EtCostCenter = oData.results[0].EtCostCenter.results;
					EtCostCenter.map(function(x) {
						x.Customfield = `${x.Kostl} - ${x.Ktext}`
					});
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
					Core.that.getView().setModel(Plants_Model, "PlantsModel");
					Core.byId("VhCostCenterId").setModel(CostCenter_Model);
					Core.byId("select_CostCenter_list").setModel(CostCenter_Model);
					Core.byId("VhAssetClassId").setModel(AssetClass_Model);
					Core.byId("VhLocationId").setModel(Location_Model);
					Core.that.getView().byId("Project_Update_Request_Table").setModel(Core.that.sModel([]));
					Core.that.getView().byId("approvertable_id").setModel(Core.that.sModel([]));
					var months = [
					    "January", "February", "March", "April", "May", "June", "July",
					    "August", "September", "October", "November", "December"
					];
					var default_title = "PIP Request for " + months[new Date().getMonth()] + "/" + new Date().getFullYear();
					Core.that.getView().byId("AssetTitleId").setValue(default_title);
					
					var Status_data = [
						{ Pstatus: "" },
					    { Pstatus: "New" },
					    { Pstatus: "Completed" },
					    { Pstatus: "InProgress" },
					    { Pstatus: "Hold" },
					    { Pstatus: "Cancel" }
					];
					var StatusModel = Core.that.sModel(Status_data);
					Core.that.getView().setModel(StatusModel, "StatusModel");
					var Url_params =  Core.that.get_Url_params(); window.location.href.split("?")[1];
					// If Navigated from Asset Request Dashboard
					if(Url_params != undefined && Url_params.Atrnid) {
						Core.is_Cross_App = "Y";
						var Data =  Core.that.get_Url_params();//JSON.parse(decodeURI(window.location.href.split("?")[1]));
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
						var EntityValue = "GetAssetReqSet?$expand=EtAssetReqAlv,EtLongtext,EtAtrnb,EtWflogr,EtAtrni,EtAtrnw";
						if(EntityInputs.length > 0) {
							EntityInputs = EntityInputs.toString();
							EntityInputs = EntityInputs.split(',').join(' and ');
							EntityInputs = encodeURIComponent(EntityInputs);
							var EntityValue = "GetAssetReqSet?$filter=" + EntityInputs + "&$expand=EtAssetReqAlv,EtLongtext,EtAtrnb,EtWflogr,EtAtrni,EtAtrnw";
						}
						Core.oDataModel = Core.that.oDataModel();
						Core.oDataModel.setHeaders({
							"muser": Core.O_Login_user.Muser,
						});
						Core.oDataModel.read(EntityValue, null, "", true, function(oData, response) {
							if(oData.results.length == 0) {
								Core.DataLoadProgress.close();
							} else {
								Core.AssetRequests_Data = oData.results;
								Core.A_AssetData = oData.results[0].EtAssetReqAlv.results;
								var AssetData = Core.A_AssetData;
								AssetData = AssetData.filter(function(x) {
									return x.Atrnid == Data.Atrnid;
								});
								if(AssetData.length != 0) {
									var view = Core.that.getView();
									// Get the status of the asset
									var Rstatus = AssetData[0].Rstatus;
									// Check if the form is editable
									var editableForm = AssetData[0].Editm === "X";
									// Check if the status is "NEW" or "REJT"
									var isNewOrRejected = Rstatus === "NEW" || Rstatus === "REJT";
									// Check if the status is "WAPPR" or "APPR"
									var isApprovalPending = Rstatus === "WAPPR" || Rstatus === "APPR";
									// Check if the status is "COMP"
									var isCompleted = Rstatus === "COMP";
									// Check if status is "WAPPR" for displaying ReCall button
									var ReCall_visible = AssetData[0].Mstatus === 'RECALL';
									// Check if Save button should be visible based on status and form editability
									var isSave_visible = Rstatus !== "COMP" && (["WAPPR", "APPR", "ERROR", "NEW"].includes(Rstatus) && editableForm);
									// Check if Save button should be visible based on rejection condition and user being the requestor
									var isRejected_isRequestor = Rstatus === "REJT" && AssetData[0].Ernam === Core.O_Login_user.Muser;
									// Set visibility of Submit button based on status
									view.byId("Submit_btn").setVisible(isNewOrRejected);
									// Set visibility of Save button based on visibility and Rejected for logged in user is being Requestor
									view.byId("Save_btn").setVisible(isSave_visible || isRejected_isRequestor);
									// Set visibility of ReCall button based on status
									//view.byId("ReCall_btn").setVisible(ReCall_visible);
									// Set visibility of Approve button based on user role
									view.byId("Approve_btn").setVisible(Core.that.Approve_Press("visibility"));
									// Set visibility of Reject button based on user role
									view.byId("Reject_btn").setVisible(Core.that.Reject_Press("visibility"));
									// Set icon color based on status
									view.byId("StatusIcon").removeStyleClass("Fill_orange");
									view.byId("StatusIcon").addStyleClass(Rstatus === "NEW" ? "Fill_orange" : isApprovalPending ? "Fill_yellow" : (isCompleted ? "Fill_green" : "Fill_red"));
									
									view.byId("RequestId").setValue(AssetData[0].Atrnid);
									var year = Core.DateFormat_yyyymmdd.parse(AssetData[0].Erdat);
									view.byId("Year").setValue(Core.DateFormat_year_Month.format(year));
									view.byId("AssetTitleId").setValue(AssetData[0].Txt50);
									view.byId("RequestTypeId").setSelectedKey(AssetData[0].Action);
									view.byId("Status").setValue(Rstatus);
									view.byId("CompanyCode").setSelectedKey(AssetData[0].Bukrs);
									view.byId("CreatedById").setValue(`${AssetData[0].Empid} ${AssetData[0].Empname}`);
									view.byId("CreatedOnId").setValue(AssetData[0].Erdat);
									view.byId("ChangedOnId").setValue(AssetData[0].Aedat);
									view.byId("ChangedById").setValue(AssetData[0].Aenam);
									Core.Created_By = AssetData[0].Ernam;
									var Longtext_arr = JSON.parse(JSON.stringify(oData.results[0].EtLongtext.results));
									var Longtext_arr = Longtext_arr.filter(function(x) {
										return x.Tdid === "Z001";
									});
									if(Longtext_arr.length > 0) {
										var description = '';
										for(var i = 0; i < Longtext_arr.length; i++) {
											description += Longtext_arr[i].Tdline + "\n"
										}
										view.byId("Description").setValue(description);
									}
									var Etwflogr_arr = JSON.parse(JSON.stringify(oData.results[0].EtWflogr.results));
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
									var et_longtext = Core.AssetRequests_Data[0].EtLongtext.results;
									function get_Long_Text(Tdid, Itemno) {
										var description = '';
									    for (var i = 0; i < et_longtext.length; i++) {
									        if (et_longtext[i].Tdid === Tdid && et_longtext[i].Tdname === Itemno) {
									            description += et_longtext[i].Tdline + "\n";
									        }
									    }
									    return description;
									}
									var Proj_update_data = oData.results[0].EtAtrni.results;
									for (var i = 0; i < Proj_update_data.length; i++) {
										Proj_update_data[i].Compd = Core.formatter.formatddmmyyy(Proj_update_data[i].Compd);
										Proj_update_data[i].Rcompd = Core.formatter.formatddmmyyy(Proj_update_data[i].Rcompd);
										Proj_update_data[i].Repdate = Core.formatter.formatddmmyyy(Proj_update_data[i].Repdate);
										Proj_update_data[i].Pipsdateadj = Core.formatter.formatddmmyyy(Proj_update_data[i].Pipsdateadj);
										Proj_update_data[i].Pipsdatestt = Core.formatter.formatddmmyyy(Proj_update_data[i].Pipsdatestt);
										Proj_update_data[i].Pipremarks = get_Long_Text('Z003', Proj_update_data[i].Fenum);
										Proj_update_data[i].Pipctprog = get_Long_Text('Z002', Proj_update_data[i].Fenum);
										Proj_update_data[i].Prjcost = Core.formatter.formatAmount(Proj_update_data[i].Prjcost);
										//Proj_update_data[i].Rprjcost = Core.formatter.formatAmount(Proj_update_data[i].Rprjcost);
										Proj_update_data[i].Wert1 = Core.formatter.formatAmount(Proj_update_data[i].Wert1);
										Proj_update_data[i].Answt = Core.formatter.formatAmount(Proj_update_data[i].Answt);
										Proj_update_data[i].Yepcost = Core.formatter.formatAmount(Proj_update_data[i].Yepcost);
										Proj_update_data[i].Pwf05 = Core.formatter.formatAmount(Proj_update_data[i].Pwf05);
										Proj_update_data[i].Pwf06 = Core.formatter.formatAmount(Proj_update_data[i].Pwf06);
										
									}
									var Proj_Update_record = new JSONModel(Proj_update_data);
									Proj_Update_record.iSizeLimit = 10000;
									view.byId("Project_Update_Request_Table").setModel(Proj_Update_record);
									view.byId("ProjectUpdate_tab").setCount(Proj_update_data.length);
								}
								Core.that.UserMaster();
							}
							Core.that.showPage();
						}, function(oError) {});
					} else {
						Core.is_Cross_App = "N";
						Core.that.UserMaster();
						Core.that.showPage();
					}
				}, function(err) {
					Core.that.showPage();
					Core.that.HandleError_read(err);
				});
			}, 100)
		},
		onAfterRendering: function() {
			if(Core.O_Login_user != "") {
				this.getView().byId("CreatedById").setValue(Core.O_Login_user.Muser + " " + Core.O_Login_user.FullName);
				Core.that.getView().byId("logged_user").setText(Core.O_Login_user.Muser + " " + Core.O_Login_user.FullName);
				this.getView().byId("StaffNoId").setValue(Core.O_Login_user.Muser);
			}
		},
		VhCompanyCodeChange: function(oEvent) {
			Core.byId("VhAssetClassId").setSelectedKey("");
			Core.byId("VhCostCenterId").setSelectedKey("");
			if(oEvent.getSource().getSelectedItem() != null) {
				Core.byId("VhPlantCodeId").setEditable(true);
				Core.byId("VhCostCenterId").setEditable(true);
				Core.byId("VhAssetClassId").setEditable(true);
				Core.byId("VhLocationId").setEditable(true);
				var SelectedIndex = oEvent.getSource().getSelectedItem().sId.split("VhCompanyCodeId-")[1];
				var SelectedData = Core.byId("VhCompanyCodeId").getModel().getData()[SelectedIndex];
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, SelectedData.Bukrs));
				var filter = new sap.ui.model.Filter(aFilters, false);
				Core.byId("VhAssetClassId").getBinding("items").filter(filter, "Application");
				Core.byId("VhCostCenterId").getBinding("suggestionItems").filter(filter, "Application");
				Core.byId("select_CostCenter_list").getBinding("items").filter(filter, "Application");
			} else {
				Core.byId("VhAssetClassId").getBinding("items").filter([], "Application");
				Core.byId("VhCostCenterId").getBinding("suggestionItems").filter([], "Application");
				Core.byId("select_CostCenter_list").getBinding("items").filter([], "Application");
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
			if(oEvent.getSource().getSelectedItem() != null) {
				var SelectedData = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
				Core.byId("VhPlantCodeId").setSelectedKey(SelectedData.Werks);
			} else {
				Core.byId("VhPlantCodeId").setSelectedKey();
				Core.byId("VhLocationId").setSelectedKey();
			}
		},
		// Exit App
		ExitAction: function() {
			var RequestId = this.getView().byId("RequestId").getValue();
			var is_Submit_visible = this.getView().byId("Submit_btn").getVisible();
			var is_Save_visible = this.getView().byId("Save_btn").getVisible();
			var Exit_msg = "";
			/*if(RequestId.indexOf("$") == 0) {
				Exit_msg = Core.i18n.getText("ConfirmwithoutsaveExit");
			}else if(RequestId.indexOf("$") == -1 && is_Submit_visible == true) {
				Exit_msg = Core.i18n.getText("ConfirmwithoutsubmitExit");
			}else{
				Exit_msg = Core.i18n.getText("ConfirmExit");
			}*/
			Exit_msg = Core.i18n.getText("ConfirmExit");
			var informationDialog = new Dialog({
				title: Core.i18n.getText("MsgWarning"),
				type: 'Message',
				state: 'Warning',
				content: new sap.m.Text({
					text: Exit_msg
				}),
				beginButton: new sap.m.Button({
					text: Core.i18n.getText("MsgYes"),
					type: 'Accept',
					press: function() {
						informationDialog.close();
						setTimeout(function() {
							window.close();
						}, 500);
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
		on_Save: function(oControl_at) {
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
			var Year = this.getView().byId("CreatedOnId").getDateValue();
			Year = Year.getFullYear().toString();
			var Description = view.byId("Description").getValue();
			var Status = view.byId("Status").getValue('NEW');
			var StaffNo = view.byId("StaffNoId").getValue();
			var CompanyCode = view.byId("CompanyCode").getSelectedKey();
			var DocTabelModel = Core.byId("AttachmentTabel").getModel();
			var DocTabelData = [];
			if(AssetTitle == "") {
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
				MessageBox.information(Core.i18n.getText("AssetTitleMandatoryTxt"));
				return false;
			}
			if(CompanyCode === "") {
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
				MessageBox.information(Core.i18n.getText("EnterCompanyCode"));
				return false;
			}
			if(DocTabelModel != undefined) {
				DocTabelData = DocTabelModel.getData();
			}
			var Update_request_data = [];
			var _Validate_Flag = this.Define_validations();
			var Project_Update_Request_Model = this.getView().byId("Project_Update_Request_Table").getModel();
			if(Project_Update_Request_Model != undefined) {
				Project_Update_Request_Model.refresh(true);
				var Update_request_data = [...Project_Update_Request_Model.getData()];
			}
			if(_Validate_Flag == true) {
				if(Project_Update_Request_Model == undefined) {
					Core.that.getView().byId("Update_Tabbar").setSelectedKey("PIP Request");
					MessageBox.warning(Core.i18n.getText("AddatleaseoneRecord"));
					return false;
				} else if(Update_request_data.length == 0) {
					Core.that.getView().byId("Update_Tabbar").setSelectedKey("PIP Request");
					MessageBox.warning(Core.i18n.getText("AddatleaseoneRecord"));
					return false;
				}
			}
			var length = Update_request_data.length;
			var Data = Update_request_data.concat(Core.Deleted_Records);
			var Messages = [];
			var Message_obj = {};
			Data.map(function(x, i, a) {
				Message_obj = {};
				var _row = i + 1
				Message_obj.text = '';
				(x.Pspid == '' || x.Pspid == undefined) && (Message_obj.text = Message_obj.text.concat(' Project No,'));
			//	(x.Wert1 == '' || x.Wert1 == undefined) && (Message_obj.text = Message_obj.text.concat(' Approved Budget,'));
			//	(x.Yepcost == '' || x.Yepcost == undefined) && (Message_obj.text = Message_obj.text.concat(' YEP,'));
				(x.Compd == '' || x.Compd == null) && (Message_obj.text = Message_obj.text.concat(' Completion Date,'));
				(x.Pipsdatestt == '' || x.Pipsdatestt == null) && (Message_obj.text = Message_obj.text.concat(' Starting Date(First Settlement),'));
			//	(x.Repdate == '' || x.Repdate == null) && (Message_obj.text = Message_obj.text.concat(' Reporting Date,'));
			//	(x.Rcompd == '' || x.Rcompd == null) && (Message_obj.text = Message_obj.text.concat(' Revised Completion Date,'));
				(x.Prozs == '' || x.Prozs == undefined) && (Message_obj.text = Message_obj.text.concat(' % of Completion,'));
				(x.Prozs > 100 ) && (Message_obj.text = Message_obj.text.concat(' % Cannot be greater than 100,'));
			//	(x.Pstatus == '' || x.Pstatus == undefined) && (Message_obj.text = Message_obj.text.concat(' Status,'));
				if(Message_obj.text != '') {
					Message_obj.text.endsWith(',') && (Message_obj.text = Message_obj.text.substring(0, Message_obj.text.length - 1));
					if(Message_obj.text == ' % Cannot be greater than 100,'){
						Message_obj.text = 'Row ' + _row  + Message_obj.text;
					}else{
						Message_obj.text = 'Row ' + _row + ' Required' + Message_obj.text;
					}
					Messages.push(Message_obj);
				}
			});
			if(Messages.length > 0 && _Validate_Flag == true) {
				Core.byId("Msg_icon").removeStyleClass("ResponseIconColorSuccess");
				Core.byId("Msg_icon").addStyleClass("ResponseIconColorError");
				Core.byId("Msg_icon").setSrc("sap-icon://error");
				Core.byId("MessageViewTitleId").setText(Core.i18n.getText("Error"));
				Core.byId("MessaheViewListId").setModel(Core.that.sModel(Messages));
				Core.F4_MessageView.open();
				return false;
			}
			/*var Required_fields = Data.find(x => {
				return x.Repdate == null || x.Compd == null || x.Rcompd == null || x.Wert1 == "" || x.Prozs == "" || x.Yepcost == "" || x.Pstatus == ""
			});
			if(Required_fields) {
				Core.that.getView().byId("Update_Tabbar").setSelectedKey("PIP Request");
				MessageBox.warning(Core.i18n.getText("EnterMandatoryFields"));
				return false;
			}*/
			var currentprogress_remarks_text = [];
			var Data = JSON.parse(JSON.stringify(Data));
			var Update_Request_Data = [];
			for(var i = 0; i < length; i++) {
				//Data[i].Dageing = Data[i].Compd != "" && Data[i].Repdate != "" ? this.Calculate_Ageing(Data[i].Compd, Data[i].Repdate) : "";
				if (Data[i].Repdate && Data[i].Pipsdateadj) {
					Data[i].Dageing = this.Calculate_Ageing(Data[i].Pipsdateadj, Data[i].Repdate) || "";
				} else if (Data[i].Repdate && Data[i].Pipsdatestt) {
					Data[i].Dageing = this.Calculate_Ageing(Data[i].Pipsdatestt, Data[i].Repdate) || "";
				} else {
					Data[i].Dageing = "";
				}
				Data[i].Dageing = Data[i].Dageing.replace('-', '');
				Data[i].Repdate == '' && (Data[i].Repdate = null);
				Data[i].Compd == '' && (Data[i].Compd = null);
				Data[i].Rcompd == '' && (Data[i].Rcompd = null);
				if(Data[i].Repdate != null && Data[i].Repdate.length != 8) {
					Data[i].Repdate = this.Format_Date(Data[i].Repdate);
				}
				if(Data[i].Compd != null && Data[i].Compd.length != 8) {
					Data[i].Compd = this.Format_Date(Data[i].Compd);
				}
				if(Data[i].Rcompd != null && Data[i].Rcompd.length != 8) {
					Data[i].Rcompd = this.Format_Date(Data[i].Rcompd);
				}
				if(Data[i].Pipsdatestt != null && Data[i].Pipsdatestt.length != 8) {
					Data[i].Pipsdatestt = this.Format_Date(Data[i].Pipsdatestt);
				}
				if(Data[i].Pipsdateadj != null && Data[i].Pipsdateadj.length != 8) {
					Data[i].Pipsdateadj = this.Format_Date(Data[i].Pipsdateadj);
				}
				var Fenum = String(i + 1).padStart(5, '0');
				var Pipremarks_arr = Core.that.Long_Text_Format(RequestId, Year, Data[i].Pipremarks,  'Z003', Fenum );
				var Pipctprog_arr = Core.that.Long_Text_Format(RequestId, Year, Data[i].Pipctprog, 'Z002', Fenum);
				currentprogress_remarks_text = currentprogress_remarks_text.concat(Pipremarks_arr,Pipctprog_arr);
				var total_project_cost = Core.that.calculateTotalProjectCost(Data[i].Pwf05, Data[i].Pwf06);
				if(total_project_cost == ""){
					total_project_cost = "0";
				}
				var obj = {
					"Pspid": Data[i].Pspid,
					"Posid": Data[i].Posid,
					"Bukrs": CompanyCode, //Data[i].Bukrs,
					"Anln1": Data[i].Anln1,
					"Anln2": Data[i].Anln2,
					"Prjcost": Data[i].Prjcost.replaceAll(",", ""),
					//"Rprjcost": Data[i].Rprjcost.replaceAll(",", ""),
					"Wert1": Data[i].Wert1 == '' ? Data[i].Wert1 = "0" : Data[i].Wert1 = Data[i].Wert1.replaceAll(",", ""),
					"Answt": total_project_cost.replaceAll(",", ""),
					"Yepcost": Data[i].Yepcost.replaceAll(",", ""),
					"Repdate": Data[i].Repdate, // == '' ? Data[i].Repdate = null : Data[i].Repdate = this.Format_Date(Data[i].Repdate),
					"Compd": Data[i].Compd, //== '' ? Data[i].Compd = null : Data[i].Compd = this.Format_Date(Data[i].Compd),
					"Rcompd": Data[i].Rcompd, //== '' ? Data[i].Rcompd = null : Data[i].Rcompd = this.Format_Date(Data[i].Rcompd),
					"Pipsdatestt": Data[i].Pipsdatestt,
					"Pipsdateadj": Data[i].Pipsdateadj,
					"Prozs": Data[i].Prozs == '' ? Data[i].Prozs = "0" : Data[i].Prozs = Data[i].Prozs,
					"Pstatus": Data[i].Pstatus,
					"Dageing": Data[i].Dageing.toString(),
					"Waers": Data[i].Waers,
					"Werks": Data[i].Werks,
					"Pwf06": Data[i].Pwf06.replaceAll(",", ""),
					"Pwf05": Data[i].Pwf05.replaceAll(",", ""),
					"Fenum": Fenum,
					//"Pipremarks": Data[i].Pipremarks,
					//"Pipctprog" : Data[i].Pipctprog
					//	"Action": Data[i].Action,
				}
				Update_Request_Data.push(obj);
			}
			Update_Request_Data = Update_Request_Data.map(function(x) {
			    ["Answt", "Prjcost", "Wert1", "Yepcost", "Pwf06", "Pwf05"].forEach(function(field) {
			        if (x[field]) {
			            if (x[field].includes("-")) {
			                x[field] = x[field].replaceAll("-", "");
			                x[field] = "-" + x[field];
			            }
			        }
			    });
			    return x;
			});
			var ApproverList_data = [];
			// Approver List Data
			var ApproverList_Model = this.getView().byId("approvertable_id").getModel();
			if(ApproverList_Model != undefined) {
				if(ApproverList_Model.getData().length != 0) {
					ApproverList_data = ApproverList_Model.getData();
					ApproverList_data =  JSON.parse(JSON.stringify(ApproverList_Model.getData()));
					ApproverList_data.map(function(x) {
						x.Action = x.Raction;
						delete x.__metadata;
						delete x.Raction;
						delete x.Editable;
						delete x.Remarks;
						delete x.Wfstatus;
					});
				}
			}
			currentprogress_remarks_text = currentprogress_remarks_text.filter(x => x.Tdline !== "");
			var ItLongtext = [];
			if(Description != "") {
				ItLongtext = this.Long_Text_Format(RequestId, Year, Description);
			}
			if(currentprogress_remarks_text.length > 0){
				ItLongtext = ItLongtext.concat(currentprogress_remarks_text);
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
					"Aucanln1": "",
					"Aucanln2": "",
					"Kfzkz": "",
					"Txt50": AssetTitle,
					"Txa50": Name,
					"Werks": "",
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
				"ItLongtext": ItLongtext,
				"ItDocs": [],
				"EtMessage": [],
				"EtRetrun": [],
				"EsRequest": [],
				"EtLongtext": [],
				"ItAtrnb": [],
				"ItAtrni": Update_Request_Data,
				"EtDocs": [],
				"ItAtrnw": ApproverList_data
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
			if(oControl_at == "Submit" || oControl_at == "Exit") {
				return oEntity;
			}
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
		SavePress: function(oEntity,close_app) {
			Core.DataSaveProgress.open();
			setTimeout(function() {
				var Submit = Core.that.oDataModel();
				Submit.create("AssetApiSet", oEntity, null, function(oData, response) {
					if(close_app == true){
						setTimeout(function() {
							window.close();
						}, 100);
						return false;
					}
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
						Core.Created_By = oData.EsRequest.results[0].Ernam;
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
					Core.that.HandleError_post(err);
				});
			}, 500);
		},
		ClearData: function() {
			var view = Core.that.getView();
			view.byId("RequestId").setValue('$000000001');
			view.byId("AssetTitleId").setValue();
			view.byId("NameId").setValue();
			view.byId("RequestTypeId").setSelectedKey("J");
			view.byId("Year").setValue(Core.DateFormat_year_Month.format(new Date()));
			view.byId("Description").setValue();
			view.byId("Status").setValue("NEW");
			view.byId("CompanyCode").setSelectedKey();
			view.byId("StaffNoId").setValue();
			view.byId("ASignOffpprovedById").setValue();
			view.byId("AppNameId").setValue();
			view.byId("ApprovedById").setValue();
			var companyCode = Core.A_UserMasterData.EtUserBukrs.results;
			view.byId("Submit_btn").setVisible(true);
			view.byId("Save_btn").setVisible(true);
			if(companyCode.length == 1) {
				view.byId("CompanyCode").setSelectedKey(companyCode[0].Bukrs);
			}
			delete Core.AssetRequests_Data;
			delete Core.A_AssetData;
			view.byId("approvertable_id").setModel(this.Empty_Model);
			view.byId("Project_Update_Request_Table").setModel(this.Empty_Model);
			view.byId("approvertable_id").setModel(this.Empty_Model);
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
			var Docname = Core.byId(id).getValue();

			function FileUpload() {
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
					reader.onerror = function(ex) {
						Core.byId(id).setValue("");
						sap.m.MessageBox.error(ex);
					};
					/*var Data = Core.byId("AttachmentTabel").getModel();
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
					}*/
					var flag = true;
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
			}
			MessageBox.confirm(`${Core.i18n.getText("ConfirmSelectedFilePopup")} ${Docname}`, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				initialFocus: MessageBox.Action.YES,
				onClose: function(sAction) {
					if(sAction == 'YES') {
						FileUpload();
					} else {
						Core.byId(id).setValue("");
					}
				}
			});
		},
		// Restricting files to upload 
		typeMissmatchUpload: function(oEvent) {
			var aFileTypes = oEvent.getSource().getFileType();
			aFileTypes.map(function(sType) {
				return "*." + sType;
			});
			MessageBox.information("The file type *." + oEvent.getParameter("fileType") + " is not allowed." + "\n" + " Choose one of the following types: " + aFileTypes.join(", "));
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
					Core.oDataModel = Core.that.oDataModel();
					Core.oDataModel.read(EntityValue, null, "", true, function(oData, response) {
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
					}, function(err) {
						Core.that.HandleError_read(err);
					});
				}, 500);
			}
		},
		View_Image: function(oEvent) {
			var data = oEvent.getSource().getBindingContext().getObject();
			this.Image = new sap.m.LightBox({
				imageContent: new sap.m.LightBoxItem({
					imageSrc: 'data:image/jpeg;base64,' + data.Content,
					title: data.Filename
				})
			});
			this.Image.open();
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
			Core.byId("RemarksId").setValue("");
		},
		ApprovePress: function() {
			var RemarksMsg = Core.i18n.getText("RemarksMsg");
			var remarks = Core.byId("RemarksId").getValue();
			if(remarks == "") {
				MessageBox.information(RemarksMsg);
			} else {
				Core.F4_EnterRemarks.close();
				if(this.FORM_ACTION == "APPR" || this.FORM_ACTION == "REJT") {
					Core.that.Approve_Reject_Workflow(remarks);
				} else {
					Core.that.SubmitAction();
				}
			}
		},
		SubmitValidation: function() {
			var view = this.getView();
			var AssetTitle = view.byId("AssetTitleId").getValue();
			var CompanyCode = view.byId("CompanyCode").getSelectedKey();
			var _Validate_Flag = this.Define_validations();
			if(_Validate_Flag == true) {
				if(AssetTitle === "") {
					Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
					MessageBox.information(Core.i18n.getText("AssetTitleMandatoryTxt"));
					return false;
				} else if(CompanyCode === "") {
					Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
					MessageBox.information(Core.i18n.getText("EnterCompanyCode"));
					return false;
				}
			}
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
							informationDialog.close();
							Core.that.SubmitAction();
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
		SubmitAction: function(Action) {
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			var view = this.getView();
			var remarks = Core.byId("RemarksId").getValue();
			var RequestId = view.byId("RequestId").getValue();
			var Year = this.getView().byId("CreatedOnId").getDateValue();
			Year = Year.getFullYear().toString();
			var AssetTitle = view.byId("AssetTitleId").getValue();
			var Name = view.byId("NameId").getValue();
			var Description = view.byId("Description").getValue();
			var Status = view.byId("Status").getValue();
			var RequestType = view.byId("RequestTypeId").getSelectedKey();
			var CompanyCode = view.byId("CompanyCode").getSelectedKey();
			Action == "APPR" || Action == "REJT" ? Action = Action : Action = "WAPPR";
			var oEntity = {
				"IsWFMaintain": [{
					"Compd": "",
					"Priok": "",
					"Werks": "",
					"Txt50": AssetTitle,
					//"Txa50": Name,
					"Atrnid": RequestId,
					"Fyear": Year,
					"Rstatus": Action,
					"Activity": "PQ",
					"Action": "J",
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
					"Wfstatus": Action
				}],
				"EtAssetReqKey": [],
				"EtMessage": [],
				"EtReturn": []
			};
			if(Action == "APPR" || Action == "REJT") {
				return oEntity;
			}
			Core.DataSubmitProgress.open();
			function Trigger_After_Save() {
				setTimeout(function() {
					remarks = remarks.replace(/\n/g, '##');
					var Submit = Core.that.oDataModel();
					Submit.setHeaders({
						"ivdoctype": "ASSET",
						"ivremarks": remarks,
						"ivwfstatus": "WAPPR"
					});
					Submit.create("WorkflowMaintainSet", oEntity, null, function(oData, response) {
						Core.DataSubmitProgress.close();
						// Read success or Error From Odata Response
						var Resp_Error = oData.EtMessage.results[0].EvError;
						var title;
						Core.byId("RemarksId").setValue("");
						// Set Title Based on Flag
						if(Resp_Error == null) {
							Core.F4_EnterRemarks.open();
							return false;
						} else if(Resp_Error == true) {
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
					}, function(err) {
						Core.that.HandleError_post(err);
					});
				}, 200);
			}
			var is_Save_Enabled = this.getView().byId("Save_btn").getVisible();
			if(is_Save_Enabled == true) {
				var save_Entity = this.on_Save("Submit");
				if(save_Entity == false || save_Entity == undefined) {
					Core.DataSubmitProgress.close();
					return false;
				}
				var Submit = Core.that.oDataModel();
				setTimeout(() => {
					Submit.create("AssetApiSet", save_Entity, null, function(oData, response) {
						var RequestId = oData.EtMessage.results[0].EvAtrnid;
						var Resp_Error = oData.EtMessage.results[0].EvError;
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
						Trigger_After_Save();
					}, function(err) {
						Trigger_After_Save();
					});
				}, 50)
			} else {
				Trigger_After_Save();
			}
		},
		AssetValueHelp: function(oEvent) {
			Core.Opened_Asset_Serach = oEvent.getSource().getId();
			if(oEvent.getSource().getBindingContext() != undefined) {
				Core.Current_row_object = oEvent.getSource().getBindingContext().getObject();
			}
			if(Core.Opened_Asset_Serach.includes('xmlview')) {
				Core.Opened_Asset_Serach = oEvent.oSource.sId.split('--')[1]
			}
			Core.F4_AssetSearch.open();
			Core.byId("AssetSearchPage").setExpanded(true);
		},
		AssetSearchClose: function() {
			Core.F4_AssetSearch.close();
		},
		Clear_AssetSearch: function() {
			var EtCompanyCode = Core.A_UserMasterData.EtUserBukrs.results;
			var Editable = false;
			if(EtCompanyCode.length == 1) {
				Editable = true;
			}
			Core.byId("VhPlantCodeId").setEditable(Editable);
			Core.byId("VhCostCenterId").setEditable(Editable);
			Core.byId("VhAssetClassId").setEditable(Editable);
			Core.byId("VhLocationId").setEditable(Editable);
			if(Editable == true) {
				Core.byId("VhCompanyCodeId").setSelectedKey(EtCompanyCode[0].Bukrs)
			} else {
				Core.byId("VhCompanyCodeId").setSelectedKey("")
			}
			Core.byId("VhPlantCodeId").setSelectedKey("");
			Core.byId("VhCostCenterId").setSelectedKey("")
			Core.byId("VhAssetClassId").setSelectedKey("");
			Core.byId("VhLocationId").setSelectedKey("");
			Core.byId("VhLocationId").getBinding("items").filter([], "Application");
			Core.byId("VhAssetNameId").setValue("");
			Core.byId("Asset_No_f4").setValue("");
			Core.byId("WBS_No_f4").setValue("");
			Core.byId("InventoryNo_f4").setValue();
			Core.byId("SerialNumber_f4").setValue();
			Core.byId("AssetTableId").setModel(this.Empty_Model);
			Core.byId("AssetTabelPanelId").setVisible(false);
			Core.byId("AssetSearchTitleId").setText(Core.i18n.getText("AssetSearchTitle"));
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
					Core.oDataModel = Core.that.oDataModel();
					Core.oDataModel.read(EntityValue, null, "", true, function(oData, response) {
						if(oData.results.length != 0) {
							var ProjUpdData = oData.results[0].EtProjUpdData.results;
							var Project_Update_Model = new JSONModel(ProjUpdData);
							Project_Update_Model.iSizeLimit = 10000;
							Core.that.getView().byId("Project_Update_Request_Table").setModel(Project_Update_Model);
							Core.Update_Request_Search.close();
						} else {
							Core.that.getView().byId("Project_Update_Request_Table").setModel(Core.that.Empty_Model);
						}
						Core.DataLoadProgress.close();
					}, function(err) {
						Core.that.HandleError_read(err);
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
			var Asset_No = Core.byId("Asset_No_f4").getValue();
			var WBS_No = Core.byId("WBS_No_f4").getValue();
			var InventoryNo = Core.byId("InventoryNo_f4").getValue();
			var SerialNo = Core.byId("SerialNumber_f4").getValue();
			if(CompanyCode == "") {
				var Msg = Core.i18n.getText("CompanyCodeMandatoryTxt");
				MessageBox.information(Msg);
			} else if(!AssetClass && !CostCenter && !AssetName && !Asset_No && !WBS_No && !InventoryNo && !SerialNo) {
				var Msg = Core.i18n.getText("EnterAssetClassCostCenterAssetNameAssetNo");
				MessageBox.information(Msg);
				return false;
			}
			/*else if(AssetClass == "") {
							var Msg = Core.i18n.getText("AsserClassMandatoryTxt");
							MessageBox.information(Msg);
						}*/
			else {
				Core.DataLoadProgress.open();
				Core.byId("AssetSearchPage").setExpanded(false);
				Core.byId("AssetTabelPanelId").setVisible(true);
				var EntityInputs = [];
				CompanyCode && EntityInputs.push("Bukrs eq '".concat(CompanyCode).concat("'"));
				PlanningPlant && EntityInputs.push("Werks eq '".concat(PlanningPlant).concat("'"));
				CostCenter && EntityInputs.push("Kostl eq '".concat(CostCenter).concat("'"));
				AssetClass && EntityInputs.push("Anlkl eq '".concat(AssetClass).concat("'"));
				Location && EntityInputs.push("Stort eq '".concat(Location).concat("'"));
				AssetName && EntityInputs.push("Txt50 eq '".concat(AssetName).concat("'"));
				Asset_No && EntityInputs.push("Anln1 eq '".concat(Asset_No).concat("'"));
				WBS_No && EntityInputs.push("Posid eq '".concat(WBS_No).concat("'"));
				InventoryNo && EntityInputs.push("Invnr eq '".concat(InventoryNo).concat("'"));
				SerialNo && EntityInputs.push("Sernr eq '".concat(SerialNo).concat("'"));
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
					Core.oDataModel = Core.that.oDataModel();
					Core.oDataModel.setHeaders({
						"muser": Core.O_Login_user.Muser,
						"ivtransmittype" : "PQ" 
					});
					Core.oDataModel.read(EntityValue, null, "", true, function(oData, response) {
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
					}, function(err) {
						Core.that.HandleError_read(err);
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
		on_Table_DblClick: function(oEvent) {
			// Get the currently active element in the document
			var activeElement = document.activeElement;
			// Check if there's an active element and it has an ID
			if(activeElement && activeElement.id) {
				// Get the ID of the active element
				var id = activeElement.id;
				// Find the index of 'col' in the ID
				var colIndex = id.indexOf('col');
				// If 'col' is found in the ID
				if(colIndex !== -1) {
					// Extract the ID of the table row
					var tableRowId = id.slice(0, colIndex - 1);
					// Get the binding context object of the table row
					var isnullContext =  Core.byId(tableRowId).getBindingContext() === null;
					if(isnullContext){
						return false;
					}
					var rowObject = Core.byId(tableRowId).getBindingContext().getObject();
					// Extract the index of the table row from the binding context path
					//var index = +Core.byId(tableRowId).getBindingContext().getPath().split("/")[1];
					// Determine the table type based on the ID and perform actions accordingly
					if(id.includes("AssetTableId")) {
						// Call the AddAssetPress method with the rowObject
						Core.that.AddAssetPress("", rowObject);
					} else if(id.includes("WbsTableId")) {
						// Call the AddWbsNo method with the rowObject
						Core.that.AddWbsNo("", rowObject);
					} else if(id.includes("Users_table_id")) {
						// Call the Add_User method with the rowObject
						Core.that.Add_User("", rowObject);
					}
				}
			}
		},
		AssetLiveSearch: function(oEvt) {
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			var list = Core.byId("AssetTableId");
			if(list != undefined) {
				var binding = list.getBinding("rows");
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
			var AssetTitle = Core.i18n.getText("AssetSearchTitle");
			Core.byId("AssetSearchTitleId").setText(AssetTitle + " (" + binding.iLength + ")");
		},
		AddAssetPress: function(oEvent,_recieved_data) {
			var AssetTableData = _recieved_data,AssetTable,SelectedContext,SelectedContextLength = 1;
			if(!_recieved_data){
				 AssetTable = Core.byId("AssetTableId");
				 SelectedContext = AssetTable.getSelectedIndices();
				 SelectedContextLength = SelectedContext.length;
			}
			if(SelectedContextLength == 0) {
				MessageBox.information(Core.i18n.getText("selectRecord"));
				return false;
			} else if(SelectedContextLength > 1) {
				var Arr = [];
				for(var i = 0; i < SelectedContextLength; i++) {
					var AssetTableData = AssetTable.getContextByIndex(AssetTable.getSelectedIndices()[i]).getObject();
					var obj = {
						Pspid: "",
						Anln1: AssetTableData.Anln1,
						Bukrs: AssetTableData.Bukrs,
						Anln2: AssetTableData.Anln2,
						Posid: "",
						Prjcost: "",
					//	Rprjcost: "",
						Wert1: "",
						Answt: "",//AssetTableData.Netbv,
						Yepcost: "",
						Compd: "",
						Repdate: "",
						Rcompd: "",
						Prozs: "",
						Pstatus: "",
						Dageing: "",
						Waers : "",
						Action: "I",
						Werks: "",
						Post1 : "",
						Pwf06 : "",
						Pwf05 : ""
						
					};
					Arr.push(obj);
				}
				var Model = this.getView().byId("Project_Update_Request_Table").getModel();
				if(Model == undefined) {
					var oModel = new JSONModel(Arr);
					this.getView().byId("Project_Update_Request_Table").setModel(oModel);
				} else if(Model != undefined && Model.getData()) {
					var Arr = Model.getData().concat(Arr);
					var oModel = new JSONModel(Arr);
					this.getView().byId("Project_Update_Request_Table").setModel(oModel);
				}
				this.getView().byId("ProjectUpdate_tab").setCount(Arr.length);
				Core.F4_Update_Request.close();
			} else {
				if(!_recieved_data){
					 AssetTableData = AssetTable.getContextByIndex(AssetTable.getSelectedIndices()[0]).getObject();
				}
				if(Core.F4_Update_Request.isOpen() == true) {
					Core.byId("SubAsset_id").setValue(AssetTableData.Anln2);
					Core.byId("CostCenter_id").setText(AssetTableData.Bukrs);
					Core.byId("pip_asset_f4").setValue(AssetTableData.Anln1);
					Core.byId("pipbalance_f4").setValue(AssetTableData.Netbv);
				} else if(Core.Opened_Asset_Serach.includes("AssetNo")) {
					var AssetTableData = AssetTable.getContextByIndex(AssetTable.getSelectedIndices()[0]).getObject();
					Core.Current_row_object.Anln2 = AssetTableData.Anln2;
					Core.Current_row_object.Bukrs = AssetTableData.Bukrs;
					Core.Current_row_object.Anln1 = AssetTableData.Anln1;
					Core.Current_row_object.Answt = AssetTableData.Netbv;
					this.getView().byId("Project_Update_Request_Table").getModel().refresh(true);
				} else {
					Core.Anln2 = AssetTableData.Anln2;
					Core.Bukrs = AssetTableData.Bukrs;
					Core.byId("Asset_id").setValue(AssetTableData.Anln1);
				}
			}
			Core.F4_AssetSearch.close();
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
				setTimeout(function() {
						window.close();
					}, 500)
					/*Core.Navto_Launchpad = "";
				window.history.go(-1); //Back to FioriLaunchpad
*/
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
					Core.oDataModel = Core.that.oDataModel();
					Core.oDataModel.setHeaders(Obj);
					Core.oDataModel.read(EntityValue, null, "", true, function(oData, response) {
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
					}, function(err) {
						Core.that.HandleError_read(err);
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
			var CompanyCode = this.getView().byId("CompanyCode").getSelectedKey();
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
			if(CompanyCode != "") {
				var data = "Bukrs eq '".concat(CompanyCode).concat("'");
				EntityInputs.push(data);
				Obj.Uname = WbsName;
			}
			var data = "Activity eq '".concat("PQ").concat("'");
			EntityInputs.push(data);
			var EntityValue = "SearchWBSSet?$expand=EtWbsSearch,EtWbsLongtext";
			if(EntityInputs.length > 0) {
				EntityInputs = EntityInputs.toString();
				EntityInputs = EntityInputs.split(',').join(' and ');
				EntityInputs = encodeURIComponent(EntityInputs);
				EntityValue = "SearchWBSSet?$filter=" + EntityInputs + "&$expand=EtWbsSearch,EtWbsLongtext";
			}
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			setTimeout(function() {
				Core.oDataModel = Core.that.oDataModel();
				Core.oDataModel.setHeaders(Obj);
				Core.oDataModel.read(EntityValue, null, "", true, function(oData, response) {
					var DataJson = new JSONModel([]);
					DataJson.iSizeLimit = 10000;
					var Title = Core.i18n.getText("SearchWbsNoTitle");
					if(oData.results.length == 0) {
						var Msg = Core.i18n.getText("NoDataMsg");
						MessageBox.information(Msg);
						Core.byId("WbsTableId").setModel(DataJson);
						Core.byId("SearchWbsNoTitleId").setText(Title);
					} else {
						var EtWbsLongtext = oData.results[0].EtWbsLongtext.results;
						function get_Long_Text(Posid, Tdid) {
						    var description = '';
						    for (var i = 0; i < EtWbsLongtext.length; i++) {
						        if (EtWbsLongtext[i].Tdname === Posid && EtWbsLongtext[i].Tdid === Tdid) {
						            description += EtWbsLongtext[i].Tdline + "\n";
						        }
						    }
						    return description;
						}
						oData.results[0].EtWbsSearch.results.map(function(x) {
						    x.Pipctprog = get_Long_Text(x.Posid, 'Z002');
						    x.Pipremarks = get_Long_Text(x.Posid, 'Z003');
						});
						DataJson.setData(oData.results[0].EtWbsSearch.results);
						Core.byId("WbsTableId").setModel(DataJson);
						Core.byId("SearchWbsNoTitleId").setText(Title + " (" + oData.results[0].EtWbsSearch.results.length + ")");
					}
					Core.DataLoadProgress.close();
				}, function(err) {
					Core.that.HandleError_read(err);
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
			} else if(SelectedContextLength > 1) {
				var Arr = [];
				for(var i = 0; i < SelectedContextLength; i++) {
					var WbsTable_Data = WbsTable.getContextByIndex(WbsTable.getSelectedIndices()[i]).getObject();
					var total_project_cost = Core.that.calculateTotalProjectCost(WbsTable_Data.Pwf05, WbsTable_Data.Pwf06 );
					var obj = {
						Pspid: WbsTable_Data.Pspid,
						Anln1: WbsTable_Data.Anln1,
						Bukrs: "",
						Anln2: WbsTable_Data.Anln2,
						Posid: WbsTable_Data.Posid,
						Prjcost: Core.formatter.formatAmount(WbsTable_Data.Prjcost),
					//	Rprjcost: Core.formatter.formatAmount(WbsTable_Data.Rprjcost),
						Wert1: Core.formatter.formatAmount(WbsTable_Data.Budgetamt),
						Answt: total_project_cost,
						Yepcost:   Core.formatter.formatAmount(WbsTable_Data.Yepcost),
						Compd:  Core.formatter.formatddmmyyy(WbsTable_Data.Compd),
						Pipsdatestt:  Core.formatter.formatddmmyyy(WbsTable_Data.Pipsdatestt),
						Pipsdateadj: "",
						Repdate:  Core.formatter.formatddmmyyy(new Date()),
						Rcompd: "",
						Prozs: WbsTable_Data.Prozs,
						Pstatus: WbsTable_Data.Pstatus,
						Dageing: "",
						Action: "I",
						Werks: "",
						Pipremarks : WbsTable_Data.Pipremarks,
						Pipctprog : WbsTable_Data.Pipctprog,
						Post1 : WbsTable_Data.Post1,
						Pwf05 : Core.formatter.formatAmount(WbsTable_Data.Pwf05),
						Pwf06 : Core.formatter.formatAmount(WbsTable_Data.Pwf06),
						
					};
					Arr.push(obj);
				}
				var Model = this.getView().byId("Project_Update_Request_Table").getModel();
				if(Model == undefined) {
					var oModel = new JSONModel(Arr);
					this.getView().byId("Project_Update_Request_Table").setModel(oModel);
				} else if(Model != undefined && Model.getData()) {
					var Arr = Model.getData().concat(Arr);
					var oModel = new JSONModel(Arr);
					this.getView().byId("Project_Update_Request_Table").setModel(oModel);
				}
				this.getView().byId("ProjectUpdate_tab").setCount(Arr.length);
				Core.F4_Update_Request.close();
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
				} else if(Core.opened_Input == 'wbsNo_f4' || Core.opened_Input == 'ProjectNo_f4') {
					var total_project_cost = Core.that.calculateTotalProjectCost(Data.Pwf05, Data.Pwf06);
					Core.byId("wbsNo_f4").setValue(Data.Posid);
					Core.byId("ProjectNo_f4").setValue(Data.Pspid);
					Core.byId("CompletionDate_f4").setValue(Core.formatter.formatddmmyyy(Data.Compd));
					Core.byId("StartingDate_FirstSettlement_f4").setValue(Core.formatter.formatddmmyyy(Data.Pipsdatestt));
					Core.byId("Status_f4").setSelectedKey(Data.Pstatus);
					Core.byId("PercentCompletion_f4").setValue(Data.Prozs);
					Core.byId("YEP_f4").setValue(Core.formatter.formatAmount(Data.Yepcost));
					Core.byId("Budget_f4").setValue(Core.formatter.formatAmount(Data.Budgetamt));
					Core.byId("ProjectCost_f4").setValue(Core.formatter.formatAmount(Data.Prjcost));
					//Core.byId("ApprCost_f4").setValue(Core.formatter.formatAmount(Data.Rprjcost));
					Core.byId("pipbalance_f4").setValue(total_project_cost);
					Core.byId("CurrentYearCostIncurred_f4").setValue(Core.formatter.formatAmount(Data.Pwf06));
					Core.byId("Previousyear_Cost_f4").setValue(Core.formatter.formatAmount(Data.Pwf05));
					Core.byId("pip_asset_f4").setValue(Data.Anln1);
					Core.byId("SubAsset_id").setValue(Data.Anln2);
					Core.byId("Wbs_name").setText(Data.Post1);
					Core.byId("CurrentProgress_f4").setValue(Data.Pipctprog);
					Core.byId("Remarks_f4").setValue(Data.Pipremarks);
				}
				/*else if(Core.opened_Input == 'ProjectNo_f4') {
					Core.byId("wbsNo_f4").setValue(Data.Posid);
					Core.byId("ProjectNo_f4").setValue(Data.Pspid);
				}*/
			}
			Core.F4_WbsNoSearch.close();
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
		UpdateRequest_Data: function() {
			var F4_view = Core;
			var ProjectNo = F4_view.byId("ProjectNo_f4").getValue();
			var pip_asset = F4_view.byId("pip_asset_f4").getValue();
			var wbsNo = F4_view.byId("wbsNo_f4").getValue();
			var ProjectCost = F4_view.byId("ProjectCost_f4").getValue();
			//var ApprCost = F4_view.byId("ApprCost_f4").getValue();
			var Budget = F4_view.byId("Budget_f4").getValue();
			var pipbalance = F4_view.byId("pipbalance_f4").getValue();
			var YEP = F4_view.byId("YEP_f4").getValue();
			var CurrentYearCostIncurred = F4_view.byId("CurrentYearCostIncurred_f4").getValue();
			var Previousyear_Cost = F4_view.byId("Previousyear_Cost_f4").getValue();
			var CompletionDate = F4_view.byId("CompletionDate_f4").getValue();
			var ReportingDate = F4_view.byId("ReportingDate_f4").getValue();
			var StartingDate_FirstSettlement = F4_view.byId("StartingDate_FirstSettlement_f4").getValue();
			var StartingDate_Adjusted = F4_view.byId("StartingDate_Adjusted_f4").getValue();
			var RevisedCompletionDate = F4_view.byId("RevisedCompletionDate_f4").getValue();
			var PercentCompletion = F4_view.byId("PercentCompletion_f4").getValue();
			var Status = F4_view.byId("Status_f4").getSelectedKey();
			var Ageing = F4_view.byId("Ageing_f4").getValue();
			var Cost_Center = F4_view.byId("CostCenter_id").getText();
			var Sub_Asset = F4_view.byId("SubAsset_id").getValue();
			var Remarks = F4_view.byId("Remarks_f4").getValue();
			var Current_Progress = F4_view.byId("CurrentProgress_f4").getValue();
			var Wbs_name = Core.byId("Wbs_name").getText();
			if (ReportingDate && StartingDate_Adjusted) {
			    Ageing = this.Calculate_Ageing(StartingDate_Adjusted, ReportingDate) || "";
			} else if (ReportingDate && StartingDate_FirstSettlement) {
			    Ageing = this.Calculate_Ageing(StartingDate_FirstSettlement, ReportingDate) || "";
			} else {
			    Ageing = "";
			}
			//Ageing = CompletionDate != "" && ReportingDate != "" ? this.Calculate_Ageing(CompletionDate, ReportingDate) : "";
			/*d1 = this.Format_Date(CompletionDate);
			d2 = this.Format_Date(ReportingDate);
			Ageing = new Date(+d1.slice(0,4),+d1.slice(4,2),+d1.slice(6,8)).getTime() - new Date(+d2.slice(0,4),+d2.slice(4,2),+d2.slice(6,8)).getTime() / 86400000;*/
			Ageing = Ageing.replace('-', '');
			var _Validate_Flag = this.Define_validations();
			if(ProjectNo == "") {
				MessageBox.information(Core.i18n.getText("ProjectNoMandatoryTxt"));
				return false;
			}
			if(_Validate_Flag == true) {
				/*if(Budget === "") {
					MessageBox.warning(Core.i18n.getText("EnterApprovedBudget"));
					return false;
				} else if(YEP === "") {
					MessageBox.warning(Core.i18n.getText("EnterYEP"));
					return false;
				} else*/ if(CompletionDate === "") {
					MessageBox.warning(Core.i18n.getText("EnterCompletionDate"));
					return false;
				}else if(StartingDate_FirstSettlement === "") {
					MessageBox.warning(Core.i18n.getText("EnterStartingDate_FirstSettlement"));
					return false;
				} /*else if(ReportingDate === "") {
					MessageBox.warning(Core.i18n.getText("EnterReportingDate"));
					return false;
				} else if(RevisedCompletionDate === "") {
					MessageBox.warning(Core.i18n.getText("EnterRevisedCompletionDate"));
					return false;
				} else */if(PercentCompletion == '') {
					MessageBox.warning(Core.i18n.getText("EnterPercentCompletion"));
					return false;
				} else if(Number(PercentCompletion) > 100) {
					MessageBox.warning(Core.i18n.getText("PercentageCannotgreater100"));
					return false;
				} /*else if(Status === "") {
					MessageBox.warning(Core.i18n.getText("EnterStatus"));
					return false;
				}*/
			}else{
				if(Number(PercentCompletion) > 100) {
					MessageBox.warning(Core.i18n.getText("PercentageCannotgreater100"));
					return false;
				}
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
			//Array_of.Rprjcost = ApprCost;
			Array_of.Wert1 = Budget;
			Array_of.Answt = pipbalance;
			Array_of.Yepcost = YEP;
			Array_of.Pwf05 = Previousyear_Cost;
			Array_of.Pwf06 = CurrentYearCostIncurred;
			Array_of.Compd = CompletionDate;
			Array_of.Pipsdatestt = StartingDate_FirstSettlement;
			Array_of.Pipsdateadj = StartingDate_Adjusted;
			Array_of.Repdate = ReportingDate;
			Array_of.Rcompd = RevisedCompletionDate;
			Array_of.Prozs = PercentCompletion;
			Array_of.Pstatus = Status;
			Array_of.Dageing = Ageing;
			Array_of.Post1 = Wbs_name;
			Array_of.Pipremarks = Remarks;
			Array_of.Pipctprog = Current_Progress;
			Model.refresh(true);
			Core.F4_Update_Request.close();
		},
		AddRequest_Data: function() {
			var F4_view = Core;
			var ProjectNo = F4_view.byId("ProjectNo_f4").getValue();
			var pip_asset = F4_view.byId("pip_asset_f4").getValue();
			var wbsNo = F4_view.byId("wbsNo_f4").getValue();
			var ProjectCost = F4_view.byId("ProjectCost_f4").getValue();
			//var ApprCost = F4_view.byId("ApprCost_f4").getValue();
			var Budget = F4_view.byId("Budget_f4").getValue();
			var pipbalance = F4_view.byId("pipbalance_f4").getValue();
			var YEP = F4_view.byId("YEP_f4").getValue();
			var CurrentYearCostIncurred = F4_view.byId("CurrentYearCostIncurred_f4").getValue();
			var Previousyear_Cost = F4_view.byId("Previousyear_Cost_f4").getValue();
			var CompletionDate = F4_view.byId("CompletionDate_f4").getValue();
			var ReportingDate = F4_view.byId("ReportingDate_f4").getValue();
			var StartingDate_FirstSettlement = F4_view.byId("StartingDate_FirstSettlement_f4").getValue();
			var StartingDate_Adjusted = F4_view.byId("StartingDate_Adjusted_f4").getValue();
			var RevisedCompletionDate = F4_view.byId("RevisedCompletionDate_f4").getValue();
			var PercentCompletion = F4_view.byId("PercentCompletion_f4").getValue();
			var Status = F4_view.byId("Status_f4").getSelectedKey();
			var Ageing = F4_view.byId("Ageing_f4").getValue();
			var Cost_Center = F4_view.byId("CostCenter_id").getText();
			var Sub_Asset = F4_view.byId("SubAsset_id").getValue();
			var Remarks = F4_view.byId("Remarks_f4").getValue();
			var Current_Progress = F4_view.byId("CurrentProgress_f4").getValue();
			var Plant = F4_view.byId("Plants").getSelectedKey();
			var Wbs_name = Core.byId("Wbs_name").getText();
			if (ReportingDate && StartingDate_Adjusted) {
			    Ageing = this.Calculate_Ageing(StartingDate_Adjusted, ReportingDate) || "";
			} else if (ReportingDate && StartingDate_FirstSettlement) {
			    Ageing = this.Calculate_Ageing(StartingDate_FirstSettlement, ReportingDate) || "";
			} else {
			    Ageing = "";
			}
			//Ageing = CompletionDate != "" && ReportingDate != "" ? this.Calculate_Ageing(CompletionDate, ReportingDate) : "";
			Ageing = Ageing.replace('-', '');
			var _Validate_Flag = this.Define_validations();
			if(ProjectNo == "") {
				MessageBox.information(Core.i18n.getText("ProjectNoMandatoryTxt"));
				return false;
			}
			if(_Validate_Flag == true) {
				/*if(Budget === "") {
					MessageBox.warning(Core.i18n.getText("EnterApprovedBudget"));
					return false;
				} else if(YEP === "") {
					MessageBox.warning(Core.i18n.getText("EnterYEP"));
					return false;
				} else*/ if(CompletionDate === "") {
					MessageBox.warning(Core.i18n.getText("EnterCompletionDate"));
					return false;
				}else if(StartingDate_FirstSettlement === "") {
					MessageBox.warning(Core.i18n.getText("EnterStartingDate_FirstSettlement"));
					return false;
				}/* else if(ReportingDate === "") {
					MessageBox.warning(Core.i18n.getText("EnterReportingDate"));
					return false;
				} else if(RevisedCompletionDate === "") {
					MessageBox.warning(Core.i18n.getText("EnterRevisedCompletionDate"));
					return false;
				} else*/ if(PercentCompletion == '') {
					MessageBox.warning(Core.i18n.getText("EnterPercentCompletion"));
					return false;
				} else if(Number(PercentCompletion) > 100) {
					MessageBox.warning(Core.i18n.getText("PercentageCannotgreater100"));
					return false;
				} /*else if(Status === "") {
					MessageBox.warning(Core.i18n.getText("EnterStatus"));
					return false;
				}*/
			}else{
				if(Number(PercentCompletion) > 100) {
					MessageBox.warning(Core.i18n.getText("PercentageCannotgreater100"));
					return false;
				}
			}
			var obj = {
				Pspid: ProjectNo,
				Anln1: pip_asset,
				Bukrs: Cost_Center,
				Anln2: Sub_Asset,
				Posid: wbsNo,
				Prjcost: ProjectCost,
				//Rprjcost: ApprCost,
				Wert1: Budget,
				Answt: pipbalance,
				Yepcost: YEP,
				Compd: CompletionDate,
				Repdate: ReportingDate,
				Rcompd: RevisedCompletionDate,
				Prozs: PercentCompletion,
				Pstatus: Status,
				Dageing: Ageing,
				Action: "I",
				Werks: Plant,
				Post1 : Wbs_name,
				Pipremarks : Remarks,
				Pipctprog : Current_Progress,
				Pipsdateadj : StartingDate_Adjusted,
				Pipsdatestt : StartingDate_FirstSettlement,
				Pwf05 : Previousyear_Cost,
				Pwf06 : CurrentYearCostIncurred,
			};
			var Arr = [];
			Arr.push(obj);
			var Model = this.getView().byId("Project_Update_Request_Table").getModel();
			if(Model == undefined) {
				var oModel = new JSONModel(Arr);
				this.getView().byId("Project_Update_Request_Table").setModel(oModel);
				this.getView().byId("ProjectUpdate_tab").setCount(Arr.length);
			} else if(Model != undefined && Model.getData()) {
				this.getView().byId("ProjectUpdate_tab").setCount(Model.getData().length);
				Model.getData().push(obj);
				Model.refresh(true);
			}
			this.getView().byId("ProjectUpdate_tab").setCount(Model.getData().length);
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
			//F4_view.byId("ApprCost_f4").setValue();
			F4_view.byId("Budget_f4").setValue();
			F4_view.byId("pipbalance_f4").setValue();
			F4_view.byId("YEP_f4").setValue();
			F4_view.byId("CurrentYearCostIncurred_f4").setValue();
			F4_view.byId("Previousyear_Cost_f4").setValue();
			F4_view.byId("CompletionDate_f4").setValue();
			F4_view.byId("RevisedCompletionDate_f4").setValue();
			F4_view.byId("PercentCompletion_f4").setValue();
			F4_view.byId("StartingDate_Adjusted_f4").setValue();
			F4_view.byId("StartingDate_FirstSettlement_f4").setValue();
			F4_view.byId("CurrentProgress_f4").setValue();
			F4_view.byId("Remarks_f4").setValue();
			F4_view.byId("Status_f4").setSelectedKey();
			F4_view.byId("Ageing_f4").setValue();
			F4_view.byId("CostCenter_id").setText();
			F4_view.byId("SubAsset_id").setValue();
			F4_view.byId("Plants").setValue();
			F4_view.byId("Wbs_name").setText();
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
			var id = oEvent.oSource.sId;
			id.includes('xmlview') && (id = id.split("--")[1]);
			Core.OpenedDate_id = id;
			var v = this.byId(id);
			var c = Core.byId(id);
			var value = "";
			if(v != undefined) {
				value = v.getValue();
			} else if(c != undefined) {
				value = c.getValue();
			}
			this.getView().byId("HiddenDP").setValue(value);
			setTimeout(() => {
				Core.that.byId("HiddenDP").openBy(oEvent.getSource().getDomRef());
			}, 50);
		},
		PlantChange: function(oEvent) {
			var value = oEvent.oSource.mProperties.selectedKey;
			var id = oEvent.oSource.sId;
			id.includes('xmlview') && (id = id.split("--")[1]);
			var F4_view = Core;
			var view = this.getView();
			if(view.byId(id) != undefined) {
				view.byId(id).setSelectedKey(value);
			} else if(F4_view.byId(id) != undefined) {
				F4_view.byId(id).setSelectedKey(value);
			}
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
			//F4_view.byId("ApprCost_f4").setValue(obj.Rprjcost);
			F4_view.byId("Budget_f4").setValue(obj.Wert1);
			//F4_view.byId("pipbalance_f4").setValue(obj.Answt);
			F4_view.byId("YEP_f4").setValue(obj.Yepcost);
			F4_view.byId("Previousyear_Cost_f4").setValue(obj.Pwf05);
			F4_view.byId("CurrentYearCostIncurred_f4").setValue(obj.Pwf06);
			//if(obj.Compd != "") {
				Core.byId("CompletionDate_f4").setValue(obj.Compd);
			//}
			//if(obj.Rcompd != "") {
				Core.byId("RevisedCompletionDate_f4").setValue(obj.Rcompd);
			//}
			//if(obj.Repdate != "") {
				Core.byId("ReportingDate_f4").setValue(obj.Repdate);
			//}
			F4_view.byId("PercentCompletion_f4").setValue(obj.Prozs);
			F4_view.byId("Status_f4").setSelectedKey(obj.Pstatus);
			F4_view.byId("Ageing_f4").setValue(obj.Dageing);
			F4_view.byId("CostCenter_id").setText(obj.Bukrs);
			F4_view.byId("SubAsset_id").setValue(obj.Anln2);
			F4_view.byId("Plants").setSelectedKey(obj.Werks);
			F4_view.byId("Wbs_name").setText(obj.Post1);
			F4_view.byId("Remarks_f4").setValue(obj.Pipremarks);
			F4_view.byId("StartingDate_Adjusted_f4").setValue(obj.Pipsdateadj);
			F4_view.byId("StartingDate_FirstSettlement_f4").setValue(obj.Pipsdatestt);
			F4_view.byId("CurrentProgress_f4").setValue(obj.Pipctprog);
			Core.that.calculateTotalProjectCost(obj.Pwf05, obj.Pwf06);
		},
		Delete_Record: function() {
			var _Model = this.getView().byId("Project_Update_Request_Table");
			var SelectedContext = _Model.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			if(SelectedContextLength === 0) {
				MessageBox.warning(Core.i18n.getText("SelectRecord"));
				return false;
			}
			var RequestId = this.getView().byId("RequestId").getValue();
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
							if(RequestId != "$000000001") {
								TableData[j].Action = "D";
								Core.Deleted_Records.push(TableData[j]);
							}
							TableData.splice(SelectedContext[j], 1);
						}
						Table.clearSelection();
						Table.getModel().refresh(true);
						Core.that.getView().byId("ProjectUpdate_tab").setCount(Table.getModel().getData().length);
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
		// Allow Only Numbers
		Numeric_Only_Livechange: function(oEvent) {
			var id = oEvent.oSource.sId;
			if(id.includes('xmlview')) {
				id = oEvent.oSource.sId.split("--")[1];
			}
			var v = this.getView().byId(id);
			var c = Core.byId(id);
			var max = oEvent.getSource().mProperties.maxLength;
			var inputvalue = oEvent.getParameters().value;
			this.ValidateInput(inputvalue, c, v);
			var value = inputvalue.replace(/[^0-9.-]/g, '');
			v != undefined && (v.setDOMValue(value.substring(0, max)));
			c != undefined && (c.setDOMValue(value.substring(0, max)));
		},
		PercentageofCompletion_Livechange: function(oEvent) {
			var id = oEvent.oSource.sId;
			if(id.includes('xmlview')) {
				id = oEvent.oSource.sId.split("--")[1];
			}
			var v = this.getView().byId(id);
			var c = Core.byId(id);
			var max = oEvent.getSource().mProperties.maxLength;
			var inputvalue = oEvent.getParameters().value;
			this.ValidateInput(inputvalue, c, v);
			var value = inputvalue.replace(/[^0-9\.]/g, '');
			if(value > 100){
				value = '100.0';
			}
			v != undefined && (v.setDOMValue(value.substring(0, max)));
			c != undefined && (c.setDOMValue(value.substring(0, max)));
			//this.getView().byId("Project_Update_Request_Table").getModel().refresh(true);
		},
		ValidateInput: function(inputvalue, c, v) {
			var pattern = /^[0-9\.]+$/;
			var res = inputvalue.match(pattern);
			if(res == null && inputvalue != '') {
				if(v != undefined) {
					v.addStyleClass('error');
					setTimeout(function() {
						v.removeStyleClass('error');
					}, 100)
				}
				if(c != undefined) {
					c.addStyleClass('error');
					setTimeout(function() {
						c.removeStyleClass('error');
					}, 200)
				}
			}
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
			} else {
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
			 var headerMapping = {};
	            var Columns = this.getView().byId("Project_Update_Request_Table").getColumns();
	            var oTable = this.getView().byId("Project_Update_Request_Table");
	            // 1. Build Header Mapping
	            for (var i = 0; i < Columns.length; i++) {
	                if (!Columns[i].getVisible()) {
	                    continue;
	                }
	                var property = "";
	                var Label = Columns[i].getLabel().getText().split('\t')[0].trim();
	                if (!Label) {
	                    continue;
	                }
	                if (Columns[i].getTemplate().getBindingInfo("text")) {
	                    property = Columns[i].getTemplate().getBindingInfo("text").parts[0].path;
	                } else if (Columns[i].getTemplate().getBindingInfo("value")) {
	                    property = Columns[i].getTemplate().getBindingInfo("value").parts[0].path;
	                } else if (Columns[i].getTemplate().getBindingInfo("selectedKey")) {
	                    property = Columns[i].getTemplate().getBindingInfo("selectedKey").parts[0].path;
	                }
	                headerMapping[Label] = property;
	            }
			if(fileContent && window.FileReader) {
				Core.byId(id).setValue("");
				 var reader = new FileReader();
				    reader.onload = function(e) {
				        var data = e.target.result;
				        var workbook = XLSX.read(data, { type: 'binary' });
				        workbook.SheetNames.forEach(function(sheetName) {
				            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
				        });

				        var excel_arr = [];
				        excelData.forEach(function(row) {
				            var obj = {};
				            var Numeric_fields = ["Pwf05", "Pwf06", "Prjcost", "Rprjcost", "Wert1", "Answt", "Yepcost"];
				            Object.keys(headerMapping).forEach(function(label) {
				                var property = headerMapping[label];
				                var rowKey = label.replace(/\*$/, "").trim();  // Clean the label
				                // Get value from row if exists, else set empty
				                var value = row.hasOwnProperty(rowKey) ? unescape(row[rowKey] || "") : "";
				                // Format numeric fields
				                if (Numeric_fields.includes(property)) {
				                    value = Core.formatter.formatAmount(value);
				                }
				                obj[property] = value;
				            });
				            obj.Action = "I";  // Set Action flag for each row
				            excel_arr.push(obj);
				        });

				       /* excelData.forEach(function(row) {
				            var obj = {};
				            for (var key in row) {
				                if (headerMapping[key]) {
				                    obj[headerMapping[key]] = unescape(row[key] || "");
				                    var Numeric_fields = [ "Pwf05", "Pwf06", "Prjcost", "Rprjcost", "Wert1", "Answt", "Yepcost"];
        							if (Numeric_fields.includes(headerMapping[key])) {
        								obj[headerMapping[key]] =  Core.formatter.formatAmount(obj[headerMapping[key]]);
        							}
				                }
				            }
				            obj.Action = "I";  // Add Action property
				            // You can handle date formatting if needed here
				            excel_arr.push(obj);
				        });*/

				        var model = Core.that.sModel(excel_arr);
				        Core.that.getView().byId("Project_Update_Request_Table").setModel(model);
				        Core.that.getView().byId("ProjectUpdate_tab").setCount(excel_arr.length);
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
			var aCols = [],
			Label = '',
			label = '',
			type = EdmType.String,
			width = '',
			property = '',
			required;
		var Columns = this.getView().byId("Project_Update_Request_Table").getColumns();
		for(var i = 0; i < Columns.length; i++) {
			if(Columns[i].mProperties.visible == false){
				continue;
			}
			var obj = {};
			Label = Columns[i].getLabel().mProperties.text;
			required = Columns[i].getLabel().mProperties.required;
			//required && (Label = Label + " *");
			if(Label === ""){
				continue;
			}
			width = Columns[i].mProperties.width;
			if(Columns[i].getTemplate().mBindingInfos.text){
				property = Columns[i].getTemplate().mBindingInfos.text.parts[0].path;
			}else if(Columns[i].getTemplate().mBindingInfos.value){
				property = Columns[i].getTemplate().mBindingInfos.value.parts[0].path;
			}else if(Columns[i].getTemplate().mBindingInfos.selectedKey){
				property = Columns[i].getTemplate().mBindingInfos.selectedKey.parts[0].path;
			}
			obj.label = Label;
			obj.property = property;
			obj.type = type;
			obj.width = width;
			aCols.push(obj);
		}
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
			var CompanyCode = Core.that.getView().byId("CompanyCode").getSelectedKey();
			if(mDataSource == undefined) {
				var mDataSource = [{
					Bukrs : CompanyCode
				}];
				this.getView().byId("Proj_comp_table").setModel(Core.that.sModel(mDataSource));
				mDataSource = oTable.getBinding("rows");
			}
			aCols = this.createColumnConfig();
			var mSettings = {
				workbook: {
					columns: aCols,
				},
				dataSource: mDataSource,
				fileName: "SAP_EAM_PIP_Request_Data.xlxs", //`${sap.ui.getCore().byId("input_id").getValue()}.xlsx`,
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
		getColumnWidths: function(sheet, cols) {
			var colWidths = [];
			cols.forEach((col, index) => {
				let maxWidth = col.length;
				// Scan through each cell in the column to find the maximum length
				for(let cell in sheet) {
					if(cell[0] === '!' || !cell.match(new RegExp(`^[A-Z]+${index + 1}$`))) continue;
					let cellValue = sheet[cell].v || '';
					if(cellValue.toString().length > maxWidth) {
						maxWidth = cellValue.toString().length;
					}
				}
				colWidths.push({
					width: maxWidth + 4
				}); // Add some padding
			});
			return colWidths;
		},
		Export_Form_Data_to_Excel: function() {

			// Request Sheet
			var view = this.getView();
			var RequestId = view.byId("RequestId").getValue();
			var Year = view.byId("Year").getValue();
			var AssetTitle = view.byId("AssetTitleId").getValue();
			var Description = view.byId("Description").getValue();
			var RequestType = view.byId("RequestTypeId").getSelectedItem();
			RequestType = RequestType.getKey() + " - " + RequestType.getText();
			var Status = view.byId("Status").getValue();
			var CompanyCode = view.byId("CompanyCode").getValue();
			var CreatedById = view.byId("CreatedById").getValue();
			var CreatedOnId = view.byId("CreatedOnId").getValue();
			var ChangedById = view.byId("ChangedById").getValue();
			var ChangedOnId = view.byId("ChangedOnId").getValue();
			var requestData = [
				RequestId, Year, AssetTitle, Description, RequestType, Status, CompanyCode, CreatedById, CreatedOnId, ChangedById, ChangedOnId
			];
			var requestCols = ['RequestId','Year','FiAssetTitle','Description','RequestType','Status','CompanyCode', 'CreatedBy', 'CreatedOn', 'ChangedBy', 'ChangedOn'];
			requestCols = requestCols.map(x => x = Core.i18n.getText(x).split('\t')[0].trim());
			var workbook = XLSX.utils.book_new();
			var requestSheet = XLSX.utils.aoa_to_sheet([requestCols].concat([requestData]));
			requestSheet['!cols'] = new Array(requestCols.length).fill({
				width: 30
			});
			XLSX.utils.book_append_sheet(workbook, requestSheet, Core.i18n.getText("Request"));
			
			
			//PIP Request
			var columns =  view.byId("Project_Update_Request_Table").getColumns();
			var PIP_requestColumns = columns.map(col => col.getLabel().mProperties.text);
			var PIP_request_Data = view.byId("Project_Update_Request_Table").getModel().getData();
			var PIP_request_Data_Copy = JSON.parse(JSON.stringify(PIP_request_Data));
			var PIP_requestData = PIP_request_Data_Copy.map(row => {
				let obj = {};
				PIP_requestColumns.forEach(function(col,i){
					if(columns[i].getTemplate().mBindingInfos.text){
						obj[col] = row[columns[i].getTemplate().mBindingInfos.text.parts[0].path];
					}else if(columns[i].getTemplate().selected){
						obj[col] = row[columns[i].getTemplate().mBindingInfos.selected.parts[0].path];
					}else if(columns[i].getTemplate().mBindingInfos.value){
						obj[col] = row[columns[i].getTemplate().mBindingInfos.value.parts[0].path];
					}else if(columns[i].getTemplate().mBindingInfos.items){
						obj[col] = row[columns[i].getTemplate().mBindingInfos.items.template.mBindingInfos.key.parts[0].path];
					}
				});
				return obj;
			});
			var PIP_request_sheet = PIP_request_Data.length ? XLSX.utils.json_to_sheet(PIP_requestData) : XLSX.utils.aoa_to_sheet([PIP_requestColumns]);
			PIP_request_sheet['!cols'] = this.getColumnWidths(PIP_request_sheet, PIP_requestColumns);
			XLSX.utils.book_append_sheet(workbook, PIP_request_sheet, Core.i18n.getText("ProjectUpdate"));
			
			// Approver 
			var Approver_cols = view.byId("approvertable_id").getColumns().map(col => col.getHeader().getText());
			var approver_BindingInfos = view.byId("approver_BindingInfos").getCells();
			var approver_data = view.byId("approvertable_id").getModel().getData();
			if(approver_data.length == 0 && Core.is_Cross_App === "Y"){
				var workflow_data = Core.AssetRequests_Data[0].EtAtrnw.results;
				if(workflow_data.length > 0){
					approver_data = workflow_data 
				}
			}
			var approver_data_Copy = JSON.parse(JSON.stringify(approver_data));
			var approver_columns = view.byId("approvertable_id").getColumns();
			var approverSheetData = approver_data_Copy.map(row => {
				let obj = {};
				Approver_cols.forEach(function(col, i) {
					if(approver_columns[i].getVisible()){
						if(approver_BindingInfos[i].mBindingInfos.value) {
							obj[col] = row[approver_BindingInfos[i].mBindingInfos.value.parts[0].path];
						} else if(approver_BindingInfos[i].mBindingInfos.selected) {
							obj[col] = row[approver_BindingInfos[i].mBindingInfos.selected.parts[0].path];
						} else if(approver_BindingInfos[i].mAggregations.items) {
							obj[col] = row[approver_BindingInfos[i].mAggregations.items[0].mBindingInfos.src.parts[0].path];
						} else {
							obj[col] = row[approver_BindingInfos[i].mBindingInfos.text.parts[0].path];
						}
					}
				});
				return obj;
			});
			approverSheetData.map(function(x){
				x.Status === "" && (x.Status = "NEW");
				if(x.Remarks.includes("##")){
					x.Remarks = x.Remarks.replaceAll("##", "\n");
				}
			});
			var Approver_cols = view.byId("approvertable_id").getColumns().filter(col => col.getVisible()).map(col => col.getHeader().getText());
			var approver_sheet = approver_data.length ? XLSX.utils.json_to_sheet(approverSheetData) : XLSX.utils.aoa_to_sheet([Approver_cols]);
			approver_sheet['!cols'] = this.getColumnWidths(approver_sheet, Approver_cols);
			XLSX.utils.book_append_sheet(workbook, approver_sheet, Core.i18n.getText("Approver"));
			
			// Export the workbook
			try {
				var RequestId = view.byId("RequestId").getValue();
				var form = view.byId("app_title").getText().replaceAll(" ","_");
				XLSX.writeFile(workbook, `SAP_EAM_${form}_${RequestId}.xlsx`);
				setTimeout(function() {
					sap.m.MessageToast.show("Export is finished");
				}, 100);
			} catch(error) {
				sap.m.MessageToast.show("Export error: " + error.message);
			}
		
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
		/*Calculate_Total_project_Cost : function(opening_balance , current_fy_cost){
			var total_project_cost = "";
			opening_balance = opening_balance.replace(/,/g, "");
			current_fy_cost = current_fy_cost.replace(/,/g, "");
			
			if(opening_balance.endsWith("-") && current_fy_cost.endsWith("-")){
				opening_balance = opening_balance.replace(/-/g, "");
				current_fy_cost = current_fy_cost.replace(/-/g, "");
				total_project_cost = +opening_balance + +current_fy_cost;
				return total_project_cost  = total_project_cost + "" + "-";
			}
			
			if(opening_balance.endsWith("-") ){
				opening_balance = opening_balance.replace(/-/g, "");
				var opening_balance_tmp = +opening_balance;
				current_fy_cost = current_fy_cost.replace(/-/g, "");
				var current_fy_cost_tmp = +current_fy_cost;
				if(opening_balance_tmp >= current_fy_cost_tmp){
					return total_project_cost = opening_balance_tmp - current_fy_cost_tmp;
				}else{
					return total_project_cost = current_fy_cost_tmp - opening_balance_tmp;
				}
			}
			if(current_fy_cost.endsWith("-") ){
				opening_balance = opening_balance.replace(/-/g, "");
				var opening_balance_tmp = +opening_balance;
				current_fy_cost = current_fy_cost.replace(/-/g, "");
				var current_fy_cost_tmp = +current_fy_cost;
				if(current_fy_cost_tmp >= opening_balance_tmp){
					return total_project_cost = current_fy_cost_tmp - opening_balance_tmp;
				}else{
					return total_project_cost = opening_balance_tmp - current_fy_cost_tmp;
				}
			}
			opening_balance = opening_balance.replace(/-/g, "");
			var opening_balance_tmp = +opening_balance;
			current_fy_cost = current_fy_cost.replace(/-/g, "");
			var current_fy_cost_tmp = +current_fy_cost;
			return total_project_cost = opening_balance_tmp + current_fy_cost_tmp;
			
			
		},*/
		Prev_Cur_fy_cost_change : function(oEvent){
			var context = oEvent.getSource().getBindingContext();
			if(context){
				var data = context.getObject();
				var openingBalance = data.Pwf05;
				var currentFYCost = data.Pwf06;
				var totalProjectCost = this.calculateTotalProjectCost(openingBalance,currentFYCost);
				data.Answt = totalProjectCost;
				this.getView().byId("Project_Update_Request_Table").getModel().refresh(true);
				return;
			}
			var openingBalance = Core.byId("Previousyear_Cost_f4").getValue();
			var currentFYCost = Core.byId("CurrentYearCostIncurred_f4").getValue();
			this.calculateTotalProjectCost(openingBalance,currentFYCost);
		},
		calculateTotalProjectCost : function(openingBalance, currentFYCost) {
		    // 1.  Handle null/undefined inputs
		    openingBalance = openingBalance == null ? 0 : openingBalance;
		    currentFYCost = currentFYCost == null ? 0 : currentFYCost;

		    // 2. Convert to string and remove commas
		    let openingBalanceStr = typeof openingBalance === 'number' ? openingBalance.toString() : openingBalance;
		    let currentFYCostStr = typeof currentFYCost === 'number' ? currentFYCost.toString() : currentFYCost;

		    openingBalanceStr = openingBalanceStr.replace(/,/g, '') || "0";
		    currentFYCostStr = currentFYCostStr.replace(/,/g, '') || "0";

		     // 3. Determine sign and convert to number.  Handles trailing "-"
		    let openingBalanceValue = parseFloat(openingBalanceStr.endsWith('-') ? '-' + openingBalanceStr.slice(0, -1) : openingBalanceStr);
		    let currentFYCostValue = parseFloat(currentFYCostStr.endsWith('-') ? '-' + currentFYCostStr.slice(0, -1) : currentFYCostStr);

		     // 4.  Check for invalid numbers after parsing
		    if (isNaN(openingBalanceValue) || isNaN(currentFYCostValue)) {
		        return "0"; // Or throw an error: throw new Error("Invalid input: openingBalance or currentFYCost is not a valid number");
		    }

		    // 5. Calculate total
		    var totalProjectCost = openingBalanceValue + currentFYCostValue;
		    totalProjectCost = Math.round(totalProjectCost);
		    totalProjectCost = totalProjectCost.toString();
		    if(totalProjectCost.startsWith("-")){
		    	totalProjectCost = totalProjectCost.replace(/-/g, '');
		    	totalProjectCost = totalProjectCost + "" + "-";
		    }
		    totalProjectCost = Core.formatter.formatAmount(totalProjectCost);
		    Core.byId("pipbalance_f4").setValue(totalProjectCost);
		    return totalProjectCost;
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
			var previousKey = oEvent.mParameters.previousKey;
			if(key == 'Approver' && previousKey != 'Approver') {
				var status = this.byId("Status").getValue();
				if(status == "NEW") {
					this.byId("approver_refresh_btn").setVisible(true);
				} else {
					this.byId("approver_refresh_btn").setVisible(false);
				}
				var Model = this.getView().byId("approvertable_id").getModel();
				if(Model != undefined) {
					if(Model.getData().length == 0) {
						this.UserMaster(key);
					}
				} else {
					this.UserMaster(key);
				}
			}
		},
		Refresh_UserMaster: function() {
			MessageBox.confirm(Core.i18n.getText("Refresh_UserMasterData"), {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function(sAction) {
					if(sAction == 'YES') {
						Core.that.UserMaster('Approver');
					}
				}
			});
		},
		UserMaster: function(key) {
			var Fyear, Atrnid, Bukrs, Anlkl, Kostl, Werks,Uname, Mass_Data, timeout;
			timeout = 0;
			Atrnid = this.getView().byId("RequestId").getValue();
			if(Core.is_Cross_App == "Y") {
				var Data =  Core.that.get_Url_params();//JSON.parse(decodeURI(window.location.href.split("?")[1]));
				Fyear = Data.Fyear;
				Atrnid = Data.Atrnid;
				Werks = "";
				Bukrs = this.getView().byId("CompanyCode").getSelectedKey();
				Kostl = "";
				Anlkl = "";
			} else {
				Fyear = this.getView().byId("CreatedOnId").getDateValue();
				Fyear = Fyear.getFullYear().toString();
				Atrnid = this.getView().byId("RequestId").getValue();
			}
			if(key == 'Approver') {
				timeout = 100;
				Core.DataLoadProgress.open();
				Werks = "";
				Bukrs = this.getView().byId("CompanyCode").getSelectedKey();
				Kostl = "";
				Anlkl = "";
			}
			Atrnid == "$000000001" ? Uname = Core.O_Login_user.Muser : Uname = Core.Created_By;
			Core.oDataModel = Core.that.oDataModel();
			Core.oDataModel.setHeaders({
				"Muser": Core.O_Login_user.Muser,
				"Uname": Uname,
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
				Core.oDataModel.read("GetUserMasterSet?$expand=EtUserBukrs,EtUserWorkflow,EtUserWgenx&$format=json", null, "", true, function(oData, oResponse) {
					key == 'Approver' && (Core.DataLoadProgress.close());
					var view = Core.that.getView();
					Core.A_UserMasterData = oData.results[0];
					var CompanyCode = Core.A_UserMasterData.EtUserBukrs.results;
					var CompanyCode_Model = new JSONModel(CompanyCode);
					CompanyCode_Model.iSizeLimit = 10000;
					var EtUserWorkflow = Core.A_UserMasterData.EtUserWorkflow.results;
					var EtUserWorkflow_Model = new JSONModel(EtUserWorkflow);
					EtUserWorkflow_Model.iSizeLimit = 10000;
					if(key == 'Approver') {
						Core.that.Disable_Enable_for_Approver_Column();
					}
					if(key != 'Approver' && Core.A_AssetData != undefined) {
						view.byId("CompanyCode").setModel(CompanyCode_Model);
						Core.byId("VhCompanyCodeId").setModel(CompanyCode_Model);
						view.byId("CompanyCode").setSelectedKey(Core.A_AssetData[0].Bukrs);
					} 
					else if(key != 'Approver') {
						view.byId("CompanyCode").setModel(CompanyCode_Model);
						Core.byId("VhCompanyCodeId").setModel(CompanyCode_Model);
						if(CompanyCode.length >= 1) {
							view.byId("CompanyCode").setSelectedKey(CompanyCode[0].Bukrs);
						}
					}
				}, function(err) {
					key == 'Approver' && (Core.DataLoadProgress.close());
					Core.that.HandleError_read(err);
				});
			}, timeout);
		},
		Disable_Enable_for_Approver_Column: function() {
			var EtUserWgenx = [...Core.A_UserMasterData.EtUserWgenx.results],
				// Soring the EtUserWgenx Table in Ascending
				EtUserWgenx = EtUserWgenx.sort((a, b) => a.Seq - b.Seq),
				// Workflow Approver List Data
				User_Workflow = [...Core.A_UserMasterData.EtUserWorkflow.results],
				has_AssetData = Core.AssetRequests_Data,
				// Filtering Neditm and Meditm Where Values not equals to Empty 
				Next_Level_Edits = EtUserWgenx.filter(x => {
					return x.Neditm != '' || x.Meditm != '';
				}),
				Action = 'J',
				Status = this.byId("Status").getValue(),
				Editable = false,
				Current_Sequence = "",
				Wfappr = '',
				Uname = '',
				Wfstatus = 'NEW',
				Remarks = '',
				Next_Rows = [];
			if(User_Workflow.length > 0) {
				for(var i = 0; i < User_Workflow.length; i++) {
					Current_Sequence = User_Workflow[i].Seq;
					// Defaulting Every Row is Disabled in top level
					Editable = false;
					if(Current_Sequence != "" && Current_Sequence != null && Current_Sequence != undefined) {
						// * 1st Condition
						// * Disable Approver column for Requestor
						// If Status is New or Rejected .Check 'Reditm' = 'X'. If So Enable the Input else Disable the Input
						if(Status == "NEW" || Status == "REJT") {
							// Filtering the Record With Current Sequence and Action
							var is_Editable = Core.A_UserMasterData.EtUserWgenx.results.filter(x => {
								return x.Raction == Action && x.Seq == Current_Sequence && x.Doctype == "ASSET";
							});
							// If Reditm = x then Enable Input
							is_Editable.length != 0 && (is_Editable[0].Reditm == "X" && (Editable = true));
						}
						// * 2nd Condition
						// *Disable/Enable Approver column based on workflow rules
						// Check Next Level Edits Avialbale
						if(Next_Level_Edits.length != 0 && Status == "WAPPR" && has_AssetData != undefined) {
							var EtWflogr = has_AssetData[0].EtWflogr.results;
							// *Check if current user is approver
							EtWflogr = EtWflogr.filter(function(x) {
								return x.Wfappr == Core.O_Login_user.Muser && x.Wfstatus == "WAPPR" && x.Sequence == Current_Sequence;
							});
							if(EtWflogr.length != 0) {
								// Filter Current User has Next Editable rows
								var Next_Rows = Next_Level_Edits.filter(function(x) {
									return x.Seq == Current_Sequence;
								});
								// If Current User has Next Level Edits then Disable the Input
								Next_Rows.length != 0 && (Editable = false);
							}
						}
						// * 3rd Condition
						// Disable Approver Column if Workflow is already triggered for Current Workflow Sequence
						if(Status != "NEW" && has_AssetData != undefined) {
							Wfappr = '',
								Uname = '';
							// Check Workflow log Table data is available
							var EtWflogr = has_AssetData[0].EtWflogr.results;
							EtWflogr = EtWflogr.filter(function(x) {
								x.Sequence == Current_Sequence
							});
							if(EtWflogr.length != 0) {
								if(EtWflogr[0].Wfstatus == "WAPPR" || EtWflogr[0].Wfstatus == "APPR") {
									Wfappr = EtWflogr[0].Wfappr;
									// Filtering for Uname with Current Sequence
									var arr_Uname = User_Workflow.filter(function(x) {
										return x.Seq == Current_Sequence;
									});
									arr_Uname.length != 0 && (Uname = arr_Uname[0].Uname);
									// If Workflow Approver is equals to Uname then disable the Input
									Wfappr == Uname && (Editable = false);
								}
							}
						}
					}
					// if Current User has Editable rows then check for each sequence and enable the input
					var is_row_found = Next_Rows.find(x => {
						return x.Neditm == Current_Sequence || x.Meditm == Current_Sequence;
					});
					is_row_found && (Editable = true);
					User_Workflow[i].Editable = Editable;
					
					// Below Logic is to show Workflow Status for each level
					
					// Update the workflow status and remarks for the current user workflow entry
					User_Workflow[i].Wfstatus = Wfstatus; // Set the workflow status
					User_Workflow[i].Remarks = Remarks; // Set any remarks associated with the workflow

					// Check if there is asset data available and the status is not "NEW"
					if (has_AssetData !== undefined && Status !== "NEW") {
					    // Extract workflow log data and filter by current sequence
					    var EtWflogr = JSON.parse(JSON.stringify(has_AssetData[0].EtWflogr.results)); // Extracting workflow log data
					    var _adata = EtWflogr.filter(x => x.Sequence === Current_Sequence); // Filter log data by current sequence

					    // Function to convert date and time strings to timestamps
					    function getTimestamp(dateStr, timeStr) {
					        // Concatenate date and time strings in ISO format
					        var yyyy_mm_dd = `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`; // Extract year, month, and day
					        var time = `${timeStr.substr(0, 2)}:${timeStr.substr(2, 2)}:${timeStr.substr(4, 2)}`; // Extract hours, minutes, and seconds
					        // Create Date objects for date and time
					        var date = new Date(yyyy_mm_dd);
					        var time = new Date(`${yyyy_mm_dd}T${time}`);
					        // Return sum of milliseconds since epoch for date and time
					        return date.getTime() + time.getTime();
					    }

					    // Function to compare timestamps for sorting
					    function compareTimestamp(a, b) {
					        // Get timestamps for each log entry
					        var timestampA = getTimestamp(a.Rdate, a.Rtime); // Timestamp for log entry A
					        var timestampB = getTimestamp(b.Rdate, b.Rtime); // Timestamp for log entry B
					        // Compare timestamps in descending order
					        return timestampB - timestampA;
					    }

					    // Sort log data based on timestamp in descending order
					    _adata.sort(compareTimestamp);

					    // If log data is available, update workflow status and remarks
					    if (_adata.length > 0) {
					        User_Workflow[i].Wfstatus = _adata[0].Wfstatus; // Set workflow status from latest log entry
					        User_Workflow[i].Remarks = _adata[0].Remarks; // Set remarks from latest log entry
					    } else {
					        // If no log data is available, set default workflow status
					        User_Workflow[i].Wfstatus = "WAPPR"; // Set default workflow status as "WAPPR" (waiting for approval)
					    }
					 // Check if current Wfstatus is the first or previous workflow status is "WAPPR"
						if (User_Workflow[0].Wfstatus == "WAPPR" || (i > 0 && User_Workflow[i - 1].Wfstatus === "WAPPR")){
						    // Set workflow status to "WAPPR" and clear remarks
						    User_Workflow[i].Wfstatus = "WAPPR"; // Set workflow status as "WAPPR" (waiting for approval)
						    User_Workflow[i].Remarks = ""; // Clear any existing remarks associated with the workflow
						}
					}
				}
			}
			// Finally binding the Model here
			this.byId("approvertable_id").setModel(Core.that.sModel(User_Workflow));
		},
		ApprTable_LiveChange: function(oEvent) {
			var id = oEvent.getSource().sId;
			var value = oEvent.mParameters.newValue;
			Core.byId(id).setValue(value);
		},
		Clear_UserData: function(oEvent) {
			Core.byId("username_id").setValue("");
			Core.byId("firstname").setValue("");
			Core.byId("lastname").setValue("");
			if(oEvent.oSource.sId == "Clear_User") {
				Core.byId("SearchUsertitle").setText(Core.i18n.getText('ApproverList'));
			} else {
				Core.byId("Users_table_id").clearSelection();
				Core.byId("UsertablePanel").setVisible(false);
			}
		},
		UserSearch_ValueHelp: function(oEvent) {
			Core.OpenedApprover_id = oEvent.oSource.sId;
			Core.User_Data = oEvent.getSource().getBindingContext().getObject();
			Core.F4_Search_User.open();
			this.Serach_User();
		},
		Close_UserSearch: function() {
			Core.F4_Search_User.close();
		},
		Add_User: function(oEvent,_recieved_data) {
			var UserTableData = _recieved_data,Users_table,SelectedContext,SelectedContextLength = 1;
			if(!_recieved_data){
				 Users_table = Core.byId("Users_table_id");
				 SelectedContext = Users_table.getSelectedIndices();
				 SelectedContextLength = SelectedContext.length;
			}
			if(SelectedContextLength == 0) {
				var Msg = Core.i18n.getText("selectRecord");
				MessageBox.information(Msg);
				return false;
			}
			var approvertable_Model = Core.that.byId("approvertable_id").getModel();
			if(!_recieved_data){
				UserTableData = Users_table.getContextByIndex(Users_table.getSelectedIndices()[0]).getObject();
			}
			Core.User_Data.Uname = UserTableData.Uname;
			Core.User_Data.McNamefir = UserTableData.Vnamc;
			Core.User_Data.McNamelas = UserTableData.Nchmc;
			approvertable_Model.refresh(true);
			Core.F4_Search_User.close();
		},
		Serach_User: function() {
			var Username = Core.byId("username_id").getValue();
			var firstname = Core.byId("firstname").getValue();
			var lastname = Core.byId("lastname").getValue();
			var Action = 'J';
			var Filters = [];
			var Headers = {};
			Username != '' && Filters.push("Uname eq '".concat(Username).concat("'"));
			firstname != '' && Filters.push("Vnamc eq '".concat(firstname).concat("'"));
			lastname != '' && Filters.push("Nchmc eq '".concat(lastname).concat("'"));
			Core.User_Data.Werks != '' && Filters.push("Werks eq '".concat(Core.User_Data.Werks).concat("'"));
			Core.User_Data.Bukrs != '' && Filters.push("Bukrs eq '".concat(Core.User_Data.Bukrs).concat("'"));
			Core.User_Data.Seq != '' && Filters.push("Seq eq '".concat(Core.User_Data.Seq).concat("'"));
			Core.User_Data.Kostl != '' && Filters.push("Kostl eq '".concat(Core.User_Data.Kostl).concat("'"));
			Filters.push("Action eq '".concat(Action).concat("'"));
			Filters.push("Pkv eq '".concat('W').concat("'"));
			if(Filters.length > 0) {
				Filters = Filters.toString();
				Filters = Filters.split(',').join(' and ');
				Filters = encodeURIComponent(Filters);
			}
			var url = this.getService_Url("SearchPKVDISet", Headers, Filters);
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			Core.DataLoadProgress.open();
			//Core.byId("SearchUserPanel").setExpanded(false);
			Core.byId("UsertablePanel").setVisible(true);
			setTimeout(function() {
				Core.oDataModel = Core.that.oDataModel();
				Core.oDataModel.read(url, null, "", true, function(oData, response) {
					var response_data = oData.results;
					var Title = Core.i18n.getText('ApproverList');
					if(response_data.length == 0) {
						var Msg = Core.i18n.getText("NoDataMsg");
						MessageBox.information(Msg);
						Core.byId("Users_table_id").setModel(Core.that.Empty_Model);
						Core.byId("SearchUsertitle").setText(Title);
					} else {
						var EtPkvSearch_data = response_data[0].EtPkvSearch.results;
						Core.byId("Users_table_id").setModel(Core.that.sModel(EtPkvSearch_data));
						Core.byId("SearchUsertitle").setText(Title + " (" + EtPkvSearch_data.length + ")");
					}
					Core.DataLoadProgress.close();
				}, function(err) {
					Core.that.HandleError_read(err);
				});
			}, 500);
		},
		onCostCenter_ValueHelpRequest: function(oEvent) {
			Core.OPened_CostCenter_id = oEvent.oSource.sId;
			var sInputValue = oEvent.getSource().getValue();
			var EtCompanyCode = Core.A_UserMasterData.EtUserBukrs.results;
			var VhCompanyCode = Core.byId("VhCompanyCodeId").getSelectedKey();
			var list = Core.byId("select_CostCenter_list").getBinding("items");
			var len;
			if(Core.OPened_CostCenter_id.includes('xmlview')) {
				Core.OPened_CostCenter_id = oEvent.oSource.sId.split("--")[1];
			}
			if(EtCompanyCode.length > 1) {
				var aFilters = [];

				function ApplyFilter(CompanyCode) {
					aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, CompanyCode));
					return new sap.ui.model.Filter(aFilters, false);
				}
				if(Core.OPened_CostCenter_id == "VhCostCenterId") {
					list.filter(ApplyFilter(VhCompanyCode), "Application");
				} 
			}
			len = list.aIndices.length;
			Core.F4_CostCenter.open();
			Core.byId("select_CostCenter_list-searchField").setValue();
			Core.byId("select_CostCenter_list-dialog-title").setText(`${Core.i18n.getText("CostCenter")} (${len})`);
			
			/*Core.OPened_CostCenter_id = oEvent.oSource.sId;
			var sInputValue = oEvent.getSource().getValue();
			if(Core.OPened_CostCenter_id.includes('xmlview')) {
				Core.OPened_CostCenter_id = oEvent.oSource.sId.split("--")[1];
			}
			Core.F4_CostCenter.open(sInputValue);
			var len = Core.byId("select_CostCenter_list").getBinding('items').aIndices.length;
			Core.byId("select_CostCenter_list-dialog-title").setText(`${Core.i18n.getText("CostCenter")} (${len})`);*/
			//this.onCostCenter_Search();
		},
		onCostCenter_Search: function(oEvent) {
			var query = Core.byId("select_CostCenter_list-searchField").getValue(); //oEvent.getParameter('value');
			var list = Core.byId("select_CostCenter_list");
			if(list != undefined) {
				var binding = list.getBinding("items");
				if(!query) {
					binding.filter([]);
				} else {
					binding.filter([new sap.ui.model.Filter([
						new sap.ui.model.Filter("Kostl", sap.ui.model.FilterOperator.Contains, query),
						new sap.ui.model.Filter("Ktext", sap.ui.model.FilterOperator.Contains, query),
						new sap.ui.model.Filter("Customfield", sap.ui.model.FilterOperator.Contains, query),
					], false)])
				}
				Core.byId("select_CostCenter_list-dialog-title").setText(`${Core.i18n.getText("CostCenter")} (${binding.aIndices.length})`);
			}
		},
		onCostCenter_DialogClose: function(oEvent) {
			var aItem = oEvent.getParameter("selectedItem");
			var aContext = oEvent.getSource().getBinding("items");
			if(aItem) {
				aItem = aItem.getBindingContext().getObject();
				if(this.getView().byId(Core.OPened_CostCenter_id) != undefined) {
					this.getView().byId(Core.OPened_CostCenter_id).setSelectedKey(aItem.Kostl);
				} else {
					Core.byId(Core.OPened_CostCenter_id).setSelectedKey(aItem.Kostl);
				}
			}
			aContext != undefined && aContext.filter([]);
			if(oEvent.getSource().mProperties.text == "Clear") {
				var id = Core.OPened_CostCenter_id;
				var v = Core.that.byId(id);
				var c = Core.byId(id);
				if(v != undefined) {
					v.setSelectedKey();
				} else if(c != undefined) {
					c.setSelectedKey();
				}
			}
			Core.F4_CostCenter._oDialog.close();
		},
		Ageing_Validate: function(oEvent) {
			var id = oEvent.oSource.sId;
			id.includes('xmlview') && (id = id.split("--")[1]);
			if(id === "Ageing_calc"){
				var Reporting_date = Core.byId("ReportingDate_f4").getValue();
				var StartingDate_FirstSettlement = Core.byId("StartingDate_FirstSettlement_f4").getValue();
				var StartingDate_Adjusted = Core.byId("StartingDate_Adjusted_f4").getValue();
			}else{
				var data = oEvent.getSource().getBindingContext().getObject();
				var completion_date = data.Compd,
					StartingDate_Adjusted = data.Pipsdateadj,
					StartingDate_FirstSettlement = data.Pipsdatestt,
					Reporting_date = data.Repdate;
			}
			
			if((StartingDate_FirstSettlement == "" || StartingDate_FirstSettlement == null) && (StartingDate_Adjusted == "" || StartingDate_Adjusted == null)) {
				MessageBox.warning(Core.i18n.getText("EnterStartingDate(FirstSettlement)"));
				return false;
			} else if(Reporting_date == "" || Reporting_date == null) {
				MessageBox.warning(Core.i18n.getText("EnterReportingDate"));
				return false;
			} else {
				var Dageing = "";
				if (Reporting_date && StartingDate_Adjusted) {
					Dageing = this.Calculate_Ageing(StartingDate_Adjusted, Reporting_date) || "";
				} else if (Reporting_date && StartingDate_FirstSettlement) {
					Dageing = this.Calculate_Ageing(StartingDate_FirstSettlement, Reporting_date) || "";
				} else {
					Dageing = "";
				}
			//	var Dageing = this.Calculate_Ageing(completion_date, Reporting_date);
				Dageing = Dageing.replace('-', '');
				if(id === "Ageing_calc"){
					Core.byId("Ageing_f4").setValue(Dageing);
					return false;
				}
				data.Dageing = Dageing;
				this.getView().byId("Project_Update_Request_Table").getModel().refresh(true);
			}
		},
		Apply_Filter_Functionto_dropdowns: function() {
			if(Core.F4_AssetSearch != undefined){
				var view_dropdowns = ["CompanyCode"];
				var f4_dropdowns = ["VhCompanyCodeId","VhPlantCodeId","VhAssetClassId","VhLocationId"];
				var drop_downs_arr = [...f4_dropdowns,...view_dropdowns];
				var drop_down;
				drop_downs_arr.forEach(id => {
					var v = Core.that.getView().byId(id);
					var c = Core.byId(id);
					v != undefined ? drop_down = v : drop_down = c;
					drop_down.setFilterFunction((sText, oEvents) => {
						return oEvents.getText().match(new RegExp(sText, "i")) || oEvents.getKey().match(new RegExp(sText, "i"));
					})
				})
			}else{
				setTimeout(() => {
					Core.that.Apply_Filter_Functionto_dropdowns();
				},2000);
			}
		},
		OnReporting_Complete_dateChange: function(oEvent) {},
		Approve_Press: function(oControlat) {
			// Extracting relevant data
			var etWflogrData = Core.AssetRequests_Data[0].EtWflogr.results;
			var assetReqData = Core.A_AssetData[0];
			// Initialize messages
			var errorMessages = "";
			var statusMessages = "";
			var message = "";
			// Check if the status is 'WAPPR' with selected_row year and Request Id
			var isWorkflowApprover = etWflogrData.filter(item => (item.Wfstatus === "WAPPR" && item.Fyear === assetReqData.Fyear && item.Atrnid === assetReqData.Atrnid));
			if(isWorkflowApprover.length > 0 && assetReqData.Rstatus === "WAPPR") {
				// Check if the current user is a workflow approver
				if(isWorkflowApprover[0].Wfappr !== Core.O_Login_user.Muser) {
					message = `User ${Core.O_Login_user.Muser} is not the approver for Request ID ${assetReqData.Atrnid}`;
					errorMessages += `\n${message}`;
				}
			} else {
				statusMessages += `\n${Core.i18n.getText("StatusMsg")} for Request ID ${assetReqData.Atrnid}`;
			}
			// Display status or error messages if any
			var showMessage = (messages, controlAt) => {
				if(messages !== "") {
					if(controlAt === "visibility") {
						return false;
					}
					MessageBox.information(messages);
					return false;
				}
				return true;
			};
			if(!showMessage(statusMessages, oControlat) || !showMessage(errorMessages, oControlat)) {
				return false;
			}
			if(oControlat === "visibility") {
				return true;
			}
			var is_Save_Enabled = this.getView().byId("Save_btn").getVisible();
			if(is_Save_Enabled){
				var view = this.getView();
				var RequestId = view.byId("RequestId").getValue();
				var AssetTitle = view.byId("AssetTitleId").getValue();
				var Name = view.byId("NameId").getValue();
				var RequestType = view.byId("RequestTypeId").getSelectedKey();
				var Year = this.getView().byId("CreatedOnId").getDateValue();
				Year = Year.getFullYear().toString();
				var Description = view.byId("Description").getValue();
				var Status = view.byId("Status").getValue('NEW');
				var StaffNo = view.byId("StaffNoId").getValue();
				var CompanyCode = view.byId("CompanyCode").getSelectedKey();
				var DocTabelModel = Core.byId("AttachmentTabel").getModel();
				var DocTabelData = [];
				if(AssetTitle == "") {
					Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
					MessageBox.information(Core.i18n.getText("AssetTitleMandatoryTxt"));
					return false;
				}
				if(CompanyCode === "") {
					Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
					MessageBox.information(Core.i18n.getText("EnterCompanyCode"));
					return false;
				}
				if(DocTabelModel != undefined) {
					DocTabelData = DocTabelModel.getData();
				}
				var Update_request_data = [];
				var _Validate_Flag = this.Define_validations();
				var Project_Update_Request_Model = this.getView().byId("Project_Update_Request_Table").getModel();
				if(Project_Update_Request_Model != undefined) {
					Project_Update_Request_Model.refresh(true);
					var Update_request_data = [...Project_Update_Request_Model.getData()];
				}
				if(_Validate_Flag == true) {
					if(Project_Update_Request_Model == undefined) {
						Core.that.getView().byId("Update_Tabbar").setSelectedKey("PIP Request");
						MessageBox.warning(Core.i18n.getText("AddatleaseoneRecord"));
						return false;
					} else if(Update_request_data.length == 0) {
						Core.that.getView().byId("Update_Tabbar").setSelectedKey("PIP Request");
						MessageBox.warning(Core.i18n.getText("AddatleaseoneRecord"));
						return false;
					}
				}
				var length = Update_request_data.length;
				var Data = Update_request_data.concat(Core.Deleted_Records);
				var Messages = [];
				var Message_obj = {};
				Data.map(function(x, i, a) {
					Message_obj = {};
					var _row = i + 1
					Message_obj.text = '';
					(x.Pspid == '' || x.Pspid == undefined) && (Message_obj.text = Message_obj.text.concat(' Project No,'));
				//	(x.Wert1 == '' || x.Wert1 == undefined) && (Message_obj.text = Message_obj.text.concat(' Approved Budget,'));
				//	(x.Yepcost == '' || x.Yepcost == undefined) && (Message_obj.text = Message_obj.text.concat(' YEP,'));
					(x.Compd == '' || x.Compd == null) && (Message_obj.text = Message_obj.text.concat(' Completion Date,'));
					(x.Pipsdatestt == '' || x.Pipsdatestt == null) && (Message_obj.text = Message_obj.text.concat(' Starting Date(First Settlement),'));
				//	(x.Repdate == '' || x.Repdate == null) && (Message_obj.text = Message_obj.text.concat(' Reporting Date,'));
				//	(x.Rcompd == '' || x.Rcompd == null) && (Message_obj.text = Message_obj.text.concat(' Revised Completion Date,'));
					(x.Prozs == '' || x.Prozs == undefined) && (Message_obj.text = Message_obj.text.concat(' % of Completion,'));
					(x.Prozs > 100 ) && (Message_obj.text = Message_obj.text.concat(' % Cannot be greater than 100,'));
				//	(x.Pstatus == '' || x.Pstatus == undefined) && (Message_obj.text = Message_obj.text.concat(' Status,'));
					if(Message_obj.text != '') {
						Message_obj.text.endsWith(',') && (Message_obj.text = Message_obj.text.substring(0, Message_obj.text.length - 1));
						if(Message_obj.text == ' % Cannot be greater than 100,'){
							Message_obj.text = 'Row ' + _row  + Message_obj.text;
						}else{
							Message_obj.text = 'Row ' + _row + ' Required' + Message_obj.text;
						}
						Messages.push(Message_obj);
					}
				});
				if(Messages.length > 0 && _Validate_Flag == true) {
					Core.byId("Msg_icon").removeStyleClass("ResponseIconColorSuccess");
					Core.byId("Msg_icon").addStyleClass("ResponseIconColorError");
					Core.byId("Msg_icon").setSrc("sap-icon://error");
					Core.byId("MessageViewTitleId").setText(Core.i18n.getText("Error"));
					Core.byId("MessaheViewListId").setModel(Core.that.sModel(Messages));
					Core.F4_MessageView.open();
					return false;
				}
			}
			
			// Call the on_Submit_for_approval function with "APPR" parameter
			this.Workflow_oEntity = Core.that.SubmitAction("APPR");
			if(typeof(this.Workflow_oEntity) === "object") {
				var confirmation_message = Core.i18n.getText("confirmApprove");
				//	Action == "REJT" && (msg = Core.i18n.getText("confirmReject"));
				// Display confirmation dialog
				MessageBox.confirm(confirmation_message, {
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function(sAction) {
						if(sAction === 'YES') {
							Core.byId("RemarksId").setValue();
							Core.that.FORM_ACTION = "APPR";
							Core.F4_EnterRemarks.open();
							return false;
						}
					}
				});
			}
		},
		Reject_Press: function(oControlat) {
			// Extracting relevant data
			var etWflogrData = Core.AssetRequests_Data[0].EtWflogr.results;
			var assetReqData = Core.A_AssetData[0];
			// Utility function to display MessageBox if needed
			function showMessage(message, controlAt) {
				if(controlAt === "visibility") {
					return false;
				}
				MessageBox.information(message);
				return false;
			}
			// Validation check for Rstatus
			if(assetReqData.Rstatus !== "WAPPR") {
				var statusMessage = `\n${Core.i18n.getText("StatusMsg")} for Request ID ${assetReqData.Atrnid}`;
				return showMessage(statusMessage, oControlat);
			}
			// Validation check for workflow approver
			var data = etWflogrData.filter(x => x.Wfstatus === "WAPPR" && x.Fyear === assetReqData.Fyear && x.Atrnid === assetReqData.Atrnid);
			if(data.length > 0 && data[0].Wfappr !== Core.O_Login_user.Muser) {
				var errorMessage = `User ${Core.O_Login_user.Muser} is not an approver for Request ID ${assetReqData.Atrnid}`;
				return showMessage(`\n${errorMessage}`, oControlat);
			}
			if(oControlat === "visibility") {
				return true;
			}
			// Call the on_Submit_for_approval function with "REJT" parameter
			this.Workflow_oEntity = Core.that.SubmitAction("REJT");
			if(typeof(this.Workflow_oEntity) === "object") {
				var confirmation_message = Core.i18n.getText("confirmReject");
				// Display confirmation dialog
				MessageBox.confirm(confirmation_message, {
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function(sAction) {
						if(sAction === 'YES') {
							Core.byId("RemarksId").setValue();
							Core.that.FORM_ACTION = "REJT";
							Core.F4_EnterRemarks.open();
							return false;
						}
					}
				});
			}
		},
		Approve_Reject_Workflow: function(remarks) {
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			var oEntity = this.Workflow_oEntity;
			var status = oEntity.ItWorkFlowLog[0].Wfstatus;
			// open busy Indicator based on Request status
			status == "APPR" && Core.ApproveProgress.open();
			status == "REJT" && Core.RejectProgress.open();
			this.FORM_ACTION = "";
			setTimeout(function() {
				remarks = remarks.replace(/\n/g, '##');
				Core.oDataModel = Core.that.oDataModel();
				Core.oDataModel.setHeaders({
					"ivdoctype": "ASSET",
					"ivremarks": remarks,
					"ivwfstatus": status
				});
				Core.oDataModel.create("WorkflowMaintainSet", oEntity, null, function(oData, response) {
					// close busy Indicator based on Request status
					status == "APPR" && Core.ApproveProgress.close();
					status == "REJT" && Core.RejectProgress.close();
					// Read success or Error From Odata Response
					var Resp_Error = oData.EtMessage.results[0].EvError;
					var title;
					// Set Title Based on Flag
					Core.byId("RemarksId").setValue("");
					if(Resp_Error == null) {
						Core.F4_EnterRemarks.open();
						return false;
					} else if(Resp_Error == true) {
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
					Core.byId("MessageViewTitleId").setText(title);
					Core.byId("MessaheViewListId").setModel(Core.that.sModel(ErrorMsg));
					Core.F4_MessageView.open();
					// If success Show and bind request id from response
					if(Resp_Error == false) {
						Core.Navto_Launchpad = "X";
						Core.that.ClearData();
					}
					Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
				}, function(err) {
					Core.that.HandleError_post(err);
				});
			}, 100);
		},
		on_Recall_Press : function(){
			var view = Core.that.getView();
			var Activity = view.byId("RequestTypeId").getSelectedKey();
			var RequestId = view.byId("RequestId").getValue();
			var CompanyCode = view.byId("CompanyCode").getSelectedKey();
			var Status = view.byId("Status").getValue();
			var Year = this.getView().byId("CreatedOnId").getDateValue();
			Year = Year.getFullYear().toString();
			var has_Project_Update_Request_Table_Model = view.byId("Project_Update_Request_Table").getModel();
			if(has_Project_Update_Request_Table_Model != undefined) {
				if(has_Project_Update_Request_Table_Model.getData().length != 0) {
					CompanyCode = has_Project_Update_Request_Table_Model.getData()[0].Bukrs;
				}
			}
			var oEntity = {
				"Atrnid": RequestId,
				"Fyear": Year,
				"Doctype":"ASSET",
				"Activity": Activity,
				"Rstatus": Status,
				"Bukrs": CompanyCode,
				 "IsWfstatus" : [{
				"IvWfstatus":"",
				"IvRemarks":"",
				}],
				"EtMessage" : [{ }],
				"EtReturn"  : [{ }]
				}
			function Recall (){
				Core.ReCallProgress.open();
				setTimeout(function() {
					Core.oDataModel = Core.that.oDataModel();
					Core.oDataModel.create("RecallWorkflowSet", oEntity, null, function(oData, response) {
						Core.ReCallProgress.close();
						// Read success or Error From Odata Response
						var Resp_Error = oData.EtReturn.results[0].Type === "E";
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
						for(var i = 0; i < oData.EtReturn.results.length; i++) {
							var obj = {
								text: oData.EtReturn.results[i].Message
							};
							ErrorMsg.push(obj);
						}
						Core.byId("MessageViewTitleId").setText(title);
						Core.byId("MessaheViewListId").setModel(Core.that.sModel(ErrorMsg));
						Core.F4_MessageView.open();
						Core.that.getView().byId("Update_Tabbar").setSelectedKey("Request");
						// If success Show and bind request id from response
						if(Resp_Error == false) {
							Core.Navto_Launchpad = "X";
							Core.that.ClearData();
						}
					}, function(err) {
						Core.that.HandleError_post(err);
					});
				}, 500);
				
			}
			MessageBox.confirm(Core.i18n.getText("confirmRecall"), {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function(sAction) {
					if(sAction === 'YES') {
						Recall();
						return false;
					}
				}
			});
		},
	});
});