'use client';
import {useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {markets,money} from '../lib/model';
import {quoteStatus,type MarketId,type QuoteBook} from '../lib/market-data';

export default function MarketMarquee({quotes,clock,motionEnabled}:{quotes:QuoteBook;clock:number;motionEnabled:boolean}){
  const [paused,setPaused]=useState(false);
  const items=markets.map(m=>{const q=quotes[m.id as MarketId];return {id:m.id,name:m.name,price:q?'$'+money(q.price):'—',change:q?.change24h==null?'—':(q.change24h>0?'+':'')+q.change24h.toFixed(2)+'%',negative:(q?.change24h??0)<0,missing:q?.change24h==null,delayed:q&&quoteStatus(q,clock||Date.now())==='stale'}});
  return <section className="market-marquee" aria-label="Market prices" data-paused={paused} data-motion={motionEnabled?'on':'off'}>
    <div className="market-marquee-inner"><div className="market-marquee-label">MARKET PULSE<span>USD / 24H</span></div>
      <ul className="market-marquee-accessible">{items.map(item=><li key={item.id}>{item.name} ({item.id}): {item.price}. 24-hour change {item.change}.{item.delayed?' Delayed quote.':''}</li>)}</ul>
      <div className="market-marquee-viewport" tabIndex={0} aria-label="Scrolling market prices; focus to pause">
        <div className="market-marquee-track" aria-hidden="true">{[0,1].map(copy=><div className="market-marquee-group" key={copy}>{[0,1].flatMap(repeat=>items.map(item=><span className="market-marquee-item" data-repeat={repeat} key={repeat+item.id}><b>{item.id}</b><span className="marquee-price">{item.price}</span><span className={item.missing?'marquee-change':item.negative?'marquee-change negative':'marquee-change positive'}>{item.change}</span>{item.delayed&&<small>Delayed</small>}</span>))}</div>)}</div>
      </div>
      <button className="market-marquee-control" aria-label={!motionEnabled?'Market marquee motion is off':paused?'Resume market marquee':'Pause market marquee'} aria-pressed={paused||!motionEnabled} disabled={!motionEnabled} onClick={()=>setPaused(value=>!value)}>{paused||!motionEnabled?<Play size={14}/>:<Pause size={14}/>}</button>
    </div>
  </section>;
}
