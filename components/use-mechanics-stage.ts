'use client';
import {useEffect,type RefObject} from 'react';

export function stageAtMarker(tops:number[],marker:number){
 let active=0;
 for(let i=0;i<tops.length;i++){if(tops[i]<=marker)active=i;else break;}
 return active;
}
export function useMechanicsStage(story:RefObject<HTMLDivElement|null>,setStage:(stage:number)=>void){
 useEffect(()=>{
  const element=story.current;if(!element)return;
  const nodes=Array.from(element.querySelectorAll<HTMLElement>('[data-stage]'));
  if(!nodes.length)return;
  let frame=0,disposed=false;
  const update=()=>{
   frame=0;if(disposed)return;
   const tops=nodes.map(node=>node.getBoundingClientRect().top);
   const viewport=window.visualViewport?.height??window.innerHeight;
   setStage(stageAtMarker(tops,viewport*.42));
  };
  const schedule=()=>{if(!disposed&&!frame)frame=requestAnimationFrame(update)};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  window.visualViewport?.addEventListener('resize',schedule);
  const resize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(schedule);resize?.observe(element);
  document.fonts?.ready.then(schedule);schedule();
  return()=>{disposed=true;cancelAnimationFrame(frame);resize?.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule)};
 },[story,setStage]);
}
