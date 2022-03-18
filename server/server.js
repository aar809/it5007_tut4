const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/issuetracker';

// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';

// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';

let db;

let aboutMessage = "Issue Tracker API v1.0";

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

const resolvers = {
  Query: {
    about: () => aboutMessage,
    issueList,
  },
  Mutation: {
    setAboutMessage,
    issueAdd,
    createBlackList,
    travellerDelete,
    addUser,
  },
  GraphQLDate,
};

async function getNextCount(name) {
  const result = await db.collection('usercnt').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function addUser(_, {user}) {
  const latestcount = await getNextCount('count');
  user.id = latestcount;
  const returnval = await db.collection('userinfo').insertOne(user);
  // return "Success";
}

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
}

async function createBlackList(_, {name})
{
	/*Logic to add blacklist name to DB
	 */
	console.log("**Entering BlackList function**");
	//const result = await db.collections('whitelist').insertOne(name);
  result = await db.collection('blacklist').insertOne({owner: name});

	return "Done";
}

async function issueList() {
  const issues = await db.collection('issues').find({}).toArray();
  return issues;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

function issueValidate(issue) {
  const errors = [];
  if (issue.phoneNumber.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }
  if (issue.status === 'Assigned' && !issue.owner) {
    errors.push('Field "owner" is required when status is "Assigned"');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function issueAdd(_, { issue }) {
  // issueValidate(issue)
  var savedIssue;
  // issueValidate(issue);
  issue.created = new Date();
  issue.id = await getNextSequence('issues');
  
  /*
   * Code to check in the whitelist
   */
  const hits = await db.collection('blacklist').find({owner: issue.owner}).count();
  if (hits===0) {
  const result = await db.collection('issues').insertOne(issue);
  savedIssue = await db.collection('issues')
    .findOne({ _id: result.insertedId });
  }
  return savedIssue;
}


async function travellerDelete(_, { traveller }) {
  var savedIssue;
  // issueValidate(issue);
  // issue.created = new Date();
  // issue.id = await getNextSequence('issues');
  
  /*
   * Code to check in the whitelist
   */
  // const hits = await db.collection('whitelist').find({owner: issue.owner}).count();
  // if (hits>0) {
  const result = await db.collection('issues').deleteOne({id: traveller.id});
  // db.employees.deleteOne({id:4})
  savedIssue = await db.collection('issues')
    .findOne({ _id: result.insertedId });
  // }
  return savedIssue;
}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try {
    await connectToDb();
    app.listen(3000, function () {
      console.log('App started on port 3000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();
