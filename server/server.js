var app = require('./server-config.js');

app.set('port', process.env.PORT || 8000);

var server = app.listen(app.get('port'), function(){
  console.log('Server listening on port', server.address().port);
});