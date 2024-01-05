import React, { useState, useEffect } from 'react';
import '../frontpage.css';
import axios from 'axios';
import Apikey from './apikey';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function FrontPageView() {
    return (
        <div>
            <MovieSearchBar />
            <FreshNews />
            <LastReviews />
            <div id='popularPalkit'>
                <AnnaApikey />
                <MostPopularGroups />
            </div>
        </div>
    )
}

function MovieSearchBar() {

    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (location.pathname === '/elokuvat' && location.state?.searchTerm) {
            setSearchTerm(location.state.searchTerm);
        }
    }, [location]);

    const handleSearch = () => {
        navigate('/elokuvat', { state: { searchTerm } });
    };

    return (

        <div id='searchMovie'>
            <section id='transParency'>
                <h4 className='etusivunH4'>Hae elokuvaa</h4>
                <section id='haeElokuva'>
                    <input id='search-box' type='text' placeholder='Hae elokuvaa' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <button id='searchBtn' onClick={handleSearch}>
                        <img src='/pictures/loupe.png' id="searchBtnImg" alt="search" />
                    </button>
                </section>
                <div id='suodatus'>
                    <Link to="/elokuvat" className='kk1k23312k11'>
                        <button className='genreBtn'>Kauhu</button></Link>
                    <Link to="/elokuvat" className='kk1k23312k11'>
                        <button className='genreBtn'>Komedia</button></Link>
                    <Link to="/elokuvat" className='kk1k23312k11'>
                        <button className='genreBtn'>Fantasia</button></Link>
                    <select id="genreDropdown">
                        <option value="">Lisää genrejä</option>
                        <option value="1">Toiminta</option>
                        <option value="2">Seikkailu</option>
                        <option value="3">Rikos</option>
                        <option value="4">Draama</option>
                    </select>
                </div>
            </section>
        </div>
    )
}

function FreshNews() {

    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('https://www.finnkino.fi/xml/News/');
                if (!response.ok) {
                    throw new Error('Uutisten haku epäonnistui');
                }
                const xmldata = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmldata, 'text/xml');
                const newsElements = xmlDoc.getElementsByTagName('NewsArticle');
                const newsData = [...newsElements].slice(0, 5).map((article) => ({
                    Title: article.querySelector('Title').textContent,
                    ArticleURL: article.querySelector('ArticleURL').textContent,
                    ImageURL: article.querySelector('ImageURL').textContent,
                }));
                setNews(newsData);
            } catch (error) {
                console.error('Virhe uutisten hakemisessa:', error);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className='etusivuPalkit'>
            <h4 className='etusivunH4'>Tuoreimmat uutiset</h4>
            <div id='uutisetEtusivu'>
                <ul id='uutisetUlEtusivu'>
                    {news.map((article) => (
                        <li key={article.Title} id='uutisetLiItem'>
                            <img src={article.ImageURL} alt={article.Title} />
                            <a href={article.ArticleURL} target="_blank" className='etusivunLinkit'>
                                {article.Title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <Link to="/uutiset" className='kk1k23312k11'>
                <button className='naytaLisaaBtn'>Näytä lisää...</button>
            </Link>
        </div>
    )
}

function LastReviews() {

    const [tmdbApiKey, setTmdbApiKey] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get('http://localhost:3001/review//allmoviereviews');

            } catch (error) {
                console.error('Virhe arvostelujen hakemisessa:', error);
            }
        };
        fetchReviews();
    }, []);

    const [review, setReview] = useState([]);
    const [movieData, setMovieData] = useState([]);
    const [userDetails, setUserDetails] = useState([]);

    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getApiKey');
                const apiKey = response.data.apiKey;
                setTmdbApiKey(apiKey);
            } catch (error) {
                console.error('Error fetching API key:', error);
            }
        };
        fetchApiKey();
    }, []);

    useEffect(() => {
        if (tmdbApiKey) {
            const fetchReviews = async () => {
                try {
                    const response = await axios.get('http://localhost:3001/review//allmoviereviews');

                    if (response.data && response.data.length >= 5) {
                        const sortedReviews = response.data.sort((a, b) => b.idreview - a.idreview);  // Sort the reviews by ID in descending order
                        const lastReview = sortedReviews.slice(0, 5); // Take the first four reviews
                        setReview(lastReview);

                    } else {
                        console.log("Arvosteluja ei löytynyt tai niitä on alle 3.");
                    }

                    const movieDataPromises = response.data.map(async (review) => {
                        const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${review.movieidapi}`, {
                            params: {
                                api_key: tmdbApiKey,
                            },
                        });
                        return movieResponse.data;
                    });

                    const movies = await Promise.all(movieDataPromises);
                    setMovieData(movies);

                    const userDetailsPromises = response.data.map(async (review) => {
                        const userResponse = await axios.get('http://localhost:3001/customer/getUser/?idcustomer=' + review.idcustomer);
                        return userResponse.data[0];
                    });
                    const users = await Promise.all(userDetailsPromises);
                    setUserDetails(users);
                } catch (error) {
                    console.error('Virhe arvostelujen hakemisessa:', error);
                }
            };
            fetchReviews();
        }
    }, [tmdbApiKey]);

    function convertToStars(moviestars) {
        const maxStars = 5;
        const fullStar = '★';
        const emptyStar = '☆';
        const clampedStars = Math.min(Math.max(0, moviestars), maxStars);
        const fullStarsCount = Math.floor(clampedStars);
        const emptyStarsCount = maxStars - fullStarsCount;
        const stars = fullStar.repeat(fullStarsCount) + emptyStar.repeat(emptyStarsCount);

        return stars;
    }

    return (
        <div className='etusivuPalkit'>
            <h4 className='etusivunH4'>Viimeisimmät arvostelut</h4>
            <div id='etusivunReviews'>
                {review.map((review, index) => (
                    <div id='etusivunReviewReview' key={review.idreview}>
                        {movieData[index] && userDetails[index] && (
                            <div key={movieData[index].id} className='movie-containerEtusivu'>
                                <img id='posteriEtusivu' src={`https://image.tmdb.org/t/p/w500/${movieData[index]?.poster_path}`} alt='Movie Poster' />
                                <p className='lastReviews_P'>{movieData[index]?.title}</p>
                                <p className='lastReviews_P'>{convertToStars(review.moviestars)}</p>
                                <p className='lastReviews_P'>{'"' + review.review + '"'}</p>
                                <p className='lastReviews_P'>{'-' + userDetails[index]?.username}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <Link to="/arvostelut" className='kk1k23312k11'>
                <button className='naytaLisaaBtn'>Näytä lisää...</button>
            </Link>
        </div>
    )
}

function MostPopularMovies({ tmdbApiKey }) {
    const [popularMovies, setPopularMovies] = useState([]);

    useEffect(() => {
        const fetchPopularMovies = async () => {
            try {
                const response = await axios.get('https://api.themoviedb.org/3/trending/movie/week', {
                    params: {
                        api_key: tmdbApiKey,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                });

                if (response.data.results && response.data.results.length >= 4) {
                    const trendingMovies = response.data.results.slice(0, 4);
                    setPopularMovies(trendingMovies);
                } else {
                    console.log("Elokuvia ei löytynyt tai niitä on alle 3.");
                }
            } catch (error) {
                console.error('Virhe top-elokuvien hakemisessa:', error);
            }
        };
        fetchPopularMovies();
    }, []);

    return (
        <div className='moovitpopular'>
            <h4 className='alaetusivun_h4'>Viikon villitykset</h4>
            <ul className='popularitUlEtusivu'>
                {popularMovies.map(movie => (
                    <li className='popularitLiItems' key={movie.id}>
                        <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} />
                        <p>{movie.title}</p>
                    </li>
                ))}
            </ul>
            <Link to="/elokuvat" className='kk1k23312k11'>
                <button className='naytaLisaaBtn'>Näytä lisää...</button>
            </Link>
        </div>
    )
};

function AnnaApikey() {
    return (
        <Apikey>
            {({ tmdbApiKey }) => <MostPopularMovies tmdbApiKey={tmdbApiKey} />}
        </Apikey>
    );
}

function MostPopularGroups() {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get('http://localhost:3001/community');
                if (response.data && response.data.length >= 4) {
                    const sortedGroups = response.data.sort((a, b) => b.idgroup - a.idgroup);  // Sort the groups by ID in descending order
                    const popularGroups = sortedGroups.slice(0, 4); // Last four groups
                    setGroups(popularGroups);
                } else {
                    console.log("Ryhmätietoja ei löytynyt tai niitä on alle 3.");
                }
            } catch (error) {
                console.error('Virhe ryhmien hakemisessa:', error);
            }
        };
        fetchGroups();
    }, []);

    return (
        <div className='groupspopular'>
            <h4 className='alaetusivun_h4'>Viimeisimmät ryhmät</h4>
            <ul className='popularitUlEtusivu'>
                {groups.map(group => (
                    <li className='popularitLiItems' key={group.groupname}>
                        <img src={group.grouppic} alt={group.groupname} />
                        <p>{group.groupname}</p>
                    </li>
                ))}
            </ul>
            <Link to="/ryhmat" className='kk1k23312k11'>
                <button className='naytaLisaaBtn'>Näytä lisää...</button>
            </Link>
        </div>
    )
}

export default FrontPageView;
