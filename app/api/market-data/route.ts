import {coinGeckoResponse} from '../../../lib/coingecko-server';
import {normalizeQuotes,QUOTE_PATH} from '../../../lib/market-data';
export const dynamic='force-dynamic';
export async function GET(){
  return coinGeckoResponse(QUOTE_PATH,normalizeQuotes);
}
