import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../addreview.css';
import { UsernameSignal } from './signals';

const AddReviewPopUp = ({ movie, onClose }) => {
    const [selectedMovie, setSelectedMovie] = useState(movie);
    const [stars, setStars] = useState(0);
    const [reviewText, setReviewText] = useState('');

    useEffect(() => {
        if (selectedMovie) {
            setStars(0);
            setReviewText('');
        }
    }, [selectedMovie]);

    const handleStarsChange = (event) => {
        setStars(parseInt(event.target.value, 5));
    };

    const handleSubmit = async () => {
        const username = UsernameSignal.value;
        let idcustomer = null;

        try {
            const response = await axios.get('http://localhost:3001/customer/getUserID', {
                params: {
                    username: username,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                },
            });
            if (response.data && response.data.length > 0) {
                idcustomer = response.data[0].idcustomer;
            } else {
                console.error('Ei saatu muutettua usernamea idksi.');
            }
        } catch (error) {
            console.error('Ei saatu muutettua usernamea idksi:', error);
        }

        try {
            const response = await axios.post('http://localhost:3001/review/', {
                review: reviewText,
                movieidapi: selectedMovie.id,
                moviestars: stars,
                idcustomer: idcustomer,
            },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                });

        } catch (error) {
            console.error('Virhe arvostelun lisäämisessä', error);
        }
        onClose();
    };

    return (
        <div className="review-popup-container">
            <div className="review-popup">
                <label>Arvostelu elokuvalle</label>
                {selectedMovie ? (
                    <>
                        <h2 id='addReview_h2'>{selectedMovie.title}</h2>
                        <label id='addReview_label'>Arvostelu:</label>
                        <StarRating setStars={setStars} stars={stars} />
                        <br />
                        <textarea id='addReview_textarea'
                            placeholder="Kirjoita arvostelusi tähän..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        /> <br />
                        <button onClick={handleSubmit} id='addReview_send_btn'>Lähetä arvostelu</button>
                        <button onClick={onClose} id='addReview_close_btn'>Sulje</button>
                    </>
                ) : (
                    <p>Tarkasteltava elokuva puuttuu.</p>
                )}
            </div>
        </div>
    );
};

const StarRating = ({ setStars, stars }) => {
    const [rating, setRating] = useState(0);

    const handleClick = (value) => {
        setRating(value);
        setStars(value);
    };

    const renderStars = () => {
        const starArray = [1, 2, 3, 4, 5];

        return starArray.map((value) => (
            <span id='addReview_star'
                key={value}
                className={`star ${value <= rating ? 'selected' : ''}`}
                onClick={() => handleClick(value)}
            >
                ★
            </span>
        ));
    };

    return <div className="star-rating">{renderStars()}</div>;
};

export default AddReviewPopUp;

