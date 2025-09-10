// 增长/减少速算（支持 r≈±1/n）
(function(){
  const $ = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));

  const dirEl = $('#dir');
  const curEl = $('#cur');
  const rEl = $('#r');
  const nEl = $('#n');
  const btnCalc = $('#btn-calc');
  const btnReset = $('#btn-reset');
  const btnExport = $('#btn-export');
  const mbCalc = $('#mb-calc');
  const mbReset = $('#mb-reset');
  const mbExport = $('#mb-export');
  const quickN = $('#quick-n');
  const resultCard = $('#result-card');
  const precEl = $('#prec');
  const roundEl = $('#round');

  const POCKET_N = Array.from({length:19}, (_,i)=>i+2); // 2..20

  function round1(x){ return Math.round(x*10)/10; }

  function getPrec(){ const v = parseInt(precEl?.value ?? '1', 10); return Number.isFinite(v)? v:1; }
  function getMode(){ return (roundEl?.value ?? 'half-up'); }

  function applyRound(x){
    const d = getPrec(); const m = getMode(); if (!Number.isFinite(x)) return x;
    const f = Math.pow(10, d);
    let y = x * f;
    if (m === 'floor') y = Math.floor(y);
    else if (m === 'ceil') y = Math.ceil(y);
    else y = Math.round(y); // half-up
    return y / f;
  }
  function fmt(x, unit=''){
    if (!Number.isFinite(x)) return '-';
    const d = getPrec();
    const y = applyRound(x);
    const s = y.toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
    return s + unit;
  }

  function buildQuickN(){
    quickN.innerHTML = '';
    POCKET_N.forEach(n=>{
      const btn = document.createElement('button');
      btn.textContent = `n=${n}`;
      btn.addEventListener('click', ()=>{
        nEl.value = String(n);
        rEl.value = String(round1(100/n));
      });
      quickN.appendChild(btn);
    });
  }
  buildQuickN();

  function deriveNR(){
    let r = parseFloat(rEl.value);
    let n = parseFloat(nEl.value);

    if (!Number.isFinite(r) && Number.isFinite(n)){
      r = 100 / n;
      rEl.value = String(round1(r));
    } else if (Number.isFinite(r) && !Number.isFinite(n)){
      const rAbs = Math.abs(r);
      if (rAbs === 0) n = Infinity; else n = 100 / rAbs;
      n = round1(n);
      nEl.value = String(n);
    } else if (Number.isFinite(r) && Number.isFinite(n)){
      const nFromR = round1(100/Math.abs(r));
      if (Math.abs(nFromR - n) > 0.2) {
        // mismatch hint: keep user's n
      }
    }
    return { r, n };
  }

  let lastExport = '';

  function compute(){
    const cur = parseFloat(curEl.value);
    if (!Number.isFinite(cur)){
      show('请输入“现期”数值');
      return;
    }
    const { r, n } = deriveNR();
    if (!Number.isFinite(r) || !Number.isFinite(n) || n <= 1){
      show('请输入 r% 或 n（n≥2）');
      return;
    }

    // 方向与符号
    let sign; // +1 增长, -1 减少
    if (dirEl.value === 'up') sign = +1;
    else if (dirEl.value === 'down') sign = -1;
    else sign = (r >= 0 ? +1 : -1);

    const nEff = Math.abs(n);

    // 快算：用 r≈±1/n 替换
    let base, change;
    if (sign > 0){
      base = cur * (nEff/(nEff+1));
      change = cur * (1/(nEff+1));
    } else {
      base = cur * (nEff/(nEff-1));
      change = cur * (1/(nEff-1));
    }

    // 误差估计
    const rAbs = Math.abs(r);
    const numErr = rAbs * nEff - 100; // %
    const denomDiff = Math.abs(rAbs - (100/nEff)); // 百分点
    const netSuggest = (numErr>=0 ? (numErr - denomDiff) : (numErr + denomDiff));

    // 显示
    const lines = [];
    lines.push(`<b>输入</b>：现期 = <b>${fmt(cur)}</b>，r = <b>${fmt(rAbs,'%')}</b>（${sign>0?'增长':'减少'}），n≈<b>${fmt(nEff)}</b>`);
    lines.push(`<b>快算</b>：基期 ≈ 现期 × n/(n${sign>0?'+':'-'}1) = <b>${fmt(base)}</b>`);
    lines.push(`${sign>0?'增长量':'减少量'} ≈ 现期 × 1/(n${sign>0?'+':'-'}1) = <b>${fmt(change)}</b>`);
    lines.push(`<b>提示</b>：替换误差（分子）≈ r×n−100% = <b>${fmt(numErr,'%')}</b>；分母差≈ <b>${fmt(denomDiff,'%')}</b>，建议净修正 ≈ <b>${fmt(netSuggest,'%')}</b>`);

    show(lines.join('<br/>'));

    // 导出文本
    const d = getPrec();
    const mode = getMode();
    const lineTxt = [
      `输入: 现期=${applyRound(cur).toFixed(d)}, r=${applyRound(rAbs).toFixed(d)}% (${sign>0?'增长':'减少'}), n≈${applyRound(nEff).toFixed(d)}`,
      `快算: 基期≈现期×n/(n${sign>0?'+':'-'}1)=${applyRound(base).toFixed(d)}`,
      `${sign>0?'增长量':'减少量'}≈现期×1/(n${sign>0?'+':'-'}1)=${applyRound(change).toFixed(d)}`,
      `提示: 替换误差≈r×n−100%=${applyRound(numErr).toFixed(d)}%，分母差≈${applyRound(denomDiff).toFixed(d)}%，净修正≈${applyRound(netSuggest).toFixed(d)}%`,
      `设置: 位数=${d}, 舍入=${mode}`
    ];
    lastExport = lineTxt.join('\n');
  }

  async function exportText(){
    if (!lastExport) compute();
    try{
      await navigator.clipboard.writeText(lastExport);
      alert('已复制到剪贴板');
    }catch(e){
      // 回退为下载
      const blob = new Blob([lastExport], {type:'text/plain;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = '增长减少速算_步骤说明.txt';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }
  }

  function show(html){ resultCard.hidden = false; resultCard.innerHTML = html; }

  // 绑定事件
  btnCalc?.addEventListener('click', compute);
  btnReset?.addEventListener('click', ()=>{ curEl.value=''; rEl.value=''; nEl.value=''; resultCard.hidden=true; resultCard.innerHTML=''; lastExport=''; });
  btnExport?.addEventListener('click', exportText);
  mbCalc?.addEventListener('click', compute);
  mbReset?.addEventListener('click', ()=>{ curEl.value=''; rEl.value=''; nEl.value=''; resultCard.hidden=true; resultCard.innerHTML=''; lastExport=''; });
  mbExport?.addEventListener('click', exportText);

  // Enter 快捷
  [curEl, rEl, nEl].forEach(el=>{ el?.addEventListener('keydown', e=>{ if(e.key==='Enter') compute(); }); });
})();
