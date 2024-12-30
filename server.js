const express = require('express');
const exphbs = require('express-handlebars');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// Set up Handlebars as the view engine
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));// views directory 

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection string
const uri = "mongodb+srv://george_tsang:At00las%24@mongodbatlas-gua4x.mongodb.net/mongodatabase?retryWrites=true";

// Connect to MongoDB and start the server
MongoClient.connect(uri)
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db('mongodatabase');
    const shopCollection = db.collection('shop');

    // Home route to display products
    app.get('/', (req, res) => {
      shopCollection.find().toArray()
        .then(products => {
          res.render('home', { products });
        })
        .catch(err => {
          console.error('Error fetching products:', err);
          res.status(500).send('Error fetching products');
        });
    });

    app.post('/order', (req, res) => {
        const orders = req.body; // Get the order data from the request
      
        // curried function to add two numbers
        const sum = (a) => {
          return (b) => {
            return a + b; //the sum of a and b
          };
        };
      
        // Fetch products from the database
        shopCollection.find().toArray()
          .then(products => {
            // Initialize total items and total amount
            let totalItems = 0;
            let totalAmount = 0;
      
            // Loop through each product to calculate totals
            products.forEach((product, index) => {
              // Get the quantity from the orders 
              const quantity = parseInt(orders[`quantity${index}`] || 0);
      
              // Use the curried sum function to update totals
              totalItems = sum(totalItems)(quantity); // Update total items
              totalAmount = sum(totalAmount)(quantity * product.price); // Update total amount
            });
      
            // Render the order page with the calculated totals
            res.render('order', { totalItems, totalAmount });
          })
          .catch(err => {
            // Handle any errors that occur during the process
            console.error('Error processing order:', err);
            res.status(500).send('Error processing order');
          });
      });
      

    // Start the server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });