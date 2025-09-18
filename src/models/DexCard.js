import mongoose from 'mongoose';

const CardSnapshot = new mongoose.Schema({
    cardName: { type: String, required: true },
    setCode: { type: String, required: true },
    setName: String,
    subset: String,
    cardNumber: String,
    rarity: { type: String, required: true },
    language: { type: String, default: 'EN' },
    condition: { type: String, default: 'NM' }, // NM/LP/MP/HP/DMG
    finish: String, // holo/reverse/full-art/gold
    isGraded: { type: Boolean, default: false },
    grade: String, // PSA 10, etc.
    imageUrl: String,
    acquiredAt: Date,
    pricePaid: Number,
    marketPrice: Number,
    notes: String
}, { _id: false });

const DexCard = new mongoose.Schema({
    dex: { type: Number, unique: true, index: true, required: true }, // 1..1025
    pokemonName: String,        // optional cache
    status: { type: String, default: 'empty' }, // "empty" | "owned"
    priority: { type: Number, default: 3 },     // 1..5 upgrade urgency
    wishlist: String,           // "alt art JP", etc.
    current: { type: CardSnapshot, default: null },
    history: [{
        replacedAt: { type: Date, default: Date.now },
        reason: { type: String, default: 'upgrade' },
        card: { type: CardSnapshot, required: true }
    }]
}, { timestamps: true });

export default mongoose.model('DexCard', DexCard);
