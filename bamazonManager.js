var inquirer = require("inquirer");
var mysql = require("mysql");
var fs = require("fs");

var connection=null;
var bamazonItems=null;

var choiceEnum = {
  viewAll: "View all products for sale",
  viewLow: "View products with low inventory (<5)",
  addProduct: "Enter in a new product",
  updateInv: "Add inventory to a product",
  cancel: "Exit the app"
};


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

function main() {
  var question = [
    {
      name: "choice",
      type: "list",
      choices: [choiceEnum.viewAll, choiceEnum.viewLow, choiceEnum.addProduct, choiceEnum.updateInv, choiceEnum.exit],
      default: choiceEnum.exit
    }
  ];

  inquirer.prompt(question).done(function(answer){
    switch(answer.choice){
      case choiceEnum.viewAll:
        break;
      case choiceEnum.viewLow:
        break;
      case choiceEnum.addProudct:
        break;
      case choiceEnum.updateInv:
        break;
      case choiceEnum.exit:
        break;
    }
  });
}