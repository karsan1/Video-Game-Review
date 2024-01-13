const http = require("http");
const path = require("path");
const express = require("express");
const app = express(); 
const fetch = require("node-fetch");
const bodyParser = require("body-parser"); 
const portNumber = 5001
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env')})  
process.stdin.setEncoding("utf8");

const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: "CMSC335_DB", collection: "videoGames"};
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${username}:${password}@cluster0.frd6d3y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'templates')))
let reviewCards = {reviews : ""}

app.get("/", async (req, res) => {
  try{
    await client.connect()
  } catch (e){
    console.error(e)
  }
  res.render("form")
})

app.post("/submitReview", async (req, res) => {
  let {name, bio, game, console, rating, review} = req.body
  let r = {name : name, bio : bio, game : game, console : console, rating: rating, review: review}
  try {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(r)
    res.render("thanks")
}
catch (e) {
    console.error(e);
} 
})

app.get("/reviews", async (req, res) => {
  const cursor = client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find()
  let result = (await cursor.toArray());
  if (result != undefined){
    let cards = ""
    result.forEach(review => { cards = cards +
      `<div class="review-card">
        <div class="rating">${review.rating}</div>
        <h2>${review.game}</h2>
        <h3>By: ${review.name}</h3>
        <small>${review.console}</small>
        <p>${review.review}</p>
        <small>${review.name}'s Bio: ${review.bio}</small>
      </div>`
  });
    reviewCards.reviews = cards
  }

  res.render("reviews", reviewCards)
})

app.get("/pokemon", async(req, res) => {
  res.render("pokemon")
})

app.post("/getPokemon", async(req, res) => {
  let {name} = req.body
  name1 = name.toLowerCase()
  try{
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name1}`)
    const pokemon = await response.json()
    info = `${name} is of type(s) ${pokemon.types[0]["type"]["name"]}`
    if (pokemon.types[1] != undefined){
      info = info + ` and ${pokemon.types[1]["type"]["name"]}`
    }
    res.render("showPokemon", {pokemonInfo : info})
  } catch(e){
    res.render("showPokemon", {pokemonInfo : "Pokemon not found"})
  }
})


app.listen(portNumber);
console.log(`Web server started running at http://localhost:${portNumber}`);