var currentQuestion = 0;
var answers = [];
var selectedQuestions = [];

var API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3001/api' 
  : 'https://career-assistant-backend-1ndf.onrender.com/api';

var cachedData = {
  questions: null,
  majorCategoryMap: null,
  directionWeightConfig: null,
  majorSkillMap: null,
  majorList: null,
  learningPlanData: null
};

var fallbackData = {
  directionWeightConfig: {
    undecided: { R: 1.0, I: 1.0, A: 1.0, S: 1.0, E: 1.0, C: 1.0 },
    job: { R: 1.0, I: 1.1, A: 0.9, S: 1.0, E: 1.2, C: 1.0 },
    graduate: { R: 0.9, I: 1.3, A: 1.0, S: 0.8, E: 0.9, C: 1.1 },
    public: { R: 0.9, I: 1.0, A: 1.0, S: 1.2, E: 1.0, C: 1.1 }
  },
  majorCategoryMap: {}
};

function fetchFromBackend(endpoint, params) {
  var url = API_BASE_URL + endpoint;
  if (params) {
    var query = new URLSearchParams(params).toString();
    if (query) url += '?' + query;
  }
  return fetch(url)
    .then(function(response) {
      if (!response.ok) {
        console.warn('Backend API failed:', endpoint);
        return null;
      }
      return response.json();
    })
    .catch(function(err) {
      console.error('Backend fetch error:', err);
      return null;
    });
}

function fetchQuestions() {
  if (cachedData.questions) return Promise.resolve(cachedData.questions);
  return fetchFromBackend('/questions').then(function(data) {
    if (data) {
      cachedData.questions = data;
    }
    return data || [];
  });
}

function fetchMajorCategories() {
  if (cachedData.majorCategoryMap) return Promise.resolve(cachedData.majorCategoryMap);
  return fetchFromBackend('/major-categories').then(function(data) {
    if (data) {
      cachedData.majorCategoryMap = {};
      data.forEach(function(item) {
        cachedData.majorCategoryMap[item.major_name] = item.category;
      });
    }
    return cachedData.majorCategoryMap || {};
  });
}

function fetchDirectionWeights() {
  if (cachedData.directionWeightConfig) return Promise.resolve(cachedData.directionWeightConfig);
  return fetchFromBackend('/direction-weights').then(function(data) {
    if (data) {
      cachedData.directionWeightConfig = {};
      data.forEach(function(item) {
        cachedData.directionWeightConfig[item.direction] = {
          R: item.R, I: item.I, A: item.A, S: item.S, E: item.E, C: item.C
        };
      });
      cachedData.directionWeightConfig.undecided = { R: 1.0, I: 1.0, A: 1.0, S: 1.0, E: 1.0, C: 1.0 };
    }
    return cachedData.directionWeightConfig || { undecided: { R: 1.0, I: 1.0, A: 1.0, S: 1.0, E: 1.0, C: 1.0 } };
  });
}


function fetchMajors() {
  if (cachedData.majorList) return Promise.resolve(cachedData.majorList);
  return fetchFromBackend('/majors').then(function(data) {
    if (data) {
      cachedData.majorList = data.map(function(m) { return m.name; });
    }
    return cachedData.majorList || [];
  });
}

function fetchMajorSkills(major) {
  if (cachedData.majorSkillMap && cachedData.majorSkillMap[major]) {
    return Promise.resolve(cachedData.majorSkillMap);
  }
  var url = '/major-skills';
  if (major) {
    url += '?major_name=' + encodeURIComponent(major);
  }
  return fetchFromBackend(url).then(function(data) {
    if (data) {
      if (!cachedData.majorSkillMap) {
        cachedData.majorSkillMap = {};
      }
      for (var key in data) {
        cachedData.majorSkillMap[key] = data[key];
      }
    }
    return cachedData.majorSkillMap || {};
  });
}

function selectQuestions(major, directions) {
    var questionBank = cachedData.questions || [];
    var majorCategoryMap = cachedData.majorCategoryMap || {};
    
    var category = majorCategoryMap[major] || 'general';
    var totalNeeded = 20;
    var dimensions = ['R', 'I', 'A', 'S', 'E', 'C'];

    var allowedDirections = [];
    var isUndecided = directions.length === 0 || directions.includes('undecided');
    
    if (isUndecided) {
        allowedDirections = ['job', 'graduate', 'public'];
    } else {
        allowedDirections = directions;
    }

    var weights = { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 };
    var directionWeightConfig = cachedData.directionWeightConfig || fallbackData.directionWeightConfig;
    allowedDirections.forEach(function(dir) {
        var dirWeights = directionWeightConfig[dir] || directionWeightConfig.undecided;
        for (var d in dirWeights) {
            weights[d] = weights[d] * dirWeights[d];
        }
    });

    var totalWeight = Object.values(weights).reduce(function(a, b) { return a + b; }, 0);
    var dimCounts = {};
    
    dimensions.forEach(function(dim) {
        dimCounts[dim] = Math.max(3, Math.round((weights[dim] / totalWeight) * totalNeeded));
    });

    var sum = Object.values(dimCounts).reduce(function(a, b) { return a + b; }, 0);
    var diff = sum - totalNeeded;
    
    if (diff > 0) {
        var sortedDims = dimensions.slice().sort(function(a, b) { return weights[a] - weights[b]; });
        for (var i = 0; i < diff && i < sortedDims.length; i++) {
            if (dimCounts[sortedDims[i]] > 3) {
                dimCounts[sortedDims[i]]--;
            }
        }
    } else if (diff < 0) {
        var sortedDims = dimensions.slice().sort(function(a, b) { return weights[b] - weights[a]; });
        for (var i = 0; i < Math.abs(diff) && i < sortedDims.length; i++) {
            dimCounts[sortedDims[i]]++;
        }
    }

    sum = Object.values(dimCounts).reduce(function(a, b) { return a + b; }, 0);
    if (sum !== totalNeeded) {
        dimCounts[dimensions[dimensions.length - 1]] += totalNeeded - sum;
    }

    var selected = [];
    var usedTexts = new Set();

    dimensions.forEach(function(dim) {
        var count = dimCounts[dim] || 3;
        
        var availableQuestions = questionBank.filter(function(q) {
            if (q.dimension !== dim || usedTexts.has(q.text)) {
                return false;
            }
            if (!q.direction) {
                return true;
            }
            return allowedDirections.includes(q.direction);
        });

        availableQuestions.sort(function(a, b) {
            var aScore = 0;
            var bScore = 0;
            
            if (a.major_category === category) aScore += 2;
            if (b.major_category === category) bScore += 2;
            
            if (a.direction) aScore += 1;
            if (b.direction) bScore += 1;
            
            return bScore - aScore;
        });

        var highPriority = availableQuestions.filter(function(q) { 
            return q.major_category === category && q.direction; 
        });
        var midPriority = availableQuestions.filter(function(q) { 
            return (q.major_category === category || q.direction) && !(q.major_category === category && q.direction); 
        });
        var lowPriority = availableQuestions.filter(function(q) { 
            return !q.major_category && !q.direction; 
        });
        
        highPriority.sort(function() { return Math.random() - 0.5; });
        midPriority.sort(function() { return Math.random() - 0.5; });
        lowPriority.sort(function() { return Math.random() - 0.5; });
        
        var shuffled = [...highPriority, ...midPriority, ...lowPriority];

        var toSelect = shuffled.slice(0, count);
        toSelect.forEach(function(q) {
            selected.push(q);
            usedTexts.add(q.text);
        });
    });

    selected.sort(function() { return Math.random() - 0.5; });

    return selected;
}

// 计算最终得分（处理反向题）
function calculateScore(answer, question) {
    if (answer === null) return null;
    // 反向题：5分→1分, 4分→2分, 3分不变, 2分→4分, 1分→5分
    return question.reverse ? 6 - answer : answer;
}

// 50个常见大学专业列表
var majorList = [
    '计算机科学与技术','软件工程','数据科学与大数据技术','人工智能','电子信息工程',
    '通信工程','电气工程及其自动化','自动化','机械设计制造及其自动化','土木工程',
    '建筑学','城乡规划','金融学','会计学','工商管理',
    '市场营销','人力资源管理','国际经济与贸易','经济学','财务管理',
    '法学','社会工作','行政管理','汉语言文学','新闻学',
    '广告学','英语','日语','数学与应用数学','应用物理学',
    '化学','生物科学','环境工程','临床医学','护理学',
    '药学','心理学','教育学','学前教育','体育教育',
    '美术学','视觉传达设计','数字媒体艺术','音乐学','历史学',
    '哲学','社会学','统计学','物流管理','旅游管理'
];

var currentUser = null;

function getCaptcha(type) {
    var usernameInput = type === 'login' ? document.getElementById('login-username') : document.getElementById('reg-username');
    var btn = type === 'login' ? document.querySelector('#login-form .btn-captcha') : document.querySelector('#register-form .btn-captcha');
    var errorId = type === 'login' ? 'login-error-username' : 'reg-error-username';
    
    var username = usernameInput.value.trim();
    
    if (!username || username.length < 3) {
        document.getElementById(errorId).textContent = '用户名长度必须在3-20位之间';
        return;
    }
    
    document.getElementById(errorId).textContent = '';
    
    btn.disabled = true;
    btn.textContent = '获取中...';
    
    fetch(`${API_BASE_URL}/users/captcha?username=${encodeURIComponent(username)}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.error) {
                alert(data.error);
                btn.disabled = false;
                btn.textContent = '获取验证码';
            } else {
                alert(`验证码已发送：${data.captcha}`);
                btn.textContent = '60秒后重发';
                var countdown = 60;
                var timer = setInterval(function() {
                    countdown--;
                    btn.textContent = countdown + '秒后重发';
                    if (countdown <= 0) {
                        clearInterval(timer);
                        btn.disabled = false;
                        btn.textContent = '获取验证码';
                    }
                }, 1000);
            }
        })
        .catch(function(err) {
            console.error('获取验证码失败:', err);
            alert('获取验证码失败，请重试');
            btn.disabled = false;
            btn.textContent = '获取验证码';
        });
}

function handleLogin(event) {
    event.preventDefault();
    
    var username = document.getElementById('login-username').value.trim();
    var password = document.getElementById('login-password').value;
    var captcha = document.getElementById('login-captcha').value.trim();
    
    document.getElementById('login-error-username').textContent = '';
    document.getElementById('login-error-password').textContent = '';
    document.getElementById('login-error-captcha').textContent = '';
    
    if (!username || username.length < 3) {
        document.getElementById('login-error-username').textContent = '用户名长度必须在3-20位之间';
        return;
    }
    if (!password) {
        document.getElementById('login-error-password').textContent = '请输入密码';
        return;
    }
    if (!captcha) {
        document.getElementById('login-error-captcha').textContent = '请输入验证码';
        return;
    }
    
    fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, captcha })
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.error) {
                alert(data.error);
            } else {
                currentUser = data;
                localStorage.setItem('userInfo', JSON.stringify({
                    username: data.username,
                    userId: data.id,
                    token: data.token
                }));
                alert('登录成功！');
                showWelcomeUser(data.username);
                nav('home');
            }
        })
        .catch(function(err) {
            console.error('登录失败:', err);
            alert('登录失败，请重试');
        });
}

function handleRegister(event) {
    event.preventDefault();
    
    var username = document.getElementById('reg-username').value.trim();
    var password = document.getElementById('reg-password').value;
    var confirmPassword = document.getElementById('reg-confirm-password').value;
    var captcha = document.getElementById('reg-captcha').value.trim();
    
    document.getElementById('reg-error-username').textContent = '';
    document.getElementById('reg-error-password').textContent = '';
    document.getElementById('reg-error-confirm').textContent = '';
    document.getElementById('reg-error-captcha').textContent = '';
    
    if (!username || username.length < 3) {
        document.getElementById('reg-error-username').textContent = '用户名长度必须在3-20位之间';
        return;
    }
    if (!password || password.length < 6) {
        document.getElementById('reg-error-password').textContent = '密码至少6位';
        return;
    }
    if (password !== confirmPassword) {
        document.getElementById('reg-error-confirm').textContent = '两次输入的密码不一致';
        return;
    }
    if (!captcha) {
        document.getElementById('reg-error-captcha').textContent = '请输入验证码';
        return;
    }
    
    fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, captcha })
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.error) {
                alert(data.error);
            } else {
                currentUser = data;
                localStorage.setItem('userInfo', JSON.stringify({
                    username: data.username,
                    userId: data.id,
                    token: data.token
                }));
                alert('注册成功！');
                showWelcomeUser(data.username);
                nav('home');
            }
        })
        .catch(function(err) {
            console.error('注册失败:', err);
            alert('注册失败，请重试');
        });
}

function showWelcomeUser(username) {
    var welcomeEl = document.getElementById('welcome-user');
    var logoutBtn = document.getElementById('logout-btn');
    var recordsBtn = document.getElementById('records-btn');
    if (welcomeEl) {
        welcomeEl.textContent = '欢迎 ' + username + ' 登录';
    }
    if (logoutBtn) {
        logoutBtn.style.display = 'block';
    }
    if (recordsBtn) {
        recordsBtn.style.display = 'block';
    }
}

function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('userInfo');
        currentUser = null;
        var welcomeEl = document.getElementById('welcome-user');
        var logoutBtn = document.getElementById('logout-btn');
        var recordsBtn = document.getElementById('records-btn');
        if (welcomeEl) {
            welcomeEl.textContent = '';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        if (recordsBtn) {
            recordsBtn.style.display = 'none';
        }
        nav('login');
    }
}

function nav(p){
 document.querySelectorAll('.page').forEach(function(x){x.classList.remove('active')});
 document.querySelectorAll('.nav-link').forEach(function(x){x.classList.remove('active')});
 var activeLink=document.querySelector('.nav-link[onclick="nav(\''+p+'\')"]');
 if(activeLink)activeLink.classList.add('active');
 document.getElementById(p).classList.add('active');
 if(p==='test'){initTest();}
 if(p==='result'){initResultPage();}
 if(p==='records'){loadUserRecords();}
}

function loadUserRecords() {
    var userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    var token = userInfo.token;
    
    if (!token) {
        document.getElementById('records-list').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔒</div>
                <p>请先登录查看测评记录</p>
                <button class="btn-primary" onclick="nav('login')">去登录</button>
            </div>
        `;
        return;
    }
    
    fetch(`${API_BASE_URL}/test-records`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('获取记录失败');
            }
            return response.json();
        })
        .then(function(records) {
            var container = document.getElementById('records-list');
            
            if (!records || records.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <p>暂无测评记录</p>
                        <button class="btn-primary" onclick="nav('home')">去测评</button>
                    </div>
                `;
                return;
            }
            
            var html = records.map(function(record) {
                var scores = typeof record.scores === 'string' ? JSON.parse(record.scores) : record.scores;
                var directions = typeof record.directions === 'string' ? JSON.parse(record.directions) : record.directions;
                var date = new Date(record.created_at).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                var scoreHtml = Object.keys(scores).map(function(key) {
                    return `<div class="record-score-item"><span class="score-label">${key}</span><span class="score-value">${scores[key]}</span></div>`;
                }).join('');
                
                return `
                    <div class="record-card">
                        <div class="record-card-header">
                            <span class="record-card-title">测评记录 #${record.id}</span>
                            <span class="record-card-date">${date}</span>
                        </div>
                        <div class="record-card-info">
                            <div class="record-info-item">
                                <span class="label">专业：</span>
                                <span class="value">${record.major_name || '未填写'}</span>
                            </div>
                            <div class="record-info-item">
                                <span class="label">年级：</span>
                                <span class="value">${record.grade || '未填写'}</span>
                            </div>
                            <div class="record-info-item">
                                <span class="label">方向：</span>
                                <span class="value">${Array.isArray(directions) ? directions.join('、') : directions}</span>
                            </div>
                        </div>
                        <div class="record-scores">
                            ${scoreHtml}
                        </div>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = html;
        })
        .catch(function(err) {
            console.error('加载记录失败:', err);
            document.getElementById('records-list').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❌</div>
                    <p>加载记录失败，请重试</p>
                    <button class="btn-primary" onclick="loadUserRecords()">重试</button>
                </div>
            `;
        });
}

function initTest() {
    Promise.all([
        fetchQuestions(),
        fetchMajorCategories(),
        fetchDirectionWeights()
    ]).then(function() {
        var userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        var major = userInfo.major || '';
        var directions = userInfo.directions || [];
        selectedQuestions = selectQuestions(major, directions);

        var savedAnswers = localStorage.getItem('testAnswers');
        var savedQ = localStorage.getItem('testQuestions');
        if (savedAnswers && savedQ) {
            var parsedQ = JSON.parse(savedQ);
            if (JSON.stringify(parsedQ.map(function(q) { return q.text; })) === JSON.stringify(selectedQuestions.map(function(q) { return q.text; }))) {
                answers = JSON.parse(savedAnswers);
            } else {
                answers = new Array(20).fill(null);
                localStorage.removeItem('testAnswers');
                localStorage.removeItem('testQuestions');
            }
        } else {
            answers = new Array(20).fill(null);
        }
        currentQuestion = 0;
        initProgressTrack();
        showQuestion();
    }).catch(function(err) {
        console.error('Failed to load test data:', err);
        alert('加载测评数据失败，请检查网络连接');
    });
}

function initProgressTrack(){
 var track=document.getElementById('progress-track');
 if(!track) return;
 track.innerHTML='';
 var total=selectedQuestions.length;
 for(var i=0;i<total;i++){
  var node=document.createElement('div');
  node.className='progress-node';
  node.id='pnode-'+i;
  node.setAttribute('data-index',i);
  node.textContent=i+1;
  node.addEventListener('click',function(){
   var idx=parseInt(this.getAttribute('data-index'));
   if(idx!==currentQuestion){
    currentQuestion=idx;
    showQuestion();
   }
  });
  if(i===0) node.classList.add('current');
  track.appendChild(node);
  if(i<total-1){
   var line=document.createElement('div');
   line.className='progress-line';
   line.id='pline-'+i;
   track.appendChild(line);
  }
 }
}

function updateProgressTrack(current){
 var total=selectedQuestions.length;
 for(var i=0;i<total;i++){
  var node=document.getElementById('pnode-'+i);
  if(!node) continue;
  node.classList.remove('completed','completed-unanswered','current');

  if(i===current){
   // 当前题目：绿色放大发光
   node.classList.add('current');
  }else if(answers[i]!==null){
   // 已答题：绿色（无论是否在当前题目之前）
   node.classList.add('completed');
  }else if(i<current){
   // 已过但未答：灰色
   node.classList.add('completed-unanswered');
  }
  // i > current 且未答：保持默认灰色，不处理

  var line=document.getElementById('pline-'+i);
  if(line){
   // 连线：只有当前题目之前的才显示绿色
   if(i<current) line.classList.add('completed');
   else line.classList.remove('completed');
  }
 }
}

function showQuestion(){
 var q=selectedQuestions[currentQuestion];
 document.getElementById('question-number').textContent=currentQuestion+1;
 document.getElementById('question-text').textContent=q.text;
 document.getElementById('progress-text').textContent=(currentQuestion+1)+' / '+selectedQuestions.length;
 updateProgressTrack(currentQuestion);

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
 if(currentQuestion<selectedQuestions.length-1){
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
 localStorage.setItem('testQuestions',JSON.stringify(selectedQuestions));
 // 更新选项样式
 var options=document.querySelectorAll('.option');
 options.forEach(function(opt){opt.classList.remove('selected')});
 selected.closest('.option').classList.add('selected');
 updateProgressTrack(currentQuestion);
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
 saveTestRecord();
 nav('result');
}

function calculateScores(){
 var scores={R:0,I:0,A:0,S:0,E:0,C:0};
 selectedQuestions.forEach(function(q,index){
 var answer=answers[index];
 if(answer!==null){
 // 处理反向题
 scores[q.dimension]+=calculateScore(answer,q);
 }
 });
 localStorage.setItem('testScores',JSON.stringify(scores));
}

function saveTestRecord() {
 var scores = JSON.parse(localStorage.getItem('testScores') || '{"R":0,"I":0,"A":0,"S":0,"E":0,"C":0}');
 var userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
 var token = userInfo.token;
 var userAnswers = answers.map(function(val, idx) {
 return { question_id: selectedQuestions[idx].id, value: val };
 });

 fetch(API_BASE_URL + '/test-records', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': 'Bearer ' + token
 },
 body: JSON.stringify({
 major_name: userInfo.major,
 grade: userInfo.grade,
 directions: userInfo.directions,
 scores: scores,
 answers: userAnswers
 })
 })
 .then(function(response) {
 if (!response.ok) {
 console.error('Failed to save test record');
 return null;
 }
 return response.json();
 })
 .then(function(data) {
 if (data && data.id) {
 localStorage.setItem('lastRecordId', data.id);
 }
 })
 .catch(function(err) {
 console.error('Error saving test record:', err);
 });
}

function fetchAbilityBenchmarks(major, direction, grade) {
 return fetchFromBackend('/ability-benchmarks', {
 major_name: major,
 direction: direction,
 grade: grade
 });
}

function initSearchSelect(){
 var select = document.getElementById('major-select');
 var searchInput = document.getElementById('major-search');
 var dropdown = document.getElementById('major-dropdown');
 var hiddenInput = document.getElementById('major');

 fetchMajors().then(function(majors) {
    var localMajorList = majors && majors.length > 0 ? majors : majorList;

    function renderOptions(filter){
     var keyword = (filter || '').toLowerCase();
     dropdown.innerHTML = '';
     var filtered = localMajorList.filter(function(m){ return m.toLowerCase().indexOf(keyword) !== -1; });
     if(filtered.length === 0){
      dropdown.innerHTML = '<div class="search-select-no-result">无匹配专业</div>';
      return;
     }
     filtered.forEach(function(m){
      var div = document.createElement('div');
      div.className = 'search-select-option';
      if(m === hiddenInput.value) div.classList.add('selected');
      div.textContent = m;
      div.addEventListener('mousedown', function(e){
       e.preventDefault();
       hiddenInput.value = m;
       searchInput.value = m;
       document.getElementById('error-major').textContent = '';
       select.classList.remove('open');
        renderOptions(searchInput.value);
        var dirs = Array.from(document.querySelectorAll('input[name="direction"]:checked')).map(function(x){return x.value});
        initSkillSelect(m, dirs);
       });
      dropdown.appendChild(div);
     });
    }

    searchInput.addEventListener('input', function(){
     select.classList.add('open');
     renderOptions(this.value);
    });

    searchInput.addEventListener('focus', function(){
     select.classList.add('open');
     renderOptions('');
    });

    document.addEventListener('click', function(e){
     if(!select.contains(e.target)){
      select.classList.remove('open');
      if(hiddenInput.value){
       searchInput.value = hiddenInput.value;
      }else{
       searchInput.value = '';
       searchInput.placeholder = '请选择或搜索专业';
      }
     }
    });

    renderOptions('');
 });
}

function initSkillSelect(major, directions){
 var group = document.getElementById('skills-group');
 var pills = document.getElementById('skill-pills');
 var hint = document.getElementById('skills-hint');

 fetchMajorSkills(major).then(function() {
  var localMajorSkillMap = cachedData.majorSkillMap || {};
  var skillMap = localMajorSkillMap[major];
  if(!skillMap){
   group.style.display = 'none';
   pills.innerHTML = '';
   return;
  }
  var skillSet = {};
  var directionSkillMap = {};
  directions = directions || [];
  if(directions.length === 0){
   group.style.display = 'block';
   pills.innerHTML = '';
   hint.textContent = '请先选择意向方向，将展示对应所需技能';
   document.getElementById('error-skills').textContent = '';
   return;
  }
  directions.forEach(function(dir){
   var skills = skillMap[dir];
   if(skills){
    directionSkillMap[dir] = skills;
    skills.forEach(function(s){ skillSet[s] = true; });
   }
  });
  var allSkills = Object.keys(skillSet);
  if(allSkills.length === 0){
   group.style.display = 'none';
   pills.innerHTML = '';
   return;
  }
  group.style.display = 'block';
  var dirLabels = {job:'就业',graduate:'考研',public:'考公',undecided:'暂未确定'};
  var dirNames = directions.map(function(d){ return dirLabels[d] || d; });
  if(directions.length === 1 && directions[0] === 'undecided'){
   hint.textContent = '暂未确定方向，展示该专业基础通用技能：';
  }else{
   hint.textContent = '根据「'+dirNames.join('+')+'」方向，对应所需核心技能：';
  }
  pills.innerHTML = '';
  directions.forEach(function(dir){
   var skills = directionSkillMap[dir];
   if(!skills || skills.length === 0) return;
   var header = document.createElement('div');
   header.className = 'skill-group-header';
   header.textContent = dirLabels[dir] + '方向';
   pills.appendChild(header);
   skills.forEach(function(s){
    var label = document.createElement('label');
    label.className = 'skill-pill';
    label.innerHTML = '<input type="checkbox" name="skill" value="'+s+'"><span>'+s+'</span>';
    pills.appendChild(label);
   });
  });
  document.getElementById('error-skills').textContent = '';
  document.getElementById('skill-other').value = '';
 });
}

function onDirectionChange(){
 var major = document.getElementById('major').value.trim();
 var directions = Array.from(document.querySelectorAll('input[name="direction"]:checked')).map(function(x){return x.value});
 initSkillSelect(major, directions);
}

function submitInfo(e){
 e.preventDefault();
 var major=document.getElementById('major').value.trim();
 var grade=document.getElementById('grade').value;
 var directions=Array.from(document.querySelectorAll('input[name="direction"]:checked')).map(function(x){return x.value});
 var selectedSkills=Array.from(document.querySelectorAll('input[name="skill"]:checked')).map(function(x){return x.value});
 var otherSkills=document.getElementById('skill-other').value.trim();
 if(otherSkills){
  otherSkills.split(/[,，]/).forEach(function(s){ var t=s.trim(); if(t)selectedSkills.push(t); });
 }
 var skills=selectedSkills.join('、');
 var valid=true;
 document.getElementById('error-major').textContent='';
 document.getElementById('error-grade').textContent='';
 document.getElementById('error-skills').textContent='';
 document.getElementById('error-direction').textContent='';
 if(!major){document.getElementById('error-major').textContent='请选择专业';valid=false;}
 if(!grade){document.getElementById('error-grade').textContent='请选择年级';valid=false;}
 if(directions.length===0){document.getElementById('error-direction').textContent='请至少选择一个意向方向';valid=false;}
 var localMajorSkillMap = cachedData.majorSkillMap || {};
 if(!skills && localMajorSkillMap[major]){document.getElementById('error-skills').textContent='请至少选择一项已掌握技能';valid=false;}
 if(!valid)return;
 var existingUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
 var userInfo={
     username: existingUserInfo.username,
     userId: existingUserInfo.userId,
     token: existingUserInfo.token,
     major:major,grade:grade,skills:skills,directions:directions
 };
 localStorage.setItem('userInfo',JSON.stringify(userInfo));
 nav('test');
}

function initResultPage(){
 fetchDirectionWeights().then(function() {
  var savedQ=localStorage.getItem('testQuestions');
  if(savedQ){
   selectedQuestions=JSON.parse(savedQ);
  }else{
   selectedQuestions=questionBank.slice(0,20);
  }

  var scores=JSON.parse(localStorage.getItem('testScores')||'{"R":0,"I":0,"A":0,"S":0,"E":0,"C":0}');
  var userInfo=JSON.parse(localStorage.getItem('userInfo')||'{}');
  var directions=userInfo.directions||[];

  var localDirectionWeightConfig = cachedData.directionWeightConfig || fallbackData.directionWeightConfig;

  var dimensions=['R','I','A','S','E','C'];
  dimensions.forEach(function(d){
   var baseScore=scores[d]||0;
   var weight=1;
   directions.forEach(function(dir){
    weight*=localDirectionWeightConfig[dir]?.[d]||1;
   });
   var adjustedScore=Math.round(baseScore*weight*10)/10;
   document.getElementById('disp-'+d).textContent=adjustedScore;
  });

  drawRadarChart(scores,directions);
  generateRoutes(scores,userInfo).then(function() {
    generateAbilities(scores,userInfo);
  });
 });
}

function drawRadarChart(scores,directions){
 var canvas=document.getElementById('radar-canvas');
 var ctx=canvas.getContext('2d');
 var centerX=canvas.width/2;
 var centerY=canvas.height/2;
 var radius=Math.min(centerX,centerY)-40;
 var dimensions=['R','I','A','S','E','C'];
 // 动态最大分数：每维度题目数 × 5
 var dimCounts={R:0,I:0,A:0,S:0,E:0,C:0};
 selectedQuestions.forEach(function(q){dimCounts[q.dimension]=(dimCounts[q.dimension]||0)+1;});
 var maxScore=Math.max(...Object.values(dimCounts).map(function(c){return c*5;}));
 ctx.clearRect(0,0,canvas.width,canvas.height);

 // 绘制背景网格 - 圆形
 for(var i=1;i<=3;i++){
  var r=radius*(i/3);
  ctx.beginPath();
  ctx.arc(centerX,centerY,r,0,Math.PI*2);
  ctx.strokeStyle='#e4e7ed';
  ctx.lineWidth=1;
  ctx.stroke();
 }

 // 绘制轴线
 for(var j=0;j<6;j++){
  var angle=(Math.PI/2)+(j*2*Math.PI/6);
  ctx.beginPath();
  ctx.moveTo(centerX,centerY);
  ctx.lineTo(centerX+radius*Math.cos(angle),centerY-radius*Math.sin(angle));
  ctx.strokeStyle='#e4e7ed';
  ctx.lineWidth=1;
  ctx.stroke();
 }

 // 计算调整后的分数
 var adjustedScores={};
 var localDirWeightConfig = cachedData.directionWeightConfig || fallbackData.directionWeightConfig;
 dimensions.forEach(function(d){
  var baseScore=scores[d]||0;
  var weight=1;
  if(directions){
   directions.forEach(function(dir){
    weight*=localDirWeightConfig[dir]?.[d]||1;
   });
  }
  adjustedScores[d]=baseScore*weight;
 });

 // 绘制数据区域 - 渐变填充
 var gradient=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,radius);
 gradient.addColorStop(0,'rgba(74,144,226,0.4)');
 gradient.addColorStop(1,'rgba(74,144,226,0.1)');
 ctx.beginPath();
 for(var j=0;j<6;j++){
  var angle=(Math.PI/2)+(j*2*Math.PI/6);
  var value=(adjustedScores[dimensions[j]]||0)/maxScore;
  var x=centerX+value*radius*Math.cos(angle);
  var y=centerY-value*radius*Math.sin(angle);
  if(j===0)ctx.moveTo(x,y);
  else ctx.lineTo(x,y);
 }
 ctx.closePath();
 ctx.fillStyle=gradient;
 ctx.fill();
 ctx.strokeStyle='#4A90E2';
 ctx.lineWidth=2.5;
 ctx.stroke();

 // 数据点
 for(var j=0;j<6;j++){
  var angle=(Math.PI/2)+(j*2*Math.PI/6);
  var value=(adjustedScores[dimensions[j]]||0)/maxScore;
  var x=centerX+value*radius*Math.cos(angle);
  var y=centerY-value*radius*Math.sin(angle);
  ctx.beginPath();
  ctx.arc(x,y,4,0,Math.PI*2);
  ctx.fillStyle='#4A90E2';
  ctx.fill();
  ctx.strokeStyle='white';
  ctx.lineWidth=2;
  ctx.stroke();
 }

 // 标签
 ctx.fillStyle='#303133';
 ctx.font='bold 14px sans-serif';
 ctx.textAlign='center';
 for(var j=0;j<6;j++){
  var angle=(Math.PI/2)+(j*2*Math.PI/6);
  var labelRadius=radius+28;
  var x=centerX+labelRadius*Math.cos(angle);
  var y=centerY-labelRadius*Math.sin(angle);
  // 显示维度+分数
  var label=dimensions[j]+':'+Math.round(adjustedScores[dimensions[j]]||0);
  ctx.fillText(label,x,y+5);
 }
}



function fetchLearningPlans(direction, grade) {
  var url = API_BASE_URL + '/learning-plans';
  var params = [];
  if (direction) params.push('direction=' + encodeURIComponent(direction));
  if (grade) params.push('grade=' + encodeURIComponent(grade));
  if (params.length > 0) url += '?' + params.join('&');
  return fetch(url).then(function(response) {
    if (!response.ok) {
      console.error('Failed to fetch learning plans');
      return [];
    }
    return response.json();
  }).catch(function(err) {
    console.error('Error fetching learning plans:', err);
    return [];
  });
}

function getMajorSpecificPlan(major, planKey, routeTitle, grade) {
  return fetchLearningPlans(planKey, grade).then(function(plans) {
    if (plans.length > 0) {
      return plans[0];
    }
    return {
      currentStatus: '',
      abilities: [],
      phases: []
    };
  });
}

async function generateRoutes(scores,userInfo){
 // 保存用户信息用于规划展示
 currentUserInfoForPlan = userInfo;
 
 var directions=userInfo.directions||[];
 var major=userInfo.major||'';
 var grade=userInfo.grade||'freshman';
 var isUndecided=directions.length===0||directions.includes('undecided');
 
 var container=document.getElementById('routes-container');
 container.innerHTML='';
 
 // 从后端API获取该专业的发展路线数据
 var routeData = await fetchRoutesFromBackend(major);
 
 // 年级标签映射
 var gradeLabels={freshman:'大一',sophomore:'大二',junior:'大三',senior:'大四'};
 
 if(isUndecided){
 // 用户未确定方向：展示多条路线（就业+考研+考公+其它）
 var routeCategories=[
 {key:'job',name:'就业发展方向',icon:'💼',routes:routeData.job||[]},
 {key:'graduate',name:'考研深造方向',icon:'📚',routes:routeData.graduate||[]},
 {key:'public',name:'考公体制方向',icon:'🏛',routes:routeData.public||[]},
 {key:'other',name:'其它发展路线',icon:'🌟',routes:routeData.other||[]}
 ];
 
 routeCategories.forEach(function(category){
 if(category.routes.length===0) return;
 var categoryHtml='<div class="route-category"><div class="route-category-header"><span class="route-category-icon">'+category.icon+'</span><span class="route-category-name">'+category.name+'</span></div><div class="route-list">';
 category.routes.forEach(function(route,index){
 // 岗位介绍
 var detailHtml='<div class="route-detail"><span class="detail-label">📝 岗位介绍：</span>'+route.detail+'</div>';
 // 岗位要求
 var requirementHtml='';
 if(route.requirement){
 requirementHtml='<div class="route-requirement"><span class="requirement-label">🎯 岗位要求：</span>'+route.requirement+'</div>';
 }
  // 薪资（直接显示工作时间趋势）
 var salaryHtml='';
 if(route.salary){
 var salaryDisplay = route.salary;
 salaryHtml='<div class="route-salary"><span class="salary-label">💰 薪资趋势：</span>'+salaryDisplay+'</div>';
 if(route.promotion){
 salaryHtml += '<div class="route-promotion"><span class="promotion-label">📈 晋升路径：</span>'+route.promotion+'</div>';
 }
 }
categoryHtml+='<div class="route-card" onclick="showRoutePlan(\''+category.key+'\',\''+route.title.replace(/'/g, "\\'")+'\',\''+grade+'\')" style="cursor:pointer;"><div class="route-card-title">'+route.title+'</div>'+detailHtml+requirementHtml+salaryHtml+'</div>';
});
categoryHtml+='</div></div>';
container.innerHTML+=categoryHtml;
});

} else {
 // 用户已确定方向：只展示该方向的发展路线
 var directionLabels={job:'就业发展',graduate:'考研深造',public:'考公体制',undecided:'暂未确定'};
 directions.forEach(function(dir){
 if(dir==='undecided') return;
 var dirRoutes=routeData[dir]||[];
 if(dirRoutes.length===0) return;
 
 var dirLabel=directionLabels[dir]||dir;
 var categoryHtml='<div class="route-category"><div class="route-category-header"><span class="route-category-icon">'+(dir==='job'?'💼':dir==='graduate'?'📚':'🏛')+'</span><span class="route-category-name">'+dirLabel+'方向推荐路线</span></div><div class="route-list">';
 dirRoutes.forEach(function(route,index){
 // 岗位介绍
 var detailHtml='<div class="route-detail"><span class="detail-label">📝 岗位介绍：</span>'+route.detail+'</div>';
 // 岗位要求
 var requirementHtml='';
 if(route.requirement){
 requirementHtml='<div class="route-requirement"><span class="requirement-label">🎯 岗位要求：</span>'+route.requirement+'</div>';
 }
  // 薪资（直接显示工作时间趋势）
 var salaryHtml='';
 if(route.salary){
 var salaryDisplay = route.salary;
 salaryHtml='<div class="route-salary"><span class="salary-label">💰 薪资趋势：</span>'+salaryDisplay+'</div>';
 if(route.promotion){
 salaryHtml += '<div class="route-promotion"><span class="promotion-label">📈 晋升路径：</span>'+route.promotion+'</div>';
 }
 }
categoryHtml+='<div class="route-card" onclick="showRoutePlan(\''+dir+'\',\''+route.title.replace(/'/g, "\\'")+'\',\''+grade+'\')" style="cursor:pointer;"><div class="route-card-title">'+route.title+'</div>'+detailHtml+requirementHtml+salaryHtml+'</div>';
});
categoryHtml+='</div></div>';
container.innerHTML+=categoryHtml;
});
}
}

async function fetchRoutesFromBackend(major) {
 try {
 var response = await fetch(API_BASE_URL + '/majors/name/' + encodeURIComponent(major) + '/routes');
 if (response.ok) {
 var routes = await response.json();
 var routeData = { job: [], graduate: [], public: [], other: [] };
 var seenTitles = { job: new Set(), graduate: new Set(), public: new Set(), other: new Set() };
 routes.forEach(function(route) {
 if (routeData[route.direction] && !seenTitles[route.direction].has(route.title)) {
 seenTitles[route.direction].add(route.title);
 routeData[route.direction].push(route);
 }
 });
 return routeData;
 }
 } catch (error) {
 console.error('Failed to fetch routes from backend:', error);
 }
 return { job: [], graduate: [], public: [], other: [] };
}

// 显示路线详细规划弹窗
async function showRoutePlan(planKey, routeTitle, grade) {
 var gradeLabels={freshman:'大一',sophomore:'大二',junior:'大三',senior:'大四',fifth:'大五',graduate:'毕业一年内'};

 // 获取用户专业信息
 var major = currentUserInfoForPlan ? currentUserInfoForPlan.major : '';

 // 获取专业特定规划数据（优先使用专业特定计划，否则使用通用计划）
 var planData = await getMajorSpecificPlan(major, planKey, routeTitle, grade);

 // 定义年级顺序（支持五年制专业）
 var gradeOrder = ['freshman', 'sophomore', 'junior', 'senior', 'fifth', 'graduate'];

 // 五年制专业判断（医学、建筑学、城乡规划等）
 var isFiveYearMajor = ['临床医学', '口腔医学', '预防医学', '中医学', '建筑学', '城乡规划', '风景园林', '航海技术', '轮机工程'].some(function(m) {
 return currentUserInfoForPlan && currentUserInfoForPlan.major && currentUserInfoForPlan.major.includes(m);
 });

 // 如果是五年制专业，调整年级顺序
 if (isFiveYearMajor) {
 gradeOrder = ['freshman', 'sophomore', 'junior', 'senior', 'fifth', 'graduate'];
 } else {
 gradeOrder = ['freshman', 'sophomore', 'junior', 'senior', 'graduate'];
 }

 // 找到当前年级在顺序中的位置
 var currentIndex = gradeOrder.indexOf(grade);
 if (currentIndex === -1) {
 currentIndex = 0;
 }

 // 构建弹窗内容
 var modalHtml = '<div class="plan-modal-overlay" onclick="closePlanModal()">';
 modalHtml += '<div class="plan-modal-content">';
 modalHtml += '<div class="plan-modal-header">';
 modalHtml += '<h2 class="plan-modal-title">📋 ' + routeTitle + ' - 学习发展规划</h2>';
 modalHtml += '<button class="plan-modal-close" onclick="closePlanModal()">✕</button>';
 modalHtml += '</div>';

 // 添加提示信息
 modalHtml += '<div class="plan-tip-box" style="margin: 1rem; background: #e8f4f8; border-left: 4px solid #0077cc;">';
 modalHtml += '<span class="plan-tip-icon">📌</span>';
 modalHtml += '<span class="plan-tip-text">以下规划从您当前年级开始，系统展示后续各阶段的详细学习计划。请结合个人实际情况灵活调整。</span>';
 modalHtml += '</div>';

 // 学习规划路线 - 从当前年级开始，显示所有后续年级
 modalHtml += '<div class="plan-section" style="padding: 0 1rem 1rem 1rem;">';
 modalHtml += '<div class="plan-section-header"><span class="plan-section-icon">🎯</span>全程学习规划（' + gradeLabels[grade] + '开始）</div>';
 modalHtml += '<div class="plan-timeline">';

 var planCount = 0;

 var gradeData = planData;
 if (gradeData) {
 var isCurrentGrade = true;
 var currentTag = ' <span style="background:#0077cc;color:white;padding:2px 8px;border-radius:10px;font-size:0.75rem;margin-left:8px;">当前年级</span>';

 modalHtml += '<div class="plan-phase" style="border-left: 3px solid #0077cc; background: #f8fbff;">';
 modalHtml += '<div class="plan-phase-header">';
 modalHtml += '<span class="plan-phase-num" style="background:#0077cc;">' + (planCount + 1) + '</span>';
 modalHtml += '<span class="plan-phase-title">' + gradeLabels[grade] + currentTag + '</span>';
 modalHtml += '</div>';

 if (isCurrentGrade && gradeData.current_status) {
 modalHtml += '<div class="plan-status-box" style="margin: 0.75rem 0; padding: 0.5rem; background: #f0f7ff; border-radius: 8px;">';
 modalHtml += '<div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">📍 当前状态：</div>';
 modalHtml += '<div style="font-size: 0.9rem; color: #333;">' + gradeData.current_status + '</div>';
 modalHtml += '</div>';

 if (gradeData.abilities && gradeData.abilities.length > 0) {
 modalHtml += '<div style="margin: 0.75rem 0;">';
 modalHtml += '<div style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">💪 当前应掌握能力：</div>';
 modalHtml += '<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">';
 gradeData.abilities.forEach(function(ability) {
 modalHtml += '<span style="background: #e8f4f8; color: #0077cc; padding: 4px 10px; border-radius: 15px; font-size: 0.8rem;">' + ability + '</span>';
 });
 modalHtml += '</div></div>';
 }
 }

 modalHtml += '<div class="plan-tasks-list">';
 if (gradeData.phases && gradeData.phases.length > 0) {
 gradeData.phases.forEach(function(phase) {
 modalHtml += '<div class="plan-task-item">';
 modalHtml += '<span class="plan-task-checkbox">☐</span>';
 modalHtml += '<div>';
 modalHtml += '<div style="font-weight: 600; font-size: 0.85rem; color: #555; margin-bottom: 0.25rem;">📅 ' + phase.phase + '</div>';
 phase.tasks.forEach(function(task) {
 modalHtml += '<div style="display: flex; align-items: flex-start; margin: 0.25rem 0;">';
 modalHtml += '<span style="color: #999; margin-right: 0.5rem;">•</span>';
 modalHtml += '<span class="plan-task-text">' + task + '</span>';
 modalHtml += '</div>';
 });
 modalHtml += '</div></div>';
 });
 }
 modalHtml += '</div></div>';
 planCount++;
 }

 modalHtml += '</div></div>';

 // 提示信息
 modalHtml += '<div class="plan-tip-box">';
 modalHtml += '<span class="plan-tip-icon">💡</span>';
 modalHtml += '<span class="plan-tip-text">以上规划基于互联网大数据分析。建议定期复盘进度，及时调整学习重点。如有疑问，可咨询专业导师。</span>';
 modalHtml += '</div>';

 modalHtml += '</div></div>';

 // 添加到页面
 var modalContainer = document.getElementById('plan-modal-container');
 if (!modalContainer) {
 modalContainer = document.createElement('div');
 modalContainer.id = 'plan-modal-container';
 document.body.appendChild(modalContainer);
 }
 modalContainer.innerHTML = modalHtml;

 // 显示弹窗
 modalContainer.style.display = 'block';
}

// 关闭规划弹窗
function closePlanModal() {
 var modalContainer = document.getElementById('plan-modal-container');
 if (modalContainer) {
 modalContainer.style.display = 'none';
 }
}

// ========================================
// 能力差距分析功能（基于大数据）
// ========================================

// 大数据能力需求库（基于互联网公开数据：BOSS直聘、牛客网、CSDN等）
var requiredAbilitiesData = {
 // 技术类专业（计算机、软件、通信等）
 tech: {
 job: {
 freshman: [
 {ability:'编程语言基础',description:'目标岗位要求掌握至少一门编程语言（Python/Java/C++）',level:'high',suggestion:'选择一门语言深入学习，完成3-5个基础项目'},
 {ability:'数据结构与算法',description:'面试必考内容，需掌握基本数据结构（数组、链表、树、图）',level:'high',suggestion:'系统学习数据结构，完成LeetCode简单题100道'},
 {ability:'计算机网络基础',description:'了解TCP/IP协议栈、HTTP/HTTPS协议原理',level:'medium',suggestion:'学习《计算机网络》重点章节，刷相关面试题'},
 {ability:'数学基础',description:'高数、线代、概率论是技术进阶的基石',level:'medium',suggestion:'巩固数学基础，为后续学习算法和机器学习做准备'},
 {ability:'英语阅读能力',description:'能够阅读英文技术文档和论文',level:'medium',suggestion:'每天阅读一篇英文技术文章，积累专业词汇'}
 ],
 sophomore: [
 {ability:'全栈开发能力',description:'掌握前端+后端基本开发技能，能独立完成小项目',level:'high',suggestion:'学习React/Vue前端框架+Node.js后端，完成完整项目'},
 {ability:'数据库技能',description:'熟练使用MySQL/Redis/MongoDB等主流数据库',level:'high',suggestion:'完成数据库设计课程，学习Redis缓存和MongoDB应用'},
 {ability:'Git版本控制',description:'熟练使用Git进行团队协作开发',level:'medium',suggestion:'参与开源项目，学习Gitflow工作流'},
 {ability:'算法与数据结构进阶',description:'能够解决中等难度算法问题，满足校招要求',level:'high',suggestion:'系统刷题，完成《剑指Offer》所有题目'},
 {ability:'Linux操作基础',description:'熟悉Linux命令行，能够在服务器环境开发',level:'medium',suggestion:'搭建个人Linux学习环境，熟悉常用命令'}
 ],
 junior: [
 {ability:'系统设计能力',description:'能够设计高并发、高可用系统架构',level:'high',suggestion:'学习分布式系统设计，阅读《Designing Data-Intensive Applications》'},
 {ability:'微服务架构',description:'掌握微服务设计理念和Spring Cloud等框架',level:'high',suggestion:'完成微服务项目，学习Docker和Kubernetes'},
 {ability:'性能优化经验',description:'具备数据库优化、代码优化、缓存优化能力',level:'medium',suggestion:'学习性能分析工具，完成项目性能优化实战'},
 {ability:'框架源码阅读',description:'能够阅读和理解主流框架源码',level:'medium',suggestion:'深入学习Spring、MyBatis等框架源码'},
 {ability:'面试综合能力',description:'算法、项目、架构设计的综合面试表现',level:'high',suggestion:'参加模拟面试，整理项目亮点，准备STAR法则回答'}
 ],
 senior: [
 {ability:'offer选择能力',description:'能够评估不同offer的技术成长、薪资、发展前景',level:'high',suggestion:'了解行业薪资水平，准备谈薪技巧'},
 {ability:'职场快速适应',description:'完成学生到职场人的转变',level:'medium',suggestion:'学习职场沟通技巧，了解行业规范'},
 {ability:'持续学习能力',description:'保持技术敏感度，跟上技术迭代',level:'medium',suggestion:'关注技术博客，建立个人知识体系'}
 ]
 },
 graduate: {
 freshman: [
 {ability:'高等数学基础',description:'考研数学占比最大，需扎实掌握',level:'high',suggestion:'认真学习高数、线代、概率论，做课后习题'},
 {ability:'英语能力',description:'考研英语需达到50-60分以上',level:'high',suggestion:'坚持背单词，做真题阅读，提升英语水平'},
 {ability:'专业基础',description:'为目标专业考研打下基础',level:'medium',suggestion:'了解目标专业考试科目，开始基础学习'},
 {ability:'学术研究兴趣',description:'培养对科研的兴趣和热情',level:'medium',suggestion:'参加学术讲座，阅读科研论文'},
 {ability:'GPA保持',description:'考研复试需要良好的本科成绩',level:'medium',suggestion:'认真对待每门课程，保持85+均分'}
 ],
 sophomore: [
 {ability:'考研科目深化',description:'确定目标院校后针对性复习',level:'high',suggestion:'收集目标院校真题和参考书目，制定复习计划'},
 {ability:'科研经历',description:'复试需要科研经历增加竞争力',level:'high',suggestion:'联系导师参与科研项目，发表论文或专利'},
 {ability:'英语强化',description:'为考研英语和未来研究生英语打基础',level:'high',suggestion:'系统学习考研英语，做历年真题'},
 {ability:'专业课精通',description:'目标专业核心课程需达到精通程度',level:'medium',suggestion:'使用目标院校指定教材，深入学习'},
 {ability:'数学建模能力',description:'理工科考研加分项',level:'medium',suggestion:'参加数学建模竞赛，提升问题解决能力'}
 ],
 junior: [
 {ability:'考研系统复习',description:'数学、英语、政治、专业课全面复习',level:'high',suggestion:'制定详细复习计划，分阶段突破'},
 {ability:'真题训练',description:'考研真题是复习的核心资料',level:'high',suggestion:'完成近10年真题，分析出题规律'},
 {ability:'模拟考试',description:'定期模拟检验复习效果',level:'medium',suggestion:'每月参加模拟考试，调整复习策略'},
 {ability:'复试准备',description:'提前准备复试科目和面试',level:'medium',suggestion:'了解复试流程，准备专业课和英语面试'},
 {ability:'信息收集',description:'及时获取考研动态和院校信息',level:'medium',suggestion:'关注考研论坛和目标院校官网'}
 ],
 senior: [
 {ability:'初试冲刺',description:'最后阶段的全面冲刺',level:'high',suggestion:'查漏补缺，保持良好心态'},
 {ability:'复试准备',description:'初试通过后的复试准备',level:'high',suggestion:'联系导师，准备专业课和面试'},
 {ability:'毕业论文',description:'本科毕业必须完成的任务',level:'medium',suggestion:'合理安排时间，确保顺利毕业'}
 ]
 },
 public: {
 freshman: [
 {ability:'政治素养基础',description:'考公需要良好的政治素养',level:'high',suggestion:'关注时政新闻，学习政治理论'},
 {ability:'申论基础',description:'申论是考公必考科目',level:'high',suggestion:'开始练习写作，关注社会热点'},
 {ability:'行测入门',description:'了解行测考试内容和题型',level:'medium',suggestion:'购买教材，了解五大模块'},
 {ability:'学生干部经历',description:'学生干部经历对考公有帮助',level:'medium',suggestion:'参加学生会或社团担任职务'},
 {ability:'入党准备',description:'党员身份在考公中有优势',level:'medium',suggestion:'递交入党申请书，争取早日入党'}
 ],
 sophomore: [
 {ability:'行测系统学习',description:'行测五大模块全面学习',level:'high',suggestion:'分模块系统学习，做专项练习'},
 {ability:'申论写作提升',description:'申论需要长期积累和练习',level:'high',suggestion:'每周写一篇申论，积累素材'},
 {ability:'时政积累',description:'行测和申论都需要时政知识',level:'medium',suggestion:'每天阅读人民日报、新闻联播'},
 {ability:'党员身份',description:'争取成为党员增加竞争力',level:'medium',suggestion:'完成入党流程'},
 {ability:'社会实践',description:'基层工作经历对考公有帮助',level:'medium',suggestion:'参加社会实践和志愿服务'}
 ],
 junior: [
 {ability:'行测强化训练',description:'提升做题速度和准确率',level:'high',suggestion:'每天一套行测题，计时训练'},
 {ability:'申论专项突破',description:'申论大作文需要专门训练',level:'high',suggestion:'背诵范文，练习写作框架'},
 {ability:'真题实战',description:'历年真题是最佳练习材料',level:'high',suggestion:'完成近5年真题，分析错题'},
 {ability:'选调生准备',description:'关注选调生考试信息',level:'medium',suggestion:'了解各省选调生政策和要求'},
 {ability:'面试准备',description:'提前了解结构化面试',level:'medium',suggestion:'观看面试视频，练习答题'}
 ],
 senior: [
 {ability:'国考冲刺',description:'国考是最大型考试机会',level:'high',suggestion:'全力冲刺国考，不要错过报名'},
 {ability:'省考备考',description:'省考是主要上岸途径',level:'high',suggestion:'国考后立即投入省考复习'},
 {ability:'面试技巧',description:'面试表现决定最终录取',level:'high',suggestion:'参加面试培训班，模拟练习'}
 ]
 }
 },
 // 商科类专业（金融、会计、管理等）
 business: {
 job: {
 freshman: [
 {ability:'财务基础',description:'初级会计职称是入门证书',level:'high',suggestion:'开始备考初级会计证'},
 {ability:'Excel技能',description:'办公软件是职场必备技能',level:'high',suggestion:'系统学习Excel函数和数据透视表'},
 {ability:'商业敏感度',description:'对商业现象有自己的思考',level:'medium',suggestion:'阅读商业案例，关注财经新闻'},
 {ability:'英语能力',description:'外资企业和国际业务需要英语',level:'medium',suggestion:'提升英语水平，考取四六级'},
 {ability:'表达能力',description:'清晰表达观点的能力',level:'medium',suggestion:'参加演讲比赛或社团活动'}
 ],
 sophomore: [
 {ability:'专业证书',description:'ACCA、CFA等证书增加竞争力',level:'high',suggestion:'开始备考ACCA或 CFA一级'},
 {ability:'实习经历',description:'相关实习是求职重要加分项',level:'high',suggestion:'寻找四大、券商、咨询公司实习'},
 {ability:'行业研究',description:'能够撰写行业分析报告',level:'medium',suggestion:'学习行业研究方法论'},
 {ability:'数据分析',description:'Python、SQL等数据分析工具',level:'high',suggestion:'学习Python数据分析'},
 {ability:'Networking',description:'建立行业人脉关系',level:'medium',suggestion:'参加行业讲座和校友活动'}
 ],
 junior: [
 {ability:'CPA/CFA备考',description:'注册会计师是财务最高证书',level:'high',suggestion:'开始备考CPA专业阶段'},
 {ability:'商业案例分析',description:'case interview必备技能',level:'high',suggestion:'练习casebook，准备咨询类面试'},
 {ability:'管理咨询基础',description:'了解咨询行业工作方法',level:'medium',suggestion:'学习PPT制作和商业演示'},
 {ability:'投行知识',description:'投行是商科学生热门去向',level:'medium',suggestion:'了解投行业务和估值方法'}
 ],
 senior: [
 {ability:'秋招准备',description:'四大的秋招是主要招聘渠道',level:'high',suggestion:'准备OT和面试'},
 {ability:'职场技能',description:'职场沟通、项目管理等软技能',level:'medium',suggestion:'学习职场沟通技巧'}
 ]
 },
 graduate: {
 freshman: [
 {ability:'学术写作基础',description:'商科论文需要规范写作',level:'high',suggestion:'学习学术论文写作规范'},
 {ability:'数学基础',description:'计量经济学需要数学基础',level:'high',suggestion:'复习高数、线代、概率论'},
 {ability:'英语能力',description:'英文文献阅读和写作',level:'high',suggestion:'提升英语水平'},
 {ability:'专业基础',description:'宏微观经济学等基础课程',level:'medium',suggestion:'认真学习专业课'}
 ],
 sophomore: [
 {ability:'科研方法',description:'掌握实证研究方法',level:'high',suggestion:'学习Stata、R等统计软件'},
 {ability:'论文发表',description:'核心期刊论文是毕业要求',level:'high',suggestion:'开始撰写小论文'},
 {ability:'导师合作',description:'与导师保持良好合作关系',level:'medium',suggestion:'积极参与导师课题'}
 ],
 junior: [
 {ability:'毕业论文',description:'大论文是毕业关键',level:'high',suggestion:'开始毕业论文写作'},
 {ability:'职业规划',description:'明确毕业后去向（读博/就业）',level:'medium',suggestion:'提前规划'}]
 ,
 senior: [{ability:'秋招/申博',description:'最终去向的准备',level:'high',suggestion:'根据规划准备'}]
 },
 public: {
 freshman: [
 {ability:'政治素养',description:'考公核心能力',level:'high',suggestion:'关注时政，学习政治理论'},
 {ability:'申论基础',description:'申论写作能力',level:'high',suggestion:'开始练习申论写作'},
 {ability:'学生干部',description:'增加报考优势',level:'medium',suggestion:'担任学生干部'}
 ],
 sophomore: [
 {ability:'行测系统学习',description:'五大模块全面复习',level:'high',suggestion:'分模块系统学习'},
 {ability:'党员身份',description:'党员是很多岗位要求',level:'high',suggestion:'争取入党'}
 ],
 junior: [
 {ability:'真题训练',description:'历年真题练习',level:'high',suggestion:'刷近5年真题'},
 {ability:'面试准备',description:'结构化面试技巧',level:'high',suggestion:'模拟练习'}
 ],
 senior: [{ability:'国考省考',description:'全力冲刺上岸',level:'high',suggestion:'把握每次考试机会'}]
 }
 },
 // 设计类专业（建筑、规划、视觉传达等）
 design: {
 job: {
 freshman: [
 {ability:'手绘基础',description:'设计手绘表达是基础技能',level:'high',suggestion:'参加手绘培训班，打好基础'},
 {ability:'软件技能',description:'PS、AI、CAD等设计软件',level:'high',suggestion:'系统学习设计软件'},
 {ability:'美学基础',description:'色彩、构图、比例等美学素养',level:'medium',suggestion:'参观美术馆，提高审美'},
 {ability:'速写能力',description:'快速表达设计想法',level:'medium',suggestion:'坚持每日速写练习'}
 ],
 sophomore: [
 {ability:'作品集基础',description:'开始积累设计作品',level:'high',suggestion:'整理优秀作业，准备作品集'},
 {ability:'专业软件进阶',description:'Rhino、SketchUp、3DMax等',level:'high',suggestion:'学习建模和渲染'},
 {ability:'竞赛参与',description:'设计竞赛是提升和展示能力',level:'medium',suggestion:'参加专业设计竞赛'},
 {ability:'实习经历',description:'设计公司实习经验',level:'medium',suggestion:'寻找设计公司实习'}
 ],
 junior: [
 {ability:'作品集完善',description:'高质量作品集是求职核心',level:'high',suggestion:'打磨作品集，突出个人风格'},
 {ability:'专业深化',description:'确定设计方向深入学习',level:'medium',suggestion:'选择建筑/室内/景观等方向'},
 {ability:'行业实践',description:'实际项目经验',level:'medium',suggestion:'参与实际项目'}
 ],
 senior: [
 {ability:'求职面试',description:'设计公司面试准备',level:'high',suggestion:'准备作品集和面试'},
 {ability:'职业规划',description:'明确职业发展方向',level:'medium',suggestion:'了解行业前景'}
 ]
 },
 graduate: {
 freshman: [
 {ability:'理论基础',description:'设计理论深化',level:'high',suggestion:'阅读设计理论书籍'},
 {ability:'研究方法',description:'设计研究方法',level:'high',suggestion:'学习设计研究方法论'},
 {ability:'手绘进阶',description:'快题设计能力',level:'medium',suggestion:'练习快题设计'}
 ],
 sophomore: [
 {ability:'论文写作',description:'设计论文撰写',level:'high',suggestion:'开始撰写小论文'},
 {ability:'作品创作',description:'毕业设计准备',level:'medium',suggestion:'确定研究方向'}
 ],
 junior: [
 {ability:'毕业论文/设计',description:'研究生毕业核心',level:'high',suggestion:'全力完成毕业设计'},
 {ability:'职业准备',description:'设计院或继续读博',level:'medium',suggestion:'根据规划准备'}
 ],
 senior: [{ability:'毕业答辩',description:'顺利毕业',level:'high',suggestion:'准备答辩'}]
 },
 public: {
 freshman: [
 {ability:'政治素养',description:'考公基础',level:'high',suggestion:'关注时政'},
 {ability:'设计基础',description:'设计院也需要专业能力',level:'medium',suggestion:'保持专业学习'}
 ],
 sophomore: [
 {ability:'行测申论',description:'考公科目学习',level:'high',suggestion:'系统学习'},
 {ability:'党员身份',description:'增加竞争力',level:'medium',suggestion:'争取入党'}
 ],
 junior: [
 {ability:'真题训练',description:'历年真题练习',level:'high',suggestion:'刷题训练'},
 {ability:'专业考试',description:'设计院专业考试',level:'medium',suggestion:'准备专业考试'}
 ],
 senior: [{ability:'国考省考',description:'考公上岸',level:'high',suggestion:'全力备考'}]
 }
 },
 // 法学类专业
 law: {
 job: {
 freshman: [
 {ability:'法律基础',description:'法理学、宪法等基础法',level:'high',suggestion:'扎实学习基础法律课程'},
 {ability:'法律思维',description:'培养法律逻辑思维',level:'high',suggestion:'阅读法律案例'},
 {ability:'文书写作',description:'法律文书写作基础',level:'medium',suggestion:'练习法律文书写作'}
 ],
 sophomore: [
 {ability:'司考/法考备考',description:'法律职业资格证是入行门槛',level:'high',suggestion:'开始备考法考'},
 {ability:'专业实习',description:'律所或法院实习',level:'high',suggestion:'寻找法律实习'},
 {ability:'法学研究',description:'学术研究能力培养',level:'medium',suggestion:'参加法学研讨会'}
 ],
 junior: [
 {ability:'法考冲刺',description:'通过法考是首要目标',level:'high',suggestion:'全力备考法考'},
 {ability:'实务能力',description:'案例分析、法律检索等',level:'medium',suggestion:'提升实务技能'}
 ],
 senior: [
 {ability:'律所求职',description:'律所是主要去向',level:'high',suggestion:'准备求职'},
 {ability:'职业资格',description:'取得律师执业证',level:'high',suggestion:'完成实习拿执照'}
 ]
 },
 graduate: {
 freshman: [
 {ability:'法学深化',description:'专业方向深入学习',level:'high',suggestion:'确定研究方向'},
 {ability:'学术研究',description:'法学研究方法',level:'high',suggestion:'学习研究方法'},
 {ability:'论文写作',description:'法学论文规范',level:'high',suggestion:'开始写论文'}
 ],
 sophomore: [
 {ability:'论文发表',description:'核心期刊论文',level:'high',suggestion:'发表论文'},
 {ability:'学术交流',description:'参加学术会议',level:'medium',suggestion:'积极交流'}
 ],
 junior: [
 {ability:'毕业论文',description:'研究生毕业论文',level:'high',suggestion:'全力写作'},
 {ability:'就业准备',description:'律所或继续读博',level:'medium',suggestion:'规划未来'}
 ],
 senior: [{ability:'毕业就业',description:'顺利毕业就业',level:'high',suggestion:'根据规划准备'}]
 },
 public: {
 freshman: [
 {ability:'政治素养',description:'考公基础',level:'high',suggestion:'学习政治理论'},
 {ability:'法律应用',description:'法律在公务中的应用',level:'medium',suggestion:'关注法律应用'},
 {ability:'行测申论',description:'考公基础',level:'high',suggestion:'开始学习'}
 ],
 sophomore: [
 {ability:'法考备考',description:'法律资格证',level:'high',suggestion:'备考法考'},
 {ability:'党员身份',description:'增加竞争力',level:'medium',suggestion:'争取入党'}
 ],
 junior: [
 {ability:'真题训练',description:'行测申论练习',level:'high',suggestion:'系统刷题'},
 {ability:'面试准备',description:'结构化面试',level:'high',suggestion:'模拟练习'}
 ],
 senior: [{ability:'国考省考',description:'考公上岸',level:'high',suggestion:'全力备考'}]
 }
 },
 // 医学类专业
 medical: {
 job: {
 freshman: [
 {ability:'医学基础',description:'解剖、生理、生化等基础医学',level:'high',suggestion:'扎实学习基础医学课程'},
 {ability:'英语能力',description:'医学英语和文献阅读',level:'high',suggestion:'学习医学英语'},
 {ability:'科研兴趣',description:'培养医学研究兴趣',level:'medium',suggestion:'了解医学前沿'}
 ],
 sophomore: [
 {ability:'临床基础',description:'诊断学、内外妇儿等',level:'high',suggestion:'认真学习临床课程'},
 {ability:'执业医师基础',description:'为执业医师考试打基础',level:'high',suggestion:'了解考试内容'},
 {ability:'科研经历',description:'科研经历对晋升重要',level:'medium',suggestion:'加入实验室'}
 ],
 junior: [
 {ability:'临床实习',description:'医院各科室轮转',level:'high',suggestion:'认真实习'},
 {ability:'执业医师备考',description:'通过执业医师考试',level:'high',suggestion:'备考执医'},
 {ability:'专业方向',description:'确定细分专业方向',level:'medium',suggestion:'了解各科室'}
 ],
 senior: [
 {ability:'住院医师规范化培训',description:'规培是成为医生的必经之路',level:'high',suggestion:'做好规培准备'},
 {ability:'执业医师考试',description:'通过考试获得执业资格',level:'high',suggestion:'全力备考'}
 ]
 },
 graduate: {
 freshman: [
 {ability:'科研能力',description:'医学研究方法',level:'high',suggestion:'学习科研方法'},
 {ability:'英语能力',description:'医学文献阅读和写作',level:'high',suggestion:'提升英语'},
 {ability:'专业深化',description:'细分专业深入学习',level:'medium',suggestion:'确定研究方向'}
 ],
 sophomore: [
 {ability:'论文发表',description:'医学论文发表',level:'high',suggestion:'发表SCI论文'},
 {ability:'临床技能',description:'临床实践能力',level:'medium',suggestion:'提升临床技能'}
 ],
 junior: [
 {ability:'毕业论文',description:'医学研究生论文',level:'high',suggestion:'完成大论文'},
 {ability:'职业规划',description:'继续读博或就业',level:'medium',suggestion:'提前规划'}
 ],
 senior: [{ability:'毕业就业',description:'医院或继续深造',level:'high',suggestion:'根据规划准备'}]
 },
 public: {
 freshman: [
 {ability:'政治素养',description:'卫健委等需要政治素养',level:'high',suggestion:'学习政治理论'},
 {ability:'医学基础',description:'医学基础知识',level:'high',suggestion:'保持专业学习'},
 {ability:'行测申论',description:'考公基础',level:'medium',suggestion:'开始学习'}
 ],
 sophomore: [
 {ability:'医学专业考试',description:'卫生系统招聘考试',level:'high',suggestion:'了解考试内容'},
 {ability:'党员身份',description:'增加竞争力',level:'medium',suggestion:'争取入党'}
 ],
 junior: [
 {ability:'招聘考试准备',description:'医疗卫生系统招聘',level:'high',suggestion:'备考招聘考试'},
 {ability:'面试准备',description:'医疗系统面试',level:'medium',suggestion:'准备面试'}
 ],
 senior: [{ability:'医疗卫生系统',description:'医院或卫健委等',level:'high',suggestion:'全力备考'}]
 }
 },
 // 其他专业（通用）
 default: {
 job: {
 freshman: [
 {ability:'专业基础',description:'学好专业基础课程',level:'high',suggestion:'认真对待每门课程'},
 {ability:'通用技能',description:'Office软件、英语等',level:'medium',suggestion:'提升通用技能'},
 {ability:'职业探索',description:'了解行业和职业',level:'medium',suggestion:'参加职业讲座'}
 ],
 sophomore: [
 {ability:'专业技能',description:'深入学习专业技能',level:'high',suggestion:'掌握专业核心技能'},
 {ability:'实习经历',description:'相关实习经验',level:'high',suggestion:'寻找实习'},
 {ability:'证书技能',description:'行业相关证书',level:'medium',suggestion:'考取相关证书'}
 ],
 junior: [
 {ability:'求职准备',description:'秋招/春招准备',level:'high',suggestion:'准备求职材料'},
 {ability:'专业深化',description:'专业方向深入',level:'medium',suggestion:'确定发展方向'}
 ],
 senior: [
 {ability:'offer选择',description:'评估和选择offer',level:'high',suggestion:'理性选择'},
 {ability:'职场适应',description:'从学生到职场人',level:'medium',suggestion:'做好心理准备'}
 ]
 },
 graduate: {
 freshman: [
 {ability:'学术基础',description:'学术研究基础',level:'high',suggestion:'培养研究兴趣'},
 {ability:'英语能力',description:'英语读写能力',level:'high',suggestion:'提升英语'},
 {ability:'专业基础',description:'专业基础课程',level:'medium',suggestion:'学好专业课'}
 ],
 sophomore: [
 {ability:'研究方向',description:'确定研究方向',level:'high',suggestion:'明确研究方向'},
 {ability:'论文发表',description:'学术论文发表',level:'high',suggestion:'开始写论文'}
 ],
 junior: [
 {ability:'毕业论文',description:'研究生毕业论文',level:'high',suggestion:'完成毕业设计'},
 {ability:'职业规划',description:'读博或就业',level:'medium',suggestion:'提前规划'}
 ],
 senior: [{ability:'毕业就业',description:'顺利毕业就业',level:'high',suggestion:'根据规划准备'}]
 },
 public: {
 freshman: [
 {ability:'政治素养',description:'考公基础',level:'high',suggestion:'关注时政'},
 {ability:'行测申论基础',description:'考公基础科目',level:'high',suggestion:'开始学习'},
 {ability:'学生干部',description:'增加报考优势',level:'medium',suggestion:'担任职务'}
 ],
 sophomore: [
 {ability:'行测系统学习',description:'五大模块学习',level:'high',suggestion:'系统学习'},
 {ability:'党员身份',description:'增加竞争力',level:'medium',suggestion:'争取入党'}
 ],
 junior: [
 {ability:'真题训练',description:'历年真题练习',level:'high',suggestion:'刷题训练'},
 {ability:'面试准备',description:'面试技巧',level:'high',suggestion:'模拟练习'}
 ],
 senior: [{ability:'国考省考',description:'考公上岸',level:'high',suggestion:'全力备考'}]
 }
}
};

// 获取该年级该方向需要的能力
function getRequiredAbilities(majorCategory, directions, grade) {
 var categoryData = requiredAbilitiesData[majorCategory] || requiredAbilitiesData['default'];
 var isUndecided = directions.length === 0 || directions.includes('undecided');
 var abilities = [];
 
 if (isUndecided) {
 // 未确定方向：综合所有方向的能力需求
 ['job', 'graduate', 'public'].forEach(function(dir) {
 if (categoryData[dir] && categoryData[dir][grade]) {
 abilities = abilities.concat(categoryData[dir][grade]);
 }
 });
 // 去重
 var seen = {};
 abilities = abilities.filter(function(item) {
 if (seen[item.ability]) return false;
 seen[item.ability] = true;
 return true;
 });
 } else {
 // 确定方向：只获取该方向的能力需求
 directions.forEach(function(dir) {
 if (categoryData[dir] && categoryData[dir][grade]) {
 abilities = abilities.concat(categoryData[dir][grade]);
 }
 });
 // 如果该方向该年级没有数据，使用默认值
 if (abilities.length === 0 && categoryData['job'] && categoryData['job'][grade]) {
 abilities = categoryData['job'][grade];
 }
 }
 
 // 按level排序（high优先）
 abilities.sort(function(a, b) {
 var order = {high: 0, medium: 1, low: 2};
 return order[a.level] - order[b.level];
 });
 
 return abilities.slice(0, 8); // 最多返回8项
}

// 评估用户当前能力（基于测评结果、专业和年级）
function evaluateUserAbilities(scores, directions, major, grade) {
 var abilities = {
 technical: 0, // 技术能力
 research: 0, // 研究能力
 communication: 0, // 沟通能力
 management: 0, // 管理能力
 creativity: 0, // 创意能力
 detail: 0 // 细致能力
 };
 
 // 获取专业类别
 var localMajorCategoryMap = cachedData.majorCategoryMap || fallbackData.majorCategoryMap;
 var majorCategory = localMajorCategoryMap[major] || 'tech';
 
 // 根据专业类别评估基础能力
 var baseAbilityMap = {
 'tech': {technical: 1, detail: 1},
 'business': {management: 1, communication: 1},
 'law': {detail: 1, research: 1},
 'medical': {detail: 1, research: 1},
 'design': {creativity: 1, technical: 1},
 'arts': {creativity: 1, communication: 1},
 'science': {research: 1, technical: 1},
 'social': {communication: 1, management: 1},
 'education': {communication: 1, detail: 1},
 'lang': {communication: 1, detail: 1},
 'media': {communication: 1, creativity: 1}
 };
 
 var baseAbilities = baseAbilityMap[majorCategory] || {};
 for (var key in baseAbilities) {
 abilities[key] += baseAbilities[key];
 }
 
 // 根据年级评估阶段性能力
 var gradeAbilityMap = {
 'freshman': {detail: 1}, // 大一：基础扎实
 'sophomore': {technical: 1, communication: 1}, // 大二：技能+沟通
 'junior': {technical: 2, research: 1}, // 大三：专业+研究
 'senior': {technical: 2, management: 1, communication: 1} // 大四：综合能力
 };
 var gradeAbilities = gradeAbilityMap[grade] || gradeAbilityMap['freshman'];
 for (var key in gradeAbilities) {
 abilities[key] += gradeAbilities[key];
 }
 
 // 根据霍兰德测评结果评估能力优势
 if (scores['R'] > 15) abilities.technical += 2;
 if (scores['I'] > 15) abilities.research += 2;
 if (scores['S'] > 15) abilities.communication += 2;
 if (scores['E'] > 15) abilities.management += 2;
 if (scores['A'] > 15) abilities.creativity += 2;
 if (scores['C'] > 15) abilities.detail += 2;
 
 // 能力得分归一化（最高不超过5分）
 for (var key in abilities) {
 abilities[key] = Math.min(abilities[key], 5);
 }
 
 return abilities;
}

// 分析能力差距
function analyzeAbilityGaps(requiredAbilities, userAbilities) {
 var gaps = [];
 
 // 定义能力关键词对应的能力维度
 var abilityKeywords = {
 '编程':'technical', '算法':'technical', '代码':'technical', '数据库':'technical', 
 '系统':'technical', '框架':'technical', 'Linux':'technical', '软件':'technical',
 '学术':'research', '研究':'research', '论文':'research', '科研':'research', 
 '数学':'research', '理论':'research', '学术写作':'research',
 '实习':'communication', '沟通':'communication', '人际':'communication', 
 '团队':'communication', '表达':'communication', 'Networking':'communication',
 '管理':'management', '组织':'management', '规划':'management', 
 '领导':'management', '协调':'management', '商业':'management',
 '创意':'creativity', '设计':'creativity', '审美':'creativity', 
 '创新':'creativity', '美学':'creativity', '手绘':'creativity',
 '证书':'detail', '考试':'detail', '基础':'detail', '素养':'detail', 
 '法律':'detail', '政治':'detail', '文书':'detail', '速写':'detail', 'Excel':'detail'
 };
 
 requiredAbilities.forEach(function(req) {
 // 匹配能力维度
 var matchedDim = 'technical';
 for (var keyword in abilityKeywords) {
 if (req.ability.indexOf(keyword) !== -1 || req.description.indexOf(keyword) !== -1) {
 matchedDim = abilityKeywords[keyword];
 break;
 }
 }
 
 var userLevel = userAbilities[matchedDim] || 0;
 var gapLevel = req.level;
 
 // 调整差距级别
 if (req.level === 'high' && userLevel < 2) {
 gapLevel = 'high';
 } else if (req.level === 'medium' && userLevel < 1) {
 gapLevel = 'medium';
 } else {
 gapLevel = 'low';
 }
 
 // 计算差距分（用于排序）
 var gapScore = 0;
 if (gapLevel === 'high') gapScore = 100;
 else if (gapLevel === 'medium') gapScore = 50;
 else gapScore = 10;
 
 gaps.push({
 ability: req.ability,
 description: req.description,
 level: gapLevel,
 suggestion: req.suggestion,
 gapScore: gapScore,
 matchedDim: matchedDim
 });
 });
 
 // 按差距级别排序
 gaps.sort(function(a, b) {
 return b.gapScore - a.gapScore;
 });
 
 // 限制数量
 return gaps.slice(0, 6);
}

function generateAbilities(scores, userInfo){
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

 var major = userInfo.major || '';
 var grade = userInfo.grade || 'freshman';
 var directions = userInfo.directions || [];
 var isUndecided = directions.length === 0 || directions.includes('undecided');

 var directionLabels = { job: '💼 就业方向', graduate: '📚 考研方向', public: '🏛 考公方向' };

 if (major && grade) {
 var targetDirections = isUndecided ? ['job', 'graduate', 'public'] : directions.filter(function(d) { return d !== 'undecided'; });

 var fetchPromises = targetDirections.map(function(dir) {
 return fetchAbilityBenchmarks(major, dir, grade).then(function(benchmarks) {
 return { direction: dir, benchmarks: benchmarks || [] };
 }).catch(function() {
 return { direction: dir, benchmarks: [] };
 });
 });

 Promise.all(fetchPromises).then(function(results) {
 var hasValidData = results.some(function(r) { return r.benchmarks.length > 0; });

 if (hasValidData) {
 var totalScore = Object.values(scores).reduce(function(a, b) { return a + b; }, 0);
 var gradeFactors = { freshman: 0.7, sophomore: 0.8, junior: 0.9, senior: 1.0, fifth: 1.0, graduate: 1.0 };
 var gradeFactor = gradeFactors[grade] || 0.8;
 var userAbilityScore = (totalScore / 60) * 100;

 var gradeAdvice = '';
 switch(grade) {
 case 'freshman':
 gradeAdvice = '【大一重点】打好基础，培养兴趣，多尝试不同方向';
 break;
 case 'sophomore':
 gradeAdvice = '【大二重点】深入学习，确定方向，增加实践经验';
 break;
 case 'junior':
 gradeAdvice = '【大三重点】冲刺目标，积累项目，准备就业/考研';
 break;
 case 'senior':
 gradeAdvice = '【大四重点】全力冲刺，将知识转化为核心竞争力';
 break;
 default:
 gradeAdvice = '持续学习，提升竞争力';
 }

 results.forEach(function(result) {
 if (result.benchmarks.length === 0) return;

 var dirLabel = directionLabels[result.direction] || result.direction;

 var sectionHtml = '<div class="ability-direction-section">';
 sectionHtml += '<div class="ability-direction-header">' + dirLabel + '能力要求</div>';
 sectionHtml += '<div class="ability-items-wrapper">';

 var sortedBenchmarks = result.benchmarks.sort(function(a, b) {
 var priorityWeight = { high: 0, medium: 1, low: 2 };
 return priorityWeight[a.priority] - priorityWeight[b.priority];
 });

 sortedBenchmarks.forEach(function(benchmark, index) {
 var adjustedBenchmarkLevel = benchmark.avg_level * gradeFactor;
 var gapScore = adjustedBenchmarkLevel - userAbilityScore;
 gapScore = Math.max(0, Math.min(100, gapScore + (50 - userAbilityScore) * 0.3));

 var statusClass, statusLabel, statusIcon;

 if (gapScore > 30) {
 statusClass = 'gap-high';
 statusLabel = '急需提升';
 statusIcon = '🔴';
 } else if (gapScore > 15) {
 statusClass = 'gap-medium';
 statusLabel = '需要加强';
 statusIcon = '🟡';
 } else {
 statusClass = 'gap-low';
 statusLabel = '建议学习';
 statusIcon = '📚';
 }

 var resources = benchmark.learning_resources || [];
 var resourceText = resources.length > 0 ? resources.join('、') : '暂无推荐资源';

 sectionHtml += '<div class="ability-item ' + statusClass + '">' +
 '<span class="ability-num">' + (index + 1) + '</span>' +
 '<div class="ability-content">' +
 '<div class="ability-header">' +
 '<h4>' + benchmark.ability_name + '</h4>' +
 '<span class="ability-status ' + statusClass + '">' + statusIcon + ' ' + statusLabel + '</span>' +
 '</div>' +
 '<p class="gap-detail">期望水平: ' + adjustedBenchmarkLevel.toFixed(0) + ' | 当前水平: ' + userAbilityScore.toFixed(0) + ' | 差距: ' + gapScore.toFixed(0) + '</p>' +
 '<p class="gap-detail">' + benchmark.description + '</p>' +
 '<div class="gap-suggestion">' +
 '<span class="suggestion-label">📖 学习资源：' + resourceText + '</span>' +
 '</div>' +
 '<div class="grade-advice">' +
 '<span class="advice-label">💡 ' + gradeAdvice + '</span>' +
 '</div>' +
 '</div></div>';
 });

 sectionHtml += '</div></div>';
 abilitiesList.innerHTML += sectionHtml;
 });
 } else {
 renderDefaultAbilities(top3, abilitiesMap, abilitiesList);
 }
 }).catch(function() {
 renderDefaultAbilities(top3, abilitiesMap, abilitiesList);
 });
 } else {
 renderDefaultAbilities(top3, abilitiesMap, abilitiesList);
 }
}

function renderDefaultAbilities(top3, abilitiesMap, abilitiesList) {
 top3.forEach(function(d,index){
 var items=abilitiesMap[d]||[];
 items.slice(0,1).forEach(function(item){
 abilitiesList.innerHTML+='<div class="ability-item"><span class="ability-num">'+(abilitiesList.children.length+1)+'</span><div class="ability-content"><h4>'+item.split('：')[0]+'</h4><p>'+item.split('：')[1]+'</p></div></div>';
 });
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
    initSearchSelect();
    
    var userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        try {
            var user = JSON.parse(userInfo);
            if (user.token) {
                currentUser = user;
                showWelcomeUser(user.username);
                nav('home');
                return;
            }
        } catch (e) {}
    }
    nav('login');
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
 var priorityClass = index === 0 ? 'priority-high' : (index <= 2 ? 'priority-medium' : 'priority-low');
 var priorityLabel = index === 0 ? '高优先' : (index <= 2 ? '中优先' : '低优先');
 tasksList.innerHTML+='<div class="task-item '+priorityClass+(isCompleted?' completed':'')+'"><input type="checkbox" class="task-checkbox"'+(isCompleted?' checked':'')+' onclick="toggleTask(\''+escape(task)+'\', this)"><div class="task-content"><span class="task-priority '+priorityClass+'">'+priorityLabel+'</span><p class="task-text">'+task+'</p></div></div>';
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
    var routes = calculateRoutes(scores, userInfo);
    routes.forEach(function(route, index) {
        report += `${index + 1}. **${route.name}**\n`;
        report += `   - ${route.description}\n`;
        if (route.salary) {
            report += `   - 预期收益：${route.salary}\n`;
        }
        report += '\n';
    });
    
    report += `---\n\n`;
    report += `## 🛠 能力提升建议\n\n`;
    var abilities = getAbilities(scores);
    abilities.forEach(function(ability, index) {
        report += `${index + 1}. ${ability}\n`;
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

function calculateRoutes(scores, userInfo) {
    var directions = userInfo.directions || [];
    var major = userInfo.major || '';
    var isUndecided = directions.length === 0 || directions.includes('undecided');
    
    var routeData = { job: [], graduate: [], public: [], other: [] };
    var results = [];
    
    if (isUndecided) {
        ['job', 'graduate', 'public', 'other'].forEach(function(key) {
            var routes = routeData[key] || [];
            routes.forEach(function(route) {
                results.push({
                    name: route.title,
                    description: route.detail,
                    salary: route.salary || '',
                    category: key
                });
            });
        });
    } else {
        directions.forEach(function(dir) {
            if (dir === 'undecided') return;
            var routes = routeData[dir] || [];
            routes.forEach(function(route) {
                results.push({
                    name: route.title,
                    description: route.detail,
                    salary: route.salary || '',
                    category: dir
                });
            });
        });
    }
    
    return results;
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

// ========================================
// 海报导出功能
// ========================================
function exportPoster() {
    try {
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
        ctx.fillText('个人信息', 70, 520);
        
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#606266';
        ctx.fillText('专业：' + (userInfo.major || '未填写'), 70, 555);
        ctx.fillText('年级：' + (getGradeLabel(userInfo.grade) || '未选择'), 70, 585);
        ctx.fillText('技能：' + (userInfo.skills || '未填写'), 70, 615);
        
        // 得分展示
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#303133';
        ctx.fillText('兴趣维度得分', 70, 660);
        
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
        
        // 确保保持在结果页面
        nav('result');
    } catch (error) {
        console.error('海报生成失败:', error);
        alert('海报生成失败，请重试！');
        // 确保保持在结果页面
        nav('result');
    }
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

// ========================================
// AI智能体功能
// ========================================

// AI智能体问答数据库
var AIKnowledgeBase = {
    career: [
        {
            intent: '询问就业准备',
            verbs: ['准备', '开始', '规划', '做', '找', '准备', '冲刺'],
            nouns: ['就业', '工作', '大厂', '公司', '秋招', '春招', 'offer'],
            patterns: ['如何准备', '怎么找', '如何规划', '怎样开始', '如何冲刺'],
            responses: [
                '为就业做准备需要系统性规划！建议：\n\n【大一】打牢基础\n• 重点学习算法和数据结构\n• 掌握至少一门编程语言\n• 参加编程竞赛入门\n\n【大二】技能提升\n• 深入学习主流技术栈\n• 完成3-5个完整项目\n• 参加实习积累经验\n\n【大三】冲刺阶段\n• 争取大厂实习机会\n• 准备秋招面试\n• 积累实战项目经验\n\n【大四】收获季节\n• 秋招全力冲刺\n• 准备毕业论文\n• 顺利拿到心仪offer'
            ]
        },
        {
            intent: '询问考研规划',
            verbs: ['准备', '考研', '复习', '备考', '选择', '报考'],
            nouns: ['考研', '研究生', '保研', '推免', '学术', '院校', '专业'],
            patterns: ['如何考研', '怎么准备考研', '考研规划', '如何选择院校'],
            responses: [
                '考研是长期战，需要科学规划：\n\n【大三上】确定目标\n• 分析自身实力定位目标院校\n• 了解初试科目和参考书目\n• 制定复习计划\n\n【大三下】基础攻坚\n• 系统复习专业课\n• 数学强化训练\n• 英语真题练习\n\n【暑假】黄金期\n• 全力备考提升\n• 参加目标院校夏令营\n• 查漏补缺\n\n【大四】冲刺阶段\n• 9月预报名\n• 12月初试\n• 3-4月复试'
            ]
        },
        {
            intent: '询问考公准备',
            verbs: ['考', '准备', '备考', '报考', '复习'],
            nouns: ['公务员', '国考', '省考', '编制', '行测', '申论'],
            patterns: ['如何考公', '公务员备考', '考公规划', '怎么准备公务员'],
            responses: [
                '考公需要提前积累，建议：\n\n【大一】了解阶段\n• 了解考公政策和岗位要求\n• 关注时事政治\n• 提高政治素养\n\n【大二】积累阶段\n• 关注公务员考试信息\n• 开始积累申论素材\n• 提高文字表达能力\n\n【大三】备考黄金期\n• 系统学习行测和申论\n• 参加模拟考试\n• 了解国考省考区别\n\n【大四】冲刺阶段\n• 全力备考\n• 关注报名信息\n• 积极参加考试'
            ]
        },
        {
            intent: '询问留学规划',
            verbs: ['申请', '准备', '考', '留学', '出国'],
            nouns: ['留学', '出国', '雅思', '托福', 'GRE', 'GPA', '申请'],
            patterns: ['如何留学', '留学规划', '怎么申请', '准备出国'],
            responses: [
                '出国留学需要提前规划：\n\n【大一-大二】打基础\n• 保持高GPA（建议3.5+）\n• 备考雅思/托福\n• 参加课外活动积累背景\n\n【大三】准备申请\n• 准备GRE/GMAT\n• 找导师写推荐信\n• 准备个人陈述\n• 参加科研项目\n\n【大四】申请阶段\n• 提交申请材料\n• 等待offer\n• 申请签证\n• 准备出国'
            ]
        },
        {
            intent: '询问创业建议',
            verbs: ['创业', '开', '创办', '做', '尝试'],
            nouns: ['创业', '公司', '项目', '团队', '投资', '计划书'],
            patterns: ['如何创业', '大学生创业', '创业建议', '怎么开公司'],
            responses: [
                '大学生创业需要充分准备：\n\n【大一】培养意识\n• 参加创业讲座\n• 了解创业政策\n• 培养创新思维\n\n【大二】积累能力\n• 学习商业知识\n• 参加创业比赛\n• 寻找志同道合伙伴\n\n【大三】实践探索\n• 尝试小项目\n• 参加孵化器\n• 寻找投资机会\n\n【大四】起步阶段\n• 完成商业计划书\n• 注册公司\n• 正式运营'
            ]
        },
        {
            intent: '询问职业选择',
            verbs: ['选择', '适合', '推荐', '选', '从事'],
            nouns: ['职业', '工作', '岗位', '方向', '行业'],
            patterns: ['我适合什么', '推荐什么工作', '选择什么职业', '从事什么工作'],
            responses: [
                '选择职业需要综合考虑多方面因素：\n\n【自我评估】\n• 了解自己的兴趣和优势\n• 明确职业价值观\n• 评估自身能力水平\n\n【市场调研】\n• 了解目标行业发展前景\n• 分析岗位需求\n• 研究薪资待遇\n\n【决策建议】\n• 结合测评结果选择方向\n• 尝试实习体验\n• 咨询行业前辈\n\n您可以告诉我更多关于您的情况，我来帮您分析！'
            ]
        },
        {
            intent: '询问简历准备',
            verbs: ['写', '准备', '优化', '制作'],
            nouns: ['简历', 'CV', '作品集', '项目经验'],
            patterns: ['如何写简历', '简历怎么准备', '优化简历', '制作简历'],
            responses: [
                '一份好简历是求职成功的第一步：\n\n【结构清晰】\n• 个人信息简洁明了\n• 教育背景按时间倒序\n• 项目经验突出成果\n\n【内容优化】\n• 使用量化成果描述\n• 突出核心技能\n• 匹配岗位需求关键词\n\n【注意事项】\n• 控制在一页内\n• 格式简洁统一\n• 避免拼写错误\n\n建议准备多个版本，针对不同岗位进行调整！'
            ]
        },
        {
            intent: '询问面试技巧',
            verbs: ['面试', '准备', '回答', '应对'],
            nouns: ['面试', '问题', '技巧', '准备', '自我介绍'],
            patterns: ['面试技巧', '如何面试', '面试准备', '面试常见问题'],
            responses: [
                '面试成功需要充分准备：\n\n【面试前】\n• 研究公司和岗位\n• 准备自我介绍（30秒-1分钟）\n• 练习常见问题\n• 准备反问问题\n\n【面试中】\n• 保持自信态度\n• 使用STAR法则回答\n• 注意肢体语言\n• 控制语速\n\n【面试后】\n• 发送感谢信\n• 总结经验教训\n• 保持跟进'
            ]
        }
    ],
    
    assessment: [
        {
            intent: '解读测评结果',
            verbs: ['解读', '分析', '看', '理解', '了解'],
            nouns: ['测评', '结果', '分数', '报告', '霍兰德'],
            patterns: ['测评结果是什么', '怎么看测评', '分析测评', '解读报告'],
            responses: [
                '根据您的霍兰德测评结果，我来帮您解读：\n\n【R现实型】动手能力强\n• 喜欢使用工具和设备\n• 擅长解决具体问题\n• 适合技术实践类工作\n\n【I研究型】分析能力强\n• 喜欢思考和研究\n• 擅长逻辑分析\n• 适合科研和技术开发\n\n【A艺术型】创意能力强\n• 喜欢创新和表达\n• 擅长艺术创作\n• 适合设计和创意工作\n\n【S社会型】人际能力强\n• 喜欢帮助他人\n• 擅长沟通协调\n• 适合服务和教育类工作\n\n【E企业型】领导能力强\n• 喜欢组织管理\n• 擅长说服影响\n• 适合管理和销售类工作\n\n【C常规型】执行能力强\n• 喜欢按规则办事\n• 擅长数据处理\n• 适合行政和财务类工作'
            ]
        },
        {
            intent: '询问适合职业',
            verbs: ['适合', '推荐', '匹配', '选', '从事'],
            nouns: ['职业', '工作', '岗位', '方向', '行业'],
            patterns: ['我适合什么职业', '推荐职业', '职业匹配', '适合的工作'],
            responses: [
                '根据您的测评结果，结合霍兰德理论：\n\n【高R+I型】技术专家方向\n• 软件开发工程师\n• 数据分析师\n• 人工智能工程师\n• 系统架构师\n\n【高S+E型】管理方向\n• 项目经理\n• 产品经理\n• 运营主管\n• 人力资源\n\n【高A+S型】创意服务方向\n• 教师/培训师\n• 心理咨询师\n• 品牌策划\n• UI/UX设计师\n\n【高C+I型】分析方向\n• 金融分析师\n• 市场研究员\n• 咨询顾问\n• 数据科学家\n\n建议您结合专业背景和兴趣爱好综合考虑！'
            ]
        },
        {
            intent: '询问性格特点',
            verbs: ['了解', '分析', '知道', '认识'],
            nouns: ['性格', '特点', '优势', '特长', '缺点', '不足'],
            patterns: ['我的性格', '性格分析', '我的优势', '我的特点'],
            responses: [
                '从您的测评结果来看：\n\n【优势方面】\n• 逻辑思维能力较强\n• 善于分析和解决问题\n• 有明确的目标导向\n• 执行力较强\n\n【发展建议】\n• 可以多参与团队项目\n• 提升沟通表达能力\n• 培养领导力\n• 加强创新思维\n\n【职业匹配】\n• 技术类岗位\n• 研究类岗位\n• 管理类岗位\n\n每个人都是独一无二的，关键是发挥优势、持续成长！'
            ]
        },
        {
            intent: '询问霍兰德理论',
            verbs: ['了解', '是什么', '解释', '说明'],
            nouns: ['霍兰德', '理论', '职业兴趣', '测试'],
            patterns: ['霍兰德是什么', '什么是霍兰德', '霍兰德理论', '职业兴趣测试'],
            responses: [
                '霍兰德职业兴趣理论由美国心理学家约翰·霍兰德提出：\n\n【理论核心】\n每个人的职业兴趣可以分为六种类型：\n\n• R现实型：喜欢动手操作，务实\n• I研究型：喜欢思考研究，理性\n• A艺术型：喜欢创意表达，感性\n• S社会型：喜欢与人交往，助人\n• E企业型：喜欢领导影响，进取\n• C常规型：喜欢规则秩序，细致\n\n【应用价值】\n• 帮助了解自身职业倾向\n• 指导职业选择\n• 规划职业发展路径\n\n您的测评结果就是基于这个理论得出的！'
            ]
        }
    ],
    
    learning: [
        {
            intent: '询问大一规划',
            verbs: ['规划', '学习', '准备', '做', '开始'],
            nouns: ['大一', '新生', '基础', '入门', '课程'],
            patterns: ['大一怎么过', '新生规划', '大一学习', '刚入学'],
            responses: [
                '作为大一新生，打好基础是关键：\n\n【学业方面】\n• 打牢数学和英语基础\n• 掌握编程语言基础\n• 养成良好学习习惯\n\n【技能方面】\n• 学习Office办公软件\n• 了解专业前沿技术\n• 参加技术社团\n\n【实践方面】\n• 参加校园活动\n• 寻找实习机会\n• 积累项目经验\n\n【规划方面】\n• 了解专业就业方向\n• 考取相关证书\n• 为未来做准备'
            ]
        },
        {
            intent: '询问大二规划',
            verbs: ['学习', '提升', '准备', '规划', '做'],
            nouns: ['大二', '课程', '技术', '项目', '技能'],
            patterns: ['大二怎么学', '大二规划', '大二提升', '大二准备'],
            responses: [
                '大二是能力提升的关键时期：\n\n【专业学习】\n• 深入学习核心课程\n• 掌握主流技术栈\n• 参加学科竞赛\n\n【项目经验】\n• 完成3-5个完整项目\n• 学会使用GitHub\n• 建立个人技术博客\n\n【实习准备】\n• 准备简历和作品集\n• 关注实习信息\n• 尝试暑期实习\n\n【未来规划】\n• 明确就业/考研方向\n• 了解目标行业\n• 准备相关证书'
            ]
        },
        {
            intent: '询问大三规划',
            verbs: ['准备', '冲刺', '规划', '备考', '实习'],
            nouns: ['大三', '关键', '秋招', '考研', '实习'],
            patterns: ['大三规划', '大三准备', '秋招准备', '考研备考'],
            responses: [
                '大三是决定未来方向的关键一年：\n\n【就业方向】\n• 全力准备秋招/春招\n• 算法题练习\n• 项目经验整理\n• 模拟面试\n\n【考研方向】\n• 确定目标院校\n• 系统复习备考\n• 参加夏令营\n\n【实习方面】\n• 争取名企实习\n• 积累实战经验\n• 争取转正机会\n\n【时间管理】\n• 合理分配时间\n• 制定详细计划\n• 保持良好心态'
            ]
        },
        {
            intent: '询问大四规划',
            verbs: ['完成', '准备', '冲刺', '毕业', '找工作'],
            nouns: ['大四', '毕业', '论文', 'offer', '答辩'],
            patterns: ['大四规划', '毕业准备', '论文写作', '找工作'],
            responses: [
                '大四是收获的一年：\n\n【秋招春招】\n• 全力冲刺offer\n• 多参加宣讲会\n• 准备面试\n\n【毕业论文】\n• 尽早开始准备\n• 与导师保持沟通\n• 保证论文质量\n\n【毕业设计】\n• 完成项目开发\n• 准备答辩\n• 整理项目文档\n\n【未来衔接】\n• 学习入职前技能\n• 了解企业文化\n• 做好角色转换'
            ]
        },
        {
            intent: '询问能力提升',
            verbs: ['提升', '提高', '学习', '掌握', '增强'],
            nouns: ['能力', '技能', '技术', '知识', '水平'],
            patterns: ['如何提升', '怎么学习', '提高能力', '掌握技能'],
            responses: [
                '提升自己需要系统规划：\n\n【技术能力】\n• 刷算法题（LeetCode）\n• 做项目实践\n• 阅读源码\n• 参与开源\n\n【软技能】\n• 提升沟通能力\n• 培养团队协作\n• 锻炼领导力\n\n【学习方法】\n• 制定学习计划\n• 番茄工作法\n• 定期复盘总结\n\n【资源推荐】\n• B站技术视频\n• GitHub开源项目\n• 技术博客文章\n• 在线课程'
            ]
        },
        {
            intent: '询问竞赛建议',
            verbs: ['参加', '准备', '参加', '比赛'],
            nouns: ['竞赛', '比赛', 'ACM', '蓝桥杯', '奖项'],
            patterns: ['参加竞赛', '竞赛准备', '比赛建议', 'ACM比赛'],
            responses: [
                '参加竞赛对提升能力很有帮助：\n\n【编程竞赛】\n• ACM国际大学生程序设计竞赛\n• 蓝桥杯全国软件大赛\n• Codeforces在线比赛\n\n【创新创业】\n• 中国互联网+大学生创新创业大赛\n• 挑战杯创业计划竞赛\n• 数学建模竞赛\n\n【专业技能】\n• 数学竞赛\n• 英语竞赛\n• 专业技能大赛\n\n【备赛建议】\n• 提前准备\n• 组建团队\n• 多做练习\n• 总结经验'
            ]
        },
        {
            intent: '询问证书考取',
            verbs: ['考', '考取', '拿', '准备'],
            nouns: ['证书', '考试', '认证', '资格证'],
            patterns: ['考什么证书', '证书推荐', '考取证书', '证书准备'],
            responses: [
                '选择证书要结合职业规划：\n\n【技术类】\n• 计算机二级\n• 软件设计师\n• AWS/Azure云认证\n• Google数据分析师\n\n【语言类】\n• 英语四六级\n• 雅思/托福\n• 普通话等级\n\n【专业类】\n• 教师资格证\n• 会计从业资格\n• 人力资源管理师\n• 法律职业资格\n\n建议根据目标岗位需求选择！'
            ]
        },
        {
            intent: '询问时间管理',
            verbs: ['管理', '安排', '规划', '利用'],
            nouns: ['时间', '计划', '效率', '学习'],
            patterns: ['时间管理', '怎么安排时间', '提高效率', '规划时间'],
            responses: [
                '高效的时间管理是成功的关键：\n\n【制定计划】\n• 每日/每周计划\n• 优先级排序（四象限法）\n• 设置目标和里程碑\n\n【提高效率】\n• 番茄工作法\n• 避免拖延\n• 减少干扰\n\n【工具推荐】\n• Todo清单类APP\n• 时间追踪工具\n• 日历管理\n\n【注意事项】\n• 合理休息\n• 定期复盘\n• 灵活调整'
            ]
        }
    ],
    
    general: [
        {
            intent: '打招呼',
            verbs: ['你好', '嗨', '哈喽', '您好', '在吗'],
            nouns: [],
            patterns: ['你好', '嗨', '哈喽', '您好', '在吗'],
            responses: [
                '你好！我是职途智能顾问，很高兴为您服务！',
                '您好！请问有什么我可以帮助您的？',
                '嗨！欢迎咨询职业规划相关问题~',
                '你好！我随时为您解答职业发展相关的问题！'
            ]
        },
        {
            intent: '感谢',
            verbs: ['谢谢', '感谢', '谢谢啦', '辛苦了'],
            nouns: [],
            patterns: ['谢谢', '感谢', '谢谢啦', '辛苦了'],
            responses: [
                '不客气！很高兴能帮到您！',
                '不用谢！有问题随时再来找我~',
                '能为您服务是我的荣幸！',
                '不客气，祝您职业发展顺利！'
            ]
        },
        {
            intent: '询问能力',
            verbs: ['能', '可以', '做什么', '帮助'],
            nouns: ['你', '功能', '能力', '帮助'],
            patterns: ['你能做什么', '你有什么功能', '能帮助我吗', '你会什么'],
            responses: [
                '我可以帮您：\n\n• 📊 解读霍兰德测评结果\n• 🎯 分析职业兴趣和发展方向\n• 📝 制定个性化学习规划\n• 💡 解答职业发展相关问题\n• 📚 提供考试备考建议\n\n请问您想了解哪方面？'
            ]
        },
        {
            intent: '询问系统',
            verbs: ['是什么', '谁', '介绍', '了解'],
            nouns: ['你', '系统', '智能顾问', '助手'],
            patterns: ['你是什么', '介绍一下你', '你是谁', '了解你'],
            responses: [
                '我是职途智能顾问，基于霍兰德职业兴趣理论开发的AI助手。我可以根据您的专业、年级和测评结果，为您提供个性化的职业规划建议！'
            ]
        }
    ]
};

// 打开AI助手
function openAIAssistant() {
    var modal = document.getElementById('ai-assistant-modal');
    if (modal) {
        modal.style.display = 'block';
        // 滚动到底部
        setTimeout(function() {
            var messages = document.getElementById('ai-messages');
            if (messages) {
                messages.scrollTop = messages.scrollHeight;
            }
        }, 100);
    }
}

// 关闭AI助手
function closeAIAssistant() {
    var modal = document.getElementById('ai-assistant-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 处理回车发送
function handleAIInput(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

// 发送快捷问题
async function sendQuickQuestion(question) {
    addUserMessage(question);
    setTimeout(async function() {
        var response = await getAIResponse(question);
        addAIMessage(response);
    }, 500);
}

// 添加用户消息
function addUserMessage(message) {
    var messagesContainer = document.getElementById('ai-messages');
    if (!messagesContainer) return;
    
    var userMsg = document.createElement('div');
    userMsg.className = 'ai-message ai-message-user';
    userMsg.innerHTML = 
        '<div class="ai-message-content">' +
        '<p>' + escapeHtml(message) + '</p>' +
        '</div>' +
        '<div class="ai-message-time">' + getCurrentTime() + '</div>';
    
    messagesContainer.appendChild(userMsg);
    scrollToBottom();
}

// 添加AI消息
function addAIMessage(message) {
    var messagesContainer = document.getElementById('ai-messages');
    if (!messagesContainer) return;
    
    var aiMsg = document.createElement('div');
    aiMsg.className = 'ai-message ai-message-ai';
    aiMsg.innerHTML = 
        '<div class="ai-message-content">' +
        formatMessage(message) +
        '</div>' +
        '<div class="ai-message-time">' + getCurrentTime() + '</div>';
    
    messagesContainer.appendChild(aiMsg);
    scrollToBottom();
}

var DeepSeekConfig = {
    apiKey: localStorage.getItem('deepseek_api_key') || '',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
};

function saveDeepSeekApiKey(apiKey) {
    DeepSeekConfig.apiKey = apiKey;
    localStorage.setItem('deepseek_api_key', apiKey);
}

function toggleAPISettings() {
    var settingsPanel = document.getElementById('ai-api-settings');
    var apiKeyInput = document.getElementById('deepseek-api-key');
    if (settingsPanel) {
        if (settingsPanel.style.display === 'none') {
            settingsPanel.style.display = 'block';
            if (apiKeyInput) {
                apiKeyInput.value = DeepSeekConfig.apiKey;
            }
        } else {
            settingsPanel.style.display = 'none';
        }
    }
}

function saveAPISettings() {
    var apiKeyInput = document.getElementById('deepseek-api-key');
    if (apiKeyInput) {
        var apiKey = apiKeyInput.value.trim();
        saveDeepSeekApiKey(apiKey);
        var statusDiv = document.createElement('div');
        statusDiv.className = 'api-status';
        statusDiv.textContent = apiKey ? '✅ API配置已保存' : '❌ 请输入API Key';
        var settingsContent = document.querySelector('.api-settings-content');
        if (settingsContent) {
            settingsContent.appendChild(statusDiv);
            setTimeout(function() {
                statusDiv.remove();
            }, 3000);
        }
    }
}

function clearAPISettings() {
    saveDeepSeekApiKey('');
    var apiKeyInput = document.getElementById('deepseek-api-key');
    if (apiKeyInput) {
        apiKeyInput.value = '';
    }
    var statusDiv = document.createElement('div');
    statusDiv.className = 'api-status api-status-error';
    statusDiv.textContent = '✅ API Key已清除，将使用本地知识库';
    var settingsContent = document.querySelector('.api-settings-content');
    if (settingsContent) {
        settingsContent.appendChild(statusDiv);
        setTimeout(function() {
            statusDiv.remove();
        }, 3000);
    }
}

async function getAIResponse(userMessage) {
    var userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    var scores = JSON.parse(localStorage.getItem('testScores') || '{"R":0,"I":0,"A":0,"S":0,"E":0,"C":0}');
    
    // 如果配置了API Key，优先调用DeepSeek API获取智能回答
    if (DeepSeekConfig.apiKey && DeepSeekConfig.apiKey.trim()) {
        var apiResponse = await callDeepSeekAPI(userMessage, userInfo, scores);
        if (apiResponse) {
            return apiResponse;
        }
        // 如果API调用失败，继续使用本地知识库
    }
    
    // 本地知识库匹配（作为备用方案）
    var allQuestions = [];
    for (var category in AIKnowledgeBase) {
        allQuestions = allQuestions.concat(AIKnowledgeBase[category]);
    }
    
    var bestMatch = null;
    var bestScore = 0;
    
    for (var i = 0; i < allQuestions.length; i++) {
        var question = allQuestions[i];
        var score = calculateSemanticScore(userMessage, question);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = question;
        }
    }
    
    if (bestMatch && bestScore >= 25) {
        var response = bestMatch.responses[Math.floor(Math.random() * bestMatch.responses.length)];
        return personalizeResponse(response, userInfo, scores);
    } else {
        return getDefaultResponse(userMessage, userInfo);
    }
}

async function callDeepSeekAPI(userMessage, userInfo, scores) {
    try {
        var response = await fetch('https://career-assistant-api.vercel.app/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                user_info: userInfo,
                scores: scores
            })
        });

        if (!response.ok) {
            console.error('Backend API error:', response.status, response.statusText);
            return null;
        }

        var data = await response.json();
        if (data.response) {
            return data.response;
        }
        return null;
    } catch (error) {
        console.error('Backend API call failed:', error);
        return null;
    }
}

function calculateSemanticScore(message, question) {
    var score = 0;
    var msg = message.toLowerCase();
    
    // 模式匹配（最高优先级）
    if (question.patterns) {
        for (var i = 0; i < question.patterns.length; i++) {
            if (msg.indexOf(question.patterns[i].toLowerCase()) !== -1) {
                score += 50;
                return score;
            }
        }
    }
    
    // 动词匹配（高优先级）
    var verbMatch = 0;
    if (question.verbs) {
        for (var i = 0; i < question.verbs.length; i++) {
            if (msg.indexOf(question.verbs[i].toLowerCase()) !== -1) {
                verbMatch++;
            }
        }
        score += verbMatch * 15;
    }
    
    // 名词匹配（中优先级）
    var nounMatch = 0;
    if (question.nouns) {
        for (var i = 0; i < question.nouns.length; i++) {
            if (msg.indexOf(question.nouns[i].toLowerCase()) !== -1) {
                nounMatch++;
            }
        }
        score += nounMatch * 10;
    }
    
    // 动词+名词组合匹配（额外加分）
    if (verbMatch > 0 && nounMatch > 0) {
        score += verbMatch * nounMatch * 5;
    }
    
    // 问句模式检测（额外加分）
    var questionWords = ['什么', '怎么', '如何', '为什么', '哪里', '谁', '吗', '呢'];
    for (var i = 0; i < questionWords.length; i++) {
        if (msg.indexOf(questionWords[i]) !== -1) {
            score += 5;
            break;
        }
    }
    
    return score;
}

function personalizeResponse(response, userInfo, scores) {
    var major = userInfo.major || '计算机科学与技术';
    var grade = userInfo.grade || 'freshman';
    
    var gradeLabels = {
        freshman: '大一',
        sophomore: '大二',
        junior: '大三',
        senior: '大四'
    };
    
    response = response.replace(/【大一】/g, '【' + gradeLabels[grade] + '】');
    
    var majorInfo = getMajorInfo(major);
    
    response = response.replace('计算机专业', major);
    response = response.replace('计算机科学与技术', major);
    
    response = response.replace(/算法和数据结构/g, majorInfo.coreSkills[0] || '专业基础知识');
    response = response.replace(/编程语言/g, majorInfo.coreSkills[1] || '专业技能');
    response = response.replace(/主流技术栈/g, majorInfo.techStack || '行业主流技术');
    
    response = response.replace(/软件开发工程师/g, majorInfo.jobs[0] || '相关岗位');
    response = response.replace(/数据分析师/g, majorInfo.jobs[1] || '相关岗位');
    response = response.replace(/人工智能工程师/g, majorInfo.jobs[2] || '相关岗位');
    
    response = response.replace(/LeetCode/g, majorInfo.learningResources[0] || '专业练习平台');
    response = response.replace(/GitHub/g, majorInfo.learningResources[1] || '专业资源平台');
    
    response = response.replace(/计算机二级/g, majorInfo.certificates[0] || '专业相关证书');
    response = response.replace(/软件设计师/g, majorInfo.certificates[1] || '职业资格证');
    
    response = response.replace(/ACM国际大学生程序设计竞赛/g, majorInfo.competitions[0] || '专业竞赛');
    response = response.replace(/蓝桥杯全国软件大赛/g, majorInfo.competitions[1] || '学科竞赛');
    
    return response;
}

function getMajorInfo(major) {
    var majorDatabase = {
        '计算机科学与技术': {
            coreSkills: ['算法和数据结构', '编程语言'],
            techStack: 'Java/Python/前端/后端',
            jobs: ['软件开发工程师', '数据分析师', '人工智能工程师'],
            learningResources: ['LeetCode', 'GitHub'],
            certificates: ['计算机二级', '软件设计师'],
            competitions: ['ACM程序设计竞赛', '蓝桥杯软件大赛'],
            gradSchools: ['计算机科学与技术', '软件工程', '人工智能'],
            civilJobs: ['信息技术岗', '网络安全岗', '数据分析岗']
        },
        '软件工程': {
            coreSkills: ['软件架构设计', '编程语言'],
            techStack: 'Java/Python/Web开发',
            jobs: ['软件工程师', '系统架构师', '全栈开发工程师'],
            learningResources: ['LeetCode', 'GitHub'],
            certificates: ['软件设计师', '系统架构设计师'],
            competitions: ['ACM程序设计竞赛', '蓝桥杯软件大赛'],
            gradSchools: ['软件工程', '计算机科学与技术', '人工智能'],
            civilJobs: ['软件开发岗', '系统运维岗', '信息化管理岗']
        },
        '人工智能': {
            coreSkills: ['机器学习算法', 'Python编程'],
            techStack: 'TensorFlow/PyTorch/NLP/CV',
            jobs: ['AI算法工程师', '机器学习工程师', '深度学习工程师'],
            learningResources: ['Kaggle', 'GitHub'],
            certificates: ['人工智能工程师认证', '数据分析师认证'],
            competitions: ['Kaggle竞赛', '数学建模竞赛'],
            gradSchools: ['人工智能', '计算机科学与技术', '模式识别'],
            civilJobs: ['人工智能岗', '数据分析岗', '智能系统岗']
        },
        '数据科学与大数据技术': {
            coreSkills: ['数据分析方法', '大数据技术'],
            techStack: 'Hadoop/Spark/Python/SQL',
            jobs: ['数据分析师', '大数据工程师', '数据科学家'],
            learningResources: ['Kaggle', 'LeetCode'],
            certificates: ['数据分析师认证', '大数据工程师认证'],
            competitions: ['Kaggle竞赛', '数学建模竞赛'],
            gradSchools: ['数据科学', '统计学', '计算机科学与技术'],
            civilJobs: ['数据分析岗', '统计岗', '信息化管理岗']
        },
        '电子信息工程': {
            coreSkills: ['电路设计', '信号处理'],
            techStack: '嵌入式开发/FPGA/通信技术',
            jobs: ['电子工程师', '嵌入式工程师', '通信工程师'],
            learningResources: ['电子设计竞赛平台', 'GitHub'],
            certificates: ['电子工程师认证', '嵌入式工程师认证'],
            competitions: ['全国电子设计竞赛', '智能车竞赛'],
            gradSchools: ['电子信息', '通信工程', '控制工程'],
            civilJobs: ['电子技术岗', '通信管理岗', '设备维护岗']
        },
        '通信工程': {
            coreSkills: ['通信原理', '信号处理'],
            techStack: '5G技术/网络协议/无线通信',
            jobs: ['通信工程师', '网络工程师', '无线工程师'],
            learningResources: ['通信技术论坛', 'GitHub'],
            certificates: ['通信工程师认证', '网络工程师认证'],
            competitions: ['全国电子设计竞赛', '通信创新大赛'],
            gradSchools: ['通信工程', '电子信息', '网络工程'],
            civilJobs: ['通信管理岗', '网络运维岗', '信息化岗']
        },
        '自动化': {
            coreSkills: ['控制理论', 'PLC编程'],
            techStack: '工业自动化/机器人/智能制造',
            jobs: ['自动化工程师', '控制工程师', '机器人工程师'],
            learningResources: ['自动化论坛', 'GitHub'],
            certificates: ['自动化工程师认证', 'PLC工程师认证'],
            competitions: ['全国电子设计竞赛', '智能车竞赛', '机器人竞赛'],
            gradSchools: ['控制科学与工程', '自动化', '机器人工程'],
            civilJobs: ['自动化岗', '设备管理岗', '智能制造岗']
        },
        '电气工程及其自动化': {
            coreSkills: ['电力系统', '电路分析'],
            techStack: '电力系统/电气设计/PLC',
            jobs: ['电气工程师', '电力工程师', '电气设计工程师'],
            learningResources: ['电气论坛', '专业软件'],
            certificates: ['电气工程师认证', '注册电气工程师'],
            competitions: ['全国电子设计竞赛', '电气创新大赛'],
            gradSchools: ['电气工程', '电力系统', '控制工程'],
            civilJobs: ['电力管理岗', '电气技术岗', '能源管理岗']
        },
        '机械工程': {
            coreSkills: ['机械设计', 'CAD绘图'],
            techStack: '机械设计/智能制造/CAD/CAM',
            jobs: ['机械工程师', '结构工程师', '制造工程师'],
            learningResources: ['机械设计论坛', 'CAD教程'],
            certificates: ['机械工程师认证', 'CAD认证'],
            competitions: ['机械创新设计大赛', '工程训练综合能力竞赛'],
            gradSchools: ['机械工程', '机械设计及理论', '智能制造'],
            civilJobs: ['机械技术岗', '设备管理岗', '制造管理岗']
        },
        '机械设计制造及其自动化': {
            coreSkills: ['机械设计', '自动化技术'],
            techStack: 'CAD/CAM/数控技术/智能制造',
            jobs: ['机械设计工程师', '制造工程师', '数控工程师'],
            learningResources: ['机械设计论坛', 'CAD教程'],
            certificates: ['机械工程师认证', '数控工程师认证'],
            competitions: ['机械创新设计大赛', '工程训练竞赛'],
            gradSchools: ['机械工程', '机械制造', '智能制造'],
            civilJobs: ['机械技术岗', '制造管理岗', '设备维护岗']
        },
        '土木工程': {
            coreSkills: ['结构设计', '工程力学'],
            techStack: '结构设计/CAD/BIM技术',
            jobs: ['结构工程师', '土木工程师', '建筑工程师'],
            learningResources: ['土木论坛', 'BIM教程'],
            certificates: ['注册结构工程师', '注册土木工程师'],
            competitions: ['结构设计竞赛', 'BIM应用大赛'],
            gradSchools: ['土木工程', '结构工程', '岩土工程'],
            civilJobs: ['建设管理岗', '工程监理岗', '城市规划岗']
        },
        '建筑学': {
            coreSkills: ['建筑设计', '空间规划'],
            techStack: '建筑设计/CAD/BIM/渲染',
            jobs: ['建筑师', '建筑设计师', '城市规划师'],
            learningResources: ['建筑论坛', '设计网站'],
            certificates: ['注册建筑师', '城市规划师认证'],
            competitions: ['建筑设计竞赛', '城市规划竞赛'],
            gradSchools: ['建筑学', '城市规划', '建筑设计'],
            civilJobs: ['建筑设计岗', '城市规划岗', '建设管理岗']
        },
        '工商管理': {
            coreSkills: ['管理学原理', '市场营销'],
            techStack: '企业管理/数据分析/营销策略',
            jobs: ['企业管理人员', '市场营销经理', '人力资源经理'],
            learningResources: ['管理案例库', '商业分析平台'],
            certificates: ['人力资源管理师', '营销师认证'],
            competitions: ['商业计划竞赛', '创业大赛', '案例分析大赛'],
            gradSchools: ['工商管理', '企业管理', '市场营销'],
            civilJobs: ['工商管理岗', '市场监管岗', '企业管理岗']
        },
        '市场营销': {
            coreSkills: ['市场分析', '营销策划'],
            techStack: '数字营销/数据分析/品牌管理',
            jobs: ['市场营销经理', '品牌经理', '数字营销专员'],
            learningResources: ['营销案例库', '数据分析平台'],
            certificates: ['营销师认证', '数字营销认证'],
            competitions: ['营销策划大赛', '创业大赛', '案例分析大赛'],
            gradSchools: ['市场营销', '工商管理', '广告学'],
            civilJobs: ['市场监管岗', '商务管理岗', '宣传岗']
        },
        '会计学': {
            coreSkills: ['会计核算', '财务分析'],
            techStack: '财务软件/ERP系统/数据分析',
            jobs: ['会计师', '财务分析师', '审计师'],
            learningResources: ['会计实操平台', '财务分析工具'],
            certificates: ['注册会计师(CPA)', '会计职称'],
            competitions: ['会计技能竞赛', '商业案例大赛'],
            gradSchools: ['会计学', '财务管理', '审计学'],
            civilJobs: ['财务岗', '审计岗', '税务岗']
        },
        '财务管理': {
            coreSkills: ['财务管理', '投资分析'],
            techStack: '财务分析/投资工具/ERP',
            jobs: ['财务经理', '投资分析师', '财务顾问'],
            learningResources: ['财务分析平台', '投资模拟系统'],
            certificates: ['注册会计师(CPA)', '金融分析师(CFA)'],
            competitions: ['财务案例分析大赛', '投资模拟竞赛'],
            gradSchools: ['财务管理', '会计学', '金融学'],
            civilJobs: ['财务管理岗', '审计岗', '财政岗']
        },
        '金融学': {
            coreSkills: ['金融理论', '投资分析'],
            techStack: '金融分析/量化投资/风险管理',
            jobs: ['金融分析师', '投资经理', '风控经理'],
            learningResources: ['金融数据平台', '量化交易平台'],
            certificates: ['金融分析师(CFA)', '证券从业资格'],
            competitions: ['金融建模竞赛', '投资模拟大赛'],
            gradSchools: ['金融学', '金融工程', '投资学'],
            civilJobs: ['金融管理岗', '银行监管岗', '财政岗']
        },
        '国际经济与贸易': {
            coreSkills: ['国际贸易', '商务英语'],
            techStack: '贸易流程/跨境电商/商务谈判',
            jobs: ['外贸业务员', '跨境电商运营', '国际贸易专员'],
            learningResources: ['贸易案例库', '跨境电商平台'],
            certificates: ['外贸从业资格', '报关员认证'],
            competitions: ['商务谈判大赛', '跨境电商竞赛'],
            gradSchools: ['国际贸易', '世界经济', '国际商务'],
            civilJobs: ['外贸管理岗', '商务管理岗', '海关岗']
        },
        '法学': {
            coreSkills: ['法律条文', '案例分析'],
            techStack: '法律检索/案例分析/文书写作',
            jobs: ['律师', '法务专员', '法官助理'],
            learningResources: ['法律数据库', '案例分析平台'],
            certificates: ['法律职业资格证', '律师执业证'],
            competitions: ['模拟法庭竞赛', '法律辩论赛'],
            gradSchools: ['法学', '民商法', '刑法'],
            civilJobs: ['法官', '检察官', '司法行政岗']
        },
        '英语': {
            coreSkills: ['英语语言', '翻译技能'],
            techStack: '翻译工具/语言教学/跨文化沟通',
            jobs: ['英语翻译', '英语教师', '外贸专员'],
            learningResources: ['翻译练习平台', '语言学习网站'],
            certificates: ['英语专业八级', '翻译资格证'],
            competitions: ['英语演讲比赛', '翻译大赛'],
            gradSchools: ['英语语言文学', '翻译学', '外国语言学'],
            civilJobs: ['外事岗', '翻译岗', '教育岗']
        },
        '汉语言文学': {
            coreSkills: ['文学理论', '写作能力'],
            techStack: '文案写作/编辑出版/新媒体',
            jobs: ['编辑', '文案策划', '语文教师'],
            learningResources: ['文学网站', '写作平台'],
            certificates: ['教师资格证', '编辑资格证'],
            competitions: ['写作大赛', '演讲比赛'],
            gradSchools: ['汉语言文学', '现当代文学', '古代文学'],
            civilJobs: ['宣传岗', '文秘岗', '文化管理岗']
        },
        '新闻学': {
            coreSkills: ['新闻写作', '媒体运营'],
            techStack: '新媒体运营/视频制作/内容策划',
            jobs: ['新闻记者', '新媒体运营', '内容编辑'],
            learningResources: ['新闻案例库', '新媒体平台'],
            certificates: ['记者证', '新媒体运营认证'],
            competitions: ['新闻写作大赛', '新媒体创意大赛'],
            gradSchools: ['新闻学', '传播学', '新媒体'],
            civilJobs: ['宣传岗', '新闻管理岗', '媒体监管岗']
        },
        '教育学': {
            coreSkills: ['教育理论', '教学方法'],
            techStack: '教学设计/教育技术/课程开发',
            jobs: ['教师', '教育培训师', '教育管理员'],
            learningResources: ['教育案例库', '教学资源平台'],
            certificates: ['教师资格证', '教育管理认证'],
            competitions: ['教学技能大赛', '教育创新竞赛'],
            gradSchools: ['教育学', '教育心理学', '课程与教学论'],
            civilJobs: ['教育管理岗', '教师岗', '教育行政岗']
        },
        '学前教育': {
            coreSkills: ['幼儿教育', '儿童心理'],
            techStack: '幼儿教学法/游戏设计/亲子活动',
            jobs: ['幼儿园教师', '早教老师', '幼教管理'],
            learningResources: ['幼教资源平台', '儿童教育网站'],
            certificates: ['幼儿园教师资格证', '早教指导师'],
            competitions: ['幼教技能大赛', '儿童教育创新赛'],
            gradSchools: ['学前教育', '幼儿教育', '儿童心理学'],
            civilJobs: ['幼儿教育岗', '教育管理岗', '儿童福利岗']
        },
        '数学与应用数学': {
            coreSkills: ['数学分析', '建模能力'],
            techStack: '数学建模/数据分析/算法设计',
            jobs: ['数据分析师', '算法工程师', '数学教师'],
            learningResources: ['数学建模平台', '算法练习网站'],
            certificates: ['数据分析师认证', '教师资格证'],
            competitions: ['数学建模竞赛', '数学竞赛'],
            gradSchools: ['数学', '应用数学', '统计学'],
            civilJobs: ['数据分析岗', '统计岗', '教育岗']
        },
        '物理学': {
            coreSkills: ['物理理论', '实验技能'],
            techStack: '物理实验/数据分析/科研方法',
            jobs: ['物理研究员', '物理教师', '数据分析师'],
            learningResources: ['物理实验平台', '科研数据库'],
            certificates: ['教师资格证', '实验员认证'],
            competitions: ['物理竞赛', '实验技能大赛'],
            gradSchools: ['物理学', '应用物理', '光学'],
            civilJobs: ['科研岗', '教育岗', '技术岗']
        },
        '化学': {
            coreSkills: ['化学原理', '实验操作'],
            techStack: '化学分析/实验技术/质量控制',
            jobs: ['化学分析师', '化工工程师', '化学教师'],
            learningResources: ['化学实验平台', '化工数据库'],
            certificates: ['化学分析师认证', '化工工程师认证'],
            competitions: ['化学竞赛', '实验技能大赛'],
            gradSchools: ['化学', '应用化学', '化学工程'],
            civilJobs: ['化工管理岗', '质检岗', '环保岗']
        },
        '生物科学': {
            coreSkills: ['生物学理论', '实验技能'],
            techStack: '生物实验/基因技术/数据分析',
            jobs: ['生物研究员', '生物技术工程师', '生物教师'],
            learningResources: ['生物实验平台', '科研数据库'],
            certificates: ['生物技术认证', '教师资格证'],
            competitions: ['生物竞赛', '实验技能大赛'],
            gradSchools: ['生物学', '生物技术', '生物工程'],
            civilJobs: ['生物技术岗', '环保岗', '检疫岗']
        },
        '环境工程': {
            coreSkills: ['环境监测', '污染治理'],
            techStack: '环境监测/污染控制/生态修复',
            jobs: ['环境工程师', '环保工程师', '环境监测员'],
            learningResources: ['环保技术平台', '环境数据库'],
            certificates: ['环境工程师认证', '环保工程师认证'],
            competitions: ['环境设计竞赛', '环保创新大赛'],
            gradSchools: ['环境工程', '环境科学', '生态学'],
            civilJobs: ['环保管理岗', '环境监测岗', '生态管理岗']
        },
        '医学': {
            coreSkills: ['医学理论', '临床技能'],
            techStack: '临床诊断/医学技术/病历管理',
            jobs: ['医生', '医学研究员', '临床医师'],
            learningResources: ['医学数据库', '临床培训平台'],
            certificates: ['执业医师证', '医学相关认证'],
            competitions: ['医学技能大赛', '临床病例竞赛'],
            gradSchools: ['临床医学', '基础医学', '公共卫生'],
            civilJobs: ['医生', '卫生管理岗', '疾控岗']
        },
        '护理学': {
            coreSkills: ['护理技能', '医学基础'],
            techStack: '护理技术/健康管理/康复护理',
            jobs: ['护士', '护理管理', '康复护理师'],
            learningResources: ['护理培训平台', '医学数据库'],
            certificates: ['护士执业证', '护理师认证'],
            competitions: ['护理技能大赛', '护理创新竞赛'],
            gradSchools: ['护理学', '护理管理', '康复护理'],
            civilJobs: ['护士', '护理管理岗', '健康管理岗']
        },
        '药学': {
            coreSkills: ['药理学', '药物分析'],
            techStack: '药物研发/质量控制/药事管理',
            jobs: ['药师', '药物研究员', '药品管理'],
            learningResources: ['药学数据库', '药物研发平台'],
            certificates: ['执业药师证', '药师认证'],
            competitions: ['药学技能竞赛', '药物研发大赛'],
            gradSchools: ['药学', '药物化学', '药理学'],
            civilJobs: ['药师', '药品管理岗', '药检岗']
        },
        '临床医学': {
            coreSkills: ['临床诊断', '医学理论'],
            techStack: '临床技术/医学影像/病历管理',
            jobs: ['临床医生', '医学研究员', '专科医师'],
            learningResources: ['医学数据库', '临床培训平台'],
            certificates: ['执业医师证', '专科医师认证'],
            competitions: ['医学技能大赛', '临床病例竞赛'],
            gradSchools: ['临床医学', '内科学', '外科学'],
            civilJobs: ['医生', '卫生管理岗', '疾控岗']
        },
        '公共管理': {
            coreSkills: ['管理学原理', '公共政策'],
            techStack: '政策分析/行政管理/公共服务',
            jobs: ['公务员', '行政管理人员', '公共管理师'],
            learningResources: ['政策数据库', '管理案例库'],
            certificates: ['公务员', '公共管理师认证'],
            competitions: ['公共管理案例分析', '政策设计竞赛'],
            gradSchools: ['公共管理', '行政管理', '公共政策'],
            civilJobs: ['行政管理岗', '公共服务岗', '政策研究岗']
        },
        '行政管理': {
            coreSkills: ['行政管理', '公文写作'],
            techStack: '办公自动化/档案管理/行政流程',
            jobs: ['行政主管', '办公室主任', '行政助理'],
            learningResources: ['行政案例库', '公文写作平台'],
            certificates: ['行政管理师', '秘书资格证'],
            competitions: ['行政技能竞赛', '公文写作大赛'],
            gradSchools: ['行政管理', '公共管理', '政治学'],
            civilJobs: ['行政管理岗', '文秘岗', '综合管理岗']
        },
        '人力资源管理': {
            coreSkills: ['人力资源管理', '组织行为'],
            techStack: 'HR系统/招聘管理/绩效管理',
            jobs: ['HR经理', '招聘专员', '培训专员'],
            learningResources: ['HR案例库', '人力资源管理平台'],
            certificates: ['人力资源管理师', '招聘师认证'],
            competitions: ['HR案例分析大赛', '招聘模拟竞赛'],
            gradSchools: ['人力资源管理', '工商管理', '劳动经济学'],
            civilJobs: ['人事岗', '组织人事岗', '人才管理岗']
        },
        '工业设计': {
            coreSkills: ['设计理论', '产品设计'],
            techStack: '产品设计/CAD/3D建模/渲染',
            jobs: ['工业设计师', '产品设计师', 'UI设计师'],
            learningResources: ['设计网站', '3D建模教程'],
            certificates: ['工业设计师认证', '产品设计师认证'],
            competitions: ['工业设计大赛', '产品设计竞赛'],
            gradSchools: ['工业设计', '设计学', '产品设计'],
            civilJobs: ['设计岗', '产品开发岗', '创意管理岗']
        },
        '视觉传达设计': {
            coreSkills: ['视觉设计', '平面设计'],
            techStack: '平面设计/品牌设计/UI设计',
            jobs: ['平面设计师', 'UI设计师', '品牌设计师'],
            learningResources: ['设计网站', '设计教程'],
            certificates: ['设计师认证', 'UI设计师认证'],
            competitions: ['设计大赛', '广告设计竞赛'],
            gradSchools: ['视觉传达设计', '设计学', '广告学'],
            civilJobs: ['设计岗', '宣传岗', '品牌管理岗']
        },
        '环境设计': {
            coreSkills: ['环境设计', '空间规划'],
            techStack: '室内设计/景观设计/CAD/3D建模',
            jobs: ['室内设计师', '景观设计师', '环境设计师'],
            learningResources: ['设计网站', '建模教程'],
            certificates: ['设计师认证', '室内设计师认证'],
            competitions: ['环境设计大赛', '室内设计竞赛'],
            gradSchools: ['环境设计', '设计学', '景观设计'],
            civilJobs: ['设计岗', '城市规划岗', '环境管理岗']
        },
        '产品设计': {
            coreSkills: ['产品设计', '设计思维'],
            techStack: '产品设计/CAD/3D建模/用户体验',
            jobs: ['产品设计师', '工业设计师', 'UX设计师'],
            learningResources: ['设计网站', '建模教程'],
            certificates: ['产品设计师认证', 'UX设计师认证'],
            competitions: ['产品设计大赛', '工业设计竞赛'],
            gradSchools: ['产品设计', '设计学', '工业设计'],
            civilJobs: ['设计岗', '产品开发岗', '创意管理岗']
        },
        '服装与服饰设计': {
            coreSkills: ['服装设计', '时尚理论'],
            techStack: '服装设计/面料知识/时尚趋势',
            jobs: ['服装设计师', '时尚编辑', '品牌设计师'],
            learningResources: ['时尚网站', '设计教程'],
            certificates: ['服装设计师认证', '时尚管理认证'],
            competitions: ['服装设计大赛', '时尚创意竞赛'],
            gradSchools: ['服装设计', '设计学', '时尚管理'],
            civilJobs: ['设计岗', '文化管理岗', '品牌管理岗']
        },
        '数字媒体艺术': {
            coreSkills: ['数字媒体', '艺术创作'],
            techStack: '数字媒体/视频制作/交互设计',
            jobs: ['数字媒体设计师', '视频编辑', '交互设计师'],
            learningResources: ['设计网站', '视频教程'],
            certificates: ['数字媒体认证', '视频编辑认证'],
            competitions: ['数字媒体大赛', '视频创作竞赛'],
            gradSchools: ['数字媒体艺术', '设计学', '新媒体'],
            civilJobs: ['设计岗', '宣传岗', '新媒体管理岗']
        },
        '动画': {
            coreSkills: ['动画设计', '视觉艺术'],
            techStack: '动画制作/3D建模/特效制作',
            jobs: ['动画师', '特效师', '游戏美术'],
            learningResources: ['动画教程', '设计网站'],
            certificates: ['动画师认证', '特效师认证'],
            competitions: ['动画大赛', '游戏美术竞赛'],
            gradSchools: ['动画', '设计学', '数字媒体'],
            civilJobs: ['设计岗', '文化管理岗', '创意管理岗']
        },
        '游戏设计': {
            coreSkills: ['游戏设计', '交互设计'],
            techStack: '游戏引擎/3D建模/游戏策划',
            jobs: ['游戏设计师', '游戏策划', '游戏美术'],
            learningResources: ['游戏开发教程', '设计网站'],
            certificates: ['游戏设计师认证', '游戏策划认证'],
            competitions: ['游戏设计大赛', '游戏开发竞赛'],
            gradSchools: ['游戏设计', '数字媒体', '交互设计'],
            civilJobs: ['设计岗', '文化管理岗', '创意管理岗']
        },
        '物联网工程': {
            coreSkills: ['物联网技术', '嵌入式开发'],
            techStack: '物联网/嵌入式/传感器/通信',
            jobs: ['物联网工程师', '嵌入式工程师', '智能硬件工程师'],
            learningResources: ['物联网平台', 'GitHub'],
            certificates: ['物联网工程师认证', '嵌入式工程师认证'],
            competitions: ['物联网竞赛', '智能硬件大赛'],
            gradSchools: ['物联网工程', '计算机科学与技术', '电子信息'],
            civilJobs: ['物联网岗', '智能系统岗', '信息化管理岗']
        },
        '网络工程': {
            coreSkills: ['网络技术', '网络安全'],
            techStack: '网络协议/网络安全/云计算',
            jobs: ['网络工程师', '网络安全工程师', '云计算工程师'],
            learningResources: ['网络安全平台', '网络教程'],
            certificates: ['网络工程师认证', '网络安全认证'],
            competitions: ['网络安全竞赛', '网络技术大赛'],
            gradSchools: ['网络工程', '计算机科学与技术', '网络安全'],
            civilJobs: ['网络管理岗', '网络安全岗', '信息化管理岗']
        },
        '信息安全': {
            coreSkills: ['网络安全', '密码学'],
            techStack: '网络安全/渗透测试/密码技术',
            jobs: ['网络安全工程师', '安全分析师', '渗透测试工程师'],
            learningResources: ['安全练习平台', '安全论坛'],
            certificates: ['网络安全认证', '信息安全认证'],
            competitions: ['网络安全竞赛', 'CTF竞赛'],
            gradSchools: ['信息安全', '网络安全', '计算机科学与技术'],
            civilJobs: ['网络安全岗', '信息安全岗', '公安技术岗']
        },
        '数字媒体技术': {
            coreSkills: ['数字媒体', '编程技术'],
            techStack: '数字媒体/视频处理/交互开发',
            jobs: ['数字媒体工程师', '前端工程师', '交互开发工程师'],
            learningResources: ['数字媒体平台', 'GitHub'],
            certificates: ['数字媒体认证', '前端开发认证'],
            competitions: ['数字媒体大赛', '创新应用竞赛'],
            gradSchools: ['数字媒体技术', '计算机科学与技术', '数字媒体'],
            civilJobs: ['数字媒体岗', '信息化管理岗', '技术岗']
        },
        '智能科学与技术': {
            coreSkills: ['人工智能', '智能系统'],
            techStack: '人工智能/机器学习/智能控制',
            jobs: ['AI工程师', '智能系统工程师', '算法工程师'],
            learningResources: ['AI平台', 'GitHub'],
            certificates: ['AI工程师认证', '智能系统认证'],
            competitions: ['AI竞赛', '智能系统大赛'],
            gradSchools: ['智能科学与技术', '人工智能', '控制工程'],
            civilJobs: ['人工智能岗', '智能系统岗', '信息化管理岗']
        },
        '空间信息与数字技术': {
            coreSkills: ['地理信息系统', '数字技术'],
            techStack: 'GIS/遥感/数字地图',
            jobs: ['GIS工程师', '遥感工程师', '数字地图工程师'],
            learningResources: ['GIS平台', '遥感教程'],
            certificates: ['GIS认证', '遥感认证'],
            competitions: ['GIS竞赛', '遥感应用大赛'],
            gradSchools: ['地理信息系统', '遥感', '测绘'],
            civilJobs: ['测绘岗', '地理信息岗', '规划岗']
        },
        '电子科学与技术': {
            coreSkills: ['电子技术', '半导体技术'],
            techStack: '电子设计/半导体/集成电路',
            jobs: ['电子工程师', '集成电路工程师', '半导体工程师'],
            learningResources: ['电子设计平台', '半导体教程'],
            certificates: ['电子工程师认证', '集成电路认证'],
            competitions: ['电子设计竞赛', '集成电路大赛'],
            gradSchools: ['电子科学与技术', '微电子', '集成电路'],
            civilJobs: ['电子技术岗', '半导体管理岗', '信息化岗']
        },
        '微电子科学与工程': {
            coreSkills: ['微电子技术', '集成电路'],
            techStack: '集成电路设计/半导体工艺/芯片设计',
            jobs: ['集成电路工程师', '芯片设计工程师', '半导体工程师'],
            learningResources: ['芯片设计平台', '半导体教程'],
            certificates: ['集成电路认证', '芯片设计认证'],
            competitions: ['集成电路竞赛', '芯片设计大赛'],
            gradSchools: ['微电子', '集成电路', '电子科学与技术'],
            civilJobs: ['集成电路岗', '半导体管理岗', '电子技术岗']
        },
        '光电信息科学与工程': {
            coreSkills: ['光学技术', '光电技术'],
            techStack: '光学设计/光电检测/激光技术',
            jobs: ['光学工程师', '光电工程师', '激光工程师'],
            learningResources: ['光学设计平台', '光电教程'],
            certificates: ['光学工程师认证', '光电认证'],
            competitions: ['光学设计竞赛', '光电应用大赛'],
            gradSchools: ['光电信息', '光学工程', '物理学'],
            civilJobs: ['光电技术岗', '光学管理岗', '信息化岗']
        },
        '新能源科学与工程': {
            coreSkills: ['新能源技术', '能源系统'],
            techStack: '太阳能/风能/储能技术',
            jobs: ['新能源工程师', '能源系统工程师', '储能工程师'],
            learningResources: ['新能源平台', '能源教程'],
            certificates: ['新能源工程师认证', '能源管理认证'],
            competitions: ['新能源竞赛', '能源创新大赛'],
            gradSchools: ['新能源科学与工程', '能源工程', '动力工程'],
            civilJobs: ['新能源管理岗', '能源管理岗', '环保岗']
        },
        '材料科学与工程': {
            coreSkills: ['材料科学', '材料分析'],
            techStack: '材料分析/材料制备/材料测试',
            jobs: ['材料工程师', '材料研究员', '材料分析师'],
            learningResources: ['材料数据库', '材料分析平台'],
            certificates: ['材料工程师认证', '材料分析师认证'],
            competitions: ['材料创新竞赛', '材料分析大赛'],
            gradSchools: ['材料科学与工程', '材料学', '材料加工'],
            civilJobs: ['材料管理岗', '质检岗', '技术岗']
        },
        '材料化学': {
            coreSkills: ['材料化学', '化学分析'],
            techStack: '材料合成/化学分析/材料测试',
            jobs: ['材料化学工程师', '材料研究员', '化学分析师'],
            learningResources: ['材料数据库', '化学分析平台'],
            certificates: ['材料工程师认证', '化学分析师认证'],
            competitions: ['材料创新竞赛', '化学分析大赛'],
            gradSchools: ['材料化学', '材料学', '化学'],
            civilJobs: ['材料管理岗', '质检岗', '化工岗']
        },
        '高分子材料与工程': {
            coreSkills: ['高分子材料', '材料工程'],
            techStack: '高分子合成/材料加工/材料测试',
            jobs: ['高分子工程师', '材料工程师', '塑料工程师'],
            learningResources: ['高分子平台', '材料教程'],
            certificates: ['高分子工程师认证', '材料工程师认证'],
            competitions: ['材料创新竞赛', '高分子应用大赛'],
            gradSchools: ['高分子材料', '材料学', '材料工程'],
            civilJobs: ['材料管理岗', '化工岗', '质检岗']
        },
        '统计学': {
            coreSkills: ['统计分析', '数据处理'],
            techStack: '统计分析/数据挖掘/R/Python',
            jobs: ['统计分析师', '数据分析师', '市场研究员'],
            learningResources: ['统计软件', '数据分析平台'],
            certificates: ['统计师认证', '数据分析师认证'],
            competitions: ['统计建模竞赛', '数据分析大赛'],
            gradSchools: ['统计学', '应用统计', '数据科学'],
            civilJobs: ['统计岗', '数据分析岗', '调研岗']
        },
        '应用统计学': {
            coreSkills: ['应用统计', '数据分析'],
            techStack: '统计分析/数据挖掘/商业分析',
            jobs: ['统计分析师', '商业分析师', '数据分析师'],
            learningResources: ['统计软件', '数据分析平台'],
            certificates: ['统计师认证', '商业分析师认证'],
            competitions: ['统计建模竞赛', '商业分析大赛'],
            gradSchools: ['应用统计', '统计学', '数据科学'],
            civilJobs: ['统计岗', '数据分析岗', '商业分析岗']
        },
        '经济统计学': {
            coreSkills: ['经济统计', '数据分析'],
            techStack: '经济分析/统计分析/数据挖掘',
            jobs: ['经济分析师', '统计分析师', '数据分析师'],
            learningResources: ['经济数据库', '统计分析平台'],
            certificates: ['统计师认证', '经济分析师认证'],
            competitions: ['经济分析竞赛', '统计建模大赛'],
            gradSchools: ['经济统计学', '统计学', '经济学'],
            civilJobs: ['统计岗', '经济分析岗', '数据分析岗']
        },
        '应用化学': {
            coreSkills: ['应用化学', '化学分析'],
            techStack: '化学分析/应用技术/质量控制',
            jobs: ['应用化学工程师', '化学分析师', '质检工程师'],
            learningResources: ['化学分析平台', '应用化学教程'],
            certificates: ['化学分析师认证', '应用化学认证'],
            competitions: ['化学分析竞赛', '应用化学大赛'],
            gradSchools: ['应用化学', '化学', '化学工程'],
            civilJobs: ['化工管理岗', '质检岗', '环保岗']
        },
        '生物技术': {
            coreSkills: ['生物技术', '实验技能'],
            techStack: '基因技术/生物实验/生物制药',
            jobs: ['生物技术工程师', '生物研究员', '生物制药工程师'],
            learningResources: ['生物技术平台', '生物实验教程'],
            certificates: ['生物技术认证', '生物制药认证'],
            competitions: ['生物技术竞赛', '生物创新大赛'],
            gradSchools: ['生物技术', '生物工程', '生物学'],
            civilJobs: ['生物技术岗', '生物制药岗', '检疫岗']
        },
        '生物工程': {
            coreSkills: ['生物工程', '生物技术'],
            techStack: '生物制药/基因工程/发酵技术',
            jobs: ['生物工程师', '生物制药工程师', '发酵工程师'],
            learningResources: ['生物工程平台', '生物制药教程'],
            certificates: ['生物工程师认证', '生物制药认证'],
            competitions: ['生物工程竞赛', '生物制药大赛'],
            gradSchools: ['生物工程', '生物技术', '生物制药'],
            civilJobs: ['生物工程岗', '生物制药岗', '检疫岗']
        },
        '食品科学与工程': {
            coreSkills: ['食品科学', '食品工程'],
            techStack: '食品加工/食品检测/食品安全',
            jobs: ['食品工程师', '食品检测员', '食品安全管理'],
            learningResources: ['食品科学平台', '食品检测教程'],
            certificates: ['食品工程师认证', '食品安全认证'],
            competitions: ['食品创新竞赛', '食品安全大赛'],
            gradSchools: ['食品科学与工程', '食品工程', '食品安全'],
            civilJobs: ['食品管理岗', '食品安全岗', '质检岗']
        },
        '食品质量与安全': {
            coreSkills: ['食品安全', '质量检测'],
            techStack: '食品检测/质量控制/食品安全',
            jobs: ['食品安全管理', '食品检测员', '质量管理'],
            learningResources: ['食品安全平台', '检测教程'],
            certificates: ['食品安全认证', '质量管理认证'],
            competitions: ['食品安全竞赛', '质量检测大赛'],
            gradSchools: ['食品质量与安全', '食品安全', '食品科学'],
            civilJobs: ['食品安全岗', '质检岗', '市场监管岗']
        },
        '建筑环境与能源应用工程': {
            coreSkills: ['建筑环境', '能源应用'],
            techStack: '暖通空调/建筑节能/能源系统',
            jobs: ['暖通工程师', '建筑节能工程师', '能源工程师'],
            learningResources: ['暖通平台', '节能教程'],
            certificates: ['暖通工程师认证', '建筑节能认证'],
            competitions: ['暖通设计竞赛', '节能创新大赛'],
            gradSchools: ['建筑环境与能源应用', '暖通空调', '建筑节能'],
            civilJobs: ['暖通管理岗', '能源管理岗', '建筑管理岗']
        },
        '给排水科学与工程': {
            coreSkills: ['给排水', '水处理'],
            techStack: '给排水设计/水处理/管网设计',
            jobs: ['给排水工程师', '水处理工程师', '管网工程师'],
            learningResources: ['给排水平台', '水处理教程'],
            certificates: ['给排水工程师认证', '水处理认证'],
            competitions: ['给排水设计竞赛', '水处理大赛'],
            gradSchools: ['给排水科学与工程', '水处理', '市政工程'],
            civilJobs: ['给排水管理岗', '水务管理岗', '市政管理岗']
        },
        '城市地下空间工程': {
            coreSkills: ['地下工程', '隧道技术'],
            techStack: '隧道设计/地下施工/岩土工程',
            jobs: ['隧道工程师', '地下工程工程师', '岩土工程师'],
            learningResources: ['隧道设计平台', '地下工程教程'],
            certificates: ['隧道工程师认证', '岩土工程师认证'],
            competitions: ['隧道设计竞赛', '地下工程大赛'],
            gradSchools: ['城市地下空间工程', '隧道工程', '岩土工程'],
            civilJobs: ['隧道管理岗', '地下工程岗', '市政管理岗']
        },
        '道路桥梁与渡河工程': {
            coreSkills: ['道路工程', '桥梁工程'],
            techStack: '道路设计/桥梁设计/交通工程',
            jobs: ['道路工程师', '桥梁工程师', '交通工程师'],
            learningResources: ['道路设计平台', '桥梁设计教程'],
            certificates: ['道路工程师认证', '桥梁工程师认证'],
            competitions: ['道路设计竞赛', '桥梁设计大赛'],
            gradSchools: ['道路桥梁与渡河工程', '道路工程', '桥梁工程'],
            civilJobs: ['道路管理岗', '桥梁管理岗', '交通管理岗']
        },
        '水利水电工程': {
            coreSkills: ['水利工程', '水电技术'],
            techStack: '水利设计/水电工程/水电站',
            jobs: ['水利工程师', '水电工程师', '水电站工程师'],
            learningResources: ['水利设计平台', '水电教程'],
            certificates: ['水利工程师认证', '水电工程师认证'],
            competitions: ['水利设计竞赛', '水电创新大赛'],
            gradSchools: ['水利水电工程', '水利工程', '水电工程'],
            civilJobs: ['水利管理岗', '水电管理岗', '水务管理岗']
        },
        '水文与水资源工程': {
            coreSkills: ['水文分析', '水资源'],
            techStack: '水文分析/水资源管理/水文模型',
            jobs: ['水文工程师', '水资源工程师', '水文分析师'],
            learningResources: ['水文分析平台', '水资源教程'],
            certificates: ['水文工程师认证', '水资源认证'],
            competitions: ['水文分析竞赛', '水资源大赛'],
            gradSchools: ['水文与水资源工程', '水文', '水资源'],
            civilJobs: ['水文管理岗', '水资源管理岗', '水务管理岗']
        },
        '测绘工程': {
            coreSkills: ['测绘技术', '地理信息'],
            techStack: '测绘技术/GIS/遥感',
            jobs: ['测绘工程师', 'GIS工程师', '遥感工程师'],
            learningResources: ['测绘平台', 'GIS教程'],
            certificates: ['测绘工程师认证', 'GIS认证'],
            competitions: ['测绘竞赛', 'GIS大赛'],
            gradSchools: ['测绘工程', '地理信息系统', '遥感'],
            civilJobs: ['测绘岗', '地理信息岗', '规划岗']
        },
        '遥感科学与技术': {
            coreSkills: ['遥感技术', '图像处理'],
            techStack: '遥感技术/图像处理/GIS',
            jobs: ['遥感工程师', '图像处理工程师', 'GIS工程师'],
            learningResources: ['遥感平台', '图像处理教程'],
            certificates: ['遥感工程师认证', '图像处理认证'],
            competitions: ['遥感竞赛', '图像处理大赛'],
            gradSchools: ['遥感科学与技术', '遥感', '地理信息系统'],
            civilJobs: ['遥感岗', '地理信息岗', '测绘岗']
        },
        '地理信息科学': {
            coreSkills: ['地理信息', 'GIS技术'],
            techStack: 'GIS/空间分析/地图制作',
            jobs: ['GIS工程师', '地理信息分析师', '地图工程师'],
            learningResources: ['GIS平台', '空间分析教程'],
            certificates: ['GIS认证', '地理信息认证'],
            competitions: ['GIS竞赛', '空间分析大赛'],
            gradSchools: ['地理信息科学', 'GIS', '地理学'],
            civilJobs: ['地理信息岗', '规划岗', '测绘岗']
        },
        '交通工程': {
            coreSkills: ['交通规划', '交通管理'],
            techStack: '交通规划/交通仿真/智能交通',
            jobs: ['交通工程师', '交通规划师', '智能交通工程师'],
            learningResources: ['交通仿真平台', '智能交通教程'],
            certificates: ['交通工程师认证', '交通规划认证'],
            competitions: ['交通规划竞赛', '智能交通大赛'],
            gradSchools: ['交通工程', '交通运输', '智能交通'],
            civilJobs: ['交通管理岗', '交通规划岗', '交警']
        },
        '交通运输': {
            coreSkills: ['运输管理', '物流技术'],
            techStack: '运输管理/物流系统/交通规划',
            jobs: ['运输管理师', '物流工程师', '交通规划师'],
            learningResources: ['运输管理平台', '物流教程'],
            certificates: ['运输管理认证', '物流工程师认证'],
            competitions: ['运输管理竞赛', '物流大赛'],
            gradSchools: ['交通运输', '交通工程', '物流工程'],
            civilJobs: ['运输管理岗', '交通管理岗', '物流管理岗']
        },
        '物流工程': {
            coreSkills: ['物流系统', '供应链'],
            techStack: '物流系统/供应链管理/仓储技术',
            jobs: ['物流工程师', '供应链管理师', '仓储工程师'],
            learningResources: ['物流平台', '供应链教程'],
            certificates: ['物流工程师认证', '供应链认证'],
            competitions: ['物流竞赛', '供应链大赛'],
            gradSchools: ['物流工程', '物流管理', '供应链'],
            civilJobs: ['物流管理岗', '供应链管理岗', '仓储管理岗']
        },
        '物流管理': {
            coreSkills: ['物流管理', '供应链'],
            techStack: '物流管理/供应链/仓储管理',
            jobs: ['物流管理师', '供应链管理师', '仓储管理'],
            learningResources: ['物流管理平台', '供应链教程'],
            certificates: ['物流管理认证', '供应链认证'],
            competitions: ['物流管理竞赛', '供应链大赛'],
            gradSchools: ['物流管理', '供应链管理', '工商管理'],
            civilJobs: ['物流管理岗', '供应链管理岗', '商务管理岗']
        },
        '工业工程': {
            coreSkills: ['工业工程', '生产管理'],
            techStack: '生产管理/质量控制/精益生产',
            jobs: ['工业工程师', '生产管理师', '质量工程师'],
            learningResources: ['工业工程平台', '生产管理教程'],
            certificates: ['工业工程师认证', '质量工程师认证'],
            competitions: ['工业工程竞赛', '生产管理大赛'],
            gradSchools: ['工业工程', '管理科学与工程', '生产管理'],
            civilJobs: ['生产管理岗', '质量管理岗', '工业管理岗']
        },
        '工程管理': {
            coreSkills: ['工程管理', '项目管理'],
            techStack: '项目管理/工程造价/工程监理',
            jobs: ['项目经理', '工程造价师', '工程监理'],
            learningResources: ['项目管理平台', '工程造价教程'],
            certificates: ['项目管理认证(PMP)', '造价工程师认证'],
            competitions: ['项目管理竞赛', '工程造价大赛'],
            gradSchools: ['工程管理', '项目管理', '工程造价'],
            civilJobs: ['项目管理岗', '工程造价岗', '工程监理岗']
        },
        '信息管理与信息系统': {
            coreSkills: ['信息系统', '管理科学'],
            techStack: '信息系统/数据库/数据分析',
            jobs: ['信息系统管理师', '数据分析师', 'IT管理'],
            learningResources: ['信息系统平台', '数据分析教程'],
            certificates: ['信息系统认证', '数据分析师认证'],
            competitions: ['信息系统竞赛', '数据分析大赛'],
            gradSchools: ['信息管理与信息系统', '管理科学与工程', '信息系统'],
            civilJobs: ['信息系统管理岗', '数据分析岗', '信息化管理岗']
        },
        '电子商务': {
            coreSkills: ['电子商务', '网络营销'],
            techStack: '电商平台/网络营销/数据分析',
            jobs: ['电商运营', '网络营销师', '电商分析师'],
            learningResources: ['电商平台', '营销教程'],
            certificates: ['电商认证', '网络营销认证'],
            competitions: ['电商竞赛', '网络营销大赛'],
            gradSchools: ['电子商务', '工商管理', '市场营销'],
            civilJobs: ['电商管理岗', '市场监管岗', '商务管理岗']
        },
        '旅游管理': {
            coreSkills: ['旅游管理', '酒店管理'],
            techStack: '旅游规划/酒店管理/旅游营销',
            jobs: ['旅游管理师', '酒店管理', '旅游策划'],
            learningResources: ['旅游管理平台', '酒店管理教程'],
            certificates: ['旅游管理认证', '酒店管理认证'],
            competitions: ['旅游规划竞赛', '酒店管理大赛'],
            gradSchools: ['旅游管理', '酒店管理', '旅游规划'],
            civilJobs: ['旅游管理岗', '酒店管理岗', '文旅管理岗']
        },
        '酒店管理': {
            coreSkills: ['酒店管理', '服务管理'],
            techStack: '酒店运营/服务管理/酒店营销',
            jobs: ['酒店管理', '酒店运营', '服务管理'],
            learningResources: ['酒店管理平台', '服务管理教程'],
            certificates: ['酒店管理认证', '服务管理认证'],
            competitions: ['酒店管理竞赛', '服务创新大赛'],
            gradSchools: ['酒店管理', '旅游管理', '工商管理'],
            civilJobs: ['酒店管理岗', '服务管理岗', '文旅管理岗']
        },
        '会展经济与管理': {
            coreSkills: ['会展管理', '活动策划'],
            techStack: '会展策划/活动管理/会展营销',
            jobs: ['会展策划师', '活动管理', '会展营销'],
            learningResources: ['会展平台', '活动策划教程'],
            certificates: ['会展策划认证', '活动管理认证'],
            competitions: ['会展策划竞赛', '活动创新大赛'],
            gradSchools: ['会展经济与管理', '旅游管理', '工商管理'],
            civilJobs: ['会展管理岗', '活动管理岗', '文旅管理岗']
        },
        '体育教育': {
            coreSkills: ['体育教学', '运动训练'],
            techStack: '体育教学/运动训练/体育管理',
            jobs: ['体育教师', '运动教练', '体育管理'],
            learningResources: ['体育教学平台', '运动训练教程'],
            certificates: ['教师资格证', '教练员认证'],
            competitions: ['体育技能竞赛', '运动训练大赛'],
            gradSchools: ['体育教育', '运动训练', '体育管理'],
            civilJobs: ['体育教师岗', '教练岗', '体育管理岗']
        },
        '运动训练': {
            coreSkills: ['运动训练', '体育技能'],
            techStack: '运动训练/体能训练/运动康复',
            jobs: ['运动教练', '体能教练', '运动康复师'],
            learningResources: ['运动训练平台', '体能训练教程'],
            certificates: ['教练员认证', '体能教练认证'],
            competitions: ['运动技能竞赛', '体能训练大赛'],
            gradSchools: ['运动训练', '体育教育', '运动康复'],
            civilJobs: ['教练岗', '体能训练岗', '体育管理岗']
        },
        '社会体育指导与管理': {
            coreSkills: ['社会体育', '健身指导'],
            techStack: '健身指导/体育管理/运动康复',
            jobs: ['健身教练', '体育管理', '运动康复师'],
            learningResources: ['健身平台', '体育管理教程'],
            certificates: ['健身教练认证', '体育管理认证'],
            competitions: ['健身技能竞赛', '体育管理大赛'],
            gradSchools: ['社会体育', '体育管理', '运动康复'],
            civilJobs: ['健身指导岗', '体育管理岗', '社会体育岗']
        },
        '运动康复': {
            coreSkills: ['运动康复', '康复技术'],
            techStack: '运动康复/康复训练/体能训练',
            jobs: ['运动康复师', '康复训练师', '体能教练'],
            learningResources: ['康复平台', '康复训练教程'],
            certificates: ['康复师认证', '体能教练认证'],
            competitions: ['康复技能竞赛', '运动康复大赛'],
            gradSchools: ['运动康复', '康复医学', '体育教育'],
            civilJobs: ['康复岗', '体育管理岗', '健康管理岗']
        },
        '休闲体育': {
            coreSkills: ['休闲体育', '体育管理'],
            techStack: '休闲体育/体育旅游/健身指导',
            jobs: ['休闲体育指导', '体育旅游管理', '健身教练'],
            learningResources: ['休闲体育平台', '体育旅游教程'],
            certificates: ['休闲体育认证', '健身教练认证'],
            competitions: ['休闲体育竞赛', '体育旅游大赛'],
            gradSchools: ['休闲体育', '体育管理', '旅游管理'],
            civilJobs: ['休闲体育岗', '体育管理岗', '文旅管理岗']
        },
        '音乐学': {
            coreSkills: ['音乐理论', '音乐表演'],
            techStack: '音乐表演/音乐教育/音乐制作',
            jobs: ['音乐教师', '音乐表演', '音乐制作'],
            learningResources: ['音乐平台', '音乐教程'],
            certificates: ['教师资格证', '音乐表演认证'],
            competitions: ['音乐比赛', '音乐表演大赛'],
            gradSchools: ['音乐学', '音乐表演', '音乐教育'],
            civilJobs: ['音乐教师岗', '文化管理岗', '艺术管理岗']
        },
        '音乐表演': {
            coreSkills: ['音乐表演', '音乐技能'],
            techStack: '音乐表演/舞台表演/音乐制作',
            jobs: ['音乐表演', '音乐教师', '音乐制作'],
            learningResources: ['音乐平台', '表演教程'],
            certificates: ['音乐表演认证', '教师资格证'],
            competitions: ['音乐比赛', '表演大赛'],
            gradSchools: ['音乐表演', '音乐学', '音乐教育'],
            civilJobs: ['表演岗', '文化管理岗', '艺术管理岗']
        },
        '舞蹈学': {
            coreSkills: ['舞蹈理论', '舞蹈表演'],
            techStack: '舞蹈表演/舞蹈教育/舞蹈编导',
            jobs: ['舞蹈教师', '舞蹈表演', '舞蹈编导'],
            learningResources: ['舞蹈平台', '舞蹈教程'],
            certificates: ['教师资格证', '舞蹈表演认证'],
            competitions: ['舞蹈比赛', '舞蹈表演大赛'],
            gradSchools: ['舞蹈学', '舞蹈表演', '舞蹈编导'],
            civilJobs: ['舞蹈教师岗', '文化管理岗', '艺术管理岗']
        },
        '舞蹈表演': {
            coreSkills: ['舞蹈表演', '舞蹈技能'],
            techStack: '舞蹈表演/舞台表演/舞蹈编导',
            jobs: ['舞蹈表演', '舞蹈教师', '舞蹈编导'],
            learningResources: ['舞蹈平台', '表演教程'],
            certificates: ['舞蹈表演认证', '教师资格证'],
            competitions: ['舞蹈比赛', '表演大赛'],
            gradSchools: ['舞蹈表演', '舞蹈学', '舞蹈编导'],
            civilJobs: ['表演岗', '文化管理岗', '艺术管理岗']
        },
        '表演': {
            coreSkills: ['表演技能', '舞台表演'],
            techStack: '表演技术/舞台表演/影视表演',
            jobs: ['演员', '表演教师', '导演'],
            learningResources: ['表演平台', '表演教程'],
            certificates: ['表演认证', '教师资格证'],
            competitions: ['表演比赛', '影视表演大赛'],
            gradSchools: ['表演', '戏剧影视', '导演'],
            civilJobs: ['表演岗', '文化管理岗', '艺术管理岗']
        },
        '戏剧影视文学': {
            coreSkills: ['戏剧影视', '文学创作'],
            techStack: '剧本创作/影视编剧/戏剧创作',
            jobs: ['编剧', '剧本创作', '影视策划'],
            learningResources: ['编剧平台', '创作教程'],
            certificates: ['编剧认证', '文学创作认证'],
            competitions: ['剧本创作竞赛', '影视编剧大赛'],
            gradSchools: ['戏剧影视文学', '戏剧影视', '文学'],
            civilJobs: ['编剧岗', '文化管理岗', '艺术管理岗']
        },
        '广播电视编导': {
            coreSkills: ['广播电视', '编导技术'],
            techStack: '电视编导/节目制作/影视制作',
            jobs: ['电视编导', '节目制作', '影视策划'],
            learningResources: ['编导平台', '制作教程'],
            certificates: ['编导认证', '节目制作认证'],
            competitions: ['编导竞赛', '节目制作大赛'],
            gradSchools: ['广播电视编导', '戏剧影视', '新闻传播'],
            civilJobs: ['编导岗', '文化管理岗', '媒体管理岗']
        },
        '戏剧影视导演': {
            coreSkills: ['导演技术', '影视制作'],
            techStack: '导演技术/影视制作/戏剧导演',
            jobs: ['导演', '影视制作', '戏剧导演'],
            learningResources: ['导演平台', '制作教程'],
            certificates: ['导演认证', '影视制作认证'],
            competitions: ['导演竞赛', '影视制作大赛'],
            gradSchools: ['戏剧影视导演', '戏剧影视', '电影学'],
            civilJobs: ['导演岗', '文化管理岗', '艺术管理岗']
        },
        '影视摄影与制作': {
            coreSkills: ['影视摄影', '影视制作'],
            techStack: '摄影技术/影视制作/后期制作',
            jobs: ['摄影师', '影视制作', '后期制作'],
            learningResources: ['摄影平台', '制作教程'],
            certificates: ['摄影师认证', '影视制作认证'],
            competitions: ['摄影竞赛', '影视制作大赛'],
            gradSchools: ['影视摄影与制作', '电影学', '影视制作'],
            civilJobs: ['摄影岗', '文化管理岗', '媒体管理岗']
        },
        '播音与主持艺术': {
            coreSkills: ['播音主持', '语言表达'],
            techStack: '播音技术/主持技巧/语言表达',
            jobs: ['播音员', '主持人', '配音演员'],
            learningResources: ['播音平台', '主持教程'],
            certificates: ['播音员认证', '主持人认证'],
            competitions: ['播音竞赛', '主持大赛'],
            gradSchools: ['播音与主持艺术', '新闻传播', '戏剧影视'],
            civilJobs: ['播音岗', '主持岗', '媒体管理岗']
        },
        '广播电视学': {
            coreSkills: ['广播电视', '新闻传播'],
            techStack: '电视制作/新闻采编/媒体运营',
            jobs: ['电视记者', '新闻编辑', '媒体运营'],
            learningResources: ['电视平台', '新闻教程'],
            certificates: ['记者证', '编辑认证'],
            competitions: ['新闻竞赛', '电视制作大赛'],
            gradSchools: ['广播电视学', '新闻学', '传播学'],
            civilJobs: ['记者岗', '编辑岗', '媒体管理岗']
        },
        '广告学': {
            coreSkills: ['广告策划', '创意设计'],
            techStack: '广告策划/创意设计/品牌营销',
            jobs: ['广告策划', '创意设计师', '品牌经理'],
            learningResources: ['广告平台', '创意教程'],
            certificates: ['广告策划认证', '创意设计认证'],
            competitions: ['广告创意竞赛', '品牌策划大赛'],
            gradSchools: ['广告学', '传播学', '市场营销'],
            civilJobs: ['广告管理岗', '宣传岗', '品牌管理岗']
        },
        '传播学': {
            coreSkills: ['传播理论', '媒体运营'],
            techStack: '传播策略/媒体运营/内容策划',
            jobs: ['传播策划', '媒体运营', '内容策划'],
            learningResources: ['传播平台', '媒体教程'],
            certificates: ['传播策划认证', '媒体运营认证'],
            competitions: ['传播策略竞赛', '媒体运营大赛'],
            gradSchools: ['传播学', '新闻学', '广告学'],
            civilJobs: ['传播管理岗', '媒体管理岗', '宣传岗']
        },
        '编辑出版学': {
            coreSkills: ['编辑出版', '内容策划'],
            techStack: '编辑技术/出版流程/内容策划',
            jobs: ['编辑', '出版管理', '内容策划'],
            learningResources: ['编辑平台', '出版教程'],
            certificates: ['编辑认证', '出版管理认证'],
            competitions: ['编辑竞赛', '出版策划大赛'],
            gradSchools: ['编辑出版学', '新闻学', '传播学'],
            civilJobs: ['编辑岗', '出版管理岗', '文化管理岗']
        },
        '网络与新媒体': {
            coreSkills: ['新媒体', '网络传播'],
            techStack: '新媒体运营/网络传播/内容策划',
            jobs: ['新媒体运营', '网络编辑', '内容策划'],
            learningResources: ['新媒体平台', '网络教程'],
            certificates: ['新媒体认证', '网络编辑认证'],
            competitions: ['新媒体竞赛', '网络传播大赛'],
            gradSchools: ['网络与新媒体', '传播学', '新闻学'],
            civilJobs: ['新媒体岗', '网络管理岗', '宣传岗']
        },
        '数字出版': {
            coreSkills: ['数字出版', '内容策划'],
            techStack: '数字出版/内容策划/新媒体',
            jobs: ['数字编辑', '出版管理', '内容策划'],
            learningResources: ['数字出版平台', '内容教程'],
            certificates: ['数字编辑认证', '出版管理认证'],
            competitions: ['数字出版竞赛', '内容策划大赛'],
            gradSchools: ['数字出版', '编辑出版学', '传播学'],
            civilJobs: ['数字编辑岗', '出版管理岗', '文化管理岗']
        },
        '社会学': {
            coreSkills: ['社会学理论', '社会调查'],
            techStack: '社会调查/数据分析/社会研究',
            jobs: ['社会研究员', '社会工作者', '数据分析师'],
            learningResources: ['社会调查平台', '数据分析教程'],
            certificates: ['社会工作者认证', '数据分析师认证'],
            competitions: ['社会调查竞赛', '社会研究大赛'],
            gradSchools: ['社会学', '社会工作', '社会研究'],
            civilJobs: ['社会管理岗', '社工岗', '调研岗']
        },
        '社会工作': {
            coreSkills: ['社会工作', '社会服务'],
            techStack: '社工技术/社会服务/心理咨询',
            jobs: ['社会工作者', '社工管理', '心理咨询师'],
            learningResources: ['社工平台', '社会服务教程'],
            certificates: ['社会工作者认证', '心理咨询认证'],
            competitions: ['社工竞赛', '社会服务大赛'],
            gradSchools: ['社会工作', '社会学', '心理学'],
            civilJobs: ['社工岗', '社会管理岗', '民政岗']
        },
        '人类学': {
            coreSkills: ['人类学理论', '田野调查'],
            techStack: '田野调查/文化研究/社会研究',
            jobs: ['人类学研究员', '文化研究', '社会研究员'],
            learningResources: ['人类学平台', '田野调查教程'],
            certificates: ['人类学认证', '文化研究认证'],
            competitions: ['田野调查竞赛', '文化研究大赛'],
            gradSchools: ['人类学', '社会学', '文化研究'],
            civilJobs: ['文化管理岗', '社会管理岗', '调研岗']
        },
        '女性学': {
            coreSkills: ['女性学理论', '社会研究'],
            techStack: '性别研究/社会调查/社会工作',
            jobs: ['女性学研究员', '社工', '性别研究'],
            learningResources: ['女性学平台', '社会研究教程'],
            certificates: ['社工认证', '性别研究认证'],
            competitions: ['性别研究竞赛', '社会调查大赛'],
            gradSchools: ['女性学', '社会学', '社会工作'],
            civilJobs: ['社工岗', '妇女管理岗', '社会管理岗']
        },
        '家政学': {
            coreSkills: ['家政学', '家庭管理'],
            techStack: '家庭管理/家政服务/家庭教育',
            jobs: ['家政管理', '家庭教育', '家政服务'],
            learningResources: ['家政平台', '家庭管理教程'],
            certificates: ['家政管理认证', '家庭教育认证'],
            competitions: ['家政竞赛', '家庭教育大赛'],
            gradSchools: ['家政学', '社会工作', '教育学'],
            civilJobs: ['家政管理岗', '家庭教育岗', '社会管理岗']
        },
        '老年学': {
            coreSkills: ['老年学', '养老服务'],
            techStack: '养老服务/老年管理/健康管理',
            jobs: ['老年服务管理', '健康管理', '养老服务'],
            learningResources: ['老年学平台', '养老服务教程'],
            certificates: ['养老服务认证', '健康管理认证'],
            competitions: ['老年服务竞赛', '健康管理大赛'],
            gradSchools: ['老年学', '社会工作', '健康管理'],
            civilJobs: ['养老服务岗', '健康管理岗', '民政岗']
        },
        '心理学': {
            coreSkills: ['心理学理论', '心理咨询'],
            techStack: '心理咨询/心理测评/心理研究',
            jobs: ['心理咨询师', '心理研究员', '心理教师'],
            learningResources: ['心理咨询平台', '心理研究教程'],
            certificates: ['心理咨询师认证', '心理测评认证'],
            competitions: ['心理咨询竞赛', '心理研究大赛'],
            gradSchools: ['心理学', '应用心理学', '心理咨询'],
            civilJobs: ['心理咨询岗', '教育岗', '健康管理岗']
        },
        '应用心理学': {
            coreSkills: ['应用心理', '心理咨询'],
            techStack: '心理咨询/心理测评/人力资源管理',
            jobs: ['心理咨询师', 'HR心理顾问', '心理教师'],
            learningResources: ['心理咨询平台', '心理应用教程'],
            certificates: ['心理咨询师认证', 'HR心理认证'],
            competitions: ['心理咨询竞赛', '心理应用大赛'],
            gradSchools: ['应用心理学', '心理学', '心理咨询'],
            civilJobs: ['心理咨询岗', '人事岗', '教育岗']
        },
        '刑事科学技术': {
            coreSkills: ['刑事技术', '证据分析'],
            techStack: '刑事技术/证据分析/痕迹检验',
            jobs: ['刑事技术员', '证据分析师', '痕迹检验员'],
            learningResources: ['刑事技术平台', '证据分析教程'],
            certificates: ['刑事技术认证', '证据分析认证'],
            competitions: ['刑事技术竞赛', '证据分析大赛'],
            gradSchools: ['刑事科学技术', '法学', '公安技术'],
            civilJobs: ['刑事技术岗', '公安岗', '司法岗']
        },
        '公安技术': {
            coreSkills: ['公安技术', '安全技术'],
            techStack: '公安技术/网络安全/安全技术',
            jobs: ['公安技术员', '网络安全工程师', '安全技术员'],
            learningResources: ['公安技术平台', '安全教程'],
            certificates: ['公安技术认证', '网络安全认证'],
            competitions: ['公安技术竞赛', '网络安全大赛'],
            gradSchools: ['公安技术', '网络安全', '刑事技术'],
            civilJobs: ['公安技术岗', '网络安全岗', '公安岗']
        },
        '消防工程': {
            coreSkills: ['消防技术', '安全管理'],
            techStack: '消防技术/安全管理/消防设计',
            jobs: ['消防工程师', '安全管理', '消防设计'],
            learningResources: ['消防平台', '安全教程'],
            certificates: ['消防工程师认证', '安全管理认证'],
            competitions: ['消防竞赛', '安全管理大赛'],
            gradSchools: ['消防工程', '安全工程', '安全管理'],
            civilJobs: ['消防管理岗', '安全管理岗', '应急管理岗']
        },
        '安全工程': {
            coreSkills: ['安全管理', '安全技术'],
            techStack: '安全管理/安全技术/风险评估',
            jobs: ['安全工程师', '安全管理', '风险评估师'],
            learningResources: ['安全平台', '风险评估教程'],
            certificates: ['安全工程师认证', '安全管理认证'],
            competitions: ['安全竞赛', '风险评估大赛'],
            gradSchools: ['安全工程', '安全管理', '消防工程'],
            civilJobs: ['安全管理岗', '风险评估岗', '应急管理岗']
        },
        '抢险救援与技术': {
            coreSkills: ['抢险救援', '应急管理'],
            techStack: '抢险技术/应急管理/救援技术',
            jobs: ['抢险救援', '应急管理', '救援技术'],
            learningResources: ['救援平台', '应急管理教程'],
            certificates: ['救援认证', '应急管理认证'],
            competitions: ['救援竞赛', '应急管理大赛'],
            gradSchools: ['抢险救援与技术', '应急管理', '安全工程'],
            civilJobs: ['救援岗', '应急管理岗', '消防管理岗']
        },
        '网络安全与执法': {
            coreSkills: ['网络安全', '执法技术'],
            techStack: '网络安全/执法技术/网络犯罪',
            jobs: ['网络安全工程师', '网络执法', '网络犯罪分析'],
            learningResources: ['网络安全平台', '执法教程'],
            certificates: ['网络安全认证', '执法认证'],
            competitions: ['网络安全竞赛', '执法技术大赛'],
            gradSchools: ['网络安全与执法', '网络安全', '公安技术'],
            civilJobs: ['网络安全岗', '公安岗', '执法岗']
        },
        '核工程与核技术': {
            coreSkills: ['核技术', '核工程'],
            techStack: '核技术/核工程/核安全',
            jobs: ['核工程师', '核技术员', '核安全管理'],
            learningResources: ['核技术平台', '核工程教程'],
            certificates: ['核工程师认证', '核安全认证'],
            competitions: ['核技术竞赛', '核工程大赛'],
            gradSchools: ['核工程与核技术', '核技术', '核安全'],
            civilJobs: ['核技术岗', '核安全管理岗', '能源管理岗']
        },
        '辐射防护与核安全': {
            coreSkills: ['辐射防护', '核安全'],
            techStack: '辐射防护/核安全/环境监测',
            jobs: ['辐射防护工程师', '核安全管理', '环境监测'],
            learningResources: ['辐射防护平台', '核安全教程'],
            certificates: ['辐射防护认证', '核安全认证'],
            competitions: ['辐射防护竞赛', '核安全大赛'],
            gradSchools: ['辐射防护与核安全', '核安全', '环境工程'],
            civilJobs: ['辐射防护岗', '核安全管理岗', '环保岗']
        },
        '工程物理': {
            coreSkills: ['工程物理', '物理应用'],
            techStack: '物理工程/核技术/光学工程',
            jobs: ['工程物理师', '核技术员', '光学工程师'],
            learningResources: ['物理平台', '核技术教程'],
            certificates: ['工程物理认证', '核技术认证'],
            competitions: ['物理竞赛', '核技术大赛'],
            gradSchools: ['工程物理', '物理学', '核技术'],
            civilJobs: ['物理工程岗', '核技术岗', '技术岗']
        },
        '航空航天工程': {
            coreSkills: ['航空航天', '飞行器设计'],
            techStack: '飞行器设计/航空技术/航天技术',
            jobs: ['航空航天工程师', '飞行器设计师', '航空技术员'],
            learningResources: ['航空航天平台', '飞行器设计教程'],
            certificates: ['航空航天工程师认证', '飞行器设计认证'],
            competitions: ['航空航天竞赛', '飞行器设计大赛'],
            gradSchools: ['航空航天工程', '飞行器设计', '航空技术'],
            civilJobs: ['航空航天岗', '航空管理岗', '技术岗']
        },
        '飞行器设计与工程': {
            coreSkills: ['飞行器设计', '航空技术'],
            techStack: '飞行器设计/航空工程/航天技术',
            jobs: ['飞行器设计师', '航空航天工程师', '航空技术员'],
            learningResources: ['飞行器设计平台', '航空教程'],
            certificates: ['飞行器设计认证', '航空航天认证'],
            competitions: ['飞行器设计竞赛', '航空创新大赛'],
            gradSchools: ['飞行器设计与工程', '航空航天工程', '航空技术'],
            civilJobs: ['飞行器设计岗', '航空管理岗', '技术岗']
        },
        '飞行器制造工程': {
            coreSkills: ['飞行器制造', '航空技术'],
            techStack: '飞行器制造/航空工程/制造技术',
            jobs: ['飞行器制造工程师', '航空制造', '制造工程师'],
            learningResources: ['飞行器制造平台', '制造教程'],
            certificates: ['飞行器制造认证', '航空制造认证'],
            competitions: ['飞行器制造竞赛', '航空制造大赛'],
            gradSchools: ['飞行器制造工程', '航空航天工程', '制造工程'],
            civilJobs: ['飞行器制造岗', '航空制造岗', '制造管理岗']
        },
        '飞行器环境与生命保障工程': {
            coreSkills: ['飞行器环境', '生命保障'],
            techStack: '飞行器环境/生命保障/航空技术',
            jobs: ['飞行器环境工程师', '生命保障工程师', '航空技术员'],
            learningResources: ['飞行器环境平台', '生命保障教程'],
            certificates: ['飞行器环境认证', '生命保障认证'],
            competitions: ['飞行器环境竞赛', '生命保障大赛'],
            gradSchools: ['飞行器环境与生命保障', '航空航天工程', '环境工程'],
            civilJobs: ['飞行器环境岗', '航空管理岗', '技术岗']
        },
        '飞行技术': {
            coreSkills: ['飞行技术', '航空驾驶'],
            techStack: '飞行驾驶/航空技术/飞行管理',
            jobs: ['飞行员', '飞行管理', '航空技术员'],
            learningResources: ['飞行平台', '驾驶教程'],
            certificates: ['飞行员执照', '飞行管理认证'],
            competitions: ['飞行竞赛', '航空技术大赛'],
            gradSchools: ['飞行技术', '航空技术', '航空航天'],
            civilJobs: ['飞行员', '航空管理岗', '飞行管理岗']
        },
        '城乡规划': {
            coreSkills: ['城市规划', '设计原理'],
            techStack: '城市规划设计/CAD/SketchUp/GIS',
            jobs: ['城市规划师', '建筑设计师', '景观设计师'],
            learningResources: ['城市规划平台', '设计网站'],
            certificates: ['城市规划师认证', '建筑师认证'],
            competitions: ['城市规划竞赛', '建筑设计大赛'],
            gradSchools: ['城市规划', '建筑学', '风景园林'],
            civilJobs: ['城市规划岗', '建设管理岗', '自然资源管理岗']
        },
        '经济学': {
            coreSkills: ['经济理论', '数据分析'],
            techStack: '计量经济学/统计分析/金融分析',
            jobs: ['经济分析师', '金融分析师', '市场研究员'],
            learningResources: ['经济数据库', '统计分析平台'],
            certificates: ['经济分析师认证', '证券从业资格'],
            competitions: ['经济学竞赛', '案例分析大赛'],
            gradSchools: ['经济学', '金融学', '应用经济学'],
            civilJobs: ['经济管理岗', '财政岗', '市场监管岗']
        },
        '日语': {
            coreSkills: ['日语语言', '翻译技能'],
            techStack: '日语翻译/商务日语/语言教学',
            jobs: ['日语翻译', '日语教师', '外贸专员'],
            learningResources: ['日语学习网站', '翻译练习平台'],
            certificates: ['日语能力测试N1/N2', '翻译资格证'],
            competitions: ['日语演讲比赛', '翻译大赛'],
            gradSchools: ['日语语言文学', '翻译学', '日语教育'],
            civilJobs: ['外事岗', '翻译岗', '外贸管理岗']
        },
        '应用物理学': {
            coreSkills: ['物理理论', '应用技术'],
            techStack: '物理实验/材料科学/光电技术',
            jobs: ['物理工程师', '材料工程师', '光电工程师'],
            learningResources: ['物理实验平台', '材料科学教程'],
            certificates: ['物理工程师认证', '材料工程师认证'],
            competitions: ['物理竞赛', '实验技能大赛'],
            gradSchools: ['应用物理学', '物理学', '材料物理'],
            civilJobs: ['物理技术岗', '材料管理岗', '光电技术岗']
        },
        '美术学': {
            coreSkills: ['美术理论', '绘画技能'],
            techStack: '绘画技法/艺术创作/美术史论',
            jobs: ['美术教师', '艺术评论', '美术馆管理'],
            learningResources: ['美术平台', '艺术创作网站'],
            certificates: ['教师资格证', '美术师认证'],
            competitions: ['美术作品大赛', '艺术创作竞赛'],
            gradSchools: ['美术学', '美术教育', '艺术学'],
            civilJobs: ['美术教师岗', '文化管理岗', '艺术管理岗']
        },
        '历史学': {
            coreSkills: ['历史研究', '文献分析'],
            techStack: '史料研究/考古学/历史文献',
            jobs: ['历史研究员', '历史教师', '文物管理'],
            learningResources: ['历史数据库', '文献研究平台'],
            certificates: ['教师资格证', '文物从业资格'],
            competitions: ['历史研究竞赛', '文献分析大赛'],
            gradSchools: ['历史学', '考古学', '中国古代史'],
            civilJobs: ['历史研究岗', '教育岗', '文物管理岗']
        },
        '哲学': {
            coreSkills: ['哲学理论', '逻辑思维'],
            techStack: '哲学研究/逻辑学/伦理学',
            jobs: ['哲学研究员', '哲学教师', '文化研究'],
            learningResources: ['哲学数据库', '逻辑学教程'],
            certificates: ['教师资格证', '哲学认证'],
            competitions: ['哲学论文竞赛', '逻辑学竞赛'],
            gradSchools: ['哲学', '逻辑学', '宗教学'],
            civilJobs: ['哲学研究岗', '教育岗', '文化管理岗']
        }
    };
    
    return majorDatabase[major] || {
        coreSkills: ['专业基础知识', '专业技能'],
        techStack: '行业主流技术',
        jobs: ['相关岗位', '专业岗位', '技术岗位'],
        learningResources: ['专业学习平台', '行业资源'],
        certificates: ['专业相关证书', '职业资格证'],
        competitions: ['专业竞赛', '学科竞赛'],
        gradSchools: ['本专业', '相关专业', '交叉学科'],
        civilJobs: ['专业相关岗', '管理岗', '技术岗']
    };
}

function getDefaultResponse(userMessage, userInfo) {
    var major = userInfo.major || '计算机科学与技术';
    var grade = userInfo.grade || 'freshman';
    
    var gradeLabels = {
        freshman: '大一',
        sophomore: '大二',
        junior: '大三',
        senior: '大四'
    };
    
    var majorInfo = getMajorInfo(major);
    
    var responses = [
        '您的问题很有深度！作为' + major + '专业的学生，让我从职业规划的角度给您一些建议：\n\n首先，建议您明确自己的目标和方向。可以通过测评了解自己的兴趣和优势，然后结合' + majorInfo.coreSkills[0] + '等专业背景制定学习计划。\n\n其次，要注重实践经验的积累。无论是就业还是考研，' + majorInfo.jobs[0] + '等岗位的实际项目经验都非常重要。\n\n最后，保持学习的热情和好奇心，持续提升自己。\n\n您还有其他具体问题吗？',
        '感谢您的提问！作为' + gradeLabels[grade] + '的' + major + '专业学生，我可以给出以下建议：\n\n1. **了解自己**：通过测评明确自己的兴趣和能力\n2. **明确目标**：确定发展方向（就业/考研/考公）\n3. **制定计划**：分阶段规划' + majorInfo.coreSkills[0] + '的学习和实践\n4. **持续行动**：按计划执行，定期复盘调整\n\n如果您能告诉我更多具体情况，我可以给出更针对性的建议！',
        '很高兴为您解答！\n\n作为' + major + '专业学生，职业规划是一个动态过程，需要根据实际情况不断调整。我的建议是：\n\n【短期】打好' + majorInfo.coreSkills[0] + '基础，掌握' + majorInfo.techStack + '等核心技能\n【中期】积累' + majorInfo.jobs[0] + '等岗位经验，提升能力\n【长期】明确' + majorInfo.jobs[1] + '等发展方向，实现目标\n\n您现在最困惑的是哪方面呢？可以告诉我您的具体情况，我来帮您分析！'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// 格式化消息（支持换行和列表）
function formatMessage(message) {
    // 处理换行
    message = message.replace(/\n/g, '<br>');
    // 处理列表
    message = message.replace(/【([^】]+)】/g, '<strong>【$1】</strong>');
    return '<p>' + message + '</p>';
}

// 转义HTML
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 获取当前时间
function getCurrentTime() {
    var now = new Date();
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
}

// 滚动到底部
function scrollToBottom() {
    setTimeout(function() {
        var messages = document.getElementById('ai-messages');
        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }
    }, 100);
}

// 发送AI消息
async function sendAIMessage() {
    var input = document.getElementById('ai-input');
    if (!input) return;
    
    var message = input.value.trim();
    if (!message) return;
    
    // 添加用户消息
    addUserMessage(message);
    
    // 清空输入框
    input.value = '';
    
    // 显示打字指示器
    showTypingIndicator();
    
    // AI思考和回复
    setTimeout(async function() {
        hideTypingIndicator();
        var response = await getAIResponse(message);
        addAIMessage(response);
    }, 500);
}

// 显示打字指示器
function showTypingIndicator() {
    var messagesContainer = document.getElementById('ai-messages');
    if (!messagesContainer) return;
    
    var typingMsg = document.createElement('div');
    typingMsg.className = 'ai-message ai-message-ai';
    typingMsg.id = 'typing-indicator';
    typingMsg.innerHTML = 
        '<div class="ai-message-content">' +
        '<div class="ai-typing-indicator">' +
        '<span></span><span></span><span></span>' +
        '</div>' +
        '</div>';
    
    messagesContainer.appendChild(typingMsg);
    scrollToBottom();
}

// 隐藏打字指示器
function hideTypingIndicator() {
    var typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 页面加载时初始化主题
window.onload = function() {
    // 应用保存的主题
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
};