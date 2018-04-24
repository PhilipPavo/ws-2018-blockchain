const express = require('express');
const router = express.Router();

module.exports = (api) => {

    router.get('/users', function(req, res, next) {
        res.json(api.getUserList());
    });

    router.get('/blocks', function(req, res, next) {
        res.json(api.searchBlocks(req.query));
    });

    router.get('/blocks/:index', function(req, res, next) {
        res.json(api.searchBlock(req.params));
    });

    router.get('/transactions', function(req, res, next) {
        res.json(api.getTransactions());
    });

    router.post('/transactions', function(req, res, next) {
        res.json(api.getBlocks());
    });

    router.post('/registerUser', function (req, res, next) {
        const data = {
            login: req.body.login,
            fullName: req.body.fullName,
            email: req.body.login,
            role: req.body.role
        };
        try{
            const actions = req.api.createUser(data, req.user);
            res.json(actions);
        }catch (e) {
            res.json({
                error: e.message
            });
        }
    });

    router.post('/auth', function(req, res, next) {
        const user = api.getUserByLogin(req.body.login);

        if(!user || !user.payload){
            req.user.data = null;
            return res.json({
                success: false
            });
        }

        const result = req.user.auth(user, req.body.privateKey);
        return res.json({
            success: result,
            user: {

            }
        });
    });

    router.get('/auth/logout', function(req, res, next){
        return res.json({
            success: true
        });
    });

    router.get('/polls', function (req, res, next) {
        res.json(api.getPolls());
    });

    router.post('/polls/create', function (req, res, next) {
        const data = {
            title: req.body.title,
            description: req.body.description,
            role: req.body.role
        };
        try{
            const actions = req.api.createPoll(data, req.user);
            res.json(actions);
        }catch (e) {
            res.json({
                error: e.message
            });
        }
    });

    router.post('/polls/vote', function (req, res, next) {
        const data = {
            pollId: req.body.pollId,
            agree: req.body.agree
        };

        try{
            const actions = req.api.votePoll(data, req.user);
            res.json(actions);
        }catch (e) {
            res.json({
                error: e.message
            });
        }
    });

    return router;
};
