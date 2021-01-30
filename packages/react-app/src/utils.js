import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { abis } from "@project/contracts";

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
