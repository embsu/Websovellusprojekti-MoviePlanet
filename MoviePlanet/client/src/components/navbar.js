import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoginFormOpen, RegisterFormOpen, UsernameSignal } from './signals';
import { LoginForm, openModal, logout, UpdateBtns } from './auth';
import { RegisterForm, openRegisterModal } from './createcustomer';
import axios from 'axios';
import '../navbar.css';

function NavBar() {
    const [existingProfilePicture, setExistingProfilePicture] = useState('');

    useEffect(() => {
        const getProfPic = async () => {
            try {
                const userData = UsernameSignal.value;
                const response = await axios.get('http://localhost:3001/customer/getUser', {
                    params: {
                        username: userData,
                    },
                });
                setExistingProfilePicture(response.data[0].profilepic);
            } catch (error) {
                console.error('Virhe käyttäjän tietojen hakemisessa ', error);
            }
        };
        getProfPic();
    }, [UsernameSignal.value]);

    // Check if user is logged in
    UpdateBtns();

    return (
        <div id='navbar'>
            <Link to="/"><h1 id='sivunnimi'>MoviePlanet</h1></Link>
            <div id='legit-nav-linkit'>
                <Link to="/">Etusivu</Link>
                <Link to="/uutiset">Uutiset</Link>
                <Link to="/elokuvat">Elokuvat</Link>
                <Link to="/arvostelut">Arvostelut</Link>
                <Link to="/ryhmat">Ryhmät</Link>
            </div>
            <div id='mobile-nav-linkit'>
                <div id='notif-settings'>
                    <Link to="/ilmoitukset"><img src='/pictures/001-bell.png' alt="notifications" className='nav_bellSet' /></Link> {/* Tämä laitettava ehkä buttoniksi jos halutaan että aukeaa mini ikkuna ehk*/}
                    <Link to="/asetukset"><img src='/pictures/002-settings.png' alt="settings" className='nav_bellSet' /></Link>
                </div>
                <div className='buttons'>
                    {/* If user is logged in show "Tervetuloa! {username}". If not show register btn*/}
                    {UsernameSignal.value ? (
                        <div id='navbarWelcome'>
                            <p>Tervetuloa {UsernameSignal.value}</p>
                            {existingProfilePicture !== '' && (
                                <img id='navbarProfileImage' src={
                                    existingProfilePicture.startsWith('http') // If profilepic starts with http, use it. If not, add localhost:3001 to the beginning
                                        ? existingProfilePicture
                                        :
                                        `http://localhost:3001/${existingProfilePicture}`} alt='Profiilikuva' />
                            )}
                        </div>
                    ) : (
                        <button id='Register' onClick={openRegisterModal}>Rekisteröidy</button>
                    )
                    }
                    {RegisterFormOpen.value === true && <RegisterForm />}

                    {/* If user is logged in show "kirjadu ulos" and other wise */}
                    {
                        UsernameSignal.value ? (
                            <button id='Logout' onClick={logout}>Kirjaudu ulos</button>
                        ) : (
                            <button id='Login' onClick={openModal}>Kirjaudu sisään</button>
                        )
                    }
                    {LoginFormOpen.value === true && <LoginForm />}
                </div>
            </div>
        </div>
    );
}

export default NavBar;

