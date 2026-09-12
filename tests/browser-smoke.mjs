// Optional live-browser smoke check. Start headless Chrome with --remote-debugging-port=9223.
import WebSocket from 'ws';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const targets=await fetch('http://127.0.0.1:9223/json').then(r=>r.json());
const page=targets.find(t=>t.type==='page');
const ws=new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r=>ws.once('open',r));let id=0;const pending=new Map();
ws.on('message',raw=>{const m=JSON.parse(raw);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}});
async function call(method,params={}){const current=++id;const result=new Promise(r=>pending.set(current,r));ws.send(JSON.stringify({id:current,method,params}));const reply=await result;if(reply.error)throw Error(reply.error.message);return reply.result;}
const evaluate=async expression=>(await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
async function until(expression){for(let i=0;i<60;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,250));}throw Error('Browser condition timed out: '+expression);}
try{await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await call('Page.navigate',{url:'http://127.0.0.1:3000'});await until('!!document.querySelector(".hero")');await until('!!document.querySelector(".connection-dot:not(.offline)")');assert.equal(await evaluate('document.documentElement.scrollWidth <= 390'),true,'Mobile lobby overflows');const lobby=await call('Page.captureScreenshot',{format:'png'});await writeFile('mobile-check.png',Buffer.from(lobby.data,'base64'));await evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.includes("Let’s play")).click()');await until('!!document.querySelector(".game-table")');assert.equal(await evaluate('document.querySelectorAll(".your-hand .playing-card").length'),7);assert.equal(await evaluate('document.querySelectorAll(".opponent").length'),3);assert.equal(await evaluate('document.documentElement.scrollWidth <= 390'),true,'Mobile table overflows');const table=await call('Page.captureScreenshot',{format:'png'});await writeFile('game-check.png',Buffer.from(table.data,'base64'));await evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.includes("Leave table")).click()');await until('!!document.querySelector(".hero")');console.log('Mobile lobby, bot launch, seven-card hand, three opponents, no horizontal page overflow, and leave-table flow passed.');}finally{ws.close();}
