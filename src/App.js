import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import TestPage from './components/TestPage';
import Parse from 'parse/dist/parse.min.js';
import PracticePage from './components/PracticePage';
import TestPageV2 from './components/TestPageV2';

const PARSE_APPLICATION_ID = 'J5wr1IL9iqoN6xRtEi42ofFq4opeiPvggLUsfG8j';
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_KEY = 'BKsVHyKj88FiyOLZ0jVwgW9cjmw4dBY8t05tkeNv';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;


const App = () => {
	return (
	  <Router>
		<Routes>
		  <Route path="/gmat-mocks" element={<HomePage />} />
		  <Route path="/gmat-mocks/test/:section/:source" element={<TestPage />} />
		  <Route path="/gmat-mocks/testV2/:section/:source" element={<TestPageV2 />} />
		  <Route path="/gmat-mocks/practice/:type" element={<PracticePage/>} />
		</Routes>
	  </Router>
	);
  };
  
  export default App;