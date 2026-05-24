import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    modules: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdBy: String,
    updatedBy: String
}, {
    timestamps:  true
})

export default mongoose.model("users", UserSchema);