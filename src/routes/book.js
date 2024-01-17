const express = require('express');
const router = express.Router();
const BookModel = require('../models/book');

router.route('/')
    .get(async (req, res) => {
        try {
            const title = req.query.title;
            const category = (typeof req.query.category === 'string') ? [req.query.category] : req.query.category;
            const author = (typeof req.query.author === 'string') ? [req.query.author] : req.query.author;
            const publisher = (typeof req.query.publisher === 'string') ? [req.query.publisher] : req.query.publisher;
            const publishedFrom = req.query.publishedFrom;
            const publishedTo = req.query.publishedTo;
            let query = {};
            if (title)
                query.title = new RegExp(title, 'i');
            if (category)
                query.category = { $in: category.map(q => new RegExp(q, 'i')) };
            if (author)
                query.author = { $in: author.map(q => new RegExp(q, 'i')) };
            if (publisher)
                query.publisher = { $in: publisher.map(q => new RegExp(q, 'i')) };
            if (publishedFrom || publishedTo)
                query.publishDate = { $gte: (publishedFrom || 1000) + '-01-01', $lte: (publishedTo || new Date().getFullYear()) + '-12-31' };

            if (Object.keys(query).length === 0)
                query = undefined;

            const results = await BookModel.find(query).sort().select({ __v: 0 });
            results.forEach(book => {
                book.images = book.images.map(image => req.protocol + "://" + req.hostname + ':3000/public/images/book/' + image);
            });
            res.json(results);
        } catch (e) {
            res.status(500).send({ message: e.message });
        }
    })
    .post(async (req, res) => {
        const book = new BookModel({
            title: req.body.title,
            category: req.body.category,
            author: req.body.author,
            publisher: req.body.publisher,
            publishDate: req.body.publishDate,
            overview: req.body.overview,
            numberOfPages: req.body.numberOfPages,
            images: req.body.images,
            price: req.body.price,
        });
        try {
            const newBook = await book.save();
            res.status(200).json(newBook);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    });

router.get('/random', async (req, res) => {
    const numberOfBooks = req.query.n;
    if (!numberOfBooks) {
        res.status(400).send({ message: 'invalid number of books' });
        return;
    }

    try {
        const randomBooks = await BookModel.aggregate([
            { $sample: { size: parseInt(numberOfBooks) } }
        ]);
        randomBooks.forEach(book => {
            book.images = book.images.map(image => req.protocol + "://" + req.hostname + ':3000/public/images/book/' + image);
        });
        res.json(randomBooks);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/insertMany', async (req, res) => {
    try {
        const data = req.body.data;
        const result = await BookModel.insertMany(data);
        res.status(200).json({ message: result });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

router.get('/category', async (req, res) => {
    try {
        let result = [];
        const f = await BookModel.find().select({ "category": 1, "_id": 0 });
        f.forEach((obj) => {
            result = result.concat(obj.category.filter(c =>
                result.indexOf(c) === -1)
            );
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.route('/:id')
    .get(getBookById, (req, res) => {
        if (res.book.images)
            res.book.images = res.book.images.map(image => req.protocol + "://" + req.hostname + ':3000/public/images/book/' + image);
        res.json(res.book);
    })
    .patch(getBookById, async (req, res) => {
        const book = res.book;
        if (req.body.title)
            book.title = req.body.title;
        if (req.body.category)
            book.category = req.body.category;

        try {
            const updatedBook = await book.save();
            res.json(updatedBook);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    })
    .delete(getBookById, async (req, res) => {
        try {
            const book = res.book;
            await book.remove();
            res.send("Deleted book with title: " + book.title);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    });

async function getBookById(req, res, next) {
    let book;
    try {
        book = await BookModel.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'book not found!' });
        }
        res.book = book;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    next();
}

module.exports = router;