const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    orderItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            required: true
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    shippingAddress1: {
        type: String,
        trim: true,
        required: true
    },
    shippingAddress2: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        required: true
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
    },
    zip: {
        type: String,
        trim: true,
        default: false
    },
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number,

    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
})

//convert '_id' in database to 'id' without underscore, to use this id in other apps. 
orderSchema.virtual('id').get(function(){
    return this._id.toHexString()
})

orderSchema.set('toJSON', {
    virtuals: true
})


exports.Order = mongoose.model('Order', orderSchema)