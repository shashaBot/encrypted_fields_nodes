var crypto = require('crypto');
function randU32Sync() {
  return crypto.randomBytes(4).readUInt32BE(0, true);
}
// or
function randU32(cb) {
  return crypto.randomBytes(4, function(err, buf) {
    if (err) return cb(err);
    cb(null, buf.readUInt32BE(0, true));
  }
}

function createHash(data) {
	crypto.createHash('md5').update(data).digest("hex");
}

module.exports = {
	gen32BitId: randU32,
	createHash: createHash
}