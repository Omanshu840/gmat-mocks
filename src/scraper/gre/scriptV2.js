const fs = require('fs');
const cheerio = require('cheerio'); // npm install cheerio

const htmlFile = 'source.html';
const jsonFile = 'output.json';

// Read existing JSON if exists
let existingData = [];
if (fs.existsSync(jsonFile)) {
  const jsonData = fs.readFileSync(jsonFile, 'utf8');
  existingData = JSON.parse(jsonData);
}

let nextQuestionNumber = existingData.length > 0
  ? existingData[existingData.length - 1].questionNumber + 1
  : 1;

// Load and parse HTML
const html = fs.readFileSync(htmlFile, 'utf8');
const $ = cheerio.load(html);

// Step 1: Find the topic from the header link (like "NUMBER SYSTEM")
const topic = $('a.postlink-local span')
  .first()
  .text()
  .trim()
  .toUpperCase() || "General";

// Step 2: Iterate through each bold label (e.g., "QCQ -", "PS -", "MAC -")
$('span[style*="font-weight: bold"]').each((_, span) => {
  const typeRaw = $(span).text().trim();
  const typeMatch = typeRaw.match(/(QCQ|PS|MAC|NE)/);
  if (!typeMatch) return; // Skip if not a question type

  const type = typeMatch[1];
  const ol = $(span).nextAll('ol').first(); // Get next <ol> block after this label
  const links = ol.find('a');

  links.each((_, link) => {
    const href = $(link).attr('href');
    if (href) {
      existingData.push({
        questionNumber: nextQuestionNumber++,
        topic: topic,
        type: type,
        questionLink: href.trim()
      });
    }
  });
});

// Write updated data
fs.writeFileSync(jsonFile, JSON.stringify(existingData, null, 2));
console.log(`✅ ${existingData.length} questions saved to ${jsonFile}`);
