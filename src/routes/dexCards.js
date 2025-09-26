import { Router } from 'express';
import DexCard from '../models/DexCard.js';
import { validate } from '../mw/validate.js';
import { createDexCardSchema, replaceCurrentSchema, patchDexMetaSchema } from '../validation/schemas.js';
import { ensureAuth } from '../mw/auth.js';

const r = Router();

r.post('/admin/seed', ensureAuth, async (req, res, next) => {
    try {
        const ops = [];
        for (let i = 1; i <= 1025; i++) {
            ops.push({
                updateOne: {
                    filter: { dex: i },
                    update: { $setOnInsert: { dex: i, status: 'empty' } },
                    upsert: true
                }
            });
        }
        await DexCard.bulkWrite(ops);
        res.json({ ok: true, count: 1025 });
    } catch (e) { next(e); }
});

r.get('/', ensureAuth, async (req, res, next) => {
    try {
        const { owned, from, to } = req.query;
        const q = {};
        if (owned === 'true') q.current = { $ne: null };
        if (owned === 'false') q.current = null;
        if (from || to) {
            q.dex = {};
            if (from) q.dex.$gte = Number(from);
            if (to) q.dex.$lte = Number(to);
        }
        const items = await DexCard.find(q).sort({ dex: 1 }).lean();
        res.json(items);
    } catch (e) { next(e); }
});

r.get('/:dex', ensureAuth, async (req, res, next) => {
    try {
        const item = await DexCard.findOne({ dex: Number(req.params.dex) }).lean();
        if (!item) return res.status(404).json({ error: 'NotFound' });
        res.json(item);
    } catch (e) { next(e); }
});

r.post('/', ensureAuth, validate(createDexCardSchema), async (req, res, next) => {
    try {
        const created = await DexCard.create(req.body);
        res.status(201).json(created);
    } catch (e) { next(e); }
});

r.put('/:dex/replace', ensureAuth, validate(replaceCurrentSchema), async (req, res, next) => {
    try {
        const dex = Number(req.params.dex);
        const doc = await DexCard.findOne({ dex });
        if (!doc) return res.status(404).json({ error: 'NotFound' });

        if (doc.current) {
            doc.history.push({ card: doc.current, reason: 'upgrade' });
        }
        doc.current = req.body.current;
        doc.status = 'owned';
        await doc.save();
        res.json(doc);
    } catch (e) { next(e); }
});

r.delete('/:dex/current', ensureAuth, async (req, res, next) => {
    try {
        const doc = await DexCard.findOne({ dex: Number(req.params.dex) });
        if (!doc) return res.status(404).json({ error: 'NotFound' });
        if (doc.current) {
            doc.history.push({ card: doc.current, reason: 'remove' });
            doc.current = null;
            doc.status = 'empty';
            await doc.save();
        }
        res.status(204).end();
    } catch (e) { next(e); }
});

r.patch('/:dex', ensureAuth, validate(patchDexMetaSchema), async (req, res, next) => {
    try {
        const updated = await DexCard.findOneAndUpdate(
            { dex: Number(req.params.dex) },
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'NotFound' });
        res.json(updated);
    } catch (e) { next(e); }
});

export default r;
