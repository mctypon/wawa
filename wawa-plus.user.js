// ==UserScript==
// @name        Wawa Downloader & Uploader
// @namespace   Violentmonkey Scripts
// @match       https://www.wawacity.*/*&id=*
// @grant       none
// @version     0.8
// @author      mctypon
// @description Batch download & upload 1fichier links from Wawa movies, shows and animes sections in a vstream compatible format.
// @icon        https://www.wawacity.beauty/favicon32.png
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @grant       GM_registerMenuCommand
// @updateURL   https://raw.githubusercontent.com/mctypon/wawa/main/wawa-plus.user.js
// ==/UserScript==
(function() {
    'use strict';
    /* Menu */
    // Create a notification container
    function createNotificationContainer() {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.bottom = '20px';   // Position it at the bottom
        notificationContainer.style.right = '20px';    // Align it to the right
        notificationContainer.style.padding = '12px 24px';
        notificationContainer.style.backgroundColor = '#4CAF50';  // Green color for validation
        notificationContainer.style.color = '#fff';
        notificationContainer.style.fontSize = '14px';
        notificationContainer.style.borderRadius = '8px';
        notificationContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        notificationContainer.style.opacity = '0';
        notificationContainer.style.transition = 'opacity 0.4s, transform 0.4s';
        notificationContainer.style.transform = 'translateY(20px)';
        document.body.appendChild(notificationContainer);
        return notificationContainer;
    }

    const notificationContainer = createNotificationContainer();

    // Show a notification message
    function showNotification(message) {
        notificationContainer.textContent = message;
        notificationContainer.style.opacity = '1';
        notificationContainer.style.transform = 'translateY(0)';

        // Hide the notification after 2 seconds
        setTimeout(() => {
            notificationContainer.style.opacity = '0';
            notificationContainer.style.transform = 'translateY(20px)';
        }, 2000);
    }

    let currentHost = GM_getValue("host", "1fichier");
    function setOption(host) {
        GM_setValue("host",host);
        showNotification(`Selected host: ${host}`);
        currentHost = GM_getValue("host");
        updateMenu();
    }
    function updateMenu() {
        GM_registerMenuCommand("Select host : 1fichier", () => setOption("1fichier"));
        GM_registerMenuCommand("Select host : Rapidgator", () => setOption("Rapidgator"));
    }
    updateMenu();
    
    /* UI */
    // Download Button
    var rootBody = document.querySelector('body#am');
    var downloadButton = document.createElement("button");
    downloadButton.innerHTML = "Download";

    // Download style
    downloadButton.style.position = "fixed";
    downloadButton.style.top = "10px";
    downloadButton.style.right = "10px";
    downloadButton.style.zIndex = "10000";
    downloadButton.style.padding = "8px 16px";
    downloadButton.style.fontSize = "14px";
    downloadButton.style.color = "#fff";
    downloadButton.style.backgroundColor = "#28a745"; // Green color
    downloadButton.style.border = "none";
    downloadButton.style.borderRadius = "5px";
    downloadButton.style.cursor = "pointer";
    downloadButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    downloadButton.style.transition = "background-color 0.3s, box-shadow 0.3s";

    // Hover effect
    downloadButton.addEventListener("mouseover", function() {
        downloadButton.style.backgroundColor = "#218838"; // Darker green color on hover
        downloadButton.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
    });
    downloadButton.addEventListener("mouseout", function() {
        downloadButton.style.backgroundColor = "#28a745";
        downloadButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    });

    if(rootBody)
    rootBody.appendChild(downloadButton);

    // Upload button
    var uploadButton = document.createElement("button");
    uploadButton.innerHTML = "Upload";

    // Upload button style
    uploadButton.style.position = "fixed";
    uploadButton.style.top = "50px"; // Placed below the Download button with a margin
    uploadButton.style.right = "10px";
    uploadButton.style.zIndex = "10000";
    uploadButton.style.padding = "8px 16px";
    uploadButton.style.fontSize = "14px";
    uploadButton.style.color = "#fff";
    uploadButton.style.backgroundColor = "#007bff"; // Blue color
    uploadButton.style.border = "none";
    uploadButton.style.borderRadius = "5px";
    uploadButton.style.cursor = "pointer";
    uploadButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    uploadButton.style.transition = "background-color 0.3s, box-shadow 0.3s";

    // Hover effect for Upload button
    uploadButton.addEventListener("mouseover", function() {
        uploadButton.style.backgroundColor = "#0069d9"; // Darker blue color on hover
        uploadButton.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
    });

    uploadButton.addEventListener("mouseout", function() {
        uploadButton.style.backgroundColor = "#007bff";
        uploadButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    });

    if(rootBody)
    rootBody.appendChild(uploadButton);

    // Check button
    var checkButton = document.createElement("button");
    checkButton.innerHTML = "Check";

    // Check button style
    checkButton.style.position = "fixed";
    checkButton.style.top = "90px";
    checkButton.style.right = "10px";
    checkButton.style.zIndex = "10000";
    checkButton.style.padding = "8px 16px";
    checkButton.style.fontSize = "14px";
    checkButton.style.color = "#fff";
    checkButton.style.backgroundColor = "#ffc107"; // Yellow color
    checkButton.style.border = "none";
    checkButton.style.borderRadius = "5px";
    checkButton.style.cursor = "pointer";
    checkButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    checkButton.style.transition = "background-color 0.3s, box-shadow 0.3s";

    // Hover effect for Check button
    checkButton.addEventListener("mouseover", function() {
        checkButton.style.backgroundColor = "#e0a800"; // Darker yellow color on hover
        checkButton.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
    });

    checkButton.addEventListener("mouseout", function() {
        checkButton.style.backgroundColor = "#ffc107";
        checkButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    });

    if(rootBody)
    rootBody.appendChild(checkButton);

    /* Helpers */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getLink(button) {
        let link = button.getAttribute('data-href');
        if (link) {
          if(link.includes("1fichier")){
            const afIndex = link.indexOf('&af=');
            if (afIndex !== -1) {
                link = link.substring(0, afIndex);
            }
          }
          return link.replace(/\s+/g, '');
        }
        return null;
    }

    function downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function handleButtonClick(button) {
        let link = button.getAttribute('data-href');
        if (link && link.includes('dl-protect')) {
            button.click();
            let wait = Math.floor(Math.random() * 6) + 5;
            await sleep(wait * 1000);
        }
    }

    // Server data
    function getTargetUrl() {
        return GM_getValue('targetUrl');
    }

    function setTargetUrl(newUrl) {
        GM_setValue('targetUrl', newUrl);
    }

    // postData
    function postData(entry,targetUrl,route) {
        const data = {
            content: entry
        };
        GM_xmlhttpRequest({
            method: 'POST',
            url: targetUrl+route,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ content: data.content }),
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    alert('Success: '+response.responseText);
                } else {
                    alert('Error: '+response.statusText);
                }
            },
            onerror: function(error) {
                alert('Request failed: ', error);
            }
        });
    }
    // GetData
    function GetData(targetUrl,type, title, season) {
        var params = `${type}=${encodeURIComponent(title)}`;
        if (season) {
            params += `&s=${encodeURIComponent(season)}`;
        }
        var url = `${targetUrl}check?${params}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                if (response.status === 200) {
                    alert(response.responseText);
                } else {
                    alert('Sorry : ' + response.responseText);
                }
            },
            onerror: function(error) {
                alert('Request failed: ' + error);
            }
        });
    }

    /* Main */
    async function clickLinks() {
        const table = document.getElementById('DDLLinks');
        if (!table) {
            console.error('Table with id "DDLLinks" not found.');
            return;
        }
        const titleSpan = document.querySelector('h1.wa-block-title > span:nth-child(1)');
        if (!titleSpan) {
            console.error('Title span not found.');
            return;
        }
        const titleText = titleSpan.textContent.trim();
        const [category, fullTitle] = titleText.split(' » ');
        const type = category.toLowerCase() === 'animés' ? 'anime' : category.toLowerCase() === 'films' ? 'film' : 'serie';
    
        if (type === "film") {
            const title = fullTitle.split('[')[0].trim();
            let linkRows = table.querySelectorAll("tr");
            
            for (const linkRow of linkRows) {
                if (linkRow.textContent.trim().toLowerCase().includes(currentHost.toLowerCase())) {
                    const movieTd = linkRow.querySelector('td:first-child');
                    let button = movieTd.querySelector('button');
                    await handleButtonClick(button);
                    button = movieTd.querySelector('button.btn-copy-clipboard');
                    const link = getLink(button);
                    if (link) {
                        const output = `CAT;TITLE;SAISON;URLS\n${type};${title};;"${link}"`;
                        console.log(output);
                        downloadFile(`${title}.txt`, output);
                    }
                    break;
                }
            }
        } else {
            const title = fullTitle.split(' - ')[0].trim();
            const episodeRange = prompt("Enter the episode range (e.g., '1' or '1-8'):");
            if (!episodeRange) {
                console.error('Invalid input for episode range.');
                return;
            }
            
            const [start, end] = episodeRange.split('-').map(Number);
            const startIndex = start ? start - 1 : 0;
            const endIndex = end ? end - 1 : null;
            const seasonElement = document.querySelector('.detail-list > li:nth-child(3) > b:nth-child(2)');
            const season = seasonElement ? seasonElement.textContent.trim() : 'Unknown';
            
            // Get all episode title rows and link rows
            const rows = Array.from(table.querySelectorAll('tbody > tr'));
            const episodeLinks = [];
            let currentEpisodeLinks = [];
            let isCollectingLinks = false;
    
            // Process rows to group links by episode
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                
                if (row.classList.contains('episode-title')) {
                    // If we were collecting links and find a new episode title
                    if (isCollectingLinks && currentEpisodeLinks.length > 0) {
                        // Find the first link with currentHost and add it to episodeLinks
                        const firstHostLink = currentEpisodeLinks.find(link => 
                            link.textContent.trim().toLowerCase().includes(currentHost.toLowerCase())
                        );
                        if (firstHostLink) {
                            episodeLinks.push(firstHostLink.querySelector('td:first-child'));
                        }
                    }
                    // Start collecting links for new episode
                    currentEpisodeLinks = [];
                    isCollectingLinks = true;
                } else if (isCollectingLinks && row.classList.contains('link-row')) {
                    currentEpisodeLinks.push(row);
                }
            }
            
            // Handle the last episode's links
            if (currentEpisodeLinks.length > 0) {
                const firstHostLink = currentEpisodeLinks.find(link => 
                    link.textContent.trim().toLowerCase().includes(currentHost.toLowerCase())
                );
                if (firstHostLink) {
                    episodeLinks.push(firstHostLink.querySelector('td:first-child'));
                }
            }
    
            // Process the selected links within the specified range
            for (let i = startIndex; i < episodeLinks.length && (endIndex === null || i <= endIndex); i++) {
                const episodeRow = rows.find(row => 
                    row.classList.contains('episode-title') && 
                    row.textContent.includes(`Épisode ${i + 1}`)
                );
                
                if (episodeRow && episodeRow.classList.contains('active')) {
                    episodeRow.click();
                    await sleep(200);
                }
                
                let button = episodeLinks[i]?.querySelector('button');
                if (button) {
                    await handleButtonClick(button);
                }
            }
    
            // Collect links for output
            let links = {};
            let index = start;
            for (let i = startIndex; i < episodeLinks.length && (endIndex === null || i <= endIndex); i++) {
                const button = episodeLinks[i]?.querySelector(".btn-copy-clipboard");
                if (button) {
                    const link = getLink(button);
                    if (link) {
                        links[index++] = link;
                    } else {
                        index++;
                    }
                } else {
                    index++;
                }
            }
    
            const formattedLinks = JSON.stringify(links);
            const output = `CAT;TITLE;SAISON;URLS\n${type};${title};${season};${formattedLinks}`;
            console.log(output);
            downloadFile(`${title} S${season}.txt`, output);
        }
    }

    function extractLinks() {
        // Server URL
        let targetUrl = getTargetUrl();
        if (!targetUrl) {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
            targetUrl = prompt('Enter the target URL for uploads:', '');
            if (urlPattern.test(targetUrl)) {
                if (!targetUrl.endsWith('/')) {
                    targetUrl += '/';
                }
                setTargetUrl(targetUrl);
            } else {
                alert('Target URL is required for uploading. Please set it through the prompt.');
                return;
            }
        }
        // Extract Links
        const table = document.getElementById('DDLLinks');
        if (!table) {
            console.error('Table with id "DDLLinks" not found.');
            return;
        }

        const titleSpan = document.querySelector('h1.wa-block-title > span:nth-child(1)');
        if (!titleSpan) {
            console.error('Title span not found.');
            return;
        }

        const titleText = titleSpan.textContent.trim();
        const [category, fullTitle] = titleText.split(' » ');
        const type = category.toLowerCase() === 'animés' ? 'anime' : category.toLowerCase() === 'films' ? 'film' : 'serie';

        if (type === "film") {
            const title = fullTitle.split('[')[0].trim();
            let linkRows = table.querySelectorAll("tr");

            for (const linkRow of linkRows) {
                if (linkRow.textContent.trim().toLowerCase().includes(currentHost.toLowerCase())) {
                    const movieTd = linkRow.querySelector('td:first-child');
                    const button = movieTd.querySelector('button.btn-copy-clipboard');

                    if (button) {
                        const link = getLink(button);
                        const output = `${type};${title};;"${link}"`;
                        console.log(output);
                        postData(output,targetUrl,type);
                    }else{
                        alert("Click Download button first !");
                    }
                }
            }
        } else {
            const title = fullTitle.split(' - ')[0].trim();
            const seasonElement = document.querySelector('.detail-list > li:nth-child(3) > b:nth-child(2)');
            const season = seasonElement ? seasonElement.textContent.trim() : 'Unknown';
            const episodeElements = table.querySelectorAll('tr.episode-title');
            let episodeLinks= {};

            for(let i=1; i <= episodeElements.length; i++){
                let linkRow = episodeElements[i-1].nextElementSibling;
                while (linkRow != episodeElements[i]){
                    const linkElement = linkRow.querySelector("td:first-child>a");
                    let link = linkElement.getAttribute("href");
                    if (link.trim().toLowerCase().includes(currentHost.toLowerCase())) {
                        if( currentHost == "1fichier"){
                         const afIndex = link.indexOf('&af=');
                         if (afIndex !== -1) {
                            link = link.substring(0, afIndex);
                         }
                        }
                        episodeLinks[i] = link.replace(/\s+/g, '');
                    }
                    linkRow = linkRow.nextElementSibling;
                }
            }

            if(Object.keys(episodeLinks).length != 0){
                const formattedLinks = JSON.stringify(episodeLinks);
                const output = `${type};${title};${season};${formattedLinks}`;
                console.log(output);
                postData(output,targetUrl,type);
            }else{
                alert("Click on Download button first !")
            }

        }
    }

    // Check Links
    function checkLinks() {
        // Server URL
        let targetUrl = getTargetUrl();
        if (!targetUrl) {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
            targetUrl = prompt('Enter the target URL for uploads:', '');
            if (urlPattern.test(targetUrl)) {
                if (!targetUrl.endsWith('/')) {
                    targetUrl += '/';
                }
                setTargetUrl(targetUrl);
            } else {
                alert('Target URL is required for uploading. Please set it through the prompt.');
                return;
            }
        }
        // Extract Links
        const table = document.getElementById('DDLLinks');
        if (!table) {
            console.error('Table with id "DDLLinks" not found.');
            return;
        }

        const titleSpan = document.querySelector('h1.wa-block-title > span:nth-child(1)');
        if (!titleSpan) {
            console.error('Title span not found.');
            return;
        }

        const titleText = titleSpan.textContent.trim();
        const [category, fullTitle] = titleText.split(' » ');
        const type = category.toLowerCase() === 'animés' ? 'a' : category.toLowerCase() === 'films' ? 'f' : 't';

        if (type === "f") {
            const title = fullTitle.split('[')[0].trim();
            GetData(targetUrl,type, title);

        } else {
            const title = fullTitle.split(' - ')[0].trim();
            const seasonElement = document.querySelector('.detail-list > li:nth-child(3) > b:nth-child(2)');
            const season = seasonElement ? seasonElement.textContent.trim() : 'Unknown';
            GetData(targetUrl,type,title,season);


        }
    }

    // Event listeners
    downloadButton.addEventListener("click", clickLinks);
    uploadButton.addEventListener("click", extractLinks);
    checkButton.addEventListener("click", checkLinks);
})();
