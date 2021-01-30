import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { abis } from "@project/contracts";
const MATIC_USDC_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
const MATICCHAIN_ENDPOINT = 'https://rpc-mainnet.maticvigil.com/'

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export async function getMaticQuoteToUSDC(address, amount){
  return await getMaticQuote(address, MATIC_USDC_ADDRESS, amount)
}

export async function getMaticQuoteFromUSDC(address, amount){
  return await getMaticQuote(MATIC_USDC_ADDRESS, address, amount)
}

export async function getMaticQuote(fromAddress, toAddress, amount){
  const defaultProvider = new JsonRpcProvider(MATICCHAIN_ENDPOINT)
  const routerAddress = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
  const router = new Contract(routerAddress, abis.router, defaultProvider);
  const maticQuotes = await router.getAmountsOut(amount, [fromAddress, toAddress])
  return maticQuotes[1]
}

export async function getMainnetQuote(address, amount){
  const BASE_TOKEN_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
  console.log('*** getMainnetQuote1', {address, amount})
  const result = await fetch(`https://api.1inch.exchange/v2.0/quote?fromTokenAddress=${BASE_TOKEN_ADDRESS}&toTokenAddress=${address}&amount=${amount}`)
  const data = await result.json()
  console.log('*** getMainnetQuote2', {address, amount, data})
  return data
}
