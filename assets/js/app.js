3//HTML loading before JS
$(document).ready(function() {
    console.log("ready!");
  
    // global variables
    var user = "";
    var songs = [];
  
    //THESE ARE HELPER FUNCTIONS TO BREAK DOWN THE URL AND SAVE THE ACCESS TOKEN
    function getParameterByName(name) {
      var match = RegExp("[#&]" + name + "=([^&]*)").exec(window.location.hash);
      return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    }
  
    //Setting the access token to setup spotifyAPI to extend usage
    function getAccessToken() {
      return getParameterByName("access_token");
    }
    //Storing access token locally in browser
    var access_token = getAccessToken();
    localStorage.setItem("access_token", access_token);
  
    //Get Spotify username of user
    var url = "https://api.spotify.com/v1/me/";
    $.ajax(url, {
      dataType: "json",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token")
      },
      success: function(data) {
        console.log("pulled username response", data);
        user = data;
      },
      error: function(error) {
        console.log(error);
        return error;
      }
    });
  
    // making playlist with Spotify ajax call
    function makePlaylist(access_token, user, songs) {
      var urlString = "https://api.spotify.com/v1/users/" + user.id + "/playlists";
  
      var jsonData = {
        name: "My SetlistFM Playlist",
        public: false
      };
  
      $.ajax({
        type: "POST",
        url: urlString,
        data: JSON.stringify(jsonData),
        dataType: "json",
        headers: {
          Authorization: "Bearer " + access_token
        },
        contentType: "application/json",
        success: function(result) {
          console.log("created playlist");
          
          var spotifyPlaylistId = result.id 
          var urlStringForPlaylist = 'https://api.spotify.com/v1/playlists/' + spotifyPlaylistId + '/tracks?uris=' + songs.join()
          $.ajax({
            type: "POST",
            url: urlStringForPlaylist,
            data: JSON.stringify(jsonData),
            dataType: "json",
            headers: {
              Authorization: "Bearer " + access_token
            },
            successs: function(result) {
              console.log("songs were added holy shit!!!")
            },
            error: function(error) {
              console.log(error);
              console.log("this ERROR happened in making playlist");
            },
            error: function(error) {
              console.log(error);
              console.log("this ERROR happened in adding songs to playlist");
            }
          }); // this closes second ajax call to add songs to playlist
        }, // this closes the success for 1st ajax call 
      }); // this closes first ajax call to create playlist
    }
  
  
    $("#submitPress").on("click", function(event) {
      event.preventDefault();
      var artistName = $("#user-input").val();
      searchSetlistFM(artistName);
    });
  
    // Second AJAX request to SetlistFM to search by artist.mbidand return setlist
    function searchMBID(mbid) {
      // CORS-anywhere hack - we're doing this instead of creating a server
      var originalURL =
        "https://api.setlist.fm/rest/1.0/search/setlists?artistMbid=" +
        mbid.replace(/\"/g, "") +
        "&p=1";
      var queryURL = "https://cors-anywhere.herokuapp.com/" + originalURL;
      $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "json",
        // this headers section is necessary for CORS-anywhere
        headers: {
          "x-requested-with": "xhr",
          "x-api-key": "6d1b43e2-d601-4dee-91e1-9889e57516f7"
        }
      }).done(function(response) {
        artistSetlists = response.setlist;
        console.log(artistSetlists);
        // Got the artist, then looped over the setlists and store arrays with the songs
        artistSetlists.map(function(val, i) {
          // now we are in the loop, and we are accessing setlists
  
          // we are creating an empty array per setlist in var songs 
          // this is so we can push the songs from an individual setlist into its own array
          songs.push([]);
  
          var result = val.sets.set.map(function(set) {
            // we are looping over the songs in a setlist and pushing the song name
            // into the correct var songs array e.g. songs[i]
            set.song.map(function(song, x){
              songs[i].push(song.name);
            })
          });
  
          console.log(songs);       
  
          // This is displaying the setlist info on the page
          var dateText = $("<p>").html(artistSetlists[i].eventDate);
          var citystateText = $("<p>").html(
            artistSetlists[i].venue.city.state +
              ", " +
              artistSetlists[i].venue.city.name
          );
  
          var button = $(
            `<button id="view-button" data-url=${
              artistSetlists[i].url
            }>View</button>`
          );
  
          // ship arrays off depending on what the user clicked and created the playlist and then added the songs to that playlist
          var createPlaylistButton = $('<button/>', {
            text: 'Create Playlist',
            id: 'button-' + i,
            click: function() { 
              var b;
              var spotifyTracksArray = [];
  
              // for each song name get spotifySongUrl
              for (b = 0; b < songs[i].length; ++b) {
                $.ajax({
                  type: "GET",
                  url: "https://api.spotify.com/v1/search?type=track&query=" + songs[i][b] + ' ' + $("#user-input").val(),
                  dataType: "json",
                  headers: {
                    Authorization: "Bearer " + access_token
                  },
                  contentType: "application/json",
                  success: function(result) {
                    spotifyTracksArray.push(result.tracks.items[0].uri)
                  },
                  error: function(error) {
                    console.log(error);
                    console.log("Error");
                  }
                });
              }
              makePlaylist(access_token, user, spotifyTracksArray);
            },
            'data-songs': songs[i]
          });
  
          // appends setlist info on page
          $("#setlist-results").append(dateText, citystateText, button, createPlaylistButton);
        });
  
        // Click on View button below setlist - opens tab with setlistFM link of setlist
        $(document).on("click", "#view-button", function(event) {
          event.preventDefault();
          var link = $(this).attr("data-url");
          console.log(this);
          console.log("view button was clicked");
          window.open(link, "_blank");
        });
      });
    }
  
    // First AJAX request to SetlistFM with artist name and return artist.mbid
    function searchSetlistFM(artistName) {
    // CORS-anywhere hack - we're doing this instead of creating a server
      var originalURL =
        "https://api.setlist.fm/rest/1.0/search/artists?artistName=" +
        artistName +
        "&p=1&sort=relevance";
      var queryURL = "https://cors-anywhere.herokuapp.com/" + originalURL;
  
      $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "json",
        // this headers section is necessary for CORS-anywhere
        headers: {
          "x-requested-with": "xhr",
          "x-api-key": "6d1b43e2-d601-4dee-91e1-9889e57516f7"
        }
      }).done(function(response) {
        var artistMBID = JSON.stringify(response.artist[0].mbid);
  
        // This function does the setlist lookup and performs HTML front-end stuff
        searchMBID(artistMBID);
      }).fail(function(jqXHR, textStatus) {
        console.error(textStatus);
      });
    }
  });
  
  