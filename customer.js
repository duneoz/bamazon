// require mysql and inquirer
var mysql = require("mysql");
var inquirer = require("inquirer");

// declare runningTotal variable
var runningTotal = 0;

// declare a connection variable for mysql
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Omaha198*",
    database: "Bamazon"
});


// declare the go shopping variable as a function
var goShopping = function () {

    // query the products table in the bamazon db
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        console.log("Please buy something. I need to feed my family:");

        // log each item in the table for the customer to see
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price.toFixed(2));
        }

        // ask the user what item and how many of it they want
        inquirer.prompt([
            {
                type: "input",
                name: "itemId",
                message: "Enter the ID number of the product you'd like to buy:",
                validate: function (value) {
                    if (isNaN(value) === false && value > 0 && value < res.length + 1) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            {
                type: "input",
                name: "quantityDemanded",
                message: "How many do you want?",
                validate: function (value) {
                    if (isNaN(value) === false && value > 0) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },

            // then run this to check if we got enough in stock
        ]).then(function (answers) {
            var itemId = answers.itemId;
            var quantityDemanded = answers.quantityDemanded;

            // check product availability
            if (quantityDemanded > res[itemId - 1].stock_quantity) {
                console.log("Insufficient quantity! Only " + res[itemId - 1].stock_quantity + " left!");

                // allow the user to try to submit a purchase
                inquirer.prompt([
                    {
                        type: "confirm",
                        name: "confirm",
                        message: "Would you like to try and make another purchase? Please, my family.."
                    }
                ]).then(function (answers) {
                    if (answers.confirm) {
                        goShopping();
                    }
                });
            } else {
                // if there is enough in stock, reduce the inventory in the database
                connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?", [quantityDemanded, itemId], function (err, res) { });

                // log purchase total and running total
                console.log("Your purchase total is $" + (res[itemId - 1].price * quantityDemanded).toFixed(2));

                runningTotal = runningTotal + (res[itemId - 1].price * quantityDemanded);

                console.log("Your running total is $" + runningTotal.toFixed(2));

                // ask them to buy more stuff
                inquirer.prompt([
                    {
                        type: "confirm",
                        name: "confirm",
                        message: "Would you like to make another purchase? Please, my family.."
                    }
                ]).then(function (answers) {
                    if (answers.confirm) {
                        shopInit();
                    }
                });
            }
        });
    });
};

// run the program
goShopping();