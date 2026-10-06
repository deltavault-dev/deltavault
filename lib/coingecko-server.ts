import {env} from 'cloudflare:workers';

const memory=new Map<string,{body:string;expires:number}>();
const cooldown=new Map<string,number>();
const TTL=120_000;
/** Fixed paths supplied by routes; never exposes a general-purpose proxy. */
export async function coinGeckoResponse(path:string,normalize:(raw:unknown)=>unknown){
  const key='https://deltavault-cache.invalid/coingecko/v1/'+encodeURIComponent(path);
  const cached=memory.get(key);
  const headers={'Content-Type':'application/json','Cache-Control':'public, max-age=30, s-maxage=120'};
  if(cached&&cached.expires>Date.now())return new Response(cached.body,{headers});
  const edge=(globalThis.caches as unknown as {default?:Cache}|undefined)?.default;
  try{const hit=await edge?.match(key);if(hit)return hit}catch{}
  if((cooldown.get(key)||0)>Date.now())return Response.json({error:'CoinGecko is temporarily unavailable. Retry in a minute.'},{status:503,headers:{'Cache-Control':'no-store','Retry-After':'60'}});
  const runtime=env as unknown as Record<string,string|undefined>;
  const pro=runtime.COINGECKO_PRO_API_KEY;const demo=runtime.COINGECKO_API_KEY;
  const base=pro?'https://pro-api.coingecko.com/api/v3':'https://api.coingecko.com/api/v3';
  const auth:Record<string,string>={Accept:'application/json','User-Agent':'DeltaVault/1.0'};
  if(pro)auth['x-cg-pro-api-key']=pro;else if(demo)auth['x-cg-demo-api-key']=demo;
  try{
    const response=await fetch(base+path,{headers:auth,signal:AbortSignal.timeout(10_000)});
    if(!response.ok){cooldown.set(key,Date.now()+60_000);return Response.json({error:response.status===429?'CoinGecko rate limit reached. Retry in a minute.':`CoinGecko could not supply market data (${response.status}).`},{status:503,headers:{'Cache-Control':'no-store','Retry-After':'60'}})}
    const data=normalize(await response.json());
    const body=JSON.stringify({source:'CoinGecko',fetchedAt:Date.now(),data});
    memory.set(key,{body,expires:Date.now()+TTL});
    const result=new Response(body,{headers});
    try{await edge?.put(key,result.clone())}catch{}
    return result;
  }catch{
    cooldown.set(key,Date.now()+60_000);
    return Response.json({error:'CoinGecko data is unavailable. Please retry.'},{status:503,headers:{'Cache-Control':'no-store','Retry-After':'60'}});
  }
}
