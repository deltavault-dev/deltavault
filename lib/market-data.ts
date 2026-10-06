export const QUOTE_PATH='/simple/price?ids=ethereum,bitcoin,solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true';
export const coinIds={ETH:'ethereum',BTC:'bitcoin',SOL:'solana'} as const;
export type MarketId=keyof typeof coinIds;
export type Quote={price:number;change24h:number|null;volume24h:number|null;marketCap:number|null;updatedAt:number};
export type QuoteBook=Partial<Record<MarketId,Quote>>;
export type PricePoint=[number,number];
export const PRICE_MAX_AGE=5*60*1000;
export function quoteStatus(quote:Quote|undefined,now=Date.now()):'fresh'|'stale'|'missing'{
  if(!quote||!Number.isFinite(quote.price)||quote.price<=0||!Number.isFinite(quote.updatedAt)||quote.updatedAt<=0)return 'missing';
  const age=now-quote.updatedAt;
  return age>PRICE_MAX_AGE||age< -60_000?'stale':'fresh';
}
function optionalNumber(v:unknown){return typeof v==='number'&&Number.isFinite(v)?v:null}
export function normalizeQuotes(raw:unknown):QuoteBook{
  if(!raw||typeof raw!=='object')throw new Error('Invalid market data');
  const result:QuoteBook={};
  for(const [id,coin] of Object.entries(coinIds)){
    const item=(raw as Record<string,any>)[coin];
    if(!item||typeof item.usd!=='number'||!Number.isFinite(item.usd)||item.usd<=0||typeof item.last_updated_at!=='number'||!Number.isFinite(item.last_updated_at)||item.last_updated_at<=0)continue;
    result[id as MarketId]={price:item.usd,change24h:optionalNumber(item.usd_24h_change),volume24h:optionalNumber(item.usd_24h_vol),marketCap:optionalNumber(item.usd_market_cap),updatedAt:item.last_updated_at*1000};
  }
  if(!Object.keys(result).length)throw new Error('No valid prices returned');
  return result;
}
export function normalizeHistory(raw:unknown):PricePoint[]{
  const prices=(raw as any)?.prices;
  if(!Array.isArray(prices))throw new Error('Invalid price history');
  const points=new Map<number,number>();
  for(const row of prices){if(Array.isArray(row)&&row.length>=2&&Number.isFinite(row[0])&&Number.isFinite(row[1])&&row[0]>0&&row[1]>0)points.set(row[0],row[1]);}
  const result=[...points].sort((a,b)=>a[0]-b[0]).slice(-600) as PricePoint[];
  if(result.length<2)throw new Error('Price history unavailable');
  return result;
}
export function priceMove(entry:number,current:number){return Number.isFinite(entry)&&Number.isFinite(current)&&entry>0&&current>0?(current/entry-1)*100:null}
