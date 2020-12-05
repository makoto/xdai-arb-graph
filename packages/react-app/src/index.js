import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/1hive/uniswap-v2"
});
const mainnetClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"
});

ReactDOM.render(
  <ApolloProvider client={client} >
    <App mainnetClient={mainnetClient}/>
  </ApolloProvider>,
  document.getElementById("root"),
);
