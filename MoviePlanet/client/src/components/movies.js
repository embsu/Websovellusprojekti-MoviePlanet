import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Apikey from './apikey';
import defaultPoster from './../../src/questionmark.png';
import AddReviewPopUp from './addreview';
import '../movies.css';
import { UsernameSignal } from './signals';
import { useLocation } from 'react-router-dom';

const Movies = ({ tmdbApiKey }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isReviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const location = useLocation();
  const openReviewPopup = (movie) => {
    if (movie && movie.title) {
      setReviewPopupOpen(true);
      setSelectedMovie(movie);
    } else {
      console.error('Elokuvan tiedoissa puuttuu otsikko tai elokuva on undefined.');
    }
  };

  const closeReviewPopup = () => {
    setReviewPopupOpen(false);
  };

  useEffect(() => {
    axios
      .get('https://api.themoviedb.org/3/genre/movie/list', {
        params: {
          api_key: tmdbApiKey,
        },
      })
      .then(response => {
      })
      .catch(error => console.error('Virhe genrien hakemisessa:', error.response || error.message));
  }, [tmdbApiKey]);

  useEffect(() => {
    axios
      .get('https://api.themoviedb.org/3/trending/movie/week', {
        params: {
          api_key: tmdbApiKey,
        },
      })
      .then(response => setTopMovies(response.data.results))
      .catch(error => console.error('Virhe top-elokuvien hakemisessa:', error.response || error.message));
  }, [tmdbApiKey]);

  useEffect(() => {
    const searchTermFromLocationState = location.state?.searchTerm;
    if (searchTermFromLocationState) {
      setSearchTerm(searchTermFromLocationState);
    } else {
      // If no search term is in the location state, reset the search term to an empty string
      setSearchTerm('');
    }
  }, [location]);

  useEffect(() => {
    const fetchMovies = async () => {
      const currentSearchTerm = searchTerm.trim();

      try {
        let response;
        if (currentSearchTerm === '' && selectedGenres.length > 0) {
          response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: {
              api_key: tmdbApiKey,
              with_genres: selectedGenres.join(','),
              sort_by: 'popularity.desc',
            },
          });
        } else if (currentSearchTerm !== '') {
          response = await axios.get('https://api.themoviedb.org/3/search/movie', {
            params: {
              api_key: tmdbApiKey,
              query: currentSearchTerm,
            },
          });
        }

        const filteredResults = response.data.results.filter(movie => {
          const genresMatch = selectedGenres.every(genreId =>
            movie.genre_ids.includes(parseInt(genreId, 10))
          );
          return genresMatch;
        });

        setSearchResults(filteredResults.slice(0, 20));
      } catch (error) {
        console.error('Virhe elokuvien hakemisessa:', error.response || error.message);
      }
    };
    fetchMovies();
  }, [searchTerm, selectedGenres, tmdbApiKey]);

  const handleGenreClick = (genreId) => {

    const newSelectedGenres = [...selectedGenres];

    if (newSelectedGenres.includes(genreId)) {
      const index = newSelectedGenres.indexOf(genreId);
      newSelectedGenres.splice(index, 1);
    } else {
      newSelectedGenres.push(genreId);
    }
    setSelectedGenres(newSelectedGenres);
  };

  return (
    <div className="movies-container">
      <h1>Elokuvien hakeminen</h1>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Hae elokuvia"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="movies-input"
        />
        <div className="genre-buttons">
          <button
            className={selectedGenres.includes('28') ? 'active' : ''}
            onClick={() => handleGenreClick('28')}
          >
            Action
          </button>
          <button
            className={selectedGenres.includes('16') ? 'active' : ''}
            onClick={() => handleGenreClick('16')}
          >
            Animation
          </button>
          <button
            className={selectedGenres.includes('35') ? 'active' : ''}
            onClick={() => handleGenreClick('35')}
          >
            Comedy
          </button>
          <button
            className={selectedGenres.includes('99') ? 'active' : ''}
            onClick={() => handleGenreClick('99')}
          >
            Documentary
          </button>
          <button
            className={selectedGenres.includes('10751') ? 'active' : ''}
            onClick={() => handleGenreClick('10751')}
          >
            Family
          </button>
          <button
            className={selectedGenres.includes('36') ? 'active' : ''}
            onClick={() => handleGenreClick('36')}
          >
            History
          </button>
          <button
            className={selectedGenres.includes('27') ? 'active' : ''}
            onClick={() => handleGenreClick('27')}
          >
            Horror
          </button>
          <button
            className={selectedGenres.includes('10402') ? 'active' : ''}
            onClick={() => handleGenreClick('10402')}
          >
            Music
          </button>
          <button
            className={selectedGenres.includes('10749') ? 'active' : ''}
            onClick={() => handleGenreClick('10749')}
          >
            Romance
          </button>
          <button
            className={selectedGenres.includes('878') ? 'active' : ''}
            onClick={() => handleGenreClick('878')}
          >
            Science Fiction
          </button>
          <button
            className={selectedGenres.includes('53') ? 'active' : ''}
            onClick={() => handleGenreClick('53')}
          >
            Thriller
          </button>
        </div>
      </div>
      <div className="movies-grid">
        {searchResults.map((movie, index) => (
          <div key={movie.id} className="movie-item">
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : defaultPoster}
              alt={movie.title}
              className="movie-poster"
              onError={(e) => {
                e.target.src = defaultPoster;
              }}
            />
            <h2 className="movie-title">{movie.title}</h2>
            <button
              className='lisaaArvosteluBtn'
              onClick={() => {
                if (UsernameSignal.value === null) {
                  alert("Sinun täytyy kirjautua sisään ensin.");
                } else {
                  openReviewPopup(movie);
                }
              }}
              title={`Arvioi ${movie.title}`}
            >
              <img src='/pictures/feedback-hand.png' id="searchBtnImg" alt={`Arvioi ${movie.title}`} />
            </button>
            {isReviewPopupOpen && (
              <AddReviewPopUp movie={selectedMovie} onClose={closeReviewPopup} />
            )}
          </div>
        ))}
      </div>
      {!searchTerm && (
        <>
          <h1>Tämän hetkiset viikon villitykset</h1>
          <div className="movies-grid">
            {topMovies.map((movie, index) => (
              <div key={movie.id} className="movie-item">
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : defaultPoster}
                  alt={movie.title}
                  className="movie-poster"
                  onError={(e) => {
                    e.target.src = defaultPoster;
                  }}
                />
                <h2 className="movie-title">{movie.title}</h2>
                <button
                  className='lisaaArvosteluBtn'
                  onClick={() => {
                    if (UsernameSignal.value === null) {
                      alert("Sinun täytyy kirjautua sisään ensin.");
                    } else {
                      openReviewPopup(movie);
                    }
                  }}
                  title={`Arvioi ${movie.title}`}
                >
                  <img src='/pictures/feedback-hand.png' id="searchBtnImg" alt={`Arvioi ${movie.title}`} />
                </button>
                {isReviewPopupOpen && (
                  <AddReviewPopUp movie={selectedMovie} onClose={closeReviewPopup} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
const MoviesWithApiKey = () => (
  <Apikey>
    {({ tmdbApiKey }) => <Movies tmdbApiKey={tmdbApiKey} />}
  </Apikey>
);

export default MoviesWithApiKey;
