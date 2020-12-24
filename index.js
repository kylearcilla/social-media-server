

const { ApolloServer, PubSub } = require('apollo-server')
const mongoose = require('mongoose');

// has the gql import
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { MONGODB } = require('./config.js');

const pusub = new PubSub();
const PORT = process.env.port || 5000;

const server = new ApolloServer({
    typeDefs,    // these get filled up by the resolvers, and they are used to for querying in the front end
    resolvers,   // uses the models to perform the functions (mutations and queries)
    context: ({ req }) => ({ req, pusub })
});

// connecting to the database
mongoose.connect(MONGODB, { useNewUrlParser: true })
    .then(() => {
        console.log('OK');
        return server.listen({ port: PORT })
    })
    .then(res => {
        console.log(`Server running at ${res.url}`)
    })
    .catche(err => {
        console.error(err)
    })








