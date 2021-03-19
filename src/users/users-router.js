const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')
const usersRouter = express.Router()
const jsonParser = express.json()
const { requireAuth } = require('../middleware/jwt-auth');

const serializeUser = (user) => {
    return {
        id: user.id,
        email: xss(user.email),
    } 
}

usersRouter
    .route('/')
    .get(requireAuth, (req, res) => {
        res.json(serializeUser(req.user))
    })
    .post(jsonParser, (req, res, next) => {
        const { email, password } = req.body
        const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

        if (!email) {
            return res.status(400).json({
                message: `Missing 'email'`
            })
        }

        if (!password) {
            return res.status(400).json({
                message: `Missing 'password'`
            })
        }

        if(password.length < 8) {
            return res.status(400).json({
               message: `Password must be 8 or more characters` 
            })
        }

        if(!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return res.status(400).json({
                message: `Password must contain one uppercase character, one lowercase character, one sepcial character, and one number`
            })
        }

        UsersService.hasUserWithEmail(req.app.get('db'), email)
            .then(hasUser => {
                if(hasUser){
                    return res.status(400).json({
                        message: `Email already used`
                    })
                }

                return UsersService.hashPassword(password).then((hashPassword) => {
                    const newUser = {
                        email,
                        password: hashPassword,
                    }
                    return UsersService.insertUser(
                        req.app.get('db'),
                        newUser
                    )
                        .then(user => {
                            res
                                .status(201)
                                .json(serializeUser(user))
                        })
                        .catch(next)
                })

            })
    })

module.exports = usersRouter