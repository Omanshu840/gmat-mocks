import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import Parse from 'parse/dist/parse.min.js';

const HomePage = () => {
    const [previousAttempts, setPreviousAttempts] = useState([]);


    useEffect(() => {
        async function fetchData() {
            const newPreviousAttempts = [];
            const query = new Parse.Query('TestAttempts');
            const entries = await query.find();
            entries.forEach(entry => {
                newPreviousAttempts.push({
                    id: entry.id,
                    section: entry.attributes.Section,
                    questions: JSON.parse(entry.attributes.Questions)
                })
            })
            setPreviousAttempts(newPreviousAttempts);
        }

        fetchData();
    }, []);

  return (
    <div className="home">
      <h1 className="text-2xl font-bold">GMAT Adaptive Timed Test</h1>
      <div className="mt-5 sections">
        <Link to="/GMAT-Mocks/test/verbal" className="block p-2 bg-blue-500 text-white rounded">Verbal</Link>
        <Link to="/GMAT-Mocks/test/quant" className="block p-2 bg-green-500 text-white rounded mt-2">Quant</Link>
        <Link to="/GMAT-Mocks/test/data-insights" className="block p-2 bg-red-500 text-white rounded mt-2">Data Insights</Link>
      </div>

      <div className="previous-attempts">
        <div className="heading">Previous Attempts</div>

        <div className="attempts">
            {previousAttempts.length && previousAttempts.map((attempt) => (
            <div className="attempt-card">
                <div className="header">
                    <div style={{fontSize: '18px', textTransform: 'capitalize', fontWeight: '500', marginBottom: '20px'}}>{attempt.section}</div>
                    <div>
                        <div>Correct: {(attempt.questions.filter(q => q.answer)).length}</div>
                        <div>Incorrect: {(attempt.questions.filter(q => !q.answer)).length}</div>
                    </div>
                </div>
                <div className="questions">
                    {attempt.questions && attempt.questions.map((question) => (
                        <div className="question">
                            <a href={question.link} target="_blank" className="text-blue-500">{question.questionNumber}</a>
                            <div>{question.type}</div>
                            <div>{question.difficulty}</div>
                            <div>{question.answer ? "Correct": <div style={{color: 'red'}}>Incorrect</div>}</div>
                            <div>{question.topic}</div>
                        </div>
                    ))}
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;