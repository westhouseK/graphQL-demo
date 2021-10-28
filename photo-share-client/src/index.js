import React from "react";
import { render } from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { ApolloProvider } from "react-apollo";
import ApolloClient, { gql, InMemoryCache } from "apollo-boost";
import { persistCache } from "apollo-cache-persist";

const cache = new InMemoryCache();
persistCache({
  cache,
  storage: localStorage,
});

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache,
  request: (operation) => {
    operation.setContext((context) => ({
      headers: {
        ...context.headers,
        authorization: localStorage.getItem("token"),
      },
    }));
  },
});

if(localStorage['apollo-cache-persist']) { 
  let cacheData = JSON.parse(localStorage['apollo-cache-persist'])
  cache.restore(cacheData)
}

// とりあえず試してみた
const query = gql`
  {
    totalUsers
    totalPhotos
  }
`;

console.log(client.extract());
client
  .query({ query })
  .then(() => console.log(client.extract()))
  .catch(console.error);

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
