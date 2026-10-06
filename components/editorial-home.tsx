'use client';
import {useEffect,useRef,useState} from 'react';
import {priceMove,type PricePoint,type Quote} from '../lib/market-data';
import Link from './native-link';
import {useLandingMotion} from './use-landing-motion';
import {useMechanicsStage} from './use-mechanics-stage';
import {markets,money,config,outcome} from '../lib/model';

type Result=ReturnType<typeof outcome>;
type MarketView={id:string;name:string;price:number|null;quote?:Quote};
type Props={selected:string;onMarket:(id:string)=>void;move:number;onMove:(value:number)=>void;direction:'long'|'short';onDirection:(value:'long'|'short')=>void;result:Result;marketViews:MarketView[];ready:boolean;mode:'market'|'scenario';onMode:(value:'market'|'scenario')=>void;history:PricePoint[]};
const steps=[
  {title:'Choose the market.',text:'Each market has its own vault. Available liquidity and exposure limits define the environment before a position opens.',link:'/markets',action:'Compare markets',label:'Market'},
  {title:'Define the exposure.',text:'Collateral and leverage set the position size. Long and short positions respond differently to the same price move.',link:'/trade',action:'Explore a position',label:'Position'},
  {title:'Inspect the backing.',text:'Market-specific vault capital carries trader outcomes. Committed exposure reduces the capacity available for new positions.',link:'/vaults',action:'Inspect vaults',label:'Vault'},
  {title:'Follow the outcome.',text:'Price movement changes equity. Maintenance defines a boundary, and closing the position records the trader’s result against its market vault.',link:'/risk',action:'Explore the boundary',label:'Settlement'},
];
function PriceDiagram({result,move,direction,history,mode,ready}:Pick<Props,'result'|'move'|'direction'|'history'|'mode'|'ready'>){
  const samples=mode==='market'?history.map(([time,price])=>[time,outcome(100,5,priceMove(history[0][1],price)??0,direction).equity]):[[0,100],[1,result.equity]];
  const values=samples.map(point=>point[1]);
  const low=Math.min(0,25,...values);const high=Math.max(125,...values);const pad=(high-low)*.15;
  const y=(v:number)=>300-(v-low+pad)/(high-low+2*pad)*250;
  const first=samples[0]?.[0]??0;const last=samples[samples.length-1]?.[0]??1;
  const points=samples.map(([time,equity])=>[48+(time-first)/Math.max(1,last-first)*440,y(equity)]);
  const d=points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const end=points[points.length-1];
  const available=ready&&(mode==='scenario'||history.length>=2);
  return <svg className="price-diagram" viewBox="0 0 580 370" role="img" aria-label={available?`${mode==='market'?'CoinGecko 24-hour replay':'Price target'}, ${direction} position, ${money(result.equity)} units equity.`:'Waiting for CoinGecko price history.'} data-source={mode==='market'?'CoinGecko':'hypothetical'} data-points={available?points.length:0}>
    <defs><pattern id="dv-price-grid" width="44" height="32" patternUnits="userSpaceOnUse"><path d="M44 0H0V32" fill="none" stroke="currentColor" strokeWidth=".6" opacity=".13"/></pattern></defs>
    <rect x="48" y="30" width="440" height="290" fill="url(#dv-price-grid)"/>
    <rect x="48" y={y(25)} width="440" height={320-y(25)} fill="currentColor" opacity=".045"/>
    {[0,100,high].map((v,i)=><g key={i}><line x1="48" x2="488" y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".15"/><text x="8" y={y(v)+4} className="chart-tick">{Math.round(v)}</text></g>)}
    <line x1="48" x2="488" y1={y(25)} y2={y(25)} stroke="var(--ivory)" strokeDasharray="4 5" opacity=".7"/>
    <text x="48" y={y(25)+23} className="chart-label">MAINTENANCE / 25</text>
    <line x1="48" x2="488" y1={y(100)} y2={y(100)} stroke="currentColor" strokeDasharray="2 6" opacity=".35"/>
    {available&&end?<><path d={d} className="equity-path" fill="none" stroke="var(--lime)" strokeWidth="2.5" pathLength="1" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="48" cy={y(100)} r="3" fill="var(--ivory)"/>
    <line x1={end[0]} x2={end[0]} y1="30" y2="320" stroke="var(--lime)" opacity=".3"/>
    <circle cx={end[0]} cy={end[1]} r="6" fill="var(--lime)" stroke="var(--basalt)" strokeWidth="3"/>
    <text x="500" y={end[1]+5} className="chart-result">{money(ready?result.equity:null)}</text></>:<text x="268" y="150" textAnchor="middle" className="chart-label">PRICE HISTORY UNAVAILABLE</text>}
    <text x="48" y="350" className="chart-tick">{mode==='market'?'24H REPLAY START':'ENTRY'}</text><text x="488" y="350" textAnchor="end" className="chart-tick">{mode==='market'?'LATEST SAMPLE':'PRICE TARGET'}</text>
  </svg>;
}
function Architecture({stage,market,result,ready}:{stage:number;market:MarketView;result:Result;ready:boolean}){
  const titles=['One market. Its own capital.','Collateral defines the position.','Liquidity backs the exposure.','Outcomes meet the boundary.'];
  return <div className="architecture-board" data-capital-stage={stage}>
    <div className="instrument-top"><span>CAPITAL PATH / 0{stage+1}</span><span>{market.id} MARKET</span></div>
    <h3>{titles[stage]}</h3>
    <svg key={stage} viewBox="0 0 580 320" className="flow-diagram" role="img" aria-label={`Stage ${stage+1}: ${titles[stage]} Collateral 100 units, exposure 500 units, ${market.id} market vault.`}>
      <defs><pattern id="dv-flow-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".13"/></pattern></defs>
      <rect width="580" height="320" fill="url(#dv-flow-grid)"/>
      <g className={stage===1?'flow-node emphasized':'flow-node'}><rect x="24" y="28" width="214" height="88" rx="2"/><text x="42" y="54" className="chart-label">COLLATERAL</text><text x="42" y="91" className="flow-value">100.00<tspan className="chart-tick" dx="12">units</tspan></text></g>
      <g className={stage===1?'flow-node emphasized':'flow-node'}><rect x="342" y="28" width="214" height="88" rx="2"/><text x="360" y="54" className="chart-label">NOTIONAL / 5×</text><text x="360" y="91" className="flow-value">500.00</text></g>
      <path className="flow-route" pathLength="1" d="M238 72H342M450 116V177H292V207M130 116V207" fill="none" stroke="var(--mineral)" strokeWidth="1" opacity=".65"/>
      <text x="267" y="60" className="chart-tick">5×</text>
      <g className={stage===0||stage===2?'flow-node emphasized':'flow-node'}><rect x="24" y="207" width="294" height="88" rx="2"/><text x="42" y="232" className="chart-label">MARKET VAULT</text><text x="42" y="268" className="flow-value">{market.id}</text></g>
      <path className="flow-route settlement-route" pathLength="1" d="M318 251H372" stroke="var(--mineral)" opacity=".65"/>
      <g className={stage===3?'flow-node emphasized':'flow-node'}><rect x="372" y="207" width="184" height="88" rx="2"/><text x="390" y="232" className="chart-label">POSITION EQUITY</text><text x="390" y="268" className="flow-value">{money(ready?result.equity:null)}</text></g>
    </svg>
    <div className="board-foot"><span>{stage===3?'MAINTENANCE':stage===2?'CAPACITY THRESHOLD':stage===1?'DIRECTIONAL EXPOSURE':'CAPITAL ENVIRONMENT'}</span><strong>{stage===3?'25.00 units':stage===2?'80% utilization':stage===1?'LONG / SHORT':'MARKET-SPECIFIC'}</strong></div>
  </div>;
}
export default function EditorialHome(p:Props){
  const landing=useRef<HTMLDivElement>(null);useLandingMotion(landing);
  const market=p.marketViews.find(m=>m.id===p.selected)!;
  const [stage,setStage]=useState(0);const story=useRef<HTMLDivElement>(null);
  const diagram=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const rail=diagram.current;if(!rail)return;
    const update=()=>{const screenHeight=window.visualViewport?.height??window.innerHeight;rail.style.setProperty('--diagram-viewport-height',`${screenHeight}px`)};
    window.addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);update();
    return()=>{window.removeEventListener('resize',update);window.visualViewport?.removeEventListener('resize',update)};
  },[]);
  useMechanicsStage(story,setStage);
  return <div className="editorial-home" ref={landing}>
    <section className="editorial-hero" data-motion-scene="hero">
      <div className="editorial-hero-copy"><div className="eyebrow"><span className="line"/>ROBINHOOD CHAIN / MARKET ARCHITECTURE</div><h1><span className="hero-title-line">Open markets.</span><span className="hero-title-line">Measured </span><span className="hero-title-line accent">exposure.</span></h1><p>Long and short positions. Separate liquidity vaults.<br className="desktop"/> Inspect the capital behind every market.</p><div className="hero-actions"><Link className="button" href="/trade">Explore trading</Link><a className="button ghost" href="#mechanics">How it works</a></div></div>
      <div className="hero-instrument">
        <div className="instrument-top"><span>EXPOSURE / {p.selected}</span><span className="sim">{p.mode==='market'?'CoinGecko replay':'Price target'}</span></div>
        <div className="instrument-market-picker" aria-label="Select market">{markets.map(m=><button key={m.id} aria-pressed={m.id===p.selected} onClick={()=>p.onMarket(m.id)}>{m.id}</button>)}</div>
        <PriceDiagram result={p.result} move={p.move} direction={p.direction} history={p.history} mode={p.mode} ready={p.ready}/>
        <div className="instrument-controls"><div className="direction-controls" aria-label="Position direction">{(['long','short'] as const).map(d=><button key={d} aria-pressed={d===p.direction} onClick={()=>p.onDirection(d)}>{d==='long'?'Long':'Short'}</button>)}</div><div className="direction-controls" aria-label="Price source">{(['market','scenario'] as const).map(mode=><button key={mode} aria-pressed={mode===p.mode} onClick={()=>p.onMode(mode)}>{mode==='market'?'24h replay':'Price target'}</button>)}</div></div>
        {p.mode==='scenario'&&<label className="instrument-slider">Price target / move <strong>{p.move>0?'+':''}{p.move}%</strong><input aria-label="Reference price move" type="range" min="-25" max="25" step="1" value={p.move} onChange={e=>p.onMove(Number(e.target.value))}/></label>}
        <div className="instrument-bottom"><span>Position preview · real market prices</span><span className="instrument-state">{p.ready?p.result.state:'Price unavailable'}</span></div>
      </div>
    </section>
    <div className="capital-summary" data-motion-scene="summary"><div><span>MARKET ENVIRONMENTS</span><strong>03 <small>supported markets</small></strong></div><div><span>SELECTED MARKET</span><strong>{p.selected} <small>{market.name}</small></strong></div><div><span>PROJECTED PNL</span><strong>{p.ready&&p.result.pnl>0?'+':''}{money(p.ready?p.result.pnl:null)} <small>units</small></strong></div><div><span>24H MARKET VOLUME</span><strong>{market.quote?.volume24h==null?'—':new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(market.quote.volume24h)} <small>USD</small></strong></div></div>
    <section className="editorial-protocol editorial-section" data-motion-scene="protocol" id="protocol"><div className="editorial-heading reveal"><div><span className="eyebrow">01 / THE PROTOCOL</span><h2>Two sides.<br/>One market.</h2></div><p>A position takes exposure. A vault supplies the capital. Risk boundaries connect the two. <Link className="text-link" href="/protocol">Explore the protocol</Link></p></div>
      <div className="protocol-panels">
        <Link href="/trade" className="protocol-panel trading-panel reveal"><div className="instrument-top"><span>01 / TRADING</span><span>LONG / SHORT</span></div><div className="exposure-scale" aria-hidden="true"><span>COLLATERAL</span><div className="collateral-block">1×</div><div className="leverage-blocks">{Array.from({length:5},(_,i)=><i key={i}/>)}</div><span>5× EXPOSURE</span></div><h3>A position with<br/>visible boundaries.</h3><p>Inspect notional size, price sensitivity, and maintenance before opening a position.</p><span className="panel-action">Explore trading</span></Link>
        <div className="protocol-stack"><Link href="/vaults" className="protocol-panel compact-panel reveal"><div className="vault-mini" aria-hidden="true">{Array.from({length:20},(_,i)=><i key={i} className=""/>)}</div><div><span className="eyebrow">02 / LIQUIDITY</span><h3>Capital stays<br/>market-specific.</h3><p>Compare committed liquidity and remaining capacity.</p><span className="panel-action">Explore vaults</span></div></Link><Link href="/risk" className="protocol-panel compact-panel reveal"><div className="boundary-mini" aria-hidden="true"><span>100</span><i/><b>25</b><small>MAINTENANCE</small></div><div><span className="eyebrow">03 / RISK</span><h3>Know where<br/>the boundary sits.</h3><p>See how a price move changes equity and the room above maintenance.</p><span className="panel-action">Explore risk</span></div></Link></div>
      </div>
    </section>
    <section className="editorial-section mechanics-section" data-motion-scene="mechanics" id="mechanics"><div className="editorial-heading reveal"><div><span className="eyebrow">02 / HOW THE MARKET WORKS</span><h2>From collateral<br/>to outcome.</h2></div><p>Follow the position, its backing, and the limits that shape the result.</p></div><div className="mechanics-layout"><div className="mechanics-steps" ref={story}>{steps.map((item,i)=><article key={item.label} data-stage={i} className={'mechanics-step'+(stage===i?' active':'')}><span className="step-index">0{i+1} / {item.label.toUpperCase()}</span><h3>{item.title}</h3><p>{item.text}</p><Link href={item.link} className="text-link">{item.action}</Link></article>)}</div><div className="mechanics-sticky" ref={diagram} data-sticky="true" role="region" aria-label="Market mechanics diagram" tabIndex={0}><div className="stage-selector" aria-label="Capital path stage">{steps.map((step,i)=><button key={step.label} aria-pressed={stage===i} onClick={()=>setStage(i)}><span>0{i+1}</span>{step.label}</button>)}</div><Architecture stage={stage} market={market} result={p.result} ready={p.ready}/><p className="diagram-disclosure">Collateral: 100 USD · Leverage: 5×. Equity follows the selected market replay or price target.</p></div></div></section>
    <section className="editorial-section market-board-section" data-motion-scene="markets"><div className="editorial-heading reveal"><div><span className="eyebrow">03 / THE CAPITAL DESK</span><h2>Three markets.<br/>One clear view.</h2></div><p>Follow current prices and market activity. Select a market to inspect its vault.</p></div><div className="editorial-market-board reveal"><div className="instrument-top"><span>MARKET OVERVIEW</span><span className="sim">COINGECKO / USD</span></div><div className="market-table"><table><thead><tr><th>Market</th><th>Price / USD</th><th>24h change</th><th>Market cap / USD</th><th>24h volume / USD</th><th>Vault</th></tr></thead><tbody>{p.marketViews.map((m,i)=><tr key={m.id} className={m.id===p.selected?'chosen':''}><td><span className="desk-market"><span>0{i+1}</span><b>{m.id}</b><small>{m.name}</small></span></td><td>${money(m.price)}</td><td>{m.quote?.change24h==null?'—':(m.quote.change24h>0?'+':'')+m.quote.change24h.toFixed(2)+'%'}</td><td>{money(m.quote?.marketCap)}</td><td>{money(m.quote?.volume24h)}</td><td><Link className="text-link" href="/vaults" onClick={()=>p.onMarket(m.id)} aria-label={`Inspect ${m.id} vault`}>Inspect</Link></td></tr>)}</tbody></table></div><div className="desk-caption"><span>Spot-market data / CoinGecko</span><Link className="text-link" href="/markets">View all markets</Link></div></div></section>
    <section className="editorial-section editorial-risk" data-motion-scene="risk"><div className="editorial-heading reveal"><div><span className="eyebrow">04 / EQUITY & MAINTENANCE</span><h2>The price changes.<br/>The boundary stays.</h2></div><p>The selected market replay or price target puts the relationship in view. Leverage amplifies gains and losses; maintenance defines the boundary.</p></div><div className="risk-ledger reveal"><div className="equity-cell"><span>POSITION EQUITY</span><strong>{money(p.ready?p.result.equity:null)}<small> units</small></strong></div><div className="maintenance-cell"><span>MAINTENANCE</span><strong>25.00<small> units</small></strong></div><div className="state-cell"><span>POSITION STATE</span><strong className="ledger-state">{p.ready?p.result.state:'Price unavailable'}</strong><small>{!p.ready?'Awaiting market data':p.result.equity>=25?money(p.result.equity-25)+' above maintenance':money(25-p.result.equity)+' below maintenance'}</small></div></div><div className="risk-foot"><p>This calculation uses a maintenance threshold of 25% of initial collateral.</p><Link className="button ghost" href="/risk">Open Risk Explorer</Link></div></section>
    <section className="editorial-section editorial-close reveal" data-motion-scene="close"><span className="eyebrow">05 / EXPLORE THE ARCHITECTURE</span><h2><span>Read the mechanics.</span><span>Inspect the market.</span></h2><div className="hero-actions"><Link className="button" href="/protocol">Explore the protocol</Link><a className="button ghost" href="/docs">Read the whitepaper</a></div></section>
    <section className="editorial-section editorial-faq" data-motion-scene="faq"><div><span className="eyebrow">BEFORE YOU BEGIN</span><h2>Clear answers.</h2></div><div>{[['Where does market data come from?','Spot prices, capitalization, volume, and historical prices come from CoinGecko. The workspace loads market data when you open it.'],['What does a vault carry?','Market vaults carry trader outcomes, committed exposure, withdrawal constraints, pricing risk, and smart-contract risk. Returns and capital preservation are not guaranteed.'],['Does connecting a wallet move funds?','No. Connecting only requests a public address from a detected wallet. No signature, approval, deposit, or trade is requested.']].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
  </div>;
}
