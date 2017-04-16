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

function main(){
  var choices = ["View Product Sales by Department", "Create New Department", "Exit"];
  var questions = [
    {
      type: "list",
      name: "choice",
      choices: choices,
      default: 2,
      message: "Select an action to perform"
    }
  ];

  inquirer.prompt(questions).then(function(answers){
    switch(answers.choice){
      case "View Product Sales by Department":
        getDepartments(disconnectDB);
        break;
      case "Create New Department":
        getDepartments(createDepartment);
        break;
      case "Exit":
        disconnectDB();
        break;
    }
  });
}

function getDepartments(callback=null) {
  var sql = "SELECT department_id, department_name, over_head_cost, total_sales, SUM(total_sales-over_head_cost) AS profit" 
    +" FROM department"
    +" GROUP BY department_id;";
  //console.log(sql);

  connection.query(sql, function(err, results, fields){
    if(err)
      return console.log(err);
    
    bamazonDepts=results;
    //console.log(results);
    displayDepartments(bamazonDepts, callback);
  });

}

function displayDepartments(array, callback=null) {
  var myTable = new Table({
    head: ["Dept ID", "Dept Name", "Overhead", "Sales", "Profit"],
    colWidths: [11, 25, 10, 20, 20]
  });

  bamazonDeptIds=[];
  for(var i=0; i<array.length; ++i){
    var ref= array[i];
    myTable.push([ref.department_id, ref.department_name, ref.over_head_cost, ref.total_sales, ref.profit]);
    bamazonDeptIds.push(ref.department_id);
  }

  console.log(myTable.toString());

  if(callback)
    callback();
}

function createDepartment(){
   var questions = [
    {
      type: "input",
      message: "Name of Department? (Enter 0 to cancel)",
      name: "name",
      validate: function(input){
        if(input.length>50)
          return "Name is too long."
        else if(input==="")
          return "Empty input not accepted";
        return true;
      }
    },
    {
      type: "input",
      message: "ID of department? (Enter 0 to cancel)",
      name: "id",
      validate: function(input){
        if(isNaN(input))
          return "You need to enter in a number";
        else if(input==="")
          return "Empty input not accepted";
        else if((Number(input))%1!==0)
          return "Please enter in an integer";
        else if(Number(input)<0)
          return "Please enter in a positive number";
        else if(bamazonDeptIds.includes(Number(input)))
          return "Department ID taken already"
        else
          return true;
      },
      when: function(answers){
        return answers.name!=='0';
      }
    },
    {
      type: "input",
      message: "Overhead costs of department? (Enter 0 to cancel)",
      name: "overhead",
      validate: function(input){
        if(isNaN(input))
          return "You need to enter in a number";
        else if(input==="")
          return "Empty input not accepted";
        else if((Number(input)*100)%1!==0)
          return "Please enter in an valid money amount";
        else if(Number(input)<0)
          return "Please enter in a positive number";
        else 
          return true;
      },
      when: function(answers){
        return answers.name!=='0' && answers.id!=='0';
      }
    },
    {
      type: "confirm",
      message: "Is this correct?",
      name: "confirm",
      default: false,
       when: function(answers){
        return answers.name!=='0' && answers.id!=='0' && answers.overhead!=='0';
      }
    }
  ];

  inquirer.prompt(questions).then(function(answers){
    if(answers.name==='0' || answers.id==='0' || answers.overhead==='0') {
      console.log("Canceling adding new department")
      disconnectDB();
      return;
    }
    else if(answers.confirm)
      return sqlNewDepartment(answers.id, answers.name, answers.overhead);
    else
      return createDepartment();
  });
}

function sqlNewDepartment(id, name, overhead, sales=0){
  var sql = "INSERT INTO department SET ?";
  var inserts = [{
    "department_id":id,
    "department_name": name,
    "over_head_cost": overhead,
    "total_sales": sales
  }];
  sql = mysql.format(sql, inserts);
  //console.log(sql);

  connection.query(sql, function(err){
    if(err) {
      if(err.code==="ER_DUP_ENTRY") {
        console.log("Department ID is alredy taken");
        createDepartment();
        return;
      }
      else {
        console.log(err);
        disconnectDB();
        return;
      }
    }

    console.log("Department successfully added");
    disconnectDB();
  });
}