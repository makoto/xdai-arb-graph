import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import moment from 'moment'
import { Body, SlideContainer } from "./index";
import Chart from "./chart"
import {
  GET_HOUR_DATA,
} from "../graphql/subgraph";

function parseData(data, key){
  return (data && data.tokenDayDatas && data.tokenDayDatas.map(d => {
    let r = {
      date: moment(parseInt(d.date) * 1000).format("MMM Do kk:mm:ss")
    }
    r[`${key}Volume`] = parseFloat(d.dailyVolumeUSD)
    r[`${key}Liquidity`] = parseFloat(d.totalLiquidityUSD)
    r[`${key}Price`] = parseFloat(d.priceUSD)
    return r
  })) || []
}

export default function Historical({targetTokenId, baseTokenId, rootClient}) {
  console.log('***Historical', {targetTokenId, baseTokenId})
  const { loading, error, data  } = useQuery(GET_HOUR_DATA, {
    // client: destinationClient,
    variables:{ tokenId: targetTokenId },
    skip: !targetTokenId
  });

  const { loading:loading2, error:error2, data:data2  } = useQuery(GET_HOUR_DATA, {
    client: rootClient,
    variables:{ tokenId: baseTokenId },
    skip: !baseTokenId
  });
  if(loading || loading2){
    return 'loading'
  }

  let historyData = [], historyData1, historyData2, num
  historyData1 = parseData(data, 'matic')
  historyData2 = parseData(data2, 'mainnet')
  console.log('***history', {historyData, historyData1, historyData2})
  if( historyData2 && historyData2.length > 0){
    for (let index = 0; index < historyData2.length; index++) {
      const d2 = historyData2[index];
      const d1 = historyData1[index];
      let pctDiff
      if (d1 && d2){
        const diff = (d1['maticPrice'] - d2['mainnetPrice'])
        const mid = (d1['maticPrice'] + d2['mainnetPrice']) / 2
        pctDiff =  diff / mid * 100
        if(pctDiff > 30) pctDiff = 30
        if(pctDiff < -30) pctDiff = -30
      }
      historyData[index] = {
        ...d2, ...d1, ...{pctDiff}
      }
    }
  }
  historyData = historyData.reverse()
  num = historyData.length  
  return(
    <>
      <h2>Historical Data</h2>
      <SlideContainer>
        <p>
          Plotting { num } points btw { historyData[0].date } and { historyData[num - 1].date } 
        </p>

      </SlideContainer>
      <Body>
        <Chart data={historyData } xKey={'date'} yKeys={['maticPrice', 'mainnetPrice']} />
        <Chart data={historyData } xKey={'date'} yKeys={['pctDiff']} />
        <Chart data={historyData } xKey={'date'} brush={true} yKeys={['maticLiquidity', 'maticVolume']} />
        <Chart data={historyData } xKey={'date'} yKeys={['mainnetLiquidity', 'mainnetVolume']} />
      </Body>
    </>
  )
}