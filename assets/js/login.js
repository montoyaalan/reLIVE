$(document).ready(function() {
    // SPOTIFY API
    // Get the hash of the url
    const hash = window.location.hash
      .substring(1)
      .split("&")
      .reduce(function(initial, item) {
        if (item) {
          var parts = item.split("=");
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});
    window.location.hash = "";
  
    // Set token
    let _token = hash.access_token;
  
    const authEndpoint = "https://accounts.spotify.com/authorize";
  
    // Replace with your app's client ID, redirect URI and desired scopes
    const clientId = "abf37ff11aff48afb9ba75f4debfc293";
    const redirectUri = "https://reliveapp.github.io/project1/search.html";
    // const redirectUri = "https://relive-project1.herokuapp.com/search.html";
  
    const scopes = ["playlist-modify-private"];
  
    // If there is no token, redirect to Spotify authorization
    if (!_token) {
      $("#login").on("click", function(event) {
        event.preventDefault;
        window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
          "%20"
        )}&response_type=token&show_dialog=true`;
      });
    }
  });
  