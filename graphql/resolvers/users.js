const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');
const checkAuth = require('../../util/check-auth');

function generateToken(user) {

    // creating a token to the user
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = {
    Query: {
        async getUsers() {
            try {
                const users = await User.find().sort({ createdAt: -1 });
                return users;

            } catch (err) {
                throw new Error(err);
            }
        },

        async getUser(_, { userId }) {
            try {
                const user = await User.findById(userId);
                if (user) {
                    return user;
                } else {
                    throw new Error('User not found');
                }
            } catch (err) {
                throw new Error(err);
            }
        }

    },

    Mutation: {  // The different arguments for registering; _ parent gives access to the args

        async login(_, { username, password }) {
            const { errors, valid } = validateLoginInput(username, password);
            const user = await User.findOne({ username });

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                errors.general = 'Wrong Credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            }

        },

        async register(_, {
            registerInput: { username, email, password, confirmPassword }
        },
        ) {

            // TODO: Validate user data
            const { valid, errors } = validateRegisterInput
                (username,
                    email,
                    password,
                    confirmPassword
                );

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            // TODO: Make sure user doesn't already exist
            const user = await User.findOne({ username });
            if (user) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                });
            }

            // TODO: hash password and create an auth token
            password = await bcrypt.hash(password, 12);
            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString(),
                bio: 'This is your bio!',
            });

            // return data to the user
            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            }
        },

    }
}
