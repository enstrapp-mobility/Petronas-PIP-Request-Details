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
		HandleError_post: function(err) {
			var dialogs = [
			    Core.DataSaveProgress,
			    Core.DataSubmitProgress,
			    Core.ApproveProgress,
			    Core.RejectProgress,
			    Core.ReCallProgress
			];

			dialogs.forEach(function(dialog) {
			    if (dialog && dialog._oDialog && dialog._oDialog.isOpen()) {
			        dialog.close();
			    }
			});

			var errorMessages = {
			    "401": Core.i18n.getText("SAP401msg"),
			    "400": Core.i18n.getText("SAP400MSG"),
			    "500": Core.i18n.getText("SAP500MSGResubmit"),
			    default: Core.i18n.getText("SAP408Timeoutmsg")
			};

			var statusCode = err && err.response && err.response.statusCode;
			var errorMessage = errorMessages[statusCode] || errorMessages.default;
			var message = errorMessage;
			var _Gateway_Log = "";

			if (err && err.response) {
			    message += `\n${err.response.statusText} | Error Code: ${statusCode}`;
			}
			try {
				_Gateway_Log = JSON.parse(err.response.body).error.message.value;
				 message += `\n${_Gateway_Log}`;
			} catch (error) {
				console.log(error);
			} 
			sap.m.MessageBox.error(message);
			this._Gateway_Exception_log(err,message , "POST");
			return false;
		},
		HandleError_read: function(err) {
			Core.DataLoadProgress.close();
			var _Message = `${err.response.statusText} | Error Code: ${err.response.statusCode}`;
			var _Gateway_Log = "";
			try {
				_Gateway_Log = JSON.parse(err.response.body).error.message.value;
				_Message += `\n${_Gateway_Log}`;
			} catch (error) {
				console.log(error);
			} 
			sap.m.MessageBox.error(_Message);
			this._Gateway_Exception_log(err,_Message , "GET");
			return false;
		},
		_Gateway_Exception_log : function(err, message, method){
			var Request_ID = this.getView().byId("RequestId").getValue();
			var statusCode = err.response.statusCode;
			var gateway_message = message;
			var _date = new Date();

			// Format hours and minutes with AM/PM
			let hours = _date.getHours();
			let minutes = _date.getMinutes();
			const TimeZone = hours >= 12 ? 'PM' : 'AM';
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			minutes = minutes < 10 ? '0' + minutes : minutes;
			var timeString = hours + ':' + minutes + ' ' + TimeZone;

			// Format date as dd-mmm-yyyy
			const monthNames = [
			    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
			    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			];
			var day = String(_date.getDate()).padStart(2, '0'); // Pad day with leading zero if needed
			var month = monthNames[_date.getMonth()]; // Get month name from the array
			var year = _date.getFullYear(); // Get full year
			var dateString = `${day}-${month}-${year}`;

			// Create a new entry with a timestamp
			var newEntry = {
				RequestId : Request_ID,
			    statusCode: statusCode,
			    method : method,
			    gateway_message: gateway_message,
			    dateString: dateString,
			    timeString: timeString,
			    appname : Core.i18n.getText("appTitle"),
			    userid : Core.O_Login_user ? `${Core.O_Login_user.Muser} - ${Core.O_Login_user.FullName}` : "",
			    timestamp: _date.getTime() 
			};
			// Retrieve existing log from localStorage
			var existing_GatewayLog = localStorage.getItem("GatewayLog");
			var arr = existing_GatewayLog ? JSON.parse(existing_GatewayLog) : [];

			// Add the new entry to the array
			arr.push(newEntry);

			// Filter out entries older than 6 months
			const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000; // Approximate milliseconds in 6 months
			var now = new Date().getTime(); // Current timestamp in milliseconds
			arr = arr.filter(entry => (now - entry.timestamp) <= SIX_MONTHS_MS);

			// Save the updated array back to localStorage
			localStorage.setItem("GatewayLog", JSON.stringify(arr));
			
			
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
        showPage : function() {
        	setTimeout(function(){
				var wrapper =	document.querySelector('.wrapper');
				wrapper.classList.add("fade");
				},50)
        },
        Calculate_Ageing : function(CompletionDate,ReportingDate){
        	var d1,d2,difference;
            
        	d1 = Core.DateFormat_ddMMMyyyy.format(new Date(CompletionDate));
        	d2 = Core.DateFormat_ddMMMyyyy.format(new Date(ReportingDate));
        	
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
		Long_Text_Format(RequestId, Year, Description, Tdid, Fenum) {
			var Arr = [],
				Description_length = Description.length,
				has_newLines = Description.includes("\n"),
				parts;
			Tdid == undefined ? Tdid = "" : Tdid = Tdid;
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
									"Tdname": Fenum,
									"Tdid": Tdid,
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
					"Tdname": Fenum,
					"Tdid": Tdid,
					"Tdformat": "",
					"Tdline": is_array ? parts[d].trim() : Description
				};
				Arr.push(desc_obj);
			}
			return Arr;
		},
		Define_validations: function() {
			// Get the value of the status from the view
			var _status = Core.that.getView().byId("Status").getValue();
			// Check if the status is "NEW" or "REJT"
			// If so, no data checks 
			if(_status == "NEW" || _status == "REJT") {
				return false;
			}
			// Initialize a flag for data checks
			var _bDatachecks = true;
			// Get the current user 
			var currentUser = Core.O_Login_user.Muser;
			// Get the current activity from the asset data
			var Activity = Core.A_AssetData !== undefined ? Core.A_AssetData[0].Activity : "";
			// Retrieve the manifest file of the component
			var oManifest = this.getOwnerComponent().getManifest();
			// Get the workflow configuration from the manifest
			var workflowconfig = oManifest["sap.app"].workflowconfig;
			// Find the index of the current activity in the workflow configuration
			var activity_index = workflowconfig.activity.findIndex(x => x === Activity);
			// Get the GFC Preparer sequence for the current activity using the found index
			var gfcp_sequence = workflowconfig.gfcp_sequence[activity_index];
			// Get the workflow agents data from the approver table
			var workflow_agents = Core.that.getView().byId("approvertable_id").getModel().getData();
			// Check if there are no workflow agents rendered in UI
			if(workflow_agents.length === 0) {
				// retrieve workflow agents from a Asset Request data 
				if(Core.AssetRequests_Data != undefined) {
					workflow_agents = Core.AssetRequests_Data[0].EtAtrnw.results;
				}
			}
			// Find the current workflow sequence where the status is "WAPPR"
			var current_workflow_sequence = workflow_agents.find(x => x.Wfstatus === "WAPPR");
			// If a current workflow sequence is found
			if(current_workflow_sequence) {
				// Check if the sequence of the current workflow matches the GFCP sequence
				if(current_workflow_sequence.Seq === gfcp_sequence) {
					_bDatachecks = true; 
				} else {
					_bDatachecks = false; 
				}
			}
			// Return the result of the data checks
			return _bDatachecks;
		},
		Date_format_finder : function(dateString){
			var formats = {
				"mm/dd/yyyy": /^\d{2}\/\d{2}\/\d{4}$/,
				"dd.mm.yy": /^\d{2}\.\d{2}\.\d{2}$/,
				"dd.mm.yyyy": /^\d{2}\.\d{2}\.\d{4}$/,
				"dd-mmm-yyyy": /^\d{2}-[A-Za-z]{3}-\d{4}$/,
				"yyyymmdd": /^\d{8}$/,
				"yyyy-mm-dd": /^\d{4}-\d{2}-\d{2}$/,
				"yyyy-mmm-dd": /^\d{4}-[A-Za-z]{3}-\d{2}$/,
				"dd-mm-yyyy": /^\d{2}-\d{2}-\d{4}$/,
				"yyyy/mm/dd": /^\d{4}\/\d{2}\/\d{2}$/
			};
			var format;
			for(var key in formats) {
				if(formats[key].test(dateString)) {
					format = key;
					break;
				}
			}
			format = format || "Unknown format";
			var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			var typeFormats = {
				"mm/dd/yyyy": function(dateString) {
					return new Date(dateString);
				},
				"dd.mm.yy": function(dateString) {
					var parts = dateString.split(".");
					return new Date("20" + parts[2], parseInt(parts[1]) - 1, parts[0]);
				},
				"dd.mm.yyyy": function(dateString) {
					var parts = dateString.split(".");
					return new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
				},
				"dd-mmm-yyyy": function(dateString) {
					var parts = dateString.split("-");
					return new Date(parts[2], months.indexOf(parts[1]), parts[0]);
				},
				"yyyymmdd": function(dateString) {
				 // Extract year, month, and day components from the yyyymmdd format
				    var year = dateString.substring(0, 4);
				    var month = parseInt(dateString.substring(4, 6));
				    var day = parseInt(dateString.substring(6, 8));
				    // Create a Date object using the extracted components
				    return new Date(year, month - 1, day); // Months are zero-based in JavaScript Date objects
				},
				"yyyy-mm-dd": function(dateString) {
					return new Date(dateString);
				},
				"yyyy-mmm-dd": function(dateString) {
					var parts = dateString.split("-");
					return new Date(parts[0], months.indexOf(parts[1]), parts[2]);
				},
				"dd-mm-yyyy": function(dateString) {
					var parts = dateString.split("-");
					return new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
				},
				"yyyy/mm/dd": function(dateString) {
					var parts = dateString.split("/");
					return new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
				}
			};

				// Parse the dateString based on the format
				var date;
				if(typeFormats.hasOwnProperty(format)) {
					date = typeFormats[format](dateString);
				} else {
					return "";
				}
				try{
					// Format the date to dd-mmm-yyyy
			        var dd = date.getDate().toString().padStart(2, '0');
			        var mmm = months[date.getMonth()];
			        var yyyy = date.getFullYear();
					return  dd + '-' + mmm + '-' + yyyy;
				}catch(e){
					console.log(e);
					return "";
				}
		},
		get_Url_params : function(){
			var fullUrl = window.location.href;
			var urlParts = fullUrl.split("?");
			var queryString = urlParts[1];
			if(queryString) {
				var Data = queryString.replaceAll('&sap-ui-xx-componentPreload=off', '').replaceAll('&sap-ui-debug=true', '');
				try {
					Data = JSON.parse(decodeURI(Data));
				} catch(e) {
					Data = [];
				}
			} else {
				var Data = [];
			}
			return Data;
		},
		Numeric_Livechange_format: function (oEvent) {
		    var id = oEvent.oSource.sId;
		    // Check if the ID contains 'xmlview' and extract the actual ID
		    if (id.includes('xmlview')) {
		        id = oEvent.oSource.sId.split("--")[1];
		    }
		    // Get the UI5 control by ID
		    var v = this.getView().byId(id);
		    var c = Core.byId(id);
		    // Get the maximum length for the input value
		    var max = oEvent.getSource().mProperties.maxLength;
		    // Get the input value from the event parameters
		    var inputvalue = oEvent.getParameters().value;
		    // Remove all non-numeric characters except for the dot (.)
		    var value = inputvalue.replace(/[^0-9.-]/g, '');

		    // Format the value with thousands separators
		    var parts = value.split(".");
		    var integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		    var formattedValue = integerPart;

		    // Include the decimal part if it exists
		    if (parts.length > 1) {
		        formattedValue += "." + parts[1];
		    }

		    // Limit the length of the formatted value
		    var Amount = formattedValue.substring(0, max);

		    // Set the formatted value to the controls if they are defined
		    if (v !== undefined) {
		        v.setDOMValue(Amount);
		    }
		    if (c !== undefined) {
		        c.setDOMValue(Amount);
		    }
		}

	});
});