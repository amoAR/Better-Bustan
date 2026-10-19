// ==UserScript==
// @name        Bustan Login Redesign
// @namespace   amoAR
// @match       https://bustan.tvu.ac.ir/
// @match       https://bustan.tvu.ac.ir/Account/Login
// @match       https://bustan.tvu.ac.ir/Account/SessionExceed
// @match       https://bustan.tvu.ac.ir/Account/Logout
// @run-at      document-idle
// @version     1.0
// @author      -
// @grant       GM_addStyle
// @description 7/13/2024, 5:17:46 PM
// @icon        https://bustan.tvu.ac.ir/Content/Images/logo.png
// ==/UserScript==

// Fix background
GM_addStyle(`
    :root {
        --s: 30px;
    }

    html, body {
        background:
            radial-gradient(27% 29% at right, #0000 83%, #b09f79 85% 99%, #0000 101%) calc(var(--s)/ 2) var(--s),
            radial-gradient(27% 29% at left, #0000 83%, #b09f79 85% 99%, #0000 101%) calc(var(--s)/-2) var(--s),
            radial-gradient(29% 27% at top, #0000 83%, #b09f79 85% 99%, #0000 101%) 0 calc(var(--s)/ 2),
            radial-gradient(29% 27% at bottom, #0000 83%, #b09f79 85% 99%, #0000 101%) 0 calc(var(--s)/-2),
            #476074;
        background-size: calc(2 * var(--s)) calc(2 * var(--s));
    }
`);

// Fix login container
GM_addStyle(`
    /* Wrapper */
    .wrap {
        box-shadow: none;
        width: 100%;
        max-width: 900px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        display: flex;
        overflow: hidden;
    }
    form h3 {
        font-weight: bolder;
    }

    /* Left container */
    .wrap .content-container .left-container {
    }
    img[src="/Content/Images/logo.png"] {
        filter: contrast(0.85) opacity(0.75) drop-shadow(2px 4px 10px black);
    }
    .application-version {
        display: none;
    }

    /* Right container */
    .wrap .content-container .right-container {
        background: rgba(70, 120, 190, 0.2);  /* Steel blue with transparency */
        backdrop-filter: blur(15px) saturate(180%);
        border-top: 2px solid rgba(255, 255, 255, 0.2);
        border-right: 2px solid rgba(255, 255, 255, 0.2);
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }

    /* Inputs */
    .input-container {
        position: relative;
        margin-bottom: 15px;
    }
    .input-container input[id="captcha"] {
        text-align: center !important;
    }
    .form-control {
        width: 100%;
        padding: 12px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        outline: none;
        background-color: rgba(255, 255, 255, 0.2);
    }
    .form-control:focus {
        border:4px solid #2a5298;
        box-shadow: 2px 2px 5px rgba(42, 82, 152, 0.5);
        background-color: rgba(255, 255, 255, 0.2);
    }
    .form-control + .floating-label::after {
        background: #647AAD !important;
    }
    .form-control + .floating-label {
        color: #f5f5f5 !important;
    }
    #togglepassword {
        border: none;
        background-color: rgba(255, 255, 255, 0.5);
    }
    .input-container.valid::after, .input-container.invalid::after {
        top: 57% !important;
    }

    /* Buttons */
    button {
        width: 100%;
        padding: 12px;
        background: #2a5298;
        border: none;
        color: white;
        font-size: 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.3s;
    }
    button:hover {
        background: #1e3c72;
    }

    /* Lists */
    .list-group-item {
        text-align: start;
        padding: 10px;
        color: #f5f5f5 !important;
        text-decoration: none;
        display: block;
        background: transparent;
        border: none;
    }
    .list-group-item:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`);
