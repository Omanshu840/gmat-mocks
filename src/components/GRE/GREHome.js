import React, { useEffect, useState } from "react";
import Parse from "parse/dist/parse.min.js";
import GRETest from "./GRETest";
import { Container, Table } from "react-bootstrap";

function GREHome() {
    const [screen, setScreen] = useState("Home");
    const [previousAttempts, setPreviousAttempts] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let newPreviousAttempts = [];
            const query = new Parse.Query("TestAttempts");
            query.limit(1000);
            const entries = await query.find();
            // const entries = prevAttempts.results;
            entries.forEach((entry) => {
                newPreviousAttempts.push({
                    id: entry.id,
                    section: entry.attributes.Section,
                    questions: JSON.parse(entry.attributes.Questions),
                    createdAt: entry.attributes.createdAt,
                });
            });
            newPreviousAttempts = newPreviousAttempts.filter((attempt) => attempt.section==="GRE");
            newPreviousAttempts.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setPreviousAttempts(newPreviousAttempts);
        }
        if(screen === "Home") {
            fetchData();
        }
    }, [screen]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {screen === "Home" ? (
                <div>
                    <button
                        onClick={() => setScreen("Test")}
                        style={{ padding: "1rem 2rem", fontSize: "20px"}}
                    >
                        Start Test
                    </button>
                    <Container>
                    <div className="row" style={{ rowGap: "40px", marginTop: '40px' }}>
                        {previousAttempts.length>0 &&
                            previousAttempts.map((attempt) => (
                                <div className="attempt-card col-12">
                                    <div className="header">
                                        <div
                                            style={{
                                                fontSize: "18px",
                                                textTransform: "capitalize",
                                                fontWeight: "500",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            {new Date(
                                                attempt.createdAt
                                            ).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: false, // Ensures 12-hour format with AM/PM
                                                timeZone: "Asia/Kolkata",
                                            })}
                                        </div>
                                        <div>
                                            <div>
                                                Correct:{" "}
                                                {
                                                    attempt.questions.filter(
                                                        (q) => q.answer
                                                    ).length
                                                }
                                            </div>
                                            <div>
                                                Incorrect:{" "}
                                                {
                                                    attempt.questions.filter(
                                                        (q) => !q.answer
                                                    ).length
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="questions">
                                        <Table striped bordered hover>
                                            <tbody>
                                                {attempt.questions &&
                                                    attempt.questions.map(
                                                        (question) => (
                                                            <>
                                                                <tr>
                                                                    <td>
                                                                        <a
                                                                            href={
                                                                                question.link
                                                                            }
                                                                            target="_blank"
                                                                            className="text-blue-500"
                                                                            rel="noreferrer"
                                                                        >
                                                                            {
                                                                                question.questionNumber
                                                                            }
                                                                        </a>
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            question.type
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            question.difficulty
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {question.answer ? (
                                                                            "Correct"
                                                                        ) : (
                                                                            <div
                                                                                style={{
                                                                                    color: "red",
                                                                                }}
                                                                            >
                                                                                Incorrect
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            style={{
                                                                                overflowWrap:
                                                                                    "break-word",
                                                                            }}
                                                                        >
                                                                            {
                                                                                question.topic
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td
                                                                        style={
                                                                            question.timeTaken >
                                                                            "2:00"
                                                                                ? {
                                                                                      backgroundColor:
                                                                                          "#E96245",
                                                                                      color: "white",
                                                                                  }
                                                                                : {}
                                                                        }
                                                                    >
                                                                        <div>
                                                                            {
                                                                                question.timeTaken
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            question.selectedAnswer
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )
                                                    )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            ))}
                    </div>
                    </Container>
                </div>
            ) : (
                <GRETest previousAttempts={previousAttempts} setScreen={setScreen}/>
            )}
        </div>
    );
}

export default GREHome;
