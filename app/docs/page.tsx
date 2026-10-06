import type {Metadata} from 'next';
import chapters from '../../lib/whitepaper.json';

export const metadata:Metadata={title:'DeltaVault — Whitepaper',description:'Read the complete DeltaVault whitepaper: markets, liquidity vaults, leverage, risk management, governance and security.'};

export default function Whitepaper(){return <div className="page-wrap whitepaper-page">
  <header className="whitepaper-header"><div><span className="eyebrow">DELTAVAULT / WHITEPAPER</span><h1>Whitepaper</h1><p>{chapters[0].blocks[0].text}</p></div></header>
  <div className="whitepaper-layout">
    <nav className="whitepaper-index" aria-label="Whitepaper contents"><span className="eyebrow">CONTENTS</span>{chapters.map((chapter,i)=><a key={chapter.id} href={'#'+chapter.id}><span>{String(i).padStart(2,'0')}</span>{i===0?'Introduction':chapter.title}</a>)}</nav>
    <article className="whitepaper-body" aria-label="DeltaVault whitepaper">{chapters.map((chapter,i)=><section key={chapter.id} id={chapter.id} aria-labelledby={chapter.id+'-title'} tabIndex={-1}><h2 id={chapter.id+'-title'}>{i===0?'Introduction':chapter.title}</h2>{chapter.blocks.slice(i===0?1:0).map((block,j)=>block.type==='list'?<ul key={j}>{block.items?.map((item,k)=><li key={k}>{item}</li>)}</ul>:block.type==='heading'?<h3 key={j}>{block.text}</h3>:<p key={j}>{block.text}</p>)}</section>)}</article>
  </div>
</div>}
