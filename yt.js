const puppeteer = require("puppeteer");
let url = "https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq";
let page;
let title;
let views;

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

        let videoSelector = "#video-title";
        let duration =
            "span.style-scope.ytd-thumbnail-overlay-time-status-renderer";

        await page.waitForSelector(videoSelector, { visible: true })
        await page.waitForSelector(duration, { visible: true });
        // let titleDurArr = await page.evaluate(getTitleNDuration,videoSelector,
        //     duration);
        // console.table(titleDurArr);
        await page.evaluate(function () {
            let durationElems = document.querySelectorAll("#video-title");
            durationElems[durationElems.length - 1].scrollIntoView(true);
        });

    } catch (err) {
        console.log(err);
    }
})();

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


