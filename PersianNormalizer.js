// ==UserScript==
// @name         Persian Text Normalizer
// @namespace    local.persian.normalize.smart
// @version      2.0
// @description  Normalize Persian text safely using persian-tools + smart heuristics (Bootstrap/Kendo safe)
// @match        https://bustan.tvu.ac.ir/Home/Index*
// @match        https://lms11.tvu.ac.ir/*
// @match        https://bustan.tvu.ac.ir/qr/*
// @run-at       document-end
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/@persian-tools/persian-tools/build/persian-tools.umd.js
// @icon         https://bustan.tvu.ac.ir/Content/Images/logo.png
// ==/UserScript==

(function () {
    'use strict';

    /* -----------------------------
       CONFIG
    ----------------------------- */

    const SKIP_TAGS = new Set([
        "SCRIPT",
        "STYLE",
        "NOSCRIPT",
        "TEXTAREA",
        "INPUT",
        "CODE",
        "PRE"
    ]);

    const SKIP_CLASSES = [
        "k-icon",
        "fa",
        "fas",
        "far",
        "fal",
        "fab",
        "glyphicon"
    ];

    /* -----------------------------
       Get rid of invisible chars
    ----------------------------- */

    function fixZWNJ(text) {
        return text.replace(/([\u0600-\u06FF\d]+)\u200c([\u0600-\u06FF\d]+)/g, (match, left, right) => {

            // Heuristic 1: allow normal compounds with short prefix (1-3 letters)
            if (/^(می|نمی|بی)$/.test(left) || /^(ها|تر|ترین|ای)$/.test(right)) {
                return left + "\u200c" + right;
            }

            // Heuristic 2: allow single letter + word (for abbreviation)
            if (left.length === 1 || right.length === 1) {
                return left + "\u200c" + right;
            }

            // Otherwise, it's probably “stuck words” → replace with space
            return left + " " + right;
        });
    }

    function normalizeInvisibleChars(text) {
        return text
            .replace(/[\u200c\u200d]/g, "\u200c")   // normalize ZWNJ
            .replace(/[\u200e\u200f]/g, "")         // remove direction marks
            .replace(/\u00a0/g, " ");               // NBSP → normal space
    }

    /* -----------------------------
       SMART ALEF-MAD HEURISTICS
       (safe patterns only)
    ----------------------------- */

    function normalizeAlefMadHeuristic(text) {

        let t = text;

        t = t.replace(/(^|\s)اموز/g, "$1آموز");
        t = t.replace(/(^|\s)اموخت/g, "$1آموخت");
        t = t.replace(/(^|\s)اروین(?=\s|$)/g, "$1آروین");

        return t;
    }

    /* -----------------------------
       PUNCTUATION RULE
       no space before
       one space after
    ----------------------------- */

    function normalizePunctuation(text) {
        return text.replace(/\s*([،,.;!؟؛!])\s*/g, "$1 ") // normal punctuation
            .replace(/(\d)\s*:\s*(\d)/g, "$1:$2"); // keep clock format intact
    }

    /* -----------------------------
       CORE NORMALIZER
    ----------------------------- */

    function normalizePersian(text) {

        if (!text) return text;

        let t = text;

        /* normalize hidden unicode first (CRITICAL) */
        t = normalizeInvisibleChars(t);

        /* library normalization */
        t = PersianTools.toPersianChars(t);

        /* alef-mad heuristic stage */
        t = normalizeAlefMadHeuristic(t);

        // 4. fix unwanted ZWNJ joins
        t = fixZWNJ(t);

        /* punctuation spacing */
        t = normalizePunctuation(t);

        /* collapse extra spaces */
        t = t.replace(/\s{2,}/g, " ");

        return t;
    }

    /* -----------------------------
       SAFE NODE CHECK
    ----------------------------- */

    function shouldSkipNode(node) {

        if (!node.parentElement) return true;

        const tag = node.parentElement.tagName;
        if (SKIP_TAGS.has(tag)) return true;

        const classList = node.parentElement.classList;
        if (classList) {
            for (const cls of SKIP_CLASSES) {
                if (classList.contains(cls)) return true;
            }
        }

        return false;
    }

    /* -----------------------------
       PROCESS TEXT NODE
    ----------------------------- */

    function processTextNode(node) {

        if (!node.nodeValue) return;

        if (!/[اآبپتثجچحخدذرزسشصضطظعغفقکگلمنوهی]/.test(node.nodeValue))
            return;

        if (shouldSkipNode(node)) return;

        const normalized = normalizePersian(node.nodeValue);

        if (normalized !== node.nodeValue) {
            node.nodeValue = normalized;
        }
    }

    /* -----------------------------
       WALKER
    ----------------------------- */

    function normalizeDOM(root) {

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node;
        while ((node = walker.nextNode())) {
            processTextNode(node);
        }
    }

    /* -----------------------------
       INITIAL RUN
    ----------------------------- */

    normalizeDOM(document.body);

    /* -----------------------------
       OBSERVER (AJAX / Kendo safe)
    ----------------------------- */

    const observer = new MutationObserver((mutations) => {

        for (const m of mutations) {

            for (const node of m.addedNodes) {

                if (node.nodeType === Node.TEXT_NODE) {
                    processTextNode(node);
                }

                if (node.nodeType === Node.ELEMENT_NODE) {
                    normalizeDOM(node);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
