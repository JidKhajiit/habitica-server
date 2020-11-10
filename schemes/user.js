import mongoose from "mongoose";


const { Schema } = mongoose;
const userSchema = new Schema({
    login: {
        type: String,
        required: true,
        unique: true
    },
    nickName: {
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
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    friends: [{
        
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true,
    
    }]
});

export default mongoose.model("User", userSchema);