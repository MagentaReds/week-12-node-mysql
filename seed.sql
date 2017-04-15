use bamazon;

insert into department(department_id, department_name, over_head_cost, total_sales)
values
  (100, "Food", 3000.00, 0),
  (200, "Electronics", 10000.00, 0),
  (205, "Outdoors and Sports", 4000.00, 0),
  (300, "Clothing", 10000.00, 0),
  (500, "Misc", 2.00, 0);

insert into product(product_name, department_id, price, stock_quantity)
values 
  ("Game Child", 200, 34.99, 10),
  ("Game Child Memory Card", 200, 10.00, 5),
  ("Kayak", 205, 340.95, 2),
  ('29\" 35lbs. Draw Composite Bow', 205, 150.45, 4),
  ("Curling Stone", 205, 19.99, 50),
  ("Bamazon T-shirt", 300, 9.95, 100),
  ("Bamazon Men's Watch", 300, 12.95, 20),
  ("Bamazon Sweatpants", 300, 8.95, 20),
  ("Bamazon Socks 4-pair", 300, 3.95, 15),
  ("Bamazon Coffee Beans 50lbs.", 100, 50.95, 200);