export type Market = {id:string; name:string; price:number|null; liquidity:number; utilization:number; maxLeverage:number; color:string};
export const markets:Market[]=[
{id:'ETH',name:'Ethereum',price:null,liquidity:240000,utilization:42,maxLeverage:10,color:'#C4DF68'},
{id:'BTC',name:'Bitcoin',price:null,liquidity:420000,utilization:58,maxLeverage:10,color:'#F4F2E9'},
{id:'SOL',name:'Solana',price:null,liquidity:85000,utilization:31,maxLeverage:5,color:'#AAB5AC'}];
export type Position={id:string;market:string;direction:'long'|'short';collateral:number;leverage:number;entry:number;openedAt?:number;source?:'CoinGecko';closed?:boolean;pnl?:number;exit?:number};
export const config={ticker:'',ca:'',x:'',explorer:'',whitepaper:'https://docs.google.com/document/d/1sm24dXR0bXgNfQ3Ux-5dA2p_PEr04tgs9d1-X-QY9Nk/edit?usp=sharing'};
export const money=(v:number|null|undefined)=>typeof v==='number'&&Number.isFinite(v)?new Intl.NumberFormat('en-US',{maximumFractionDigits:2,minimumFractionDigits:2}).format(v):'—';
export function outcome(collateral:number,leverage:number,move:number,direction:string){const notional=collateral*leverage;const rawPnl=notional*move/100*(direction==='long'?1:-1);const pnl=rawPnl===0?0:rawPnl;const equity=collateral+pnl;const maintenance=collateral*.25;return {notional,pnl,equity,maintenance,state:equity>maintenance?'Healthy':Math.abs(equity-maintenance)<1e-8?'At maintenance':'Below maintenance'};}
export function capacity(m:Market,utilization:number,liquidity=m.liquidity){return Math.max(0,liquidity*(80-utilization)/100);}
export function positionError(collateral:number,leverage:number,m:Market,utilization:number,available:number,priceStatus:string){if(priceStatus!=='fresh'||m.price===null||!Number.isFinite(m.price)||m.price<=0)return 'A fresh CoinGecko price is required. Refresh market data to continue.';if(!Number.isFinite(collateral)||collateral<=0)return 'Enter a positive collateral amount.';if(!Number.isFinite(leverage)||leverage<1||leverage>m.maxLeverage)return `Choose leverage between 1× and ${m.maxLeverage}×.`;if(utilization>=80||collateral*leverage>available)return 'Exposure exceeds this market’s available capacity. Reduce collateral or leverage.';return '';}

let scenarioIdSequence=0;
/** IDs identify local example rows; they are not credentials or transaction IDs. */
export function createScenarioId(api:{randomUUID?:()=>string;getRandomValues?:(a:Uint8Array)=>Uint8Array}|undefined=globalThis.crypto){
  if(typeof api?.randomUUID==='function')return api.randomUUID();
  scenarioIdSequence+=1;
  const bytes=new Uint8Array(12);
  if(typeof api?.getRandomValues==='function'){
    api.getRandomValues(bytes);
    return `scenario-${Date.now().toString(36)}-${scenarioIdSequence}-${Array.from(bytes,v=>v.toString(16).padStart(2,'0')).join('')}`;
  }
  return `scenario-${Date.now().toString(36)}-${scenarioIdSequence}`;
}
