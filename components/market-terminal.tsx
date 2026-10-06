'use client';
import {useEffect,useId,useState} from 'react';
import {Search,LayoutGrid,List} from 'lucide-react';
import Link from './native-link';
import {markets,money,type Market} from '../lib/model';
import {quoteStatus,type MarketId,type PricePoint,type Quote} from '../lib/market-data';
import type {useMarketData} from './use-market-data';

type Feed=ReturnType<typeof useMarketData>;
export function MarketChange({value}:{value:number|null|undefined}){return <span className={value==null?'market-change':value<0?'market-change falling':'market-change rising'}>{value==null?'—':(value>0?'+':'')+value.toFixed(2)+'%'}</span>}
const price=(v:number|null|undefined)=>v==null?'—':'$'+money(v);
const time=(v:number)=>new Date(v).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false});

export function PriceHistoryChart({market,history,loading=false,compact=false}:{market:string;history:PricePoint[];loading?:boolean;compact?:boolean}){
  const [hours,setHours]=useState(24);const [cursor,setCursor]=useState<number|null>(null);const gradient='price-fill-'+useId().replace(/:/g,'');
  useEffect(()=>{setCursor(null)},[market,hours]);
  const lastTime=history.at(-1)?.[0]??0;
  const points=compact?history:history.filter(([stamp])=>stamp>=lastTime-hours*3600000);
  const valid=points.length>=2;
  const low=valid?Math.min(...points.map(p=>p[1])):0;const high=valid?Math.max(...points.map(p=>p[1])):0;
  const spread=high-low||Math.max(1,high*.002);const floor=low-spread*.12;const ceiling=high+spread*.12;
  const end=points.at(-1);const start=points[0];
  const coordinates=valid?points.map(([stamp,value])=>[8+(stamp-start[0])/Math.max(1,end![0]-start[0])*624,12+(ceiling-value)/(ceiling-floor)*236]):[];
  const path=coordinates.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const index=cursor===null?points.length-1:Math.min(cursor,points.length-1);const selected=points[index];const dot=coordinates[index];
  return <div className={compact?'history-chart compact-history':'history-chart'} data-market={market} data-hours={hours}>
    {!compact&&<div className="chart-toolbar"><span className="eyebrow">SPOT PRICE / USD</span><div className="chart-periods" aria-label={`${market} chart time range`}>{[1,6,24].map(h=><button key={h} aria-pressed={hours===h} onClick={()=>setHours(h)}>{h}H</button>)}</div></div>}
    {valid?<>
      {!compact&&<div className="chart-readout"><span>{price(selected?.[1])}</span><small>{selected?time(selected[0]):''}</small><small>{cursor===null?'Latest historical sample':'Historical sample'}</small></div>}
      <svg className="spot-history" viewBox="0 0 640 260" preserveAspectRatio="none" role="img" aria-label={`${market} CoinGecko price history, ${points.length} actual samples${compact?'':', last '+hours+' hours'}.`} data-source="CoinGecko" data-points={points.length} onPointerMove={compact?undefined:e=>{const rect=e.currentTarget.getBoundingClientRect();if(rect.width>0){const stamp=start[0]+Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width))*(end![0]-start[0]);setCursor(points.reduce((best,p,i)=>Math.abs(p[0]-stamp)<Math.abs(points[best][0]-stamp)?i:best,0))}}} onPointerLeave={()=>setCursor(null)}>
        <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--lime)" stopOpacity=".16"/><stop offset="100%" stopColor="var(--lime)" stopOpacity="0"/></linearGradient></defs>
        {!compact&&[12,71,130,189,248].map(y=><line key={y} x1="8" x2="632" y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 6"/>)}
        <path d={path+' L632 252 L8 252 Z'} fill={`url(#${gradient})`}/><path d={path} fill="none" stroke="var(--lime)" strokeWidth={compact?3:2} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
        {!compact&&dot&&<><line x1={dot[0]} x2={dot[0]} y1="8" y2="252" stroke="var(--mineral)" strokeDasharray="3 6"/><circle cx={dot[0]} cy={dot[1]} r="4" fill="var(--lime)"/></>}
      </svg>
      {!compact&&<><div className="chart-axis"><span>{time(start[0])}</span><span>{time(start[0]+(end![0]-start[0])/2)}</span><span>{time(end![0])}</span></div><div className="chart-foot"><span>Range {price(low)} – {price(high)}</span><span>CoinGecko history</span></div><input className="chart-sample" type="range" min="0" max={points.length-1} value={index} aria-label={`Inspect ${market} historical sample`} aria-valuetext={selected?`${price(selected[1])}, ${new Date(selected[0]).toLocaleString()}`:undefined} onChange={e=>setCursor(Number(e.target.value))}/></>}
    </>:<div className="chart-unavailable" role="status">{loading?'Loading price history…':'Price history unavailable'}{!compact&&<small>Historical samples appear when market data is available.</small>}</div>}
  </div>;
}

function MarketCard({m,quote,history,onMarket}:{m:Market;quote?:Quote;history:PricePoint[];onMarket:(id:string)=>void}){
  return <Link href="/trade" onClick={()=>onMarket(m.id)} className="terminal-market-card" aria-label={`Trade ${m.name}`}><div className="terminal-card-top"><span className="market-symbol" aria-hidden="true">{m.id.slice(0,1)}</span><span className="eyebrow">{m.id} / USD</span><span className="card-leverage">{m.maxLeverage}× max</span></div><h3>{m.name}</h3><p>Leveraged exposure · {m.id} market vault</p><div className="terminal-card-price"><strong>{price(quote?.price)}</strong><MarketChange value={quote?.change24h}/></div><PriceHistoryChart market={m.id} history={history} compact/><div className="terminal-card-foot"><span>24h volume <b>{price(quote?.volume24h)}</b></span><span>Trade</span></div></Link>;
}
export default function MarketsWorkspace({selected,onMarket,feed}:{selected:string;onMarket:(id:string)=>void;feed:Feed}){
  const [search,setSearch]=useState('');const [filter,setFilter]=useState('all');const [sort,setSort]=useState('name');const [view,setView]=useState<'cards'|'table'>('cards');
  const m=markets.find(m=>m.id===selected)!;const quote=feed.quotes[m.id as MarketId];
  useEffect(()=>{let cancelled=false;async function load(){for(const market of markets){if(cancelled)return;await feed.loadHistory(market.id)}}void load();return()=>{cancelled=true}},[feed.loadHistory]);
  const list=markets.filter(m=>{const q=feed.quotes[m.id as MarketId];return (m.id+' '+m.name).toLowerCase().includes(search.toLowerCase())&&(filter==='all'||(filter==='gainers'&&q?.change24h!=null&&q.change24h>0)||(filter==='decliners'&&q?.change24h!=null&&q.change24h<0))}).sort((a,b)=>sort==='cap'?(feed.quotes[b.id as MarketId]?.marketCap??0)-(feed.quotes[a.id as MarketId]?.marketCap??0):sort==='volume'?(feed.quotes[b.id as MarketId]?.volume24h??0)-(feed.quotes[a.id as MarketId]?.volume24h??0):a.name.localeCompare(b.name));
  return <div className="page-wrap utility-page markets-workspace"><div className="utility-heading"><div><span className="eyebrow">01 / THE MARKET DESK</span><h1>Find your <span>market.</span></h1></div><span className="utility-meta">03 MARKETS / ROBINHOOD CHAIN</span></div>
    <section className="market-focus" aria-label="Explore a market"><div className="market-focus-chart"><div className="market-focus-picker" aria-label="Select featured market">{markets.map(m=><button key={m.id} aria-pressed={selected===m.id} onClick={()=>onMarket(m.id)}><span className="eyebrow">{m.id} / USD</span><strong>{m.name}</strong><MarketChange value={feed.quotes[m.id as MarketId]?.change24h}/></button>)}</div><PriceHistoryChart market={m.id} history={feed.histories[m.id as MarketId]??[]} loading={feed.historyLoading}/></div>
      <div className="market-focus-info"><span className="market-symbol" aria-hidden="true">{m.id.slice(0,1)}</span><span className="eyebrow">{m.id} / LEVERAGED MARKET</span><h2>{m.name}</h2><p>Explore directional exposure backed by a separate {m.id} liquidity vault.</p><div className="focus-quote" aria-live="polite"><strong>{price(quote?.price)}</strong><div><MarketChange value={quote?.change24h}/><small>past 24 hours</small></div></div><dl className="focus-metrics"><div><dt>24h volume</dt><dd>{price(quote?.volume24h)}</dd></div><div><dt>Market cap</dt><dd>{price(quote?.marketCap)}</dd></div><div><dt>Leverage limit</dt><dd>{m.maxLeverage}×</dd></div></dl><Link className="button full" href="/trade" onClick={()=>onMarket(m.id)}>Trade {m.id}</Link></div>
    </section>
    <section className="market-catalog" aria-labelledby="catalog-title"><div className="catalog-heading"><h2 id="catalog-title">Explore the markets <small>/ 03</small></h2><span>{list.length} {list.length===1?'market':'markets'}</span></div><div className="catalog-toolbar"><div className="catalog-filters" aria-label="Filter markets">{[['all','All markets'],['gainers','Gainers'],['decliners','Decliners']].map(([id,label])=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</div><label className="search"><Search size={17}/><input type="search" aria-label="Search markets" placeholder="Search a market" value={search} onChange={e=>setSearch(e.target.value)}/></label><label className="catalog-sort">Sort by<select aria-label="Sort markets" value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Name</option><option value="cap">Market cap</option><option value="volume">24h volume</option></select></label><div className="catalog-view" aria-label="Market display"><button aria-label="Card view" aria-pressed={view==='cards'} onClick={()=>setView('cards')}><LayoutGrid size={17}/></button><button aria-label="Table view" aria-pressed={view==='table'} onClick={()=>setView('table')}><List size={18}/></button></div></div>
      {!list.length?<div className="empty"><h3>No markets found</h3><p>Try a different market or filter.</p><button className="text-button" onClick={()=>{setSearch('');setFilter('all')}}>Clear search</button></div>:view==='cards'?<div className="terminal-market-grid">{list.map(m=><MarketCard key={m.id} m={m} quote={feed.quotes[m.id as MarketId]} history={feed.histories[m.id as MarketId]??[]} onMarket={onMarket}/>)}</div>:<div className="market-table terminal-market-table"><table><thead><tr>{['Market','Price / USD','24h change','Market cap / USD','24h volume / USD','Leverage',''].map((title,i)=><th key={i} scope="col">{title}</th>)}</tr></thead><tbody>{list.map(m=>{const q=feed.quotes[m.id as MarketId];return <tr key={m.id}><td><button className="market-name" onClick={()=>onMarket(m.id)}><span className="market-symbol" aria-hidden="true">{m.id.slice(0,1)}</span><span><b>{m.id}</b><small>{m.name}</small></span></button></td><td>{price(q?.price)}<small className="quote-age">{quoteStatus(q,feed.clock||Date.now())}</small></td><td><MarketChange value={q?.change24h}/></td><td>{money(q?.marketCap)}</td><td>{money(q?.volume24h)}</td><td>{m.maxLeverage}×</td><td><Link className="text-link" href="/trade" onClick={()=>onMarket(m.id)}>Trade</Link></td></tr>})}</tbody></table></div>}
      <div className="catalog-caption"><span>Spot prices and history / CoinGecko</span><span>Leverage limits / DeltaVault settings</span></div>
    </section>
  </div>;
}
