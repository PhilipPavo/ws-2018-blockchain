const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', function(req, res, next) {
    if(req.user.data){
        return res.redirect('/');
    }

    const private_key = fs.readFileSync('keys/key').toString();

    res.render('auth', {
        private_key
    });
});

router.get('/logout', function(req, res, next) {
    req.user.data = null;

    res.redirect('/');
});

module.exports = router;