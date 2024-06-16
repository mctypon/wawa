// ==UserScript==
// @name        Wawa Downloader
// @namespace   Violentmonkey Scripts
// @match       https://www.wawacity.*/*&id=*
// @grant       none
// @version     0.5
// @author      mctypon
// @description Batch download links from Wawa movies, shows and animes sections.
// @icon        https://www.wawacity.fit/favicon32.png
// @updateURL   https://raw.githubusercontent.com/mctypon/wawa/main/wawa.user.js
// ==/UserScript==
(function() {
    var button = document.createElement("button");
    button.innerHTML = "Download";

    // Button style
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

    // Hover effect
    button.addEventListener("mouseover", function() {
        button.style.backgroundColor = "#218838"; // Darker green color on hover
        button.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
    });

    button.addEventListener("mouseout", function() {
        button.style.backgroundColor = "#28a745";
        button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    });

    document.body.appendChild(button);

    function runScript() {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

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


            if(type=="film"){
                const title = fullTitle.split('[')[0].trim();
                let linkRows = table.querySelectorAll("tr");
                let movieTd;
                for (const linkRow of linkRows){
                    if(linkRow.textContent.trim().includes("1fichier")){
                        movieTd = linkRow.querySelector('td:first-child');
                        let button = movieTd.querySelector('button');

                        let link = button.getAttribute('data-href');
                        if (link && link.includes('dl-protect')) {
                            button.click();
                            await sleep(5000);
                        }

                        button = movieTd.querySelector('button.btn-copy-clipboard');

                        link = button.getAttribute('data-href');

                        const afIndex = link.indexOf('&af=');
                        if (afIndex !== -1) {
                            link = link.substring(0, afIndex);
                        }
                        link = link.replace(/\s+/g, '');

                        const output = `CAT;TITLE;SAISON;URLS\n${type};${title};;"${link}"`;
                        console.log(output);

                        const blob = new Blob([output], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${title}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                }

            }else{
                const title = fullTitle.split(' - ')[0].trim();
                const startIndex = parseInt(prompt("Enter the episode number to start from:"), 10);
                if (isNaN(startIndex) || startIndex < 1) {
                    console.error('Invalid start index.');
                    return;
                }
                const seasonElement = document.querySelector('.detail-list > li:nth-child(3) > b:nth-child(2)');
                const season = seasonElement ? seasonElement.textContent.trim() : 'Unknown';
                const episodeRows = table.querySelectorAll('tbody > tr.title.episode-title');

                let episodeLinks =  [];
                let linkRows = table.querySelectorAll("tr");
                for (const linkRow of linkRows){
                    if(linkRow.textContent.trim().includes("1fichier")){
                        const episodeLink = linkRow.querySelector('td:first-child');
                        episodeLinks.push(episodeLink);
                    }
                }

                for(let i= startIndex - 1;i<episodeLinks.length;i++){
                    const episodeRow = episodeRows[i];
                    if (episodeRow.getAttribute("class").includes("active")) {
                        episodeRow.click();
                        await sleep(200);
                    }
                    let button = episodeLinks[i].querySelector('button');
                    if (button) {
                        let link = button.getAttribute('data-href');
                        if (link && link.includes('dl-protect')) {
                            button.click();
                            await sleep(5000);
                        }
                    }
                }

                let links = {};
                let index = 1;
                let episodes = [];
                linksButtons = table.querySelectorAll('button');
                for (const episodeLink of episodeLinks) {
                    const button = episodeLink.querySelector("button");
                    let link = button.getAttribute('data-href');
                    if (link && link.includes('1fichier')) {
                        episodes.push(index);
                        const afIndex = link.indexOf('&af=');
                        if (afIndex !== -1) {
                            link = link.substring(0, afIndex);
                        }
                        link = link.replace(/\s+/g, '');
                        links[index++] = link;
                    } else{
                        index++;
                    }
                }


                const formattedLinks = JSON.stringify(links);
                const output = `CAT;TITLE;SAISON;URLS\n${type};${title};${season};${formattedLinks}`;
                console.log(output);

                const blob = new Blob([output], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title} S${season} E${episodes[0]}-${episodes[episodes.length-1]}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            }

        }

        clickLinks();
    }

    button.addEventListener("click", runScript);
})();