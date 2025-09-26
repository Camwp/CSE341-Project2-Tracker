import mongoose from 'mongoose';

const User = new mongoose.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true, unique: true },
    email: { type: String, index: true },
    name: String,
    picture: String
}, { timestamps: true });

export default mongoose.model('User', User);
