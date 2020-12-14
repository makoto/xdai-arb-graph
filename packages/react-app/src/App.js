import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider, JsonRpcProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import { Body, SlideContainer, Slider, Container, Header, Link, Button, Red, Green, NumberInput } from "./components";
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
import _, { set } from 'lodash'
const XDAICHAIN_ENDPOINT = 'https://dai.poa.network'

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
  const [ amount2, setAmount2 ] = useState();
  const [ mainnetPrice, setMainnetPrice ] = useState();
  const [ xDaiPrice, setXdaiPrice ] = useState();
  const [ quotes, setQuotes ] = useState([]);
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
    const inputAmount = parseInt(amount * Math.pow(10, 18))
    console.log('*** getMainnetQuote1', {fromAddress, amount, inputAmount})
    const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'
    const result = await fetch(`https://api.1inch.exchange/v2.0/quote?fromTokenAddress=${daiAddress}&toTokenAddress=${fromAddress}&amount=${inputAmount}`)
    const data = await result.json()
    console.log('*** getMainnetQuote2', {fromAddress, amount, data})

    setMainnetPrice(data)
    return data
  }
  
  async function getXDaiQuote(quotePromise){
    let quote = await quotePromise
    console.log('**readOnChainData1', {quote})
    const defaultProvider = new JsonRpcProvider(XDAICHAIN_ENDPOINT)
    const wxdaiAddress = '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'
    const fromAddress = xDaiAddress.id
    const routerAddress = '0x1C232F01118CB8B424793ae03F870aa7D0ac7f77'
    const xdaiAmount = quote.toTokenAmount
    let xdaiQuotes
    try{
      const router = new Contract(routerAddress, abis.router, defaultProvider);
      console.log('**getXDaiQuote1', xdaiAmount, [fromAddress, wxdaiAddress])
      xdaiQuotes = await router.getAmountsOut(xdaiAmount, [fromAddress, wxdaiAddress])
      console.log('**getXDaiQuote1.1', xdaiQuotes)
      console.log('**getXDaiQuote2', {token0amount:xdaiQuotes[0].toString(), token1amount:xdaiQuotes[1].toString()})
      setXdaiPrice(xdaiQuotes[1])
    }catch(e){
      console.log('**getXDaiQuote3', e.message)
      setMessage('Error getting xDai quote')
      return false
    }
    return xdaiQuotes[1]
  }

  async function readOnChainData(tokenAddress) {
    console.log('**readOnChainData1', {tokenAddress, abis})
    const defaultProvider = new JsonRpcProvider(XDAICHAIN_ENDPOINT)
    let homeTokenAddress
    try{
      const token = new Contract(tokenAddress, abis.bridge, defaultProvider);
      const bridgeAddress = await token.bridgeContract()
      const ceaErc20 = new Contract(bridgeAddress, abis.bridge, defaultProvider);
      homeTokenAddress = await ceaErc20.foreignTokenAddress(tokenAddress);
    }catch(e){
      console.log('**readOnChainData4')
      // setMessage(e.message)
      setMessage('Either error or this token did not come from Mainnet')
      setMainnetAddress(null)
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
      setQuotes([])
      setAmount(null)
      setAmount2(null)
      readOnChainData(e.value.id)
      setXDaiAddress(e.value)
    }
    const handleChangeAmount = (e) => {
      console.log('***handleChangeAmont', e.target.value)
      setAmount(e.target.value)
    }
    const handleChangeAmount2 = (e) => {
      console.log('***handleChangeAmont', e.target.value)
      setAmount2(e.target.value)
    }

    const handleSubmitAmount = async (e) => {
      setQuotes([])
      console.log('*** handleSubmitAMount1', {amount, xDaiAddress})
      let lowerBound = parseInt(amount)
      let upperBound = parseInt(amount2)
      let skip = (upperBound - lowerBound) / 5
      let localQuotes = []
      for (let i = lowerBound; i <= upperBound; i=i+skip) {
        let mainnetQuote = await getMainnetQuote(mainnetAddress, i)
        let xdaiQuote = await getXDaiQuote(mainnetQuote)          
        let newAmount = (xdaiQuote / Math.pow(10,18))
        let toAmount = mainnetQuote.toTokenAmount / Math.pow(10,mainnetQuote.toToken.decimals)
        let diff = (newAmount - i)
        console.log('****handleSubmitAmount2', {mainnetQuote, i, newAmount, diff, toAmount})
        let quote = {
          fromSymbol:mainnetQuote.fromToken.symbol,
          amount:i,
          toAmount,
          toSymbol:mainnetQuote.toToken.symbol,
          inverseAmount:parseFloat(mainnetQuote.fromTokenAmount) / parseInt(mainnetQuote.toTokenAmount) / Math.pow(10, (mainnetQuote.fromToken.decimals - mainnetQuote.toToken.decimals)),
          diff,
          newAmount
        }
        localQuotes.push(quote)
        console.log('****handleSubmitAmount3', {quotes, quote})
        // setQuotes([...quotes, quote])
      }
      setQuotes(localQuotes)
    }
    console.log('****quotes', JSON.stringify(quotes))
    return (
      <>
        <Header>⚔️ Crosschain Arbitrage 🦅 opportunity graph 📈 </Header>
        <Container>
          <p>
            The below contains the list ERC20 coins on <a href="http://honeyswap.org">HoneySwap</a>, which is a Uniswap clone on xDai chain.
          </p>
          <div>
            <Select
              value={selectedOption}
              onChange={handleXDaiChange}
              options={options}
            />
            {xDaiAddress && (
              <p>
              On xDai: {xDaiAddress && xDaiAddress.id} 
              On Mainnet: {message || mainnetAddress}
              </p>
            )}
            {mainnetAddress && (
              <p>
                Simulate exchanging between <NumberInput onChange={ handleChangeAmount }></NumberInput> and 
                <NumberInput onChange={ handleChangeAmount2 }></NumberInput> worth of DAI to {xDaiAddress.symbol}
                <Button
                  onClick={handleSubmitAmount}
                >Get Quote</Button>
              </p>
            )}
            {mainnetPrice && (
              <>
                <br />
                { mainnetPrice && quotes && quotes.length === 0 && (
                  <span>Getting quote for {
                    (mainnetPrice.fromTokenAmount / Math.pow(10, parseInt(mainnetPrice.fromToken.decimals))).toFixed(3)
                    } {mainnetPrice.fromToken.symbol} </span>
                ) }
                {quotes && quotes.length > 0 && (
                  <>
                    <h2>Profit simulation graph</h2>
                    <ul>
                      {quotes.map(q => (
                        <li>
                          {parseFloat(q.amount).toFixed(3)} {q.fromSymbol} is {parseFloat(q.toAmount).toFixed(3)} (1 {q.toSymbol} is {parseFloat(q.inverseAmount).toFixed(5)} {q.fromSymbol})
                           on Mainnet is {parseFloat(q.newAmount).toFixed(5)} {q.fromSymbol} on xDai (diff is {
                             q.diff > 0 ? (<Green>{parseFloat(q.diff).toFixed(5)}</Green>) : (<Red>{parseFloat(q.diff).toFixed(5)}</Red>)
                           })
                        </li>
                      ))}
                    </ul>
                    <Chart data={quotes } xKey={'amount'} yKeys={['diff']} />
                  </>
                )}
              </>
            )}
            { (message || !historyData || num === 0 || (quotes && quotes.length > 0) ) ? ('') : (
              <>
                <h2>Historical Data</h2>
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
