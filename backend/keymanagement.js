var fs = require('fs');
var crypto = require('crypto')
const { generateKeyPair } = require('crypto');

function initKeyPair(){
    generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'top secret'
      }
    }, (err, publicKey, privateKey) => {
        fs.writeFileSync("publickey.pem", publicKey)
        fs.writeFileSync("privatekey.pem", privateKey)
        
      return({
          pubKey:  publicKey,
          priKey: privateKey
      })
    });

};

const getKeyPair = () => {
    if(fs.existsSync("publickey.pem") && fs.existsSync("privatekey.pem")){
        var publicKey = fs.readFileSync("publickey.pem")
        var privateKey = fs.readFileSync("privateKey.pem")
        return({
            pubKey:  publicKey,
            priKey: privateKey
        })
    }
    else{
        initKeyPair()
        var publicKey = fs.readFileSync("publickey.pem")
        var privateKey = fs.readFileSync("privateKey.pem")
        
        return({
            pubKey:  publicKey,
            priKey: privateKey
        })

    }
    
}
function initSecret(){
    var iv = crypto.randomBytes(16)
    var key = crypto.randomBytes(32)
    
    var secret = {
        iv: iv,
        key: key
    }
    var encryptedKey = encryptSecret(secret)
    fs.writeFileSync("iv.txt", secret.iv)
    fs.writeFileSync("key-"+username+".txt", encryptedKey)
    return secret
}

function getSecret(){
    if(fs.existsSync("key.txt") && fs.existsSync("iv.txt")){
        var encryptedKey = fs.readFileSync("key.txt")
        var iv = fs.readFileSync("iv.txt")
        return({
            iv: iv,
            key: decryptSecret(encryptedKey)
        })
    }
    else{
        return initSecret()
    }
}

function encryptSecret(secret){
    var publicKey = getKeyPair().pubKey
    var buffer = secret.key
    var encrypted = crypto.publicEncrypt(publicKey, buffer)
    return encrypted
}

function decryptSecret (secret){
    var privateKey = getKeyPair().priKey
    var decrypted = crypto.privateDecrypt({
        key: privateKey,
        passphrase:'top secret',
    }, secret)
    return decrypted
}

module.exports={getKeyPair, getSecret}
