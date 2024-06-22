// ==UserScript==
// @name         Download Button Script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Run a script when a button is pressed to download something
// @author       Your Name
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create the button
    var button = document.createElement("button");
    button.innerHTML = "Download";

    // Add modern styles to the button
    button.style.position = "fixed";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.zIndex = "1000";
    button.style.padding = "8px 16px";
    button.style.fontSize = "14px";
    button.style.color = "#fff";
    button.style.backgroundColor = "#28a745"; // Green color
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    button.style.transition = "background-color 0.3s, box-shadow 0.3s";

    // Add hover effect
    button.addEventListener("mouseover", function() {
        button.style.backgroundColor = "#218838"; // Darker green color on hover
        button.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
    });

    button.addEventListener("mouseout", function() {
        button.style.backgroundColor = "#28a745";
        button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    });

    // Append the button to the body (or any other container)
    document.body.appendChild(button);

    // Define the script to be run when the button is clicked
    function runScript() {
        alert("Download button was pressed!");
        // Place your download logic here
    }

    // Add an event listener to the button
    button.addEventListener("click", runScript);
})();
