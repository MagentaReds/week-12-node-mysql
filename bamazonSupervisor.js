var inquirer = require("inquirer");
var mysql = require("mysql");
var fs = require("fs");

var connection=null;
var bamazonItems=null;
var bamazonIds = null;


fs.readFile("mysql_info.json", "utf8", function(err, data){
  if(err)
    return console.log(err);

  sqlConnect(JSON.parse(data));
});

function sqlConnect(data){
  connection=mysql.createConnection(data);

  connection.connect(function(err) {
    if (err) 
      return console.log(err);
    console.log("Connected to DB");
    main();
  });
}

function disconnectDB(){
  connection.end();
  console.log("Disconnected from DB");
}


function main() {
  console.log("Do Stuff");
  disconnectDB();
}