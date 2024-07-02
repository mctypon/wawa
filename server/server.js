// ==NodeJS Server==
// @version     2.0
// @author      mctypon
// @description Backend for processing uploads from user script.
// ==/NodeJS Server==

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
// Home route
app.get('/', (req, res) => {
    res.send('Server v2 running.');
});


// Middleware to parse JSON bodies
app.use(bodyParser.json());

function parseContent(content) {
    const parts = content.split(';');
    if (parts.length !== 4) {
        return null;
    }

    const [cat, title, season, urls] = parts;

    let parsedUrls;
    try {
        parsedUrls = cat === 'film' ? urls : JSON.parse(urls);
    } catch (e) {
        return null;
    }

    return { cat, title, season, urls: parsedUrls };
}

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        return '';
    }
}

function writeFile(filePath, data) {
    fs.writeFileSync(filePath, data);
}

function updateFile(filePath, parsedData) {
    let existingContent = readFile(filePath);
    let newContent = '';
    let updated = false;

    existingContent.split('\n').forEach(line => {
        if (line.trim()) {
            const data = parseContent(line);
            if (!data) {
                newContent += line + '\n';
                return;
            }
            if (data.cat === parsedData.cat && data.title === parsedData.title) {
                if (parsedData.cat === 'film') {
                    newContent += `${parsedData.cat};${parsedData.title};${parsedData.season};${parsedData.urls}\n`;
                    updated = true;
                } else if (data.season === parsedData.season) {
                    const combinedUrls = { ...data.urls, ...parsedData.urls };
                    newContent += `${parsedData.cat};${parsedData.title};${parsedData.season};${JSON.stringify(combinedUrls)}\n`;
                    updated = true;
                } else {
                    newContent += line + '\n';
                }
            } else {
                newContent += line + '\n';
            }
        }
    });

    if (!updated) {
        newContent += `${parsedData.cat};${parsedData.title};${parsedData.season};${parsedData.cat === 'film' ? parsedData.urls : JSON.stringify(parsedData.urls)}\n`;
    }

    writeFile(filePath, newContent);
}

// POST endpoint for adding content
app.post('/:category', (req, res) => {
    const content = req.body.content;javascript:;
    const category = req.params.category;

    const validCategories = ['anime', 'serie', 'film'];
    if (!validCategories.includes(category)) {
        return res.status(400).send('Invalid category');
    }

    if (!content) {
        return res.status(400).send('No content provided');
    }

    const parsedData = parseContent(content);
    if (!parsedData) {
        return res.status(400).send('Invalid content format');
    }

    const filePath = path.join(__dirname, `${category}.txt`);
    updateFile(filePath, parsedData);
    res.status(200).send(`${category} added`);
});

// Check endpoint
app.get('/check', (req, res) => {
    const { f, t, s, a } = req.query;

    let category, title, season;

    if (f) {
        category = 'film';
        title = f;
    } else if (t && s) {
        category = 'serie';
        title = t;
        season = s;
    } else if (a && s) {
        category = 'anime';
        title = a;
        season = s;
    } else {
        return res.status(400).send('Invalid query parameters');
    }

    const filePath = path.join(__dirname, `${category}.txt`);
    const existingContent = readFile(filePath);
    let found = false;
    let result = {};

    existingContent.split('\n').forEach(line => {
        if (line.trim()) {
            const data = parseContent(line);
            if (!data) return;

            if (data.cat === category && data.title === title) {
                if (category === 'film') {
                    found = true;
                } else if (data.season === season) {
                    found = true;
                    result = data.urls;
                }
            }
        }
    });

    if (found) {
        if (category === 'film') {
            res.status(200).send('Movie exists');
        } else {
            const episodes = Object.keys(result).join(', ');
            res.status(200).send(`${title} - Season ${season} exists: Episode ${episodes}`);
        }
    } else {
        res.status(404).send('Entry not found');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
