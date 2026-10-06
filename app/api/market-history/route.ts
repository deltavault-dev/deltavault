import {coinGeckoResponse} from '../../../lib/coingecko-server';
import {coinIds,normalizeHistory,type MarketId} from '../../../lib/market-data';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const market=new URL(request.url).searchParams.get('market');
  if(!market||!Object.prototype.hasOwnProperty.call(coinIds,market))return Response.json({error:'Unknown market'},{status:400});
  return coinGeckoResponse(`/coins/${coinIds[market as MarketId]}/market_chart?vs_currency=usd&days=1`,normalizeHistory);
}
