const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    icon: {
        type: String,
        trim: true,
    },
    color: {
        type: String,
        trim: true,
    }
})

// copy '_id' in database, convert it to 'id' without underscore, to use the id in other apps.  
categorySchema.virtual('id').get(function() {
    return this._id.toHexString()
})

categorySchema.set('toJSON', {
    virtuals: true
})

exports.Category = mongoose.model('Category', categorySchema);