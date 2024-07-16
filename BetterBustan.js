// ==UserScript==
// @name            Better Bustan
// @description     Adding some features to Bustan
// @namespace       https://github.com/amoAR
// @match           https://bustan.tvu.ac.ir/Home/Index*
// @grant           none
// @version         1.0
// @author          -
// @icon            https://shamsipour.tvu.ac.ir/view2379/img/custom/favicon.ico
// @updateURL       https://github.com/amoAR/
// @downloadURL     https://github.com/amoAR/
// @license         MIT
// ==/UserScript==

// Ready to inject
function isAllXhrComplete() {
  // Remove pfp
  document.querySelectorAll(".main-header img").forEach(el => {
    el.style.display = "none";
  })

  // Arabic to Persian
  var allElements = document.querySelectorAll('input, textarea, p, span, h1, h2, h3, h4, h5, h6, a, th, td, strong, header, .tooltip-inner');
  allElements.forEach(el => {
    el.innerHTML = el.innerHTML.toPersianCharacter().replace('اروین', "آروین");
  })


  // Fix announcement board
  const greeBoard = document.querySelector('div[style*="greeBoard.jpg"]')
  if (greeBoard != null) {
    try {
      greeBoard.style.backgroundImage = "none";
      const marquee = greeBoard.querySelector("marquee");
      marquee.stop();
      marquee.onmouseout = "this.stop();";
      marquee.style.overflow = "visible";
      addStyle(`
        marquee { overflow:visible; height:max-content }
        h2 { margin-bottom: 6rem !important }
      `)
    } catch { }
  }


  // AutoVote button students surveys
  var survey_forms = [...document.querySelectorAll('form[action="/SER_CourseGroup_SurveyQuestion_Student/Post"]')];

  survey_forms.forEach(form => {
    const table = form.querySelector('table');

    let isClaim = false;
    let claimText = null;
    const claim = table.nextElementSibling;
    if (claim !== null
      & claim !== undefined
      & claim.tagName === "DIV")
    {
      claimText = claim.querySelector("textarea")
      if (claimText !== null & claimText.id.endsWith("ClaimText"))
        isClaim = true;
    }

    var survey_button = document.createElement('button');
    survey_button.innerHTML = 'تکمیل فرم';
    survey_button.className = 'btn btn-warning'

    if (!isClaim) {
      survey_button.onclick = function () {
        window.stop();
        const tableRows = [...table.querySelectorAll('tbody > tr:not(:first-child):not(:last-child)')];
        tableRows.forEach(row => {
          try {
            var veryBadOption = row.querySelector('th > input[type="checkbox"]');
            veryBadOption.click();
          } finally {
            return;
          }
        })
      }
    }
    else {
      survey_button.onclick = function () {
        window.stop();
        const claimStr = "سلام و وقت بخير معتقدم ممكن است نمره نهایی من كمتر از عملكرد واقعی‌ام باشد. خواهشمندم در صورت امكان، دوباره به اوراق امتحانی توجه فرماييد.";
        claimText.value = claimStr;
        claimText.innerText = claimStr;
      }
    }

    try {
      table.appendChild(survey_button);
      console.log("AutoVote button has been successfully added.");
    }
    catch {
      console.log("Unable to add the AutoVote button or it's added already and you can ignore this log.");
    }
  })
}

// Check XHR requests
(function (open) {
  XMLHttpRequest.prototype.open = function () {
    this.addEventListener("load", isAllXhrComplete);
    return open.apply(this, arguments);
  };
})(XMLHttpRequest.prototype.open);

// Arabic to Persian
String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.toPersianCharacter = function () {
  var string = this;
  var obj = {
    'ك': 'ک',
    'دِ': 'د',
    'بِ': 'ب',
    'زِ': 'ز',
    'ذِ': 'ذ',
    'شِ': 'ش',
    'سِ': 'س',
    'ى': 'ی',
    'ي': 'ی',
    '١': '۱',
    '٢': '۲',
    '٣': '۳',
    '٤': '۴',
    '٥': '۵',
    '٦': '۶',
    '٧': '۷',
    '٨': '۸',
    '٩': '۹',
    '٠': '۰'
  };

  Object.keys(obj).forEach(function (key) {
    string = string.replaceAll(key, obj[key]);
  });
  return string
};

// Inject styles
function addStyle(styleString) {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}