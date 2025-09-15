// 百化分小游戏主逻辑（无依赖）
(function(){
  const $ = (sel)=>document.querySelector(sel);
  const $$ = (sel)=>Array.from(document.querySelectorAll(sel));

  const modeEl = $('#mode');
  const qEl = $('#question');
  const ansEl = $('#answer-input');
  const choicesEl = $('#choices');
  const tipEl = $('#tip');
  const resultEl = $('#result');
  const scoreEl = $('#score');

  const btnNext = $('#btn-next');
  const btnSubmit = $('#btn-submit');
  const btnShowTip = $('#btn-show-tip');
  const btnShowTable = $('#btn-show-table');
  const btnClearWrong = $('#btn-clear-wrong');
  const tableEl = $('#table');
  const pocketGrid = $('#pocket-grid');

  const btnViewWrong = $('#btn-view-wrong');
  const btnExportWrong = $('#btn-export-wrong');
  const wrongPanel = document.querySelector('#wrong-panel');
  const wrongList = document.querySelector('#wrong-list');
  const btnImportWrong = document.querySelector('#btn-import-wrong');
  const fileImportWrong = document.querySelector('#file-import-wrong');
  const wrongBadge = document.querySelector('#wrong');
  // 口袋表（按题主记忆表）
  const POCKET = [
    {p: 50.0, n: 2},
    {p: 33.0, n: 3},
    {p: 25.0, n: 4},
    {p: 20.0, n: 5},
    {p: 16.7, n: 6},
    {p: 14.3, n: 7},
    {p: 12.5, n: 8},
    {p: 11.1, n: 9},
    {p: 10.0, n: 10},
    {p: 9.1, n: 11},
    {p: 8.3, n: 12},
    {p: 7.7, n: 13},
    {p: 7.1, n: 14},
    {p: 6.6, n: 15},
    {p: 6.3, n: 16},
    {p: 5.9, n: 17},
    {p: 5.5, n: 18},
    {p: 5.3, n: 19},
    {p: 5.0, n: 20},
  ];

  // 工具函数
  const rnd = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const round1 = (x)=>Math.round(x*10)/10; // 保留1位小数
  const percentForN = (n)=>round1(100/n);
  const close = (a,b,eps=0.2)=>Math.abs(a-b) <= eps; // 百分数容差±0.2%

  // 状态
  let correct=0, total=0;
  let currentQ = null; // {type, data, answer}
  let reviewOnly = false;
  // 60秒挑战状态
  let challenge = { active:false, left:0, timer:null, correct:0, total:0, startedAt:0 };


  // 错题本（持久化）
  const LS_KEY = 'baihuafen_wrong_v1';
  const loadWrong = ()=>{
    try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch{ return []; }
  };
  const saveWrong = (arr)=> localStorage.setItem(LS_KEY, JSON.stringify(arr));
  const addWrong = (item)=>{
    const arr = loadWrong();
    const baseKey = JSON.stringify({type:item.type, data:item.data, answer:item.answer});
    const now = Date.now();
    let found = null;
    for(const x of arr){
      const xKey = JSON.stringify({type:x.type, data:x.data, answer:x.answer});
      if(xKey===baseKey){ found = x; break; }
    }
    if(found){
      found.wrongCount = (found.wrongCount||0) + 1;
      found.lastWrongAt = now;
    }else{
      arr.push({...item, wrongCount:1, lastWrongAt: now});
    }
    saveWrong(arr);
  };
  // 
  // 
  // 
  // 
  // 错题本：数量、渲染、删除、导出
  function updateWrongCount(){
    const n = loadWrong().length;
    const opt = modeEl && modeEl.querySelector('option[value="review"]');
    if(opt){ opt.textContent = `复习错题（${n}）`; }
    const wrongEl = document.querySelector('#wrong');
    if(wrongEl){ wrongEl.textContent = `错题本：${n}`; }
  }
  function renderWrongList(){
    if(!wrongList) return;
    const arr = loadWrong();
    wrongList.innerHTML = '';
    if(arr.length===0){
      const p = document.createElement('p');
      p.className = 'note';
      p.textContent = '错题本为空，先做几道题再来复习吧～';
      wrongList.appendChild(p);
      return;
    }
    arr.forEach((item, idx)=>{
      const cell = document.createElement('div');
      cell.className = 'cell';
      let desc = '';
      if(item.type==='p2n') desc = `${item.data.p}% ≈ 1/n，答案：n=${item.answer}`;
      else if(item.type==='n2p') desc = `1/${item.data.n} ≈ ${item.answer}%`;
      else desc = `[${item.type}]`;
      const wc = item.wrongCount!=null? item.wrongCount: 1;
      cell.innerHTML = `<div style="margin-bottom:8px; font-weight:700">${desc} <span style='font-weight:500;color:#64748b'>×${wc}</span></div>`;
      const actions = document.createElement('div');
      const redo = document.createElement('button'); redo.textContent='重做';
      redo.addEventListener('click',()=>{ modeEl.value='review'; if(wrongPanel) wrongPanel.hidden=true; window.scrollTo({top:0,behavior:'smooth'}); nextQuestion(); });
      const del = document.createElement('button'); del.textContent='删除';
      del.style.marginLeft='8px';
      del.addEventListener('click',()=>{ removeWrong(idx); if(modeEl.value==='review'){ if(wrongPanel) wrongPanel.hidden=true; window.scrollTo({top:0,behavior:'smooth'}); nextQuestion(); } });
      actions.appendChild(redo); actions.appendChild(del);
      cell.appendChild(actions);
      wrongList.appendChild(cell);
    });
  }
  function removeWrong(index){
    const arr = loadWrong();
    if(index>=0 && index<arr.length){ arr.splice(index,1); saveWrong(arr); }
    updateWrongCount();
    renderWrongList();
  }
  function exportWrong(){
    const data = loadWrong();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'baihuafen_wrong.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function importWrongFromArray(items){
    if(!Array.isArray(items)) throw new Error('格式错误：应为数组');
    const arr = loadWrong();
    const now = Date.now();
    const toKey = (it)=> JSON.stringify({type:it.type, data:it.data, answer:it.answer});
    const map = new Map(arr.map(it=>[toKey(it), it]));
    let added=0, updated=0;
    for(const raw of items){
      if(!raw||!raw.type||!raw.data) continue;
      const it = {...raw};
      it.wrongCount = Number(it.wrongCount||1);
      it.lastWrongAt = it.lastWrongAt || now;
      const k = toKey(it);
      if(map.has(k)){
        const t = map.get(k);
        t.wrongCount = (t.wrongCount||1) + (it.wrongCount||1);
        t.lastWrongAt = Math.max(t.lastWrongAt||0, it.lastWrongAt||0);
        updated++;
      }else{
        const n = {type:it.type, data:it.data, answer:it.answer, wrongCount:it.wrongCount, lastWrongAt: it.lastWrongAt};
        arr.push(n); map.set(k, n); added++;
      }
    }
    saveWrong(arr);
    return {added, updated, total: arr.length};
  }

  // 60s challenge controls
  function startChallenge(){
    if(challenge.active) return;
    challenge.active = true; challenge.left = 60; challenge.correct=0; challenge.total=0; challenge.startedAt = Date.now();
    if(challenge.timer) clearInterval(challenge.timer);
    challenge.timer = setInterval(()=>{
      challenge.left--; setScore();
      if(challenge.left<=0){ endChallenge(true); }
    }, 1000);
    setScore();
  }
  function endChallenge(showReport){
    if(challenge.timer){ clearInterval(challenge.timer); challenge.timer=null; }
    const summary = {correct: challenge.correct, total: challenge.total};
    challenge.active=false; challenge.left=0;
    setScore();
    if(showReport){
      const acc = summary.total? Math.round(100*summary.correct/summary.total):0;
      alert(`60s challenge finished\n\nAnswered: ${summary.total}\nCorrect: ${summary.correct} (${acc}%)`);
    }
  }


  const clearWrong = ()=> saveWrong([]);

  // 迁移旧数据：补充 wrongCount/lastWrongAt
  function migrateWrong(){
    const arr = loadWrong();
    let changed=false; const now=Date.now();
    for(const it of arr){
      if(it && it.wrongCount==null){ it.wrongCount=1; changed=true; }
      if(it && it.lastWrongAt==null){ it.lastWrongAt=now; changed=true; }
    }
    if(changed) saveWrong(arr);
  }

  // UI 初始化
  function renderPocket(){
    pocketGrid.innerHTML = '';
    POCKET.forEach(({p,n})=>{
      const cell = document.createElement('div');
      cell.className='cell';
      cell.innerHTML = `<div class="p">${p}%</div><div class="n">≈ 1/${n}</div>`;
      pocketGrid.appendChild(cell);
    });
  }
  renderPocket();

  function setScore(){
    const extra = challenge && challenge.active ? `｜挑战剩余：${challenge.left}s` : '';
    scoreEl.textContent = `得分：${correct} / ${total}` + extra;
  }
  setScore();
  migrateWrong();
  updateWrongCount();

  function resetUI(){
    resultEl.textContent='';
    resultEl.className='result';
    tipEl.hidden = true; tipEl.textContent='';
    ansEl.value='';
    choicesEl.innerHTML='';
  }

  // 出题
  function nextQuestion(){
    resetUI();
    const mode = modeEl.value;
    reviewOnly = (mode==='review');

    if(mode==='challenge60'){
      if(!challenge.active) startChallenge();
      const t = Math.random()<0.5 ? 'p2n' : 'n2p';
      if(t==='p2n'){
        const item = POCKET[rnd(0, POCKET.length-1)];
        currentQ = { type:'p2n', data:item, answer:item.n };
        qEl.textContent = `${item.p}% ≈ 1/n，n = ?`;
        ansEl.placeholder = '请输入整数 n';
        ansEl.focus();
      } else {
        const n = rnd(2, 20);
        const p = percentForN(n);
        currentQ = { type:'n2p', data:{n, p}, answer:p };
        qEl.textContent = `1/${n} ≈ ? % （保留1位小数）`;
        ansEl.placeholder = '如 16.7';
        ansEl.focus();
        makeChoices([p, p+0.4, p-0.4, p+0.8]);
      }
      return;
    }

    if(mode==='p2n'){ // 给百分数，答 n

      const item = POCKET[rnd(0, POCKET.length-1)];
      currentQ = { type:'p2n', data:item, answer:item.n };
      qEl.textContent = `${item.p}% ≈ 1/n，n = ?`;
      ansEl.placeholder = '请输入整数 n';
      ansEl.focus();
    } else if(mode==='n2p'){ // 给 n，答百分数
      const n = rnd(2, 20);
      const p = percentForN(n);
      currentQ = { type:'n2p', data:{n, p}, answer:p };
      qEl.textContent = `1/${n} ≈ ? % （保留1位小数）`;
      ansEl.placeholder = '如 16.7';
      ansEl.focus();
      // 选项（多选一）
      makeChoices([p, p+0.4, p-0.4, p+0.8]);
    } else if(mode==='formula'){ // 公式法 n≈100/x
      // 在 5% ~ 60% 随机取一位小数
      const x = round1(rnd(50,600)/10);
      const n = round1(100/x);
      currentQ = { type:'formula', data:{x}, answer:n };
      qEl.textContent = `若 x% ≈ 1/n，给定 x = ${x}% ，试用公式法估 n（保留1位小数）`;
      ansEl.placeholder = '如 6.5';
      ansEl.focus();
    } else if(mode==='nearby'){ // 取中/放缩判断
      // 从 10%~25% 取随机百分数
      const x = round1(rnd(100, 250)/10);
      // 找到左右最近的 1/n 基准
      const candidates = [];
      for(let n=2;n<=20;n++){ candidates.push({n, p: percentForN(n)}); }
      candidates.sort((a,b)=>a.p-b.p);
      // 找到两侧最近
      let left=null,right=null; // left.p <= x <= right.p
      for(const c of candidates){ if(c.p<=x) left=c; if(c.p>=x && !right) { right=c; break; } }
      if(!left) left = candidates[0];
      if(!right) right = candidates[candidates.length-1];
      const closer = Math.abs(x-left.p) <= Math.abs(x-right.p) ? left : right;
      currentQ = { type:'nearby', data:{x,left,right}, answer: closer.n };
      qEl.textContent = `${x}% 更接近 1/${left.n}（≈${left.p}%）还是 1/${right.n}（≈${right.p}%）？`;
      ansEl.placeholder = '请选择下面的选项';
      // 两项选择
      makeChoices([`1/${left.n}`, `1/${right.n}`]);
    } else if(mode==='review'){
      const arr = loadWrong();
      if(arr.length===0){
        qEl.textContent = '错题本为空，先做几道题再来复习吧～';
        return;
      }
      const item = arr[rnd(0,arr.length-1)];
      // 仅支持 p2n 与 n2p 的错题回放
      currentQ = item;
      if(item.type==='p2n'){
        qEl.textContent = `${item.data.p}% ≈ 1/n，n = ?`;
        ansEl.placeholder = '请输入整数 n';
      }else if(item.type==='n2p'){
        qEl.textContent = `1/${item.data.n} ≈ ? % （保留1位小数）`;
        ansEl.placeholder = '如 16.7';
        makeChoices([item.answer, item.answer+0.4, item.answer-0.4, item.answer+0.8]);
      }else{
        qEl.textContent = '（当前版本复习仅覆盖 p2n/n2p）';
      }
    }
  }

  function makeChoices(vals){
    choicesEl.innerHTML='';
    const shuffled = vals.map(v=>({v, k:Math.random()})).sort((a,b)=>a.k-b.k).map(x=>x.v);
    for(const v of shuffled){
      const btn = document.createElement('button');
      btn.textContent = (typeof v==='number') ? String(round1(v)) : String(v);
      btn.addEventListener('click',()=>{ ansEl.value = (typeof v==='number') ? String(round1(v)) : String(v); submit(); });
      choicesEl.appendChild(btn);
    }
  }

  // 判题
  if(wrongBadge){ wrongBadge.addEventListener('click', ()=>{ if(wrongPanel){ wrongPanel.hidden=false; renderWrongList(); window.scrollTo({top:0,behavior:'smooth'}); } }); }
  if(btnImportWrong && fileImportWrong){
    btnImportWrong.addEventListener('click', ()=> fileImportWrong.click());
    fileImportWrong.addEventListener('change', async (e)=>{
      const f = e.target.files && e.target.files[0]; if(!f) return;
      try{
        const text = await f.text();
        let data = JSON.parse(text);
        if(data && data.items && Array.isArray(data.items)) data = data.items;
        const res = importWrongFromArray(Array.isArray(data)? data: []);
        updateWrongCount(); if(wrongPanel && !wrongPanel.hidden) renderWrongList();
        alert(`\u5bfc\u5165\u5b8c\u6210\uff1a\u65b0\u589e${res.added}\uff0c\u5408\u5e76${res.updated}\uff0c\u73b0\u6709${res.total}`);
      }catch(err){ alert('JSON \u683c\u5f0f\u4e0d\u6b63\u786e'); }
      finally{ e.target.value=''; }
    });
  }
  modeEl.addEventListener('change', ()=>{ if(challenge.active && modeEl.value!=='challenge60'){ endChallenge(false); } });
  function submit(){
    if(!currentQ) return;
    const raw = ansEl.value.trim();
    if(!raw){ resultEl.textContent='请输入答案'; return; }

    let ok=false, explain='';

    if(currentQ.type==='p2n'){
      const n = Number(raw);
      ok = Number.isInteger(n) && n === currentQ.answer;
      explain = `标准答案：n = ${currentQ.answer}`;
      if(!ok) { addWrong(currentQ); updateWrongCount(); }
    }
    else if(currentQ.type==='n2p'){
      const x = Number(raw);
      const target = currentQ.answer;
      ok = !Number.isNaN(x) && close(x, target, 0.3);
      explain = `标准答案：≈ ${target}%（容差±0.3%）`;
      if(!ok) { addWrong(currentQ); updateWrongCount(); }
    }
    else if(currentQ.type==='formula'){
      const n = Number(raw);
      const target = currentQ.answer;
      ok = !Number.isNaN(n) && Math.abs(n - target) <= 0.1;
      explain = `标准答案：n ≈ 100/${currentQ.data.x} = ${target}`;
    }
    else if(currentQ.type==='nearby'){
      const chosen = raw.replace(/\s/g,'');
      const ansStr = `1/${currentQ.answer}`;
      ok = (chosen === ansStr);
      const {x,left,right} = currentQ.data;
      const dl = Math.abs(x-left.p).toFixed(1), dr = Math.abs(x-right.p).toFixed(1);
      explain = `到 1/${left.n} 的差≈${dl}%；到 1/${right.n} 的差≈${dr}%`;
    }

    total++; if(ok) correct++; if(challenge.active){ challenge.total++; if(ok) challenge.correct++; }
    resultEl.textContent = ok ? '✅ 正确' : '❌ 错误';
    resultEl.className = 'result ' + (ok?'ok':'bad');
    setScore();

    // 提示/讲解
    if(currentQ.type==='p2n'){
      const {p,n} = currentQ.data;
      tipEl.innerHTML = `记忆：<b>${p}% ≈ 1/${n}</b>。若忘记，可用公式法：n≈100/${p}。`;
    } else if(currentQ.type==='n2p'){
      const {n,p} = currentQ.data;
      tipEl.innerHTML = `记忆：<b>1/${n} ≈ ${p}%</b>。若忘记，可先背近似表，再做放缩。`;
    } else if(currentQ.type==='formula'){
      tipEl.innerHTML = `公式法：n≈100/x（保留一位小数）`;
    } else if(currentQ.type==='nearby'){
      const {x,left,right} = currentQ.data;
      tipEl.innerHTML = `取中/贴近判断：${x}% 介于 ${left.p}%（1/${left.n}）与 ${right.p}%（1/${right.n}）之间，选更近者。`;
    }
    tipEl.hidden = false;
  }

  // 事件绑定
  btnNext.addEventListener('click', nextQuestion);
  btnSubmit.addEventListener('click', submit);
  ansEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') submit(); });
  btnShowTip.addEventListener('click', ()=>{ tipEl.hidden = !tipEl.hidden; });
  btnShowTable.addEventListener('click', ()=>{ tableEl.hidden = !tableEl.hidden; });
  btnClearWrong.addEventListener('click', ()=>{
    clearWrong();
    updateWrongCount();
    if(wrongPanel && !wrongPanel.hidden) renderWrongList();
    alert('已清空错题本');
  });
  if(btnViewWrong){ btnViewWrong.addEventListener('click', ()=>{ if(wrongPanel){ wrongPanel.hidden = !wrongPanel.hidden; if(!wrongPanel.hidden) renderWrongList(); } }); }
  if(btnExportWrong){ btnExportWrong.addEventListener('click', exportWrong); }
})();

