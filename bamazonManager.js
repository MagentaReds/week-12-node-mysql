var inquirer = require("inquirer");
var mysql = require("mysql");
var fs = require("fs");
var Table = require("cli-table");

var connection = null;
var bamazonItems = null;
var bamazonIds = null;
var bamazonDeptIds = null;

var choiceEnum = {
  viewAll: "View all products for sale",
  viewLow: "View products with low inventory (stock less than 5)",
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
      message: "Please select an action to perform",
      choices: [choiceEnum.viewAll, choiceEnum.viewLow, choiceEnum.addProduct, choiceEnum.updateInv, choiceEnum.cancel],
      default: 4
    }
  ];

    console.log("Hello");

  inquirer.prompt(question).then(function(answer){
    switch(answer.choice){
      case choiceEnum.viewAll:
        viewAll();
        disconnectDB();
        break;
      case choiceEnum.viewLow:
        viewAll(5);
        disconnectDB();
        break;
      case choiceEnum.addProduct:
        getDepartments();
        break;
      case choiceEnum.updateInv:
        viewAll(9999999, updateInv);
        break;
      case choiceEnum.cancel:
        disconnectDB();
        break;
    }

  });
}

function viewAll(inv=9999999, callback=undefined){
  var sql="SELECT * FROM product LEFT JOIN department ON product.department_id=department.department_id WHERE stock_quantity<?";
  var inserts = [inv];
  sql = mysql.format(sql, inserts);

  connection.query(sql, function(err, results, fields){
    if(err) 
      return console.log(err);

    bamazonItems=results;
    displayItems(bamazonItems);

    if(callback!=undefined)
      callback();
  });
}

function displayItems(items){
    var myTable = new Table({
    head: ["Item ID", "Dept Name", "Product Name", "Price", "Stock"],
    colWidths: [10, 25, 40, 10, 10]
  });

  for(var i=0; i<items.length; ++i){
    var ref= items[i];
    myTable.push([ref.item_id, ref.department_name, ref.product_name, ref.price, ref.stock_quantity]);
  }

  console.log(myTable.toString());
}

function disconnectDB(){
  connection.end();
  console.log("Disconnected from DB");
}

function getDepartments(){
  connection.query("SELECT department_id, department_name FROM department", function(err, results, fields){
    if(err)
      return console.log(err);

    var myTable = new Table({
      head: ["Dept ID", "Dept Name"],
      colWidths: [10, 40]
    });

    bamazonDeptIds=[];
    for(var i=0; i<results.length; ++i) {
      bamazonDeptIds.push(results[i].department_id);
      myTable.push([results[i].department_id, results[i].department_name]);
    }
    console.log(myTable.toString());
    
    addProduct();
  });
}

function addProduct(){
  var questions = [
    {
      type: "input",
      message: "Name of new product? (Enter 0 to cancel)",
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
      message: "Price of new product? (Enter 0 to cancel)",
      name: "price",
      validate: function(input){
        if(isNaN(input))
          return "You need to enter in a number";
        else if(input==="")
          return "Empty input not accepted";
        else if((Number(input)*100)%1!==0)
          return "Please enter in an valid price";
        else if(Number(input)<0)
          return "Please enter in a positive number";
        else 
          return true;
      },
      when: function(answers){
        return answers.name!=='0';
      }
    },
    {
      type: "input",
      message: "Department ID of new product? (Enter 0 to cancel)",
      name: "department",
      validate: function(input){
        if(input==='0')
          return true;
        else if(input==="")
          return "Empty input not accepted";
        else if(!bamazonDeptIds.includes(Number(input)))
          return "Department ID not found";
        else
          return true;
      },
      when: function(answers){
        return answers.name!=='0' && answers.price!=='0';
      }
    },
    {
      type: "input",
      message: "Stock of new product? (Enter 0 to cancel)",
      name: "stock",
      validate: function(input){
        if(isNaN(input))
          return "You need to enter in a number";
        else if(input==="")
          return "Empty input not accepted";
        else if(Number(input)%1!==0)
          return "Please enter in an intenger";
        else if(Number(input)<0)
          return "Please enter in a positive number";
        else 
          return true;
      },
      when: function(answers){
        return answers.name!=='0' && answers.price!=='0' && answers.department!=='0';
      }
    },
    {
      type: "confirm",
      message: "Is this correct?",
      name: "confirm",
      default: false,
       when: function(answers){
        return answers.name!=='0' && answers.price!=='0' && answers.department!=='0' && answers.stock!=='0';
      }
    }
  ];

  inquirer.prompt(questions).then(function(answers){
    if(answers.name==='0' || answers.price==='0' || answers.department==='0' || answers.stock==='0') {
      console.log("Canceling adding new product")
      disconnectDB();
      return;
    }
    else if(answers.confirm)
      return insertDB(answers);
    else
      return addProduct();
  });
}

function insertDB(val){
  var sql = "INSERT INTO product SET ?";
  var inserts={
    product_name: val.name,
    department_id: val.department,
    price: val.price,
    stock_quantity: val.stock
  };
  sql = mysql.format(sql, inserts);

  connection.query(sql, function(err){
    if(err)
      console.log(err);
    else {
      console.log("Successfully added new item");
    }

    disconnectDB();
  });

}

function updateInv(){
  //I make grab all the information about all products here
  //For future improvments, I could make a smaller request to get just the id's
  //and then just adjust the following logic since the manager might already know which id they want to update

  bamazonIds=[];
  for(var i=0; i<bamazonItems.length; ++i)
    bamazonIds.push(bamazonItems[i].item_id);


  var questions = [
    {
      name: "id",
      message: "ID of product you would like to adjust stock? (Enter 0 to cancel)",
      type: "input",
      validate: function(input) {
        if(!bamazonIds.includes(Number(input)) && input!=='0')
          return "Item ID not found";
        else 
          return true;
      }
    },
    {
      name: "quant",
      message: "Stock to add/remove? (Enter 0 to cancel)",
      type: "input",
      validate: function(input){
        if(isNaN(input))
          return "You need to enter in a number";
        else if(Number(input)%1!==0)
          return "Please enter in an intenger";
        else 
          return true;
      },
      when: function(answers){
        return answers.id!=='0';
      }
    }
  ];

  inquirer.prompt(questions).then(function(answers){
    if(answers.id==='0' || answers.stock==='0'){
      disconnectDB();
      console.log("Canceling stock update");
    }
    else {
      var index =-1;
      for(var i=0; i<bamazonItems.length; ++i)
        if(bamazonItems[i].item_id==answers.id)
         index=i;

      var new_stock=Number(bamazonItems[index].stock_quantity)+Number(answers.quant);

      if(index===-1) {
        console.log("ID not found, canceling order");
        disconnectDB();
      } else if(new_stock<0) {
        console.log("Insuffecient stock to remove amount");
        disconnectDB();
     } else {
       var str = " "+answers.quant+" from Item ID: "+answers.id
        if(Number(answers.quant)>0)
          str="Adding"+str;
        else
          str="Removing"+str;

        console.log(str);
        updateDB(answers.id, new_stock);
      }
    }
  });
}

function updateDB(id, new_stock){
  var sql = "UPDATE product SET ? WHERE ?";
  var inserts=[{"stock_quantity": new_stock}, {"item_id":id}];
  sql = mysql.format(sql, inserts);

  connection.query(sql, function(err){
    if(err)
      console.log(err);
    else {
      console.log("Successfully updated stock");
    }

    disconnectDB();
  });


}