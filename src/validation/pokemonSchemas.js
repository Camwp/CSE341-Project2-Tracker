import { z } from 'zod';

export const createPokemonSchema = z.object({
    dex: z.number().int().min(1).max(1025),
    name: z.string().min(1),
    types: z.array(z.string()).max(2).default([]),
    generation: z.number().int().min(1).max(9).optional(),
    spriteUrl: z.string().url().optional()
});

export const updatePokemonSchema = createPokemonSchema.partial();

export const listPokemonQuerySchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    from: z.coerce.number().int().min(1).optional(),
    to: z.coerce.number().int().max(1025).optional()
});
