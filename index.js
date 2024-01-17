require('dotenv').config();
const cors = require('cors');
const express = require("express");
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to database: ' + db.db.databaseName));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH', 'OPTIONS']
}));

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use('/public', express.static("public"));

const bookRouter = require('./src/routes/book');
app.use('/book', bookRouter);
const userRouter = require('./src/routes/user');
app.use('/user', userRouter);
const orderRouter = require('./src/routes/order');
app.use('/order', orderRouter);

app.get('/', (req, res) => {
    res.send('API for Bookie');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
