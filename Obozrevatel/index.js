const fs = require('fs');
const puppeteer = require('puppeteer');
let link = 'https://www.obozrevatel.com/ukr/politics/'

const test_parser = async click => {
    try {
        let browser = await puppeteer.launch({ headless: true, slowMo: 100, devtools: true });
        let page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 900 });
        await page.goto(link, { waitUntil: 'domcontentloaded' });

        // for (let i = 0; i < click; i++) {
        //     const button = await class$('button.showMoreRelated_btn.ComponentManager_didInit');
        //     await button.click();
        //     await article.waitForSelector('newsImgRowTime');
        // }

        let html = await page.evaluate(async () => {
            let res = []
            let container = document.querySelectorAll('article.newsImgRowTime');
            // console.log(container); 'При використанні page.evaluate, тоді console.log виводиться в консолі бравзера'
            container.forEach(item => {
                let title = item.querySelector('h3.newsImgRowTime_title').innerText
                let link = item.querySelector('a.newsImgRowTime_titleLink').href

                res.push({
                    title,
                    link,

                })
            })

            return res
        })

        for(let s = 0; s < html.length; s++) {
            await page.goto(html[s].link, {waitUntil: 'domcontentloaded'});
            await page.waitForSelector('div.newsFull_body').catch(err => console.log(err));
            console.log(s);
            let article = await page.evaluate(async () => {
                let article = null
                try {
                    article = document.querySelector('div.newsFull_text').innerText
                } catch(err) {
                    article = null
                }

                return article
            })
            
            html[s]['text'] = article;
        }

        console.log('news length - ', html.length);

        await browser.close();
        fs.writeFile('test_parser.json', JSON.stringify({ html }), function (err) {
            if (err) throw err
            console.log('Saved test_parser.json file');
        })

    } catch (e) {
        // await browser.close();
        console.log(e);
    }

}

test_parser(0);