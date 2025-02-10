import React, { useState, useEffect } from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import questions from "../questions.json";
import topicsDifficulties from "../unique_topics_difficulties.json";
import Parse from 'parse/dist/parse.min.js';
import prevAttempts from "../prevAttempts/test.json";

const totalQuestions = {
    "verbal": 23,
    "quant": 21,
    "data-insights": 20
}

const TestPage = () => {
    const { section } = useParams();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
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
            const query = new Parse.Query('TestAttempts');
            const entries = await query.find();
            // const entries = prevAttempts.results;
            entries.forEach(entry => {
                if(entry.attributes.Section === section) {
                    const attemptedQuestion = JSON.parse(entry.attributes.Questions);
                    attemptedQuestion.forEach(q => {
                        newAttemptedQuestions.push({
                            questionNumber: q.questionNumber,
                            type: q.type
                        })
                    })
                }
            })
            console.log(newAttemptedQuestions);
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

        if((sectionType==="DS" && questionMapping[section][sectionType]===0)
            || (sectionType==="DS" && (questionMapping[section][sectionType]*5 < (totalQuestions["data-insights"]-currentIndex+1)))) {
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

        if(currentIndex === totalQuestions[section]) {
            onEndTest(newVal);
            return;
        }

        const nextQuestionType = getNextQuestionType();
        const nextSectionType = nextQuestionType.sectionType;
        const nextSubSectionType = nextQuestionType.subSectionType;
        const newDifficulty = currentAnswer ? increaseDifficulty(nextSectionType) : decreaseDifficulty(nextSectionType, currentAnswer);

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
        setSelectedAnswer(currentAnswer);
    };
  
    const increaseDifficulty = (sectionType) => {
      const difficulties = topicsDifficulties[sectionType].difficulties;
      const index = difficulties.indexOf(currentDifficulty);
      return index < difficulties.length - 1 ? difficulties[index + 1] : currentDifficulty;
    };
  
    const decreaseDifficulty = (sectionType, currentAnswer) => {
        if(currentAnswer===null) return "Medium";
        if(selectedAnswer) {
            return currentDifficulty;
        } else {
            const difficulties = topicsDifficulties[sectionType].difficulties;
            const index = difficulties.indexOf(currentDifficulty);
            return index > 0 ? difficulties[index - 1] : currentDifficulty;
        }
    };

    const changeQuestion = () => {
        const topic = question.topic !== "Geometry" ? question.topic : "";
        const newQuestion = getFilteredQuestion(question.type, topic, question.difficulty);
        setQuestion(newQuestion);
    }

    const onEndTest = async (newVal) => {
        const attempts = newVal || currAttempt;
        let testAttempt = new Parse.Object('TestAttempts');
        testAttempt.set('Section', section);
        testAttempt.set('Questions', JSON.stringify(attempts));
        await testAttempt.save();
        navigate("/gmat-mocks");
    }

    if (timeLeft <= 0) {
        onEndTest();
        return (
            <div className="p-5 text-center">
            <h1 className="text-xl font-bold">Test Completed</h1>
            <Link to="/" className="p-2 bg-gray-500 text-white rounded mt-2">Return Home</Link>
            </div>
        );
    }
  
    return (
      <div className="home">
        <div className="timer">
            <button onClick={() => onEndTest()} className="">End</button>
            <div>Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</div>
        </div>
        <div className="question-info">
            <div className="text-bold"><b>Question {currentIndex} of {totalQuestions[section]}</b> <a href={question.link} target="_blank" className="text-blue-500">{question.questionNumber}</a></div>
            <div className="radio-buttons">
                <button onClick={() => nextQuestion(true)} className="">Correct</button>
                <button onClick={() => nextQuestion(false)} className="">Incorrect</button>
                <button onClick={() => changeQuestion()} className="">Change</button>
            </div>
        </div>
        {/* <a href={question.link} target="_blank" className="text-blue-500 link">Attempt Here</a> */}
        <iframe 
            src={question.link} 
            className="question-iframe"
            title="GMAT Question"
        ></iframe>
      </div>
    );
  };

export default TestPage;