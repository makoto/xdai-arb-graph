import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, SlideContainer, SpinningImage, Container, Header, SwitchLink, Link, Button, Red, Green, NumberInput } from "./components";
import Select from 'react-select';
import { getMainnetQuote, getMaticQuote, numberWithCommas } from './utils'
import {
  GET_HOUR_DATA,
  MATIC_TOKEN_MAPPING,
  MATIC_TOKEN_DATA,
  MAINNET_TOKEN_DATA
} from "./graphql/subgraph";
import Chart from "./components/chart"
import moment from 'moment'
import _ from 'lodash'
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

// RootChain = Ethereum/1inch
// DestinationChain = Matic/QuickSwap
// BaseToken = USDC
// QuoteToken = GTST
function App({ rootClient, mappingClient }) {
  const [ pending, setPending ] = useState(false);
  const [ selectedOption, setSelectedOption ] = useState();
  const [ targetToken, setTargetToken ] = useState();
  const [ message, setMessage ] = useState();
  const [ baseToken, setBaseToken ] = useState();
  const [ amount, setAmount ] = useState(1);
  const [ amount2, setAmount2 ] = useState(100);
  const [ mainnetPrice, setMainnetPrice ] = useState();
  const [ maticPrice, setMaticPrice ] = useState();
  const [ tokenMapping, setTokenMapping ] = useState();
  const [ reverse, setReverse ] = useState(false);

  const [ quotes, setQuotes ] = useState([]);
  console.log({targetToken, baseToken})
  const { data: maticTokenData   } = useQuery(MATIC_TOKEN_DATA);
  const { data: maticTokenMapping } = useQuery(MATIC_TOKEN_MAPPING, {
    client:mappingClient
  });
  const { data: mainnetTokenData   } = useQuery(MAINNET_TOKEN_DATA, {
    client:rootClient,
    variables:{
      symbol:targetToken && targetToken.symbol
    },
    skip: !targetToken
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
    variables:{ tokenId: targetToken && targetToken.id },
    skip: !targetToken
  });

  const { loading:loading2, error:error2, data:data2  } = useQuery(GET_HOUR_DATA, {
    client: rootClient,
    variables:{ tokenId: baseToken },
    skip: !baseToken
  });

  async function readOnChainData(tokenAddress) {
    const mapping = maticTokenMapping.tokenMappings.filter(m => m.childToken.toLowerCase() === tokenAddress )[0]
    console.log('**readOnChainData1', {tokenAddress, mapping})
    let homeTokenAddress

    if(mapping){
      homeTokenAddress = mapping.rootToken
      setMessage('')
      setBaseToken(homeTokenAddress.toLocaleLowerCase())
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
    // console.log('***data', {targetToken, baseToken, historyData, historyData1, historyData2})
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
    const handleTargetTokenChange = (e) => {
      setQuotes([])
      readOnChainData(e.value.id)
      setTargetToken(e.value)
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
      let lowerBound = parseInt(amount)
      let upperBound = parseInt(amount2)
      // let skip = (upperBound - lowerBound) / 5
      let skip = (upperBound - lowerBound) / 2
      let localQuotes = []
      for (let i = lowerBound; i <= upperBound; i=i+skip) {
        let mainnetQuote = await getMainnetQuote(baseToken, i)
        setMainnetPrice(mainnetQuote)
        let maticQuote = await getMaticQuote(targetToken.id, mainnetQuote.toTokenAmount)
        setMaticPrice(maticQuote)
        let newAmount = (maticQuote / Math.pow(10, baseDecimals))
        let toAmount = mainnetQuote.toTokenAmount / Math.pow(10,mainnetQuote.toToken.decimals)
        let diff = (newAmount - i)
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
      }
      setQuotes(localQuotes)
      setPending(false)
    }
    let routes = mainnetPrice && mainnetPrice.protocols && mainnetPrice.protocols[0].map(p => p[0].name)
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
              onChange={handleTargetTokenChange}
              options={options}
            />
            {targetToken && (
              <p>
              On Matic: {targetToken && targetToken.id} 
              On Mainnet: {message ? (<span style={{color: "red"}}>{message}</span>) : baseToken}
              </p>
            )}
            {baseToken && (
              <p>
                Simulate exchanging 
                <NumberInput onChange={ handleChangeAmount } value={amount}></NumberInput> ~ 
                <NumberInput onChange={ handleChangeAmount2 } value={amount2}></NumberInput> worth of USDC to {targetToken.symbol} from
                { reverse ? (' 🦋Matic to 🔷Ethereum') : (' 🔷Ethereum to 🦋Matic') }
                  (<Link onClick={
                    () => {
                    setReverse(!reverse)
                    }
                }>{'Switch direction'}</Link>)
                <br/>
                <Button disabled={ !(amount && amount2)}
                    onClick={handleSubmitAmount}
                >Get Quote</Button>
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
                    <h3>3.<Link href={`https://honeyswap.org/#/swap?inputCurrency=${targetToken && targetToken.id}`}>Exhange from { mainnetPrice.toToken.symbol } to Matic on HoneySwap</Link> </h3>
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
