const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const fs = require("fs");

async function login(page) {
    // Open login page
    console.log("Opening login page...");
    await page.goto("https://gmatclub.com/forum/ucp.php?mode=login", {
        waitUntil: "networkidle2",
    });

    // 🔹 Enter login credentials
    await page.type('input[name="username"]', "omahawar840@gmail.com", {
        delay: 100,
    });
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
}

async function extractQuestionData(page, item) {
    await page.goto(item.link, { waitUntil: "domcontentloaded" });

    const data = await page.evaluate(() => {
        // const questionDiv = document.querySelector("div.item.text");
        const answerDiv = document.querySelector(".downRow");

        // let rawHtml = questionDiv?.innerHTML || "";
        // let lines = rawHtml
        //     .split(/<br\s*\/?>/i)
        //     .map((line) => line.replace(/<\/?[^>]+(>|$)/g, "").trim())
        //     .filter((line) => line);

        // const question = lines[0];
        // const options = lines.slice(1, 6);

        const answerLetter = answerDiv?.innerText.trim();
        // const answer =
        //     options.find((opt) => opt.startsWith(answerLetter + ".")) ||
        //     options.find((opt) => opt === answerLetter);

        return {
            // question,
            // options: options.map((opt) => opt.replace(/^[A-E]\.\s*/, "")),
            answer: answerLetter,
        };
    });

    // Extract the HTML content
    const htmlContent = await page.$eval('div.item.text', el => el.outerHTML);

    return {
        type: item.type,
        questionNumber: item.questionNumber,
        link: item.link,
        // question: data.question,
        // options: data.options,
        answer: data.answer,
        topic: item.topic,
        difficulty: item.difficulty,
        questionText: htmlContent
    };
}

(async () => {
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();

    await login(page);

    const inputData = JSON.parse(fs.readFileSync("./PS_Focus_questions.json", "utf-8"));
    const result = [];

    for (const item of inputData) {
        try {
            const questionData = await extractQuestionData(page, item);
            result.push(questionData);
            console.log(`Fetched: Q${item.questionNumber}`);
        } catch (err) {
            console.error(
                `Error fetching Q${item.questionNumber}:`,
                err.message
            );
        }
    }

    fs.writeFileSync("PS_Focus_questionsV2.json", JSON.stringify(result, null, 2));
    await browser.close();
})();
