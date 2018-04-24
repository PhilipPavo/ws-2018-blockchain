const bufferData = (data) =>{
    return new Buffer(JSON.stringify(data));
};

module.exports = {
    bufferData
};