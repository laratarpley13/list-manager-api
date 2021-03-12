const path = require('path')
const express = require('express')
//const xss = require('xss')
const ListsService = require('./lists-service')
const usersRouter = require('../users/users-router')

const listsRouter = express.Router()
const jsonParser = express.json()

listsRouter
    .route('/:user_id')
    .get((req, res, next) => {
        ListsService.getAllLists(
            req.app.get('db'),
            req.params.user_id
        )
            .then(lists => {
                res.json(lists)
            })
            .catch(next)
    })

listsRouter
    .route('/')
    .post(jsonParser, (req, res, next) => {
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
            dat: res.list.date,
            userId: res.list.userid,
        })
    })
    .delete((req, res, next) => {
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
    .patch(jsonParser, (req, res, next) => {
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