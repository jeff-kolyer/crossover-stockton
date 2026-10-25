/********************************************************************************
  Description:	- Script responsible for initializing the popup and styling it.
/********************************************************************************
  Property of:	Webroot Inc.
  Copyright:	Webroot Inc. (c) 2026
/********************************************************************************
  Creator:		melsaie@webroot.com
  Manager:		pblaimschein@webroot.com
  Created:		02/10/2016 (mm/dd/yyyy)
********************************************************************************/

// IFDEF EDGE_LEGACY
if (navigator.userAgent.toLowerCase().indexOf("edge") != -1) chrome = browser;
var isBusiness = 0;

var Webroot_Popup =
{
	click: function (event) {
		if (event.currentTarget.href) {
			chrome.tabs.create({ url: event.currentTarget.href });
		}
		window.close();
	},

	// ---------------------------------- //
	//     Initialization function        //
	// ---------------------------------- //	
	init: function () {
		// Extract URL
		var url = document.URL;

		// Extract QueryParams from URL
		var urlSplitResultsTemp = url.split("?");
		var urlSplitResults = urlSplitResultsTemp[1].split("&");

		//urlSplitResults[0] ==> class
		//urlSplitResults[1] ==> brsn
		//urlSplitResults[2] ==> expiryDate
		var expiryDate = "";
		var className = urlSplitResults[0].split("=")[1];
		var brsn = urlSplitResults[1].split("=")[1];
		if (urlSplitResults[2]) expiryDate = urlSplitResults[2].split("=")[1];

		Webroot_Popup.constructPopUp(className, brsn, expiryDate);
	},

	isBusiness: async function () {

		return new Promise((resolve, reject) => {

			chrome.storage.local.get(['Settings'], function (result) {

				if (result.Settings && result.Settings.Flg == 6) resolve(true);
				else resolve(false);

			});
		});

	},

	// ---------------------------- //
	//     Construct the pop        //
	// ---------------------------- //
	constructPopUp: async function (className, BRSN, expiryDate) {
		var expireOn = false;

		// Initialize the variables
		var PopUpHeader = "-  ";

		// Check the ClassNames
		if (className == "green") {
			PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_TRUSTWORTHY");
			this.addInnerHTMLFromLocale("logobody", "TEXT_TRUSTWORTHY");
			expireOn = Webroot_Popup.checkKCExpire(expiryDate);
		}
		else if (className == "yellow") {
			PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_SUSPICIOUS");
			this.addInnerHTMLFromLocale("logobody", "TEXT_SUSPICIOUS");
		}
		else if (className == "red") {
			switch (BRSN) {
				case "200": //RTAP BLACKLIST
					PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_PHISHING");
					break;
				case "49": //KEYLOGGER
					PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_KEYLOGGER");
					break;
				case "56": //MALWARE
					PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_MALWARE");
					break;
				case "57": //PHISHING
					PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_PHISHING");
					break;
				case "59": //SPYWARE
					PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_SPYWARE");
					break;
				case "67": //BOTNET
					PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_BOTNET");
					break;
				case "71": //SPAM
					PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_SPAM");
					break;
				default:
					PopUpHeader += chrome.i18n.getMessage("TITLE_BCAP_RISK");
					break;
			}
			this.addInnerHTMLFromLocale("logobody", "TEXT_RISK");
		}
		else if (className == "error") {
			PopUpHeader += chrome.i18n.getMessage("BA_ERROR_HDR");
			this.addInnerHTMLFromLocale("logobody", "BA_ERROR_TXT");
		}
		else if (className == "error_permissions") {
			PopUpHeader += chrome.i18n.getMessage("BA_ERROR_PERMISSION");
			this.addInnerHTMLFromLocale("logobody", "OPTIONS_INTEGRATED_MODE_PERMISSION");
		}		
		else if (className == "componenterror") {
			PopUpHeader += chrome.i18n.getMessage("BA_ERROR_COMPONENT");
			this.addInnerHTMLFromLocale("logobody", "BA_ERROR_TXT_COMPONENT");
		}
		else if (className == "WSA_UNREACHABLE") {
			PopUpHeader = null;

			var isBusiness = await Webroot_Popup.isBusiness();
			if (isBusiness) this.addInnerHTMLFromLocale("logobody", "BA_WSAERROR_TXT_OT");
			else this.addInnerHTMLFromLocale("logobody", "BA_WSAERROR_TXT");
		}

		if (PopUpHeader == null) document.getElementById("header").style.display = 'none';

		// Update DOM elements of page
		document.body.className = className + 'Body';

		document.getElementById("header").innerText = PopUpHeader;

		var isBusiness = await Webroot_Popup.isBusiness();
		if (isBusiness) {

			image = document.getElementsByClassName("webrootlogotitle");
			res1 = image[0].getElementsByTagName("img");
			res1[0].src = "/images/sra/WebrootSmallOT.svg";
			res1[0].style.verticalAlign = "bottom";
		}

		// if firefox -> make 1px margin since FF enforces a percentage border with radius on the BA frame window 
		// (on small window only radius is visible, making edges looking frayed - WTS-1000)
		if (navigator.userAgent.toLowerCase().indexOf("firefox") != -1) {
			document.body.style.margin = "1px";
			if (!expireOn) {
				element.style.float = "inherit";
			}
		}

		var element = document.getElementById('logobody');
		// Set the links for the grey icons
		var element = document.getElementById("grey1");
		if (element) element.addEventListener('click', Webroot_Popup.click);
		element = document.getElementById("grey2");
		if (element) element.addEventListener('click', Webroot_Popup.click);
		element = document.getElementById("grey3");
		if (element) element.addEventListener('click', Webroot_Popup.click);
		element = document.getElementById("grey4");
		if (element) element.addEventListener('click', Webroot_Popup.click);
		element = document.getElementById("grey5");
		if (element) element.addEventListener('click', Webroot_Popup.click);
	},
	addInnerHTMLFromLocale: function (elementId, localeString) {
		var container = document.getElementById(elementId);
		var translatedStringWithElements = chrome.i18n.getMessage(localeString);

		if (!container || !translatedStringWithElements) return;

		const tokens = translatedStringWithElements.split(/(\{link4\}|\{link5\}|\{linkend\})/);

		container.textContent = ""; // clear safely
		let i = 0;
		while (i < tokens.length) {
			const token = tokens[i];
			if (token === "{link4}" || token === "{link5}") {
				const link = document.createElement("a");
				if (token === "{link4}") {
					link.href = "https://answers.webroot.com/Webroot/Loginr.aspx?pid=12&login=1&app=vw&solutionid=2658";
					link.id = "grey5";
				}
				else if (token === "{link5}") {
					link.href = "https://answers.webroot.com/Webroot/Loginr.aspx?pid=12&login=1&app=vw&solutionid=2657";
					link.id = "grey4";
				}
				link.textContent = tokens[i + 1] !== null ? tokens[i + 1] : "here";
				container.appendChild(link);
				i++;
			} else if (token === "{linkend}") {
				//do nothing, handled by the link creation above
			} else if (token) {
				container.appendChild(document.createTextNode(token));
			}
			i++;
		}
	},
	checkKCExpire: function (expiryDate) {
		expireOn = false;

		if (!expiryDate) return expireOn;

		var expireDiv = document.getElementById("expire");
		var expireLink = document.getElementById("expireLink");
		if (!expireDiv || !expireLink) return expireOn;

		const ichrKCExpDate = Date.parse(decodeURI(expiryDate));
		const dTDays = (ichrKCExpDate - Date.now()) / (1000 * 3600 * 24);
		const dTiDays = Math.ceil(dTDays);
		if (dTiDays <= 0) {
			expireLink.innerText = chrome.i18n.getMessage("OPTIONS_KEYCODE_VALIDATOR_WARNING_3");
			expireDiv.style.display = "block";
			expireLink.addEventListener('click', Webroot_Popup.expireClick);
			expireOn = true;
		}
		else if (dTiDays <= 30) {
			if (dTiDays == 1)
				expireLink.innerText = chrome.i18n.getMessage("BA_KEYCODE_WARNING_TEXT_1a");
			else
				expireLink.innerText = chrome.i18n.getMessage("BA_KEYCODE_WARNING_TEXT_1b", dTiDays.toString());

			expireDiv.style.display = "block";
			expireLink.addEventListener('click', Webroot_Popup.expireClick);
			expireOn = true;
		}

		return expireOn;
	},

	// ---------------------------- //
	//     Clicked on expire        //
	// ---------------------------- //
	expireClick: function () {
		chrome.runtime.sendMessage({ msg: "displayOptionsDlg" }, function (r) {
			window.close();
		});
	}
};

document.addEventListener('DOMContentLoaded', Webroot_Popup.init);