/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo issuetracker scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetracker scripts/init.mongo.js
 * MLab:
 *   mongo mongodb://user:pwd@xxx.mlab.com:33533/issuetracker scripts/init.mongo.js
 */

db.issues.remove({});
// db.userinfo.remove({});

const issuesDB = [
  {
    id: 1, owner: 'Jack',
    created: new Date('2019-01-15'),
    phoneNumber: 61240987,
  },
  {
    id: 2, owner: 'Rose',
    created: new Date('2019-01-16'), 
    phoneNumber: 55593412,
  },
];


// const sampleusers = [
//   {
//     username: 'prasanna', password: '1234',id:1
//   },
//   {
//     username:'karthik', password:'1234',id:2
//   }
// ];

// db.userinfo.insertMany(sampleusers);
// const usercount=db.userinfo.count();
// db.usercnt.insert({_id:'count', current: usercount});

db.issues.insertMany(issuesDB);
const count = db.issues.count();
print('Inserted', count, 'travellers into traveller list');

db.counters.remove({ _id: 'issues' });
db.counters.insert({ _id: 'issues', current: count });

/*
 *New code starts
 * */
db.blacklist.remove({});
db.blacklist.insert({owner: "Bonnie"});
db.blacklist.insert({owner: "Clyde"});
const count2 = db.blacklist.count();
print('Inserted', count2, 'travellers into blacklist');


/*
 * New code ends
 */


db.issues.createIndex({ id: 1 }, { unique: true });
db.issues.createIndex({ status: 1 });
db.issues.createIndex({ owner: 1 });
db.issues.createIndex({ created: 1 });
