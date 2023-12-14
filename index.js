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

app.use(express.json());

const bookRouter = require('./src/routes/books');
app.use('/books', bookRouter);
const userRouter = require('./src/routes/users');
app.use('/users', userRouter);

app.get('/', (req, res) => {
    res.send('API for Bookie');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
