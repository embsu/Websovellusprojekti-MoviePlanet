const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const pgPool = require('../postgre/connection');
const { auth } = require('../auth/auth');

const should = chai.should();

chai.use(chaiHttp);

// HOW TO RUN TESTS:
// Open your terminal and navigate to the root folder of this project (MoviePlanet)
// Run the command: npm test
// The tests will run and you will see the results in your terminal
// If you want see results more visually, you can check mochaawesome-report and preview mochaawesome.html

describe('Customer Route Tests', () => {
    let server;

    // Start server and connect to database before tests
    before((done) => {
        pgPool.connect((err) => {
            if (err) {
                console.error('Error connecting to Postgres database');
                console.error(err.message);
                done(err);
            } else {
                server = app.listen(3002, () => {
                    done();
                });
            }
        });
    });

    after((done) => {
        server.close(() => { // Close server
            pgPool.end(); // Close database connection
            done();
        });
    });

    // TEST CASES

   // GET ALL USERS
    it('Hae kaikki käyttäjät', (done) => {
        chai.request(app)
            .get('/customer')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
            });
    });

    // CREATE USER
    it('Luo käyttäjän', (done) => {
        chai.request(app)
            .post('/customer')
            .send({
                fname: 'tintti',
                lname: 'tinttinen',
                username: 'tintti',
                pw: '1234',
            })
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    //TRY TO LOGIN WITH WRONG PASSWORD
    it('Väärä salasana', (done) => {
        chai.request(app)
            .post('/customer/login')
            .send({
                username: 'tintti',
                pw: '12345',
            })
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    //TRY TO LOGIN WITH WRONG USERNAME
    it('Käyttäjää ei löytynyt', (done) => {
        chai.request(app)
            .post('/customer/login')
            .send({
                username: 'tinttinen',
                pw: '1234',
            })
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });

    //LOGIN
    it('Kirjaudu sisään', (done) => {
        chai.request(app)
            .post('/customer/login')
            .send({
                username: 'tintti',
                pw: '1234',
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('jwtToken');
                authToken = res.body.jwtToken;
                console.log(authToken);
                done();
            });
    });

    //DELETE USER
    it('Poista käyttäjä', (done) => {
        console.log("Tässä on token delete: " +authToken);
        chai.request(app)
            .delete('/customer/tintti')
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    //TRY TO DELETE USER THAT DOES NOT EXIST
    it('poista olematon käyttäjä', (done) => {
        chai.request(app)
            .delete('/customer/tinttinen')
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
});






