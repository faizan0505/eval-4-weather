const express = require("express")
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { weatherModel } = require("../models/weather_model")

const wetRouter = express.Router()



const { createClient } = require("redis")
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect();



wetRouter.post("/weather/:city", async (req, response) => {
    const { city } = req.params;
    console.log(city)
    const cacheData = await client.hGet("wethm", `${JSON.stringify(city)}`)

    if (cacheData) {
        response.status(200).send(JSON.stringify(cacheData))
    } else {

        function display(city) {

            latlanUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=1d0fe84d5e303003d4084a0a7938a302`

            fetch(latlanUrl).then((result) => {
                return result.json()
            }).then(async (res) => {


                const name = await res.name
                const temp = await res.main.temp
                const temp_min = await res.main.temp_min
                const temp_max = await res.main.temp_max
                const pressure = await res.main.pressure
                const humidity = await res.main.humidity

                const obj = {
                    "name": name,
                    "temp": temp,
                    "temp_min": temp_min,
                    "temp_max": temp_max,
                    "pressure": pressure,
                    "humidity": humidity
                }

                const wettt = new weatherModel(obj)
                await wettt.save()
                await client.hSet("wethm", `${JSON.stringify(city)}`,`${JSON.stringify(obj)}`)

                response.status(200).send(JSON.stringify(obj))

            })
        }

        display(city)

    }
})




module.exports = { wetRouter }