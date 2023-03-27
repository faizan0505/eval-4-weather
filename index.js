const express = require("express")
const { connection } = require("./config/db")
const { authentication } = require("./middlewares/authentication")
const { userRouter } = require("./routes/user_routes")
const {wetRouter} = require("./routes/weather_routes")

const app = express()
app.use(express.json())

const winston =require("winston")
const expressWinston =require("express-winston")


app.use(expressWinston.logger({
        statusLevels: true,
        transports: [
            new winston.transports.File({
                level: "silly",
                json: true,
                filename: "Err-logs.log"
            })
        ],
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.json()
        ),
    }));


app.use("/", userRouter)
app.use(authentication)
app.use("/", wetRouter)


app.listen("4500",async () => {
    try{
        await connection;
        console.log("DB connected, Server is Listening at Port 4500")
    }catch(error){
        console.log("DB error in Connection")
    }
})