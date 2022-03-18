const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

function TravellerRow(props) {
  const issue = props.issue;
  return (
    <tr>
      <td>{issue.id}</td>
      <td>{issue.owner}</td>
      <td>{issue.phoneNumber}</td>
      <td>{issue.created.toDateString()}</td>
    </tr>
  );
}

function TravellerTable(props) {
  const rows = props.issues.map(issue =>
    <TravellerRow key={issue.id} issue={issue} />
  );

  return (
    <table className="bordered-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Phone Number</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
}

class IssueAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.issueAdd;
    const issue = {
      owner: form.owner.value, phoneNumber: form.phoneNumber.value,
    }
    this.props.createIssue(issue);
    form.owner.value = ""; form.phoneNumber.value = "";
  }

  render() {
    return (
      <div className="form">
      <form name="issueAdd" onSubmit={this.handleSubmit}>
        <label htmlFor="owner"><b>Add Traveller: </b></label> <br/>        
        <input type="text" name="owner" placeholder="Name" />&nbsp;
        <input type="text" name="phoneNumber" placeholder="Phone Number" />
        &nbsp;&nbsp;
        <button className="button">Add</button>
      </form>
      </div>
    );
  }
}

class DeleteTraveller extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.travellerDeleteForm;
    const traveller = {
      id: form.id.value
      // owner: form.owner.value, phoneNumber: form.phoneNumber.value,
      // due: new Date(new Date().getTime() + 1000*60*60*24*10),
    }
    this.props.deleteTravellerFunction(traveller);
    form.id.value = "";
  }

  render() {
    return (
      <div>
      <form name="travellerDeleteForm" onSubmit={this.handleSubmit}>
        <label htmlFor="id"><b>Delete Traveller: </b></label> <br/>
        <input type="text" name="id" placeholder="Ticket ID" id="id" />
        &nbsp;&nbsp;
        <button className="button">Delete</button>
      </form>
      </div>
    );
  }
}



async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}
/*
 * Code for adding new component: BlackList
 */

class BlackList extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.BlackList;
    /*const issue = {
      owner: form.owner.value, title: form.title.value,
      due: new Date(new Date().getTime() + 1000*60*60*24*10),
    }*/
    const name = form.owner.value;
    /*
     * To write the GraphQL query
     */

    const query = `mutation mycreateBlackList($name: String!) {
      createBlackList(name: $name)
    }`;

    const data = await graphQLFetch(query, { name });
    form.owner.value = ""; 
    // form.title.value = "";
  }
  render() {
    return (
      <form name="BlackList" onSubmit={this.handleSubmit}>
        <label htmlFor="owner"><b>Blacklist: </b></label> <br/>
        <input type="text" name="owner" placeholder="Owner" />
        &nbsp;&nbsp;
        <button className="button">Add</button>
      </form>
    );
  }
}

class Registration extends React.Component {
    constructor() {
      super();
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    async handleSubmit(e) {
      e.preventDefault();
      const form = document.forms.registration;
      const user = {
        username: form.username.value, 
        password: form.password.value,
      }
      // this.props.createIssue(issue);
      //To Do: Make a call to GraphQL to addUser
      const mt = `mutation mymutationforaddinguser($user: User!) {
        addUser(user: $user)
      }`;
  
      const data = await graphQLFetch(mt, { user });
      form.username.value = ""; form.password.value = "";
    }
  
    render() {
      return (
        <form name="registration" onSubmit={this.handleSubmit}>
          <input type="text" name="username" placeholder="Username" />
          <input type="text" name="password" placeholder="Password" />
          &nbsp;&nbsp;
          <button className="button">Register</button>
        </form>
      );
    }
  }


class TravellerList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
    this.deleteTravellerFunction = this.deleteTravellerFunction.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      issueList {
        id phoneNumber owner
        created
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ issues: data.issueList });
    }
  }

  async createIssue(issue) {
    const query = `mutation issueAdd($issue: IssueInputs!) {
      issueAdd(issue: $issue) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { issue });
    console.log(data)
    if (data) {
      console.log(this)
      this.loadData();
    }
  }

  async deleteTravellerFunction(traveller) {
    const query = `mutation travellerDelete($traveller: TravellerInputs!) {
      travellerDelete(traveller: $traveller)
    }`;

    const data = await graphQLFetch(query, { traveller });
    console.log(data)
    if (data) {
      this.loadData();
    }
  }  

  render() {
    return (
      <React.Fragment>
        <h1 id='top_banner'>SINGAPORE HIGH-SPEED INTERCONTINENTAL RAILWAY</h1>

        <br />
        <center><h2>Train Ticket Booking System</h2></center>
        <br/>
        <TravellerTable issues={this.state.issues} />
        <br/>
        <IssueAdd createIssue={this.createIssue} />
	      <br/>
        <DeleteTraveller deleteTravellerFunction={this.deleteTravellerFunction}/>
        <br/>
	      <BlackList/>
      </React.Fragment>
    );
  }
}

const element = <TravellerList />;

ReactDOM.render(element, document.getElementById('contents'));
