import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { abis } from "@project/contracts";
const baseDecimals = 6

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export async function getTokenMapping(address){

}

export async function getMaticQuote(address, amount){
    console.log('**readOnChainData1', {amount})
    const MATICCHAIN_ENDPOINT = 'https://rpc-mainnet.maticvigil.com/'
    const defaultProvider = new JsonRpcProvider(MATICCHAIN_ENDPOINT)
    const maticUSDCAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
    const routerAddress = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
    let maticQuotes
    const router = new Contract(routerAddress, abis.router, defaultProvider);
    console.log('**getMaticQuote1', amount, [address, maticUSDCAddress])
    maticQuotes = await router.getAmountsOut(amount, [address, maticUSDCAddress])
    console.log('**getMaticQuote1.1', maticQuotes)
    console.log('**getMaticQuote2', {token0amount:maticQuotes[0].toString(), token1amount:maticQuotes[1].toString()})
    return maticQuotes[1]
}

export async function getMainnetQuote(address, amount){
    const BASE_TOKEN_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
    const inputAmount = parseInt(amount * Math.pow(10, baseDecimals))
    console.log('*** getMainnetQuote1', {address, amount, inputAmount})
    const result = await fetch(`https://api.1inch.exchange/v2.0/quote?fromTokenAddress=${BASE_TOKEN_ADDRESS}&toTokenAddress=${address}&amount=${inputAmount}`)
    const data = await result.json()
    console.log('*** getMainnetQuote2', {address, amount, data})
    return data
  }
