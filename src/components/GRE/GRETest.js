import React, { useState, useEffect } from "react";
import Parse from "parse/dist/parse.min.js";
import questions from "../../scraper/gre/questions.json";

const TOTAL_QUESTIONS = 27;
const DURATION_MINUTES = 47;

function GRETest({ previousAttempts, setScreen }) {
    const [timeLeft, setTimeLeft] = useState(DURATION_MINUTES * 60);
    const [lastTimeCheck, setLastTime] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [attempts, setAttempts] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [question, setQuestion] = useState();

    // Timer
    useEffect(() => {
        const timer = setInterval(
            () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
            1000
        );
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const attemptedQuestions = [];

        previousAttempts.forEach((attempt) => {
            attempt.questions.forEach((q) => {
                attemptedQuestions.push({
                    questionNumber: q.questionNumber,
                    type: q.type,
                });
            });
        });

        let filteredQuestions = [...questions].sort(() => 0.5 - Math.random());
        filteredQuestions = filteredQuestions.filter((q) => {
            if (
                !attemptedQuestions.find(
                    (aq) => aq.questionNumber === q.questionNumber
                )
            ) {
                return true;
            }
            return false;
        });

        setFilteredQuestions(filteredQuestions);
        setCurrentIndex(0);
        setQuestion(getNextQuestion(filteredQuestions));
    }, [previousAttempts]);

    const getNextQuestion = (filteredQuestionsIn) => {
        let fltrQuestions = filteredQuestionsIn || filteredQuestions;
        fltrQuestions = fltrQuestions.filter((q) => {
            if (
                !attempts.find((aq) => aq.questionNumber === q.questionNumber)
            ) {
                return true;
            }
            return false;
        });
        return fltrQuestions[Math.floor(Math.random() * fltrQuestions.length)];
    };

    const handleAnswer = (currentAnswer, changeQuestion) => {
        const newVal = attempts;
        const timeTaken = DURATION_MINUTES * 60 - timeLeft - lastTimeCheck;
        newVal.push({
            type: question.type,
            questionNumber: question.questionNumber,
            link: question.questionLink,
            topic: question.topic,
            answer: currentAnswer,
            timeTaken: `${Math.floor(timeTaken / 60)}:${
                timeTaken % 60 < 10 ? `0${timeTaken % 60}` : timeTaken % 60
            }`,
        });
        setLastTime(DURATION_MINUTES * 60 - timeLeft);
        setAttempts(newVal);

        if (!changeQuestion) {
            setCurrentIndex(currentIndex + 1);
        }

        if (currentIndex < TOTAL_QUESTIONS) {
            setQuestion(getNextQuestion());
        } else {
            endTest(newVal);
        }
    };

    const endTest = async (newVal) => {
        const currAttempts = newVal || attempts;
        let testAttempt = new Parse.Object("TestAttempts");
        testAttempt.set("Section", "GRE");
        testAttempt.set("Questions", JSON.stringify(currAttempts));
        await testAttempt.save();
        setScreen("Home");
    };

    if (!question) {
        return <></>;
    }

    return (
        <div>
            <p>
                Time Left: {Math.floor(timeLeft / 60)}:
                {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
            </p>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                }}
            >
                <h5>
                    Question {currentIndex + 1} of {TOTAL_QUESTIONS}{" "}
                    <a
                        href={question.questionLink}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Q#{question.questionNumber}
                    </a>
                </h5>
                <div>
                    <button onClick={() => handleAnswer(true)}>Correct</button>
                    &nbsp;
                    <button onClick={() => handleAnswer(false)}>
                        Incorrect
                    </button>
                    &nbsp;
                    <button onClick={() => handleAnswer(true, true)}>
                        Change Question
                    </button>
                    &nbsp;
                    <button onClick={() => endTest()}>End Test</button>
                </div>
            </div>
            <iframe
                src={question.questionLink}
                title="GRE Question"
                style={{
                    border: "1px solid gray",
                    marginTop: "10px",
                    width: "100%",
                    height: "calc(100vh - 145px)",
                }}
            />
        </div>
    );
}

export default GRETest;
