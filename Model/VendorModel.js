const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: String
    },
    src: {
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
const Vendor = mongoose.model('Vendor', vendorSchema)
module.exports = Vendor