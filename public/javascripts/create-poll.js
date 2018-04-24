$('#btn-register').on('click', function(){
    const title = $('[name="title"]').val();
    const description = $('[name="description"]').val();

    let role = 'STUDENT';

    $('[name="role"]').each((item, value) => {
        if($(value)[0].checked){
            role = $(value)[0].value;
        }
    });

    $.post('/api/polls/create', {
        title: title,
        description: description,
        role: role
    }, function (res) {
        if(!res.payload){
            if(res.error){
                return alert(res.error);
            }

            return alert('Ошибка при создании голосования');
        }

        location.href="/polls";
    });
});