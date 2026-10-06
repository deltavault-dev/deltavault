'use client';
import {useEffect,useState} from 'react';
export type DetectedWallet={id:string;name:string;icon:string;provider:any;announced?:boolean;brandId?:string};
export const walletBrands=[
 {id:'io.metamask',name:'MetaMask',icon:'/wallets/metamask.svg',download:'https://metamask.io/',rdns:['io.metamask'],flags:['isMetaMask']},
 {id:'io.rabby',name:'Rabby',icon:'/wallets/rabby.svg',download:'https://rabby.io/',rdns:['io.rabby'],flags:['isRabby']},
 {id:'com.coinbase.wallet',name:'Coinbase Wallet',icon:'/wallets/coinbase.svg',download:'https://www.coinbase.com/wallet',rdns:['com.coinbase.wallet','com.coinbase'],flags:['isCoinbaseWallet']},
 {id:'com.trustwallet.app',name:'Trust Wallet',icon:'/wallets/trust.svg',download:'https://trustwallet.com/',rdns:['com.trustwallet.app','com.trustwallet'],flags:['isTrust','isTrustWallet']},
 {id:'com.okex.wallet',name:'OKX Wallet',icon:'/wallets/okx.png',download:'https://web3.okx.com/download',rdns:['com.okex.wallet','com.okx.wallet'],flags:['isOkxWallet','isOKExWallet']},
 {id:'app.phantom',name:'Phantom',icon:'/wallets/phantom.svg',download:'https://phantom.com/',rdns:['app.phantom'],flags:['isPhantom']},
 {id:'com.brave.wallet',name:'Brave Wallet',icon:'/wallets/brave.png',download:'https://brave.com/wallet/',rdns:['com.brave.wallet','com.brave'],flags:['isBraveWallet']},
];
function brandFor(provider:any,rdns?:string){
 return walletBrands.find(brand=>rdns&&brand.rdns.includes(rdns))||walletBrands.find(brand=>brand.id!=='io.metamask'&&brand.flags.some(flag=>provider[flag]))||walletBrands.find(brand=>brand.id==='io.metamask'&&(!rdns||rdns==='io.metamask')&&provider.isMetaMask);
}
function imageURI(value:unknown){return typeof value==='string'&&value.length<1_000_000&&/^data:image\/(svg\+xml|png|jpeg|webp|gif)[;,]/i.test(value)?value:'';}
function legacy(provider:any,index:number):DetectedWallet{
 const brand=brandFor(provider);
 return {id:brand?.id||'injected-'+index,name:brand?.name||(typeof provider.name==='string'?provider.name:'Browser wallet'),icon:brand?.icon||imageURI(provider.icon),provider,brandId:brand?.id};
}
export function useWallets(){
 const [wallets,setWallets]=useState<DetectedWallet[]>([]);
 useEffect(()=>{
  const merge=(next:DetectedWallet)=>setWallets(previous=>{
   const index=previous.findIndex(w=>w.provider===next.provider||w.id===next.id);
   if(index<0)return [...previous,next];
   if(previous[index].announced&&!next.announced)return previous;
   const copy=[...previous];copy[index]=next;return copy;
  });
  const announce=(event:Event)=>{
   const detail=(event as CustomEvent).detail;
   if(!detail?.provider||typeof detail.provider.request!=='function'||!detail.info||typeof detail.info.uuid!=='string'||typeof detail.info.name!=='string')return;
   const {info,provider}=detail;const known=brandFor(provider,info.rdns);
   merge({id:info.uuid,name:info.name.slice(0,80),icon:imageURI(info.icon)||known?.icon||'',provider,announced:true,brandId:known?.id});
  };
  const discoverLegacy=()=>{
   const eth=(window as any).ethereum;
   const providers=Array.isArray(eth?.providers)?eth.providers:eth?[eth]:[];
   const injected=[...providers,(window as any).phantom?.ethereum,(window as any).okxwallet,(window as any).trustwallet];
   injected.forEach((p:any,index:number)=>{if(typeof p?.request==='function')merge(legacy(p,index));});
  };
  window.addEventListener('eip6963:announceProvider',announce);
  window.addEventListener('ethereum#initialized',discoverLegacy);
  discoverLegacy();window.dispatchEvent(new Event('eip6963:requestProvider'));
  return()=>{window.removeEventListener('eip6963:announceProvider',announce);window.removeEventListener('ethereum#initialized',discoverLegacy);};
 },[]);
 return wallets;
}
export function WalletLogo({icon,name}:{icon:string;name:string}){
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[icon]);
 return icon&&!failed?<img className="wallet-logo" src={icon} alt={`${name} logo`} width="36" height="36" onError={()=>setFailed(true)}/>:<span className="wallet-logo-unavailable" aria-label={`${name} logo unavailable`}>Logo unavailable</span>;
}
