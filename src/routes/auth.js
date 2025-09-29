// routes/auth.js
import { Router } from 'express';
import passport from 'passport';

const r = Router();

// Start GitHub OAuth
r.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
r.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/auth/failure' }),
    (_req, res) => res.redirect('/docs') // or '/api-docs' if you prefer
);

// Failure + session helpers (unchanged)
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
