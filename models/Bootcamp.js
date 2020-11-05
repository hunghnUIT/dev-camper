const mongoose = require('mongoose');
const slugify = require('slugify');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        unique: true,
        maxlength: [50, 'Name can not be longer than 50 characters.']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a name'],
        maxlength: [500, 'Name can not be longer than 50 characters.']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please enter a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20']
    },
    email: {
        type: String,
        match: /^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/
    },
    address: {
        type: String,
        required: [true, 'Please add an address.']
    },
    location: {
        //GEO JSON Point
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        state: String,
        city: String,
        zipcode: String,
        country: String,
    },
    careers: {
        type: String,
        required: true,
        enum: [

        ]
    },
    careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
},
{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

// Create slub from the name
BootcampSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});

// Cascade delete courses when bootcamp is deleted
BootcampSchema.pre('remove', async function(next){
    await this.model('Course').deleteMany({bootcamp: this._id});
    next();
})


BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

/**
 * Giải thích:
 * ref <=> refer: Trỏ đén schema tên là Course 
 * localField: Đối với mỗi _id khác nhau của bootcamp thì nó sẽ làm một cái virtual.
 * foreignField: ???
 * justOne: chỉ nhận 1 kết quả virtual thôi -> Chọn true/false.
 */

module.exports = mongoose.model('Bootcamp', BootcampSchema, 'bootcamps')