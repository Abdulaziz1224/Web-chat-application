const mongoose = require("mongoose")


let userSchema = new mongoose.Schema({
    imageUrl: String,
    Name: String,
    email: String,
    password: String,
    status: String,
    friends: [
        {
            id: String,
        }
    ]

})

let messageSchema = new mongoose.Schema({
    message: {
        user1_id: String,
        user2_id: String,
        text: [
            {
                author_id: String,
                value: String,
                date: Date,
            }
        ],
    }
})

module.exports = {
    userSchema: userSchema,
    messageSchema: messageSchema,
}