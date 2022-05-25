const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    
    password: {
        type: String
    },
    src: {
        type: String
    },
    description: {
        type: String
    },
    truck_plate_number: {
        type: String
    },
    truck_src: {
        type: String
    },
    isVendor: {
        type: Boolean
    }
   
}, {timestamps: true})

userSchema.pre('save', function(next){
    if(!this.isModified('password'))  return next();

    bcrypt.hash(this.password,10,(err, hashedpassword)=>{
        if (err) return next(err)
        this.password = hashedpassword
        next();
    })
})


// userSchema.methods.comparePassword = function(email,cb){
//     bcrypt.compare(password,this.password,(err,isMatch)=>{
//         if(err) return cb(err);
//         else{
//             if(!isMatch) return cb(null, isMatch);
//             return cb(null, this)
//         }
//     })
// }
const Login = mongoose.model('Login', userSchema)
module.exports = Login