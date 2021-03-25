var mongoose = require("mongoose");

var user = 'admin';
var password = '1234';
var dbname = 'faceless';
var clusterName = 'cluster0.rjlwo.mongodb.net';
var URI_BDD = `mongodb+srv://${user}:${password}@${clusterName}/${dbname}`

var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(URI_BDD, options, function (err) {
  if (err) {
    console.log(`error, failed to connect to the database because --> ${err}`);
  } else {
    console.info("*** Database Faceless connection : Success ***");
  }
});

module.exports = mongoose;
