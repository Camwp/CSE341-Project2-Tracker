import mongoose from 'mongoose';

const CardSnapshot = new mongoose.Schema({
    cardName: { type: String, required: true },
    setCode: { type: String, required: true },
    setName: String,
    subset: String,
    cardNumber: String,
    rarity: { type: String, required: true },
    language: { type: String, default: 'EN' },
    condition: { type: String, default: 'NM' },
    finish: String,
    isGraded: { type: Boolean, default: false },
    grade: String,
    imageUrl: String,
    acquiredAt: Date,
    pricePaid: Number,
    marketPrice: Number,
    notes: String
}, { _id: false });

const DexCard = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },

    dex: { type: Number, unique: true, index: true, required: true }, // 1..1025

    pokemonName: String,
    status: { type: String, default: 'empty' }, // "empty" | "owned"
    priority: { type: Number, default: 3 },     // 1..5 upgrade urgency
    wishlist: String,
    current: { type: CardSnapshot, default: null },
    history: [{
        replacedAt: { type: Date, default: Date.now },
        reason: { type: String, default: 'upgrade' },
        card: { type: CardSnapshot, required: true }
    }]
}, { timestamps: true });

export default mongoose.model('DexCard', DexCard);
