require("dotenv").config()
const express = require('express');
const cookieParser = require('cookie-parser')
const cores = require('cors')
const connectDB = require('./config/db');

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET, PATCH", "POST"],
    credentials: true
}

app.use(cores(corsOptions))
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routers/auth');
const profileRouter = require('./routers/profile');
const requestRouter = require('./routers/request');
const userRouter = require('./routers/user');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter)

connectDB()
.then(() => {
    console.log('Database connection established');
})
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server is up and running on port 3000");
    })
})
.catch((e) => {
    console.log(`Error: ${e.message}`);
});

