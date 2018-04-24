$('#btn-agree').on('click', function(){
    const pollId = $('[name="pollId"]').val();

    $.post('/api/polls/vote', {
        pollId: pollId,
        agree: true
    }, function (res) {
        if(!res.payload){
            if(res.error){
                return alert(res.error);
            }

            return alert('Ошибка голосовании');
        }

        location.href="/polls/" + pollId;
    });
});

$('#btn-disagree').on('click', function(){
    const pollId = $('[name="pollId"]').val();

    $.post('/api/polls/vote', {
        pollId: pollId
    }, function (res) {
        if(!res.payload){
            if(res.error){
                return alert(res.error);
            }

            return alert('Ошибка голосовании');
        }

        location.href="/polls/" + pollId;
    });
});
