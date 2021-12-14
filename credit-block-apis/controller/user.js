const User = require('../model/user');
var bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken')

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.userSignup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role       //client:1, broker:2, supervisor:3
        } = req.body
        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword, 
            role:role         
        });

        var UserData = await User.find({email:req.body.email})
        if(UserData.length >0){
            return res.json({statusCode: 400, message: "Email alerady exist"})
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
        if (!validPassword) return res.json({statusCode:2,message:'Password is not correct'})

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
        return res.json({statusCode:403,message:"login failed"})
    }
}