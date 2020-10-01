import mongoose from "mongoose";


const { Schema } = mongoose;
const groupSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    users: [{
        type: String,
        required: true,
    }],
    tasks: [{
        type: String,
        required: false,
    }]

});

export default mongoose.model("Group", groupSchema);