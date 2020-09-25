import passport from 'passport'
import PassportJwt from 'passport-jwt'
import User from '../schemes/user.js'
import config from '../config/constants.js'

const { secretOrKey } =  config;
const { Strategy: JwtStrategy, ExtractJwt } = PassportJwt


const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey
}


export default passport => {
    passport.use(
        new JwtStrategy(options, async (payload, done) => {
            try {
                // console.log(payload)
                const user = await User.findOne({login: payload.login})
        
                if (user) {
                    done(null, user)
    
                } else {
                    done(null, false)
                }
            } catch (error) {
                console.log(error)
            }

        })
    )
}