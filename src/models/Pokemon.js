import mongoose from 'mongoose';

const Pokemon = new mongoose.Schema({
    dex: { type: Number, unique: true, index: true, required: true, min: 1, max: 1025 },
    name: { type: String, required: true, trim: true },
    types: { type: [String], default: [] },
    generation: { type: Number, min: 1, max: 9 },
    spriteUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('Pokemon', Pokemon);
