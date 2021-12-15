const User = require('../model/user');
var bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken')
const crypto = require('crypto')

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.userSignup = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            confirmpassword,
        } = req.body
        var role = req.body.role       //client:1, broker:2, supervisor:3
        if(req.body.role == "Client"){
            role=1;
        }if(req.body.role == "Broker"){
            role=2;
        }
        if(req.body.role == "Supervisor"){
            role=3;
        }
        // console.log("role", role)
        // console.log("password", req.body)
        var hash_transaction = crypto.randomBytes(8).toString('hex');
        console.log("hash_transaction",hash_transaction.length)
        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            first_name: first_name,
            last_name:last_name,
            email: email,
            password: hashedPassword, 
            confirmpassword:confirmpassword,
            role:role,
            hash_transaction:hash_transaction       
        });

        if(password != confirmpassword){
            return res.json({statusCode:401, message:"Pasword Mismatch"})
        }

        var UserData = await User.find({email:req.body.email})
        if(UserData.length >0){
            return res.json({statusCode: 402, message: "Email alerady exist"})
        }
        let response = new User(newUser)
        response.save()
        .then((result)=>{
           return res.json({statusCode:"200",statusMsj:"Successfuly Register", data:result})
        }).catch((err)=>{
            console.log(err)
           return res.send(err)
        })
    } catch (error) {
        console.log(error)
        return res.send(error)
    }
}

exports.userlogin = async (req, res, next) => {
    try {
        const {
            email,
            password,   
        } = req.body;
        const role=req.query.role

        console.log("role",role)

        const user = await User.findOne({email});
        if (!user) return res.json({statusCode:401,message:'Email does not exist!'});

        if(user.role != role){
            return res.json({statusCode:403, message:"Incorrect Role"})
        }

        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) return res.json({statusCode:402,message:'Password is not correct'})

        const accessToken = jwt.sign({
            userId: user._id
        }, 'bulbul', {
            expiresIn: "1d"
        });
        await User.findByIdAndUpdate(user._id, {
            accessToken
        })
        console.log(accessToken)
        return res.json({statusCode:200,message:"login sucessful", accessToken:accessToken})
    } catch (error) {
        console.log(error);
        return res.json({statusCode:500,message:"login failed"})
    }
}