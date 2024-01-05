import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/navbar';
import FrontPageView from './components/frontpageview';
import NewsView from './components/news';
import AllMovies from './components/movies';
import AllReviews from './components/review';
import Communities from './components/communities';
import Settings from './components/settings';
import { Communitypage } from './components/communitypage';

function App() {
  return (
    <Router>
      <div>
      <NavBar />
      <Routes>
        <Route path="/" exact element={<FrontPageView />} />
        <Route path="/uutiset" element={<NewsView />} />
        <Route path="/elokuvat" element={<AllMovies />} />
        <Route path="/arvostelut" element={<AllReviews />} />
        <Route path="/ryhmat" element={<Communities />} />
        <Route path="/asetukset" element={<Settings />} /> 
        <Route path="ryhma/:groupname" element={<Communitypage />} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;