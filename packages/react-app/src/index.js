import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";

const destinationClient = new ApolloClient({
  uri: "https://graph.ginete.in/subgraphs/name/matic/quickswap"
});
const rootClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"
});

const mappingClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/maticnetwork/mainnet-root-subgraphs"
});

ReactDOM.render(
  <ApolloProvider client={destinationClient} >
    <App
      rootClient={rootClient}
      mappingClient={mappingClient}
    />
  </ApolloProvider>,
  document.getElementById("root"),
);
