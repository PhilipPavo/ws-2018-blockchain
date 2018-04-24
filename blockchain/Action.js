const {ActionTypes, BlockSize, UserRoles} = require('./config.js');
const {bufferData} = require('./Utils');

/*
 * Действие в сети блокчейн
 */
class Action{

    /*
     * Инициализация
     * type - Тип действия (ActionTypes)
     * payload - данные, передаваемые с действием
     * datetime - время
     * signature - подпись транзакции
     * ownerPublicKey - инициатор дейтсвия
     */
    constructor(type, payload = {}, datetime = new Date()){
        this.type = type;
        this.payload = payload;
        this.datetime = datetime;
        this.signature = null;
    }

    /*
     * Подпись блока
     * owner: User
     */
    sign(owner){
        this.ownerPublicKey = owner.keys.exportKey('pkcs8-public');
        this.signature = owner.keys.sign(bufferData(this.payload), 'hex');
        return this;
    }

    checkAccess(api){
        if(this.type === ActionTypes.INIT){
            return true;
        }

        if(!this.ownerPublicKey){
            console.error('No signed action');
            return false;
        }


        let owner = api.getUserByPublicKey(this.ownerPublicKey);


        if(this.type === ActionTypes.INIT_ADMIN){
            owner = this;
        }

        if(!owner){
            console.error('Owner not found');
            return false;
        }

        switch (this.type){
            case ActionTypes.INIT: {
                const actions = api.getTransactionsByType(ActionTypes.INIT);
                if(actions && actions.length){
                    console.error('Blockchain already initialized');
                    return false;
                }
            }

            case ActionTypes.INIT_ADMIN: {
                if(owner.payload.role !== UserRoles.ADMIN){
                    console.error('User has not permissions');
                    return false;
                }


                const users = api.getUserList();
                const found = users.find(user => {
                    return user.payload.login  === this.payload.login
                        || user.payload.email === this.payload.email;
                });

                if(found){
                    console.error('User already exists');
                    return false;
                }
            }

            case ActionTypes.USER_PUBLIC_KEY_RECEIVED: {
                if(owner.payload.role !== UserRoles.ADMIN){
                    console.error('User have not permissions');
                    return false;
                }
                /*
                    login
                    email
                    role
                    fullName
                 */

                const users = api.getUserList();

                const found = users.find(user => {
                    return user.payload.login  === this.payload.login
                            || user.payload.email === this.payload.email;
                });

                if(found){
                    console.log(found);
                    console.error('User already exists');
                    return false;
                }

            }
        }

        return true;
    }

    validate(api){

    }

    /*
     * Проверка подписи
     * owner: User
     */
    verify(owner){
        return owner.keys.verify(bufferData(this.payload), this.signature, 'utf-8', 'hex');
    }

    toData(){
        return {
            type: this.type,
            payload: this.payload,
            datetime: this.datetime,
            signature: this.signature,
            ownerPublicKey: this.ownerPublicKey
        }
    }
}

module.exports = Action;