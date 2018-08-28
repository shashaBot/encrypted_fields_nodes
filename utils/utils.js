var crypto = require('crypto');
function randU32Sync() {
  return crypto.randomBytes(16).toString('hex');
}
// or
function randU32(cb) {
  	return new Promise( (resolve, reject) => {
	  	crypto.randomBytes(4, function(err, buf) {
	    	if (err) return reject(err)
	    	return resolve(buf.readUInt32BE(0, true));
	  	})
	})
}

function createHash(data) {
	let hashed = crypto.createHash('sha1').update(data).digest("hex");
	return hashed
}

module.exports = {
	gen32BitId: randU32Sync,
	createHash: createHash
}