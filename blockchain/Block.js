const CryptoJS = require('crypto-js');

/*
 * Класс блока цепочки
 */
class Block{

    /*
     * Инициализация блока данными
     * data
     * datetime
     * previousBlock
     *
     */
    constructor(data = [], datetime = new Date(), previousBlock){
        this.data = data;
        this.datetime = datetime || new Date();
        this.index = 0;

        let previousHash = null;

        /*
         * Если нет предыдущего блока инициализируем собственный хеш
         */
        if(previousBlock){
            previousHash = previousBlock.hash;
            this.index = previousBlock.index + 1;
        }else{
            previousHash = CryptoJS.SHA256('1337').toString();
        }

        this.nonce = 0;
        this.previousHash = previousHash;
    }

    /*
     * Валидация блока
     */
    isValid(){
        return this.toHash() === this.hash;
    }

    /*
     * Proof of work
     */
    powHash(){
        let hash = this.toHash();
        console.log(`Mining block #${this.index}`);

        while(hash.substr(-3) !== '000'){
            this.nonce++;
            hash = this.toHash();
        }
        this.hash = hash;
        console.log(`Block #${this.index} with hash ${hash} mined`);
    }

    /*
     * Получение хеша текущего блока SHA256(JSON(datetime, previousHash, data))
     */
    toHash(){
        let data = JSON.stringify({
            index: this.index,
            datetime: this.datetime,
            previousHash: this.previousHash,
            data: this.data,
            nonce: this.nonce
        });

        return CryptoJS.SHA256(data).toString();
    }
}

module.exports = Block;