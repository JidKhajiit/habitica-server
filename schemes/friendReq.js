import mongoose from "mongoose";


const { Schema } = mongoose;
const friendReqSchema = new Schema({
    out: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    }
})

export default mongoose.model("FriendReq", friendReqSchema);