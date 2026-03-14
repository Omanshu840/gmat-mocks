const fs = require('fs');
const cheerio = require('cheerio'); // npm install cheerio

const htmlFile = 'source.html';      // <- change this
const jsonFile = 'questions.json';        // final output

// Load existing data if present
let existingData = [];
if (fs.existsSync(jsonFile)) {
  existingData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
}
let nextQuestionNumber = existingData.length > 0
  ? existingData[existingData.length - 1].questionNumber + 1
  : 1;

// Load HTML
const html = fs.readFileSync(htmlFile, 'utf8');
const $ = cheerio.load(html);

// === TYPE 2: Flat list of links (no topic/type) ===
$('div.item.text > a.postlink-local').each((_, link) => {
  const href = $(link).attr('href');
  if (href) {
    existingData.push({
      questionNumber: nextQuestionNumber++,
      topic: "PROBABILITY",
      type: "NE",
      questionLink: href.trim()
    });
  }
});

// Save to JSON
fs.writeFileSync(jsonFile, JSON.stringify(existingData, null, 2));
console.log(`✅ Parsed ${nextQuestionNumber - 1} questions. Output written to ${jsonFile}`);
