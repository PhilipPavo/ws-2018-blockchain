const NodeRSA = require('node-rsa');
const {bufferData} = require('./Utils');
const {ActionTypes, BlockSize, UserRoles} = require('./config.js');

class User{
    constructor(keys){
        this.keys = keys || new NodeRSA({b: 512});
    }

    setKeys(publicKey, privateKey){
        if(publicKey){
            this.keys.importKey(publicKey, 'pkcs8-public');
        }

        if(privateKey){
            this.keys.importKey(privateKey, 'pkcs8-private');
        }
    }

    auth(data, privateKey){
        try{
            this.setKeys(data.payload.publicKey, privateKey);

            let signature = null;
            let d = {...data.payload};

            if(data.payload.role === UserRoles.ADMIN){
                signature = data.signature;
            }else{
                signature = data.payload.sign;
                delete d.sign;
            }

            if(signature ===  this.keys.sign(bufferData(d), 'hex')){
                console.log('Authorized successful');
                this.data = data;
                return true
            }

            return false;
        }catch (e) {
            console.error('Authorization failed')
            return false;
        }
    }
}

module.exports = User;