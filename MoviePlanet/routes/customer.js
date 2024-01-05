const router = require('express').Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const express = require('express'); 
const path = require('path'); 
const { addUser, getUsers, getUser, updateUser, getUserID, deleteUser, getUsersFromGroup, getPw } = require('../postgre/customer');
const { createToken, auth } = require('../auth/auth');

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');   // Specify the directory where you want to store uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ dest: 'uploads/' },{ storage: storage });

// GET ALL USERS
router.get('/', async (req, res) => {
    res.json(await getUsers());
})

// GET ONE USER
router.get('/getUser', async (req, res) => {
    const username = req.query.username;
    const idcustomer = req.query.idcustomer;
    res.json(await getUser(username, idcustomer))
})

// ADD USER (SUPPORTS URLENCODED AND MULTER)
router.post('/', upload.none(), async (req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const username = req.body.username;
    let pw = req.body.pw;
    const profilepic = req.body.profilepic;

    pw = await bcrypt.hash(pw, 10);
    try {
        await addUser(fname, lname, username, pw, profilepic);
        res.end();
    } catch (error) {
        res.json({ error: error.message }).status(500);
    }
})

// GET USERID
router.get('/getUserID',auth, async (req, res) => {
    const username = req.query.username;
    res.json(await getUserID(username))
})

// UPDATE USER
router.put('/:username', upload.fields([{ name: 'profilePicture', maxCount: 1 }]), async (req, res) => {

    const username = req.params.username;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const pw = req.body.pw ? await bcrypt.hash(req.body.pw, 10) : null;
    const profilepic = req.files && req.files['profilePicture'] ? req.files['profilePicture'][0].path : null;

    try {
        await updateUser(username, fname, lname, pw, profilepic);
        res.end();
    } catch (error) {
        res.json({ error: error.message }).status(500);
    }
});

// DELETE USER
router.delete('/:username',auth, async (req, res) => {
    const username = req.params.username;
    try {
       const deletionResult = await deleteUser(username);
       console.log(deletionResult);
       if(!deletionResult.success) {
           res.status(404).json({ error: deletionResult.message });}
        res.end();
    } catch (error) {
        res.json({ error: error.message }).status(500);
    }
})

// GET USERS FROM GROUP
router.get('/getUsersFromGroup/:idgroup',auth, async (req, res) => {
    const idgroup = req.params.idgroup;
    res.json(await getUsersFromGroup(idgroup));
})

// LOGIN
router.post('/login', upload.none(), async (req, res) => {
    const username = req.body.username;
    const pw = req.body.pw;
    try {
        const db_pw = await getPw(username);

        if (db_pw) {
            const isAuth = await bcrypt.compare(pw, db_pw);
            if (isAuth) {
                const token = createToken(username);
                res.status(200).json({ jwtToken: token });
            
            } else {
                res.status(401).json({ error: 'Väärä salasana' });
            }
        } else {
            res.status(404).json({ error: 'Käyttäjää ei löytynyt' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }

});

module.exports = router;