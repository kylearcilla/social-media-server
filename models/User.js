
const { model, Schema } = require('mongoose');

// all users are arranged like this

const userSchema = new Schema({

    username: String,
    password: String,
    email: String,
    createdAt: String,
    bio: String,

})

module.exports = model('User', userSchema);





