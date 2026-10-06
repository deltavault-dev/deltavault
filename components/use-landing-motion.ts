'use client';
import {useEffect,type RefObject} from 'react';

/** Finite entrance scenes. Native scrolling and sticky layout stay in charge. */
export function useLandingMotion(root:RefObject<HTMLDivElement|null>){
 useEffect(()=>{
  const element=root.current;if(!element||!('IntersectionObserver' in window))return;
  let observer:IntersectionObserver|null=null;
  const seen=new Set<Element>();
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const stop=()=>{observer?.disconnect();observer=null;element.classList.remove('motion-ready');};
  const sync=()=>{
   stop();
   if(preference.matches||document.documentElement.dataset.motion!=='on')return;
   element.classList.add('motion-ready');
   observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('motion-entered');seen.add(entry.target);observer?.unobserve(entry.target);
   }),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
   element.querySelectorAll('[data-motion-scene]').forEach(scene=>{if(!seen.has(scene))observer?.observe(scene)});
  };
  const settings=new MutationObserver(sync);settings.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
  preference.addEventListener('change',sync);sync();
  return()=>{stop();settings.disconnect();preference.removeEventListener('change',sync)};
 },[root]);
}
