import mongoose from "mongoose";


const { Schema } = mongoose;

const groupUserSchema = new Schema ({
    _id: false,
    userId: {
        type: Schema.Types.ObjectId,
    },
    role: {
        type: String,
    }
})

groupUserSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

const groupSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    users: [groupUserSchema],
    tags: [{
        type: String,
        required: true,
    }]


});

export default mongoose.model("Group", groupSchema);