import '../settings.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { delUser, jwtToken, UsernameSignal } from './signals';
import { logout } from './auth';

function Settings() {
    return (
        <div id='settings'>
            {UsernameSignal.value ? (
                <>
                    <h2 className='settings_h2'>Käyttäjäasetukset</h2>
                    {/* <DeleteUser /> */}
                    <UserSettings />
                    <h2 className='settings_h2'>Ryhmäasetukset</h2>
                    <DeleteGroupMemberships />
                    <h2 className='settings_h2'>Liittymispyynnöt</h2>
                    <JoinRequests />
                </>
            ) : (
                <div>
                    <img src='../pictures/user.png' />
                    <p>Sinulla ei ole oikeutta nähdä tätä sisältöä!</p>
                    <p>Ole hyvä ja kirjaudu sisään.</p>
                </div>
            )}
        </div>
    )
}

// Function User settings
function UserSettings() {
 
    const [existingProfilePicture, setExistingProfilePicture] = useState('');
    const [existingFirstName, setExistingFirstName] = useState('');
    const [existingLastName, setExistingLastName] = useState('');
    const [newPicReview, setNewPicReview] = useState(''); // new pic preview
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        newPw: '',
    });
    const [profilePicture, setProfilePicture] = useState(null);

    /*__Current fname, lname, profilepic__*/
    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const userData = UsernameSignal.value;
                const response = await axios.get('http://localhost:3001/customer/getUser', {
                    params: {
                        username: userData,
                    },
                });
                setExistingFirstName(response.data[0].fname);
                setExistingLastName(response.data[0].lname);
                setExistingProfilePicture(response.data[0].profilepic);
            } catch (error) {
                console.error('Virhe käyttäjän tietojen hakemisessa ', error);
            }
        };
        getUserInfo();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);

        /*New profilepicture preview*/
        if (file) {
            setNewPicReview(URL.createObjectURL(file));
        }
        else {
            setNewPicReview('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataWithProfilePicture = new FormData();

        if (formData.fname.trim() !== '') { //if fname is not empty, append it to formData
            formDataWithProfilePicture.append('fname', formData.fname);
        } else {
            console.log('LABELIIN EI OLE KIRJOITETTU MITÄÄN ELI EI LISÄTÄ FORMDATAAN');
        }
        if (formData.lname.trim() !== '') {
            formDataWithProfilePicture.append('lname', formData.lname);
        }

        // Only append new password if it is not empty
        if (formData.newPw.trim() !== '') {
            formDataWithProfilePicture.append('pw', formData.newPw);
        }
        formDataWithProfilePicture.append('profilePicture', profilePicture);

        try {
            await axios.put(`http://localhost:3001/customer/${UsernameSignal.value}`, formDataWithProfilePicture, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Tiedot päivitetty onnistuneesti');
        } catch (error) {
            console.error('Virhe käyttäjän tietojen päivittämisessä ', error);
        }
    }

    return (
        <div className='userSettingsDiv'>
            <form onSubmit={handleSubmit} id='userSettingsForm'>
                <div className='profileImage'>
                    <label className='settings_P'>Profiilikuvasi</label> <br /><br />
                    {/* Display existing profile picture */}
                    {existingProfilePicture !== '' && (
                                <img id='navbarProfileImage' src={
                                    existingProfilePicture.startsWith('http') // If profilepic starts with http, use it. If not, add localhost:3001 to the beginning
                                        ? existingProfilePicture
                                        :
                                        `http://localhost:3001/${existingProfilePicture}`} alt='Profiilikuva' />
                            )} <br /><br />
                    {/* Input for changing profile picture */}
                    <label className='settings_P'>Valitse uusi kuva: </label>  <br /><br />
                    <input type='file' id='profilePicture' name='profilePicture' accept='image/*' onChange={handleProfilePictureChange}></input> <br /><br />
                    {newPicReview && (
                        <img className='profileImagePreview' src={newPicReview} alt='Uusi kuva' />
                    )}
                </div> <br />
                <label className='settings_P' l>
                    Etunimi:
                    <input type="text" className='settingsInputit' name="fname" value={formData.fname} onChange={handleInputChange} placeholder={existingFirstName} />
                </label>
                <label className='settings_P'>
                    Sukunimi:
                    <input type="text" className='settingsInputit' name="lname" value={formData.lname} onChange={handleInputChange} placeholder={existingLastName} />
                </label>
                <label className='settings_P'>
                    Uusi salasana:
                    <input type="password" className='settingsInputit' name="pw" value={formData.pw} onChange={handleInputChange} placeholder='Syötä uusi salasana' />
                </label>
                <button type="submit" id='saveSettingsBtn'>Päivitä muutokset</button>
            </form>
            <h3 className='settings_h3'>Käyttäjän poistaminen</h3>
            <DeleteUser />
        </div>
    )
}

// Function Delete user
function DeleteUser() {
    const handleDeleteUser = async () => {
        const confirmDelete = window.confirm('Haluatko varmasti poistaa käyttäjän ' + UsernameSignal.value + '?');

        if (confirmDelete) {
            try {
                const response = await axios.delete('http://localhost:3001/customer/' + UsernameSignal.value, {
                    headers: {
                        Authorization: `Bearer ${jwtToken.value}`,
                    },
                })
                logout();
                alert("Käyttäjä " + UsernameSignal.value + " poistettu onnistuneesti. Sinut on nyt kirjattu ulos.");
            } catch (error) {
                alert('Käyttäjän poisto epäonnistui');
            }
        } else {
            console.log('Käyttäjän poisto peruutettu');
        }
    };

    return (
        <div>
            <button id='DeleteUserBtn' onClick={handleDeleteUser}>Poista käyttäjä {UsernameSignal.value}</button>
        </div>
    )
}
// Function to delete group memberships

function DeleteGroupMemberships() {

    const [adminGroups, setAdminGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [isSelfRemovalAttempted, setIsSelfRemovalAttempted] = useState(false); // admin cannot remove himself from group

    useEffect(() => {
        const getAdminGroups = async () => {
            try {
                const userData = UsernameSignal.value;
                const response = await axios.get('http://localhost:3001/community/ownedgroups', {
                    params: {
                        username: userData,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                });

                const ryhmanNimet = response.data.map((group) => group.groupname);
                setAdminGroups(ryhmanNimet);    // set admin groups to state setAdminGroups
            } catch (error) {
                console.error('Virhe ryhmien hakemisessa ', error);
            }
        };
        getAdminGroups();
    }, []);

    const handleGroupChange = (event) => { // refreshes selectedGroup state whenever selected group changes in dropdown
        setSelectedGroup(event.target.value);
    };

    // Get selected group members from database
    useEffect(() => {
        const fetchGroupMembers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/community/groupmembers',
                    {
                        params: {
                            groupname: selectedGroup,
                        },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                        },
                    });

                const memberUsernames = response.data.map((member) => member.username); // map out usernames from response data
                setGroupMembers(memberUsernames); //set group members to state setGroupMembers
            } catch (error) {
                console.error('Virhe ryhmän jäsenten hakemisessa ', error);
            }
        };

        if (selectedGroup !== '') { // if selectedGroup is not empty, fetch group members
            fetchGroupMembers();
        }
    }, [selectedGroup]);

    const handleMemberChange = (event) => {  // refreshes selectedMember state whenever selected member changes in dropdown
        const selectedMemberValue = event.target.value;
        setSelectedMember(selectedMemberValue);

        if (selectedMemberValue === UsernameSignal.value) {
            setIsSelfRemovalAttempted(true);
        } else {
            setIsSelfRemovalAttempted(false);
        }
    };

    useEffect(() => {
    }, [selectedMember, UsernameSignal.value]);

    // Remove selected member from group
    const handleRemoveMember = async () => {
        if (selectedMember === UsernameSignal.value) { //admin cant remove himself from group
            setIsSelfRemovalAttempted(true);
            return;
        }
        const confirmDelete = window.confirm('Haluatko varmasti poistaa käyttäjän ' + selectedMember + ' ryhmästä ' + selectedGroup + '?');

        if (confirmDelete) {
            try {
                const response = await axios.delete('http://localhost:3001/community',
                    {
                        params: {
                            username: selectedMember,
                            groupname: selectedGroup,
                        },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                        },
                    });
                alert("Käyttäjä " + selectedMember + " poistettu ryhmästä " + selectedGroup);

            } catch (error) {
                console.log('virhe käyttäjän poistossa ', error);
                alert('Käyttäjän poisto epäonnistui');
            }
        } else {
            console.log('Käyttäjän poisto peruutettu');
        }
    };

    return (
        <div className='userSettingsDiv'>
            <h3 className='settings_h3'>Poista jäsen ryhmästäsi</h3>
            {/* Groupselect dropdown */}
            <label className='laabeli1'>Valitse ryhmä: </label>
            <select className="poistaJasenDropdown" value={selectedGroup} onChange={handleGroupChange}>
                <option className="poistajasenOption" value=''>Valitse ryhmä</option>
                {adminGroups.map((groupName, groupmembership) => (
                    <option key={groupmembership} value={groupName}>
                        {groupName}
                    </option>
                ))}
            </select>
            {/* Mmeber select dropdown */}
            <label className='laabeli1'>Valitse jäsen: </label>
            <select className="poistaJasenDropdown" value={selectedMember} onChange={handleMemberChange}>
                <option className="poistajasenOption" value=''>Valitse jäsen</option>
                {groupMembers.map((member) => (
                    <option key={member} value={member}>
                        {member}
                    </option>
                ))}
            </select>
            <button id='removeMembButton' onClick={handleRemoveMember} disabled={isSelfRemovalAttempted}>
                {isSelfRemovalAttempted ? "Et voi poistaa itseäsi" : "Poista jäsen"}
            </button>
        </div>
    )
}

// Join requests
function JoinRequests() {
    const [joinRequests, setJoinRequests] = useState([]);
    const [userId, setUserId] = useState(null);
    const [requesterId, setRequesterId] = useState(null);
    const [groupId, setGroupId] = useState(null);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const userData = UsernameSignal.value;
                const response = await axios.get('http://localhost:3001/customer/getUserID', {
                    params: {
                        username: userData,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                });
                const userId = response.data[0].idcustomer;
                setUserId(userId); // set userId to state setUserId
            } catch (error) {
                console.error('Virhe kirjautuneen käyttäjän ID:n hakemisessa ', error);
            }
        };
        getUserId();
    }, []);

    useEffect(() => {
        const getJoinRequests = async () => {
            try {
                if (userId) {
                    const response = await axios.get('http://localhost:3001/groupmembership/joinrequests', {
                        params: {
                            idcustomer: userId,
                        },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                        },
                    });

                    if (response.data.length > 0) {
                        const updatedRequests = await Promise.all(response.data.map(async (request) => {
                            const requesterUsername = request.username;
                            const groupName = request.groupname;
                            const [requesterId, groupId] = await Promise.all([
                                getRequesterId(requesterUsername),
                                getGroupId(groupName),
                            ]);

                            return {
                                ...request,
                                requesterId: requesterId,
                                groupId: groupId,
                            };
                        }));
                        setJoinRequests(updatedRequests);
                    }
                }
            } catch (error) {
                console.error('Virhe ryhmien hakemisessa ', error);
            }
        };
        getJoinRequests();
    }, [userId]);


    // Get id of the member who sent join request
    const getRequesterId = async (requesterUsername) => {
        try {
            const response = await axios.get('http://localhost:3001/customer/getUserID', {
                params: {
                    username: requesterUsername,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                },
            });

            const requesterId = response.data[0].idcustomer;
            setRequesterId(requesterId); // set requesterId to state setRequesterId
            return requesterId;
        } catch (error) {
            console.error('Virhe liittymispyynnön lähettäneen käyttäjän ID:n hakemisessa ', error);
        }
    };

    // Get group id
    const getGroupId = async (groupName) => {
        try {
            const response = await axios.get('http://localhost:3001/community/getgroupid', {
                params: {
                    groupname: groupName,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                },
            });

            const groupId = response.data[0].idgroup;
            setGroupId(groupId); //set groupId to state setGroupId

            return groupId;
        } catch (error) {
            console.error('Virhe ryhmän ID:n hakemisessa ', error);
        }
    };

    // Accept join requests
    const handleApprove = async (username, groupname, requesterId, groupId) => {
        const confirmApprove = window.confirm('Haluatko varmasti hyväksyä käyttäjän ' + username + ' liittymispyynnön ryhmään ' + groupname + '?');

        if (confirmApprove) {
            try {
                const response = await axios.put('http://localhost:3001/groupmembership/accept', {
                    idcustomer: requesterId,
                    idgroup: groupId,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                });
                alert("Käyttäjä " + username + " hyväksytty ryhmään " + groupname);

                // refresh join requests
                const updatedRequests = joinRequests.filter(req => req.username !== username);
                setJoinRequests(updatedRequests);

            } catch (error) {
                console.log('virhe käyttäjän hyväksymisessä ', error);
                alert('Käyttäjän hyväksyminen epäonnistui');
            }
        } else {
            console.log('Käyttäjän hyväksyminen peruutettu');
        }
    };

    // Reject join requests
    const handleReject = async (username, groupname, requesterId, groupId) => {
        const confirmReject = window.confirm('Haluatko varmasti hylätä käyttäjän ' + username + ' liittymispyynnön ryhmään ' + groupname + '?');

        if (confirmReject) {
            try {
                const response = await axios.delete('http://localhost:3001/groupmembership/deny', {
                    data: {
                        idcustomer: requesterId,
                        idgroup: groupId,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                });
                alert("Käyttäjän " + username + " liittymispyyntö hylätty ryhmään " + groupname);

                // Refresh join requests
                const updatedRequests = joinRequests.filter(req => req.username !== username);
                setJoinRequests(updatedRequests);

            } catch (error) {
                console.log('virhe käyttäjän hylkäämisessä ', error);
                alert('Käyttäjän hylkääminen epäonnistui');
            }
        } else {
            console.log('Käyttäjän hylkääminen peruutettu');
        }
    };

    return (
        <div className='userSettingsDiv'>
            <h3 className='settings_h3'>Ryhmiesi liittymispyynnöt</h3>
            <ul id='liittymispyynnot'>
                {joinRequests.map((request, index) => (
                    <li key={index} id='liittymispyynnotItems'>
                        <p className='settings_P'>{request.username}, {request.groupname}</p>
                        <button onClick={() => handleApprove(request.username, request.groupname, request.requesterId, request.groupId)} id='approveButton'>Hyväksy</button>
                        <button onClick={() => handleReject(request.username, request.groupname, request.requesterId, request.groupId)} id='rejectButton'>Hylkää</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Settings;