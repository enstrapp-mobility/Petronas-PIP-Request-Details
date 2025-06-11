function sUrl(urlType) {
	this.type = "idm";
	this.LocalUrl = "";
	this.IdmUrl = "/sap/opu/odata/sap/";
	this.host = this.IdmUrl;
	if (urlType == "local") {
		this.host = this.LocalUrl;
	}
	this.getServiceUrl = function(sPath) {
		return this.host + sPath;
	}
}