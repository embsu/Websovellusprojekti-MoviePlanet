import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../groupmembers.css';

export const GroupMembers = () => {
    const { groupname } = useParams();
    const [groupmembers, setGroupmembers] = useState([]);

    const fetchGroupMembers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/community/groupmembers', {
                params: {
                    groupname: groupname 
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                }
            });
            setGroupmembers(response.data);   
        } catch (error) {
            console.error('Virhe haettaessa ryhmän jäseniä:', error);
        }
    };
    
    useEffect(() => {
        fetchGroupMembers();
    }, [groupname]); 

    return (
        <div id='members'>
                <h1 className='membersheader'>Ryhmän jäsenet:</h1>
                <ul className='membersul'>
                    {groupmembers.map((member) => (
                            <li className ='membersli' key={member.username}>
                                 <div className='member-info'>
                                {member.profilepic && (
                                <img className='memberprofilepic' 
                                src={
                                    member.profilepic.startsWith('http') // If profilepic starts with http, use it. If not, add localhost:3001 to the beginning
                                    ? member.profilepic
                                    : `http://localhost:3001/${member.profilepic}`
                                   } 
                                   alt='profilepic' />
                                )}
                                <span className='member-name'>{member.username} </span>
                                </div>
                            </li>
                     ))}
                </ul>
        </div>
    );
};

