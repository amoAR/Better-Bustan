// ==UserScript==
// @name         Keep-alive ASP
// @description  send keep-alive requests
// @namespace    amoAR
// @grant        GM_xmlhttpRequest
// @match        https://bustan.tvu.ac.ir/*
// @exclude      https://bustan.tvu.ac.ir/
// @exclude      https://bustan.tvu.ac.ir/Account/Login
// @icon         https://bustan.tvu.ac.ir/Content/Images/logo.png
// ==/UserScript==

(function () {
  'use strict';

  var ORIGIN = "https://bustan.tvu.ac.ir";

  function getFormToken() {
    var input = document.querySelector("input[name='__RequestVerificationToken']");
    return input ? input.value : '';
  }

  function keepAlive() {
    var token = getFormToken();
    if (!token) {
      console.warn("No token found, skipping keepAlive");
      return;
    }

    // find the home link in sidebar
    var homeLink = document.querySelector("ul.sidebar-menu > li:first-child > a:first-of-type");
    if (!homeLink) {
      console.warn("Home link not found for keepAlive");
      return;
    }

    var onclickCode = homeLink.getAttribute("onclick");
    var match = onclickCode && onclickCode.match(/partialClick\('([^']*)','([^']*)','([^']*)'\)/);
    if (!match) {
      console.warn("Could not parse pageId from onclick");
      return;
    }

    var [_, pageId, keyId, info] = match;

    var url = ORIGIN + "/home/GetPartialView?pageId=" +
              encodeURIComponent(pageId) +
              "&keyId=" + encodeURIComponent(keyId) +
              "&additionalInfo=" + encodeURIComponent(info);

    GM_xmlhttpRequest({
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": ORIGIN,
        "Referer": ORIGIN + "/Home/Index",
        "Accept": "*/*"
      },
      data: "__RequestVerificationToken=" + encodeURIComponent(token),
      anonymous: false, // include cookies
      onload: function (res) {
        console.log("KeepAlive OK:", res.status);
        // console.log(res.responseText);
      },
      onerror: function (err) {
        console.warn("KeepAlive failed:", err);
      }
    });
  }

  // run immediately, then every 4 min
  setTimeout(keepAlive, 10 * 1000);
  setInterval(keepAlive, 5 * 60 * 1000);

})();
