import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import { Body, SlideContainer, SpinningImage, Container, Header, Link, Button, Red, Green, NumberInput } from "./components";
import Select from 'react-select';
import { numberWithCommas } from './utils'
import { abis } from "@project/contracts";
import {
  GET_HOUR_DATA,
  MATIC_TOKEN_MAPPING,
  MATIC_TOKEN_DATA,
  MAINNET_TOKEN_DATA
} from "./graphql/subgraph";
import Chart from "./components/chart"
import moment from 'moment'
import _ from 'lodash'
const MATICCHAIN_ENDPOINT = 'https://rpc-mainnet.maticvigil.com/'
const baseAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
const baseDecimals = 6

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


function App({ mainnetClient, mainnetMaticClient }) {
  const [ pending, setPending ] = useState(false);
  const [ selectedOption, setSelectedOption ] = useState();
  const [ maticAddress, setMaticAddress ] = useState();
  const [ message, setMessage ] = useState();
  const [ mainnetAddress, setMainnetAddress ] = useState();
  const [ amount, setAmount ] = useState();
  const [ amount2, setAmount2 ] = useState();
  const [ mainnetPrice, setMainnetPrice ] = useState();
  const [ maticPrice, setMaticPrice ] = useState();
  const [ tokenMapping, setTokenMapping ] = useState();

  const [ quotes, setQuotes ] = useState([]);
  console.log({maticAddress, mainnetAddress})
  const { data: maticTokenData   } = useQuery(MATIC_TOKEN_DATA);
  const { data: maticTokenMapping } = useQuery(MATIC_TOKEN_MAPPING, {
    client:mainnetMaticClient
  });
  const { data: mainnetTokenData   } = useQuery(MAINNET_TOKEN_DATA, {
    client:mainnetClient,
    variables:{
      symbol:maticAddress && maticAddress.symbol
    },
    skip: !maticAddress
  });

  const options = maticTokenData && maticTokenData.tokens && maticTokenData.tokens.map(t => {
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
    variables:{ tokenId: maticAddress && maticAddress.id },
    skip: !maticAddress
  });

  const { loading:loading2, error:error2, data:data2  } = useQuery(GET_HOUR_DATA, {
    client: mainnetClient,
    variables:{ tokenId: mainnetAddress },
    skip: !mainnetAddress
  });

  async function getMainnetQuote(fromAddress, amount){
    const inputAmount = parseInt(amount * Math.pow(10, baseDecimals))
    console.log('*** getMainnetQuote1', {fromAddress, amount, inputAmount})

    const result = await fetch(`https://api.1inch.exchange/v2.0/quote?fromTokenAddress=${baseAddress}&toTokenAddress=${fromAddress}&amount=${inputAmount}`)
    const data = await result.json()
    console.log('*** getMainnetQuote2', {fromAddress, amount, data})

    setMainnetPrice(data)
    return data
  }
  
  async function getMaticQuote(quotePromise){
    let quote = await quotePromise
    console.log('**readOnChainData1', {quote})
    const defaultProvider = new JsonRpcProvider(MATICCHAIN_ENDPOINT)
    const maticUSDCAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
    const fromAddress = maticAddress.id
    const routerAddress = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
    const maticAmount = quote.toTokenAmount
    let maticQuotes
    try{
      const router = new Contract(routerAddress, abis.router, defaultProvider);
      console.log('**getMaticQuote1', maticAmount, [fromAddress, maticUSDCAddress])
      maticQuotes = await router.getAmountsOut(maticAmount, [fromAddress, maticUSDCAddress])
      console.log('**getMaticQuote1.1', maticQuotes)
      console.log('**getMaticQuote2', {token0amount:maticQuotes[0].toString(), token1amount:maticQuotes[1].toString()})
      setMaticPrice(maticQuotes[1])
    }catch(e){
      console.log('**getMaticQuote3', e.message)
      setMessage('Error getting Matic quote')
      return false
    }
    return maticQuotes[1]
  }

  async function readOnChainData(tokenAddress) {
    const mapping = maticTokenMapping.tokenMappings.filter(m => m.childToken.toLowerCase() === tokenAddress )[0]
    console.log('**readOnChainData1', {tokenAddress, mapping})
    let homeTokenAddress

    if(mapping){
      homeTokenAddress = mapping.rootToken
      setMessage('')
      setMainnetAddress(homeTokenAddress.toLocaleLowerCase())
    }else{
      setMessage('This token does not exist on Mainnet')
    }
  }

  console.log('***data', {maticTokenData, maticTokenMapping, data, data2})
  let historyData = [], historyData1, historyData2, num

  if(error){
    return(JSON.stringify(error))
  }else{
    // console.log({data})
    historyData1 = parseData(data, 'matic')
    historyData2 = parseData(data2, 'mainnet')
    // console.log('***data', {maticAddress, mainnetAddress, historyData, historyData1, historyData2})
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
    const handleXDaiChange = (e) => {
      setQuotes([])
      readOnChainData(e.value.id)
      setMaticAddress(e.value)
    }
    const handleChangeAmount = (e) => {
      setAmount(e.target.value)
    }
    const handleChangeAmount2 = (e) => {
      setAmount2(e.target.value)
    }

    const handleSubmitAmount = async (e) => {
      setPending(true)
      setQuotes([])
      console.log('*** handleSubmitAMount1', {amount, maticAddress})
      let lowerBound = parseInt(amount)
      let upperBound = parseInt(amount2)
      let skip = (upperBound - lowerBound) / 5
      let localQuotes = []
      console.log('*** handleSubmitAMount1', {lowerBound, upperBound, skip})
      for (let i = lowerBound; i <= upperBound; i=i+skip) {
        let mainnetQuote = await getMainnetQuote(mainnetAddress, i)
        let maticQuote = await getMaticQuote(mainnetQuote)
        let newAmount = (maticQuote / Math.pow(10, baseDecimals))
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
      }
      setQuotes(localQuotes)
      setPending(false)
    }
    let routes = mainnetPrice && mainnetPrice.protocols && mainnetPrice.protocols[0].map(p => p[0].name)
    console.log('****quotes', JSON.stringify(quotes))
    console.log('***mainnetPrice', {mainnetPrice})
    return (
      <>
        <Header>🦋 Crosschain Arbitrage 🦅 opportunity graph 📈 </Header>
        <Container>
          <p>
            This site allows you to observe the historical price margins of ERC20 tokens between Ethereum Mainnet and <Link href="https://www.maticchain.com/">Matic side chain</Link>.
            <br/>
            The below contains the list ERC20 coins on <Link href="https://quickswap.exchange/">QuickSwap</Link>, which is a Uniswap clone on Matic chain.
          </p>
          <div>
            <Select
              placeholder='Select ERC 20 tokens listed on Quick Swap'
              value={selectedOption}
              onChange={handleXDaiChange}
              options={options}
            />
            {maticAddress && (
              <p>
              On Matic: {maticAddress && maticAddress.id} 
              On Mainnet: {message ? (<span style={{color: "red"}}>{message}</span>) : mainnetAddress}
              </p>
            )}
            {mainnetAddress && (
              <p>
                Simulate exchanging between <NumberInput onChange={ handleChangeAmount } placeholder={1}></NumberInput> and 
                <NumberInput onChange={ handleChangeAmount2 } placeholder={100}></NumberInput> worth of USDC to {maticAddress.symbol}
                { amount && amount2 ? (
                  <Button
                    onClick={handleSubmitAmount}
                  >Get Quote</Button>

                ) : (
                  <Button disabled={true}
                    onClick={handleSubmitAmount}
                  >Get Quote</Button>
                )}
              </p>
            )}
            {mainnetPrice && (
              <>
                <br />
                { pending && (
                  <span>
                    <SpinningImage src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif" />
                    { mainnetPrice.errors ? (
                      <>Got some error.</>
                    ) : (
                      <>
                      Getting quote for {
                      (mainnetPrice.fromTokenAmount / Math.pow(10, parseInt(mainnetPrice.fromToken.decimals))).toFixed(3)
                      } {mainnetPrice.fromToken.symbol}
                      </>
                    )}
                  </span>
                ) }
                {quotes && quotes.length > 0 && (
                  <>
                    <h2>Profit simulation graph</h2>
                    <ul>
                      {quotes.map(q => (
                        <li>
                          {parseFloat(q.amount).toFixed(3)} {q.fromSymbol} is {parseFloat(q.toAmount).toFixed(3)} (1 {q.toSymbol} is {parseFloat(q.inverseAmount).toFixed(5)} {q.fromSymbol})
                           on Mainnet is {parseFloat(q.newAmount).toFixed(5)} {q.fromSymbol} on Matic (diff is {
                             q.diff > 0 ? (<Green>{parseFloat(q.diff).toFixed(5)}</Green>) : (<Red>{parseFloat(q.diff).toFixed(5)}</Red>)
                           })
                        </li>
                      ))}
                    </ul>
                    <Chart data={quotes } xKey={'amount'} yKeys={['diff']} />
                    <h2>Arb steps</h2>
                    <h3>1.<Link href={`https://1inch.exchange/#/DAI/${mainnetPrice.toToken.address}`}>Exchange from USDC to { mainnetPrice.toToken.symbol } on 1inch ({routes.join(' => ')})</Link> </h3>
                    <h3>2.<Link href={`https://omni.maticchain.com`}>Transfer { mainnetPrice.toToken.symbol } to Matic on Omnichain</Link>  </h3>
                    <h3>3.<Link href={`https://honeyswap.org/#/swap?inputCurrency=${maticAddress && maticAddress.id}`}>Exhange from { mainnetPrice.toToken.symbol } to Matic on HoneySwap</Link> </h3>
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
                  <Chart data={historyData } xKey={'date'} yKeys={['maticPrice', 'mainnetPrice']} />
                  <Chart data={historyData } xKey={'date'} yKeys={['pctDiff']} />
                  <Chart data={historyData } xKey={'date'} brush={true} yKeys={['maticLiquidity', 'maticVolume']} />
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
