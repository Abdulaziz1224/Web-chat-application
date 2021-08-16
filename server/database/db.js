const mongoose = require("mongoose")
const {userSchema, messageSchema} = require("./schema")

mongoose.connect("mongodb://localhost:27017/chatapp", {
    useNewUrlParser:true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
})

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"))
db.once("open", function (){
    console.log("db connected")
})

const user = mongoose.model("User", userSchema)
const messages = mongoose.model("messages", messageSchema)


module.exports = {
    user: user,
    messages: messages,
}