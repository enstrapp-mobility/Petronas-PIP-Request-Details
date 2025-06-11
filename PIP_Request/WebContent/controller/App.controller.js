sap.ui.define([
	"ZEMT_AM_PUR_APP/controller/BaseController","sap/ui/core/Core"
], function(Controller,Core) {	
	return Controller.extend("ZEMT_AM_PUR_APP.controller.App", {
		onInit:function(){
			Core.busyIndicator = sap.ui.core.BusyIndicator;
			if(window.location.hostname == "localhost"){
				Core.Service_URL = new sUrl("local");
			}else{
				Core.Service_URL = new sUrl("idm");
			}				
			// Date format different types of date
			Core.DateFormat_mmm = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "MMM"});
			Core.DateFormat_ddMMMyyyy = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd-MMM-yyyy"});
			Core.DateFormat_yyyymmdd_ss_hh_mm = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyyMMddssHHmm"});
			Core.DateFormat_yyyy_mmm_dd = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyy-MMM-dd"});
			Core.DateFormat_yyyymmdd = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyyMMdd"});
			Core.DateFormat_yyyyMM = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyyMM"});
			Core.DateFormat_MMM_yyyy = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "MMM-yyyy"});
			Core.DateFormat_yyyy = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyy"});
			Core.DateFormat_year_Month = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "MM/yyyy"});
			Core.DateFormat_yyyy_mm_dd = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyy-MM-dd"});
			Core.TimeFormat_ss_hh_mm = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "ss:HH:mm"});
			}
	});
});