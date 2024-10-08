const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrdje6l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Send a ping to confirm a successful connection
    const productsCollection = client
      .db("shoppingPortal")
      .collection("products");

    app.get("/products", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const brandName = req.query.brand;
      const priceValue = req.query.price;
      const dateValue = req.query.date;
      const searchValue = req.query.search;
      const categoryName = req.query.category;
      const minPrice = parseFloat(req.query.min);
      const maxPrice = parseFloat(req.query.max);
      let query = {};
      let options = {};

      if (searchValue) {
        query.productName = { $regex: searchValue, $options: "i" };
      }

      if (brandName) query.brand = brandName;
      if (categoryName) query.category = categoryName;
      if (maxPrice && minPrice) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      }
      if (priceValue)
        options = {
          sort: { price: priceValue === "lowToHigh" ? 1 : -1 },
        };

      if (dateValue)
        options = { sort: { createdAt: dateValue == "new" ? -1 : 1 } };

      const result = await productsCollection
        .find(query, options)
        .limit(size)
        .skip(page * size)
        .toArray();
      res.send(result);
    });

    app.get("/products-count", async (req, res) => {
      const brandName = req.query.brand;
      const categoryName = req.query.category;
      const searchValue = req.query.search;
      const minPrice = parseFloat(req.query.min);
      const maxPrice = parseFloat(req.query.max);
      let query = { productName: { $regex: searchValue, $options: "i" } };

      if (brandName) query.brand = brandName;
      if (categoryName) query.category = categoryName;
      if (minPrice && maxPrice)
        query.price = { $gte: minPrice, $lte: maxPrice };

      const count = await productsCollection.countDocuments(query);
      res.send({ count });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Shopping portal");
});

app.listen(port, () => {
  console.log(`Shopping portal app listening on port ${port}`);
});
