// ==UserScript==
// @name         Bustan Captcha OCR Autofill
// @namespace    amoAR
// @version      1.5
// @description  Auto-solve captcha on Bustan with OCR.space API
// @include      https://bustan.tvu.ac.ir/
// @include      https://bustan.tvu.ac.ir/Account/Login
// @include      https://bustan.tvu.ac.ir/Account/SessionExceed
// @include      https://bustan.tvu.ac.ir/Account/Logout
// @require      https://raw.githubusercontent.com/CoeJoder/waitForKeyElements.js/refs/heads/master/waitForKeyElements.js
// @grant        GM_xmlhttpRequest
// @icon         https://bustan.tvu.ac.ir/Content/Images/logo.png
// ==/UserScript==

(function () {
  'use strict';

  window.addEventListener('load', () => {
      const username = document.querySelector('#UserName');
      if (username) {
          username.value = '';
      }
      const password = document.querySelector('#Password');
      if (password) {
          password.value = '';
      }
  });

  const API_URL = "https://api.ocr.space/parse/image";
  const API_KEY = "";

  // Resize an image element to base64
  function base64Resize(img, wantedWidth, wantedHeight) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = wantedWidth;
    canvas.height = wantedHeight;
    ctx.drawImage(img, 0, 0, wantedWidth, wantedHeight);
    return canvas.toDataURL('image/jpeg', 1.0);
  }

  // OCR API call via GM_xmlhttpRequest
  function sendToOCR(base64Img) {
    // console.log("kir", base64Img);
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("base64Image", base64Img);
      formData.append("filetype", "jpg");
      formData.append("scale", "false");
      formData.append("OCREngine", "2");

      GM_xmlhttpRequest({
        method: "POST",
        url: API_URL,
        headers: {
          "apikey": API_KEY
        },
        data: formData,
        onload: (response) => {
          try {
            if (response.status !== 200) {
              return reject(new Error(`OCR API failed to fetch: ${response.status}`));
            }
            const data = JSON.parse(response.responseText);
            if (data.IsErroredOnProcessing) {
              console.error("OCR API error:", data.ErrorMessage || "Unknown error");
              return reject(new Error(data.ErrorMessage ? data.ErrorMessage.join("; ") : "OCR API error"));
            }
            const results = data.ParsedResults || [];
            const text = results.map(r => r.ParsedText || "").join("")
              .trim()
              .replace(/ +/g, "")
              .toUpperCase();
            resolve(text);
          } catch (err) {
            console.error("Failed to parse OCR API response:", err, response.responseText);
            reject(err);
          }
        },
        onerror: (err) => {
          console.error("Network error calling OCR API:", err);
          reject(err);
        }
      });
    });
  }

  // Main captcha handler
  async function handleCaptcha(captcha, captchaImg, captchaInput) {
    // Wait until captcha stops being the loading gif
    if (!captchaImg.complete || captchaImg.naturalWidth <= 1 || captchaImg.src.startsWith("loade_")) {
      console.log("Captcha image not loaded yet...");
      return setTimeout(() => handleCaptcha(captcha, captchaImg), 500);
    }

    try {
      // Scale through canvas
      // const base64Img = base64Resize(captchaImg, captchaImg.width * 2, captchaImg.height * 2);
      const base64Img = captchaImg.src.replace(/\s+/g, "").trim();
      const parsedText = (await sendToOCR(base64Img)).replace(/[^A-Za-z0-9]/g, "");
      console.log("OCR result:", parsedText);
      captchaInput.value = parsedText;
      captchaInput.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (err) {
      console.error("Captcha solving failed:", err);
    }
  }

  // Hook image captcha
  waitForKeyElements(`img#imgcpatcha[src^="data:image"]`, (captcha) => {
    const captchaImg = document.querySelector("img#imgcpatcha");
    const captchaInput = document.querySelector("input#captcha");
    if (captchaImg) {
      // trigger only after real captcha is visible
      captchaImg.onload = () => {
        handleCaptcha(captcha, captchaImg, captchaInput);
      };
      // in case it's already loaded
      handleCaptcha(captcha, captchaImg, captchaInput);
    }
  });

})();
