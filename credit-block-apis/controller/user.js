const User = require('../model/user');
var bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require("nodemailer")

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
        return res.json({statusCode:200,message:"login sucessful", accessToken:accessToken, data:user})
    } catch (error) {
        console.log(error);
        return res.json({statusCode:500,message:"login failed"})
    }
}

exports.getUser = async (req, res)=>{
    var id = req.query.id
    User.findById({_id:id}).then((result)=>{
        if(!result){
            return res.json({statusCode:400, message:"Data Not Found"})
        }
        return res.json({statusCode:200, data:result})
    }).catch((err)=>{
        return res.json({statusCode:500, message:"Something went wrong"})
    })
}

exports.forgotPassword = async (req, res) => {
    var email = req.body.email
    var otp = Math.floor(Math.random() * 11111)
    console.log(otp)

    var add_otp = await User.updateOne({ email: req.body.email }, { $set: { otp: otp } })

    let transporter = nodemailer.createTransport(
        {
            service: "gmail",
            secure: false,
            auth: {
                user: "bulbul.infograins@gmail.com",
                pass: "BulBul@123"
            },
            tls: { rejectUnauthorized: false }
        }
    );
    let mailOptions = {
        from: email,
        to:email,
        // to: "bulbulbagwan918@gmail.com",
        subject: "Your OTP",
        html: "OTP - " + otp
    };

    transporter.sendMail(mailOptions, function (error, success) {
        if (error) {
            res.send(error);
            console.log(error);
        }
        else {
            console.log("Server is ready to take our messages");
            // return res.json({ statusCode:200,message:"mail send", otp:otp})
            return res.redirect("http://127.0.0.1:5501/forgot-password.html?email="+email)

        }
    });
}

exports.verify_otp = async (req, res) => {
    var otp = req.body.otp;
    var email = req.query.email;
    var new_password = req.body.new_password;
    var confirm_password = req.body.confirm_password;

    var user_data = await User.findOne({email: email })

    if(!user_data){
        return res.json({statusCode:400, statusMsj:"Email Not found"})
    }

    console.log("req.body",req.body)
    console.log("otp",otp)
    if (user_data.otp != otp) {
        return res.json({ statusCode: 401, statusMsj: "Wrong OTP" })
    }
    if (new_password != confirm_password) {
        return res.json({ statusCode: 402, statusMsj: "Password mismatch" })
    }

    const hashedPassword = await hashPassword(new_password);

    var reset_password = await User.updateOne({ email: email }, { $set: { password: hashedPassword, otp: null } })
    console.log(reset_password)

    // res.json("Password reset successfully!")
    // return res.redirect("http://127.0.0.1:5500/frontend/page-login.html")
    return res.json({ statusCode: 200, statusMsj: "Password Changed", data:user_data})


}