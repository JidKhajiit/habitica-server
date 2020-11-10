import mongoose from "mongoose";


const { Schema } = mongoose;
const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    workers: [{
        _id: false,
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            unique: true,
            required: true,
        },
        startTime: {
            type: String,
            required: false,
        },
        endTime: {
            type: String,
            required: false,
        },
        completeTime: {
            type: String,
            required: false,
        }
    }],
    groupId: {
        type: String,
        required: false,
    },
    completed: {
        type: Boolean,
        required: true
    }
});

export default mongoose.model("Task", taskSchema);