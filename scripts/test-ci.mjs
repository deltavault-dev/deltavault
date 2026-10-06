import {createRequire} from 'node:module';
import {mkdir,mkdtemp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('wrangler'))('esbuild');
const groups=['markets','risk','wallets','api'];
const selected=process.argv[2]?[process.argv[2]]:groups;
if(selected.some(g=>!groups.includes(g)))throw Error('Unknown test group');
await mkdir('.ci-temp',{recursive:true});const temp=await mkdtemp(resolve('.ci-temp/tests-'));
try{for(const group of selected){const file=resolve(temp,group+'.mjs');await build({entryPoints:['tests/'+group+'.test.tsx'],outfile:file,bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',alias:{'cloudflare:workers':resolve('tests/worker-env.ts')},logLevel:'error'});const run=spawnSync(process.execPath,['--test',file],{stdio:'inherit'});if(run.status!==0){process.exitCode=run.status||1;break;}}}finally{await rm(temp,{recursive:true,force:true});}
