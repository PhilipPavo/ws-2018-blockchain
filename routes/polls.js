var express = require('express');
var router = express.Router();
const {ActionTypes, BlockSize, UserRoles} = require('../blockchain/config.js');

router.get('/', function(req, res, next) {

    const polls = req.api.getPolls();
    res.render('polls', {
        polls
    });
});

router.get('/new', function(req, res, next) {
    res.render('create-poll');
});

router.get('/:id', function(req, res, next) {
    const poll = req.api.getPollById(req.params.id);
    if(!poll){
        return res.redirect('/polls');
    }

    const owner = req.api.getUserByPublicKey(poll.ownerPublicKey) || {};
    const votes = req.api.getTransactionsByType(ActionTypes.VOTE_ANSWER).filter(vote => {
        return vote.payload.pollId === req.params.id
    });

    const userVote = votes.find(vote => {
        return vote.ownerPublicKey === req.user.data.payload.publicKey;
    });

    res.render('poll-view', {
        poll,
        votes,
        owner,
        userVote,
        agree: votes.filter(vote => {
            return vote.payload.agree;
        }),
        disagree: votes.filter(vote => {
            return !vote.payload.agree;
        })
    });
});



module.exports = router;
