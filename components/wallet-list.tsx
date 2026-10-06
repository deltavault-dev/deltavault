'use client';
import {walletBrands,WalletLogo,type DetectedWallet} from './use-wallets';
export default function WalletList({wallets,busy,onConnect}:{wallets:DetectedWallet[];busy:boolean;onConnect:(provider:any)=>void}){
 const catalog=walletBrands.map(brand=>{
  const detected=wallets.find(wallet=>wallet.brandId===brand.id);
  return {...brand,name:detected?.name||brand.name,icon:detected?.icon||brand.icon,provider:detected?.provider};
 });
 const entries=[...catalog,...wallets.filter(wallet=>!catalog.some(entry=>entry.provider===wallet.provider)).map(wallet=>({...wallet,download:''}))];
 return <div className="wallet-list" aria-label="Available wallets">{entries.map(entry=>{
  const content=<><WalletLogo icon={entry.icon} name={entry.name}/><span className="wallet-name">{entry.name}</span><small className="wallet-action">{entry.provider?'Connect':'Get wallet'}</small></>;
  return <div className="wallet-option" key={entry.id}>{entry.provider?<button type="button" disabled={busy} onClick={()=>onConnect(entry.provider)}>{content}</button>:<a href={entry.download} target="_blank" rel="noopener noreferrer" aria-label={`Get ${entry.name} from its official website`}>{content}</a>}</div>;
 })}</div>;
}
