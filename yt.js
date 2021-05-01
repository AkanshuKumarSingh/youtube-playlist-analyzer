const puppeteer = require("puppeteer");
let url = "https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq";
let page;
let title;
let views;
let cVideos = 0;


(async function f() {
    try {
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"],
        });
        let pagesArr = await browser.pages();
        page = pagesArr[0];
        await page.goto(url);
        await page.waitForSelector("h1#title", { visible: true })
        await page.waitForSelector("#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer", { visible: true });
        let obj = await page.evaluate(function () {
            let allelements = document.querySelectorAll("#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer");            
            let noOfVideos = allelements[0].innerText;
            let noOfViews = allelements[1].innerText;
            let title = document.querySelector("h1#title").innerText;
            let obj = {
                nfVideos: noOfVideos,
                nfViews: noOfViews,
                title
            };
            return obj;
        })

        console.log(obj.title + " " + obj.nfVideos + " " + obj.nfViews);

        let noOfVideos = obj.nfVideos.split(" ")[0];
        noOfVideos = Number(noOfVideos);

        let i = 0;
        while ((noOfVideos - cVideos) > 100) {
            await scrollDown(page);
            console.log(i);
            i++;
        }

        await waitTillHTMLRendered(page);
        await scrollDown();
        console.log(cVideos);

        let videoSelector = "#video-title";
        let duration =
            "span.style-scope.ytd-thumbnail-overlay-time-status-renderer";

        await page.waitForSelector(videoSelector, { visible: true })
        await page.waitForSelector(duration, { visible: true });
        let titleDurArr = await page.evaluate(getTitleNDuration,videoSelector,
            duration);
        console.table(titleDurArr);
        

    } catch (err) {
        console.log(err);
    }
})();

async function scrollDown() {
    let length = await page.evaluate(function () {
        let titleElems = document.querySelectorAll("#video-title");
        titleElems[titleElems.length - 1].scrollIntoView(true);
        return titleElems.length; 
    })
    cVideos = length;
}

function getTitleNDuration(videoSelector, duration) {
    let titleElementArr = document.querySelectorAll(videoSelector);
    let duartionElementArr = document.querySelectorAll(duration);
    let titleDurArr = [];
    for (let i = 0; i < duartionElementArr.length; i++) {
        let title = titleElementArr[i].innerText.trim();
        let duration = duartionElementArr[i].innerText.trim()
        titleDurArr.push({ title, duration });
    }
    return titleDurArr;
}

async function waitTillHTMLRendered(page, timeout = 30000) {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;

        let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

        console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            console.log("Page rendered fully..");
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await page.waitForTimeout(checkDurationMsecs);
    }
};
