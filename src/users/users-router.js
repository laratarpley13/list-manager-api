const path = require('path')
const express = require('express')
//const xss = require('xss')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(
            req.app.get('db')
        )
            .then(users => {
                res.json(users)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { email, password } = req.body
        const newUser = { email, password }

        if (email == null) {
            return res.status(400).json({
                error: { message: `Missing 'email' in request body` }
            })
        }

        if (password == null) {
            return res.status(400).json({
                error: { message: `Missing 'password' in request body` }
            })
        }

        UsersService.insertUser(
            req.app.get('db'),
            newUser
        )
            .then(user => {
                res
                    .status(201)
                    .json(user.email)
            })
            .catch(next)
    })

usersRouter
    .route('/:user_id')
    .all((req, res, next) => {
        UsersService.getById(
            req.app.get('db'),
            req.params.user_id
        )
            .then(user => {
                if(!user) {
                    return res.status(404).json({
                        error: { message: `User doesn't exist` }
                    })
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.user.id,
            email: res.user.email,
            password: res.user.password,
        })
    })
    .delete((req, res, next) => {
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.user_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { email, password } = req.body
        const userToUpdate = { email, password }

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'name' or 'password'`
                }
            })
        }

        UsersService.updateUser(
            req.app.get('db'),
            req.params.user_id,
            userToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = usersRouter