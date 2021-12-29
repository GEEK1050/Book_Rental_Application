const express = require('express');
const app = express();
const dotenv = require('dotenv');

const db_connect = require('./server/database/connections');
const routes = require('./server/routes/routes');

dotenv.config({path: "./config.env"});

const PORT = process.env.PORT || 5000;

db_connect();

/* MIDDLEWARES */
app.use(express.json());
app.use('/', routes);
app.use((err, req, res, next) => {
    res
    .status(504)
    .json({
        status: "Failure",
        message: err.message || "Server error"
    });
    next();
})
/* MIDDLEWARES */


app.listen(5000, () => {
    console.log(`server running on LocalHost:${PORT}`);
})
