const express = require("express")
const { userModel } = require("../models/user_model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { createClient } = require("redis")
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect();


const userRouter=express.Router()

userRouter.post("/signup", async (req,res) => {
    const{name,city, email, password} = req.body;
    try{
        bcrypt.hash(password, 3, async function (err, hashed) {
            const data = new userModel({ name,city, email, password: hashed })
            await data.save()
            res.status(200).send({
                "message": "Sign-Up Successfully",
                data
            })
        })
    }catch(error){
        console.log(error)
        res.status(401).send({
            "message": "Sign-Up Error",
            error
        })
    }
})

userRouter.post("/login", async (req, res) => {
    const {email,password} = req.body;
    try {
        const userData = await userModel.find({email})
        if (userData.length > 0) {
            bcrypt.compare(password, userData[0].password, async function (err,result) {
                if (result) {
                    const token = jwt.sign({"id":userData[0]._id },"jwt_token")

                    await client.set('JWTtoken',token)

                    res.status(200).send({
                        "message": "Log-In Successfully"
                    })
                } else {
                    res.status(401).send({
                        "message": "Wrong Credentials - Incorrect Password"
                    })
                }
            })
        } else {
            res.status(401).send({
                "message": "Wrong Credentials - Incorrect E-Mail"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(401).send({
            "message": "Log-In Error",
            error
        })
    }
})


userRouter.get("/logout", async (req,res) => {
    const token=await client.get('JWTtoken')

    try {
        if(token) {
            await client.lPush('BlackListed', token)

            res.status(200).send({
                "message": "Log-Out Successfull"
            })
        }else {
            res.status(401).send({
                "message": "Please Log-In first"
            })
        }
    }catch(error) {
        console.log(error)
        res.status(401).send({
            "message": "Logout Error",
            error
        })
    }
})




module.exports = { userRouter }