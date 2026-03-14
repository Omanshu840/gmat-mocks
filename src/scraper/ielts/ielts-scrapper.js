const puppeteer = require("puppeteer");
const fs = require("fs");

const topics = [
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/food-essay-titles/",
        filename: "food.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/government-and-politics/",
        filename: "government.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/health/",
        filename: "health.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/housing-and-buildings-questions/",
        filename: "housing.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/language/",
        filename: "language.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/leisure-free-time-essay-titles/",
        filename: "leisure.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/media-and-advertising/",
        filename: "media.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/reading/",
        filename: "reading.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/society/",
        filename: "society.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/space-exploration/",
        filename: "space.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/sport-and-exercise/",
        filename: "sport.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/technology/",
        filename: "technology.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/tourism/",
        filename: "tourism.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/transport-traffic/",
        filename: "transport.json",
    },
    {
        url: "https://ieltsliz.com/100-ielts-essay-questions/work/",
        filename: "work.json",
    },
];

for (const topic of topics) {
    (async (topic) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(topic.url, { waitUntil: "networkidle2" });
        // Scrape blockquote <p> tags inside .entry-content
        // Scrape blockquote <p> tags inside .entry-content
        const questions = await page.evaluate(() => {
            const container = document.querySelector(".entry-content");
            const blocks = container.querySelectorAll("blockquote");
            const extracted = [];

            blocks.forEach((block) => {
                const ps = block.querySelectorAll("p");
                let q = "";
                ps.forEach((p) => {
                    q += p.textContent.trim() + " ";
                });
                extracted.push(q.trim());
            });

            return extracted;
        });

        // Save to JSON
        fs.writeFileSync(topic.filename, JSON.stringify(questions, null, 2));
        console.log(
            `✅ Extracted ${questions.length} questions. Saved to questions.json`
        );

        await browser.close();
    })(topic);
}

// (async () => {
//   const url = 'https://ieltsliz.com/100-ielts-essay-questions/family/';
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goto(url, { waitUntil: 'networkidle2' });

//   // Scrape blockquote <p> tags inside .entry-content
//   const questions = await page.evaluate(() => {
//     const container = document.querySelector('.entry-content');
//     const blocks = container.querySelectorAll('blockquote');
//     const extracted = [];

//     blocks.forEach((block) => {
//       const ps = block.querySelectorAll('p');
//       let q = '';
//       ps.forEach(p => {
//         q += p.textContent.trim() + ' ';
//       });
//       extracted.push(q.trim());
//     });

//     return extracted;
//   });

//   // Save to JSON
//   fs.writeFileSync('family.json', JSON.stringify(questions, null, 2));
//   console.log(`✅ Extracted ${questions.length} questions. Saved to questions.json`);

//   await browser.close();
// })();
