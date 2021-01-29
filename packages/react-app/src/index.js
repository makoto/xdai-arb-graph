import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  uri: "https://graph.ginete.in/subgraphs/name/matic/quickswap"
});
const mainnetClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"
});

const mainnetMaticClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/maticnetwork/mainnet-root-subgraphs"
});

ReactDOM.render(
  <ApolloProvider client={client} >
    <App mainnetClient={mainnetClient} mainnetMaticClient={mainnetMaticClient} />
  </ApolloProvider>,
  document.getElementById("root"),
);
