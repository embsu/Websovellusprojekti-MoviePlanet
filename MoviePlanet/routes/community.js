const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {auth} = require('../auth/auth');
const {addGroup, updateGroup, getGroups, getOwnedGroups, getGroup, getGroupMembers, getGroupID, getGroupsIn, deleteGroupMember} = require('../postgre/community');

// ADD GROUP (SUPPORTS URLENCODED AND MULTER)
router.post('/',auth, upload.none(), async (req, res) => {
    const groupname = req.body.groupname;
    const descript = req.body.descript;
    const grouppic = req.body.grouppic;
    const idcustomer = req.body.idcustomer; 

    try {
        await addGroup(groupname, grouppic, descript, idcustomer);
        res.end();
    } catch (error) {
        res.json({ error: error.message }).status(500);
    }
})

// UPDATE GROUP 
router.put('/',auth, upload.none(), async (req, res) => {
    const groupname = req.query.groupname;
    const grouppic = req.body.grouppic;
    const descript = req.body.descript;
    try {
        await updateGroup(groupname, grouppic, descript);
        res.end();
    } catch (error) {
        res.json({ error: error.message }).status(500);
    }
})

// GET ALL GROUPS
router.get('/', async (req, res) => {
    res.json(await getGroups());
})

// GET OWNED GROUPS
router.get('/ownedgroups',auth, async (req, res) => {
    const username = req.query.username;
    res.json(await getOwnedGroups(username));
})

// GET GROUPS THAT YOU ARE IN
router.get('/groupsin',auth, async (req, res) => {
    const username = req.query.username;
    console.log(username);
    res.json(await getGroupsIn(username));
})

// GET GROUP
router.get('/getgroup',auth, async (req, res) => {
    const groupname = req.query.groupname;
    res.json(await getGroup(groupname));
})

// GET GROUPMEMBERS
router.get('/groupmembers', async (req, res) => {
    const groupname = req.query.groupname;
    res.json(await getGroupMembers(groupname));
})

// GET GROUPID
router.get('/getgroupid',auth, async (req, res) => {
    const groupname = req.query.groupname;
    res.json(await getGroupID(groupname));
})

// DELETE GROUPMEMBER
router.delete('/', auth, async (req, res) => {
    const username = req.query.username;
    const groupname = req.query.groupname;
    res.json(await deleteGroupMember(username, groupname));
})

module.exports = router;