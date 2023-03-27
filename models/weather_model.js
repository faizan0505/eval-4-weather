const mongoose = require("mongoose")

const weatherSchema = mongoose.Schema({

    name: String,
    temp: Number,
    temp_min: Number,
    temp_max: Number,
    pressure: Number,
    humidity: Number

}, {
    versionKey: false

})

const weatherModel = mongoose.model("weatherData", weatherSchema)

module.exports = { weatherModel }