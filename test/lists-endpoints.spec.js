const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')
const { makeListsArray } = require('./lists.fixtures')

describe('Lists Endpoints', function() {
    let db;
    let authToken;

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

    context(`Given there are lists in the database`, () => {
        const testLists = makeListsArray();
        const testUsers = makeUsersArray();
        
        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert lists', () => {
            return db
                .into('lists')
                .insert(testLists)
        })
        
        it('GET /api/lists responds with 200 and all of the lists', () => {
            const expectedList = [testLists[0]]
            return supertest(app)
                .get('/api/lists')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200, expectedList)
        })
        it('GET /api/lists/:user_id/:list_id responds with the list and 200 status if it exists', () => {
            const expectedList = testLists[1]
            return supertest(app)
                .get(`/api/lists/${expectedList.userid}/${expectedList.id}`)
                .expect(200, expectedList)
        })
        it('GET /api/lists/:user_id/:list_id responds with 404 status if list does not exist', () => {
            return supertest(app)
                .get(`/api/lists/1/4`)
                .expect(404, {error: {message: `List doesn't exist`}})
        })
        it('DELETE /api/lists/:userid/:listid responds with 204 if lists exists and is succesful', () => {
            const expectedLists = testLists.filter(list => list.id !== 3)
            return supertest(app)
                .delete(`/api/lists/3/3`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204)
        })
        it('DELETE /api/lists/:userid/:listid responds with 404 status if list does not exist', () => {
            const expectedLists = testLists.filter(list => list.id !== 3)
            return supertest(app)
                .delete(`/api/lists/3/4`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404, {error: {message: `List doesn't exist`}})
        })
        it(`PATCH /api/lists/:userid/:listid responds with 204 if lists exists and is succesful`, () => {
            return supertest(app)
                .patch(`/api/lists/3/3`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({name: "New List Name"})
                .expect(204)
        })
        it(`PATCH /api/lists/:userid/:listid responds with 400 if request does not contain name`, () => {
            return supertest(app)
                .patch(`/api/lists/3/3`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({irrelevant: "Ignore this please"})
                .expect(400, {error: {message: `Request body must contain 'name'`}})    
        })
        it(`PATCH /api/lists/:userid/:listid responds with 404 status if list does not exist`, () => {
            return supertest(app)
                .patch(`/api/lists/3/4`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({name: 'change List name test'})
                .expect(404, {error: {message: `List doesn't exist`}})
        })
    })

    context(`Given there are no lists in the database`, () => {
        const testUsers = makeUsersArray();
        
        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })

        it('GET /api/lists responds with an empty array', () => {
            return supertest(app)
                .get('/api/lists')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200, [])
        })
    })

    context(`makes a POST request to api/lists`, () => {
        const testUsers = makeUsersArray();
        const testLists = makeListsArray();

        it('returns a 201 and the list when both name and userid are provided', () => {
            this.retries(3)
            return supertest(app)
                .post('/api/lists')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: "New Test List",
                    userid: 1,
                })
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql("New Test List")
                    expect(res.body.userid).to.eql(1)
                    expect(new Date(res.body.date).toLocaleString()).to.eql(new Date().toLocaleString())
                })
        })
        it('returns a 400 status when name is not provided', () => {
            return supertest(app)
                .post('/api/lists')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    userid: 1,
                })
                .expect(400, {
                    error: { message: `Missing 'name' in request body` }
                })
        })
        it('returns a 400 status when userid is not provided', () => {
            return supertest(app)
                .post('/api/lists')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: "New Test List",
                })
                .expect(400, {
                    error: { message: `Missing 'userid' in request body` }
                })
        })
    })
})