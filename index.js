const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qdveb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // await client.connect();
        const database = client.db('niche');
        const productCollection = database.collection('products')
        const userCollection = database.collection('users');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');


        // Get Products API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        });
        // Get Reviews API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        // Get Orders API
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({})
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // Get Order API for Pay
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.findOne(query);
            res.json(result);
        })

        // Get Admin User API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const user = await userCollection.findOne(filter);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // Post Product API
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.json(result)
        });

        // Post Review API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })

        // Post Order API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        // Post User API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        })

        // Put User API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })

        // Update User API
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // Update Order API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedStatus.status
                }
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })

        // Update Order Payment API
        app.put('/orders/:id/payment', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = {_id: ObjectId(id)};
            const updateDoc = {
                $set: {
                    payment: payment
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // Delete Product Api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })

        // Delete order API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })
            res.json({ clientSecret: paymentIntent.client_secret })
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Niche-Website!')
})

app.listen(port, () => {
    console.log(`listening at port:${port}`)
})