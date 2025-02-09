// GMAT Question Scraper for gmatwithcj.com with Pagination Support

const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://gmatwithcj.com/all-gmat-official-questions/';
const QUESTION_TYPES = [
    { type: 'CR', tableId: 'tablepress-75' },
    { type: 'RC', tableId: 'tablepress-78' },
    { type: 'Quant', tableId: 'tablepress-77' },
    { type: 'DI', tableId: 'tablepress-79' },
    { type: 'DS', tableId: 'tablepress-76' }
];

async function scrapeQuestions() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle2' });

    let questions = [];
    
    for (let { type, tableId } of QUESTION_TYPES) {
        console.log(`Scraping ${type} questions...`);
        
        // Click the tab button to load the question list
        await page.evaluate((type) => {
            let tabs = document.querySelectorAll('.e-n-tab-title');
            tabs.forEach(tab => {
                if (tab.innerText.trim() === type) tab.click();
            });
        }, type);

        await new Promise(resolve => setTimeout(resolve, 2000));

        let hasNextPage = true;
        let questionNumber = 1;
        while (hasNextPage) {
            // Extract table rows from the correct table
            const rows = await page.$$(`#${tableId} tbody tr`);
            
            for (let row of rows) {
                const columns = await row.$$('td');
                if (columns.length < 3) continue;

                const linkElement = await columns[0].$('a');
                const link = linkElement ? await (await linkElement.getProperty('href')).jsonValue() : '';
                const topic = await (await columns[1].getProperty('textContent')).jsonValue();
                const difficulty = await (await columns[2].getProperty('textContent')).jsonValue();
                
                if (link) {
                    questions.push({ type, questionNumber, link, topic: topic.trim(), difficulty: difficulty.trim() });
                    questionNumber++;
                }
            }

            // Check for and click the next button
            const nextButton = await page.$('button.dt-paging-button.next');
            if (nextButton) {
                const isDisabled = await page.evaluate(button => button.disabled, nextButton);
                if (!isDisabled) {
                    await nextButton.click();
                    await page.waitForTimeout(2000); // Wait for page reload
                } else {
                    hasNextPage = false;
                }
            } else {
                hasNextPage = false;
            }
        }
    }

    await browser.close();
    
    fs.writeFileSync('questions.json', JSON.stringify(questions, null, 2));
    console.log('Scraping completed. Data saved to questions.json');
}

scrapeQuestions().catch(console.error);
