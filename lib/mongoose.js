import mongoose from "mongoose";

export default mongoose.connect("mongodb://localhost:27017/habitica", (err) => {
    if(err) throw err

    console.log("Connected!")
}); 

