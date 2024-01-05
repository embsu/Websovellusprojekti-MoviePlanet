import { useEffect, useState } from 'react';
import axios from 'axios';
import { UsernameSignal, CreateGroupFormOpen, GroupCreated, LoginFormOpen } from './signals';
import '../communities.css';

// Function to open create group window
export const openCreateGroupModal = () => CreateGroupFormOpen.value = true;

function Communities() {
    return (
        <div id='Communities'>
            <h1 id='ryhmat'>Ryhmät</h1>
            <FindGroup />
            <h2 id='kryhmat'>Kaikki ryhmät <CreateGroupBtn /></h2>
            <ShowAllGroups />
        </div>
    )
}

// Function to open create group window
function CreateGroupBtn() {
    return (
        <div id='cgbtn'>
            <button id='openCreateGroupBtn' onClick={openCreateGroupModal}>Luo uusi ryhmä</button>
            {CreateGroupFormOpen.value === true && <CreateGroup />}
        </div>
    )
}

// Function to create a new group
function CreateGroup() {

    const [groupname, setGroupName] = useState('');
    const [descript, setDescription] = useState('');
    const [grouppic, setGroupPic] = useState('');
    const [error, setError] = useState(null);
    const [existingGroupnameError, setExistingGroupnameError] = useState(null);

    if (!UsernameSignal.value) {    // If user is not logged in, redirect to login page
        const closeModal = () => CreateGroupFormOpen.value = false;
        closeModal();
        LoginFormOpen.value = true;
        return;
    }

    // Function that checks if groupname already exists
    function checkExistingGroupname(groupname) {
        axios.get('http://localhost:3001/community/getGroup/?groupname=' + groupname, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            }
        })
            .then(resp => {
                if (resp.data.length > 0) {
                    setExistingGroupnameError('Valitsemasi ryhmän nimi on jo käytössä');
                }
                else {
                    setExistingGroupnameError(null);
                }
            })
            .catch(error => {
                setExistingGroupnameError(null);
            });
    }

    // Function for creating a new group
    function handleCreateGroup() {

        // Get customerid from database
        axios.get('http://localhost:3001/customer/getUserID/?username=' + UsernameSignal.value, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            }
        })
            .then(resp => {
                const idcustomer = resp.data[0].idcustomer;     // Save idcustomer to variable
                sendGroupData({ idcustomer });                  // Call function to send data to backend
            })
            .catch(error => {
                console.log(error.response.data);
            });
    }

    // Function that sends data to backend
    function sendGroupData({ idcustomer }) {
        if (groupname.length < 1) {
            setError('Ryhmän nimi ei voi olla tyhjä');
            return;
        } else {
            axios.postForm('http://localhost:3001/community', { groupname, grouppic, descript, idcustomer },{
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            }
            })
            .then(resp => {
                GroupCreated.value = true;
                closeModalWithDelay();
            })
            .catch(error => {
                setError(error.response.data);
            });
        }
    }

    // Function that closes the window after 5 seconds
    function closeModalWithDelay() {
        setTimeout(() => {
            closeModal();
        }, 5000);
    }

    // Function to close the window
    const closeModal = () => CreateGroupFormOpen.value = false;

    return (
        <div className='modal'>
            <div className='modal-content'>
                <span className='close' onClick={closeModal}>&times;</span>
                <div>
                    <h2 id='Modalh2'>Luo uusi ryhmä</h2>
                </div>
                <input
                    type="text"
                    placeholder='Ryhmän nimi'
                    name="groupname"
                    onChange={(e) => {
                        setGroupName(e.target.value);
                        checkExistingGroupname(e.target.value);
                    }}
                />
                <input
                    type="text"
                    placeholder='Ryhmän kuvan URL-osoite'
                    name="grouppic" onChange={e =>
                        setGroupPic(e.target.value)}
                />
                <input
                    type="text"
                    placeholder='Ryhmän kuvaus'
                    name="descript"
                    onChange={e =>
                        setDescription(e.target.value)}
                />
                {error && <p className='error'>{error}</p>}
                {existingGroupnameError && <p className='error'>{existingGroupnameError}</p>}   {/* Error message if groupname already exists */}
                {GroupCreated.value && <p className='success'>Ryhmä luotu onnistuneesti!</p>}   {/* Success message if group is created */}
                <button id='CreateGroupBtn' onClick={handleCreateGroup}>Luo ryhmä</button>      {/* Button click calls for handelogin function */}
            </div>
        </div>
    );
};

// Function to find a group by name
function FindGroup() {
    const [groupname, setGroupName] = useState('');
    const [error, setError] = useState(null);
    const [groups, setGroups] = useState([]);

    // Function to find a group by name
    async function handleFindGroup() {
        try {
            const response = await axios.get('http://localhost:3001/community/getGroup/?groupname=' + groupname, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                }
            });
            const foundGroups = response.data;
            if (!foundGroups || foundGroups.length === 0) {
                setError('Ryhmiä ei löytynyt syöttämilläsi hakuehdoilla');
                setGroups([]);
                return;
            }
            setGroups(foundGroups);
            setError(null);
        } catch (error) {
            console.log(error.response.data);
            setError('Ryhmää ei löytynyt');
            setGroups([]);
        }
    }

    return (
        <div id='SearchGroup'>
            <div id='SearchGroupInp'>
                <input
                    id='SearchGroupInput'
                    type="text"
                    placeholder='Etsi ryhmää nimellä'
                    name="groupname"
                    onChange={e => setGroupName(e.target.value)}
                />
                <button id='SearchGroupBtn' onClick={handleFindGroup}><img id='Searchp' src='/pictures/loupe.png' alt="search" /></button>
            </div>
            <div className="GroupInfo">
                {error && <p className='error'>{error}</p>}
                {groups.length > 0 && (
                    groups.map((group, index) => (
                        <div key={index} id="GroupInfo">
                            <img id='grouppic' src={group.grouppic} alt="Ryhmän kuva" />
                            <h3 id='groupname'>{group.groupname}</h3>
                            <p id='gdescript'>{group.descript}</p>
                            {<JoinGroup id='openCreateGroupBtn' groupName={group.groupname} />} {/* Button to join a group */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Function to show all groups
function ShowAllGroups() {
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:3001/community')    // Get all groups from the database
            .then(response => {
                setGroups(response.data);
            })
            .catch(error => {
                setError('Ryhmien hakemisessa tapahtui virhe');
            });
    }, []);

    return (
        <div className="AllGroups">
            {error && <p className='error'>{error}</p>}
            <div className="GroupList">
                {groups.map(group => (
                    <div key={group.groupname} className="GroupItem">
                        <img src={group.grouppic} alt="Ryhmän kuva" />
                        <h3>{group.groupname}</h3>
                        <p>{group.descript}</p>
                        {<JoinGroup groupName={group.groupname} />} {/* Button to join a group */}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Function to join a group
function JoinGroup({ groupName }) {
    const [error, setError] = useState(null);
    const [buttonText, setButtonText] = useState('');
    const [idGroup, setIdGroup] = useState([]);
    const [idCustomer, setIdCustomer] = useState([]);
    const [userRoles, setUserRoles] = useState([]);

    // Effect to get user information
    useEffect(() => {
        async function joinedGroups() {
            try {
                const idCustomerResponse = await axios.get(`http://localhost:3001/customer/getUserID/?username=${UsernameSignal.value}`,{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                    });
                const idCustomer = idCustomerResponse.data[0].idcustomer;
                setIdCustomer(idCustomer);

                 // Get group id
                const idGroupResponse = await axios.get(`http://localhost:3001/community/getgroupid?groupname=${groupName}`,{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                const idGroup = idGroupResponse.data[0].idgroup;
                setIdGroup(idGroup);

                // Get user roles in groups
                const userRolesResponse = await axios.get(`http://localhost:3001/groupmembership/getroles/?idcustomer=${idCustomer}&idgroup=${idGroup}`,{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                    });
                const userRoles = userRolesResponse.data.map(role => role.roles);  

                setUserRoles(userRoles);
            } catch (error) {
                setError('Virhe käyttäjän roolin tarkistamisessa');
            }
        }
        joinedGroups();
    }, [groupName]);

    // Effect to change button text according to the user's role in the group
    useEffect(() => {
        if (userRoles.includes(2) || userRoles.includes(3)) {
            setButtonText('Ryhmäsivulle');
        }
        else if (userRoles.includes(1)) {
            setButtonText('Liittymispyyntö lähetetty');
        }
        else {
            setButtonText('Liity ryhmään');
        }
    }, [groupName, userRoles,]);

    // Function to join a group
    const handleJoinGroup = async () => {
        try {
            // Check if user is logged in
            if (!UsernameSignal.value) {
                LoginFormOpen.value = true;
                return;
            } else {
                const requestData = {
                    roles: 1,
                    idcustomer: idCustomer,
                    idgroup: idGroup
                };

               // Send user information to backend
                await axios.post('http://localhost:3001/groupmembership/join', requestData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });

                setButtonText('Liittymispyyntö lähetetty');
                alert(`Lähetit ryhmään ${groupName} liittymispyynnön`);
            }
        } catch (error) {
            setError('Ryhmään liittymisessä tapahtui virhe');
        }
    };
    // Function to redirect to group page
    const redirectToGroupPage = () => {
        window.location.href = `http://localhost:3000/ryhma/${groupName}`;
    };
    const requestPending = () => {
        alert('Liittymispyyntösi on jo lähetetty');
    };

    return (
        <button id='JoinGroupBtn' onClick={() => {
            if (buttonText === 'Ryhmäsivulle') {

                redirectToGroupPage();
            } else if (buttonText === 'Liittymispyyntö lähetetty') {
                requestPending();
            } else {
                handleJoinGroup();
            }
        }}>
            {buttonText}
        </button>
    );
}

export default Communities;

