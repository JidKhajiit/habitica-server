import mongoose from "mongoose";


const { Schema } = mongoose;
const userSchema = new Schema({
    login: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
});

export default mongoose.model("User", userSchema);