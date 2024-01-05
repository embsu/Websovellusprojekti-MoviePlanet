require('dotenv').config();
const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { addReview, getReview, deleteReview, getMovies } = require('../postgre/review');
const { auth } = require('../auth/auth');

// ADD REVIEW TO DATABASE
router.post('/',auth, upload.none(), async (req, res) => {
    const review = req.body.review;
    const movieidapi = req.body.movieidapi;
    const moviestars = req.body.moviestars;
    const idcustomer = req.body.idcustomer;

    try {
        await addReview(review, movieidapi, moviestars, idcustomer);
        res.end();
    } catch (error) {
        res.json({ error: error.message }).status(500);
    }
});
 
// GET REVIEWS FROM DATABASE
router.get('/allmoviereviews', async (req, res) => {
    res.json(await getReview());
});

// DELETE REVIEW FROM DATABASE
router.delete('/',auth, async (req, res) => {
    const idreview = req.query.idreview;
    console.log("Poistetaan elokuva", idreview);
    
    try {
        await deleteReview(idreview);
        res.end();
        console.log("Elokuva", idreview, "poistettu");
    } catch (error) {
        res.json({ error: error.message }).status(500);
    }
});

module.exports = router;