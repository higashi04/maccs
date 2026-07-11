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
    perfil: {
        type: Schema.Types.ObjectId,
        ref: "perfilesMGZ"
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