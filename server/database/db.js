const mongoose = require("mongoose")
const {userSchema, messageSchema} = require("./schema")

mongoose.connect("mongodb+srv://Abdulaziz1224:Langar-24@cluster0.oqoxq.mongodb.net/web-chat-database?retryWrites=true&w=majority", {
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