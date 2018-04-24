$('#btn-register').on('click', function(){
    const login = $('[name="login"]').val();
    const fullName = $('[name="fullName"]').val();

    let role = 'STUDENT';

     $('[name="role"]').each((item, value) => {
        if($(value)[0].checked){
            role = $(value)[0].value;
        }
    });

    $.post('/api/registerUser', {
        login: login,
        fullName: fullName,
        role: role
    }, function (res) {
        if(!res.anonymous || !res.open){
            if(res.error){
                return alert(res.error);
            }

            return alert('Ошибка при регистрации пользователя');
        }

        $('#registeredBlock').show();

        if(res.open){
            $('#openKeysPublic').text(res.open.action.payload.publicKey);
            $('#openKeysPrivate').text(res.open.key);
        }

        if(res.anonymous){
            $('#anonymousKeysPublic').text(res.anonymous.action.payload.login);
            $('#anonymousKeysPrivate').text(res.anonymous.key);
        }

        $('#btn-register').hide();

    });
});