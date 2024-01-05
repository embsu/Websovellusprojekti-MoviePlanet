
import React, { useEffect } from 'react';
import { useState } from 'react';
import '../news.css';
import '../basic.css';
import axios from 'axios';
import { UsernameSignal } from './signals';

function NewsView() {

    const [news, setNews] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState({});

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Get news from Finnkino API
                const response = await fetch('https://www.finnkino.fi/xml/News/');
                if (!response.ok) {
                    throw new Error('Uutisten haku epäonnistui');
                }
                // Parse XML data
                const xmldata = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmldata, 'text/xml');

                // Get news data
                const newsElements = xmlDoc.getElementsByTagName('NewsArticle');
                const newsData = Array.from(newsElements).map((article) => ({
                    Title: article.querySelector('Title').textContent,
                    ArticleURL: article.querySelector('ArticleURL').textContent,
                    ImageURL: article.querySelector('ImageURL').textContent,
                }));
                setNews(newsData);

                // Get groups where user is member or owner
                const ownedGroups = await axios.get('http://localhost:3001/community/groupsin?username=' + UsernameSignal.value,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                        },
                    });
                setUserGroups(ownedGroups.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchNews();
    }, []);

    // Select group to share the article
    // Open Modal 
    const selectGroupToShare = (ArticleURL, articleTitle) => {
        setSelectedArticle({ URL: ArticleURL, Title: articleTitle });
        setShowModal(true);
    };
    // Share article to group
    const share = async () => {
        console.log('Jaa nappia painettu', selectedGroup, selectedArticle);

        //Search group id
        const idgroup = userGroups.find((group) => group.groupname === selectedGroup).idgroup;
        const newsidapi = selectedArticle.URL;

        // Send data to backend
        await axios.post('http://localhost:3001/news', { newsidapi, idgroup }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            }
        })
            .then(resp => {
                alert('Uutinen jaettu onnistuneesti ryhmä sivulle!');
                setShowModal(false);
            })
            .catch(error => {
                console.log(error.response.data);
            });
    };

    return (
        <div id='uutisetPage'>
            <h1 id='newsUutisettxt'>Uutiset</h1>
            <ul id='uutiset'>
                {news.map((article) => (
                    <li key={article.Title} id='uutisetLiItem'>
                        <a id='articleLink' href={article.ArticleURL}>
                            <img id="uutisKuva" src={article.ImageURL} alt={article.Title} />
                            <h2 id='uutisetTitletxt'>{article.Title}</h2>
                        </a>
                        <button className='share-button' onClick={() => selectGroupToShare(article.ArticleURL, article.Title)}>
                            <img src='/pictures/share.png' alt='Share' />
                        </button>
                    </li>
                ))}
            </ul>
            {showModal && (
                <div className='modal'>
                    <h2>Jaa uutinen: {selectedArticle.Title}</h2>
                    <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                        <option value=''>Valitse ryhmä</option>
                        {userGroups.map((group) => (
                            <option key={group.groupname} value={group.groupname}>
                                {group.groupname}
                            </option>
                        ))}
                    </select>
                    <button className='basicBtn' onClick={() => setShowModal(false)}> Peruuta</button>
                    <button className='basicBtn' onClick={share}> Jaa</button>
                </div>
            )}
        </div>
    )
}

export default NewsView;