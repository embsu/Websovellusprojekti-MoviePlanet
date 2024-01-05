import React, { useState, useEffect } from 'react';
import Apikey from './apikey';
import axios from 'axios';
import '../review.css';

function AllReviews() {
  return (
    <div>
      <h1>Arvostelut</h1>
      <Review />
    </div>
  );
}
// Function to fetch reviews  
function Reviews({ tmdbApiKey }) {
  const [mergedData, setMergedData] = useState([]);
  const [sortBy, setSortBy] = useState('chronological');
  const [loading, setLoading] = useState(true);

  // Get reviews, user info, and moviedata
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:3001/review/allmoviereviews');
        const reviews = response.data;
        const movieDataPromises = reviews.map(async (review) => {
          const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${review.movieidapi}`, {
            params: {
              api_key: tmdbApiKey,
            },
          });
          return movieResponse.data;
        });
        const userDetailsPromises = reviews.map(async (review) => {
          const userResponse = await axios.get('http://localhost:3001/customer/getUser/?idcustomer=' + review.idcustomer);
          return userResponse.data[0];
        });

        const [movies, users] = await Promise.all([Promise.all(movieDataPromises), Promise.all(userDetailsPromises)]);
        const merged = reviews.map((review, index) => ({
          review,
          movieData: movies[index],
          userDetails: users[index],
        }));

        setMergedData(merged);
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error('Error fetching reviews or movie/user details:', error);
        setLoading(false); // Set loading to false if there is an error
      }
    };
    fetchReviews();
  }, [tmdbApiKey]);

  // Function to sort reviews
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    const sortedData = [...mergedData];

    if (event.target.value === 'chronological') {
      sortedData.sort((a, b) => a.review.idreview - b.review.idreview);
    } else if (event.target.value === 'reverseChronological') {
      sortedData.sort((a, b) => b.review.idreview - a.review.idreview);
    } else if (event.target.value === 'starsAsc') {
      sortedData.sort((a, b) => a.review.moviestars - b.review.moviestars);
    } else if (event.target.value === 'starsDesc') {
      sortedData.sort((a, b) => b.review.moviestars - a.review.moviestars);
    }

    setMergedData(sortedData);
  };

  // Function to open movie details modal
  const [selectedReview, setSelectedReview] = useState(null);

  const handleReviewClick = (movieId) => {
    const clickedReview = mergedData.find((data) => data.movieData.id === movieId);
    if (clickedReview) {
      setSelectedReview(clickedReview);
    }
  };

  const handleCloseModal = () => {
    setSelectedReview(null);
  };

  return (
    <div id='reviewpage'>
      <p id='sorting'>
        Järjestä:{' '}
        <select id='sortDropDown' value={sortBy} onChange={handleSortChange}>
          <option value='chronological'>Vanhin - Uusin</option>
          <option value='reverseChronological'>Uusin - Vanhin</option>
          <option value='starsAsc'>Tähdet &#x25B2;</option>
          <option value='starsDesc'>Tähdet &#x25BC;</option>
        </select>
      </p>
      <br></br>
      <div id='loading'>
        {loading && <div>Ladataan arvosteluita...</div>}
      </div>
      {loading ? null : (
        <div id='reviews'>
          {mergedData.map((data) => (
            <div
              id='review'
              key={data.review.idreview}
              onClick={() => handleReviewClick(data.movieData.id)}
            >
              <img
                id='posteri'
                src={`https://image.tmdb.org/t/p/w500/${data.movieData?.poster_path}`}
                alt='Movie Poster'
              />
              <p>{data.movieData?.title}</p>
              <p>{convertToStars(data.review.moviestars)}</p>
              <p>{'"' + data.review.review + '"'}</p>
              <p>{'-' + data.userDetails?.username}</p>
            </div>
          ))}
        </div>
      )}
      {/* Modal */}
      {selectedReview && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" style={{ marginTop: '10px', fontSize: '30px' }} onClick={handleCloseModal}>&times;</span>
            <img src={`https://image.tmdb.org/t/p/w500/${selectedReview.movieData.poster_path}`} alt="Movie Poster" width={150} />
            <h2>{selectedReview.movieData.title}</h2>
            <p id='rd' style={{ fontSize: '14px' }}>Release Date: {selectedReview.movieData.release_date}<br></br>
              Genres: {selectedReview.movieData.genres.map((genre) => genre.name).join(', ')}<br></br>
              Runtime: {selectedReview.movieData.runtime} minutes <br></br>
              IMDb rating: {selectedReview.movieData.vote_average}</p>
            <p></p>
            <p>{selectedReview.movieData.overview}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Function to convert numbers to stars
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

function Review() {
  return (
    <Apikey>
      {({ tmdbApiKey }) => <Reviews tmdbApiKey={tmdbApiKey} />}
    </Apikey>
  );
}

export default AllReviews;