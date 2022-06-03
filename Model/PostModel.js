const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const postSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: String
    },
    image: {
        type: String
    },
    details: {
        type: String
    },
    location: {
        type: String
    },
    owner: {
        type: String
    },
    accepted: {
        type: Boolean
    },
    accepterID: {
        type: String
    },
    accepterName: {
        type: String
    },
    accepterImage: {
        type: String
    }
}, {timestamps: true})




// userSchema.methods.comparePassword = function(email,cb){
//     bcrypt.compare(password,this.password,(err,isMatch)=>{
//         if(err) return cb(err);
//         else{
//             if(!isMatch) return cb(null, isMatch);
//             return cb(null, this)
//         }
//     })
// }
const Post = mongoose.model('Post', postSchema)
module.exports = Post