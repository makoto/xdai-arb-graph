import { gql } from "apollo-boost";

// See more example queries on https://thegraph.com/explorer/subgraph/paulrberg/create-eth-app

export const GET_HOUR_DATA = gql`
  query tokenDayDatas($tokenId: String!){
    tokenDayDatas(first: 100, orderBy: date, orderDirection: desc, where: { token: $tokenId}) {
      id
      date
      token
      { id symbol }
      priceUSD
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`;

export const MATIC_TOKEN_DATA = gql`
  query {
    tokens(first:100, orderBy:tradeVolumeUSD, orderDirection: desc, where:{
      totalLiquidity_gt:10,
      tradeVolume_gt:1
    }){
      id,
      symbol,
      decimals,
      totalLiquidity
      tradeVolumeUSD
      untrackedVolumeUSD
      txCount
      derivedETH
    }
  }
`

export const MAINNET_TOKEN_DATA = gql`
  query tokens($symbol:String!){
    tokens(first:100, orderBy:tradeVolumeUSD, orderDirection: desc, where:{
      symbol:$symbol
    }){
      id,
      symbol,
      totalLiquidity
      tradeVolumeUSD
      untrackedVolumeUSD
      txCount
      derivedETH
    }
  }
`