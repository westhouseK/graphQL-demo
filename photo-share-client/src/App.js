import React from "react";
import Users from "./Users";
import { gql } from "apollo-boost";
import { BrowserRouter } from 'react-router-dom'
import AuthorizedUser from './AuthorizedUser'

export const ROOT_QUERY = gql`
  query allUsers {
    totalUsers
    allUsers {
      ...userInfo
    }
    me {
      ...userInfo
    }
  }

  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`;

const App = () => (
  <BrowserRouter>
    <div>
      <AuthorizedUser />
      <Users />
    </div>
  </BrowserRouter>
);

// const App = () => <div>a</div>;

export default App;
