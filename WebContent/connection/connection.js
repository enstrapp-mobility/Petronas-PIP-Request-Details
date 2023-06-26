function sUrl(urlType) {
	// DEV proxy/http/152.63.2.109:8001/sap/opu/odata/sap/
	this.type = "idm";
	this.LocalUrl = "proxy/https/ed9.enstrapp.com/sap/opu/odata/sap/";
	this.IdmUrl = "/sap/opu/odata/sap/";
	this.host = this.IdmUrl;
	if (urlType == "local") {
		this.host = this.LocalUrl;
	}
	this.getServiceUrl = function(sPath) {
		return this.host + sPath;
	}
}