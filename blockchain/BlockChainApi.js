const NodeRSA = require('node-rsa');
const Action = require('./Action');
const {ActionTypes, BlockSize, UserRoles} = require('./config.js');
const Crypto = require('crypto-js');
const User = require('./User');
const fs = require('fs');
const {bufferData} = require('./Utils');

/*
 * Интерфейс работы с блокчейн сетью для приложений
 */
class BlockChainApi{
    constructor(blockchain){
        this.blockchain = blockchain;
    }

    votePoll(data, owner){
        const poll = {
            pollId: data.pollId,
            agree: !!data.agree
        };

        return this.blockchain.appendAction(new Action( ActionTypes.VOTE_ANSWER, poll), owner);
    }

    getPollById(id){
        return this.getTransactionsByType(ActionTypes.VOTE_REQUEST).find(poll => {
            return poll.payload.id === id;
        });
    }

    getPolls(){
        return this.getTransactionsByType(ActionTypes.VOTE_REQUEST);
    }

    createPoll(data = {}, owner){
        if(!data.title || !data.description || !data.role){
            throw new Error('User parameters missing');
        }

        const poll = {
            id: Crypto.SHA256(new Date().toLocaleString()).toString(),
            title: data.title,
            description: data.description,
            role: data.role
        };

        return this.blockchain.appendAction(new Action( ActionTypes.VOTE_REQUEST, poll), owner);
    }

    /*
     *  Создание нового пользователя в системе
     *  data - объект с данными пользователя: fullName, email, role
     */
    createUser(data = {}, owner){
        if(!data.fullName || !data.email || !data.role){
            throw new Error('User parameters missing');
        }

        const anonymousKeys = new NodeRSA({b: 512});
        const openKeys = new NodeRSA({b: 512});

        const user = {
            login: data.email,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            publicKey: openKeys.exportKey('pkcs8-public')
        };

        user.sign = openKeys.sign(bufferData(user), 'hex');

        const anonymousUser = {
            login: Crypto.SHA256(anonymousKeys.exportKey('pkcs8-public')).toString(),
            role: data.role
        };

        if(!owner){
            owner = new User();
            owner.keys = openKeys;
        }

        console.log('register user', user.login );
        console.log(openKeys.exportKey('pkcs8-private'));

        return {
            anonymous: {
                action: this.blockchain.appendAction(new Action( ActionTypes.USER_PRIVATE_KEY_RECEIVED, anonymousUser), owner),
                key: anonymousKeys.exportKey('pkcs8-private')
            },
            open: {
                action: this.blockchain.appendAction(new Action(ActionTypes.USER_PUBLIC_KEY_RECEIVED, user), owner),
                key: openKeys.exportKey('pkcs8-private')
            }
        };
    }

    /*
     * Получить список всех блоков в сети
     */
    getBlocks(){
        return this.blockchain.blocks;
    }

    /*
    * Поиск одного блока
    */
    searchBlock(query){
        const blocks = this.searchBlocks(query);

        if(!blocks.length){
            return null
        }

        return blocks[0];
    }

    /*
     * Поиск блоков
     */
    searchBlocks(query = {}){
        if(!Object.keys(query).length){
            return this.getBlocks();
        }

        return this.getBlocks().filter((item) => {
            for (let param in query) {
                return query[param] == item[param];
            }
        });
    }

    /*
     * Получить список всех транзакций
     */
    getTransactions(){
        const transactions = this.blockchain.blocks.reduce((prev, current) => {
            return [
                ...prev,
                ...current.data
            ];

        }, []);

        return transactions;
    }

    /*
     * Поиск транзакций по запросу
     */
    searchTransactions(query){
        const transactions = this.getTransactions();

        if(!Object.keys(query).length){
            return this.getBlocks();
        }
        return transactions.filter((item) => {
            for (let param in query) {
                if(Array.isArray(query[param])){

                    return query[param].indexOf(item[param]) !== -1;
                }
                return query[param] == item[param];
            }
        });
    }

    /*
     * Получить транзакции по типу
     */
    getTransactionsByType(type){
        return this.searchTransactions({
            type
        });
    }

    /*
     * Получить список всех пользователей
     */
    getUserList(){
        return this.getTransactionsByType([ActionTypes.USER_PUBLIC_KEY_RECEIVED, ActionTypes.INIT_ADMIN]);
    }

    getUserByLogin(login){
        return this.getUserList().find(action => action.payload.login === login) || null;
    }

    getUserByPublicKey(key){
        return this.getUserList().find(action => action.payload.publicKey === key) || null;
    }
}

module.exports = BlockChainApi;