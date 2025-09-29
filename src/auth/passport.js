// auth/passport.js
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

export const configurePassport = () => {
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try { done(null, await User.findById(id).lean()); } catch (e) { done(e); }
    });

    const callbackURL = new URL(
        '/auth/github/callback',
        process.env.PUBLIC_URL || 'http://localhost:3000'
    ).toString();

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL,
        scope: ['user:email'] // needed because many GitHub emails are private
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            // GitHub may provide multiple emails, and some might be unverified
            const emails = profile.emails || [];
            const primaryVerified = emails.find(e => e.verified) || emails[0];
            const email = primaryVerified?.value || null;

            const picture = profile.photos?.[0]?.value || null;
            const displayName = profile.displayName || profile.username || 'GitHub User';

            let user = await User.findOne({ provider: 'github', providerId: profile.id });

            if (!user) {
                user = await User.create({
                    provider: 'github',
                    providerId: profile.id,
                    email,
                    name: displayName,
                    picture
                });
            } else {
                // keep profile fresh (don’t overwrite email with null)
                const update = { name: displayName, picture };
                if (email) update.email = email;
                await User.updateOne({ _id: user._id }, update);
            }

            return done(null, user);
        } catch (e) {
            return done(e);
        }
    }));
};
