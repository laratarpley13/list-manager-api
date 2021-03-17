const express = require("express");
const jsonParser = express.json()
const AuthService = require('./auth-service')
const authRouter = express.Router();

authRouter
    .route('/signin')
    .post(jsonParser, (req, res, next) => {
        const { email, password } = req.body
        const user = { email, password }

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
        AuthService.getUserWithEmail(req.app.get('db'), email).then(dbUser => {
            if(!dbUser) {
                return res.status(400).json({
                    message: "Incorrect email or password"
                })
            }
            AuthService.comparePasswords(password, dbUser.password).then(isMatch => {
                if(!isMatch) {
                    return res.status(400).json({
                        message: "Incorrect email or password"
                    })
                }
                
                const subject = dbUser.email;
                const payload = {user_id: dbUser.id}
                res.send({
                    authToken: AuthService.createJwt(subject, payload),
                })
            })
        })
    })

module.exports = authRouter;