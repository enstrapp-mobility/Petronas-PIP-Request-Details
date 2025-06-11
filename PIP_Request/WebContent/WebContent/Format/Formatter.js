sap.ui.define(function() {

	var Formatter = {
			formatddmmyyy : function(value) {
				if (value != undefined && value != "" && value != null && value != "00000000") {
					if(value.length == undefined){
						return  sap.ui.getCore().DateFormat_ddMMMyyyy.format(new Date(value));
					}else if(value.length != undefined && value.length == 8){
						var date = sap.ui.getCore().DateFormat_ddMMMyyyy.format(new Date(value.substring(0, 4)+"-"+value.substring(4, 6)+"-"+value.substring(6, 8)));
						return date;
					}else{
						return value;
					}
				}else{
					return "";
				}
			},
		formatDate : function(value) {
			if (value != undefined && value != "") {
				var date = sap.ui.getCore().DateFormat_yyyy_mmm_dd.format(new Date(value));
				return date;
			}
		},
		formatDateMonth : function(value) {
			if (value != undefined && value != "") {
				var date = sap.ui.getCore().DateFormat_yyyy_MMM.format(new Date(value.substring(0, 4)+"-"+value.substring(4, 6)+"-"+value.substring(6, 8)));
				return date;
			}
		},
		StatusIcon: function(value){
			if (value != undefined && value != "") {
				var ingValue = "";
				if(value == "ACTV"){
					ingValue = "Active.PNG";
				}else if(value == "ASEQ"){
					ingValue = "SubAsset.jpeg";
				}else if(value == "AVLB"){
					ingValue = "Avaiable.PNG";
				}else if(value == "BROKEN"){
					ingValue = "Broken.PNG";
				}else if(value == "DELETE"){
					ingValue = "Deletion.PNG";
				}else if(value == "EAUS"){
					ingValue = "FromWarehouse.PNG";
				}else if(value == "ECUS"){
					ingValue = "CustomerSite.PNG";
				}else if(value == "ESTO"){
					ingValue = "InWarehouse.PNG";
				}else if(value == "INAC"){
					ingValue = "Inactive.PNG";
				}else if(value == "INST"){
					ingValue = "Installed.PNG";
				}else if(value == "MISSING"){
					ingValue = "Missing.jpg";
				}else if(value == "OPERATING"){
					ingValue = "Operating.PNG";
				}else{
					ingValue = "Verfied.PNG";
				}
//				return "/MasterDataManagement/images/"+ingValue;
				return "./images/"+ingValue;
			}
		},
		displayOnly : function(){
			if(sap.ui.getCore().A_AssetData != undefined){
				if(sap.ui.getCore().A_AssetData[0].Rstatus != 'NEW'){
					return false;
				}else{
					return true;
				}
			}else{
				return true;
			}
		},
		CheckBox : function(value){
			if (value == "X") {
				return true;
			}else{
				return false;
			}
		},
		materialStatus: function(value){
			if (value != undefined && value != "") {
				var ingValue = "";
				if(value == "COMP" || value == "APPR"){
					ingValue = "green.png";
				}else if(value == "REJT" || value == "CANC"){
					ingValue = "read.png";
				}else if(value == "WAPPR"){
					ingValue = "yellow.png";
				}else{
					ingValue = "orange.png";
				}
				return "./images/"+ingValue;
			}
		},
		Required : function(value){
			if (value == "X") {
				return true;
			}else{
				return false;
			}
		},
		CheckBoxCheck: function(value){
			if (value != undefined && value != "") {
				if(value == "X"){
					return true;
				}else{
					return false;
				}
			}else{
				return false;
			}
		},
		fileSize: function(value) {
			 var Data = "";
			if(value != "" && value != undefined){
				Data = (value / 1024).toFixed(2) + ' KB';
			}
		return Data;
		},
		fileType: function(value) {
			 var Data = "";
			if(value != "" && value != undefined){
				if(value.indexOf("/") != -1){
					Data = value.split("/")[1].toUpperCase();
				}else{
					Data = value;
				}
			}
		return Data;
		},
		DocType : function(doc) {
			if(doc != "" && doc != undefined) {
				doc = doc.toLowerCase();
				if(doc == "jpg" || doc == "jpeg" || doc == "png"){
					return true;
				}
			}
			return false;
		},
		FormatApproverStatus : function(Wfstatus){
			if(Wfstatus === "APPR"){
				this.addStyleClass("Fill_green");
				this.setTooltip("Approved");
			}else if(Wfstatus === "WAPPR" || Wfstatus == ""){
				this.addStyleClass("Fill_yellow");
				this.setTooltip("Pending");
			}else if(Wfstatus === "REJT"){
				this.addStyleClass("Fill_red");
				this.setTooltip("Rejected");
			}else if(Wfstatus === "NEW"){
				this.addStyleClass("Fill_orange");
				this.setTooltip("New");
			}
			return "sap-icon://overlay";
		},
		formatAmount : function(amount){
			try{
				var minus_value = "";
				 // 1. Handle Null and Undefined Input
			    if (amount == null) {  // Catches both null and undefined
			        return "";
			    }

			    // 2. Ensure Input is a String
			    var amountStr = typeof amount === 'number' ? amount.toString() : amount;

			    // 3. Remove Existing Commas
			    amountStr = amountStr.replace(/,/g, '');
			    if(amountStr.includes("-")){
			    	amountStr = amountStr.replace(/-/g, '');
			    	minus_value = "-";
			    }

			    // 4. Handle Empty String
			    if (amountStr === "") {
			        return "";
			    }

			    // 5. Validate as a Number
			    if (isNaN(Number(amountStr))) {
			        return ""; // Or consider throwing an error:  throw new Error("Invalid amount: " + amount);
			    }

			    // 6. Split the number into integer and decimal parts
			    const [integerPart, decimalPart] = amountStr.split('.');

			    // 7. Format the integer part with commas
			    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			    // 8. Combine the formatted integer part with the decimal part (if it exists)
			    const formattedAmount = decimalPart ? `${formattedIntegerPart}.${decimalPart}${minus_value}` : formattedIntegerPart+""+minus_value;


			    return formattedAmount;
			}catch(e){
				return amount;
			}
		},
		FormatRemarks : function(remarks){
			if(remarks){
				if(remarks.includes("##")){
					remarks = remarks.replaceAll("##", "\n");
				}
			}else{
				remarks = "";
			}
			return remarks;
			
		}
	};
	return Formatter;
}, true);