const User = require('../models/user')
const jwt = require('jsonwebtoken')

const userAuth = async (req, res, next) => {
    try{
        const {token} = req.cookies

        if (!token){
            return res.status(401).send("Token must be required")
        }

        const decodedObj = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decodedObj.id})

        if (!user){
            throw new Error("user not found")
        }
        req.user = user
        next()
        
    }catch(e){
        res.status(400).send("ERROR: " + e.message)
    }
}

module.exports = {userAuth};