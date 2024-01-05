import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../groupnews.css';

export const Groupnews = () => {

    const [filteredNews, setFilteredNews] = useState([]);
    const { groupname } = useParams();
    const [groupnews, setGroupnews] = useState([]);
   
    // First get group id from database
    useEffect(() => {
    const fetchData = async () => {
        try {
            const groudIdResponse = await axios.get(`http://localhost:3001/community/getgroupid?groupname=${groupname}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                }
                });
            const groupID = groudIdResponse.data[0]?.idgroup;
            // Then get news URL from database
            if(groupID) {
            const newsResponse = await axios.get(`http://localhost:3001/news/groupnews?idgroup=${groupID}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                }
                });
            setGroupnews(newsResponse.data);
            }else {
                console.log('Ryhmän id:tä ei löytynyt');
            } 
        } catch (error) {
            console.error('Virhe haettaessa ryhmän id:tä!', error);
        }
    };

    fetchData();
    }, [groupname]); // Data is fetched again if groupname changes

    useEffect(() => {
    const fetchNewsByURL = async (urlList) => {
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
    
            // Filter news by URL list
            const filteredNews = newsData.filter((article) => urlList.includes(article.ArticleURL)); // urlList is the parameter of this function
            
            return filteredNews;

        } catch (error) {
            console.error('Virhe haettaessa uutisia:', error);
            return [];
        }
    };
    
    fetchNewsByURL(groupnews.map((news) => news.newsidapi)) // groupnews is mapped to get only the newsidapi values and send to fetchNewsByURL function as parameter
    .then((filteredNews) => {
        setFilteredNews(filteredNews); 
    })
    .catch((error) => {
        console.error('Virhe haettaessa uutisia URL-listan perusteella:', error);
    });
}, [groupnews]);

    return (
            <div id='groupnews'>
                {filteredNews.map((news) => (
                    <div className='groupnewsitem' key={news.ArticleURL}>
                        <img className='groupnewspic' src={news.ImageURL} />
                        <h3 className='groupnewstitle'>{news.Title}</h3>
                        <a className='groupnewslink' href={news.ArticleURL} target='_blank' rel='noreferrer'>Lue lisää</a>
                    </div>
                ))}
            </div>
    );
};
