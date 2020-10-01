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
        id: {
            type: String,
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
    }]
});

export default mongoose.model("Task", taskSchema);