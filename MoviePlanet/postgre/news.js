// CONNECT TO DATABASE
const pgPool = require('./connection');

// SQL QUERIES
const sql = {
    GET_NEWS: 'SELECT * FROM news',
    INSERT_NEWS: 'INSERT INTO news (newsidapi, idgroup) VALUES ($1, $2)',
    GET_NEWS_BY_GROUP: 'SELECT newsidapi FROM news WHERE idgroup = $1',
}

// GET ALL NEWS
async function getNews() {
    const result = await pgPool.query(sql.GET_NEWS);
    const rows = result.rows;
    console.log(rows);
    return rows;
}
// GET NEWS BY GROUP
async function getNewsByGroup(idgroup){
    const result = await pgPool.query(sql.GET_NEWS_BY_GROUP,[idgroup]);
    const rows = result.rows;
    console.log(rows);
    return rows;
}

// ADD NEWS TO DATABASE
async function addNews(newsidapi, idgroup) {
    await pgPool.query(sql.INSERT_NEWS, [newsidapi, idgroup]);
}
// EXPORT FUNCTIONS
module.exports = { getNews, addNews, getNewsByGroup};  