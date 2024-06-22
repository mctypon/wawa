javascript: (function () {
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


        if (type == "film") {
            const title = fullTitle.split('[')[0].trim();
            let linkRows = table.querySelectorAll("tr");
            let movieTd;
            for (const linkRow of linkRows) {
                if (linkRow.textContent.trim().includes("1fichier")) {
                    movieTd = linkRow.querySelector('td:first-child');
                    let button = movieTd.querySelector('button');

                    let link = button.getAttribute('data-href');
                    if (link && link.includes('dl-protect')) {
                        button.click();
                        let wait = Math.floor(Math.random() * 6) + 5;
                        await sleep(wait * 1000);
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

        } else {
            const title = fullTitle.split(' - ')[0].trim();
            const startIndex = parseInt(prompt("Enter the episode number to start from:"), 10);
            if (isNaN(startIndex) || startIndex < 1) {
                console.error('Invalid start index.');
                return;
            }
            const seasonElement = document.querySelector('.detail-list > li:nth-child(3) > b:nth-child(2)');
            const season = seasonElement ? seasonElement.textContent.trim() : 'Unknown';
            const episodeRows = table.querySelectorAll('tbody > tr.title.episode-title');

            let episodeLinks = [];
            let linkRows = table.querySelectorAll("tr");
            for (const linkRow of linkRows) {
                if (linkRow.textContent.trim().includes("1fichier")) {
                    const episodeLink = linkRow.querySelector('td:first-child');
                    episodeLinks.push(episodeLink);
                }
            }

            for (let i = startIndex - 1; i < episodeLinks.length; i++) {
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
                        let wait = Math.floor(Math.random() * 6) + 5;
                        await sleep(wait * 1000);
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
                } else {
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
            a.download = `${title} S${season} E${episodes[0]}-${episodes[episodes.length - 1]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }

    }

    clickLinks();

})();
