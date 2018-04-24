$('#btn-register').on('click', function(){
    var login = $('[name="login"]').val();
    var privateKey = $('[name="private_key"]').val();

    if(!privateKey || !login){
        return alert("Заполните обязательные поля");
    }

    $.post('/api/auth', {
        login: login,
        privateKey: privateKey,
    }, function (res) {
        if(res.success === true){
            location.href = '/';
        }
    });
});