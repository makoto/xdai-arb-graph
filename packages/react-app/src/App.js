import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider, JsonRpcProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import { Body, SlideContainer, Slider, Container, Header, Link } from "./components";
import Select from 'react-select';

import { addresses, abis } from "@project/contracts";
import {
  GET_HOUR_DATA,
  XDAI_TOKEN_DATA,
  MAINNET_TOKEN_DATA
} from "./graphql/subgraph";
// import indexEntities from "./data/indexEntities"
// import indexHistories from "./data/indexHistories"
import Chart from "./components/chart"
import moment from 'moment'
import _ from 'lodash'
const bridgeAbi = [{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"relayTokens","inputs":[{"type":"address","name":"token"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setExecutionMaxPerTx","inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_maxPerTx"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"maxPerTx","inputs":[{"type":"address","name":"_token"}],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"bool","name":""}],"name":"isRewardAddress","inputs":[{"type":"address","name":"_addr"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"fixFailedMessage","inputs":[{"type":"bytes32","name":"_messageId"}],"constant":false},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setBridgeContract","inputs":[{"type":"address","name":"_bridgeContract"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"bool","name":""}],"name":"withinLimit","inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_amount"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"removeRewardAddress","inputs":[{"type":"address","name":"_addr"}],"constant":false},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"handleBridgedTokens","inputs":[{"type":"address","name":"_token"},{"type":"address","name":"_recipient"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"executionMaxPerTx","inputs":[{"type":"address","name":"_token"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setTokenImage","inputs":[{"type":"address","name":"_tokenImage"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"bool","name":""}],"name":"isTokenRegistered","inputs":[{"type":"address","name":"_token"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setDailyLimit","inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_dailyLimit"}],"constant":false},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"deployAndHandleBridgedTokens","inputs":[{"type":"address","name":"_token"},{"type":"string","name":"_name"},{"type":"string","name":"_symbol"},{"type":"uint8","name":"_decimals"},{"type":"address","name":"_recipient"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"bool","name":""}],"name":"isInitialized","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"bool","name":""}],"name":"withinExecutionLimit","inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_amount"}],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"getCurrentDay","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"executionDailyLimit","inputs":[{"type":"address","name":"_token"}],"constant":true},{"type":"function","stateMutability":"pure","payable":false,"outputs":[{"type":"bytes4","name":"_data"}],"name":"getBridgeMode","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"address","name":""}],"name":"foreignTokenAddress","inputs":[{"type":"address","name":"_homeToken"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setFee","inputs":[{"type":"bytes32","name":"_feeType"},{"type":"address","name":"_token"},{"type":"uint256","name":"_fee"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"bool","name":""}],"name":"messageFixed","inputs":[{"type":"bytes32","name":"_messageId"}],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"getFee","inputs":[{"type":"bytes32","name":"_feeType"},{"type":"address","name":"_token"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"claimTokens","inputs":[{"type":"address","name":"_token"},{"type":"address","name":"_to"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"address","name":""}],"name":"getNextRewardAddress","inputs":[{"type":"address","name":"_address"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setMediatorContractOnOtherSide","inputs":[{"type":"address","name":"_mediatorContract"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"calculateFee","inputs":[{"type":"bytes32","name":"_feeType"},{"type":"address","name":"_token"},{"type":"uint256","name":"_value"}],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"rewardAddressCount","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"maxAvailablePerTx","inputs":[{"type":"address","name":"_token"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setExecutionDailyLimit","inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_dailyLimit"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"address","name":""}],"name":"mediatorContractOnOtherSide","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"address","name":""}],"name":"owner","inputs":[],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"requestFailedMessageFix","inputs":[{"type":"bytes32","name":"_messageId"}],"constant":false},{"type":"function","stateMutability":"pure","payable":false,"outputs":[{"type":"uint64","name":"major"},{"type":"uint64","name":"minor"},{"type":"uint64","name":"patch"}],"name":"getBridgeInterfacesVersion","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"minPerTx","inputs":[{"type":"address","name":"_token"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[{"type":"bool","name":""}],"name":"onTokenTransfer","inputs":[{"type":"address","name":"_from"},{"type":"uint256","name":"_value"},{"type":"bytes","name":"_data"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"totalSpentPerDay","inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_day"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"relayTokens","inputs":[{"type":"address","name":"token"},{"type":"address","name":"_receiver"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"addRewardAddress","inputs":[{"type":"address","name":"_addr"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"requestGasLimit","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"address","name":""}],"name":"tokenImage","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"address","name":""}],"name":"F_ADDR","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"address","name":""}],"name":"bridgeContract","inputs":[],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setMaxPerTx","inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_maxPerTx"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"address","name":""}],"name":"homeTokenAddress","inputs":[{"type":"address","name":"_foreignToken"}],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"address[]","name":""}],"name":"rewardAddressList","inputs":[],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setMinPerTx","inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_minPerTx"}],"constant":false},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[{"type":"bool","name":""}],"name":"initialize","inputs":[{"type":"address","name":"_bridgeContract"},{"type":"address","name":"_mediatorContract"},{"type":"uint256[3]","name":"_dailyLimitMaxPerTxMinPerTxArray"},{"type":"uint256[2]","name":"_executionDailyLimitExecutionMaxPerTxArray"},{"type":"uint256","name":"_requestGasLimit"},{"type":"address","name":"_owner"},{"type":"address","name":"_tokenImage"},{"type":"address[]","name":"_rewardAddreses"},{"type":"uint256[2]","name":"_fees"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"totalExecutedPerDay","inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_day"}],"constant":true},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"transferOwnership","inputs":[{"type":"address","name":"newOwner"}],"constant":false},{"type":"function","stateMutability":"nonpayable","payable":false,"outputs":[],"name":"setRequestGasLimit","inputs":[{"type":"uint256","name":"_requestGasLimit"}],"constant":false},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"bytes32","name":""}],"name":"FOREIGN_TO_HOME_FEE","inputs":[],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"uint256","name":""}],"name":"dailyLimit","inputs":[{"type":"address","name":"_token"}],"constant":true},{"type":"function","stateMutability":"view","payable":false,"outputs":[{"type":"bytes32","name":""}],"name":"HOME_TO_FOREIGN_FEE","inputs":[],"constant":true},{"type":"event","name":"NewTokenRegistered","inputs":[{"type":"address","name":"foreignToken","indexed":true},{"type":"address","name":"homeToken","indexed":true}],"anonymous":false},{"type":"event","name":"FeeUpdated","inputs":[{"type":"bytes32","name":"feeType","indexed":false},{"type":"address","name":"token","indexed":true},{"type":"uint256","name":"fee","indexed":false}],"anonymous":false},{"type":"event","name":"FeeDistributed","inputs":[{"type":"uint256","name":"fee","indexed":false},{"type":"address","name":"token","indexed":true},{"type":"bytes32","name":"messageId","indexed":true}],"anonymous":false},{"type":"event","name":"FailedMessageFixed","inputs":[{"type":"bytes32","name":"messageId","indexed":true},{"type":"address","name":"token","indexed":false},{"type":"address","name":"recipient","indexed":false},{"type":"uint256","name":"value","indexed":false}],"anonymous":false},{"type":"event","name":"TokensBridged","inputs":[{"type":"address","name":"token","indexed":true},{"type":"address","name":"recipient","indexed":true},{"type":"uint256","name":"value","indexed":false},{"type":"bytes32","name":"messageId","indexed":true}],"anonymous":false},{"type":"event","name":"DailyLimitChanged","inputs":[{"type":"address","name":"token","indexed":true},{"type":"uint256","name":"newLimit","indexed":false}],"anonymous":false},{"type":"event","name":"ExecutionDailyLimitChanged","inputs":[{"type":"address","name":"token","indexed":true},{"type":"uint256","name":"newLimit","indexed":false}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"type":"address","name":"previousOwner","indexed":false},{"type":"address","name":"newOwner","indexed":false}],"anonymous":false},{"type":"event","name":"RewardAddressAdded","inputs":[{"type":"address","name":"addr","indexed":true}],"anonymous":false},{"type":"event","name":"RewardAddressRemoved","inputs":[{"type":"address","name":"addr","indexed":true}],"anonymous":false}]

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

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function App({ mainnetClient }) {
  const [ selectedOption, setSelectedOption ] = useState();
  const [ xDaiAddress, setXDaiAddress ] = useState();
  const [ message, setMessage ] = useState();
  const [ mainnetAddress, setMainnetAddress ] = useState();
  const [ selectedMainnetOption, setSelectedMainnetOption ] = useState();
  console.log({xDaiAddress, mainnetAddress})
  const { xdaiTokenLoading, xdaiTokenError, data: xdaiTokenData   } = useQuery(XDAI_TOKEN_DATA);
  const { mainnetTokenLoading, mainnetTokenError, data: mainnetTokenData   } = useQuery(MAINNET_TOKEN_DATA, {
    client:mainnetClient,
    variables:{
      symbol:xDaiAddress && xDaiAddress.symbol
    },
    skip: !xDaiAddress
  });

  const options = xdaiTokenData && xdaiTokenData.tokens && xdaiTokenData.tokens.map(t => {
    return {
      label: `${t.symbol} (trade volume: USD ${numberWithCommas(parseInt(t.tradeVolumeUSD))})`,
      value:t
     }
    // return {label: t.symbol, value:t.symbol}
  })

  const mainnetOptions = mainnetTokenData && mainnetTokenData.tokens && mainnetTokenData.tokens.map(t => {
    return {
      label: `${t.symbol} (trade volume: USD ${numberWithCommas(parseInt(t.tradeVolumeUSD))})`,
      // value:t.id
      value:t
     }
    // return {label: t.symbol, value:t.symbol}
  })

  const { loading, error, data  } = useQuery(GET_HOUR_DATA, {
    variables:{ tokenId: xDaiAddress && xDaiAddress.id },
    skip: !xDaiAddress
  });

  const { loading:loading2, error:error2, data:data2  } = useQuery(GET_HOUR_DATA, {
    client: mainnetClient,
    variables:{ tokenId: mainnetAddress },
    skip: !mainnetAddress
  });

  async function readOnChainData(tokenAddress) {
    console.log('**readOnChainData1', tokenAddress)
    const defaultProvider = new JsonRpcProvider('https://rpc.xdaichain.com/')
    let tokenBalance
    try{
      const token = new Contract(tokenAddress, bridgeAbi, defaultProvider);
      console.log('**readOnChainData2')
      const bridgeAddress = await token.bridgeContract()
      console.log('**readOnChainData3')
      const ceaErc20 = new Contract(bridgeAddress, bridgeAbi, defaultProvider);
      console.log('**readOnChainData4')
      // A pre-defined address that owns some CEAERC20 tokens
      tokenBalance = await ceaErc20.foreignTokenAddress(tokenAddress);
      console.log('**readOnChainData5')  
    }catch(e){
      // setMessage(e.message)
      setMessage('Either error or this token did not come from Mainnet')
      return false
    }
    if(tokenBalance){
      console.log('**readOnChainData6')
      setMessage('')
      setMainnetAddress(tokenBalance.toLocaleLowerCase())
    }else{
      console.log('**readOnChainData7')
      setMessage('This token does not exist on Mainnet')
    }
  }

  console.log('***data', {xdaiTokenData, data, data2})
  let historyData = [], historyData1, historyData2, num
  // React.useEffect(() => {
  //   console.log({indexHistories})

  //   if (!loading && !error && data && data.transfers) {
  //     console.log({ transfers: data.transfers });
  //   }
  // }, [loading, error, data]);
  if(error){
    return(JSON.stringify(error))
  }else{
    // console.log({data})
    historyData1 = parseData(data, 'xdai')
    historyData2 = parseData(data2, 'mainnet')
    console.log('***data', {xDaiAddress, mainnetAddress, historyData, historyData1, historyData2})
    if( historyData2 && historyData2.length > 0){
      for (let index = 0; index < historyData2.length; index++) {
        const d2 = historyData2[index];
        const d1 = historyData1[index];
        let pctDiff
        if (d1 && d2){
          const diff = Math.abs(d2['mainnetPrice'] - d1['xdaiPrice'])
          const mid = (d2['mainnetPrice'] + d1['xdaiPrice']) / 2
          pctDiff =  diff / mid * 100
          if(pctDiff > 50) pctDiff = 50
        }
        historyData[index] = {
          ...d2, ...d1, ...{pctDiff}
        }
      }
    }
    historyData = historyData.reverse()
    num = historyData.length  
    const handleXDaiChange = (e) => {
      readOnChainData(e.value.id)
      setXDaiAddress(e.value)
    }
    const handleMainnetChange = (e) => {
      console.log({e})
      setMainnetAddress(e.value)
    }
  
    return (
      <>
        <Header>⚔️ Crosschain Arbitrage 🦅 opportunity graph 📈 </Header>
        <Container>
          <p>
            This chart is extended from <Link href="https://github.com/makoto/indexcoop-dpi-token">DPI arb chart</Link>.
            Choose tokens which are on <Link href="https://info.honeyswap.org/tokens">Honeyswap</Link>, Uniswap clone on xDai.
            <br />
          </p>
          <div>
            <Select
              value={selectedOption}
              onChange={handleXDaiChange}
              options={options}
            />
            {xdaiTokenData && (
              <>
              On xDai: {xDaiAddress && xDaiAddress.id} 
              On Mainnet: {message || mainnetAddress}
              </>
            )}

            { (message || !historyData || num === 0 ) ? ('') : (
              <>
                <SlideContainer>
                  <p>
                    Plotting { num } points btw { historyData[0].date } and { historyData[num - 1].date } 
                  </p>

                </SlideContainer>
                <Body>
                  <Chart data={historyData } xKey={'date'} yKeys={['xdaiPrice', 'mainnetPrice']} />
                  <Chart data={historyData } xKey={'date'} yKeys={['pctDiff']} />
                  <Chart data={historyData } xKey={'date'} yKeys={['xdaiLiquidity', 'xdaiVolume']} />
                  <Chart data={historyData } xKey={'date'} yKeys={['mainnetLiquidity', 'mainnetVolume']} />
                </Body>
              </>
            ) }
          </div>
        </Container>
      </>
    );  
  }
}

export default App;
