const express = require('express')
const app = express() //wherever you see app, it means using express and express methods
const bodyParser = require('body-parser') //goes through req body
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true";
const dbName = "demo";

app.listen(8000, () => {
    MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});//connects to MongoDB

app.set('view engine', 'ejs')// what templating engine I'm going to use
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))//all client side code doesn't need individual routes, treat it as static file

app.get('/', (req, res) => {
  //console.log(db)
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
  })
})//scans through collection in our database and pushes to array
//renders in our index.ejs which loops through all of our documents

app.post('/messages', (req, res) => {
  db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})// go into db and save new document that has these properties (name, msg, thumbUP, thumbDown)
//req.body.name / req.body.msg gets value from NAME attribute in form. name="name", name="msg"
//body is property of req
//req is one of our parameters. data is being passed into parameter
//redirect back to route '/' --> triggers app.get for it to go to db and post new document

app.put('/messages', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.put('/messagesDown', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbDown:req.body.thumbDown + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})



app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})//to delete, you first need client side JS to listen to when icon is clicked on (refer to main.js)
//when API call is made, .findOneAndDelete = finds one document and deletes if it has ___ name / _____msg
