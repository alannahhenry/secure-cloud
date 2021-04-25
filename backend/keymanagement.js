var fs = require('fs');
var crypto = require('crypto')
const { generateKeyPairSync } = require('crypto');

function initKeyPair(){
    const { publicKey, privateKey} = generateKeyPairSync('rsa', {
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
    });
    fs.writeFileSync("publickey.pem", publicKey)
    fs.writeFileSync("privatekey.pem", privateKey)

    
    return {
        pubKey: publicKey,
        priKey: privateKey
    }

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
        var keyPair = initKeyPair()
        console.log(keyPair)
        return(keyPair)

    }
    
}
function initSecret(username){
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

function getSecret(username){
    if(fs.existsSync("key-"+username+".txt") && fs.existsSync("iv.txt")){
        var encryptedKey = fs.readFileSync("key-"+username+".txt")
        var iv = fs.readFileSync("iv.txt")
        return({
            iv: iv,
            key: decryptSecret(encryptedKey)
        })
    }
    else{
        return initSecret(username)
    }
}

function encryptSecret(secret){
    var keyPair = getKeyPair()
    var buffer = secret.key
    var publicKey = keyPair.pubKey
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
