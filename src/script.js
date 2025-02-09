const fs = require('fs');

// Load the JSON data
const rawData = fs.readFileSync('questions.json');
const questions = JSON.parse(rawData);

// Object to store unique topics and difficulties per question type
const uniqueData = {};

questions.forEach(({ type, topic, difficulty }) => {
    if (!uniqueData[type]) {
        uniqueData[type] = { topics: new Set(), difficulties: new Set() };
    }
    uniqueData[type].topics.add(topic);
    uniqueData[type].difficulties.add(difficulty);
});

// Convert sets to arrays
const result = {};
Object.keys(uniqueData).forEach(type => {
    result[type] = {
        topics: Array.from(uniqueData[type].topics),
        difficulties: Array.from(uniqueData[type].difficulties)
    };
});

// Save to a new JSON file
fs.writeFileSync('unique_topics_difficulties.json', JSON.stringify(result, null, 2));
console.log('Extraction completed. Data saved to unique_topics_difficulties.json');