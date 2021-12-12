const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    street: {
        type: String,
        trim: true,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        trim: true,
        default: false
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    country: {
        type: String,
        trim: true,
        default: ''
    }
})

//convert '_id' in database to 'id' without underscore, to use this id in other apps. 
userSchema.virtual('id').get(function(){
    return this._id.toHexString()
})

userSchema.set('toJSON', {
    virtuals: true
})

exports.User = mongoose.model('User', userSchema)