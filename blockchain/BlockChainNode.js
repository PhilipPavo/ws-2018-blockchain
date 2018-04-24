const {ActionTypes, BlockSize, UserRoles} = require('./config.js');
const NodeRSA = require('node-rsa');
const Action = require('./Action');
const Block = require('./Block');
const fs = require('fs');
const User = require('./User');

const DUMP_FILE = './data/blockchain.json';
/*
 *  Класс сети блокчейн. Блоки хранятся в свойстве blocks
 */
class BlockChainNode{
    constructor(api){
        if(api){
            this.api = api;
            this.api.blockchain = this;
        }

        if(!this.initFromFile()){
            console.log('Initialize network');
            this.init();
        }


        this.saveBlocks();
    }

    createAdminAccount(data){
        if(!data.fullName || !data.email || !data.role){
            throw new Error('Admin parameters missing');
        }

        const openKeys = new NodeRSA({b: 512});

        const user = {
            login: data.email,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            publicKey: openKeys.exportKey('pkcs8-public')
        };

        const owner = new User();
        owner.keys = openKeys;

        try{
            this.appendAction(new Action(ActionTypes.INIT_ADMIN, user), owner);
        }catch (e) {
            console.error(e.message);
            return [];
        }

        console.log('Admin successfully created');
        console.log(openKeys.exportKey('pkcs8-private'));
        
        fs.writeFileSync('keys/key', openKeys.exportKey('pkcs8-private'));
    }

    initFromFile(){
        if(fs.existsSync(DUMP_FILE)){
            let data = JSON.parse(fs.readFileSync(DUMP_FILE).toString());

            if(!data.blocks || !data.blocks.length){
                return false;
            }

            this.blocks = data.blocks.map(data => {
                const block =  new Block();
                Object.assign(block, data);
                if(!block.hash){
                    console.log('Pending block found');
                }else if(!block.isValid()){
                    throw new Error('No valid block loaded');
                }

                return block;
            });

            return true;
        }

        return false;
    }

    saveBlocks(){
        if(this.api){
            console.log(`Blocks saved (${this.api.getTransactions().length} transactions)`);
        }

        const obj = {
            ...this
        };

        delete obj.api;
        fs.writeFileSync(DUMP_FILE, JSON.stringify(obj));
    }

    /*
     *  Первичная инициализация сети начальным блоком и создание первой записи
     */
    init(){
        this.blocks = [new Block()];

        this.appendAction(new Action( ActionTypes.INIT, {
            message: 'Blockchain initialized'
        }));

        this.createAdminAccount({
            email: 'pavophilip@gmail.com',
            publicKey: '1234568',
            fullName: 'Pavo Philip',
            role: UserRoles.ADMIN
        });

    }

    /*
     *  Добавление блока в цепочку блоков
     */
    appendBlock(block){
        this.blocks.push(block);

        this.saveBlocks();

        return block;
    }

    /*
     * Добавление и подпись новой записи в текующий блок
     */
    appendAction(action, owner){
        const block = this.getCurrentBlock();
        if(owner){
            action.sign(owner);
        }
        const access = action.checkAccess(this.api);
        if(!access){
            throw new Error('No valid action');
        }

        block.data.push(action);

        this.saveBlocks();
        return action;
    }

    /*
     * Получение текущего блока, если блок заполнен - создается новый
     */
    getCurrentBlock(){
        const block = this.blocks[this.blocks.length - 1];

        if(block.data.length === BlockSize){
            block.powHash();
            return this.appendBlock(new Block([], new Date(), block));
        }

        return block;
    }

    /*
     * Сериализация цепочки блоков в записываемый вид
     */
    serialize(){
        return JSON.stringify(this);
    }
}

module.exports = BlockChainNode;