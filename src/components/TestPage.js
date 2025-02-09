import React, { useState, useEffect } from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import questions from "../questions.json";
import topicsDifficulties from "../unique_topics_difficulties.json";
import Parse from 'parse/dist/parse.min.js';

const totalQuestions = {
    "verbal": 23,
    "quant": 21,
    "data-insights": 20
}

const TestPage = () => {
    const { section } = useParams();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [question, setQuestion] = useState({});
    const [currentDifficulty, setCurrentDifficulty] = useState("Medium");
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    // const [attemptedQuestions, setAttemptedQuestions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [questionMapping, setQuestionMapping] = useState({
        "verbal": {
            "RC": 4,
            "CR": 11
        },
        "quant": {
            "Quant": 21
        },
        "data-insights": {
            "DS": 4,
            "DI": {
                "MSR": 2,
                "Two-Part": 5,
                "Tables": 3,
                "Graphs": 2
            }
        }
    })
    const [questionType, setQuestionType] = useState({});
    const [attemptedQuestions, setAttemptedQuestions] = useState([]);
    const [currAttempt, setCurrentAttempt]  = useState([]);

    const sectionQuestion = questions.filter((q) => (
        (section==="verbal" && (q.type==="CR" || q.type==="RC")) ||
        (section==="quant" && (q.type==="Quant")) || 
        (section==="data-insights" && (q.type==="DI" || q.type==="DS"))
    ))
  
    useEffect(() => {
        async function fetchData() {
            const newAttemptedQuestions = [];
            const query = new Parse.Query('AttemptedQuestions');
            const entries = await query.find();
            entries.forEach(entry => {
                newAttemptedQuestions.push({
                    id: entry.id,
                    questionNumber: entry.attributes.QuestionNumber,
                    type: entry.attributes.Type
                })
            })
            setAttemptedQuestions(newAttemptedQuestions);
            nextQuestion();
        }

        fetchData();

        const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, []);

    const getFilteredQuestion = (sectionType, topic, difficulty) => {
        let filteredQuestions = sectionQuestion.filter((q) => (q.difficulty === difficulty) && (q.type===sectionType) && ((topic==="") || (q.topic===topic)));
        filteredQuestions = filteredQuestions.filter((q) => {
            if(!(attemptedQuestions.find((aq) => (aq.questionNumber===q.questionNumber) && (aq.type===q.type)))) {
                return true;
            }
            return false;
        })
        return filteredQuestions[Math.floor(Math.random() * (filteredQuestions.length))];
    };

    const getNextQuestionType = () => {
        const sectionTypes = Object.keys(questionMapping[section]);
        const sectionTypeIndex = Math.floor(Math.random() * (sectionTypes.length));
        let sectionType = sectionTypes[sectionTypeIndex];
        let subSectionType = "";
        let newQuestionMapping;

        if(section==="verbal") {
            if(questionMapping[section]["RC"]*3 > questionMapping[section]["CR"]) {
                sectionType = "RC";
            } else {
                sectionType = "CR";
            }
        }

        if(sectionType==="DS" && questionMapping[section][sectionType]===0) {
            sectionType = "DI";
        }

        if(sectionType==="DI") {
            const subSectionTypes = Object.keys(questionMapping[section][sectionType]);
            const subSectionTypeIndex = Math.floor(Math.random() * (subSectionTypes.length));
            subSectionType = subSectionTypes[subSectionTypeIndex];

            let subRep = 1
            while(questionMapping[section][sectionType][subSectionType]===0 && subRep<subSectionTypes.length) {
                subSectionType = subSectionTypes[(subSectionTypeIndex+1)%subSectionTypes.length]
                subRep++;
            }

            newQuestionMapping = {
                ...questionMapping,
                [section]: {
                    ...questionMapping[section],
                    [sectionType]: {
                        ...questionMapping[section][sectionType],
                        [subSectionType]: questionMapping[section][sectionType][subSectionType]-1
                    }
                }
            }
        } else {
            let rep = 1
            while(questionMapping[section][sectionType]===0 && rep<sectionTypes.length && (sectionType!=="DS")) {
                sectionType = sectionTypes[(sectionTypeIndex+1)%sectionTypes.length]
                rep++;
            }

            newQuestionMapping = {
                ...questionMapping,
                [section]: {
                    ...questionMapping[section],
                    [sectionType]: questionMapping[section][sectionType]-1
                }
            }
        }

        setQuestionMapping(newQuestionMapping);
        return {sectionType, subSectionType};
        
    }
  
    const nextQuestion = (currentAnswer) => {
        const newVal = currAttempt;

        if(currentAnswer!==null && question.type && question.questionNumber) {
            if(!newVal.find(q => (q.type===question.type) && (q.questionNumber===question.questionNumber))) {
                newVal.push({
                    type: question.type,
                    questionNumber: question.questionNumber,
                    difficulty: question.difficulty,
                    link: question.link,
                    topic: question.topic,
                    answer: currentAnswer
                })
            }
            setCurrentAttempt(newVal)
        }

        // setAttemptedQuestions([...attemptedQuestions, { ...question, selectedAnswer }]);
        setSelectedAnswer(currentAnswer);

        if(currentIndex === totalQuestions[section]) {
            onEndTest(newVal);
            return;
        }

        const nextQuestionType = getNextQuestionType();
        const nextSectionType = nextQuestionType.sectionType;
        const nextSubSectionType = nextQuestionType.subSectionType;
        const newDifficulty = currentAnswer ? increaseDifficulty(nextSectionType) : decreaseDifficulty(nextSectionType);

        const filteredQuestion = getFilteredQuestion(nextSectionType, nextSubSectionType, newDifficulty);

        console.log(filteredQuestion);

        setQuestion(filteredQuestion);
        setCurrentDifficulty(newDifficulty);
        setCurrentIndex((prev) => {
            if(questionType.sectionType === "RC") {
                return prev+3;
            } else if(questionType.subSectionType === "MSR") {
                return prev+3;
            }
            return prev+1;
        });
        setQuestionType(nextQuestionType);
    };
  
    const increaseDifficulty = (sectionType) => {
      const difficulties = topicsDifficulties[sectionType].difficulties;
      const index = difficulties.indexOf(currentDifficulty);
      return index < difficulties.length - 1 ? difficulties[index + 1] : currentDifficulty;
    };
  
    const decreaseDifficulty = (sectionType) => {
        if(selectedAnswer===null) return "Medium";
      const difficulties = topicsDifficulties[sectionType].difficulties;
      const index = difficulties.indexOf(currentDifficulty);
      return index > 0 ? difficulties[index - 1] : currentDifficulty;
    };
  
    if (timeLeft <= 0) {
      return (
        <div className="p-5 text-center">
          <h1 className="text-xl font-bold">Test Completed</h1>
          <Link to="/" className="p-2 bg-gray-500 text-white rounded mt-2">Return Home</Link>
        </div>
      );
    }

    const onEndTest = async (newVal) => {

        const attempts = newVal || currAttempt;

        const parseAttemptedQuestion = [];

        attempts.forEach(async attempt => {
            let attemptedQuestion = new Parse.Object('AttemptedQuestions');
            attemptedQuestion.set('Type', attempt.type);
            attemptedQuestion.set('QuestionNumber', attempt.questionNumber);
            parseAttemptedQuestion.push(attemptedQuestion);
            await attemptedQuestion.save();
        });

        let testAttempt = new Parse.Object('TestAttempts');
        testAttempt.set('Section', section);
        testAttempt.set('Questions', JSON.stringify(attempts));
        await testAttempt.save();
        navigate("/GMAT-Mocks");
    }
  
    return (
      <div className="home p-5 text-center">
        <div className="mt-3 timer">
            <button onClick={() => onEndTest()} className="p-2 bg-blue-500 text-white rounded mt-3">End</button>
            <div>Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</div>
        </div>
        <h2 className="text-xl font-bold">Question {currentIndex} of {totalQuestions[section]}</h2>
        <a href={question.link} target="_blank" className="text-blue-500 link">Attempt Here</a>
        <div className="mt-3 radio-buttons">
            <button onClick={() => nextQuestion(true)} className="p-2 bg-blue-500 text-white rounded mt-3">Correct</button>
            <button onClick={() => nextQuestion(false)} className="p-2 bg-blue-500 text-white rounded mt-3">Incorrect</button>
        </div>
      </div>
    );
  };

export default TestPage;