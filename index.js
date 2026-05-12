const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const PORT = process.env.SERVER_PORT;


app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("userData");
        const data = database.collection("itemsData");
        const orderlist = database.collection("orderlist")

        app.get('/data', async (req, res) => {
            const cursor = await data.find()
            const allValues = await cursor.toArray();
            res.send(allValues)
        })
        app.get('/data/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const cursor = await data.findOne({ _id: new ObjectId(id) })
            res.send(cursor)
        })

        app.post('/orderlist', async (req, res) => {
            const doc = req.body;
            const result = await orderlist.insertOne(doc)
            res.send(result)
        })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
