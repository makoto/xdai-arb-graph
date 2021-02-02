import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { abis } from "@project/contracts";
import { from } from "apollo-boost";
const MATIC_USDC_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
const MATICCHAIN_ENDPOINT = 'https://rpc-mainnet.maticvigil.com/'
const ETHEREUM_ENDPOINT = ''
export const BASE_TOKEN = {
  address:'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  symbols:'USDC',
  decimals:6
}
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
  const baseQuotes = await router.getAmountsOut(amount, [fromAddress, toAddress])
  console.log('***baseQuotes', {baseQuotes, amount})
  return {
    toTokenAmount: baseQuotes[1],
    fromTokenAmount: amount
  }
}

export async function getMainnetQuote(fromAddress, toAddress, amount){
  console.log('***getMainnetQuote1', {fromAddress, toAddress, amount})
  const result = await fetch(`https://api.1inch.exchange/v2.0/quote?fromTokenAddress=${fromAddress}&toTokenAddress=${toAddress}&amount=${amount}`)
  console.log('***getMainnetQuote2', result)
  return await result.json()
}

export async function getMainnetQuoteFromUSDC(address, amount){
  return await getMainnetQuote(BASE_TOKEN.address, address, amount)
}

export async function getMainnetQuoteToUSDC(address, amount){
  return await getMainnetQuote(address, BASE_TOKEN.address, amount)
}

export async function getATokenAddress(address){
  const defaultProvider = new JsonRpcProvider(ETHEREUM_ENDPOINT)
  const aTokenRootChainManagerAddress = '0x0D29aDA4c818A9f089107201eaCc6300e56E0d5c'
  const ausdcAddress = '0xBcca60bB61934080951369a648Fb03DF4F96263C'
  const mausdcAddress = '0x9719d867a500ef117cc201206b8ab51e794d3f82'
  const contract = new Contract(aTokenRootChainManagerAddress, abis.aTokenRootChainManager, defaultProvider);
  // const rootToChildToken = await contract.rootToChildToken(ausdcAddress)
  const childToRootToken = await contract.childToRootToken(mausdcAddress)
  return childToRootToken
  // console.log('***getATokenAddress1', {rootToChildToken, childToRootToken})
  // const getATokenValue = await contract.getATokenValue(ausdcAddress, 1)
  // const getMATokenValue = await contract.getMATokenValue(mausdcAddress, 1)
  // console.log('***getATokenAddress2', {getATokenValue, getMATokenValue})  
}