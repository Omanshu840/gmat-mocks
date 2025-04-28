import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import questions from "../questions.json";
import quant_question from "../scraper/quant_questions.json";
import TPA_questions from "../scraper/TPA_questions.json";
import MSR_questions from "../scraper/MSR_questions.json";
import G_T_questions from "../scraper/G_T_questions.json";
import PS_Focus_questions from "../scraper/PS_Focus_questionsV2.json";
import CR_Focus_questions from "../scraper/CR_Focus_questions.json";
import RC_Focus_questions from "../scraper/RC_Focus_questions.json";
import MSR_Focus_questions from "../scraper/MSR_Focus_questions.json";
import G_T_Focus_questions from "../scraper/G_T_Focus_questions.json";
import TPA_Focus_questions from "../scraper/TPA_Focus_questions.json";
import DS_Focus_questions from "../scraper/DS_Focus_questions.json";
import RC_Non_Official_questions from "../scraper/RC_Non_Official_questions.json";
import PS_OG_question from "../scraper/PS_OG_questions.json";
import topicsDifficulties from "../unique_topics_difficulties.json";
import Parse from "parse/dist/parse.min.js";
import prevAttempts from "../prevAttempts/test.json";
import { Col, Container } from "react-bootstrap";

const totalQuestions = {
    verbal: 23,
    quant: 21,
    "data-insights": 20,
};

const TestPageV2 = () => {
    const { section, source } = useParams();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [question, setQuestion] = useState({});
    const [currentDifficulty, setCurrentDifficulty] = useState("Hard");
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [lastTimeCheck, setLastTime] = useState(0);
    const [questionMapping, setQuestionMapping] = useState({
        verbal: {
            RC: 12,
            CR: 11,
        },
        quant: {
            Quant: 21,
        },
        "data-insights": {
            DS: 7,
            DI: {
                MSR: 3,
                "Two-Part": 5,
                Tables: 3,
                Graphs: 2,
            },
        },
    });
    const [attemptedQuestions, setAttemptedQuestions] = useState([]);
    const [currAttempt, setCurrentAttempt] = useState([]);

    let sectionQuestion = [];

    if (section === "quant") {
        if(source === "focus-tests") {
            sectionQuestion = PS_Focus_questions;
            console.log("Loading Focus Questions");
        } else if(source === "official-guide") {
            sectionQuestion = PS_OG_question;
            console.log("Loading OG Questions");
        } else {
            sectionQuestion = [...quant_question, ...PS_Focus_questions, ...PS_OG_question];
        }
        // sectionQuestion = quant_question;
        sectionQuestion = PS_Focus_questions; // Focus Questions only
    } else if (section === "data-insights") {
        // const common_questions = questions.filter((q) => ((q.type==="DI" || q.type==="DS")));
        // sectionQuestion = [...common_questions, ...TPA_questions, ...MSR_questions, ...G_T_questions];
        sectionQuestion = [
            ...DS_Focus_questions,
            ...G_T_Focus_questions,
            ...MSR_Focus_questions,
            ...TPA_Focus_questions,
        ];
    } else {
        // sectionQuestion = questions.filter((q) => (
        //     (section==="verbal" && (q.type==="CR" || q.type==="RC"))
        // ))
        // sectionQuestion = [...sectionQuestion, ...RC_Non_Official_questions];
        sectionQuestion = [...CR_Focus_questions, ...RC_Focus_questions];
    }

    useEffect(() => {
        async function fetchData() {
            const newAttemptedQuestions = [];
            const query = new Parse.Query("TestAttempts");
            const entries = await query.find();
            // const entries = prevAttempts.results;
            entries.forEach((entry) => {
                if (entry.attributes.Section === section) {
                    const attemptedQuestion = JSON.parse(
                        entry.attributes.Questions
                    );
                    attemptedQuestion.forEach((q) => {
                        newAttemptedQuestions.push({
                            questionNumber: q.questionNumber,
                            type: q.type,
                        });
                    });
                }
            });
            console.log(newAttemptedQuestions);
            setAttemptedQuestions(newAttemptedQuestions);
            nextQuestion();
        }

        fetchData();

        window.https2http = function (imgElement) {
            if (imgElement && imgElement.src) {
              imgElement.src = imgElement.src.replace('https://', 'http://');
            }
          };

        const timer = setInterval(
            () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
            1000
        );
        return () => clearInterval(timer);
    }, []);

    const getFilteredQuestions = (sectionType, topic, difficulty) => {
        let filteredQuestions = sectionQuestion.filter(
            (q) =>
                q.difficulty === difficulty &&
                q.type === sectionType &&
                (topic === "" || q.topic === topic)
        );
        filteredQuestions = filteredQuestions.filter((q) => {
            if (
                !attemptedQuestions.find(
                    (aq) =>
                        aq.questionNumber === q.questionNumber &&
                        aq.type === q.type
                ) &&
                !currAttempt.find(
                    (cq) =>
                        cq.questionNumber === q.questionNumber &&
                        cq.type === q.type
                )
            ) {
                return true;
            }
            return false;
        });
        return filteredQuestions;
    };

    const getFilteredQuestion = (sectionType, topic, difficulty) => {
        const difficulties = topicsDifficulties[sectionType].difficulties;
        let index = difficulties.indexOf(difficulty);
        let filteredQuestions = getFilteredQuestions(
            sectionType,
            topic,
            difficulty
        );
        const start = index;
        while (filteredQuestions.length === 0) {
            index = index > 0 ? index - 1 : difficulties.length - 1;
            if (index === start) {
                break;
            }
            filteredQuestions = getFilteredQuestions(
                sectionType,
                topic,
                difficulties[index]
            );
        }
        return filteredQuestions[
            Math.floor(Math.random() * filteredQuestions.length)
        ];
    };

    const getNextQuestionType = (questionAttempts) => {
        const sectionTypes = Object.keys(questionMapping[section]);
        const sectionTypeIndex = Math.floor(
            Math.random() * sectionTypes.length
        );
        let sectionType = sectionTypes[sectionTypeIndex];
        let subSectionType = "";
        let newQuestionMapping;

        if (section === "verbal") {
            if (
                questionMapping[section]["RC"] > questionMapping[section]["CR"]
            ) {
                sectionType = "RC";
            } else {
                sectionType = "CR";
            }
        }

        if (
            (sectionType === "DS" &&
                questionMapping[section][sectionType] === 0) ||
            (sectionType === "DS" &&
                questionMapping[section][sectionType] * 3 <
                    totalQuestions["data-insights"] - currentIndex + 1)
        ) {
            sectionType = "DI";
        }

        if (
            sectionType === "DI" &&
            questionMapping["data-insights"]["DI"]["Graphs"] +
                questionMapping["data-insights"]["DI"]["MSR"] +
                questionMapping["data-insights"]["DI"]["Tables"] +
                questionMapping["data-insights"]["DI"]["Two-Part"] <=
                0
        ) {
            sectionType = "DS";
        }

        // Show 3 same question for RC and MSR
        let rcCount = 0,
            msrCount = 0,
            showSameQuestion = false;
        if (questionAttempts.length > 0) {
            for (let i = questionAttempts.length - 1; i >= 0; i--) {
                if (questionAttempts[i].type !== "RC") {
                    break;
                }
                rcCount++;
            }
            if (rcCount > 0 && rcCount % 3 > 0) {
                sectionType = "RC";
                showSameQuestion = true;
            }
            for (let i = questionAttempts.length - 1; i >= 0; i--) {
                if (questionAttempts[i].topic !== "MSR") {
                    break;
                }
                msrCount++;
            }
            if (msrCount > 0 && msrCount % 3 > 0) {
                showSameQuestion = true;
                sectionType = "DI";
            }
        }

        if (sectionType === "DI") {
            const subSectionTypes = Object.keys(
                questionMapping[section][sectionType]
            );
            const subSectionTypeIndex = Math.floor(
                Math.random() * subSectionTypes.length
            );
            subSectionType = subSectionTypes[subSectionTypeIndex];

            if (msrCount % 3 > 0) {
                subSectionType = "MSR";
            } else {
                let subRep = 1;
                while (
                    questionMapping[section][sectionType][subSectionType] ===
                        0 &&
                    subRep < subSectionTypes.length
                ) {
                    subSectionType =
                        subSectionTypes[
                            (subSectionTypeIndex + subRep) %
                                subSectionTypes.length
                        ];
                    subRep++;
                }
            }

            newQuestionMapping = {
                ...questionMapping,
                [section]: {
                    ...questionMapping[section],
                    [sectionType]: {
                        ...questionMapping[section][sectionType],
                        [subSectionType]:
                            questionMapping[section][sectionType][
                                subSectionType
                            ] - 1,
                    },
                },
            };
        } else {
            let rep = 1;
            while (
                questionMapping[section][sectionType] === 0 &&
                rep < sectionTypes.length &&
                sectionType !== "DS"
            ) {
                sectionType =
                    sectionTypes[
                        (sectionTypeIndex + rep) % sectionTypes.length
                    ];
                rep++;
            }

            newQuestionMapping = {
                ...questionMapping,
                [section]: {
                    ...questionMapping[section],
                    [sectionType]: questionMapping[section][sectionType] - 1,
                },
            };
        }

        setQuestionMapping(newQuestionMapping);
        return { sectionType, subSectionType, showSameQuestion };
    };

    const nextQuestion = (currentAnswer, answer) => {
        const newVal = currAttempt;

        if (
            currentAnswer !== null &&
            question.type &&
            question.questionNumber
        ) {
            // if(!newVal.find(q => (q.type===question.type) && (q.questionNumber===question.questionNumber))) {
            const timeTaken = 45 * 60 - timeLeft - lastTimeCheck;
            newVal.push({
                type: question.type,
                questionNumber: question.questionNumber,
                difficulty: question.difficulty,
                link: question.link,
                topic: question.topic,
                answer: currentAnswer,
                selectedAnswer: answer,
                timeTaken: `${Math.floor(timeTaken / 60)}:${
                    timeTaken % 60 < 10 ? `0${timeTaken % 60}` : timeTaken % 60
                }`,
            });
            setLastTime(45 * 60 - timeLeft);
            // }
            setCurrentAttempt(newVal);
        }

        if (currentIndex === totalQuestions[section]) {
            onEndTest(newVal);
            return;
        }

        const nextQuestionType = getNextQuestionType(newVal);
        const nextSectionType = nextQuestionType.sectionType;
        const nextSubSectionType = nextQuestionType.subSectionType;
        if (!nextQuestionType.showSameQuestion) {
            const newDifficulty = currentAnswer
                ? increaseDifficulty(nextSectionType)
                : decreaseDifficulty(nextSectionType, currentAnswer);
            const filteredQuestion = getFilteredQuestion(
                nextSectionType,
                nextSubSectionType,
                newDifficulty
            );
            console.log(filteredQuestion);
            setQuestion(filteredQuestion);
            setAnswer("");
            document.getElementById("question-container").innerHTML = filteredQuestion.questionText
            setCurrentDifficulty(newDifficulty);
        }
        setCurrentIndex((prev) => {
            return prev + 1;
        });
        setSelectedAnswer(currentAnswer);
    };

    const increaseDifficulty = (sectionType) => {
        const difficulties = topicsDifficulties[sectionType].difficulties;
        const index = difficulties.indexOf(currentDifficulty);
        if (currentDifficulty === "Very Hard") {
            return difficulties[index - 1];
        }
        return index < difficulties.length - 1
            ? difficulties[index + 1]
            : currentDifficulty;
    };

    const decreaseDifficulty = (sectionType, currentAnswer) => {
        if (currentAnswer === null) return "Hard";
        if (selectedAnswer && currentDifficulty !== "Very Hard") {
            return currentDifficulty;
        } else {
            const difficulties = topicsDifficulties[sectionType].difficulties;
            const index = difficulties.indexOf(currentDifficulty);
            return index > 0 ? difficulties[index - 1] : currentDifficulty;
        }
    };

    const changeQuestion = () => {
        const topic = question.topic !== "Geometry" ? question.topic : "";
        const newQuestion = getFilteredQuestion(
            question.type,
            topic,
            question.difficulty
        );
        document.getElementById("question-container").innerHTML = newQuestion.questionText
        setQuestion(newQuestion);
    };

    const onEndTest = async (newVal) => {
        const attempts = newVal || currAttempt;
        let testAttempt = new Parse.Object("TestAttempts");
        testAttempt.set("Section", section);
        testAttempt.set("Questions", JSON.stringify(attempts));
        await testAttempt.save();
        navigate("/gmat-mocks");
    };

    return (
        <div className="home">
            <div className="timer">
                <button onClick={() => onEndTest()} className="">
                    End
                </button>
                <div>
                    Time Left: {Math.floor(timeLeft / 60)}:
                    {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
                </div>
            </div>
            <div className="question-info">
                <div className="text-bold">
                    <b>
                        Question {currentIndex} of {totalQuestions[section]}
                    </b>{" "}
                    <a
                        href={question.link}
                        target="_blank"
                        className="text-blue-500"
                    >
                        {question.questionNumber}
                    </a>
                </div>
                <div className="radio-buttons">
                    <button onClick={() => nextQuestion(answer===question.answer, answer)} className="">
                        Next
                    </button>
                    <button onClick={() => changeQuestion()} className="">
                        Change
                    </button>
                </div>
            </div>
            <Container>
                {/* <a href={question.link} target="_blank" className="text-blue-500 link">Attempt Here</a> */}
                <div id="question-container" className="question-container mt-5 mb-3 p-4">
                    {/* {question.questionText} */}
                </div>
                <div className="options">
                    {["A", "B", "C", "D", "E"].map((option, index) => (
                        <div
                            className={`option ${
                                answer === option ? "selected" : ""
                            }`}
                            onClick={() => setAnswer(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default TestPageV2;
