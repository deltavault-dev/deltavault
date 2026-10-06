'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {coinIds,quoteStatus,normalizeQuotes,normalizeHistory,QUOTE_PATH,type MarketId,type QuoteBook,type PricePoint} from '../lib/market-data';
import {loadCoinGecko} from '../lib/coingecko-client';

const SESSION_TTL=120_000;
const QUOTES_KEY='dv-coingecko-quotes-v2';
const HISTORY_KEY='dv-coingecko-history-v2';
type HistoryCache=Partial<Record<MarketId,{data:PricePoint[];receivedAt:number}>>;
export function useMarketData(selected:string){
  const [quotes,setQuotes]=useState<QuoteBook>({});const [histories,setHistories]=useState<Partial<Record<MarketId,PricePoint[]>>>({});
  const [loading,setLoading]=useState(true);const [historyLoading,setHistoryLoading]=useState(false);
  const [error,setError]=useState('');const [historyErrors,setHistoryErrors]=useState<Record<string,string>>({});const [clock,setClock]=useState(0);
  const quoteLock=useRef(false);const historyLocks=useRef(new Set<string>());const historyCache=useRef<HistoryCache>({});const alive=useRef(true);
  const fetchPrices=useCallback(async()=>{
    if(quoteLock.current)return;quoteLock.current=true;setLoading(true);
    try{
      const book=await loadCoinGecko<QuoteBook>('/api/market-data',QUOTE_PATH,normalizeQuotes);
      if(!book||!Object.values(book).some(q=>q&&q.price>0&&q.updatedAt>0))throw Error('Market data unavailable');
      if(alive.current){setQuotes(book);setError('');setClock(Date.now());try{sessionStorage.setItem(QUOTES_KEY,JSON.stringify({data:book,receivedAt:Date.now()}))}catch{}}
    }catch(e){if(alive.current)setError(e instanceof Error?e.message:'Market data unavailable')}
    finally{quoteLock.current=false;if(alive.current)setLoading(false)}
  },[]);
  const fetchHistory=useCallback(async(id:string,force=false)=>{
    if(!Object.prototype.hasOwnProperty.call(coinIds,id)||historyLocks.current.has(id))return;
    const market=id as MarketId;const cached=historyCache.current[market];if(!force&&cached&&Date.now()-cached.receivedAt<SESSION_TTL)return;
    historyLocks.current.add(id);setHistoryLoading(true);
    try{
      const data=await loadCoinGecko<PricePoint[]>('/api/market-history?market='+id,`/coins/${coinIds[market]}/market_chart?vs_currency=usd&days=1`,normalizeHistory);
      const valid=normalizeHistory({prices:data});
      if(alive.current){historyCache.current[market]={data:valid,receivedAt:Date.now()};setHistories(previous=>({...previous,[id]:valid}));setHistoryErrors(previous=>({...previous,[id]:''}));try{sessionStorage.setItem(HISTORY_KEY,JSON.stringify(historyCache.current))}catch{}}
    }catch(e){if(alive.current)setHistoryErrors(previous=>({...previous,[id]:e instanceof Error?e.message:'Price history unavailable'}))}
    finally{historyLocks.current.delete(id);if(alive.current)setHistoryLoading(historyLocks.current.size>0)}
  },[]);
  useEffect(()=>{
    alive.current=true;let restored=false;
    try{const saved=JSON.parse(sessionStorage.getItem(QUOTES_KEY)||'null');if(saved&&Date.now()-saved.receivedAt>=0&&Date.now()-saved.receivedAt<SESSION_TTL){const valid:QuoteBook={};for(const id of Object.keys(coinIds) as MarketId[])if(quoteStatus(saved.data?.[id])==='fresh')valid[id]=saved.data[id];if(Object.keys(valid).length){setQuotes(valid);setLoading(false);restored=true}}}catch{}
    try{const saved=JSON.parse(sessionStorage.getItem(HISTORY_KEY)||'{}');const valid:Partial<Record<MarketId,PricePoint[]>>={};for(const id of Object.keys(coinIds) as MarketId[]){const row=saved[id];if(row&&Date.now()-row.receivedAt>=0&&Date.now()-row.receivedAt<SESSION_TTL){const data=normalizeHistory({prices:row.data});historyCache.current[id]={data,receivedAt:row.receivedAt};valid[id]=data}}setHistories(valid)}catch{}
    if(!restored)void fetchPrices();const timer=setInterval(()=>setClock(Date.now()),15_000);return()=>{alive.current=false;clearInterval(timer)};
  },[fetchPrices]);
  useEffect(()=>{void fetchHistory(selected)},[selected,fetchHistory]);
  const refresh=useCallback(()=>{void fetchPrices();void fetchHistory(selected,true)},[selected,fetchPrices,fetchHistory]);
  useEffect(()=>{const update=()=>{if(document.visibilityState==='visible')refresh()};const timer=setInterval(update,SESSION_TTL);document.addEventListener('visibilitychange',update);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',update)}},[refresh]);
  return {quotes,histories,loading,historyLoading,error,historyError:historyErrors[selected]??'',loadHistory:fetchHistory,refresh,clock};
}
