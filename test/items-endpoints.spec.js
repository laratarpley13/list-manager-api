const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')
const { makeListsArray } = require('./lists.fixtures')
const { makeItemsArray } = require('./items.fixtures')

describe('Items Endpoints', function() {
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
        const testItems = makeItemsArray();
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
        beforeEach('insert items', () => {
            return db
                .into('items')
                .insert(testItems)
        })
        
        it('GET /api/items responds with 200 and all of the items', () => {
            const expectedItems = [{
                id: 1,
                name: "item 1",
                listid: 1,
                userid: 1,
                active: false,
                edititemactive: false,
            }];
            return supertest(app)
                .get('/api/items')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200, expectedItems)
        })
        it('GET /api/items/:user_id responds with 200 and all of the items for the user', () => {
            const expectedItems = [{
                id: 1,
                name: "item 1",
                listid: 1,
                userid: 1,
                active: false,
                edititemactive: false,
            }];
            return supertest(app)
                .get('/api/items/1')
                .expect(200, expectedItems)
        })
        it('DELETE /api/items/:userid/:listid/:item_id responds with 204 if lists exists and is succesful', () => {
            const expectedItems = testItems.filter(item => item.id !== 3)
            return supertest(app)
                .delete(`/api/items/3/3/3`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204)
        })
        it('DELETE /api/items/:userid/:listid/:item_id responds with 404 status if list does not exist', () => {
            const expectedItems = testItems.filter(item => item.id !== 3)
            return supertest(app)
                .delete(`/api/items/3/3/4`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404, {error: {message: `Item doesn't exist`}})
        })
        it(`PATCH /api/items/:userid/:listid/:item_id responds with 204 if item exists and is succesful`, () => {
            return supertest(app)
                .patch(`/api/items/3/3/3`)
                .send({name: "New Test Name"})
                .expect(204)
        })
        it(`PATCH /api/items/:userid/:listid/:item_id responds with 400 if request does not contain name, active, or edititemactive`, () => {
            return supertest(app)
                .patch(`/api/items/3/3/3`)
                .send({irrelevant: "Ignore this please"})
                .expect(400, {error: {message: `Request body must contain 'name', 'active' or 'edititemactive'`}})    
        })
        it(`PATCH /api/items/:userid/:listid/:item_id responds with 404 status if list does not exist`, () => {
            return supertest(app)
                .patch(`/api/items/3/3/4`)
                .send({name: 'change List name test'})
                .expect(404, {error: {message: `Item doesn't exist`}})
        })
    })
    context(`Given there are no lists in the database`, () => {
        const testUsers = makeUsersArray();
        const testLists = makeListsArray();
        
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

        it('GET /api/items responds with an empty array', () => {
            return supertest(app)
                .get('/api/items')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200, [])
        })
        it('GET /api/items/:userid responds with an empty array for the user', () => {
            return supertest(app)
                .get('/api/items/1')
                .expect(200, [])
        })
    })
    context(`makes a POST request to api/lists`, () => {
        const testUsers = makeUsersArray();
        const testLists = makeListsArray();
        const testItems = makeItemsArray();

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
        beforeEach('insert items', () => {
            return db
                .into('items')
                .insert(testItems)
        })

        it('returns a 201 and the list when both name and userid are provided', () => {
            return supertest(app)
                .post('/api/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: "New Test Item",
                    userid: 1,
                    listid: 1,
                })
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql("New Test Item")
                    expect(res.body.userid).to.eql(1)
                    expect(res.body.listid).to.eql(1)
                })
        })
        it('returns a 400 status when name is not provided', () => {
            return supertest(app)
                .post('/api/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    userid: 1,
                    listid: 1,
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
                    listid: 1,
                })
                .expect(400, {
                    error: { message: `Missing 'userid' in request body` }
                })
        })
        it('returns a 400 status when listid is not provided', () => {
            return supertest(app)
                .post('/api/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: "New Test Item",
                    userid: 1,
                })
                .expect(400, {
                    error: { message: `Missing 'listid' in request body` }
                })
        })
    })
})