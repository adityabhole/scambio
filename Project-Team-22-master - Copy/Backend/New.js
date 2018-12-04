const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
var MongoClient = require('mongodb').MongoClient;

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
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

//@route POST/
//@desc log in
app.post('/user/login',(req,res)=>{
    var inputJson = req.body;
    var query = {EmailAddress: inputJson["EmailAddress"]};
    userData.findOne(query)
    .then(function (data){
        if(data["Password"]==inputJson["Password"]){
            res.status(200).send("Valid user");
        }
        else
            res.status(400).send("Invalid user");
    })
    .catch(err => {
        res.status(400).send("Error occured: "+err);
    });
  });

//@route POST/
//@desc signup
app.post('/user/signup',(req,res)=>{
    var inputJson = req.body;
    
    //Check if the user already exists
    var query = {EmailAddress: inputJson["EmailAddress"]};
    userData.findOne(query)
    .then(function (data){
        //if user doesn't exists
        if(data === "" || data===null){
            userData.insertMany(inputJson)
            .then(function (data)
            {
                 res.status(201).send("User information inserted");
            })
            .catch(err => {
                 res.status(400).send("Error occured: "+err);
            });
        }
        else
            res.status(400).send("User already exists");
    })
    .catch(err => {
        res.status(400).send("Error occured: "+err);
    });
  });

//@route POST
//@desc save liked items
app.post('/post/likeItem',(req,res)=>{
    var query = {"EmailAddress":req.body["EmailAddress"]}
    userData.find(query)
    .then(function (data){
          if(!data || data.length ==0)
          {
              return res.status(404).json({
              err: 'No data exists'
              });
          } 
          else
          //found file
          return res.json(data);   
    })
    .catch(err => {
        res.status(400).send("unable to fetch user details"+err);
    });
});


//@route GET
//@desc get matches of the user 


//@route GET
//@desc search - get pictures with search criteria provided 

//@route POST
//@desc get user information from email id
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
          else
          //found file
          return res.json(data);   
    })
    .catch(err => {
        res.status(400).send("unable to fetch user details"+err);
    });
});


//@route POST
//@desc get users item information
app.post('/get/usersItems',(req,res)=>{
    //first lets get all the item ids belonging to the user from the user document 
    
      var query = {"_id":ObjectId(req.body["UserID"])};
      userData.findOne(query)
      .populate('Items').exec(function(err, item) {
       if (err) {
           console.log(err);
         res.status(500).send({error: "Could not fetch items: "+err});
       }
       else {
         res.send(item);
       }
   });
});


//@route GET
//@desc get all items
app.get('/get/allItems',(req,res)=>{
    itemData.find()
    .then(function (data){
          if(!data || data.length ===0)
          {
              return res.status(404).json({
              err: 'No data exists'
              });
          } 
          else
          //found file
          return res.json(data);   
    })
    .catch(err => {
        res.status(400).send("unable to save to database");
    });
});

//@route GET/
//@desc Loads form
app.get('/',(req,res)=> {
    res.render('index');
});

//@route GET
//@desc get items based on a search criteria

//@route POST/
//@desc insert item
app.post('/upload/item',(req,res)=>{
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
        res.status(201).send("Item saved to database");
    })
    .catch(err => {
        res.status(400).send("unable to save to database");
    });
  });

//@route GET/
//@desc Loads form
app.get('/',(req,res)=> {
    res.render('index');
});

//@route POST/
//@desc uploads images to db
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
        res.status(201).send("Item saved to database");
    })
    .catch(err => {
        res.status(400).send("unable to save to database");
    });
});


//@route GET/
//@desc fetch images from DB
app.get('/files',(req,res) => {
    console.log("In file section");
  gfs.files.find().toArray((err,files) => {
     //check if files
     if(!files || files.length ==0)
     {
         return res.status(404).json({
             err: 'No file exists'
         });
     }

     //found file
     return res.json(files);
  });
});

//@route GET/ indvidual file
//@desc fetch images from DB
app.get('/files/:filename',(req,res) => {
    gfs.files.findOne({filename: req.params.filename}, (err,file) => {
        if(!file || file.length ===0)
     {
         return res.status(404).json({
             err: 'No file exists'
         });
     }
     return res.json(file);
    });
  });

//@route GET/ image/:filename
//@desc fetchs images
app.get('/image/:filename',(req,res) => {
    gfs.files.findOne({filename: req.params.filename}, (err,file) => {
        if(!file || file.length ===0)
     {
         return res.status(404).json({
             err: 'No file exists'
         });
     }
 
     //check if image
     if(file.contentType === 'image/jpeg' || file.contentType === 'img/png' || file.contentType === "image/png")
     {
         //read output from browser
         const readStream = gfs.createReadStream(file.filename);
         readStream.pipe(res);
     }
     else
     {
         res.status(404).json({
         err : 'File not image'
         });

     }
     //return res.json(file);
    });
  });

const port = 5001;

app.listen(port, () => console.log(`Server started on port ${port}`));;