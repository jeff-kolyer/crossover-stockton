/*******************************************************************************************
  Module:		main
  Description:	- Main contentScript for directly interacting with the page's DOM.
				- Every tab has its own instance of this script.
				- Page content (DOM) can only be modified/accessed from within the content script
/*******************************************************************************************
  Property of:	Webroot Inc.
  Copyright:	Webroot Inc. (c) 2026
/*******************************************************************************************
  Creator:		melsaie@webroot.com
  Manager:		pblaimschein@webroot.com
  Created:		02/10/2017 (mm/dd/yyyy)
********************************************************************************************/

// IFDEF EDGE_LEGACY
if (Webroot_Browser.identify_browser() == Webroot_Browser.EDGE_LEGACY) chrome = browser;
else if (Webroot_Browser.identify_browser() == Webroot_Browser.SAFARI) chrome = browser;


// ---------------------------- //
//   Webroot_Extension Object   //
// ---------------------------- //
var Webroot_Extension = 
{
	// Initialize User Preferences
	mode: 0,
	urlBlocking: 0,
	phishBlocking: 0,
	agentPwd: 0,
	Flg: 0,
	unsuspendLatency: null,

	// Define PP limit (1MB)
	RTAP_BYTE_SIZE: 1000000,

	isIframe: false,
	currentUri: null,
	frameRef: 1,
	cfgReceivedAt: 0,
	lastConfigRefresh: 0,
	isContentObservingSet: false,
	currentChksum: 0,
	isRTAPpending: false,
	initDateTime: new Date(),

	//Event handler for whitelist requests sent from blockpage to FF Extension
	whiteListListener: function (event) {
		if (event?.source === window) {
			if (Webroot_Helper.isWTSHost(new Uri(event.origin))) {
				if (event?.data?.msg === "WHITELIST")
					this.whiteList({ msg: "WHITELIST", q: event.data.q, hash: event.data.hash });
				else
					console.info("Unexpected message on whiteListListener");
			}
		}
	},

	// ---------------------------------- //
	//     Initialization function        //
	// ---------------------------------- //
	init: function()
	{
		this.isIframe = (window.top != window.self) ? true : false;

		//Listen to whitelist requests sent by blockpage (FireFox only)
		if ((Webroot_Browser.identify_browser() == Webroot_Browser.FIREFOX) || (Webroot_Browser.identify_browser() == Webroot_Browser.SAFARI))
		  window.addEventListener("message", event => this.whiteListListener(event));

		this.checkBkSuspended().then(() => { 

			//Capture unsuspend latency
			this.unsuspendLatency = new Date() - this.initDateTime;

			chrome.storage.local.get(['Settings', 'LogSettings', 'Mode'], function (result) {
				if (!chrome.runtime.lastError) {

					if (result["LogSettings"] && result["LogSettings"]["LOGLEVEL"]) this.logLevel = result["LogSettings"]["LOGLEVEL"];
					else this.logLevel = 0;

					Webroot_Extension.initConfig(result); //TODO change to "this" after unittest adapted
				}
			})
			
		});

		if (Webroot_Browser.identify_browser() != Webroot_Browser.FIREFOX) {
			// keep extension unsuspended while content script is active
			setInterval( () => {
				if (chrome.runtime.id !== undefined) chrome.runtime.sendMessage({ msg: "is_standalone_mode" }, function (response) { });
			}, 25 /*seconds*/ * 1000);
		}

	},	

	connectWithPromise: function (name) {
		if (Webroot_Browser.identify_browser() == Webroot_Browser.SAFARI) {

			return new Promise((resolve, reject) => {
				let port = chrome.runtime.connect({ name: name });
				let timeoutId = null;
				let done = false;

				timeoutId = setTimeout(() => {
					if (!done) {

						port.disconnect();
						console.log("no answer from bk");						
						reject(new Error('Connection timeout after 300ms'));
					}
				}, 1000);

				port.onMessage.addListener(function (msg) {
					if (!done) {

						console.log("answer from bk");

						done = true;
						clearTimeout(timeoutId);
						port.disconnect();

						if (msg.responseText == 0) resolve(msg);
						else reject(new Error('Invalid response'));
					}
				});

				port.onDisconnect.addListener(function () {
					if (!done) {

						done = true;
						clearTimeout(timeoutId);
						reject(new Error('Port disconnected'));
					}
				});

				port.postMessage({ name: name });
			});

		}

	},

	checkBkSuspended: async function () {
		if (Webroot_Browser.identify_browser() == Webroot_Browser.SAFARI) {
			var noSucc = 1;
			var retries = 0;

			do {
				try {
					var x = this.connectWithPromise("SuspendWakeup");
					var msg = await x;
					noSucc = 0;
				}
				catch (err) {
					retries = retries + 1;
				}
			} while (noSucc && (retries < 200));

			if (retries >= 100) {

				return Promise.reject();
			}
		}
		else {
			var x = await chrome.runtime.sendMessage({ msg: "SuspendWakeup" });
			while (x.responseText != 0) {
				x = await chrome.runtime.sendMessage({ msg: "SuspendWakeup" });
			}
			return x;
		}
	},

	initConfig: function (config) {

		if (!config || !config["Settings"] || (config["Settings"]["VERSION"] != 1)) {
			chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "COMPONENT_ERROR" }, function (response) { });
			return;
		}

		if (config["Mode"]) this.mode = config["Mode"];
		if (config["Settings"]["URLBlocking"]) this.urlBlocking = config["Settings"]["URLBlocking"];
		else this.urlBlocking = 0;
		if (config["Settings"]["PhishBlocking"]) this.phishBlocking = config["Settings"]["PhishBlocking"];
		else this.phishBlocking = 0;
		if (config["Settings"]["AgentPwd"]) this.agentPwd = config["Settings"]["AgentPwd"];
		else this.agentPwd = 0;
		if (config["Settings"]["Flg"]) this.Flg = config["Settings"]["Flg"];
		else this.Flg = 0;

		if (this.mode == 0 || config["Settings"]["ERR"] == 51) {
			chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "KC_MISSING" }, function (response) { var err = chrome.runtime.lastError });
			this.updateConfig();
			return;
		}

		this.runScript();
	},

	// ----------------------------------------- //
	// Sends log entry to background             //
	// ----------------------------------------- //
	Log: function (logVal1, logVal2, logVal3) {

		if (this.logLevel >= 3) {

			var logObj = {
				msg: "LOG",
				headline: logVal1
			};

			if (logVal2 || logVal3) {
				logObj.details = {
					logVal2: logVal2,
					logVal3: logVal3
				}
			};
			try {
				if (chrome?.runtime?.id)
					chrome.runtime.sendMessage(logObj, function (response) { });
			}
			catch (e) {
				console.log("Background unavailable", e);
			}
		}
		return true;
	},

	// ----------------------------------------- //
	// Sends a BCAP request                      //
	// Returns True --> If BCAP is switched ON   //
	// Returns False --> If BCAP is switched OFF //
	// ----------------------------------------- //
	processBCAP: function (url)
	{
		if ((this.urlBlocking != 1) && (this.phishBlocking != 1)) {
			if (this.mode == 1) this.updateConfig();
			return false;
		}

		if (this.isIframe) {
			this.frameRef = this.CreateREF(url);
		}

		chrome.runtime.sendMessage({ msg: "BCAP", ppURL: url, ref: this.frameRef }, function (response)
		{
			if (!response || (response.responseText == undefined))
			{ 
				chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "ERROR" }, function (response) { });
				return;
			}
			// Check for errors
			var error = response.responseText;
			if (error != 0)
			{
				// Log error
				console.info("WTS_Extension [processBCAP]: " + JSON.stringify(error));

				// Update BrowserAction (Case: WSA UNREACHABLE)
				chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "ERROR" }, function (response) { });
			}
		});
		return true;
	},

	CreateREF: function(str)
	{
		var chkSum = parseInt(Math.random() * 10000000);
		if (str) {
			for (i = 0; i < Math.min(str.length, 250); i++) {
				chkSum += str.charCodeAt(i);
			}
		}
		return chkSum;
	},

	// ----------------------------------------- //
	// Sends a RTAP request                      //
	// Returns True --> If RTAP is switched ON   //
	// Returns False --> If RTAP is switched OFF //
	// ----------------------------------------- //
	processRTAP: function (url, isDynRTAP)
	{
		if (this.phishBlocking != 1) return false;

		// Get Root Document HTML
		var htmlContent = this.extractPageHtml(document);

		// Check size of extracted document
		if (htmlContent.length <= 0) return true;
		if (this.getByteLen(htmlContent) > this.RTAP_BYTE_SIZE) return true;

		this.isRTAPpending = true;

		chrome.runtime.sendMessage({ msg: "RTAP", isDynRTAP: isDynRTAP, ppURL: url, RootHTML: htmlContent, ref: this.frameRef.toString() }, function (response)
		{
			if (!response || (response.responseText == undefined) ) 
			{
				chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "ERROR" }, function (response) { });
				return;
			}
			// Check for errors
			var error = response.responseText;
			if (error != 0)
			{
				// Log error
				console.info("WTS_Extension [processRTAP]: " + JSON.stringify(error));

				// Update BrowserAction (Case: WSA UNREACHABLE)
				chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "ERROR" }, function (response) { });
			}
		});
		return true;
	},

	// ------------------------- //
	// Extract page HTML content //
	// ------------------------- //
	extractPageHtml: function (document) {
		if (!document) return "";

		// Get Root Document HTML
		var RootHTML = "";
		if (document.head && document.head.outerHTML)
			RootHTML += document.head.outerHTML;
		if (document.body && document.body.outerHTML)
			RootHTML += document.body.outerHTML;

		if (RootHTML.length > 0) RootHTML = "<html>" + RootHTML + "</html>";

		return RootHTML;
	},
	// ---------------------------- //
	// Get Size of String in Bytes  //
	// ---------------------------- //
	getByteLen: function (normal_val) {
		// Force string type
		normal_val = String(normal_val);

		var byteLen = 0;
		for (var i = 0; i < normal_val.length; i++) {
			var c = normal_val.charCodeAt(i);
			byteLen += c < (1 << 7) ? 1 :
				c < (1 << 11) ? 2 :
					c < (1 << 16) ? 3 :
						c < (1 << 21) ? 4 :
							c < (1 << 26) ? 5 :
								c < (1 << 31) ? 6 : Number.NaN;
		}
		return byteLen;
	},


	whiteList: function (jsnWhiteListMessage)
	{
		chrome.runtime.sendMessage( jsnWhiteListMessage, function (response) {
			if (!response || (response.responseText == undefined)) {
				console.info("WTS_Extension [processWhiteList]");
				chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "ERROR" }, function (response) { });
			}
			// Check for errors
			var error = response.responseText;
			if (error != 0) {
				// Log error
				console.info("WTS_Extension [processWhiteList]: " + JSON.stringify(error));

				// Update BrowserAction (Case: WSA UNREACHABLE)
				chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "ERROR" }, function (response) { });
			}
		});
	},

	// ----------------------------------------- //
	// Sends a WHITELIST request                 //
	// Returns True --> If Whitelisting url      //
	// Returns False --> otherwise               //
	// ----------------------------------------- //
	processWhiteList: function (uri)
	{
		const urlId = Webroot_Helper.isWTSUrl(uri);

		if (urlId == WTSURLID.BLOCKPAGE || urlId == WTSURLID.IFRAMEBLOCKPAGE)
		{
			this.whiteList({ msg: "WHITELIST", ppURL: url });
			return true;
		}
		return false;
	},

	getContentHash: function (string) {
		var hash = 0, i, chr;
		if (string.length === 0) return hash;
		for (i = 0; i < string.length; i++) {
			chr = string.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	},

	// ---------------------------------- //
	// OnDocumentComplete event listener  //
	// ---------------------------------- //
	runScript: function ()
	{
		// Check if extension is disabled
		if (!this.urlBlocking && !this.phishBlocking) {
			if (this.mode == 1) this.updateConfig();
			return;
		}

		const uri = new Uri(document.URL);
		if (!uri || uri?.raw == '') return;
		
		if (this.currentUri?.raw == uri.raw) return;
		this.currentUri = uri;

		// Check for WTS URL
		const urlId = Webroot_Helper.isWTSUrl(this.currentUri);
		if (urlId == WTSURLID.IWHITELISTPAGE) {
			this.handleIframeWhitePage(this.currentUri.raw);
			return;
		}
		else if (urlId == WTSURLID.WHITELISTPAGE) {
			if (this.processWhiteList(this.currentUri)) {
				chrome.runtime.sendMessage({ msg: "PAGE-SYNC-LATENCY", value: new Date() - this.initDateTime }, function (response) { });
			}
			return;
		}
		else if (urlId != WTSURLID.NONE) {
			// Update BrowserAction if BlockPage
			if (((urlId == WTSURLID.BLOCKPAGE || urlId == WTSURLID.IFRAMEBLOCKPAGE)) && (this.isIframe == false)) {
				chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "BLOCK_PAGE" }, function (response) { });
			}
			return;
		}

		// Perform BCAP
		if (this.processBCAP(this.currentUri?.raw)) {

			//Report PAGE-SYNC-LATENCY
			chrome.runtime.sendMessage({ msg: "PAGE-SYNC-LATENCY", value: new Date() - this.initDateTime }, function (response) { });
			//Report PAGE-UNSUSPEND-LATENCY
			chrome.runtime.sendMessage({ msg: "PAGE-UNSUSPEND-LATENCY", value: this.unsuspendLatency }, function (response) { });
		
			return;
		};
	},
	// -------------------------------------------------- //
	// Update page elements and display main document URL //
	// -------------------------------------------------- //
	handleIframeWhitePage: function (url) {

		// Extract tabId
		var tabId = url.substring(url.toLowerCase().indexOf("tabid") + 6);

		chrome.runtime.sendMessage({ msg: "getTabUrl", tabId: tabId }, function (response) {
			// Update page HTML
			var blockedURL = document.getElementById("blockedURL");
			blockedURL.href = response.responseText;

			// Update style attribute of URL element
			document.getElementById("urlBlock").style.display = "block";

			// Break down URL if long enough
			if (response.responseText.length >= 40) {
				blockedURL.innerText = response.responseText.substring(0, 40) + "...";
				blockedURL.title = response.responseText;
			}
			else { blockedURL.innerText = response.responseText; }

			return 0;
		});
		return 0;
	},

	// --------------------------------------------------------- //
	// Extracts the BLK URL from QueryParams and navigates to it //
	// --------------------------------------------------------- //
	processWhiteListResponse: function (url,msg) {

		var q;
		var blkURL;
		var extra;
		var tabId;
		var isV2 = (msg.responseText.DATA && msg.responseText.DATA[0] && msg.responseText.DATA[0]["BURL"]) ? true : false;

		//Report PAGE-ASYNC-LATENCY
		chrome.runtime.sendMessage({ msg: "PAGE-ASYNC-LATENCY", value: new Date() - this.initDateTime }, function (response) { });

		if (isV2) {

			if (msg.responseText.ERR == 200) return;

			blkURL = msg.responseText.DATA[0]["BURL"];
			extra = msg.responseText.DATA[0]["EXTRA"];
			tabId = extra.substring(extra.indexOf(":") + 1);
		}
		else {

			// Split URL
			var uri = new Uri(url);
			if (uri.host.toLowerCase() != "wf.webrootanywhere.com") return;
			q = uri.query();
			blkURL = q["burl"];
			extra = q["extra"];
			tabId = extra.substring(extra.indexOf(":") + 1);

			if (tabId == '') blkURL = Webroot_Helper.decodeBase64(msg.responseText.DATA[0]["BURL"]);
			else blkURL = q["burl"];
		}

		try {
			var targetUri = new Uri(blkURL);
			if (!targetUri.isHostValid()) return;
		} catch (e) {
			console.error("Invalid URL format: " + e);
			return;
		}

		if (isNaN(tabId) && (tabId != '')) return;

		// Navigate to WhiteListed URL
		if (tabId == '') window.location = targetUri.raw;
		else {
			if (msg.responseText.ERR == 0) window.location = "https://" + BLOCKPAGEHOST + IWHITELISTPATH + "?" + "tabId=" + tabId + "&flg=" + this.Flg;
		}
	},

	// ---------------------------------------- //
	// BCAP --> if page classified as malicious --> Navigates to BlockPage
	// BCAP --> If page not malicious --> Performs RTAP
	// ---------------------------------------- //
	processBCAPResponse: function (jsonResponse)
	{
		// BCAP
		if (jsonResponse.DATA[0].REF != this.frameRef) return;

		//hidden BCAP
		this.updateSettingsFromWSA(jsonResponse);

		//Report PAGE-ASYNC-LATENCY
		chrome.runtime.sendMessage({ msg: "PAGE-ASYNC-LATENCY", value: new Date() - this.initDateTime }, function (response) { });

		if ((this.urlBlocking == 1) ||
			((this.phishBlocking == 1) && (jsonResponse.DATA[0].RTAP == -1)))
		{
			if (jsonResponse.DATA[0].BLK == 1) {

				// Construct Block Page URL
				var myBlockPageURL;
				if (this.isIframe == true)
					myBlockPageURL = Webroot_Helper.constructBlkUrl(jsonResponse,1);
				else
					myBlockPageURL = Webroot_Helper.constructBlkUrl(jsonResponse,0);

				// Navigate to Blockpage
				if (this.isIframe) document.location = myBlockPageURL;
				else window.location = myBlockPageURL;

				return;
			}
			// Update BrowserAction icon (only for main frame)
			else if (this.isIframe == false) chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: jsonResponse }, function (response) { });
		}

		if (jsonResponse.DATA[0].NOPP == 2) {
			//TODO remove mode == 2 as soon as dynRTAP gets supported in integrated
			if (this.mode == 2) RtapObserver.startObserver();
			return;
		}
		if (jsonResponse.DATA[0].NOPP == 1 || jsonResponse.DATA[0].PRIVATEIP == 1) return;

		// Perform RTAP
		if (this.processRTAP(document.URL, false)) return;

	},

	// ---------------------------------------- //
	// RTAP --> if page classified as malicious --> Navigates to BlockPage
	// ---------------------------------------- //
	processRTAPResponse: function (jsonResponse)
	{
		// RTAP
		if (this.frameRef.toString() != jsonResponse.REF) return;

				// Check Reputation
		if (jsonResponse.DATA[0].ISPHIS == 1) {
			if (jsonResponse.DATA[0].ISWHT == 1) {
				this.isRTAPpending = false;
				return;
			}

			// Construct Block Page URL
			if (this.isIframe == true) {
				var myBlockPageURL = Webroot_Helper.constructBlkUrl(jsonResponse, 1);
				document.location = myBlockPageURL;
			}
			else {
				var myBlockPageURL = Webroot_Helper.constructBlkUrl(jsonResponse);
				window.location = myBlockPageURL;
			}

			this.isRTAPpending = false;
			return;
		}
		else {
			this.isRTAPpending = false;
			if ((this.mode == 2) && (!RtapObserver.IsContentObservingSet)) RtapObserver.startObserver();
		}
	},

	updateConfig: function () {
		if (this.isIframe) return;
		var ms = Date.now() - this.lastConfigRefresh;
		if (ms < 2000) return;

		this.lastConfigRefresh = Date.now();
		chrome.runtime.sendMessage({ msg: "CONFIG", skipresponse: 1 }, function (response) { });
	},

	updateSettingsFromWSA: function (jsonResponse) {

		if (!jsonResponse || !jsonResponse.SETTINGS || !jsonResponse.SETTINGS.DATA) return;

		var settings = jsonResponse.SETTINGS.DATA;
		if (settings.hasOwnProperty('URLBlocking')) this.urlBlocking = settings.URLBlocking;
		if (settings.hasOwnProperty('PhishBlocking')) this.phishBlocking = settings.PhishBlocking;
		if (settings.hasOwnProperty('Mode')) this.mode = settings.Mode;
		if (settings.hasOwnProperty('AgentPwd')) this.agentPwd = settings.AgentPwd;
		if (settings.hasOwnProperty('Flg')) this.Flg = settings.Flg;
	}
};

chrome.storage.onChanged.addListener(function (changes, namespace) {
	if (namespace == "local") {
		if (changes["Settings"]) {
			var ms = Date.now() - Webroot_Extension.lastConfigRefresh;
			if (ms > 2000) return;
			Webroot_Extension.initConfig(changes["Settings"].newValue);
		}
		if (changes["LogSettings"]) {
			if (changes["LogSettings"].newValue && changes["LogSettings"].newValue.LOGLEVEL >= 1) Webroot_Extension.logLevel = changes["LogSettings"].newValue.LOGLEVEL;
		} 
	}
});

// Initialize ContentScript
Webroot_Extension.init();

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse)
{
	if (!msg || !msg.responseText) return;

	var jsonResponse = msg.responseText;

	// ------ //
	// CONFIG //
	// ------ //
	if (jsonResponse.OP == 4)
	{
		if ((Date.now() - Webroot_Extension.cfgReceivedAt) < 1000) return;

		// Handle Config Response
		var iSuccess = Webroot_Helper.checkResponseError(msg);
		if (iSuccess <= 0)
		{
			if (iSuccess < 0) console.info("WTS_Extension [RUNTIME.ONMESSAGE][OP-4]: " + JSON.stringify(jsonResponse));
			return;
		}
		// if Standalone and no KeyCode terminate
		if ((jsonResponse.STANDALONE == 1) && !jsonResponse.KC) {
			// Update the browser action to resemble missing keycode
			chrome.runtime.sendMessage({ msg: "update_browseraction_icon", data: "KC_MISSING" }, function (response) { });
			return;
		}
		Webroot_Extension.cfgReceivedAt = Date.now();
		Webroot_Extension.runScript();
	}

	// ---- //
	// BCAP //
	// ---- //
	else if (jsonResponse.OP == 1)
	{
		// Handle BCAP Response
		var iSuccess = Webroot_Helper.checkResponseError(msg);
		if (iSuccess <= 0)
		{
			if (iSuccess < 0) console.info("WTS_Extension [RUNTIME.ONMESSAGE][OP-1]: " + JSON.stringify(jsonResponse));
			return;
		}

		Webroot_Extension.processBCAPResponse(jsonResponse);      //BCAP
		return;
	}

	// ---- //
	// RTAP //
	// ---- //
	else if (jsonResponse.OP == 2)
	{
		// Handle BCAP Response
		var iSuccess = Webroot_Helper.checkResponseError(msg);
		if (iSuccess <= 0)
		{
			Webroot_Extension.isRTAPpending = false;
			if (iSuccess < 0) console.info("WTS_Extension [RUNTIME.ONMESSAGE][OP-2]: " + JSON.stringify(jsonResponse));
			return;
		}

		//Check response
		Webroot_Extension.processRTAPResponse(jsonResponse);
		return;
	}

	// --------- //
	// WHITELIST //
	// --------- //
	else if (jsonResponse.OP == 3)
	{
		// Handle WhiteList Response
		var iSuccess = Webroot_Helper.checkResponseError(msg);
		if (iSuccess <= 0)
		{
			if (iSuccess < 0) console.info("WTS_Extension [RUNTIME.ONMESSAGE][OP-3]: " + JSON.stringify(jsonResponse));
			return;
		}

		//Check response
		Webroot_Extension.processWhiteListResponse(document.URL,msg);
		return;
	}
});