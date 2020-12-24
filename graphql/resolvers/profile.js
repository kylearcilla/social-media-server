const User = require('../../models/User');


module.exports = {

    Query: {
        async getUserBio(_, { userId }) {
            try {
                const user = await User.findById(userId);
                if (user.bio) {
                    return user.bio;

                } else {
                    return "Empty";
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    },

    Mutation: {

        // 1. body is needed
        // 2. user's id is needed
        async updateBio(_, { body, userId }, context) {

            try {
                const user = await User.findById(userId);
                user.bio = body;
                await user.save()                         // or user.save

                return user.bio;

            } catch (err) {
                throw new Error(err);
            }

        },
    }

}
