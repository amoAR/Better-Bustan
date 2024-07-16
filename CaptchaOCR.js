// ==UserScript==
// @name        New script tvu.ac.ir
// @namespace   Violentmonkey Scripts
// @match       https://bustan.tvu.ac.ir/*
// @grant       none
// @version     1.0
// @author      -
// @description 7/13/2024, 5:17:46 PM
// ==/UserScript==

const localTime = parseInt(new Date().toLocaleTimeString([], { hour: 'numeric', hc: "h24" }).replace(/\D/g, '').trim());

switch (true) {
    case (localTime <= 7):
        alert("وقت لالاس رفیق!");
        break;
    case (localTime >= 21):
        alert("وقت لالاس رفیق!");
        break;
}

captchaInput = document.querySelector("input#Captcha");

if (captchaInput === null)
    throw "No captcha"

captchaInput.required = false;

document.querySelector("form.form-horizontal").noValidate;

var captchaImg = document.querySelector("img#imgcpatcha");
captchaImg.onload = function () {
    if (captchaImg.src.endsWith("loade_02.gif"))
        return;

    const base64Img = base64Resize(captchaImg, captchaImg.width * 2, captchaImg.height * 2);

    //Prepare form data
    var formData = new FormData();
    formData.append("base64Image", base64Img);
    formData.append("apikey", "");
    formData.append("filetype", "PNG");
    formData.append("scale", false);
    formData.append("OCREngine", 2);
    //Send OCR Parsing request
    jQuery.ajax({
        url: "https://api.ocr.space/parse/image",
        data: formData,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function (ocrParsedResult) {
            // Get the parsed results
            var parsedResults = ocrParsedResult["ParsedResults"];

            // Loop through the parsed results
            var parsedText = '';
            if (parsedResults != null) {
                $.each(parsedResults, function (index, value) {
                    parsedText += value["ParsedText"];
                }
                )
            };

            alert(parsedText.trim().replace(/ +/g, "").toUpperCase())
            captchaInput.value = parsedText.trim().replace(/ +/g, "").toUpperCase();

            if (captchaInput.value.length < 3)
                location.reload();
        }
    });
}

function base64Resize(img, wantedWidth, wantedHeight) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = wantedWidth;
    canvas.height = wantedHeight;
    ctx.drawImage(img, 0, 0, wantedWidth, wantedHeight);
    return canvas.toDataURL();
}