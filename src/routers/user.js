const express = require('express');
const userRouter = express.Router();

const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user')

const USER_SAFE_DATA = ["firstName", "lastName", "gender", "photoUrl", "about", "age", "companyName", "designation"]

userRouter.get(
    '/user/requests/recieved',
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;

            const requests = await ConnectionRequest.find({
                toUserId: loggedInUser,
                status: "interested"
            }).populate("fromUserId", USER_SAFE_DATA);

            res.json({
                message: "Successfully fetched all the pending requests recieved",
                data: requests
            });
        }
        catch (e) {
            res.status(400).send({ message: e.message });
        }
    })

userRouter.get(
    '/user/connections',
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user

            const connections = await ConnectionRequest.find({
                $or: [
                    { fromUserId: loggedInUser._id, status: "accepted" },
                    { toUserId: loggedInUser._id, status: "accepted" }
                ]
            })
                .populate("fromUserId", USER_SAFE_DATA)
                .populate("toUserId", USER_SAFE_DATA)

            const data = connections.map(connection => {
                if (connection.fromUserId._id.equals(loggedInUser._id)) {
                    return connection.toUserId
                }
                return connection.fromUserId
            })

            res.json({
                message: "Connections fetched successfully",
                data
            })
        }
        catch (e) {
            res.status(400).semd({ message: e.message })
        }


    })

userRouter.get(
    '/feed',
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;

            const page = parseInt(req.query.page) || 1
            let limit = parseInt(req.query.limit) || 3
            limit = limit > 50 ? 50 : limit

            const skip = (page - 1) * limit

            const loggedInUserConnectionReqs = await ConnectionRequest.find({
                $or: [
                    { fromUserId: loggedInUser._id },
                    { toUserId: loggedInUser._id }
                ]
            }).select("fromUserId toUserId ")

            const hiddenUsersfromFeed = new Set()

            loggedInUserConnectionReqs.map(connection => {
                hiddenUsersfromFeed.add(connection.fromUserId.toString())
                hiddenUsersfromFeed.add(connection.toUserId.toString())
            })

            const feedUsers = await User.find({
                $and: [
                    { _id: { $nin: [...hiddenUsersfromFeed] } },
                    { _id: { $ne: loggedInUser._id } }
                ]
            }).select(USER_SAFE_DATA).skip(skip).limit(limit)

            res.json({
                message: "fetched feed users",
                data: feedUsers,
            })
        }
        catch (e) {
            res.status(400).send({ message: e.message })
        }
    })

module.exports = userRouter;