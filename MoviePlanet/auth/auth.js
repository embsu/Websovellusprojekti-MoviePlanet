require('dotenv').config();
const jwt = require('jsonwebtoken');

function auth (req,res, next){

    const token = req.headers.authorization.split(' ')[1];

    try{
        const username = jwt.verify(token, process.env.JWT_SECRET_KEY).username;
        res.locals.username = username;
        next();
    }
    catch(err){
        res.status(403).send('Pääsy kielletty ');
    }
}

function createToken(username){
   return jwt.sign({username}, process.env.JWT_SECRET_KEY);
   
}

module.exports = {auth, createToken};