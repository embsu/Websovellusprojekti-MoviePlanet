import { useEffect, useState } from 'react';
import axios from 'axios';
import {RegisterFormOpen, RegisterSuccess } from './signals';
import '../createcustomer.css';

export const openRegisterModal = () => RegisterFormOpen.value = true;

//Function to register user
export function RegisterForm() {

    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [username, setUsername] = useState('');
    const [pw, setpw] = useState('');
    const [pw2, setpw2] = useState('');
    const [error, setError] = useState(null);
    const [existingUsernameError, setExistingUsernameError] = useState(null);

    // Function that checks if username already exists
    function checkExistingUsername(username){
        axios.get('http://localhost:3001/customer/getUser/?username=' + username)
        .then(resp => {
            if(resp.data.length > 0){
                setExistingUsernameError('käyttäjänimi on jo käytössä');
            }
            else{
                setExistingUsernameError(null);
            }
    })
    .catch(error => {
        setExistingUsernameError(null);
    }); 
}
    // Function that sends data to backend
    function handleRegister() {
        checkExistingUsername(username);
        if(existingUsernameError){return;}
        const profilepic = 'https://i.postimg.cc/tJq1DQ2m/blank-profile-picture-973460-1920.png';
        axios.postForm('http://localhost:3001/customer', { fname, lname, username, pw, profilepic })
            .then(resp => {
                    RegisterSuccess.value = true;
                    closeModalWithDelay();
            })
            .catch(error => {
                console.log(error.response.data); 
            });
    }
    // Function that closes the window after 5 seconds
    function closeModalWithDelay() {
        setTimeout(() => {
            closeRegisterModal();
        }, 5000);
    }
    const closeRegisterModal = () => RegisterFormOpen.value = false;

    // Function that checks if passwords match in realtime
    useEffect(() => {
        if (pw !== pw2) {
            setError('Salasanat eivät täsmää');
        } else {
            setError(null);
        }
    });
    // Function that checks if username already exists in realtime
    useEffect(() => {
        if (username.trim() !== '') {
            checkExistingUsername(username);
        }
    }, [username]);

    return (
        <div className='modal'>
            <div className='modal-content'>
                <span className='close' onClick={closeRegisterModal}>&times;</span> {/* This is the close btn X */}
                <input
                    type='text'
                    placeholder='Käyttäjätunnus'
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        checkExistingUsername(e.target.value);
                    }}
                />
                <input
                    type='password'
                    placeholder='Salasana'
                    value={pw}
                    onChange={e => setpw(e.target.value)}
                /> 
                <input
                    type='password'
                    placeholder='Salasana uudestaan'
                    value={pw2}
                    onChange={e => setpw2(e.target.value)}    
                /> 
                <input
                    type='text'
                    placeholder='Etunimi'
                    value={fname}
                    onChange={e => setFname(e.target.value)}
                /> 
                <input
                    type='text'
                    placeholder='Sukunimi'
                    value={lname}
                    onChange={e => setLname(e.target.value)}
                /> 
                {error && <p className='error'>{error}</p>} 
                {existingUsernameError && <p className='error'>{existingUsernameError}</p>} 
                {RegisterSuccess.value && <p className='success'>Käyttäjä luotu onnistuneesti! Voit nyt kirjautua sisään.</p>}
                <button id='RegisterBtn' onClick={handleRegister}>Luo käyttäjä </button>
            </div>
        </div>
    );
}
