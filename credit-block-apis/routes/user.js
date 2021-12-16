const express = require('express');
var user = express.Router();
user.use(express.json());
const bodyParser = require("body-parser");

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());


const {
    userSignup,userlogin,getUser, forgotPassword, verify_otp
}= require("../controller/user")

router.post("/userSignup",userSignup);
router.post("/userlogin",userlogin);
router.get("/getUser",getUser);
router.post("/forgotpassword",forgotPassword);
router.post("/verify_otp",verify_otp)

module.exports = router;
