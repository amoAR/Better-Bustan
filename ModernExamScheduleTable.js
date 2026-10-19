// ==UserScript==
// @name Bustan Modern Table - Exam Schedule
// @namespace amoAR
// @version 1.0.0
// @description Rebuilds Bustan exam schedule tables into a clean modern dark table
// @match https://bustan.tvu.ac.ir/Home/Index*
// @icon https://bustan.tvu.ac.ir/Content/Images/logo.png
// @grant GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    const DEBUG = true;
    const log = (...a) => DEBUG && console.log("[Bustan-Exam]", ...a);

    /**********************
     * STYLES - DARK THEME
     **********************/
    GM_addStyle(`
        /* Hide original exam table */
        .amo-exam-hidden {
            display: none !important;
        }

        /* Modern wrapper */
        .amo-exam-wrapper {
            width: 100%;
            margin: 20px auto;
            padding: 0;
            background: #1a1a2e;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            overflow: hidden;
            border: 1px solid #2d2d44;
        }

        .amo-exam-title {
            font-size: 18px;
            font-weight: 700;
            color: #e0e0e0;
            padding: 15px 20px;
            background: #16213e;
            border-bottom: 2px solid #2d2d44;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .amo-exam-title .badge {
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            background: #0d6efd;
            padding: 4px 14px;
            border-radius: 20px;
        }

        /* Student info header - DARK */
        .amo-exam-header {
            display: grid;
            grid-template-columns: auto 1fr auto 1fr auto 1fr;
            gap: 6px 12px;
            padding: 15px 20px;
            background: #16213e;
            border-bottom: 1px solid #2d2d44;
            font-size: 13px;
            align-items: center;
        }

        .amo-exam-header .label {
            font-weight: 600;
            color: #8a8aa8;
            font-size: 12px;
        }

        .amo-exam-header .value {
            font-weight: 700;
            color: #e0e0e0;
        }

        .amo-exam-header .value.bold {
            font-weight: 800;
            color: #ffffff;
        }

        .amo-exam-header .photo {
            grid-column: 7;
            grid-row: 1 / span 6;
            text-align: center;
        }

        .amo-exam-header .photo img {
            border-radius: 8px;
            border: 2px solid #2d2d44;
            padding: 3px;
            background: #0d0d1a;
        }

        /* Exam table - DARK */
        .amo-exam-table-wrap {
            padding: 15px;
            overflow-x: auto;
            background: #1a1a2e;
        }

        .amo-exam-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            background: transparent;
            border-radius: 8px;
            overflow: hidden;
        }

        .amo-exam-table thead th {
            background: #0d0d1a;
            color: #a8a8c8;
            padding: 12px 10px;
            font-weight: 700;
            text-align: center;
            font-size: 11px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border: 1px solid #2d2d44;
            border-bottom: 2px solid #0d6efd;
        }

        .amo-exam-table tbody td {
            padding: 10px 8px;
            text-align: center;
            border: 1px solid #2d2d44;
            vertical-align: middle;
            font-size: 12px;
            color: #c8c8d8;
            transition: background 0.2s;
        }

        .amo-exam-table tbody tr {
            transition: background 0.2s;
        }

        .amo-exam-table tbody tr:hover td {
            background: #2a2a44;
        }

        .amo-exam-table tbody tr:nth-child(even) td {
            background: #1e1e34;
        }

        .amo-exam-table tbody tr:nth-child(even):hover td {
            background: #2a2a44;
        }

        .amo-exam-table .course-code {
            font-weight: 700;
            color: #4dabf7;
            font-size: 12px;
        }

        .amo-exam-table .course-name {
            font-weight: 600;
            text-align: right;
            color: #e0e0e0;
        }

        .amo-exam-table .prof-name {
            font-weight: 500;
            color: #b8b8d0;
            font-size: 11px;
        }

        .amo-exam-table .exam-date {
            font-weight: 600;
            color: #69db7c;
        }

        .amo-exam-table .exam-day {
            font-weight: 500;
            color: #a8a8c8;
        }

        .amo-exam-table .exam-time {
            font-weight: 700;
            color: #ff6b6b;
        }

        .amo-exam-table .exam-duration {
            color: #a8a8c8;
        }

        .amo-exam-table .group-code {
            font-weight: 500;
            color: #b197fc;
        }

        .amo-exam-table .seat-number {
            font-weight: 700;
            color: #ffd43b;
        }

        .amo-exam-table .location {
            font-weight: 500;
            color: #63e6be;
        }

        .amo-exam-table .faculty {
            font-weight: 500;
            color: #a8a8c8;
        }

        /* Empty state */
        .amo-exam-empty {
            text-align: center;
            padding: 40px 20px;
            color: #8a8aa8;
            font-size: 14px;
        }

        .amo-exam-empty .icon {
            font-size: 48px;
            display: block;
            margin-bottom: 10px;
        }

        /* Loading state */
        .amo-exam-loading {
            text-align: center;
            padding: 30px;
            color: #8a8aa8;
        }

        .amo-exam-loading .spinner {
            display: inline-block;
            width: 30px;
            height: 30px;
            border: 3px solid #2d2d44;
            border-top: 3px solid #0d6efd;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 600px) {
            .amo-exam-table {
                font-size: 10px;
            }
            .amo-exam-table thead th,
            .amo-exam-table tbody td {
                padding: 5px 3px;
                font-size: 9px;
            }
            .amo-exam-header {
                grid-template-columns: 1fr 1fr;
                gap: 3px 8px;
                font-size: 11px;
                padding: 10px 15px;
            }
            .amo-exam-header .photo {
                grid-column: 1 / -1;
                grid-row: auto;
                text-align: center;
                margin-top: 8px;
            }
            .amo-exam-title {
                font-size: 14px;
                padding: 10px 15px;
                flex-wrap: wrap;
                gap: 5px;
            }
            .amo-exam-table-wrap {
                padding: 8px;
            }
        }
    `);

    /**********************
     * WAIT FOR AJAX
     **********************/
    let processed = false;

    const observer = new MutationObserver(() => {
        const examTables = document.querySelectorAll('table.border[style*="width:747px"]');
        if (!examTables.length || processed) return;

        let targetTable = null;
        for (const table of examTables) {
            const headers = table.querySelectorAll('thead th, tr:first-child th, tr:first-child td');
            for (const th of headers) {
                if (th.textContent.trim().includes('کد درس')) {
                    targetTable = table;
                    break;
                }
            }
            if (targetTable) break;
        }

        if (!targetTable) {
            log("Exam table not found yet");
            return;
        }

        log("Exam table found, processing...");
        processed = true;
        observer.disconnect();

        buildModernExamTable(targetTable);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also check immediately
    setTimeout(() => {
        const examTables = document.querySelectorAll('table.border[style*="width:747px"]');
        if (examTables.length && !processed) {
            let targetTable = null;
            for (const table of examTables) {
                const headers = table.querySelectorAll('thead th, tr:first-child th, tr:first-child td');
                for (const th of headers) {
                    if (th.textContent.trim().includes('کد درس')) {
                        targetTable = table;
                        break;
                    }
                }
                if (targetTable) break;
            }
            if (targetTable) {
                processed = true;
                observer.disconnect();
                buildModernExamTable(targetTable);
            }
        }
    }, 1500);

    /**********************
     * BUILD MODERN EXAM TABLE
     **********************/
    function buildModernExamTable(originalTable) {
        log("Building modern exam table...");

        // Get student info from the header table
        let studentInfo = {
            id: '',
            name: '',
            nationalCode: '',
            major: '',
            semester: '',
            level: '',
            entryYear: '',
            date: ''
        };

        // Look for the student info table (the one with "ش دانشجویی" etc.)
        const allTables = document.querySelectorAll('table[style*="width:747px"]');
        for (const table of allTables) {
            const text = table.textContent;
            if (text.includes('ش دانشجویی') && text.includes('نام دانشجو')) {
                const rows = table.querySelectorAll('tr');
                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    const rowText = row.textContent;
                    if (rowText.includes('ش دانشجویی') && cells.length >= 2) {
                        studentInfo.id = cells[1]?.textContent.trim() || '';
                    }
                    if (rowText.includes('نام دانشجو') && cells.length >= 2) {
                        studentInfo.name = cells[1]?.textContent.trim() || '';
                    }
                    if (rowText.includes('کدملی') && cells.length >= 2) {
                        studentInfo.nationalCode = cells[1]?.textContent.trim() || '';
                    }
                    if (rowText.includes('ترم آزمون') && cells.length >= 2) {
                        studentInfo.semester = cells[1]?.textContent.trim() || '';
                    }
                    if (rowText.includes('مقطع') && cells.length >= 2) {
                        studentInfo.level = cells[1]?.textContent.trim() || '';
                    }
                    if (rowText.includes('رشته') && cells.length >= 2) {
                        studentInfo.major = cells[1]?.textContent.trim() || '';
                    }
                    if (rowText.includes('ورودی') && cells.length >= 2) {
                        studentInfo.entryYear = cells[1]?.textContent.trim() || '';
                    }
                }
                break;
            }
        }

        // Get date from the top header
        for (const table of allTables) {
            const text = table.textContent;
            if (text.includes('تاریخ')) {
                const dateMatch = text.match(/تاریخ\s*:([^\d]*)([\d\/]+)/);
                if (dateMatch) {
                    studentInfo.date = dateMatch[2]?.trim() || '';
                }
                break;
            }
        }

        // Get the photo
        const photoImg = document.querySelector('img[src*="data:image/png;base64"]');
        const photoHtml = photoImg ? `<img src="${photoImg.src}" style="width:60px;height:85px;" />` : '';

        // Extract exam data from the table
        const examRows = [];
        const rows = originalTable.querySelectorAll('tr');

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');

            if (cells.length >= 11) {
                // Check if this is a data row (has some content)
                const code = cells[0]?.textContent.trim() || '';
                const name = cells[1]?.textContent.trim() || '';

                // Skip empty rows
                if (!code && !name) continue;

                const examData = {
                    code: code,
                    name: name,
                    group: cells[2]?.textContent.trim() || '',
                    professor: cells[3]?.textContent.trim() || '',
                    date: cells[4]?.textContent.trim() || '',
                    day: cells[5]?.textContent.trim() || '',
                    time: cells[6]?.textContent.trim() || '',
                    duration: cells[7]?.textContent.trim() || '',
                    seat: cells[8]?.textContent.trim() || '',
                    location: cells[9]?.textContent.trim() || '',
                    faculty: cells[10]?.textContent.trim() || ''
                };

                // Only add if it has at least a code or name
                if (examData.code || examData.name) {
                    examRows.push(examData);
                }
            }
        }

        log(`Found ${examRows.length} exam entries`);

        // Create modern wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'amo-exam-wrapper';

        // Title
        const semesterDisplay = studentInfo.semester || 'ترم جاری';
        wrapper.innerHTML = `
            <div class="amo-exam-title">
                <span>📋 برنامه امتحانات</span>
                <span class="badge">${semesterDisplay}</span>
            </div>
        `;

        // Student info header - only if we have data
        const hasInfo = studentInfo.id || studentInfo.name || studentInfo.nationalCode ||
            studentInfo.major || studentInfo.level || studentInfo.entryYear;

        if (hasInfo) {
            let headerHtml = `<div class="amo-exam-header">`;

            // Build grid items - 3 columns of label:value pairs
            const infoFields = [
                { label: 'ش دانشجویی:', value: studentInfo.id },
                { label: 'نام دانشجو:', value: studentInfo.name, bold: true },
                { label: 'کدملی:', value: studentInfo.nationalCode },
                { label: 'ترم آزمون:', value: studentInfo.semester },
                { label: 'رشته:', value: studentInfo.major },
                { label: 'مقطع:', value: studentInfo.level },
                { label: 'ورودی:', value: studentInfo.entryYear },
            ];

            // Filter out empty values
            const filteredFields = infoFields.filter(f => f.value);

            // Display up to 6 fields in 3 columns
            const displayFields = filteredFields.slice(0, 6);

            displayFields.forEach((field) => {
                headerHtml += `
                    <span class="label">${field.label}</span>
                    <span class="value ${field.bold ? 'bold' : ''}">${field.value}</span>
                `;
            });

            // Fill remaining columns with empty cells if needed for grid alignment
            const remaining = 6 - displayFields.length;
            for (let i = 0; i < remaining; i++) {
                headerHtml += `<span></span><span></span>`;
            }

            if (photoHtml) {
                headerHtml += `<div class="photo">${photoHtml}</div>`;
            }
            headerHtml += `</div>`;
            wrapper.innerHTML += headerHtml;
        }

        // Exam table
        let tableHtml = `<div class="amo-exam-table-wrap">`;
        if (examRows.length > 0) {
            tableHtml += `
                <table class="amo-exam-table">
                    <thead>
                        <tr>
                            <th>کد درس</th>
                            <th>نام درس</th>
                            <th>گروه</th>
                            <th>استاد</th>
                            <th>تاریخ</th>
                            <th>روز</th>
                            <th>ساعت</th>
                            <th>مدت</th>
                            <th>صندلی</th>
                            <th>محل</th>
                            <th>دانشکده</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            examRows.forEach((exam) => {
                tableHtml += `
                    <tr>
                        <td class="course-code">${exam.code || '-'}</td>
                        <td class="course-name">${exam.name || '-'}</td>
                        <td class="group-code">${exam.group || '-'}</td>
                        <td class="prof-name">${exam.professor || '-'}</td>
                        <td class="exam-date">${exam.date || '-'}</td>
                        <td class="exam-day">${exam.day || '-'}</td>
                        <td class="exam-time">${exam.time || '-'}</td>
                        <td class="exam-duration">${exam.duration || '-'}</td>
                        <td class="seat-number">${exam.seat || '-'}</td>
                        <td class="location">${exam.location || '-'}</td>
                        <td class="faculty">${exam.faculty || '-'}</td>
                    </tr>
                `;
            });

            tableHtml += `
                    </tbody>
                </table>
            `;
        } else {
            tableHtml += `
                <div class="amo-exam-empty">
                    <span class="icon">📭</span>
                    هیچ درسی برای این ترم ثبت نشده است
                </div>
            `;
        }
        tableHtml += `</div>`;
        wrapper.innerHTML += tableHtml;

        // Find the container div and insert our wrapper
        const containerDiv = document.querySelector('div[align="center"][style*="padding-left: 20px;"]') ||
            document.querySelector('div[align="center"]');

        if (containerDiv) {
            // Hide original content (all tables and other elements)
            const allElements = containerDiv.children;
            for (const el of allElements) {
                // Don't hide our wrapper
                if (!el.classList || !el.classList.contains('amo-exam-wrapper')) {
                    el.style.display = 'none';
                }
            }

            // Insert wrapper at the beginning
            containerDiv.insertBefore(wrapper, containerDiv.firstChild);
            log("Modern exam table inserted successfully!");
        } else {
            // Fallback: find the body and append
            document.body.appendChild(wrapper);
            log("Modern exam table appended to body");
        }
    }

})();
