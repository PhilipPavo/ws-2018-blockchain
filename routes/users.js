var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    const users = req.api.getUserList();

    res.render('users', {
        users
    });
});

router.get('/new', function(req, res, next) {
    res.render('user', {
        user: req.user
    });
});

module.exports = router;
