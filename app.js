'use strict';
const $=id=>document.getElementById(id);
function selectButton(group,key,value){document.querySelectorAll(`#${group} button`).forEach(button=>{const selected=button.dataset[key]===String(value);button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});}
const scenarios={
 cold:{label:'COLD START',title:'先建立可以信任的经验。',text:'还没有足够的已验证阶段样例，调度器请求审核。审核模型检查执行结果、标记阶段，并提供能够用于后续匹配的证据。',evidence:'没有审核的动作块不会自动计入成功次数。live 代码在 episode_number=1 时还会强制请求审核；离线 demo 未启用这个标记。',path:'需要审核',action:'审核上一块结果与当前动作提议',review:true},
 familiar:{label:'ZERO-CALL FAST PATH',title:'这一次，让策略直接执行。',text:'当前观测与熟悉的搬运阶段匹配，成功证据充分，还未到审核间隔，也没有其他强制触发条件。这次可以跳过大模型审核。',evidence:'仍然使用最新观测与最新 VLA 动作。界面示意假定本次没有命中随机抽查，也未达到连续未审核步数上限。',path:'跳过本次审核',action:'直接执行新的 VLA 动作块',review:false},
 unknown:{label:'UNFAMILIAR CONTEXT',title:'经验不能无条件借给陌生状态。',text:'新的视角或布局与记忆样例距离过大，或同时像两个阶段。即使历史成功率很高，也需要重新审核，避免把旧经验错误套用到当前状态。',evidence:'调度器先处理陌生 / 模糊匹配等强制条件，再决定能否使用常规间隔。低分辨率匹配仍可能出错。',path:'强制审核',action:'重新判断当前阶段与动作意图',review:true},
 error:{label:'RECOVERY ACTIVE',title:'审核确认掉落后，逐块跟进修复。',text:'检测到瓶子滑落后，进入恢复状态：重新靠近、抓取和搬运，每一块继续接受审核。确认原始错误已解决后，才允许恢复常规调度。',evidence:'这里只演示“错误已经被发现”的情境。跳过审核可能推迟错误发现；不是瓶子一掉落就必然立刻触发。',path:'进入恢复路径',action:'局部修复 → 必要时验证路标 → 确认恢复',review:true}
};
function renderScenario(key){const d=scenarios[key];selectButton('scenario-tabs','scenario',key);$('scenario-label').textContent=d.label;$('scenario-title').textContent=d.title;$('scenario-text').textContent=d.text;$('scenario-evidence').textContent=d.evidence;$('path-label').textContent=d.path;$('path-action').textContent=d.action;$('decision-path').classList.toggle('needs-review',d.review);}
document.querySelectorAll('#scenario-tabs button').forEach(b=>b.addEventListener('click',()=>renderScenario(b.dataset.scenario)));
function calculate(){const s=+$('successes').value,f=+$('failures').value,n=s+f,z=1.96,p=n?s/n:0;const L=n?Math.max(0,(p+z*z/(2*n)-z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n)))/(1+z*z/n)):0;const forced=$('override').value!=='none';const gap=n<4||forced?1:1+Math.floor(5*L*L);$('success-value').textContent=s;$('failure-value').textContent=f;$('score-value').textContent=L.toFixed(3);$('gap-value').textContent=gap;$('calc-note').textContent=forced?'强制条件优先：即使分数较高，当前仍需审核。':n<4?'证据少于 4 个已确认结果，基础间隔保持为 1。':'这个参数会参与调度判断；不能把它直接等同于每隔这么多块必然审核一次。';}
['successes','failures','override'].forEach(id=>$(id).addEventListener('input',calculate));
const frames=[
 {step:174,phase:'VERIFIED PROGRESS',title:'先保存一个已完成的子目标。',text:'审核确认“两个兔子已进入白色篮子”，保存当前回合的已验证子目标，为之后的恢复提供参考。',lesson:'这一记录描述当时的任务进展，不是可以瞬间恢复的仿真快照。'},
 {step:219,phase:'INTENT ERROR DETECTED',title:'下一步动作会偏离任务。',text:'审核发现，下一步可能把第三个兔子放到篮子外。系统进入局部修复，后续动作块持续接受监督。',lesson:'意图错误与已经执行的动作失败应分开记录：这里审核的是下一步不符合目标。'},
 {step:299,phase:'WAYPOINT SELECTION',title:'选一个此前确认过的路标。',text:'在局部纠正之后，系统选择“两个兔子已进入白色篮子”这个历史子目标，检查哪些已有进展仍然成立。',lesson:'控制步仍然向前推进到 299；没有回到第 174 步，也没有重置物体。'},
 {step:304,phase:'WAYPOINT VERIFIED',title:'子目标成立，还不等于故障解决。',text:'审核确认先前两个兔子的分类进展依然成立。系统仍保持恢复状态，继续检查导致本次恢复的原始错误。',lesson:'“找回一个可信的进展参照”和“原始问题已经修好”，是两次不同的判断。'},
 {step:344,phase:'NORMAL SCHEDULING RESUMES',title:'原始问题解决，恢复常规调度。',text:'审核最终确认故障已消除，允许回到正常的经验调度。失败记录与恢复证据保留，以后遇到相似情况可提前审核。',lesson:'常规调度不等于下一块一定跳过：历史错误邻域、冷却条件等仍可能要求审核。'}
];
function renderFrame(i){const d=frames[i];selectButton('case-buttons','frame',i);$('case-image').src=`assets/waypoint-${i}.webp`;$('case-image').alt=`原文分类案例控制步 ${d.step}：${d.title}`;$('case-step').textContent=`STEP ${d.step}`;$('case-phase').textContent=d.phase;$('case-title').textContent=d.title;$('case-text').textContent=d.text;$('case-lesson').textContent=d.lesson;}
document.querySelectorAll('#case-buttons button').forEach(b=>b.addEventListener('click',()=>renderFrame(+b.dataset.frame)));
const experiment=[
 {name:'搭积木塔',success:[60,93.75],count:'15/16',tokens:[1.47,.47],time:[54.1,25.2]},
 {name:'叠衣服',success:[100,95],count:'19/20',tokens:[.72,.25],time:[40.4,12.2]},
 {name:'丢瓶子',success:[100,100],count:'20/20',tokens:[1.64,.58],time:[70.5,36.4]},
 {name:'物体分类',success:[60,100],count:'9/9',tokens:[3.5,2.42],time:[177.2,134.2]}
];
const metrics={
 success:{base:'π₀.₅ + GPT-6 Astra',ours:'FastHarness',unit:'%',limit:100,tag:'四任务等权平均',big:'+17.19 pp',title:'80% → 97.19%',description:'搭塔与分类提高，丢瓶子持平，叠衣服下降 5 个百分点。这里的 pp 表示百分点，不是相对百分比。',caution:'引用基线来自另一份报告；不能把这组数值当成同条件配对实验。',mean:[80,97.1875]},
 tokens:{base:'首个评测回合',ours:'最后五回合均值',unit:'M',limit:4,tag:'各任务百分比降幅的平均',big:'57.2% ↓',title:'平均用量 1.83M → 0.93M',description:'这是 FastHarness 随经验积累的变化。四任务的 Token 降幅约为 68.0%、65.3%、64.6%、30.9%。',caution:'数值由原文图 4 转录，已舍入。按汇总 Token 计算的降幅约为 49.2%，与任务等权的 57.2% 不同。',mean:[1.83,.93]},
 time:{base:'首个评测回合',ours:'最后五回合均值',unit:' min',limit:200,tag:'完整任务耗时',big:'约 39% ↓',title:'85.5 → 52.0 分钟',description:'包含策略推理、机器人执行、审核交互和运行开销。丢瓶子与叠衣服任务的审核交互，是耗时的主要部分。',caution:'首回合与后续回合不是随机配对对照；网络响应、重试和任务路径变化也可能影响总时间。',mean:[85.5,52]}
};
function fmt(v,metric){return metric==='success'?`${Number(v.toFixed(2))}%`:metric==='tokens'?`${v.toFixed(2)}M`:`${v.toFixed(1)} min`;}
function renderMetric(key){const d=metrics[key];selectButton('metric-tabs','metric',key);$('legend-base').textContent=d.base;$('legend-ours').textContent=d.ours;$('chart-tag').textContent=d.tag;$('chart-big').textContent=d.big;$('chart-title').textContent=d.title;$('chart-description').textContent=d.description;$('chart-caution').textContent=d.caution;
 $('result-chart').innerHTML=experiment.map(r=>`<div class="bar-group"><div class="bar-group-label">${r.name}</div><div class="bar-pair">${r[key].map((v,i)=>`<div class="bar-track" aria-label="${r.name} ${i?d.ours:d.base} ${fmt(v,key)}"><div class="bar-fill ${i?'ours':''}" style="width:${v/d.limit*100}%"></div><span class="bar-value">${fmt(v,key)}</span></div>`).join('')}</div></div>`).join('');
 $('chart-scale').innerHTML=[0,d.limit/2,d.limit].map(v=>`<span>${v}${d.unit}</span>`).join('');
 $('results-table').querySelector('thead').innerHTML=`<tr><th>任务</th><th>${d.base}</th><th>${d.ours}</th><th>${key==='success'?'FastHarness 成功回合':'下降比例'}</th></tr>`;
 $('results-table').querySelector('tbody').innerHTML=experiment.map(r=>`<tr><td>${r.name}</td><td>${fmt(r[key][0],key)}</td><td>${fmt(r[key][1],key)}</td><td>${key==='success'?r.count:((1-r[key][1]/r[key][0])*100).toFixed(1)+'%'}</td></tr>`).join('')+`<tr><td>等权平均${key==='success'?'':'（原文）'}</td><td>${fmt(d.mean[0],key)}</td><td>${fmt(d.mean[1],key)}</td><td>${key==='success'?'63/65 为合并口径':'各任务降幅均值 '+(experiment.reduce((sum,r)=>sum+1-r[key][1]/r[key][0],0)/4*100).toFixed(1)+'%'}</td></tr>`;
}
document.querySelectorAll('#metric-tabs button').forEach(b=>b.addEventListener('click',()=>renderMetric(b.dataset.metric)));
const codeNotes=[
 {title:'证据数量与成功比例一起决定间隔。',paragraphs:['lower_success_bound 计算 Wilson 形式的分数。interval 先检查最少样本数，以及错误后的连续成功要求；满足后才把分数映射到间隔。','confidence_cap=1 是基础版本。提高该参数，还会按累计确认次数放大间隔。仅引用基础公式不足以描述所有运行配置。','计数可衰减且来自被选择审核的片段，这不是严格的安全置信下界。']},
 {title:'命中高优先级条件，就重新审核。',paragraphs:['调度器依次考虑逐块审核基线、回合起点、恢复、陌生状态、可选接触检查、阶段变化、不确定反馈、运动告警、历史错误、步数上限与随机抽查。','commit_gating 可让已证明可靠的子任务获得更大的未审核步数预算；默认关闭。不能把默认 60 步上限写成任意配置下的不变约束。','默认特征是低分辨率 RGB 加机器人状态，匹配便宜，也存在漏掉小物体、遮挡和细微状态差异的局限。']},
 {title:'真正省下一次模型调用。',paragraphs:['未触发审核时，backend.auto_response 基于当前 proposal 构造 student 响应，裁剪到剩余未审核步数预算。这个分支没有调用 Reviewer。','随后检查 request_id 与当前动作提议一致，再执行并核对实际反馈。引擎每轮重新获取观测与提议，不回放以前的动作。','自动执行状态保持未验证；_remember 只记实际审核确认的上一块结果，不把未审核中间块全都补记成成功。']},
 {title:'到达路标，与完成恢复，是两个状态。',paragraphs:['局部修复失败达到条件后，选择最近可用路标；仍失败时再选择未尝试过的历史点。路标必须来自本回合、位于出错之前，且经过实际执行后的确认。','return_* 成功只进入 after_return，下一步重新处理原始错误。只有原始恢复目标通过验证，状态才回到 normal。','attempt_limit 与 total_limit 限制恢复尝试。总恢复预算跨本回合累计，不因一次恢复成功就无限重置。']},
 {title:'这里揭示了代码与官网的实际差异。',paragraphs:['当前代码在恢复预算耗尽后调用 _run_passthrough：持续生成新的 student 动作，未经审核执行，直到后端报告终止。','日志明确标记 review_verified=False、recovery_passthrough、原始原因和额外控制步。它不是已验证的快路径，也不同于官网文字所说的直接结束回合。','复现实验时，需要单独报告降级执行和预算耗尽回合，固定代码版本、参数及成功判据，才能正确解释效率与成功率。']}
];
function renderCode(i){const d=CODE_EXCERPTS[i],n=codeNotes[i];selectButton('code-tabs','code',i);$('code-path').textContent=d.file;$('code-source').href=`https://github.com/FastHarness/fast-harness/blob/dfe070f8748fc08fae32ad880a35396859b6973e/${d.file}#L${d.start}`;$('code-text').textContent=d.text;$('code-title').textContent=n.title;$('code-description').replaceChildren(...n.paragraphs.map(t=>{const p=document.createElement('p');p.textContent=t;return p;}));}
document.querySelectorAll('#code-tabs button').forEach(b=>b.addEventListener('click',()=>renderCode(+b.dataset.code)));
function renderDemo(){const adaptive=[26,15,14,11,13,12];$('demo-chart').innerHTML=`<div class="legend"><span><i class="baseline-swatch"></i>逐块审核基线</span><span><i class="ours-swatch"></i>自适应审核</span></div><div class="demo-bars">${adaptive.map((v,i)=>`<div class="demo-column" aria-label="第 ${i+1} 轮：基线 37 次，自适应 ${v} 次"><div class="demo-bar" style="height:85%"><span>37</span></div><div class="demo-bar adaptive" style="height:${v/37*85}%"><span>${v}</span></div></div>`).join('')}</div><div class="demo-labels">${adaptive.map((_,i)=>`<span>EP ${i+1}</span>`).join('')}</div><p class="demo-caption">第 5 轮从 11 回升到 13 次：局部波动与总体减少可以同时存在。</p>`;}
$('download-data').addEventListener('click',()=>{const lines=[['source','task','baseline_success_percent','fastharness_success_percent','success_fraction','cold_tokens_million','warm_tokens_million','cold_minutes','warm_minutes'],...experiment.map(r=>['wechat-2026-10-27',r.name,...r.success,r.count,...r.tokens,...r.time])];const blob=new Blob(['\uFEFF'+lines.map(row=>row.join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='FastHarness-article-results.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('print').addEventListener('click',()=>window.print());
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}),{rootMargin:'-15% 0px -65% 0px',threshold:0});document.querySelectorAll('.chapter').forEach(s=>observer.observe(s));
renderScenario('familiar');calculate();renderFrame(0);renderMetric('success');renderCode(0);renderDemo();
