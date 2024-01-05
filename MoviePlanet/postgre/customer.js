// CONNECT TO DATABASE
const pgPool = require('./connection');

// SQL QUERIES
const sql = {
    INSERT_USER: 'INSERT INTO customer (fname, lname, username, pw, profilepic) VALUES ($1, $2, $3, $4, $5)',
    UPDATE_USER: 'UPDATE customer SET fname = COALESCE($2, fname), lname = COALESCE($3, lname), pw = COALESCE($4, pw), profilepic = COALESCE($5, profilepic) WHERE username = $1',
    GET_USERS: 'SELECT profilepic,fname,lname,username FROM customer',
    GET_USER: 'SELECT profilepic,fname,lname,username FROM customer WHERE username = $1 OR idcustomer = $2',
    GET_USERID: 'SELECT idcustomer FROM customer WHERE username = $1',
    DELETE_USER: 'DELETE FROM customer WHERE username = $1',
    DELETE_GROUPMS: 'DELETE FROM groupmembership WHERE idcustomer = (SELECT idcustomer FROM customer WHERE username = $1)', //delete groupmembership first
    DELETE_REVIEW: 'DELETE FROM review WHERE idcustomer = (SELECT idcustomer FROM customer WHERE username = $1)', //delete review first
    GET_USERS_FROM_GROUP: 'SELECT customer.username, customer.profilepic FROM customer JOIN groupmembership ON customer.idcustomer = groupmembership.idcustomer \
    JOIN community ON groupmembership.idgroup = community.idgroup WHERE community.idgroup = $1 AND groupmembership.roles IN (2, 3)', // 2 = member, 3 = admin
    GET_PW: 'SELECT pw FROM customer WHERE username = $1'
}

// ADD USER TO DATABASE
async function addUser(fname, lname, username, pw, profilepic) {
    await pgPool.query(sql.INSERT_USER, [fname, lname, username, pw, profilepic]);
}

// UPDATE USER FROM DATABASE
async function updateUser(username, fname, lname, pw, profilepic) {
    await pgPool.query(sql.UPDATE_USER, [username, fname, lname, pw, profilepic]);
}

// GET USERS FROM DATABASE
async function getUsers() {
    const result = await pgPool.query(sql.GET_USERS);
    const rows = result.rows;
    return rows;
}

// GET USER FROM DATABASE
async function getUser(username, idcustomer) {
    const result = await pgPool.query(sql.GET_USER, [username, idcustomer]);
    const rows = result.rows;
    return rows;
}

// GET USERID FROM DATABASE
async function getUserID(username) {
    const result = await pgPool.query(sql.GET_USERID, [username]);
    const rows = result.rows;
    return rows;
}

// DELETE USER FROM DATABASE
async function deleteUser(username) {
    try {
        const userExists = await checkIfUserExists(username);
        if (!userExists) {
            return { success: false, message: 'User does not exist.' };
        }
        // Delete users reviews 
        await pgPool.query(sql.DELETE_REVIEW, [username]);

        // delete users groupmembership
        await pgPool.query(sql.DELETE_GROUPMS, [username]);
        
        // delete user
        await pgPool.query(sql.DELETE_USER, [username]);

        return { success: true, message: 'User deleted successfully.' };
    } catch (error) {
        await pgPool.query('ROLLBACK'); // Rollback the transaction if an error occurs
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    } 
}

// CHECK IF USER EXISTS
async function checkIfUserExists(username) {
    const result = await pgPool.query('SELECT * FROM customer WHERE username = $1', [username]);
    if (result.rows.length > 0) {
        return true;
    } else {
        return false;
    }
}

// GET USERS FROM GROUP
async function getUsersFromGroup(idgroup) {
    const result = await pgPool.query(sql.GET_USERS_FROM_GROUP, [idgroup]);
    const rows = result.rows;
    return rows;
}

// GET PASSWORD FROM DATABASE
async function getPw(username) {
    const result = await pgPool.query(sql.GET_PW, [username]);
    if(result.rows.length > 0){
        return result.rows[0].pw;
    }else{
        return null;
    }
}

// EXPORT FUNCTIONS
module.exports = { addUser, getUsers, getUser, getUserID, deleteUser, updateUser, getUsersFromGroup , getPw};                                                      