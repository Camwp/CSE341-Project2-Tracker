import { Router } from 'express';
import Pokemon from '../models/Pokemon.js';
import { validate } from '../mw/validate.js';
import { createPokemonSchema, updatePokemonSchema, listPokemonQuerySchema } from '../validation/pokemonSchemas.js';

const r = Router();

r.get('/', validate(listPokemonQuerySchema, 'query'), async (req, res, next) => {
    try {
        const { name, type, from, to } = req.query;
        const q = {};
        if (name) q.name = new RegExp(name, 'i');
        if (type) q.types = type;
        if (from || to) {
            q.dex = {};
            if (from) q.dex.$gte = Number(from);
            if (to) q.dex.$lte = Number(to);
        }
        const items = await Pokemon.find(q).sort({ dex: 1 }).lean();
        res.json(items);
    } catch (e) { next(e); }
});

r.get('/:dex', async (req, res, next) => {
    try {
        const item = await Pokemon.findOne({ dex: Number(req.params.dex) }).lean();
        if (!item) return res.status(404).json({ error: 'NotFound', message: 'Pokemon not found' });
        res.json(item);
    } catch (e) { next(e); }
});

r.post('/', validate(createPokemonSchema), async (req, res, next) => {
    try {
        const created = await Pokemon.create(req.body);
        res.status(201).json(created);
    } catch (e) { next(e); }
});

r.put('/:dex', validate(updatePokemonSchema), async (req, res, next) => {
    try {
        const updated = await Pokemon.findOneAndUpdate(
            { dex: Number(req.params.dex) },
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'NotFound', message: 'Pokemon not found' });
        res.json(updated);
    } catch (e) { next(e); }
});

r.delete('/:dex', async (req, res, next) => {
    try {
        const deleted = await Pokemon.findOneAndDelete({ dex: Number(req.params.dex) });
        if (!deleted) return res.status(404).json({ error: 'NotFound', message: 'Pokemon not found' });
        res.status(204).end();
    } catch (e) { next(e); }
});

export default r;
