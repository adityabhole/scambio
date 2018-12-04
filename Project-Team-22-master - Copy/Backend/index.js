//import the require dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var MongoClient = require('mongodb').MongoClient;
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
app.set('view engine', 'ejs');

var Schema = mongoose.Schema;
ObjectId = mongoose.Types.ObjectId;

// Schemas
// Item schema
var itemSchema = new Schema({
  Name: String,
  ItemDesciption : String,
  ItemCondition : String,
  Category : String,
  UserID : ObjectId,
  ImageURL : String
  }, {collection : 'Items'});

//user schema
var userSchema = new Schema({
  Fname: String,
  Lname : String,
  Password : String,
  EmailAddress : String,
  Items : [{type: Schema.Types.ObjectId, ref: 'ItemsModule'}],
  ImageURLs : [String],
  PairedWith: [{type: Schema.Types.ObjectId, ref: 'ItemsModule'}], 
  MatchedWith : [{type: Schema.Types.ObjectId, ref: 'ItemsModule'}]
}, {collection : 'Users'});

//Mongoose models
var itemData = mongoose.model('ItemsModule',itemSchema);
var userData = mongoose.model('UsersModule',userSchema);

//Mongo URI
mongoose.connect("mongodb://admin:H0la!@13.57.234.163/Scambio?authSource=admin");
const mongoURI = 'mongodb://admin:H0la!@13.57.234.163/Scambio?authSource=admin';

//CReate mongo connection
const conn = mongoose.createConnection(mongoURI);

//Init gfs
let gfs;

conn.once('open',()=> {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

//Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads' //bucket name should match the collection name
          };
          resolve(fileInfo);
        });
      });
    }
  });
  
  const upload = multer({ storage });


//use cors to allow cross origin resource sharing
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

//use express session to maintain session data
app.use(session({
    secret: 'cmpe273_kafka_passport_mongo',
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration: 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration: 5 * 60 * 1000
}));

// app.use(bodyParser.urlencoded({
//     extended: true
//   }));
app.use(bodyParser.json());

//Allow Access Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

var Users = [{
    username: "admin",
    password: "admin"
}]

var books = [
    { "BookID": "1", "Title": "Book 1", "Author": "Author 1" },
    { "BookID": "2", "Title": "Book 2", "Author": "Author 2" },
    { "BookID": "3", "Title": "Book 3", "Author": "Author 3" }
]

var junks = [
    {  "JunkID":"1", "Title": "First Junk", "Description": "Lorem Ipsum", "ImgUrl": "https://images-na.ssl-images-amazon.com/images/I/61IgIqKfWTL.jpg", "condition": "fairly-used"  },
    {  "JunkID":"2", "Title": "Second Junk", "Description": "Lorem Ipsum", "ImgUrl":  "https://cdn.shopify.com/s/files/1/1755/5355/products/mock-10-2122-14213D-nh-ns-111802514472174936291489614087-3_1800x.png", "condition": "fairly-used"  },
    {  "JunkID":"3", "Title": "Third Junk", "Description": "Lorem Ipsum", "ImgUrl": "http://bobs.net/images/products/t-shirts/mens/badge/Bobs-Big-Boy-Badge-Shirt-Use.jpg", "condition": "fairly-used"  },
    {  "JunkID":"4", "Title": "Forth Junk", "Description": "Lorem Ipsum", "ImgUrl": "https://cdn.shopify.com/s/files/1/1755/5355/products/mock-10-2122-14213D-nh-ns-111802514472174936291489614087-3_1800x.png", "condition": "fairly-used"  },
    {  "JunkID":"5", "Title": "Fifth Junk", "Description": "Lorem Ipsum", "ImgUrl": "https://images-na.ssl-images-amazon.com/images/I/61IgIqKfWTL.jpg", "condition": "fairly-used"  },
    {  "JunkID":"6", "Title": "Sixth Junk", "Description": "Lorem Ipsum", "ImgUrl": "http://bobs.net/images/products/t-shirts/mens/badge/Bobs-Big-Boy-Badge-Shirt-Use.jpg", "condition": "fairly-used"  },
    {  "JunkID":"7", "Title": "Seventh Junk", "Description": "Lorem Ipsum", "ImgUrl":"https://cdn.shopify.com/s/files/1/1755/5355/products/mock-10-2122-14213D-nh-ns-111802514472174936291489614087-3_1800x.png", "condition": "fairly-used"  },
    {  "JunkID":"8", "Title": "Sixth Junk", "Description": "Lorem Ipsum", "ImgUrl": "http://bobs.net/images/products/t-shirts/mens/badge/Bobs-Big-Boy-Badge-Shirt-Use.jpg", "condition": "fairly-used"  }
]

var matches = [
    {
        "Name" : "one",
        "ImageURL": "https://images-na.ssl-images-amazon.com/images/I/61IgIqKfWTL.jpg",
        "MatchedWith":[
            {
                "Name" : "one",
                "ImageURL": "https://images-na.ssl-images-amazon.com/images/I/61IgIqKfWTL.jpg",
                "MatchedWith":[]

            },
            {
                "Name" : "two",
                "ImageURL": "http://bobs.net/images/products/t-shirts/mens/badge/Bobs-Big-Boy-Badge-Shirt-Use.jpg",
                "MatchedWith":[]

            },
            {
                "Name" : "three",
                "ImageURL": "https://images-na.ssl-images-amazon.com/images/I/61IgIqKfWTL.jpg",
                "MatchedWith":[]

            }
        ]

    },
    {
        "Name" : "two",
        "ImageURL": "http://bobs.net/images/products/t-shirts/mens/badge/Bobs-Big-Boy-Badge-Shirt-Use.jpg",
        "MatchedWith":[
            {
                "Name" : "one",
                "ImageURL": "https://images-na.ssl-images-amazon.com/images/I/61IgIqKfWTL.jpg",
                "MatchedWith":[]

            },
            {
                "Name" : "two",
                "ImageURL": "https://images-na.ssl-images-amazon.com/images/I/61IgIqKfWTL.jpg",
                "MatchedWith":[]

            },
            {
                "Name" : "three",
                "ImageURL": "https://images-na.ssl-images-amazon.com/images/I/61IgIqKfWTL.jpg",
                "MatchedWith":[]

            }
        ]

    },
    {
        "Name" : "three",
        "ImageURL": "https://images-na.ssl-images-amazon.com/images/I/61IgIqKfWTL.jpg",
        "MatchedWith":[
        ]

    }
]

//Scambio-start
// app.get('/getjunks', function(req, res){
//     res.writeHead(200, {
//         'Content-Type': 'application/json'
//     });
//     console.log("Junks : ", JSON.stringify(junks));
//     res.end(JSON.stringify(junks));
// });

//@route POST
//@desc get users item information
app.get('/usersItems',(req,res)=>{
    //first lets get all the item ids belonging to the user from the user document     
      var query = {"_id":ObjectId(req.body["UserID"])};
      userData.findOne(query)
      .populate('Items').exec(function(err, item) {
       if (err) {
           console.log(err);
         res.status(500).send({error: "Could not fetch items: "+err});
       }
       else 
       {
            res.writeHead(200, {
            'Content-Type': 'application/json'
                });
            console.log("Junks : ", JSON.stringify(item));
            res.end(JSON.stringify(item));
       }
   });
});

// app.post('/post/likeItem',(req,res)=>{
//     var query = {"EmailAddress":req.body["EmailAddress"]}
//     userData.find(query)
//     .then(function (data){
//           if(!data || data.length ==0)
//           {
//               return res.status(404).json({
//               err: 'No data exists'
//               });
//           } 
//           else{
//           //found file
//           res.writeHead(200, {
//             'Content-Type': 'application/json'
//                 });
//             console.log("Junks : ", JSON.stringify(data));
            
//           return res.end(JSON.stringify(data));
//           }   
//     })
//     .catch(err => {
//         res.status(400).send("unable to fetch user details"+err);
//     });
// });

app.post('/get/usersInfo',(req,res)=>{
    var query = {"EmailAddress":req.body["EmailAddress"]}
    userData.find(query)
    .then(function (data){
          if(!data || data.length ==0)
          {
              return res.status(404).json({
              err: 'No data exists'
              });
          } 
          else{
          //found file
          res.writeHead(200, {
            'Content-Type': 'application/json'
                });
            console.log("Users : ", JSON.stringify(data));
            
          //found file
          return res.end(JSON.stringify(data));   
      }
    })
    .catch(err => {
        res.status(400).send("unable to fetch user details"+err);
    });
});

app.get('/getjunks',(req,res)=>{
    itemData.find()
    .then(function (data){
          if(!data || data.length ===0)
          {
              return res.status(404).json({
              err: 'No data exists'
              });
          } 
          else{
                res.writeHead(200, {
            'Content-Type': 'application/json'
                });
            console.log("Junks : ", JSON.stringify(data));
            
          
          //found file
          return res.end(JSON.stringify(data));  
          } 
    })
    .catch(err => {
        res.status(400).send("unable to save to database");
    });
});


app.get('/getmatches', function(req, res){
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    console.log("Matches : ", JSON.stringify(matches));
    res.end(JSON.stringify(matches));
});


//Scambio-end
//Route to handle Post Request Call
// app.post('/user/login', function (req, res) {


//     console.log("Inside Login Post Request");
//     console.log("Req Body : ", req.body);
//     Users.filter(function (user) {
//         if (user.username === req.body.EmailAddress && user.password === req.body.Password) {
//             res.cookie('cookie', "admin", { maxAge: 900000, httpOnly: false, path: '/' });
//             req.session.user = user;
//             res.writeHead(200, {
//                 'Content-Type': 'text/plain'
//             })
//             res.end("Successful Login");
//         }
//         else{
//             res.end("Login Failed")
//         }
//     })


// });

app.post('/user/login',(req,res)=>{

    console.log("Inside Login Post Request"); 
    var query = {EmailAddress: req.body.EmailAddress};
    userData.findOne(query).then(function (data){
        if(data["Password"]==req.body.Password){
            console.log("id is:" + data["_id"]);
            var id = data["_id"].toString();
            console.log("id is2:" + id);
            res.cookie('cookie', id, { maxAge: 900000, httpOnly: false, path: '/' });
            req.session.user = data;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            })
            res.end("Successful Login");
        }
        else
            res.status(500).end("Login Failed")
    })
    .catch(err => {
        res.status(400).send("Error occured: "+err);
    });
  });

app.post('/user/signup',(req,res)=>{
    var inputJson = req.body;
    
    //Check if the user already exists
    var query = {EmailAddress: inputJson["EmailAddress"], Password: inputJson["Password"], Fname: inputJson["Fname"], Lname: inputJson["Lname"]};
    userData.findOne(query)
    .then(function (data){
        //if user doesn't exists
        if(data === "" || data===null){
            userData.insertMany(inputJson)
            .then(function (data)
            {
                 res.writeHead(200, {
                'Content-Type': 'application/json'
                });
                console.log("user : ", JSON.stringify(data));
                res.end("user inserted");
                 
            })
            .catch(err => {
                 res.end("Error occured: "+err);
            });
        }
        else
            res.end("User already exists");
    })
    .catch(err => {
        res.end("Error occured: "+err);
    });
  });

app.post('/upload', upload.single('file'),(req,res)=>{
  //This has to be set from outside (From front end)  
  req.body = {
    "UserID": "5c05fadad8d364bcca1cdbc9",
    "Item":
     {
        "Name" : "Formal shirt",
        "ItemDesciption" : "Medium size grey formal shirt. Used only once. Exchanging as it doesn't fit anymore.", 
        "ItemCondition" : "New", 
        "Category" : "Clothes",
        "ImageURL" : "www.google.com/images/abc.123"
     }
  }
  //res.json({file: req.file});
  const filePath = req.protocol + "://" + req.host + ':5000/image/' + req.file.filename;

  //set the request body of the item to update the image URL to the URL of the image uploaded above
  req.body.Item["ImageURL"] = filePath;

  //Image has been uploaded, we haev the URL, upload the item information to DB
  var inputJson = req.body;
  var data = new itemData(inputJson["Item"]);
    var uData = new userData();
    data.save()
    .then(function (data){
            // get item ID as it has to be stored in another collection
            var ItemID = data["_id"];
            var query = {_id: ObjectId(inputJson["UserID"])};
            userData.updateOne(query,{$addToSet: {Items:[ItemID]}}).then(function(data){
              var UserID = data["_id"];
            })
            res.writeHead(200, {
            'Content-Type': 'application/json'
                });
            console.log("Junks : ", JSON.stringify(item));
            res.end("Item saved to database" + JSON.stringify(item));
    })
    .catch(err => {
        res.end("unable to save to database");
    });
});

//Route to get All Books when user visits the Home Page

app.get('/ping', function(req, res) {
    console.log("Inside Ping");
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end("Hello");
})

app.get('/home', function (req, res) {
    console.log("Inside Home Login");
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    console.log("Books : ", JSON.stringify(books));
    res.end(JSON.stringify(books));

})

//Route to create book


//Route to Delete


//start your server on port 3001
app.listen(3001);
console.log("Server Listening on port 3001");
