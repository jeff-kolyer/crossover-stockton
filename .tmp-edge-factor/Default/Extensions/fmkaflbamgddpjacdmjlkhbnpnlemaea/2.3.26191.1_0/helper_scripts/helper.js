/********************************************************************************
  Module:		helper
  Description:	- Script containing all the helper methods used by the background
				  and the content scripts
/********************************************************************************
  Property of:	Webroot Inc.
  Copyright:	Webroot Inc. (c) 2026
/********************************************************************************
  Creator:		melsaie@webroot.com
  Manager:		pblaimschein@webroot.com
  Created:		02/10/2017 (mm/dd/yyyy)
********************************************************************************/

// ------------- //
// Uri class     //
// ------------- //
class Uri {
	constructor(url) {
		if (!url) {
			this.raw = "";
			this.protocol = "";
			this.authority = "";
			this.host = "";
			this.port = "";
			this.fullpath = "";
			this.path = "";
			this.filename = "";
			this.queryString = "";
			this.anchor = "";
			this.querySeparator = "";
			this.pathAndQuery = "";
			this.urlWithoutQuery = "";
			return;
		}
		var uriParts;
		try {
			uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(url);
		}
		catch (err) {
			this.raw = url;
			this.protocol = "";
			this.authority = "";
			this.host = "";
			this.port = "";
			this.fullpath = "";
			this.path = "";
			this.filename = "";
			this.queryString = "";
			this.anchor = "";
			this.querySeparator = "";
			this.pathAndQuery = "";
			this.urlWithoutQuery = "";
			return;
		}
		for (var i = 0; i < uriParts.length; i++) if (!uriParts[i]) uriParts[i] = "";
		this.raw = uriParts[0];
		this.protocol = uriParts[1];
		this.authority = uriParts[2];
		this.host = uriParts[3];
		this.port = uriParts[4];
		this.fullpath = uriParts[5];
		this.path = uriParts[6];
		this.filename = uriParts[7];
		this.queryString = uriParts[8];
		this.anchor = uriParts[9];
		if (this.queryString) {
			var pos = url.indexOf(this.queryString);
			if (pos >= 0) this.querySeparator = url[pos - 1];
		}
		else this.querySeparator = "";
		this.pathAndQuery = this.fullpath + this.querySeparator + this.queryString
		if (this.anchor) this.pathAndQuery += "#" + this.anchor;
		var uriSplitQuery = new RegExp("^[^?#&]+").exec(url);
		this.urlWithoutQuery = uriSplitQuery[0];
	}
	isHostValid() {
		if (!this.host) return false;
		if (this.host.length == 9 && this.host.toLowerCase() == "localhost") return true;
		if (this.host.indexOf(" ") >= 0) return false;
		//first dot
		if (this.host.indexOf(".") <= 0) return false;
		//no dot at the end
		if (this.host.lastIndexOf(".") == this.host.length - 1) return false;
		if (this.host.indexOf("..") >= 0) return false;
		// no mailto links
		if (this.host.indexOf("@") >= 0) return false;
		return true;
	}
	query() {
		if (!this.isHostValid()) return {};
		if (!this.queryString) return {};

		var queryDict = {};
		var queryItems = this.queryString.split('&');
		for (var i = 0; i < queryItems.length; i++) {
			var queryPair = queryItems[i].split('=');
			if (queryPair.length == 2) queryDict[queryPair[0]] = queryPair[1];
			else if (queryPair.length == 1) queryDict[queryPair[0]] = undefined;
			else if (queryPair.length > 2) {
				var firstEqual = queryItems[i].indexOf("=");
				queryDict[queryItems[i].substring(0, firstEqual)] = queryItems[i].substr(firstEqual + 1);
			}
		}
		return queryDict;
	}
}

// ------------- //
// Helper Object //
// ------------- //
const WTSURLID = {
	NONE: 0x0000,
	BLOCKPAGE: 0x0001,
	IFRAMEBLOCKPAGE: 0x0002,
	IWHITELISTPAGE: 0x0003,
	WHITELISTPAGE: 0x0004,
	ERRORPAGE: 0x0005
};

const BLOCKPAGEHOST = 'wf.webrootanywhere.com';
const BLOCKPAGEPATH = '/consumerblockpage.aspx';
const IFRAMEBLOCKPAGEPATH = '/iframeblockpage.aspx';
const WHITELISTPATH = '/webfiltering/whitelist.html';
const IWHITELISTPATH = '/webfiltering/iwhitelist.aspx';
const ERRORPAGEPATH = '/errorpages/oops.aspx';

var Webroot_Helper = {

	// Define variables
	sraEncodingType: Object.freeze({ "NoEncoding": "0", "Url": "1" }),

	// ------------------------- //
	// Check if host is BlockPage host //
	// ------------------------- //
	isWTSHost: function (uri) {

		if (!uri) return false;
		if (!uri.raw) return false;
		if (uri.host.toLowerCase() != BLOCKPAGEHOST) return false;
		if (uri.protocol.toLowerCase() != "https") return false;

		return true;
	},
	// ---------------------------------- //
	// Check if URL is WTS related        //
	// ---------------------------------- //	
	isWTSUrl: function (uri)
	{
		var wtsUrlId = WTSURLID.NONE;

		if (!Webroot_Helper.isWTSHost(uri)) return wtsUrlId;

		var urlPath = uri.fullpath.toLowerCase();

		if (urlPath == BLOCKPAGEPATH) wtsUrlId = WTSURLID.BLOCKPAGE;
		else if (urlPath == IFRAMEBLOCKPAGEPATH) wtsUrlId = WTSURLID.IFRAMEBLOCKPAGE;
		else if (urlPath == IWHITELISTPATH) wtsUrlId = WTSURLID.IWHITELISTPAGE;
		else if (urlPath == WHITELISTPATH) wtsUrlId = WTSURLID.WHITELISTPAGE;
		else if (urlPath == ERRORPAGEPATH) wtsUrlId = WTSURLID.ERRORPAGE;

		return wtsUrlId;
	},
	// ----------------------- //
	// Construct BLOCKPAGE URL //
	// ----------------------- //
	constructBlkUrl: function (responseMsg, isIframe) {
		var myBlockPageURL;
		var obj = responseMsg;

		if (isIframe) myBlockPageURL = "https://" + BLOCKPAGEHOST + IFRAMEBLOCKPAGEPATH;
		else myBlockPageURL = "https://" + BLOCKPAGEHOST + BLOCKPAGEPATH;

		// Add <FLG>
		myBlockPageURL += '?q=' + responseMsg["V2BLOB"];
		// return BLOCKPAGE URL
		return myBlockPageURL;
	},

	// public method for decoding
	decodeBase64: function (input)
	{
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		input = atob(input);
		input = decodeURIComponent(escape(input));
		return input;
	},
	// -------------------------------------------------------- //
	// Check received response for errors        
	// return: -1 -> error; 0 -> stop processing; 1 -> success/proceed
	// -------------------------------------------------------- //
	checkResponseError: function (response) {
		if (!response || (response.responseText == undefined)) return -1;
		var obj = response.responseText;

		if (obj.ERR == 0) {
			return 1;
		}
		else if (obj.ERR == 51) { //ERR=51 -> missing KC
			chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "KC_MISSING" }, function (response) { });
			return 0;
		}
		else if (obj.ERR == 52) { //ERR=52 -> KC failed to validate
			chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "ERROR" }, function (response) { });
		}
		else if (obj.ERR == 55) { //ERR=55 -> "Privacy not accepted" (FF)
			chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "KC_MISSING" }, function (response) { var err = chrome.runtime.lastError });
		}
		else if (obj.ERR == 200) { //ERR=200 -> "Invalid Password"
			var str = chrome.i18n.getMessage("Password");
			alert(str);
			return 1;
		}
		else if (obj.ERR == 503) {
			chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "WSA_UNREACHABLE" }, function (response) { });
		}
		else if (obj.ERR == 1062) { // ERROR_SERVICE_NOT_ACTIVE returned if "Enable Web Shield" disabled (WSA GUI)
			chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "DEFAULT" }, function (response) { });
			//not an error; just stop processing
			return 0;
		}
		else if (obj.ERR > 0) {
			chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "ERROR" }, function (response) { });
		}

		return -1;
	}
};