import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import Table from 'react-bootstrap/Table';
import Nav from 'react-bootstrap/Nav';
import Parse from 'parse/dist/parse.min.js';
import prevAttempts from "../prevAttempts/test.json";
import { Accordion, Dropdown, Form } from "react-bootstrap";
import questions from "../scraper/output.json";

const Summary = (summary) => {
    const { topics, types } = summary;
    const topicKeys = Object.keys(topics);
    const typeKeys = Object.keys(types);
    const topicData = topicKeys.map((key) => {
        const topic = topics[key];
        return {
            topic: key,
            correct: topic.correct,
            incorrect: topic.incorrect,
            total: topic.total,
            accuracy: topic.correct / topic.total
        }
    })
    topicData.sort((a, b) => a.accuracy - b.accuracy);

    const typeData = typeKeys.map((key) => {
        const type = types[key];
        return {
            type: key,
            correct: type.correct,
            incorrect: type.incorrect,
            total: type.total,
            accuracy: type.correct / type.total
        }
    })
    typeData.sort((a, b) => a.accuracy - b.accuracy);

    return (
        <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Summary</Accordion.Header>
                <Accordion.Body>
                    <div className="summary">
                        <div className="topics">
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Topic</th>
                                        <th>Correct</th>
                                        <th>Incorrect</th>
                                        <th>Total</th>
                                        <th>Accuracy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topicData.map((topic) => (
                                        <tr key={topic.topic}>
                                            <td>{topic.topic}</td>
                                            <td>{topic.correct}</td>
                                            <td>{topic.incorrect}</td>
                                            <td>{topic.total}</td>
                                            <td>{(topic.accuracy * 100).toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="type mt-5">
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Correct</th>
                                        <th>Incorrect</th>
                                        <th>Total</th>
                                        <th>Accuracy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {typeData.map((type) => (
                                        <tr key={type.type}>
                                            <td>{type.type}</td>
                                            <td>{type.correct}</td>
                                            <td>{type.incorrect}</td>
                                            <td>{type.total}</td>
                                            <td>{(type.accuracy * 100).toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )
}

const HomePage = () => {
    const [previousAttempts, setPreviousAttempts] = useState([]);
    const [filteredAttempts, setFilteredAttempts] = useState([]);
    const [incorrectFilter, setIncorrectFilter] = useState(false);
    const [activeTab, setActiveTab] = useState("quant");
    const [source, setSource] = useState("focus-tests");
    const [summary, setSummary] = useState({
        quant: [],
        verbal: [],
        "data-insights": []
    });

    useEffect(() => {
        filterAttempts();
    }, [activeTab])

    const filterAttempts = (newPreviousAttempts) => {
        newPreviousAttempts = newPreviousAttempts || previousAttempts;
        const attempts = newPreviousAttempts.filter(attempt => attempt.section===activeTab)
        // attempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFilteredAttempts(attempts);
    }

    const processSummary = (attempts) => {
        const summary = {
            quant: {
                topics: {},
                types: {},
            },
            verbal: {
                topics: {},
                types: {},
            },
            "data-insights": {
                topics: {},
                types: {},
            }
        }
        attempts.forEach(attempt => {
            const section = attempt.section;
            const questions = attempt.questions;
            questions.forEach(question => {
                const topic = question.topic;
                const type = question.type;
                const answer = question.answer;

                if (!summary[section].topics[topic]) {
                    summary[section].topics[topic] = {
                        correct: 0,
                        incorrect: 0,
                        total: 0
                    }
                }
                if (!summary[section].types[type]) {
                    summary[section].types[type] = {
                        correct: 0,
                        incorrect: 0,
                        total: 0
                    }
                }

                summary[section].topics[topic].total += 1;
                summary[section].types[type].total += 1;

                if (answer) {
                    summary[section].topics[topic].correct += 1;
                    summary[section].types[type].correct += 1;
                } else {
                    summary[section].topics[topic].incorrect += 1;
                    summary[section].types[type].incorrect += 1;
                }
            })
        })
        setSummary(summary);
    }

    useEffect(() => {
        async function fetchData() {
            const newPreviousAttempts = [];
            const query = new Parse.Query('TestAttempts');
            query.limit(1000);
            const entries = await query.find();
            // const entries = prevAttempts.results;
            entries.forEach(entry => {
                newPreviousAttempts.push({
                    id: entry.id,
                    section: entry.attributes.Section,
                    questions: JSON.parse(entry.attributes.Questions),
                    createdAt: entry.attributes.createdAt
                })
            })
            newPreviousAttempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPreviousAttempts(newPreviousAttempts);
            processSummary(newPreviousAttempts);
            filterAttempts(newPreviousAttempts);
        }
        fetchData();
        // document.getElementById("question-container").innerHTML = questions[0].questionText;
        // MathJax.typesetPromise();
    }, []);

  return (
    <div className="home">
      <h1 className="text-2xl font-bold mt-5">GMAT Adaptive Timed Test</h1>
      <h3 className="mt-5">Tests</h3>
      <div className="mt-2 mb-2">
        <Form.Select
            aria-label="Default select example"
            onChange={(e) => {
                setSource(e.target.value);
                console.log(e.target.value);
            }}
        >
            <option value="focus-tests">Focus Tests</option>
            <option value="official-guide">Official Guide</option>
            <option value="all">All Sources</option>
        </Form.Select>
      </div>
      <div className="mt-2 sections">
        <Link to={`/gmat-mocks/test/verbal/${source}`} className="block">Verbal</Link>
        <Link to={`/gmat-mocks/testV2/quant/${source}`} className="block">Quant</Link>
        <Link to={`/gmat-mocks/test/data-insights/${source}`} className="block">Data Insights</Link>
      </div>

      <h3 className="mt-5 mb-3">Practice Sections</h3>
      <div className="sections">
        <Link to="/gmat-mocks/practice/Quant" className="block">PS</Link>
        <Link to="/gmat-mocks/practice/RC" className="block">RC</Link>
        <Link to="/gmat-mocks/practice/CR" className="block">CR</Link>
        <Link to="/gmat-mocks/practice/DS" className="block">DS</Link>
        <Link to="/gmat-mocks/practice/Two-Part" className="block">TPA</Link>
        <Link to="/gmat-mocks/practice/MSR" className="block">MSR</Link>
        <Link to="/gmat-mocks/practice/GT" className="block">G&T</Link>
      </div>

      {filteredAttempts.length > 0 && 
      <div className="previous-attempts">
        <div className="heading">Previous Attempts</div>
        <Nav variant="pills" defaultActiveKey="quant" onSelect={(e) => setActiveTab(e)}>
            <Nav.Item>
                <Nav.Link eventKey="quant">Quant</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="data-insights">Data Insights</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="verbal">Verbal</Nav.Link>
            </Nav.Item>
        </Nav>
        <div className="attempts container">

            <Summary {...summary[activeTab]} />

        <div className="row justify-content-center mt-4 mb-3">
            <div
                className="widget col-2"
                style={incorrectFilter
                    ? {backgroundColor: '#0d6efd', color: 'white'}
                    : {color: '#0d6efd'}}
                onClick={() => {
                    setIncorrectFilter(!incorrectFilter);
                }}
            >
                Incorrect
            </div>
        </div>

            <div className="row" style={{rowGap: '20px'}}>
            {filteredAttempts.length && filteredAttempts.map((attempt) => (
            <div className="attempt-card col-12">
                <div className="header">
                    <div style={{fontSize: '18px', textTransform: 'capitalize', fontWeight: '500', marginBottom: '20px'}}>
                        {new Date(attempt.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false, // Ensures 12-hour format with AM/PM
                            timeZone: "Asia/Kolkata"
                        })}
                    </div>
                    <div>
                        <div>Correct: {(attempt.questions.filter(q => q.answer)).length}</div>
                        <div>Incorrect: {(attempt.questions.filter(q => !q.answer)).length}</div>
                    </div>
                </div>
                <div className="questions">
                    <Table striped bordered hover>
                        <tbody>
                            {attempt.questions && attempt.questions.map((question) => (
                                <>  
                                {((incorrectFilter && !question.answer) || !incorrectFilter) &&                              
                                    <tr>
                                        <td><a href={question.link} target="_blank" className="text-blue-500">{question.questionNumber}</a></td>
                                        <td>{question.type}</td>
                                        <td>{question.difficulty}</td>
                                        <td>{question.answer ? "Correct": <div style={{color: 'red'}}>Incorrect</div>}</td>
                                        <td><div style={{overflowWrap: 'break-word'}}>{question.topic}</div></td>
                                        <td style={(question.timeTaken > "2:00" ? {backgroundColor: '#E96245', color: 'white'} : {})}><div>{question.timeTaken}</div></td>
                                    </tr>
                                }   
                                </>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            ))}
            </div>
        </div>
      </div>
    }
    </div>
  );
};

export default HomePage;