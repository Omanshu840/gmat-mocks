const PS_Focus_questions = require("./PS_Focus_questions.json");
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const SEARCH_URLS = {
    MSR: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1630&selected_search_tags%5B%5D=1631&selected_search_tags%5B%5D=1594&selected_search_tags%5B%5D=1632&selected_search_tags%5B%5D=1593&selected_search_tags%5B%5D=1592&t=0&sid=72b3e5713cb621d0ef018be96fc2cdec&search_tags=exact&submit=Search",
    CR: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1539&selected_search_tags%5B%5D=1532&selected_search_tags%5B%5D=168&selected_search_tags%5B%5D=1525&selected_search_tags%5B%5D=226&selected_search_tags%5B%5D=227&t=0&search_tags=exact&submit=Search",
    PS: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1540&selected_search_tags%5B%5D=1533&selected_search_tags%5B%5D=187&selected_search_tags%5B%5D=1526&selected_search_tags%5B%5D=216&selected_search_tags%5B%5D=217&t=0&search_tags=exact&submit=Search",
    TPA: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1634&selected_search_tags%5B%5D=1635&selected_search_tags%5B%5D=1569&selected_search_tags%5B%5D=1636&selected_search_tags%5B%5D=1570&selected_search_tags%5B%5D=1571&t=0&sid=72b3e5713cb621d0ef018be96fc2cdec&search_tags=exact&submit=Search",
    G_T: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1626&selected_search_tags%5B%5D=1627&selected_search_tags%5B%5D=1556&selected_search_tags%5B%5D=1628&selected_search_tags%5B%5D=1557&selected_search_tags%5B%5D=1558&t=0&search_tags=exact&submit=Search",
    PS_Focus: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1540&selected_search_tags%5B%5D=1533&selected_search_tags%5B%5D=187&selected_search_tags%5B%5D=1526&selected_search_tags%5B%5D=216&selected_search_tags%5B%5D=217&selected_search_tags%5B%5D=1549&t=0&search_tags=exact&submit=Search",
    CR_Focus: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1539&selected_search_tags%5B%5D=1532&selected_search_tags%5B%5D=168&selected_search_tags%5B%5D=1525&selected_search_tags%5B%5D=226&selected_search_tags%5B%5D=227&selected_search_tags%5B%5D=1546&selected_search_tags%5B%5D=1988&selected_search_tags%5B%5D=2014&t=0&search_tags=exact&submit=Search",
    RC_Focus: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1622&selected_search_tags%5B%5D=1623&selected_search_tags%5B%5D=162&selected_search_tags%5B%5D=1624&selected_search_tags%5B%5D=228&selected_search_tags%5B%5D=229&selected_search_tags%5B%5D=1547&selected_search_tags%5B%5D=1987&t=0&search_tags=exact&submit=Search",
    DS_Focus: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1541&selected_search_tags%5B%5D=1534&selected_search_tags%5B%5D=180&selected_search_tags%5B%5D=1527&selected_search_tags%5B%5D=222&selected_search_tags%5B%5D=223&selected_search_tags%5B%5D=1548&selected_search_tags%5B%5D=1985&selected_search_tags%5B%5D=1992&t=0&search_tags=exact&submit=Search",
    G_T_Focus: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1626&selected_search_tags%5B%5D=1627&selected_search_tags%5B%5D=1556&selected_search_tags%5B%5D=1628&selected_search_tags%5B%5D=1557&selected_search_tags%5B%5D=1558&selected_search_tags%5B%5D=1560&selected_search_tags%5B%5D=1989&selected_search_tags%5B%5D=1991&t=0&search_tags=exact&submit=Search",
    MSR_Focus: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1630&selected_search_tags%5B%5D=1631&selected_search_tags%5B%5D=1594&selected_search_tags%5B%5D=1632&selected_search_tags%5B%5D=1593&selected_search_tags%5B%5D=1592&selected_search_tags%5B%5D=1598&selected_search_tags%5B%5D=2011&t=0&search_tags=exact&submit=Search",
    TPA_Focus: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1634&selected_search_tags%5B%5D=1635&selected_search_tags%5B%5D=1569&selected_search_tags%5B%5D=1636&selected_search_tags%5B%5D=1570&selected_search_tags%5B%5D=1571&selected_search_tags%5B%5D=1578&selected_search_tags%5B%5D=2012&selected_search_tags%5B%5D=1986&t=0&search_tags=exact&submit=Search",
    RC_Non_Official: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1622&selected_search_tags%5B%5D=1623&selected_search_tags%5B%5D=162&selected_search_tags%5B%5D=1428&selected_search_tags%5B%5D=1416&selected_search_tags%5B%5D=521&selected_search_tags%5B%5D=1484&selected_search_tags%5B%5D=1404&selected_search_tags%5B%5D=1443&selected_search_tags%5B%5D=1449&selected_search_tags%5B%5D=364&selected_search_tags%5B%5D=1358&selected_search_tags%5B%5D=205&selected_search_tags%5B%5D=1394&selected_search_tags%5B%5D=1494&selected_search_tags%5B%5D=1421&selected_search_tags%5B%5D=1481&selected_search_tags%5B%5D=165&selected_search_tags%5B%5D=255&selected_search_tags%5B%5D=316&selected_search_tags%5B%5D=256&selected_search_tags%5B%5D=1614&selected_search_tags%5B%5D=1427&selected_search_tags%5B%5D=1417&selected_search_tags%5B%5D=1419&selected_search_tags%5B%5D=1420&selected_search_tags%5B%5D=275&selected_search_tags%5B%5D=1472&selected_search_tags%5B%5D=274&selected_search_tags%5B%5D=1492&selected_search_tags%5B%5D=277&t=0&search_tags=exact&submit=Search",
    PS_OG: "https://gmatclub.com/forum/search.php?selected_search_tags%5B%5D=1540&selected_search_tags%5B%5D=1533&selected_search_tags%5B%5D=187&selected_search_tags%5B%5D=1526&selected_search_tags%5B%5D=216&selected_search_tags%5B%5D=217&selected_search_tags%5B%5D=190&selected_search_tags%5B%5D=1326&selected_search_tags%5B%5D=1984&selected_search_tags%5B%5D=1461&selected_search_tags%5B%5D=1423&selected_search_tags%5B%5D=1342&selected_search_tags%5B%5D=1253&selected_search_tags%5B%5D=1254&selected_search_tags%5B%5D=1255&selected_search_tags%5B%5D=1256&selected_search_tags%5B%5D=1257&selected_search_tags%5B%5D=1258&selected_search_tags%5B%5D=1259&selected_search_tags%5B%5D=1260&selected_search_tags%5B%5D=1327&selected_search_tags%5B%5D=1462&selected_search_tags%5B%5D=1433&selected_search_tags%5B%5D=1343&selected_search_tags%5B%5D=1311&selected_search_tags%5B%5D=1312&selected_search_tags%5B%5D=1313&selected_search_tags%5B%5D=1314&selected_search_tags%5B%5D=1295&selected_search_tags%5B%5D=1266&t=0&search_tags=exact&submit=Search"
};

(async () => {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

    // Open login page
    console.log("Opening login page...");
    await page.goto("https://gmatclub.com/forum/ucp.php?mode=login", { waitUntil: "networkidle2" });

    // 🔹 Enter login credentials
    await page.type('input[name="username"]', "omahawar840@gmail.com", { delay: 100 });
    await page.type('input[name="password"]', "Om@nshu@8", { delay: 100 });

    // 🔹 Click login button
    await Promise.all([
        page.click('input[name="login"]'),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    //console.log("Please log in manually.");
    //console.log("Press ENTER in the terminal once you have logged in.");

    // Wait for user to press ENTER before proceeding
    // await new Promise((resolve) => {
    //     process.stdin.resume();
    //     process.stdin.once("data", () => {
    //         process.stdin.pause();
    //         resolve();
    //     });
    // });

    console.log("Login detected! Proceeding with scraping...");

    let url = SEARCH_URLS.PS_Focus;

    // Navigate to search page after login
    await page.goto(url, { waitUntil: "networkidle2" });

    let questionNumber = 5147;
    let results = [];
    let currentPage = 1;
    let MAX_PAGES = 16;
    let parsed_questions = PS_Focus_questions;

    while (currentPage <= MAX_PAGES) {
        console.log(`Scraping page ${currentPage}...`);
        await page.waitForSelector('.topic-table', { timeout: 60000 });

        const data = await page.evaluate((questionNumber, parsed_questions) => {
            // Re-define the function inside `evaluate`
            const mapDifficulty = (level) => {
                if (level.includes("805+")) return "Very Hard";
                if (level.includes("705-805") || level.includes("655-705")) return "Hard";
                if (level.includes("605-655") || level.includes("555-605")) return "Medium";
                if (level.includes("505-555")) return "Easy";
                return "Unknown";
            };
        
            let rows = document.querySelectorAll('.table-topic-row');
            let extractedData = [];
            
            rows.forEach((row, index) => {
                let linkElem = row.querySelector('.topic-table-column4 .topic-link');
                let tagsElem = row.querySelector('.topic-table-column4 .topic-tags');
                let attemptedElm = row.querySelector('.table-topic-row5 .timers-wrap .timerMark');
                
                if (linkElem && tagsElem && !attemptedElm) {
                    const type = "Quant";
                    let link = linkElem.href;
                    let difficultyTag = tagsElem.querySelectorAll('a')[0]?.innerText || "";
                    let topicTag = tagsElem.querySelectorAll('a')[1]?.innerText || "";
                    if(type === "DI" && (topicTag === "Math Related" || topicTag==="Non-Math Related")) {
                        topicTag = tagsElem.querySelectorAll('a')[2]?.innerText || "";
                    }
                    const parsedQuestion = parsed_questions.find(q => q.link === link);
                    if (!parsedQuestion) {
                        extractedData.push({
                            type: type,
                            questionNumber: questionNumber + index,
                            link: link,
                            topic: topicTag,
                            difficulty: mapDifficulty(difficultyTag)  // Now this function exists
                        });
                    }
                    
                }
            });
            return extractedData;
        }, questionNumber,parsed_questions);
        

        results.push(...data);
        questionNumber += data.length; // Increment question number

        // Navigate to next page
        const nextPageElement = await page.$('a.arrow-right.pagination-arrow');
        if (nextPageElement && currentPage < MAX_PAGES) {
            url = await page.evaluate(el => el.href, nextPageElement);
            await page.goto(url, { waitUntil: "networkidle2" });
        } else {
            break;
        }

        currentPage++;
    }

    await browser.close();

    // Save data to a JSON file
    fs.writeFileSync("PS_New_Focus_questions.json", JSON.stringify(results, null, 2));
    console.log("Scraping complete. Data saved to gmat_questions.json");
})();
