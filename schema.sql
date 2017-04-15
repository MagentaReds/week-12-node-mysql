create database bamazon;

use bamazon;

create table department(
  department_id integer not null,
  department_name varchar(50),
  over_head_cost decimal(10,2),
  total_sales decimal(10,2),
  primary key(department_id)
);

create table product(
  item_id integer not null auto_increment,
  product_name varchar(50),
  department_id integer not null,
  price decimal(10,2),
  stock_quantity integer,
  primary key(item_id),
  foreign key (department_id) REFERENCES department(department_id)
);
