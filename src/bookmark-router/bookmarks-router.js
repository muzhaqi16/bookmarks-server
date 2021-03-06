const express = require('express');
const uuid = require('uuid/v4');
const validator = require('validator');
const logger = require('../logger');
const bookmarks = require('../bookmarks');
const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter.route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description, rating = 5 } = req.body;

        if (!title) {
            logger.error(`Title is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if (!url) {
            logger.error(`Url is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if (!description) {
            logger.error(`Description is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if (isNaN(parseInt(rating))) {
            logger.error(`Rating needs to be a number`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if (rating < 1 || rating > 5) {
            logger.error(`Rating should be between 1 and 5`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if (!validator.isURL(url)) {
            logger.error(`The url is not valid`);
            return res
                .status(400)
                .send('Invalid data');
        }
        const id = uuid();
        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }
        bookmarks.push(bookmark);
        logger.info(`Bookmark with id ${id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark);
    })
bookmarksRouter.route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(b => b.id == id);

        // make sure we found a card
        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Bookmark Not Found');
        }

        res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Not found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted.`);

        res
            .status(204)
            .end();
    })

module.exports = bookmarksRouter