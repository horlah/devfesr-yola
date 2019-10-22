const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = process.env.PORT || 1234;

async function getPDF(url, name) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: `docs/${name}.pdf`,
        format: 'A4'
    });

    await browser.close();
    return;
}

async function getScreenshot(url, name, format) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    await page.screenshot({
        path: `docs/${name}.${format}`,
        fullPage: true,
        type: format
    });

    await browser.close();
    return;
}

async function instagram(instagramLink) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(instagramLink, { waitUntil: 'networkidle0' });

    const imageLink = await page.$eval('.FFVAD', (element) => element.getAttribute('src'));

    await browser.close();
    return imageLink;
}

function handleError(res, error) {
    console.log(error);
    return res.sendFile(__dirname + `/views/404.html`);
}

app.get('/pdf', (req, res) => {
    getPDF(req.query.url, req.query.name)
        .then(() => res.sendFile(__dirname + `/docs/${req.query.name}.pdf`))
        .catch((error) => { return handleError(res, error); });
});

app.get('/screenshot', (req, res) => {
    getScreenshot(req.query.url, req.query.name, req.query.format)
        .then(() => res.sendFile(__dirname + `/docs/${req.query.name}.${req.query.format}`))
        .catch((error) => { return handleError(res, error); });
});

app.get('/instagram', (req, res) => {
    instagram(req.query.url)
        .then((imageLink) => res.redirect(imageLink))
        .catch((error) => { return handleError(res, error); });
});

app.listen(port);
console.log('Magic happens on port ' + port);
