
// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var multer = require('multer')
var cors = require('cors');


// cors middleware
app.use(cors());

app.use(express.static('public '));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.json());

// stores file uploaded
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public')
  },
  filename: function(req, file, cb){
    var n = file.originalname;
    console.log(n)
    cb(null, "upload-"+ n)
  }
})

// upload instance and recieve single file
var upload = multer({storage: storage}).single('file');


app.post('/upload/files', function(req, res){

  upload(req, res, function (err){
    if (err instanceof multer.MulterError){
      console.log(err)
      return res.status(500).json(err)
    }
    else if (err){
      console.log(err)
      return res.status(500).json(err)
    }
  return res.status(200).send(req.file)
    
  })
});

app.post('/upload/user', (req, res) => {
  console.log("Added "+req.body.user+ " to secure cloud group")
  secureCloudGroup.push(req.body.user)
  console.log(secureCloudGroup)
  return res.status(200)
 
})

app.post("/remove/user", (req, res) => {
  var user = req.body.user;
  console.log("Attempting to remove "+ user +" from secure cloud group")
  var userFound = secureCloudGroup.indexOf(user);
  if(userFound != -1){
    secureCloudGroup.splice(userFound);
    console.log("Removed "+user+ " from secure cloud group");
    console.log(secureCloudGroup);
    return res.status(200);
  }
  

})

function getFiles(){
  var files = [];
  var directory = "./public";
  var path = require('path');
  var fs = require('fs');

  fs.readdirSync(directory).forEach(file =>{
    files.push(file)
  });
  return files;
}

var secureCloudGroup = ["admin"];


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3010;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/files/:username', function(req, res) {
    if(secureCloudGroup.includes(req.params.username)){
      res.json({ "files": getFiles()}); 
      console.log(req.params.username + " accessed the secure cloud group")
    }
    else{
      res.status(401);
    }   
});

router.get('/users', function(req, res){
    res.json({"users": secureCloudGroup});
});
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);



