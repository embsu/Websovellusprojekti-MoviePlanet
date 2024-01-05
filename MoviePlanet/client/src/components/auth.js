import {useState, useEffect } from 'react';
import axios from 'axios';
import {jwtToken, LoginFormOpen, UsernameSignal } from './signals';
import '../auth.css';

// Function to open login window
export const openModal = () => LoginFormOpen.value = true;

// Function to logout
export function logout() {
    UsernameSignal.value = null;
    jwtToken.value = null;
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.setItem('isLoggedIn','false');
}

// Function to update login and register buttons
export async function UpdateBtns(){
        useEffect(() => {
            const storedUsername = localStorage.getItem('username');
            if(storedUsername) {
                UsernameSignal.value = storedUsername;
            }
            else{
                UsernameSignal.value = null;
            }
        }, []);
}
// Function to check if the user is a member of the group
export async function IsGroupMember(groupname){
          try {
            const response = await axios.get('http://localhost:3001/community/groupsin/?username=' + localStorage.getItem('username'), {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                }
                });
            const isMember = response.data.some(obj => Object.values(obj).includes(groupname));
            console.log("Tämä on isMember arvo authissa " + isMember);
            return isMember;
          } catch (error) {
            console.log(error);
            return false;
          }
}

// Function to Login
export function LoginForm() {

    const [username, setUsername] = useState('');
    const [pw, setpw] = useState('');
    const [error, setError] = useState(null);

    // Function for backend POST request
    function handleLogin() {
        axios.postForm('http://localhost:3001/customer/login', { username, pw })
            .then(resp => {
                jwtToken.value = resp.data.jwtToken;  // The token is placed in the signal
                UsernameSignal.value = username; // The Username is placed in the signal
                localStorage.setItem('jwtToken', resp.data.jwtToken); // The token is placed in the local storage
                localStorage.setItem('username', username); // The Username is placed in the local storage
                localStorage.setItem('isLoggedIn','true');
                closeModal();
            })
            .catch(error => {
                console.log(error.response.data);
                setError('Virheellinen käyttäjätunnus tai salasana');
                closeModalWithDelay();
            });
    }
    // Function that closes the window after 5 seconds
    function closeModalWithDelay() {
        setTimeout(() => {
            closeModal();
        }, 5000);
    }
    // Function to close the window
    const closeModal = () => LoginFormOpen.value = false;

    return (
        <div className='modal'>
            <div className='modal-content'>
                <span className='close' onClick={closeModal}>&times;</span>
                <input
                    type='text'
                    placeholder='Käyttäjätunnus'
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type='password'
                    placeholder='Salasana'
                    value={pw}
                    onChange={e => setpw(e.target.value)}
                /> 
                {error && <p className='error'>{error}</p>} 
                <button id='LoginFormLoginBtn' onClick={handleLogin}>Kirjaudu sisään</button>
            </div>
        </div>
    );
}



