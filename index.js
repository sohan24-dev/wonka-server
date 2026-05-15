const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const express = require('express')
const cors = require('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
require('dotenv').config()
const app = express()
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const jwks = createRemoteJWKSet(
    new URL(process.env.BASE_URL + "/api/auth/jwks")
)

const verifytoken = async (req, res, next) => {
    const headerss = req?.headers?.authorization;
    if (!headerss) {
        return res.status(401).json({
            massage: "Unauthorized"
        })
    }
    const token = headerss.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            massage: "Unauthorized"
        })
    }
    try {
        const { payload } = await jwtVerify(token, jwks)
        console.log(payload);
        next()
    } catch (error) {
        return res.status(403).json({
            massage: "Forbidden"
        })
    }

}


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
        app.get('/data/:id', verifytoken, async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const cursor = await data.findOne({ _id: new ObjectId(id) })
            res.send(cursor)
        })

        app.post('/orderlist', verifytoken, async (req, res) => {
            const doc = req.body;
            const result = await orderlist.insertOne(doc)
            res.send(result)
        })
        app.get('/orderlist', async (req, res) => {
            const cursor = await orderlist.find()
            const allValues = await cursor.toArray();
            res.send(allValues)
        })
        app.get('/orderlist/:id', verifytoken, async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const cursor = await orderlist.findOne({ _id: new ObjectId(id) })
            res.send(cursor)
        })
        app.delete('/orderlist/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const cursor = await orderlist.deleteOne(query)
            // console.log(cursor);
            res.send(cursor)
        })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
