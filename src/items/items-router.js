const express = require('express')
const { requireAuth } = require('../middleware/jwt-auth')
const ItemsService = require('./items-service')

const itemsRouter = express.Router()
const jsonParser = express.json()

itemsRouter
    .route('/:user_id/')
    .get((req, res, next) => {
        ItemsService.getAllItems(
            req.app.get('db'),
            req.params.user_id
        )
            .then(items => {
                res.json(items)
            })
            .catch(next)
    })

itemsRouter
    .route('/')
    .get(requireAuth, (req, res, next) => {
        ItemsService.getAllItems(
            req.app.get('db'),
            req.user.id //new section
        )
            .then(items => {
                res.json(items)
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { name, userid, listid } = req.body
        const newItem = { name, userid, listid }

        for (const [key, value] of Object.entries(newItem)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        ItemsService.insertItem(
            req.app.get('db'),
            newItem
        )
            .then(item => {
                res
                    .status(201)
                    .json(item)
            })
            .catch(next)
    })

itemsRouter
    .route('/:user_id/:list_id/:item_id')
    .all((req, res, next) => {
        ItemsService.getById(
            req.app.get('db'),
            req.params.user_id,
            req.params.list_id,
            req.params.item_id
        )
            .then(item => {
                if(!item) {
                    return res.status(404).json({
                        error: { message: `Item doesn't exist` }
                    })
                }
                res.item = item
                next()
            })
            .catch(next)
    })
    .delete(requireAuth, (req, res, next) => {
        ItemsService.deleteItem(
            req.app.get('db'),
            req.params.user_id,
            req.params.list_id,
            req.params.item_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name,  active, edititemactive } = req.body
        const itemToUpdate = { name, active, edititemactive } 

        const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'name', 'active' or 'edititemactive'`
                }
            })
        }

        ItemsService.updateItem(
            req.app.get('db'),
            req.params.user_id,
            req.params.list_id,
            req.params.item_id,
            itemToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = itemsRouter