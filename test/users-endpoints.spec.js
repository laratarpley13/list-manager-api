const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')

describe('Users Endpoints', function() {
    let db
    let authToken

    before('make knex instance', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
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

    context('/api/users route', () => {
        const testUsers = makeUsersArray();
        
        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        
        it('responds with a 400 if missing email during signup', () => {
            return supertest(app)
                .post('/api/users')
                .send({password: "P@ssword1234"})
                .expect(400, {message: `Missing 'email'`})
        })
        it('responds with a 400 if missing password during signup', () => {
            return supertest(app)
                .post('/api/users')
                .send({email: "test2@test.com"})
                .expect(400, {message: `Missing 'password'`})
        })
        it('responds with a 400 if password is less than 8 characters', () => {
            return supertest(app)
                .post('/api/users')
                .send({email: "test2@test.com", password: "P@sswor"})
                .expect(400, {message: `Password must be 8 or more characters`})
        })
        it('responds with a 400 if password does not contain an upper, lower, number and special character', () => {
            return supertest(app)
                .post('/api/users')
                .send({email: "test2@test.com", password: "P@ssword"})
                .expect(400, {message: `Password must contain one uppercase character, one lowercase character, one sepcial character, and one number`})
        })
        it('responds with a 400 if email has already been used for an account', () => {
            return supertest(app)
                .post('/api/users')
                .send({email: "test@test.com", password: "P@ssword1234"})
                .expect(400, {message: `Email already used`})
        })
        it('responds with a 201 and the user id and email if signup was succesful', () => {
            return supertest(app)
                .post('/api/users')
                .send({email: "test2@test.com", password: "P@ssword123"})
                .expect(201, {id: 5, email: "test2@test.com"})
        })
        it('GET / responds with the user info if authToken is provided', () => {
            return supertest(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200, {id: 1, email: "test@test.com"})
        })
        it('GET / responds with unauthorized request if valid auth token is not provided', () => {
            return supertest(app)
                .get('/api/users')
                .set('Authorization', `Bearer dkj3l4987sdnfsl343`)
                .expect(401, {message: "Unauthorized Request"})
        })
    })
})