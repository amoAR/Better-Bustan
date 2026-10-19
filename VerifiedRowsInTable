// ==UserScript==
// @name         Bustan Verified Rows Highlighter
// @namespace    amoAR
// @version      1.0.1
// @description  Colorize verified (تائيد شده) rows in settlement table
// @match        https://bustan.tvu.ac.ir/Home/Index*
// @icon         https://bustan.tvu.ac.ir/Content/Images/logo.png
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    const DEBUG = true;
    const log = (...a) => DEBUG && console.log("[Bustan]", ...a);

    /**********************
     * STYLES
     **********************/
    GM_addStyle(`
        .amo-verified-row {
            background-color: darkslategray !important;
        }
    `);

    /**********************
     * VERIFIED ROWS HIGHLIGHT
     **********************/
    function highlightVerifiedRows() {
        const table = document.querySelector("#tblData");
        if (!table) return;

        const rows = table.querySelectorAll("tr");

        rows.forEach(row => {
            if (row.classList.contains("amo-verified-row")) return;

            const ths = row.querySelectorAll("th");

            for (const th of ths) {
                if (th.textContent.includes("تائيد شده")) {

                    row.classList.add("amo-verified-row");

                    const nextRow = row.nextElementSibling;
                    if (nextRow) {
                        nextRow.classList.add("amo-verified-row");
                    }

                    log("Verified row highlighted");
                    break;
                }
            }
        });
    }

    // Run immediately (in case table already exists)
    highlightVerifiedRows();

    // Observe AJAX / partial reloads
    const verifyObserver = new MutationObserver(() => {
        highlightVerifiedRows();
    });

    verifyObserver.observe(document.body, { childList: true, subtree: true });

})();
