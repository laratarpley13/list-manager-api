const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next){
    const authToken = req.get('Authorization') || "";

    let bearerToken;
    if(!authToken.toLowerCase().startsWith("bearer ")) {
        return res.status(401).json({
            message: 'Missing bearer token'
        });
    }else {
        bearerToken = authToken.slice(7, authToken.length);
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)
        AuthService.getUserWithEmail(req.app.get('db'), payload.sub)
            .then(user => {
                if(!user) {
                    res.status(401).json({
                        message: 'Unauthorized Request'
                    });
                }
                req.user = user;
                next();
            })
    } catch(error) {
        return res.status(401).json({
            message: 'Unauthorized Request'
        });
    }
}

module.exports = {
    requireAuth,
};