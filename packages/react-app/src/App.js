import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, SlideContainer, SpinningImage, Container, Header, SwitchLink, Link, Button, Red, Green, NumberInput } from "./components";
import Select from 'react-select';
import {
  BASE_TOKEN,
  getMainnetQuoteToUSDC,
  getMainnetQuoteFromUSDC,
  getMaticQuoteToUSDC,
  getMaticQuoteFromUSDC,
  numberWithCommas,
  getATokenAddress
} from './utils'
import {
  MATIC_TOKEN_MAPPING,
  MATIC_TOKEN_DATA,
  MAINNET_TOKEN_DATA
} from "./graphql/subgraph";
import Chart from "./components/chart"
import Historical from "./components/historical"
import _ from 'lodash'
const baseDecimals = 6


// RootChain = Ethereum/1inch
// DestinationChain = Matic/QuickSwap
// BaseToken = USDC
// TargetToken = GTST
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
  let baseChain, targetChain
  if(reverse){
    baseChain = 'Matic'
    targetChain = 'Ethereum'
  }else{
    baseChain = 'Ethereum'
    targetChain = 'Matic'
  }

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

  async function readOnChainData(tokenAddress) {
    const mapping = maticTokenMapping.tokenMappings.filter(m => m.childToken.toLowerCase() === tokenAddress )[0]
    console.log('**readOnChainData1', {tokenAddress, mapping})
    let homeTokenAddress

    if(mapping){
      homeTokenAddress = mapping.rootToken
    }else{
      try{
        homeTokenAddress = await getATokenAddress(tokenAddress)
      }catch(e){
        console.log('***e', e)
      }
    }
    if(homeTokenAddress){
      setMessage('')
      setBaseToken({
        id: homeTokenAddress.toLocaleLowerCase()
      })
    }else{
      setMessage('This token does not exist on Mainnet')
    }
  }
  console.log('***data', {baseToken, targetToken, maticTokenData, maticTokenMapping})
  let historyData = [], historyData1, historyData2, num

    const handleTargetTokenChange = async (e) => {
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
      let targetQuote, baseQuote, targetQuoteSymbol, baseQuoteSymbol, localQuotes = []
      for (let i = lowerBound; i <= upperBound; i=i+skip) {
        let inputAmount = parseInt(i * Math.pow(10, BASE_TOKEN.decimals))

        if(reverse){
          targetQuote = await getMaticQuoteFromUSDC(targetToken.id, inputAmount)
          baseQuote = await getMainnetQuoteToUSDC(baseToken.id, targetQuote.toTokenAmount)
        }else{
          targetQuote = await getMainnetQuoteFromUSDC(baseToken.id, inputAmount)
          baseQuote = await getMaticQuoteToUSDC(targetToken.id, targetQuote.toTokenAmount)
        }
        setMainnetPrice(targetQuote)
        setMaticPrice(baseQuote)  
        console.log('***targetQuoteResult', {inputAmount, targetQuote, toTokenAmount:targetQuote.toTokenAmount, baseQuote})

        let newAmount = (baseQuote.toTokenAmount / Math.pow(10, baseDecimals))
        let toAmount = targetQuote.toTokenAmount / Math.pow(10, targetToken.decimals)
        let diff = (newAmount - i)
        let quote = {
          fromSymbol:'USDC',
          amount:i,
          toAmount,
          toSymbol:targetToken.symbol,
          inverseAmount:parseFloat(targetQuote.fromTokenAmount) / parseInt(targetQuote.toTokenAmount) / Math.pow(10, (BASE_TOKEN.decimals - targetToken.decimals)),
          diff,
          newAmount
        }
        localQuotes.push(quote)
      }
      setQuotes(localQuotes)
      setPending(false)
    }
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
              onChange={handleTargetTokenChange}
              options={options}
            />
            {targetToken && (
              <ul>
                <li>
                  On Matic: {targetToken && targetToken.id}
                </li>
                <li>
                  On Mainnet: {message ? (<span style={{color: "red"}}>{message}</span>) : baseToken.id}
                </li>
              </ul>
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
                      Getting quote
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
                           on {baseChain} is {parseFloat(q.newAmount).toFixed(5)} {q.fromSymbol} on {targetChain} (diff is {
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
            { (targetToken && baseToken ? (
              <Historical
                targetTokenId = {targetToken?.id}
                baseTokenId = {baseToken?.id}
                rootClient={rootClient}
              />
            ) : ('')) }
          </div>
        </Container>
      </>
    );  
  
}

export default App;
