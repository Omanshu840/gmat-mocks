import React, { useState, useEffect } from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import questions from "../questions.json";
import quant_question from "../scraper/quant_questions.json";
import TPA_questions from "../scraper/TPA_questions.json";
import MSR_questions from "../scraper/MSR_questions.json";
import G_T_questions from "../scraper/G_T_questions.json";
import PS_Focus_questions from "../scraper/PS_Focus_questions.json";
import CR_Focus_questions from "../scraper/CR_Focus_questions.json"; 
import RC_Focus_questions from "../scraper/RC_Focus_questions.json";
import MSR_Focus_questions from "../scraper/MSR_Focus_questions.json";
import G_T_Focus_questions from "../scraper/G_T_Focus_questions.json";
import TPA_Focus_questions from "../scraper/TPA_Focus_questions.json";
import DS_Focus_questions from "../scraper/DS_Focus_questions.json";
import RC_Non_Official_questions from "../scraper/RC_Non_Official_questions.json";
import PS_OG_question from "../scraper/PS_OG_questions.json";
import topicsDifficulties from "../unique_topics_difficulties.json";
import Parse from 'parse/dist/parse.min.js';


const PracticePage = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [question, setQuestion] = useState({});
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [lastTimeCheck, setLastTime] = useState(0);
    
    const [attemptedQuestions, setAttemptedQuestions] = useState([]);
    const [currAttempt, setCurrentAttempt]  = useState([]);


    let sectionQuestion = [];

    if(type==="Quant") {
        sectionQuestion = PS_Focus_questions;
    } else if(type === "DS") {
        sectionQuestion = DS_Focus_questions;
    } else if (type === "MSR") {
        sectionQuestion = MSR_Focus_questions;
    } else if (type === "GT") {
        sectionQuestion = G_T_Focus_questions;
    } else if (type === "Two-Part") {
        sectionQuestion = TPA_Focus_questions;
    } else if (type === "RC") {
        sectionQuestion = RC_Focus_questions
    } else if (type === "CR"){
        sectionQuestion = CR_Focus_questions;
    }
    

    let section = type;
    if(type==="GT" || type==="MSR" || type==="Two-Part" || type==="DS") {
        section = "data-insights"
    } else if(type==="Quant") {
        section = "quant"
    } else if(type==="RC" || type==="CR") {
        section = "verbal"
    }
  
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


    const getFilteredQuestions = (sectionType, topic, difficulty) => {
        let filteredQuestions = sectionQuestion.filter((q) =>
            (q.type===sectionType) &&
            ((topic==="") || (q.topic===topic)) &&
            ((difficulty==="") || (q.difficulty===difficulty)));

        if(sectionType === "Quant") {
            filteredQuestions = sectionQuestion;
        }

        filteredQuestions = filteredQuestions.filter((q) => (q.difficulty!=="Easy" && q.difficulty!=="Medium"));
        
        filteredQuestions = filteredQuestions.filter((q) => {
            if(!(attemptedQuestions.find((aq) => (aq.questionNumber===q.questionNumber) && (aq.type===q.type)))
            && !(currAttempt.find((cq) => (cq.questionNumber===q.questionNumber) && (cq.type===q.type)))) {
                return true;
            }
            return false;
        })
        return filteredQuestions;
    }

    const getFilteredQuestion = (sectionType, topic, difficulty="") => {
        let filteredQuestions = getFilteredQuestions(sectionType, topic, difficulty);
        return filteredQuestions[Math.floor(Math.random() * (filteredQuestions.length))];
    };

    const getNextQuestionType = (questionAttempts) => {
        let sectionType = type;
        let subSectionType = "";
        if(type==="GT" || type==="MSR" || type==="Two-Part") {
            sectionType = "DI"
            subSectionType = type;
            if(type==="GT") {
                subSectionType = (questionAttempts.length > 0 && questionAttempts[questionAttempts.length-1].topic==="Graphs") ? "Tables" : "Graphs";
            }
        }

        // Show 3 same question for RC and MSR
        let rcCount = 0, msrCount = 0, showSameQuestion = false;
        if(questionAttempts.length > 0) {
            rcCount = (sectionType === "RC") ? questionAttempts.length : 0;
            if(rcCount>0 && rcCount%3>0) {
                showSameQuestion = true;
            }
            
            msrCount = (subSectionType === "MSR") ? questionAttempts.length : 0;
            if(msrCount>0 && msrCount%3>0) {
                showSameQuestion = true;
            }
        }
        return {sectionType, subSectionType, showSameQuestion};
        
    }
  
    const nextQuestion = (currentAnswer) => {
        const newVal = currAttempt;

        if(currentAnswer!==null && question.type && question.questionNumber) {
            // if(!newVal.find(q => (q.type===question.type) && (q.questionNumber===question.questionNumber))) {
                const timeTaken = 45*60 - timeLeft - lastTimeCheck;
                newVal.push({
                    type: question.type,
                    questionNumber: question.questionNumber,
                    difficulty: question.difficulty,
                    link: question.link,
                    topic: question.topic,
                    answer: currentAnswer,
                    timeTaken: `${Math.floor(timeTaken / 60)}:${(timeTaken % 60) < 10 ? `0${timeTaken % 60}` : timeTaken % 60}`
                })
                setLastTime(45*60 - timeLeft);
            // }
            setCurrentAttempt(newVal)
        }

        const nextQuestionType = getNextQuestionType(newVal);
        const nextSectionType = nextQuestionType.sectionType;
        const nextSubSectionType = nextQuestionType.subSectionType;
        if(!nextQuestionType.showSameQuestion) {
            const filteredQuestion = getFilteredQuestion(nextSectionType, nextSubSectionType);
            console.log(filteredQuestion);
            setQuestion(filteredQuestion);
        }
        setCurrentIndex((prev) => {return prev+1;});
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
  
    return (
      <div className="home">
        <div className="timer">
            <button onClick={() => onEndTest()} className="">End</button>
            <div>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60) < 10 ? `0${timeLeft % 60}` : timeLeft % 60}</div>
        </div>
        <div className="question-info">
            <div className="text-bold"><b>Question {currentIndex} of INF</b> <a href={question.link} target="_blank" className="text-blue-500">{question.questionNumber}</a></div>
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

export default PracticePage;