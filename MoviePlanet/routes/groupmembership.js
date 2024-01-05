const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { auth } = require('../auth/auth');
const { postJoinRequest, getPendingRequestsByAdmin, acceptJoinRequest, denyJoinRequest, getGMSRoles } = require('../postgre/groupmembership');

// ADD/POST JOIN REQUEST (SUPPORTS URLENCODED AND MULTER)
router.post('/join', auth, upload.none(), async (req, res) => {
  try {
    const idcustomer = req.body.idcustomer;
    const idgroup = req.body.idgroup;
    await postJoinRequest(idcustomer, idgroup);
    res.json({ message: 'Join request sent' }); 
  } catch (err) {
    console.error('Error in POST /join:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET JOIN REQUESTS BY ADMIN
router.get('/joinrequests', auth, async (req, res) => {
  try {
    const adminId = req.query.idcustomer;
    const joinRequests = await getPendingRequestsByAdmin(adminId);
    res.json(joinRequests);
  } catch (err) {
    console.error('Error in GET /joinrequests:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ACCEPT JOIN REQUEST
router.put('/accept', auth, upload.none(), async (req, res) => {
  try {
    const idcustomer = req.body.idcustomer;
    const idgroup = req.body.idgroup;
    await acceptJoinRequest(idcustomer, idgroup);
    res.json({ message: 'Join request accepted' });
  } catch (err) {
    console.error('Error in POST /accept:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DENY JOIN REQUEST
router.delete('/deny', auth, upload.none(), async (req, res) => {
  try {
    const idcustomer = req.body.idcustomer;
    const idgroup = req.body.idgroup;
    await denyJoinRequest(idcustomer, idgroup);
    res.json({ message: 'Join request denied' });
  } catch (err) {
    console.error('Error in POST /deny:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET GROUPMEMBERSHIP ROLES  
router.get('/getroles', auth, async (req, res) => {
  try {
    const idcustomer = req.query.idcustomer;
    const idgroup = req.query.idgroup;
    const roles = await getGMSRoles(idcustomer, idgroup);
    res.json(roles);
  } catch (err) {
    console.error('Error in GET /roles:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;