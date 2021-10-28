const { GraphQLScalarType } = require("graphql");
const { authorizeWithGithub } = require("../lib");
const fetch = require("node-fetch");
require("dotenv").config();

var _id = 0;

const resolvers = {
  Query: {
    me: (parent, args, { currentUser }) => currentUser,
    totalPhotos: (parent, args, { db }) => {
      return db.collection("photos").estimatedDocumentCount();
    },
    allPhotos: (parent, args, { db }) => {
      return db.collection("photos").find().toArray();
    },
    totalUsers: (parent, args, { db }) => {
      return db.collection("users").estimatedDocumentCount();
    },
    allUsers: (parent, args, { db }) => {
      return db.collection("users").find().toArray();
    },
  },
  Mutation: {
    async postPhoto(parent, args, { db, currentUser }) {
      if (!currentUser) {
        throw new Error("cannot post photo");
      }

      const newPhoto = {
        ...args.input,
        userID: currentUser.githubLogin,
        created: new Date(),
      };

      const { insertedId } = await db.collection("photos").insertOne(newPhoto);
      newPhoto.id = insertedId.toString();

      console.log(newPhoto);
      return newPhoto;
    },
    async githubAuth(parent, { code }, { db }) {
      let { message, access_token, avatar_url, login, name } =
        await authorizeWithGithub({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          code,
        });

      if (message) throw new Error(message);

      let latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url,
      };
      console.log(latestUserInfo);

      let a = await db
        .collection("users")
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

      console.log(a);
      const aaa = { user: { ...latestUserInfo }, token: access_token };
      console.log(aaa);
      return aaa;
    },
    async addFakeUsers(root, { count }, { db }) {
      const randomUserApi = `https://randomuser.me/api/?results=${count}`;

      const { results } = await fetch(randomUserApi).then((res) => res.json());

      const users = results.map((r) => ({
        githubLogin: r.login.username,
        name: `${r.name.first} ${r.name.last}`,
        avatar: r.picture.thumbnail,
        githubToken: r.login.sha1,
      }));

      await db.collection("users").insert(users);

      return users;
    },
    async fakeUserAuth(parent, { githubLogin }, { db }) {
      var user = await db.collection("users").findOne({ githubLogin });

      if (!user) {
        throw new Error("error");
      }

      return {
        token: user.githubToken,
        user,
      };
    },
  },
  Photo: {
    id: (parent) => parent.id || parent._id,
    url: (parent) => `${parent.id}.jpn`,
    postedBy: (parent, { db }) => {
      db.collection("users").findOne({ githubLogin: parent.userID });
    },
    taggedUsers: (parent) =>
      tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => tag.userID)
        .map((userID) => users.find((u) => u.githubLogin === userID)),
  },
  User: {
    postedPhotos: (parent) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
    },
    inPhotos: (parent) =>
      tags
        .filter((tag) => tag.userID === parent.id)
        .map((tag) => tag.photoID)
        .map((photoID) => photos.find((u) => u.id === photoID)),
  },
  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `aaa`,
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLiteral: (ast) => ast.value,
  }),
};

module.exports = resolvers;
