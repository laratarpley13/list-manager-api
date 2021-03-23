const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')

describe('Auth Endpoints', function() {
    let db
    let authToken

    before('make knex instance', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    beforeEach('clean the table', () => 
        db.raw(
            "TRUNCATE TABLE users, lists, items RESTART IDENTITY CASCADE"
        )
    )

    beforeEach('register and login', () => {
        let user = { email: "test@test.com", password: "P@ssword1234" }
        return supertest(app)
            .post('/api/users')
            .send(user)
            .then(res => {
                return supertest(app).post('/api/auth/signin').send(user).then(res2 =>
                    authToken = res2.body.authToken    
                )
            })
    })

    after('disconnect from db', () => db.destroy())

    context('/signin user route', () => {
        const testUsers = makeUsersArray();
        
        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })

        it('if email is not provided it sends a 400 status', () => {
            return supertest(app)
                .post('/api/auth/signin')
                .send({password: "P@ssword1234"})
                .expect(400, {message: `Missing 'email'`})
        })
        it('if password is not provided it sends a 400 status', () => {
            return supertest(app)
                .post('/api/auth/signin')
                .send({email: "test@test.com"})
                .expect(400, {message: `Missing 'password'`})
        })
        it('if no user in db with email, returns 400 status', () => {
            return supertest(app)
                .post('/api/auth/signin')
                .send({email: "test2@test.com", password: "P@ssword1234"})
                .expect(400, {message: 'Incorrect email or password'})
        })
        it('if the password for given email does not match, return 400 status', () => {
            return supertest(app)
                .post('/api/auth/signin')
                .send({email: "test@test.com", password: "P@ssword5678"})
                .expect(400, {message: 'Incorrect email or password'})
        })
        it('if both email and password are correct, send auth token', () => {
            return supertest(app)
                .post('/api/auth/signin')
                .send({email: "test@test.com", password: "P@ssword1234"})
                .expect({authToken: authToken})
        })
    })
})