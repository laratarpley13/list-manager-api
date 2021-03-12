//const path = require('path')
const express = require('express')
//const xss = require('xss')
const ItemsService = require('./items-service')
//const usersRouter = require('../users/users-router')
//const listsRouter = require('../lists/lists-router')

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
    .post(jsonParser, (req, res, next) => {
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
    .get((req, res, next) => {
        res.json({
            id: res.item.id,
            name: res.item.name,
            listId: res.item.listid,
            userId: res.item.userid,
            active: res.item.active,
            editItemActive: res.item.active,
        })
    })
    .delete((req, res, next) => {
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
        const { name,  active, editItemActive } = req.body
        const itemToUpdate = { name, active, editItemActive } 

        const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'name', 'active' or 'editItemActive'`
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