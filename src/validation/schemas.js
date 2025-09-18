import { z } from 'zod';

const Lang = z.enum(['EN', 'JP', 'KR', 'DE', 'FR', 'ES', 'IT', 'PT']);
const Cond = z.enum(['NM', 'LP', 'MP', 'HP', 'DMG']);

export const cardSnapshotSchema = z.object({
    cardName: z.string().min(1),
    setCode: z.string().min(1),
    setName: z.string().optional(),
    subset: z.string().optional(),
    cardNumber: z.string().optional(),
    rarity: z.string().min(1),
    language: Lang.default('EN'),
    condition: Cond.default('NM'),
    finish: z.string().optional(),
    isGraded: z.boolean().default(false),
    grade: z.string().optional(),
    imageUrl: z.string().url().optional(),
    acquiredAt: z.coerce.date().optional(),
    pricePaid: z.number().nonnegative().optional(),
    marketPrice: z.number().nonnegative().optional(),
    notes: z.string().max(500).optional()
});

export const createDexCardSchema = z.object({
    dex: z.number().int().min(1).max(1025),
    pokemonName: z.string().optional(),
    wishlist: z.string().optional(),
    priority: z.number().int().min(1).max(5).optional(),
    current: cardSnapshotSchema.nullable().default(null)
});

export const replaceCurrentSchema = z.object({
    current: cardSnapshotSchema
});

export const patchDexMetaSchema = z.object({
    wishlist: z.string().optional(),
    priority: z.number().int().min(1).max(5).optional(),
    status: z.enum(['empty', 'owned']).optional(),
    pokemonName: z.string().optional()
});
