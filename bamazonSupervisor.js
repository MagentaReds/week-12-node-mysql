var inquirer = require("inquirer");
var mysql = require("mysql");
var fs = require("fs");
var Table = require("cli-table");

var connection=null;

var bamazonDepts=null;
var bamazonDeptIds=null;


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
  var sql = "SELECT department_id, department_name, over_head_cost, total_sales, SUM(total_sales-over_head_cost) AS profit" 
    +" FROM department"
    +" GROUP BY department_id;";
  //console.log(sql);

  connection.query(sql, function(err, results, fields){
    if(err)
      return console.log(err);
    
    bamazonDepts=results;
    //console.log(results);
    displayDepartments(bamazonDepts);

  });

}

function displayDepartments(array) {
  var myTable = new Table({
    head: ["Dept ID", "Dept Name", "Overhead", "Sales", "Profit"],
    colWidths: [11, 25, 10, 20, 20]
  });

  for(var i=0; i<array.length; ++i){
    var ref= array[i];
    myTable.push([ref.department_id, ref.department_name, ref.over_head_cost, ref.total_sales, ref.profit]);
  }

  console.log(myTable.toString());

}