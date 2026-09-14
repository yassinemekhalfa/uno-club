export type Effect='join'|'draw'|'play'|'skip'|'reverse'|'draw2'|'draw4'|'wild'|'uno'|'catch'|'win'|'lose'|'message';

let audioContext:AudioContext|null=null;
const context=()=>audioContext??=new AudioContext();

function tone(ctx:AudioContext,frequency:number,start:number,duration:number,volume=.045,wave:OscillatorType='sine'){
  const oscillator=ctx.createOscillator();
  const gain=ctx.createGain();
  oscillator.type=wave;
  oscillator.frequency.setValueAtTime(frequency,start);
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(volume,start+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);oscillator.stop(start+duration+.02);
}

export function playEffect(effect:Effect,enabled=true){
  if(!enabled)return;
  try{
    const ctx=context();void ctx.resume();const now=ctx.currentTime+.01;
    const notes:Record<Effect,Array<[number,number,number,OscillatorType?]>>={
      join:[[392,0,.09],[523,.08,.13]],draw:[[240,0,.06],[310,.05,.08]],play:[[520,0,.055],[390,.045,.08]],
      skip:[[620,0,.07],[310,.08,.14]],reverse:[[330,0,.08],[440,.07,.08],[330,.14,.1]],draw2:[[220,0,.09],[220,.1,.09]],
      draw4:[[180,0,.1],[180,.1,.1],[180,.2,.1],[130,.3,.18]],wild:[[392,0,.1],[494,.08,.1],[659,.16,.16]],
      uno:[[523,0,.1],[659,.09,.1],[784,.18,.22]],catch:[[760,0,.08],[310,.08,.18]],win:[[523,0,.12],[659,.1,.12],[784,.2,.12],[1047,.3,.35]],
      lose:[[440,0,.13],[370,.12,.13],[294,.24,.28]],message:[[720,0,.07],[820,.055,.09]]
    };
    for(const [frequency,offset,duration,wave] of notes[effect])tone(ctx,frequency,now+offset,duration,.04,wave||'triangle');
  }catch{}
}

export const musicTracks=[
  {id:'club-shuffle',name:'Club Shuffle',mood:'Bouncy · 104 BPM',bpm:104,wave:'triangle' as OscillatorType,notes:[261.63,329.63,392,329.63,293.66,349.23,440,349.23]},
  {id:'neon-nights',name:'Neon Nights',mood:'Electric · 92 BPM',bpm:92,wave:'sine' as OscillatorType,notes:[220,277.18,329.63,415.3,329.63,277.18,246.94,329.63]},
  {id:'quiet-table',name:'Quiet Table',mood:'Easygoing · 76 BPM',bpm:76,wave:'sine' as OscillatorType,notes:[196,246.94,293.66,246.94,174.61,220,261.63,220]}
] as const;

let musicTimer:number|undefined;let musicGain:GainNode|null=null;let musicStep=0;
export function stopMusic(){if(musicTimer)window.clearInterval(musicTimer);musicTimer=undefined;if(musicGain){musicGain.gain.cancelScheduledValues(context().currentTime);musicGain.gain.setTargetAtTime(.0001,context().currentTime,.04);musicGain=null;}}
export function startMusic(trackId:string,volume=.13){
  stopMusic();
  try{
    const ctx=context();void ctx.resume();const track=musicTracks.find(item=>item.id===trackId)||musicTracks[0];
    const beat=60/track.bpm;musicGain=ctx.createGain();musicGain.gain.value=volume;musicGain.connect(ctx.destination);musicStep=0;
    const tick=()=>{if(!musicGain)return;const start=ctx.currentTime+.02;const oscillator=ctx.createOscillator();const envelope=ctx.createGain();oscillator.type=track.wave;oscillator.frequency.value=track.notes[musicStep++%track.notes.length];envelope.gain.setValueAtTime(.0001,start);envelope.gain.exponentialRampToValueAtTime(.12,start+.04);envelope.gain.exponentialRampToValueAtTime(.0001,start+beat*.72);oscillator.connect(envelope).connect(musicGain);oscillator.start(start);oscillator.stop(start+beat*.8);};
    tick();musicTimer=window.setInterval(tick,beat*1000);
  }catch{}
}
