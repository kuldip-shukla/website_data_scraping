const PORT = 4000;
const express = require('express');
const puppeteer = require('puppeteer');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const mongoose = require('mongoose');
const model = require('./model');

const app = express();

const url = "https://www.amazon.com/s?srs=5286335011";
mongoose.connect('mongodb://localhost/exam');

mongoose.connection.on("error", err => {

    console.log("err", err)

})
mongoose.connection.on("connected", (err, res) => {

    console.log("mongoose is connected")

})

async function scraping() {
    let browser;
    browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.goto(url);
    const urls = []

    await page.$$eval('div.sg-col-inner > span.rush-component > div.s-search-results > div > div > div > div.s-card-container > div.a-section > div.puis-padding-left-small > div > h2 > a', (elements) => elements.map(e => e.outerHTML)).then(async (links) => {
        await links.map(async el => {
            const dom = new JSDOM(el);
            const link = await `https://www.amazon.com${dom.window.document.querySelector("a").getAttribute('href')}`
            await urls.push(link)
        })
        for (link in urls) {
            let currentPageData = await pagePromise(urls[link]);
            // scrapedData.push(currentPageData);
            console.log(currentPageData);
        }
    });
};

// Loop through each of those links, open a new page instance and get the relevant data from them
let pagePromise = (link) => new Promise(async (resolve, reject) => {
    let browser;
    browser = await puppeteer.launch();
    let dataObj = {};
    let newPage = await browser.newPage();
    await newPage.goto(link);
    dataObj['productName'] = await (await newPage.$eval('#title_feature_div > div > h1 > span', text => text.innerHTML)).trim();
    var Model = new model(dataObj)
    await Model.save()
    resolve(dataObj);
    await newPage.close();
});
scraping()

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
