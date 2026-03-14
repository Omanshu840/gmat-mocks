const fs = require('fs');
const cheerio = require('cheerio'); // npm install cheerio

const htmlFile = 'source.html';       // Replace with your HTML file
const jsonFile = 'questions.json';         // JSON output file

// Step 1: Read existing JSON (if exists)
let existingData = [];
if (fs.existsSync(jsonFile)) {
  const jsonData = fs.readFileSync(jsonFile, 'utf8');
  existingData = JSON.parse(jsonData);
}

// Step 2: Read the HTML file
const html = fs.readFileSync(htmlFile, 'utf8');
const $ = cheerio.load(html);

// Step 3: Determine the next question number
let nextQuestionNumber = existingData.length > 0
  ? existingData[existingData.length - 1].questionNumber + 1
  : 1;

// Step 4: Parse and append new entries
$('ol > li').each((index, li) => {
  const link = $(li).find('a').attr('href');
  if (link) {
    existingData.push({
      questionNumber: nextQuestionNumber++,
      topic: "Data Interpretation Sets",
      type: "PS",
      questionLink: link.trim()
    });
  }
});

// Step 5: Write back the combined JSON
fs.writeFileSync(jsonFile, JSON.stringify(existingData, null, 2));
console.log(`✅ ${existingData.length} questions saved to ${jsonFile}`);
