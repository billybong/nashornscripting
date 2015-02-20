load('http.js');

var data = http().get('https://itunes.apple.com/search?term=metallica').data;
var json = JSON.parse(data);

print(json.resultCount + " results");
json.results.forEach(function (result){
    print(result.trackName);
});