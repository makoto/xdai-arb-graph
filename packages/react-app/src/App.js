import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider, JsonRpcProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import { Body, SlideContainer, Slider, Container, Header, Link, Button, Red, Green } from "./components";
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

const routerAbi = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_factory","internalType":"address"},{"type":"address","name":"_WETH","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"WETH","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256","name":"amountA","internalType":"uint256"},{"type":"uint256","name":"amountB","internalType":"uint256"},{"type":"uint256","name":"liquidity","internalType":"uint256"}],"name":"addLiquidity","inputs":[{"type":"address","name":"tokenA","internalType":"address"},{"type":"address","name":"tokenB","internalType":"address"},{"type":"uint256","name":"amountADesired","internalType":"uint256"},{"type":"uint256","name":"amountBDesired","internalType":"uint256"},{"type":"uint256","name":"amountAMin","internalType":"uint256"},{"type":"uint256","name":"amountBMin","internalType":"uint256"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[{"type":"uint256","name":"amountToken","internalType":"uint256"},{"type":"uint256","name":"amountETH","internalType":"uint256"},{"type":"uint256","name":"liquidity","internalType":"uint256"}],"name":"addLiquidityETH","inputs":[{"type":"address","name":"token","internalType":"address"},{"type":"uint256","name":"amountTokenDesired","internalType":"uint256"},{"type":"uint256","name":"amountTokenMin","internalType":"uint256"},{"type":"uint256","name":"amountETHMin","internalType":"uint256"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"factory","inputs":[]},{"type":"function","stateMutability":"pure","outputs":[{"type":"uint256","name":"amountIn","internalType":"uint256"}],"name":"getAmountIn","inputs":[{"type":"uint256","name":"amountOut","internalType":"uint256"},{"type":"uint256","name":"reserveIn","internalType":"uint256"},{"type":"uint256","name":"reserveOut","internalType":"uint256"}]},{"type":"function","stateMutability":"pure","outputs":[{"type":"uint256","name":"amountOut","internalType":"uint256"}],"name":"getAmountOut","inputs":[{"type":"uint256","name":"amountIn","internalType":"uint256"},{"type":"uint256","name":"reserveIn","internalType":"uint256"},{"type":"uint256","name":"reserveOut","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256[]","name":"amounts","internalType":"uint256[]"}],"name":"getAmountsIn","inputs":[{"type":"uint256","name":"amountOut","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256[]","name":"amounts","internalType":"uint256[]"}],"name":"getAmountsOut","inputs":[{"type":"uint256","name":"amountIn","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"}]},{"type":"function","stateMutability":"pure","outputs":[{"type":"uint256","name":"amountB","internalType":"uint256"}],"name":"quote","inputs":[{"type":"uint256","name":"amountA","internalType":"uint256"},{"type":"uint256","name":"reserveA","internalType":"uint256"},{"type":"uint256","name":"reserveB","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256","name":"amountA","internalType":"uint256"},{"type":"uint256","name":"amountB","internalType":"uint256"}],"name":"removeLiquidity","inputs":[{"type":"address","name":"tokenA","internalType":"address"},{"type":"address","name":"tokenB","internalType":"address"},{"type":"uint256","name":"liquidity","internalType":"uint256"},{"type":"uint256","name":"amountAMin","internalType":"uint256"},{"type":"uint256","name":"amountBMin","internalType":"uint256"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256","name":"amountToken","internalType":"uint256"},{"type":"uint256","name":"amountETH","internalType":"uint256"}],"name":"removeLiquidityETH","inputs":[{"type":"address","name":"token","internalType":"address"},{"type":"uint256","name":"liquidity","internalType":"uint256"},{"type":"uint256","name":"amountTokenMin","internalType":"uint256"},{"type":"uint256","name":"amountETHMin","internalType":"uint256"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256","name":"amountETH","internalType":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","inputs":[{"type":"address","name":"token","internalType":"address"},{"type":"uint256","name":"liquidity","internalType":"uint256"},{"type":"uint256","name":"amountTokenMin","internalType":"uint256"},{"type":"uint256","name":"amountETHMin","internalType":"uint256"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256","name":"amountToken","internalType":"uint256"},{"type":"uint256","name":"amountETH","internalType":"uint256"}],"name":"removeLiquidityETHWithPermit","inputs":[{"type":"address","name":"token","internalType":"address"},{"type":"uint256","name":"liquidity","internalType":"uint256"},{"type":"uint256","name":"amountTokenMin","internalType":"uint256"},{"type":"uint256","name":"amountETHMin","internalType":"uint256"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"},{"type":"bool","name":"approveMax","internalType":"bool"},{"type":"uint8","name":"v","internalType":"uint8"},{"type":"bytes32","name":"r","internalType":"bytes32"},{"type":"bytes32","name":"s","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256","name":"amountETH","internalType":"uint256"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","inputs":[{"type":"address","name":"token","internalType":"address"},{"type":"uint256","name":"liquidity","internalType":"uint256"},{"type":"uint256","name":"amountTokenMin","internalType":"uint256"},{"type":"uint256","name":"amountETHMin","internalType":"uint256"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"},{"type":"bool","name":"approveMax","internalType":"bool"},{"type":"uint8","name":"v","internalType":"uint8"},{"type":"bytes32","name":"r","internalType":"bytes32"},{"type":"bytes32","name":"s","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256","name":"amountA","internalType":"uint256"},{"type":"uint256","name":"amountB","internalType":"uint256"}],"name":"removeLiquidityWithPermit","inputs":[{"type":"address","name":"tokenA","internalType":"address"},{"type":"address","name":"tokenB","internalType":"address"},{"type":"uint256","name":"liquidity","internalType":"uint256"},{"type":"uint256","name":"amountAMin","internalType":"uint256"},{"type":"uint256","name":"amountBMin","internalType":"uint256"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"},{"type":"bool","name":"approveMax","internalType":"bool"},{"type":"uint8","name":"v","internalType":"uint8"},{"type":"bytes32","name":"r","internalType":"bytes32"},{"type":"bytes32","name":"s","internalType":"bytes32"}]},{"type":"function","stateMutability":"payable","outputs":[{"type":"uint256[]","name":"amounts","internalType":"uint256[]"}],"name":"swapETHForExactTokens","inputs":[{"type":"uint256","name":"amountOut","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[{"type":"uint256[]","name":"amounts","internalType":"uint256[]"}],"name":"swapExactETHForTokens","inputs":[{"type":"uint256","name":"amountOutMin","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","inputs":[{"type":"uint256","name":"amountOutMin","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256[]","name":"amounts","internalType":"uint256[]"}],"name":"swapExactTokensForETH","inputs":[{"type":"uint256","name":"amountIn","internalType":"uint256"},{"type":"uint256","name":"amountOutMin","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","inputs":[{"type":"uint256","name":"amountIn","internalType":"uint256"},{"type":"uint256","name":"amountOutMin","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256[]","name":"amounts","internalType":"uint256[]"}],"name":"swapExactTokensForTokens","inputs":[{"type":"uint256","name":"amountIn","internalType":"uint256"},{"type":"uint256","name":"amountOutMin","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","inputs":[{"type":"uint256","name":"amountIn","internalType":"uint256"},{"type":"uint256","name":"amountOutMin","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256[]","name":"amounts","internalType":"uint256[]"}],"name":"swapTokensForExactETH","inputs":[{"type":"uint256","name":"amountOut","internalType":"uint256"},{"type":"uint256","name":"amountInMax","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"uint256[]","name":"amounts","internalType":"uint256[]"}],"name":"swapTokensForExactTokens","inputs":[{"type":"uint256","name":"amountOut","internalType":"uint256"},{"type":"uint256","name":"amountInMax","internalType":"uint256"},{"type":"address[]","name":"path","internalType":"address[]"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"deadline","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}]

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
  const [ amount, setAmount ] = useState();
  const [ mainnetPrice, setMainnetPrice ] = useState();
  const [ xDaiPrice, setXdaiPrice ] = useState();
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

  async function getMainnetQuote(fromAddress, amount){
    const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'
    const result = await fetch(`https://api.1inch.exchange/v2.0/quote?fromTokenAddress=${daiAddress}&toTokenAddress=${fromAddress}&amount=${amount * Math.pow(10, 18)}`)
    const data = await result.json()
    console.log('*** getMainnetQuote', data)

    setMainnetPrice(data)
    return data
  }
  
  async function getXDaiQuote(quotePromise){
    let quote = await quotePromise
    console.log('**readOnChainData1', {quote})
    const defaultProvider = new JsonRpcProvider('https://rpc.xdaichain.com/')
    const wxdaiAddress = '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'
    const fromAddress = xDaiAddress.id
    const routerAddress = '0x1C232F01118CB8B424793ae03F870aa7D0ac7f77'
    const xdaiAmount = quote.toTokenAmount
    try{
      const router = new Contract(routerAddress, routerAbi, defaultProvider);
      console.log('**getXDaiQuote1', xdaiAmount, [fromAddress, wxdaiAddress])
      const [token0amount, token1amount] = await router.getAmountsOut(xdaiAmount, [fromAddress, wxdaiAddress])
      window.token0amount = token0amount
      window.token1amount = token1amount
      console.log('**getXDaiQuote2', {token0amount:token0amount.toString(), token1amount:token1amount.toString()})
      setXdaiPrice(token1amount)
    }catch(e){
      console.log('**getXDaiQuote3', e.message)
      // setMessage(e.message)
      setMessage('Error getting xDai quote')
      return false
    }
    // if(homeTokenAddress){
    //   setMessage('')
    //   setMainnetAddress(homeTokenAddress.toLocaleLowerCase())
    // }else{
    //   setMessage('This token does not exist on Mainnet')
    // }
    return data
  }

  async function readOnChainData(tokenAddress) {
    console.log('**readOnChainData1', {tokenAddress})
    const defaultProvider = new JsonRpcProvider('https://rpc.xdaichain.com/')
    let homeTokenAddress
    try{
      const token = new Contract(tokenAddress, bridgeAbi, defaultProvider);
      const bridgeAddress = await token.bridgeContract()
      const ceaErc20 = new Contract(bridgeAddress, bridgeAbi, defaultProvider);
      homeTokenAddress = await ceaErc20.foreignTokenAddress(tokenAddress);
    }catch(e){
      console.log('**readOnChainData4')
      // setMessage(e.message)
      setMessage('Either error or this token did not come from Mainnet')
      return false
    }
    if(homeTokenAddress){
      setMessage('')
      setMainnetAddress(homeTokenAddress.toLocaleLowerCase())
    }else{
      setMessage('This token does not exist on Mainnet')
    }
  }

  // console.log('***data', {xdaiTokenData, data, data2})
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
    // console.log('***data', {xDaiAddress, mainnetAddress, historyData, historyData1, historyData2})
    if( historyData2 && historyData2.length > 0){
      for (let index = 0; index < historyData2.length; index++) {
        const d2 = historyData2[index];
        const d1 = historyData1[index];
        let pctDiff
        if (d1 && d2){
          const diff = (d1['xdaiPrice'] - d2['mainnetPrice'])
          const mid = (d1['xdaiPrice'] + d2['mainnetPrice']) / 2
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
    const handleXDaiChange = (e) => {
      console.log('***handleXDaiChange', e)
      readOnChainData(e.value.id)
      setXDaiAddress(e.value)
    }
    const handleChangeAmount = (e) => {
      console.log('***handleChangeAmont', e.target.value)
      setAmount(e.target.value)
    }

    const handleSubmitAmount = (e) => {
      console.log('*** handleSubmitAMount', {amount})
      let quote = getMainnetQuote(mainnetAddress, amount)
      getXDaiQuote(quote)
    }
    let mainnetPriceToDisplay
    if(mainnetPrice){
      const fromDecimal = mainnetPrice.fromToken.decimals
      const toDecimal = mainnetPrice.toToken.decimals
      let devider = 1
      mainnetPriceToDisplay = parseInt(mainnetPrice.toTokenAmount) / parseFloat(mainnetPrice.fromTokenAmount)
    }
    console.log('***mainnetPriceToDisplay', {mainnetPrice, mainnetPriceToDisplay})
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
            <input onChange={ handleChangeAmount }>
            </input>
            <Button
              onClick={handleSubmitAmount}
            >Get Quote</Button>
            {mainnetPrice && (
              <>
                <br />
                {amount} {mainnetPrice.fromToken.symbol} is {
                  mainnetPrice.toTokenAmount / Math.pow(10,18)
                } {mainnetPrice.toToken.symbol} 
                (1 {mainnetPrice.toToken.symbol} is ({parseFloat(mainnetPrice.fromTokenAmount) / parseInt(mainnetPrice.toTokenAmount)}) {mainnetPrice.fromToken.symbol}) on Mainnet is 
                 { amount < xDaiPrice / Math.pow(10,18) ? (
                  <Green>{xDaiPrice / Math.pow(10,18)} {mainnetPrice.fromToken.symbol}</Green>
                 ): (
                  <Red>{xDaiPrice / Math.pow(10,18)} {mainnetPrice.fromToken.symbol}</Red>
                 )}
                 on xDai
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
