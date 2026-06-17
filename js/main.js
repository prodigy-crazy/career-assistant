var currentQuestion = 0;
var answers = [];
var questions = [
 { dimension: 'R', text: '我喜欢动手组装、修理电子产品或手工物件' },
 { dimension: 'R', text: '我更愿意做有具体实物产出的实操类任务' },
 { dimension: 'R', text: '我擅长拆解和解决机械、设备类的实际问题' },
 { dimension: 'R', text: '我偏好户外活动多于室内伏案工作' },
 { dimension: 'I', text: '我喜欢探索事物背后的原理，做逻辑分析与推导' },
 { dimension: 'I', text: '我乐于查阅文献、研究学术问题与新兴技术' },
 { dimension: 'I', text: '遇到难题时我习惯先收集数据再得出结论' },
 { dimension: 'I', text: '我对科学实验、数据分析类工作有浓厚兴趣' },
 { dimension: 'A', text: '我喜欢通过创意设计、文字或艺术形式表达想法' },
 { dimension: 'A', text: '我更愿意做有创造性、不按固定流程的工作' },
 { dimension: 'A', text: '我对审美、排版、视觉呈现比较敏感' },
 { dimension: 'S', text: '我乐于倾听和帮助他人解决学习或生活中的问题' },
 { dimension: 'S', text: '我喜欢参与志愿服务、社群运营类的活动' },
 { dimension: 'S', text: '我擅长和不同的人沟通协作，愿意从事服务类工作' },
 { dimension: 'E', text: '我喜欢带领团队完成任务，承担组织与决策工作' },
 { dimension: 'E', text: '我对商业运营、市场推广、创业类话题感兴趣' },
 { dimension: 'E', text: '我愿意挑战有业绩目标、能快速获得回报的工作' },
 { dimension: 'C', text: '我喜欢按规范流程做事，确保细节准确无误' },
 { dimension: 'C', text: '我擅长整理资料、数据统计与事务性工作' },
 { dimension: 'C', text: '我更偏好稳定、规则清晰的工作环境' }
];

function nav(p){
 document.querySelectorAll('.page').forEach(function(x){x.classList.remove('active')});
 document.querySelectorAll('.nav-link').forEach(function(x){x.classList.remove('active')});
 var activeLink=document.querySelector('.nav-link[onclick="nav(\''+p+'\')"]');
 if(activeLink)activeLink.classList.add('active');
 document.getElementById(p).classList.add('active');
 if(p==='test'){initTest();}
 if(p==='result'){initResultPage();}
}

function initTest(){
 var saved=localStorage.getItem('testAnswers');
 answers=saved?JSON.parse(saved):new Array(20).fill(null);
 currentQuestion=0;
 showQuestion();
}

function showQuestion(){
 var q=questions[currentQuestion];
 document.getElementById('question-number').textContent=currentQuestion+1;
 document.getElementById('question-text').textContent=q.text;
 document.getElementById('progress-text').textContent=(currentQuestion+1)+' / 20';
 document.getElementById('progress-fill').style.width=((currentQuestion+1)/20*100)+'%';

 // 重置所有选项状态
 var options=document.querySelectorAll('.option');
 options.forEach(function(opt){opt.classList.remove('selected')});
 var radios=document.querySelectorAll('input[name="answer"]');
 radios.forEach(function(r){r.checked=false});

 // 如果已有答案，恢复选中状态
 if(answers[currentQuestion]!==null){
 var selectedRadio=document.querySelector('input[name="answer"][value="'+answers[currentQuestion]+'"]');
 if(selectedRadio){
 selectedRadio.checked=true;
 selectedRadio.closest('.option').classList.add('selected');
 }
 }

 document.getElementById('btn-prev').style.display=currentQuestion===0?'none':'inline-block';
 document.getElementById('btn-next').textContent=currentQuestion===19?'提交测评':'下一题';
}

function prevQuestion(){
 saveAnswer();
 if(currentQuestion>0){
 currentQuestion--;
 showQuestion();
 }
}

function nextQuestion(){
 saveAnswer();
 if(currentQuestion<19){
 currentQuestion++;
 showQuestion();
 }else{
 submitTest();
 }
}

function saveAnswer(){
 var selected=document.querySelector('input[name="answer"]:checked');
 if(selected){
 answers[currentQuestion]=parseInt(selected.value);
 localStorage.setItem('testAnswers',JSON.stringify(answers));
 // 更新选项样式
 var options=document.querySelectorAll('.option');
 options.forEach(function(opt){opt.classList.remove('selected')});
 selected.closest('.option').classList.add('selected');
 }
}

function submitTest(){
 saveAnswer();
 var unanswered=answers.filter(function(a){return a===null}).length;
 if(unanswered>0){
 alert('还有 '+unanswered+' 题未作答，请完成所有题目后再提交');
 return;
 }
 calculateScores();
 localStorage.removeItem('testAnswers');
 nav('result');
}

function calculateScores(){
 var scores={R:0,I:0,A:0,S:0,E:0,C:0};
 questions.forEach(function(q,index){
 var answer=answers[index];
 if(answer!==null){
 scores[q.dimension]+=answer;
 }
 });
 localStorage.setItem('testScores',JSON.stringify(scores));
}

function submitInfo(e){
 e.preventDefault();
 var major=document.getElementById('major').value.trim();
 var grade=document.getElementById('grade').value;
 var skills=document.getElementById('skills').value.trim();
 var directions=Array.from(document.querySelectorAll('input[name="direction"]:checked')).map(function(x){return x.value});
 var valid=true;
 document.getElementById('error-major').textContent='';
 document.getElementById('error-grade').textContent='';
 if(!major){document.getElementById('error-major').textContent='请输入你的专业';valid=false;}
 if(!grade){document.getElementById('error-grade').textContent='请选择年级';valid=false;}
 if(!valid)return;
 var userInfo={major:major,grade:grade,skills:skills,directions:directions};
 localStorage.setItem('userInfo',JSON.stringify(userInfo));
 nav('test');
}

function initResultPage(){
 var scores=JSON.parse(localStorage.getItem('testScores')||'{"R":0,"I":0,"A":0,"S":0,"E":0,"C":0}');
 var userInfo=JSON.parse(localStorage.getItem('userInfo')||'{}');
 var dimensions=['R','I','A','S','E','C'];
 dimensions.forEach(function(d){
 document.getElementById('disp-'+d).textContent=scores[d]||0;
 });
 drawRadarChart(scores);
 generateRoutes(scores,userInfo);
 generateAbilities(scores);
 generateTasks(userInfo.grade||'freshman');
}

function drawRadarChart(scores){
 var canvas=document.getElementById('radar-canvas');
 var ctx=canvas.getContext('2d');
 var centerX=canvas.width/2;
 var centerY=canvas.height/2;
 var radius=Math.min(centerX,centerY)-40;
 var dimensions=['R','I','A','S','E','C'];
 var maxScore=20;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.beginPath();
 for(var i=0;i<=3;i++){
 var r=radius*(i/3);
 ctx.beginPath();
 for(var j=0;j<6;j++){
 var angle=(Math.PI/2)+(j*2*Math.PI/6);
 var x=centerX+r*Math.cos(angle);
 var y=centerY-r*Math.sin(angle);
 if(j===0)ctx.moveTo(x,y);
 else ctx.lineTo(x,y);
 }
 ctx.closePath();
 ctx.strokeStyle='#e4e7ed';
 ctx.stroke();
 }
 for(var j=0;j<6;j++){
 var angle=(Math.PI/2)+(j*2*Math.PI/6);
 ctx.beginPath();
 ctx.moveTo(centerX,centerY);
 ctx.lineTo(centerX+radius*Math.cos(angle),centerY-radius*Math.sin(angle));
 ctx.strokeStyle='#e4e7ed';
 ctx.stroke();
 }
 ctx.beginPath();
 for(var j=0;j<6;j++){
 var angle=(Math.PI/2)+(j*2*Math.PI/6);
 var value=(scores[dimensions[j]]||0)/maxScore;
 var x=centerX+value*radius*Math.cos(angle);
 var y=centerY-value*radius*Math.sin(angle);
 if(j===0)ctx.moveTo(x,y);
 else ctx.lineTo(x,y);
 }
 ctx.closePath();
 ctx.fillStyle='rgba(74,144,226,0.3)';
 ctx.fill();
 ctx.strokeStyle='#4A90E2';
 ctx.lineWidth=2;
 ctx.stroke();
 ctx.fillStyle='#606266';
 ctx.font='12px sans-serif';
 ctx.textAlign='center';
 for(var j=0;j<6;j++){
 var angle=(Math.PI/2)+(j*2*Math.PI/6);
 var labelRadius=radius+25;
 var x=centerX+labelRadius*Math.cos(angle);
 var y=centerY-labelRadius*Math.sin(angle);
 ctx.fillText(dimensions[j],x,y+4);
 }
}

function generateRoutes(scores,userInfo){
 var routes=[
 {key:'tech',name:'技术就业路线',dimensions:['R','I'],baseMatch:0.85,description:'适合喜欢动手实践、追求技术深度的同学，未来可成为技术专家或技术管理者'},
 {key:'graduate',name:'考研深造路线',dimensions:['I','A'],baseMatch:0.80,description:'适合喜欢理论研究、追求学术发展的同学，通过考研提升专业竞争力'},
 {key:'civil',name:'公考体制路线',dimensions:['S','E','C'],baseMatch:0.75,description:'适合注重稳定、擅长沟通协调的同学，体制内工作具有稳定性和社会地位'}
 ];
 routes.forEach(function(route){
 var avgScore=route.dimensions.reduce(function(sum,d){return sum+(scores[d]||0)},0)/route.dimensions.length;
 route.match=Math.round((avgScore/20)*route.baseMatch*100);
 });
 routes.sort(function(a,b){return b.match-a.match});
 var container=document.getElementById('routes-container');
 container.innerHTML='';
 routes.forEach(function(route){
 var html='<div class="route-card"><div class="route-header"><span class="route-name">'+route.name+'</span><span class="route-match">'+route.match+'%</span></div><p class="route-desc">'+route.description+'</p></div>';
 container.innerHTML+=html;
 });
}

function generateAbilities(scores){
 var dimensions=['R','I','A','S','E','C'];
 var sorted=dimensions.slice().sort(function(a,b){return (scores[b]||0)-(scores[a]||0)});
 var top3=sorted.slice(0,3);
 var abilitiesMap={
 R:['动手实践能力：多参与实际项目，提升技术问题解决能力','技术文档能力：学会编写规范的技术文档和项目说明'],
 I:['学术研究能力：培养文献检索和论文写作能力','数据分析能力：掌握数据处理和可视化技能'],
 A:['创意设计能力：培养审美意识和创新思维','视觉表达能力：学会用图表和文档清晰呈现想法'],
 S:['人际沟通能力：提升跨部门沟通和表达能力','团队协作能力：学会在团队中有效分工和配合'],
 E:['组织管理能力：培养项目规划和工作协调能力','商业洞察能力：理解商业模式和商业逻辑'],
 C:['细节把控能力：养成严谨细致的工作习惯','流程优化能力：学会分析和改进工作流程']
 };
 var abilitiesList=document.getElementById('abilities-list');
 abilitiesList.innerHTML='';
 top3.forEach(function(d,index){
 var items=abilitiesMap[d]||[];
 items.slice(0,1).forEach(function(item){
 abilitiesList.innerHTML+='<div class="ability-item"><span class="ability-num">'+(abilitiesList.children.length+1)+'</span><div class="ability-content"><h4>'+item.split('：')[0]+'</h4><p>'+item.split('：')[1]+'</p></div></div>';
 });
 });
}

function generateTasks(grade){
 var taskLibrary={
 freshman:['参加新生专业导学活动，了解专业方向和就业前景','学习基础编程语言（Python/Java/C++任选其一）','加入专业相关社团或技术俱乐部','完成课程配套的基础编程练习','考取计算机一级或二级证书'],
 sophomore:['参加专业技能竞赛（如ACM、程序设计赛等）','完成3-5个完整的技术小项目','寻找第一份实习或兼职机会','学习主流技术栈（Web开发/移动开发/数据处理）','为保研或出国做准备（英语、成绩）'],
 junior:['争取名企暑期实习机会','系统准备秋招/春招（算法、项目、面试）','完成一个高质量的技术项目','积累GitHub开源项目贡献经验','完善个人技术博客和简历'],
 senior:['全力冲刺秋招/春招，获取offer','完成毕业设计和毕业论文','参加校园招聘宣讲会和双选会','提前学习目标岗位入职前技能','准备入职体检和三方协议签订']
 };
 var tasks=taskLibrary[grade]||taskLibrary.freshman;
 var tasksList=document.getElementById('tasks-list');
 tasksList.innerHTML='';
 tasks.forEach(function(task,index){
 tasksList.innerHTML+='<div class="task-item"><span class="task-priority">优先级'+(index+1)+'</span><p class="task-text">'+task+'</p></div>';
 });
}

function restartAssessment(){
 localStorage.removeItem('userInfo');
 localStorage.removeItem('testScores');
 localStorage.removeItem('testAnswers');
 localStorage.removeItem('taskProgress');
 nav('home');
}

// ========================================
// 主题切换功能
// ========================================
function toggleTheme() {
    const body = document.body;
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'light') {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
}

// 页面加载时恢复主题状态
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

// ========================================
// 任务打卡功能
// ========================================
function generateTasks(grade) {
 var taskLibrary={
 freshman:['参加新生专业导学活动，了解专业方向和就业前景','学习基础编程语言（Python/Java/C++任选其一）','加入专业相关社团或技术俱乐部','完成课程配套的基础编程练习','考取计算机一级或二级证书'],
 sophomore:['参加专业技能竞赛（如ACM、程序设计赛等）','完成3-5个完整的技术小项目','寻找第一份实习或兼职机会','学习主流技术栈（Web开发/移动开发/数据处理）','为保研或出国做准备（英语、成绩）'],
 junior:['争取名企暑期实习机会','系统准备秋招/春招（算法、项目、面试）','完成一个高质量的技术项目','积累GitHub开源项目贡献经验','完善个人技术博客和简历'],
 senior:['全力冲刺秋招/春招，获取offer','完成毕业设计和毕业论文','参加校园招聘宣讲会和双选会','提前学习目标岗位入职前技能','准备入职体检和三方协议签订']
 };
 var tasks=taskLibrary[grade]||taskLibrary.freshman;
 var tasksList=document.getElementById('tasks-list');
 tasksList.innerHTML='';
 
 // 加载已完成的任务进度
 var progress = JSON.parse(localStorage.getItem('taskProgress') || '{}');
 
 tasks.forEach(function(task,index){
 var isCompleted = progress[task] || false;
 tasksList.innerHTML+='<div class="task-item'+(isCompleted?' completed':'')+'"><input type="checkbox" class="task-checkbox"'+(isCompleted?' checked':'')+' onclick="toggleTask(\''+escape(task)+'\', this)"><div class="task-content"><span class="task-priority">优先级'+(index+1)+'</span><p class="task-text">'+task+'</p></div></div>';
 });
}

function toggleTask(task, checkbox) {
    var escapedTask = task;
    var taskText = unescape(escapedTask);
    var progress = JSON.parse(localStorage.getItem('taskProgress') || '{}');
    
    if (checkbox.checked) {
        progress[taskText] = true;
        checkbox.closest('.task-item').classList.add('completed');
    } else {
        delete progress[taskText];
        checkbox.closest('.task-item').classList.remove('completed');
    }
    
    localStorage.setItem('taskProgress', JSON.stringify(progress));
}

// ========================================
// 报告导出功能
// ========================================
function exportReport() {
    var scores = JSON.parse(localStorage.getItem('testScores') || '{"R":0,"I":0,"A":0,"S":0,"E":0,"C":0}');
    var userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    var report = `# 大学生成长职途规划报告\n\n`;
    report += `---\n\n`;
    report += `## 📋 个人信息\n\n`;
    report += `- 专业：${userInfo.major || '未填写'}\n`;
    report += `- 年级：${getGradeLabel(userInfo.grade) || '未选择'}\n`;
    report += `- 技能：${userInfo.skills || '未填写'}\n`;
    report += `- 意向方向：${userInfo.directions ? userInfo.directions.join('、') : '未选择'}\n\n`;
    report += `---\n\n`;
    report += `## 📊 职业兴趣测评得分\n\n`;
    report += `| 维度 | 得分 |\n`;
    report += `|------|------|\n`;
    report += `| R 现实型 | ${scores.R || 0} |\n`;
    report += `| I 研究型 | ${scores.I || 0} |\n`;
    report += `| A 艺术型 | ${scores.A || 0} |\n`;
    report += `| S 社会型 | ${scores.S || 0} |\n`;
    report += `| E 企业型 | ${scores.E || 0} |\n`;
    report += `| C 常规型 | ${scores.C || 0} |\n\n`;
    report += `---\n\n`;
    report += `## 🎯 推荐发展路线\n\n`;
    
    // 计算发展路线
    var routes = calculateRoutes(scores);
    routes.forEach(function(route, index) {
        report += `${index + 1}. **${route.name}** (适配度：${route.match}%)\n`;
        report += `   - ${route.description}\n\n`;
    });
    
    report += `---\n\n`;
    report += `## 🛠 能力提升建议\n\n`;
    var abilities = getAbilities(scores);
    abilities.forEach(function(ability, index) {
        report += `${index + 1}. ${ability}\n`;
    });
    
    report += `\n---\n\n`;
    report += `## ✅ 本学期行动清单\n\n`;
    var tasks = getTasks(userInfo.grade);
    tasks.forEach(function(task, index) {
        report += `${index + 1}. ${task}\n`;
    });
    
    report += `\n---\n\n`;
    report += `*生成时间：${new Date().toLocaleString('zh-CN')}*\n`;
    report += `*基于霍兰德职业兴趣理论 · 原创测评体系*\n`;
    
    // 创建下载链接
    var blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '职途规划报告_' + new Date().toISOString().slice(0, 10) + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('报告已导出！');
}

function getGradeLabel(grade) {
    var labels = {
        freshman: '大一',
        sophomore: '大二',
        junior: '大三',
        senior: '大四'
    };
    return labels[grade];
}

function calculateRoutes(scores) {
    var routes = [
        {key:'tech',name:'技术就业路线',dimensions:['R','I'],baseMatch:0.85,description:'适合喜欢动手实践、追求技术深度的同学，未来可成为技术专家或技术管理者'},
        {key:'graduate',name:'考研深造路线',dimensions:['I','A'],baseMatch:0.80,description:'适合喜欢理论研究、追求学术发展的同学，通过考研提升专业竞争力'},
        {key:'civil',name:'公考体制路线',dimensions:['S','E','C'],baseMatch:0.75,description:'适合注重稳定、擅长沟通协调的同学，体制内工作具有稳定性和社会地位'}
    ];
    
    routes.forEach(function(route) {
        var avgScore = route.dimensions.reduce(function(sum, d) { return sum + (scores[d] || 0); }, 0) / route.dimensions.length;
        route.match = Math.round((avgScore / 20) * route.baseMatch * 100);
    });
    
    return routes.sort(function(a, b) { return b.match - a.match; });
}

function getAbilities(scores) {
    var dimensions = ['R','I','A','S','E','C'];
    var sorted = dimensions.slice().sort(function(a, b) { return (scores[b] || 0) - (scores[a] || 0); });
    var top3 = sorted.slice(0, 3);
    
    var abilitiesMap = {
        R: ['动手实践能力：多参与实际项目，提升技术问题解决能力'],
        I: ['学术研究能力：培养文献检索和论文写作能力'],
        A: ['创意设计能力：培养审美意识和创新思维'],
        S: ['人际沟通能力：提升跨部门沟通和表达能力'],
        E: ['组织管理能力：培养项目规划和工作协调能力'],
        C: ['细节把控能力：养成严谨细致的工作习惯']
    };
    
    var result = [];
    top3.forEach(function(d) {
        result.push(abilitiesMap[d][0]);
    });
    
    return result;
}

function getTasks(grade) {
    var taskLibrary = {
        freshman: ['参加新生专业导学活动，了解专业方向和就业前景', '学习基础编程语言（Python/Java/C++任选其一）', '加入专业相关社团或技术俱乐部', '完成课程配套的基础编程练习', '考取计算机一级或二级证书'],
        sophomore: ['参加专业技能竞赛（如ACM、程序设计赛等）', '完成3-5个完整的技术小项目', '寻找第一份实习或兼职机会', '学习主流技术栈（Web开发/移动开发/数据处理）', '为保研或出国做准备（英语、成绩）'],
        junior: ['争取名企暑期实习机会', '系统准备秋招/春招（算法、项目、面试）', '完成一个高质量的技术项目', '积累GitHub开源项目贡献经验', '完善个人技术博客和简历'],
        senior: ['全力冲刺秋招/春招，获取offer', '完成毕业设计和毕业论文', '参加校园招聘宣讲会和双选会', '提前学习目标岗位入职前技能', '准备入职体检和三方协议签订']
    };
    
    return taskLibrary[grade] || taskLibrary.freshman;
}

// ========================================
// 海报导出功能
// ========================================
function exportPoster() {
    var scores = JSON.parse(localStorage.getItem('testScores') || '{"R":0,"I":0,"A":0,"S":0,"E":0,"C":0}');
    var userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    // 创建一个canvas用于绘制海报
    var canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    var ctx = canvas.getContext('2d');
    
    // 背景渐变
    var gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(1, '#6BA3E0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);
    
    // 标题区域
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('大学生成长职途助手', 300, 60);
    
    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('我的专属职业规划报告', 300, 100);
    
    // 绘制雷达图
    drawPosterRadar(ctx, scores, 300, 300, 120);
    
    // 个人信息卡片
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(50, 480, 500, 280);
    
    ctx.fillStyle = '#303133';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📋 个人信息', 70, 520);
    
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#606266';
    ctx.fillText('专业：' + (userInfo.major || '未填写'), 70, 555);
    ctx.fillText('年级：' + getGradeLabel(userInfo.grade) || '未选择', 70, 585);
    ctx.fillText('技能：' + (userInfo.skills || '未填写'), 70, 615);
    
    // 得分展示
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#303133';
    ctx.fillText('📊 兴趣维度得分', 70, 660);
    
    var dimensions = ['R', 'I', 'A', 'S', 'E', 'C'];
    var labels = ['现实型', '研究型', '艺术型', '社会型', '企业型', '常规型'];
    var x = 70;
    var y = 690;
    
    for (var i = 0; i < dimensions.length; i++) {
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#4A90E2';
        ctx.fillText(dimensions[i], x, y);
        
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#606266';
        ctx.fillText(labels[i], x - 8, y + 20);
        
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#303133';
        ctx.fillText(scores[dimensions[i]] || 0, x, y + 45);
        
        x += 80;
    }
    
    // 底部装饰
    ctx.fillStyle = 'rgba(74,144,226,0.3)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('基于霍兰德职业兴趣理论 · 原创测评体系', 300, 770);
    
    // 导出图片
    var url = canvas.toDataURL('image/png');
    var a = document.createElement('a');
    a.href = url;
    a.download = '职途规划海报_' + new Date().toISOString().slice(0, 10) + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    alert('海报已导出！');
}

function drawPosterRadar(ctx, scores, centerX, centerY, radius) {
    var dimensions = ['R', 'I', 'A', 'S', 'E', 'C'];
    var maxScore = 20;
    
    // 绘制网格
    for (var i = 0; i <= 3; i++) {
        var r = radius * (i / 3);
        ctx.beginPath();
        for (var j = 0; j < 6; j++) {
            var angle = (Math.PI / 2) + (j * 2 * Math.PI / 6);
            var x = centerX + r * Math.cos(angle);
            var y = centerY - r * Math.sin(angle);
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // 绘制轴线
    for (var j = 0; j < 6; j++) {
        var angle = (Math.PI / 2) + (j * 2 * Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius * Math.cos(angle), centerY - radius * Math.sin(angle));
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // 绘制数据区域
    ctx.beginPath();
    for (var j = 0; j < 6; j++) {
        var angle = (Math.PI / 2) + (j * 2 * Math.PI / 6);
        var value = (scores[dimensions[j]] || 0) / maxScore;
        var x = centerX + value * radius * Math.cos(angle);
        var y = centerY - value * radius * Math.sin(angle);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制标签
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    for (var j = 0; j < 6; j++) {
        var angle = (Math.PI / 2) + (j * 2 * Math.PI / 6);
        var labelRadius = radius + 25;
        var x = centerX + labelRadius * Math.cos(angle);
        var y = centerY - labelRadius * Math.sin(angle);
        ctx.fillText(dimensions[j], x, y + 4);
    }
}