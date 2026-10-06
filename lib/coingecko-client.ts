/** Prefer the cached server feed. CoinGecko's CORS-enabled public API is the browser fallback. */
export async function loadCoinGecko<T>(localPath:string,apiPath:string,normalize:(raw:unknown)=>T):Promise<T>{
  try{
    const response=await fetch(localPath,{cache:'no-store',signal:AbortSignal.timeout(12_000)});
    if(response.ok){const body=await response.json() as {data:T};return body.data}
  }catch{}
  const response=await fetch('https://api.coingecko.com/api/v3'+apiPath,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12_000)});
  if(!response.ok)throw Error(response.status===429?'CoinGecko rate limit reached. Retry in a minute.':'CoinGecko data is unavailable. Please retry.');
  return normalize(await response.json());
}
