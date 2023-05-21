const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hrxywfz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    // await client.connect();
    const toyCollection = client.db('DisneyToys').collection('Toys')
    const categoryToyCollection = client.db('DisneyToys').collection('CategoryToys')

    app.post('/allToys', async (req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body)
      res.send(result)
    })
    app.get('/allToys', async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result)
    })
    app.get('/allToys/:searchText', async (req, res) => {
      try {
        const text = req.params.searchText;
        const result = await toyCollection.find({
          $or : [
            {toyName : {$regex : text, $options: "i"}}
          ]
        }).toArray();
        res.send(result)        
      } catch (error) {
        req.send(error.message)
      }
    })
    app.get('/toyDetails/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await toyCollection.findOne(query);
        res.send(result)        
      } catch (error) {
        res.send(error.message)
      }
    })
    app.get('/myToys', async (req, res) => {
      try {
        if (req.query.email) {
          const query = { email: req.query.email };
          const sort = req?.query?.sort === 'true' ? 1 : -1;
          console.log(sort);
          const result = await toyCollection.find(query).sort({ price: sort }).toArray();
          res.send(result);
        } else {
          res.send('Data not found');
        }
      } catch (error) {
        res.send(error.message);
      }
    });
    
    app.put('/myToys/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const body = req.body;
        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            price: body.price,
            quantity: body.quantity,
            description: body.description
          }
        };
        const result = await toyCollection.updateOne(query, updatedDoc);
        res.send({ result });
      } catch (error) {
        res.send(error.message);
      }
    });
    
    
    app.delete('/myToys/:id', async (req, res) => {
      try {
        const id = req.params.id; // Retrieve email from query parameters
        const query = { _id : new ObjectId(id) };
        const result = await toyCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.send(error.message)
      }
    });
    app.get('/categoryToys', async (req, res) =>{
      const result = await categoryToyCollection.find().toArray()
      res.send(result)
    })
    app.get('/categoryToyDetails/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await categoryToyCollection.findOne({_id : new ObjectId(id)});
        res.send(result);
      } catch (error) {
        res.send(error.message);
      }
    });
        
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  // catch (error) {
  //   console.log(error.message)
  // }
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello Welcome to Disney World!')
})

app.listen(port, () => {
  console.log(`Disney world server listening on port ${port}`)
})
