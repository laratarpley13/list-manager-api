const express = require('express')
const ListsService = require('./lists-service')

const {requireAuth} = require('../middleware/jwt-auth');

const listsRouter = express.Router()
const jsonParser = express.json()

listsRouter
    .route('/')
    .get(requireAuth, (req, res, next)=>{
        ListsService.getAllLists(
            req.app.get('db'),
            req.user.id
        )
            .then(lists => {
                res.json(lists)
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { name, userid } = req.body
        const newList = { name, userid }

        for (const [key, value] of Object.entries(newList)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        ListsService.insertList(
            req.app.get('db'),
            newList
        )
            .then(list => {
                res
                    .status(201)
                    .json(list)
            })
            .catch(next)
    })

listsRouter
    .route('/:user_id/:list_id')
    .all((req, res, next) => {
        ListsService.getById(
            req.app.get('db'),
            req.params.user_id,
            req.params.list_id
        )
            .then(list => {
                if(!list) {
                    return res.status(404).json({
                        error: { message: `List doesn't exist` }
                    })
                }
                res.list = list
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.list.id,
            name: res.list.name,
            date: res.list.date,
            userid: res.list.userid,
        })
    })
    .delete(requireAuth, (req, res, next) => {
        ListsService.deleteList(
            req.app.get('db'),
            req.params.user_id,
            req.params.list_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(requireAuth, jsonParser, (req, res, next) => {
        const { name } = req.body
        const listToUpdate = { name }

        const numberOfValues = Object.values(listToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'name'`
                }
            })
        }

        ListsService.updateList(
            req.app.get('db'),
            req.params.user_id,
            req.params.list_id,
            listToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = listsRouter