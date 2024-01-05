// GROUPMEMBERSHIPIT:
// 0 = nobody
// 1 = pending
// 2 = member
// 3 = admin

// CONNECT TO DATABASE
const pgPool = require('./connection');

// SQL QUERIES
const sql = {
    POST_JOIN_REQUEST: 'INSERT INTO groupmembership (roles, idcustomer, idgroup) VALUES (1, $1, $2)', 
    GET_JOIN_REQUESTS: 'SELECT c.username, g.groupname \
                        FROM groupmembership gm \
                        JOIN customer c ON gm.idcustomer = c.idcustomer \
                        JOIN community g ON gm.idgroup = g.idgroup \
                        WHERE \
                        gm.roles = 1 \
                        AND g.idgroup IN (\
                            SELECT idgroup \
                            FROM groupmembership \
                            WHERE idcustomer = $1 \
                            AND ROLES = 3)',
    ACCEPT_JOIN_REQUEST: 'UPDATE groupmembership SET roles = 2 WHERE idcustomer = $1 AND idgroup = $2 AND roles = 1',
    DENY_JOIN_REQUEST: 'DELETE FROM groupmembership WHERE idcustomer = $1 AND idgroup = $2 AND roles = 1',
    GET_GMS_ROLES: 'SELECT groupmembership.roles FROM groupmembership WHERE idcustomer = $1 AND idgroup = $2'
}

// POST JOIN REQUEST
async function postJoinRequest(idcustomer, idgroup) {
  await pgPool.query(sql.POST_JOIN_REQUEST, [idcustomer, idgroup]);
}

// GET JOIN REQUESTS BY ADMIN
async function getPendingRequestsByAdmin(adminId) {
    try {
        const result = await pgPool.query(sql.GET_JOIN_REQUESTS, [adminId]);
        return result.rows;

    } catch (err) {
        console.error('Error in getPendingRequestsByAdmin:', err);
        throw err;
    }
}

// ACCEPT JOIN REQUEST
async function acceptJoinRequest(idcustomer, idgroup) {
    try {
        await pgPool.query(sql.ACCEPT_JOIN_REQUEST, [idcustomer, idgroup]);
    } catch (err) {
        console.error('Error in acceptJoinRequest:', err);
        throw err;
    }
}

// DENY JOIN REQUEST
async function denyJoinRequest(idcustomer, idgroup) {
    try {
        await pgPool.query(sql.DENY_JOIN_REQUEST, [idcustomer, idgroup]);
    } catch (err) {
        console.error('Error in denyJoinRequest:', err);
        throw err;
    }
}

// GET GROUPMEMBERSHIP ROLES
async function getGMSRoles(idcustomer, idgroup) {
    try {
        const result = await pgPool.query(sql.GET_GMS_ROLES, [idcustomer, idgroup]);
        const rows = result.rows;
        return rows;
    } catch (err) {
        console.error('Error in getGMS:', err);
        throw err;
    }
}

// EXPORT FUNCTIONS
module.exports = {postJoinRequest, getPendingRequestsByAdmin, acceptJoinRequest, denyJoinRequest, getGMSRoles};