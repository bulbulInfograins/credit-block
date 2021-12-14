const mongoose = require("mongoose")
const schema = mongoose.Schema
const Users = new schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        default: ''
    },
    role:{
        type: Number,
    },
    is_delete:{
        type:Boolean,
        default:false
    }  
    
}, { strict: false });
var detail = mongoose.model("Users", Users)
module.exports = detail