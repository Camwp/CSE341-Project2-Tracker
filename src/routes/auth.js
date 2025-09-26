import { Router } from 'express';
import passport from 'passport';

const r = Router();

r.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

r.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/failure' }),
    (_req, res) => res.redirect('/docs')
);

r.get('/failure', (_req, res) => res.status(401).json({ error: 'OAuthFailed' }));

r.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    res.json(req.user);
});

r.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session?.destroy(() => { });
        res.clearCookie('connect.sid');
        res.status(204).end();
    });
});

export default r;
