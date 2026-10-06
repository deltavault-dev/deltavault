import type {Metadata} from 'next';
import './globals.css';
import './editorial.css';
import './protocol.css';
import './whitepaper.css';
import './terminal.css';
import './marquee.css';
import './wallets.css';
import './landing-motion.css';
import {Shell} from '../components/site';
export const metadata:Metadata={title:'DeltaVault — Market architecture',description:'Explore market-specific liquidity, leveraged exposure and structured risk on DeltaVault.',icons:{icon:[{url:'/brand/favicon-folded-d.svg',type:'image/svg+xml',sizes:'any'},{url:'/brand/favicon-folded-d-32.png',type:'image/png',sizes:'32x32'},{url:'/brand/favicon-folded-d-16.png',type:'image/png',sizes:'16x16'}],shortcut:'/brand/favicon-folded-d.ico',apple:[{url:'/brand/apple-touch-icon-folded-d.png',sizes:'180x180',type:'image/png'}]}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><Shell>{children}</Shell></body></html>}
