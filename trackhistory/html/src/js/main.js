let dataTable;

$(document).ready(function() {
    $(document).on('click', '.play_track', function(){
        let btn = $(this);
        let id = btn.closest('tr').find('input').val();
        playTrackById(id);
        clickAnim(btn);
    });

    $(document).on('click', '.play_track_youtube', function(){
        let btn = $(this);
        let url = btn.closest('tr').find('a').attr('href');
        playTrackByUrl(url);
        clickAnim(btn);
    });
    
    $(document).on('click', '.remove_history', function(){
        let btn = $(this);
        let tr = btn.closest('tr')
        let id = tr.find('td').first().text();
        deleteTrackHistoryById(id, tr);
    });

    fetchTrackHistory();
});

function baseUrl() {
    return window.location.origin ? window.location.origin + '/' : window.location.protocol + '/' + window.location.host + '/';
}

function fetchTrackHistory() {
    $.ajax({
        url: '/api/v1/bot/i/' + window.localStorage.instanceId + '/event/getTrackHistory',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + window.localStorage.token
        },
    }).done(function (response) {
        let data = response[0].data;
        renderDataTable(formatData(data));
    });
}

function playTrackById(id) {
    $.ajax({
        url: '/api/v1/bot/i/' + window.localStorage.instanceId + '/play/byId/' + id,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + window.localStorage.token
        },
    })
}

function playTrackByUrl(url) {
    $.ajax({
        url: '/api/v1/bot/i/' + window.localStorage.instanceId + '/event/playYoutubeTrack',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + window.localStorage.token
        },
        data: JSON.stringify({"youtubeUrl": url})
    })
}

function deleteTrackHistoryById(id, element) {
    $.ajax({
        url: '/api/v1/bot/i/' + window.localStorage.instanceId + '/event/deleteTrackFromHistory',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + window.localStorage.token
        },
        data: JSON.stringify({"trackId": id})
    }).done(function () {
        dataTable.row(element).remove().draw();
    });
}

function formatData(data) {
    let formattedData = [];

    data.forEach(element => {
        let trackHistoryId = element[0].match(/track_history_(\d+)$/)[1];
        let trackHistoryInfo = JSON.parse(element[1]);
        let local = trackHistoryInfo.type === 'local';
        trackHistoryInfo.historyId = local ? trackHistoryId + '<input type="hidden" value="' + trackHistoryInfo.id + '">' : trackHistoryId;
        trackHistoryInfo.type = local ? '<i class="fas fa-server" title="Local"></i> Local' : '<a href="'+trackHistoryInfo.url+'" target="_blank"><i class="fab fa-youtube" title="YouTube" style="color: red;"></i> YouTube</a>';

        trackHistoryInfo.date = timeConverter(trackHistoryInfo.timestamp);
        trackHistoryInfo.actions = `
            <i class="fas fa-play ` + (local ? 'play_track' : 'play_track_youtube') + `" title="Play Track"></i>
            <i class="fas fa-trash remove_history" title="Remove from history"></i>
        `;

        formattedData.push(trackHistoryInfo);
    });

    return formattedData;
}

function renderDataTable(data) {
    dataTable = $('#trackHistoryTable').DataTable( {
        data: data,
        columns: [
            { data: 'historyId' },
            { data: 'title' },
            { data: 'artist' },
            { data: 'date' },
            { data: 'type' },
            { data: 'actions' }
        ],
        order: [[ 0, "desc" ]]
    } );
}

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours() < 10 ? "0" + a.getHours() : a.getHours();
    var min = a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes();
    var sec = a.getSeconds() < 10 ? "0" + a.getSeconds() : a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

function clickAnim(element, fade = true) {
    element.css('color', '#03cb03');

    if (fade) {
        setTimeout(function() {
            element.css({
                transition : 'color 3s ease-in-out',
                "color": "white"
            });
        }, 1000)
    }
}