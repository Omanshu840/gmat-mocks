import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import TestPage from './components/TestPage';
import Parse from 'parse/dist/parse.min.js';

const PARSE_APPLICATION_ID = 'J5wr1IL9iqoN6xRtEi42ofFq4opeiPvggLUsfG8j';
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_KEY = 'BKsVHyKj88FiyOLZ0jVwgW9cjmw4dBY8t05tkeNv';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;


const App = () => {
	return (
	  <Router>
		<Routes>
		  <Route path="/" element={<HomePage />} />
		  <Route path="/test/:section" element={<TestPage />} />
		</Routes>
	  </Router>
	);
  };
  
  export default App;