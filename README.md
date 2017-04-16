# week-12-node-mysql

For all the challenges/apps, I could have made them more user friendly (such as asking the customer if they would like to make a purchase instead of immediately exiting the program), but I decided to make these apps act more like api route/calls in their functionality.  Forcing you to rerun (call again) to access their functions.

That being said, I am using inquirer and cli-table for some cli formatting and ease of use.

Another shortcoming in my, my sql calls to access the database are only updated once at the start of the program, so the app could be accessing old data.  Doing it this way might cause some issues if this was in a real store with lots of concurrent sql connections and customer orders.  Then again, the server is really the only one that is going to be accessing the database and this is just practice.

### Note for mysql_info.json
This file holds the connection info for your mysql connection.  This file is then read by each app when run.

sample_mysql_info.json is included as a sample file for the format used.

### Notes for schema.sql and seeds.sql

These files include the sql queries that settup a sample database/tables and mock items to test the code.

## bamazonCustomer.js

This app gets and displays a list of all items availabe for purchase.  The user then enter's in a item_id they'd like to order.  And then a quantity to order.  If the user enter's in 0 for either value, the app cancels the order and exits.

Otherwise it then checks to see if there is sufficient stock and either order's the amount, and removes that amount from the stock in the database.  And for challeng 3, it also update's the department's total_sales.

## bamazonManager.js

This app displays a list of actions for the manager.  View all items, and view all items with less than 5 stock do what they say. 

Selecting adjust stock quantities allows the manager to add/remove stock for an item.  The app display's all the items for sale, then asks for an item_id and amount to adjust from the user.  It then updates the sql database and exits.

Selecting add new item asks the user a series of questions about the new product to add, validating each input along the way.

## bamazonSupervisor.js

View Product Sales by Department displays all departs and the profit for the departments.

Create New Department displays all departments and asks the user for information about the new department, validating input along the way.