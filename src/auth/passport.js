import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = () => {
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try { done(null, await User.findById(id).lean()); } catch (e) { done(e); }
    });

    const callbackURL = new URL('/auth/google/callback',
        process.env.PUBLIC_URL || 'http://localhost:3000').toString();

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL
    }, async (_at, _rt, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const picture = profile.photos?.[0]?.value;
            let user = await User.findOne({ provider: 'google', providerId: profile.id });
            if (!user) {
                user = await User.create({
                    provider: 'google', providerId: profile.id, email,
                    name: profile.displayName, picture
                });
            } else {
                await User.updateOne({ _id: user._id }, { email, name: profile.displayName, picture });
            }
            return done(null, user);
        } catch (e) { return done(e); }
    }));
};
