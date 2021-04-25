var km = require('./keymanagement.js')
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var fs = require('fs')
var crypto = require('crypto')

const stream = require("stream")

var app = express();
var bodyParser = require('body-parser')

var multer = require('multer')
var cors = require('cors')

const secret = km.getSecret()
/*{
  iv: Buffer.from('efb2da92cff888c9c295dc4ee682789c', 'hex'),
  key: Buffer.from('6245cb9b8dab1c1630bb3283063f963574d612ca6ec60bc8a5d1e07ddd3f7c53', 'hex')
}*/
const CryptoAlgorithm = "aes-256-cbc";



// cors middleware
app.use(cors());

app.use(express.static('files'));

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
    cb(null, 'files')
  },
  filename: function(req, file, cb){
    var n = file.originalname;
    console.log(n)
    cb(null, "upload-"+ n)
  }
})

// upload instance and recieve single file
var newUpload = multer({dest:'uploads/', storage: multer.memoryStorage()});

function encrypt(algorithm, buffer, key, iv) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
    return encrypted;
};


function decrypt(algorithm, buffer, key, iv) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);
  console.log(km.getKeyPair())
  return decrypted;
}
function getEncryptedFilePath(filePath) {
  return path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath))+ path.extname(filePath)+".enc")
}

function getDecryptedFileBaseName(fileName) {
  return fileName.substring(0,fileName.length-4)
}

function getEncryptedFile(filePath, key, iv) {
    filePath = getEncryptedFilePath(filePath);
    const encrypted = fs.readFileSync(filePath);
    const buffer = decrypt(CryptoAlgorithm, encrypted, key, iv);
    return buffer;
}
function saveEncryptedFile(buffer, filePath, key, iv) {
  const encrypted = encrypt(CryptoAlgorithm, buffer, key, iv);

  filePath = getEncryptedFilePath(filePath);
  if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath))
  }

  fs.writeFileSync(filePath, encrypted);
}


app.post('/upload/files',newUpload.single('file'), function(req, res){
 saveEncryptedFile(req.file.buffer, path.join("./files", req.file.originalname), secret.key, secret.iv);
 res.status(201).json( { status: "ok" });

})



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
app.get("/file/:fileName", (req, res, next) => {
  console.log("Getting file:", req.params.fileName);
  const buffer = getEncryptedFile(path.join("./files", req.params.fileName), secret.key, secret.iv);
  const readStream = new stream.PassThrough();
  readStream.end(buffer);
  res.writeHead(200, {
      "Content-disposition": "attachment; filename=" + req.params.fileName,
      "Content-Type": "application/octet-stream",
      "Content-Length": buffer.length
  });
  res.end(buffer);
});

function getFiles(){
  var files = [];
  var directory = "./files";
  var path = require('path');
  var fs = require('fs');

  fs.readdirSync(directory).forEach(file =>{
    
    files.push(getDecryptedFileBaseName(file))
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






