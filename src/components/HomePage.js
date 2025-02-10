import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import Table from 'react-bootstrap/Table';
import Nav from 'react-bootstrap/Nav';
import Parse from 'parse/dist/parse.min.js';
import prevAttempts from "../prevAttempts/test.json";

const HomePage = () => {
    const [previousAttempts, setPreviousAttempts] = useState([]);
    const [filteredAttempts, setFilteredAttempts] = useState([]);
    const [activeTab, setActiveTab] = useState("quant");

    useEffect(() => {
        filterAttempts();
    }, [activeTab])

    const filterAttempts = (newPreviousAttempts) => {
        newPreviousAttempts = newPreviousAttempts || previousAttempts;
        const attempts = newPreviousAttempts.filter(attempt => attempt.section===activeTab)
        // attempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFilteredAttempts(attempts);
    }

    useEffect(() => {
        async function fetchData() {
            const newPreviousAttempts = [];
            const query = new Parse.Query('TestAttempts');
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
            filterAttempts(newPreviousAttempts);
        }
        fetchData();
    }, []);

  return (
    <div className="home">
      <h1 className="text-2xl font-bold mt-5">GMAT Adaptive Timed Test</h1>
      <div className="mt-5 sections">
        <Link to="/gmat-mocks/test/verbal" className="block">Verbal</Link>
        <Link to="/gmat-mocks/test/quant" className="block">Quant</Link>
        <Link to="/gmat-mocks/test/data-insights" className="block">Data Insights</Link>
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
                                <tr>
                                    <td><a href={question.link} target="_blank" className="text-blue-500">{question.questionNumber}</a></td>
                                    <td>{question.type}</td>
                                    <td>{question.difficulty}</td>
                                    <td>{question.answer ? "Correct": <div style={{color: 'red'}}>Incorrect</div>}</td>
                                    <td><div style={{overflowWrap: 'break-word'}}>{question.topic}</div></td>
                                </tr>
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