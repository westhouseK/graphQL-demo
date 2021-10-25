const { ApolloServer } = require("apollo-server");
const { GraphQLScalarType } = require("graphql");

const typeDefs = `
  scalar DateTime

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }

  type Query {
    totalPhotos: Int!
    allPhotos(after: DateTime): [Photo!]!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }

  type Mutation {
    postPhone(input: PostPhotoInput!): Photo!
  }
`;

var _id = 0;
var users = [
  { githubLogin: "a", name: "a" },
  { githubLogin: "b", name: "b" },
  { githubLogin: "c", name: "c" },
];

var photos = [
  {
    id: "1",
    name: "a",
    description: "a",
    category: "ACTION",
    githubUser: "a",
    created: "1-1-1999"
  },
  {
    id: "2",
    name: "b",
    description: "b",
    category: "ACTION",
    githubUser: "b",
    created: "1/1/2002"
  },
  {
    id: "3",
    name: "c",
    description: "c",
    category: "ACTION",
    githubUser: "b",
    created: "1-1-2000"
  },
];

var tags = [
  {"photoID": "1", userID: "a"},
  {"photoID": "2", userID: "a"},
  {"photoID": "2", userID: "b"},
  {"photoID": "2", userID: "c"},
]

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: (parent, args) => {
      args.after
      return photos
    }
  },
  Mutation: {
    postPhone(parent, args) {
      var newPhoto = {
        id: _id++,
        ...args.input,
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `${parent.id}.jpn`,
    postedBy: (parent) => {
      return users.find((u) => u.githubLogin === parent.githubUser);
    },
    taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id).map(tag => tag.userID).map(userID => users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: (parent) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
    },
    inPhotos: parent => tags.filter(tag => tag.userID === parent.id).map(tag => tag.photoID).map(photoID => photos.find(u => u.id === photoID))
  },
  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `aaa`,
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(`${url}`));
