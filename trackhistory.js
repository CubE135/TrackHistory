registerPlugin({
    name: 'TrackHistory',
    version: '1.0',
    backends: ['ts3'],
    description: 'TrackHistory',
    author: 'CubE135',
    enableWeb: true
}, (_, config) => {
	var engine = require('engine');
	var event = require('event');
	var audio = require('audio');
	var backend = require('backend');
	var media = require('media');
  let store = require('store');
  
  event.on('track', function(track) {
    let trackInfo = new TrackInfo(track);
    let track_history_number = getMostRecentEntryNumber(store.getAll());
    
    store.set('track_history_' + track_history_number, trackInfo.toJson());
  });

  event.on('api:getTrackHistory', ev => {
    let history = store.getAll();

    return {
      success: true,
      data: Object.entries(history)
    };
  });

  event.on('api:deleteTrackHistory', ev => {
    let amount = unsetAllEntries();

    return {
      success: true,
      data: amount
    };
  });

  event.on('api:deleteTrackFromHistory', ev => {
    let key = 'track_history_' + ev.data().trackId;
    store.unset(key);

    return {
      success: true,
      data: key
    };
  });

  event.on('api:playYoutubeTrack', ev => {
    let url = ev.data().youtubeUrl;
    media.yt(url);

    return {
      success: true,
      data: ev.data().youtubeUrl
    };
  });
  
  function getMostRecentEntryNumber(entries) {
    let keys = Object.keys(entries);
    let amount = keys.length;
    if (amount < 1) {
      return 1;
    } else {
      let numbers = [];
    
      let regex = /_(\d+)$/;
      keys.forEach((key) => {
          let number = parseInt(key.match(regex)[1]);
          numbers.push(number);
      })
      
      let sorted = numbers.sort(function(a, b) {
        return b - a;
      });
    
      return sorted[0] + 1;
    }
  }
  
  function unsetAllEntries() {
    let all = store.getAll()
    
    let counter = 0;
    Object.keys(all).forEach((key) => {
      store.unset(key);
      counter++;
    })

    return counter;
  }
  
  class TrackInfo {
    constructor(track) {
      this.id = track.id();
      this.title = track.title() != '' ? track.title() : track.filename();
      this.artist = track.artist();
      this.url = track.filename() ? track.filename() : track.sourceURL();
      this.type = this.id ? 'local' : 'youtube';
      this.timestamp = Date.now();
    }
    
    toJson() {
      return JSON.stringify(this);
    }
  }
})