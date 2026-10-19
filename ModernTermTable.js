// ==UserScript==
// @name Bustan Modern Table - Term
// @namespace amoAR
// @version 1.0.0
// @description Rebuilds Bustan legacy grade tables into a clean modern table
// @match https://bustan.tvu.ac.ir/Home/Index*
// @icon https://bustan.tvu.ac.ir/Content/Images/logo.png
// @grant GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    const DEBUG = true;
    const log = (...a) => DEBUG && console.log("[Bustan-Term]", ...a);

    /**********************
     * STYLES
     **********************/
    GM_addStyle(`
        div.font-workbook > table + table + table + div {
            width: 70vw !important;
        }

        /* FORCE BOTH ROWS SAME HEIGHT */
        div.font-workbook > table + table + table + div > table: first-child > tbody > tr {
            height: 400px !important;
        }

        /* FORCE TD SIZE */
        td.align {
            height: 400px !important;
            min-height: 400px !important;
            vertical-align: top !important;
        }

        /* CENTER GRID */
        .amo-grid-center {
            display: flex;
            justify-content: center;
        }

        .amo-modern-wrapper {
            width: max-content;
            padding: 10px;
            display: flex;
            flex-direction: column;
        }
        tr:has(.amo-modern-wrapper):first-of-type .amo-modern-wrapper {
            margin-top: 3rem;
        }
        tr:has(.amo-modern-wrapper):last-of-type .amo-modern-wrapper {
            margin-top: 3rem;
        }

        .amo-modern-title {
            font-size: 14px;
            font-weight: 600;
            flex-shrink: 0;
            padding: 8px;
        }

        .amo-table {
            background: transparent;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 14px rgba(0, 0, 0, .08);
            flex: 1;
        }

        .amo-table > thead > tr.color-silver {
            border: none !important;
        }

        .amo-table th,
        .amo-table td {
            padding: 6px;
            font-size: 12px;
            text-align: center;
        }
        .amo-table > tbody > tr:has(td):not(tr:last-child) {
            border-bottom: 1px solid #8c8273;
        }

        .amo-table th {
            font-weight: 600;
        }

        .amo-table td.course {
            text-align: right;
            font-weight: 500;
        }

        .amo-grade {
            font-weight: 700;
            color: #065f46;
        }

        .amo-grade.low {
            color: #b91c1c;
        }

        .amo-empty {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            border-radius: 10px;
            border: 3px dashed #8c8273;
            padding: inherit;
        }
    `);

    /**********************
     * WAIT FOR AJAX
     **********************/
    const observer = new MutationObserver(() => {
        const bodies = document.querySelectorAll("#student_semester");
        if (!bodies.length) return;

        observer.disconnect();
        log("Semester blocks found:", bodies.length);

        // Center the whole legacy grid once
        const outer = bodies[0].closest(
            'div.font-workbook > table + table + table + div[align="center"]'
        );
        if (outer && !outer.classList.contains("amo-grid-center")) {
            outer.classList.add("amo-grid-center");
        }

        bodies.forEach((tbody, i) => buildBlock(tbody, i));
    });

    observer.observe(document.body, { childList: true, subtree: true });

    /**********************
     * BUILD EACH CELL
     **********************/
    function buildBlock(legacyBody, index) {
        log(`Processing cell ${index + 1}`);

        const rows = [...legacyBody.querySelectorAll("tr")];
        const data = [];

        for (const tr of rows) {
            const tds = tr.querySelectorAll(":scope > td");
            if (tds.length < 5) continue;
            const code = tds[0].innerText.trim();
            const name = tds[1].innerText.trim();
            const units = tds[2].innerText.trim();
            const grade = tds[3].innerText.trim();
            const status = tds[4].innerText.trim();
            if (!code && !name) continue;
            data.push({ code, name, units, grade, status });
        }
        const wrapper = document.createElement("div");
        wrapper.className = "amo-modern-wrapper";
        // Set table number (ترم 1, ترم 2, ...)
        const titleText = index === 0 ? "ترم ا" : `ترم ${index + 1}`;
        wrapper.innerHTML = `<div class="amo-modern-title">${titleText}</div>` + wrapper.innerHTML;

        if (data.length) {
            wrapper.innerHTML += `
                <table class="amo-table">
                    <thead>
                        <tr class="color-silver">
                            <th>کد</th>
                            <th>نام درس</th>
                            <th>واحد</th>
                            <th>نمره</th>
                            <th>وضعیت</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((d) => {
                            const g = parseFloat(d.grade);
                            return `
                                <tr>
                                    <td>${d.code || "-"}</td>
                                    <td class="course">${d.name || "-"}</td>
                                    <td>${d.units || "-"}</td>
                                    <td class="amo-grade ${g < 15 ? "low" : ""}">
                                        ${d.grade || "-"}
                                    </td>
                                    <td>${d.status || "-"}</td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            `;
        } else {
            wrapper.innerHTML += `
                <div class="amo-empty">
                    اطلاعاتی برای این ترم ثبت نشده است
                </div>
            `;
        }

        const legacyTable = legacyBody.closest("table");
        legacyTable.parentNode.insertBefore(wrapper, legacyTable);
        legacyTable.style.display = "none";

        log(`Cell ${index + 1} rendered (${data.length ? "data" : "empty"})`);
    }
})();
