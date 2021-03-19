const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')

describe('Items Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
        })
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('blogful_articles').truncate())

    context(`/:user_id`, () => {
        //get
    })

    context(`/`, () => {
        //get - require auth
        //post - require auth
    })

    context('/:user_id/:list_id/:item_id', () => {
        //delete - require auth
        //patch 
    })
})