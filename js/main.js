var currentQuestion = 0;
var answers = [];
var selectedQuestions = []; // 当前测评使用的题目

// 专业分类：用于题目适配
var majorCategoryMap = {
    '计算机科学与技术':'tech','软件工程':'tech','数据科学与大数据技术':'tech',
    '人工智能':'tech','电子信息工程':'tech','通信工程':'tech','电气工程及其自动化':'tech',
    '自动化':'tech','机械设计制造及其自动化':'tech','土木工程':'tech','建筑学':'design',
    '城乡规划':'design','金融学':'business','会计学':'business','工商管理':'business',
    '市场营销':'business','人力资源管理':'business','国际经济与贸易':'business',
    '经济学':'business','财务管理':'business','法学':'law','社会工作':'social',
    '行政管理':'social','汉语言文学':'arts','新闻学':'media','广告学':'design',
    '英语':'lang','日语':'lang','数学与应用数学':'science','应用物理学':'science',
    '化学':'science','生物科学':'science','环境工程':'science','临床医学':'medical',
    '护理学':'medical','药学':'medical','心理学':'social','教育学':'education',
    '学前教育':'education','体育教育':'education','美术学':'design','视觉传达设计':'design',
    '数字媒体艺术':'design','音乐学':'arts','历史学':'arts','哲学':'arts',
    '社会学':'social','统计学':'science','物流管理':'business','旅游管理':'business'
};

// 扩展题库：100道题，每维度约17题，含反向题和专业适配题
// reverse: true = 反向计分题（选了5分实际得1分）
// majorCategory: 专业适配类别，为空则通用所有专业
// direction: 题目适配的方向，['job','graduate','public']或为空表示通用
var questionBank = [
    // ===== R 实际型 (17题) =====
    // R 通用（适配所有方向）
    { dimension: 'R', text: '我喜欢动手组装、修理电子产品或手工物件', reverse: false },
    { dimension: 'R', text: '我更愿意做有具体实物产出的实操类任务', reverse: false },
    { dimension: 'R', text: '我擅长拆解和解决机械、设备类的实际问题', reverse: false },
    { dimension: 'R', text: '我偏好户外活动多于室内伏案工作', reverse: false },
    { dimension: 'R', text: '我享受使用工具完成实际工作的过程', reverse: false },
    // R 就业方向
    { dimension: 'R', text: '我对动植物养护、手工制作等活动感兴趣', reverse: false, direction: 'job' },
    { dimension: 'R', text: '我能熟练使用各种维修工具和仪器设备', reverse: false, direction: 'job' },
    { dimension: 'R', text: '我喜欢自己动手解决生活中的小问题', reverse: false, direction: 'job' },
    // R 考研方向
    { dimension: 'R', text: '我享受建造或制作东西的过程', reverse: false, direction: 'graduate' },
    { dimension: 'R', text: '我更喜欢用实际操作来学习新知识', reverse: false, direction: 'graduate' },
    // R 考公方向
    { dimension: 'R', text: '我注重实践操作能力的培养', reverse: false, direction: 'public' },
    // R 反向题（通用）
    { dimension: 'R', text: '我更喜欢思考抽象问题而不是动手操作', reverse: true },
    { dimension: 'R', text: '我倾向于用软件模拟而不是实际搭建', reverse: true },
    { dimension: 'R', text: '我不喜欢任何体力劳动或手工操作', reverse: true },
    // R 技术类专业
    { dimension: 'R', text: '我享受debug和修复bug的过程', reverse: false, majorCategory: 'tech', direction: 'job' },
    { dimension: 'R', text: '我愿意花时间搭建开发环境、配置工具链', reverse: false, majorCategory: 'tech', direction: 'job' },
    { dimension: 'R', text: '我喜欢自己组装电脑或配置硬件', reverse: false, majorCategory: 'tech' },
    // R 设计类专业
    { dimension: 'R', text: '我喜欢绘制草图、制作实体模型', reverse: false, majorCategory: 'design' },

    // ===== I 研究型 (17题) =====
    // I 通用
    { dimension: 'I', text: '我喜欢探索事物背后的原理，做逻辑分析与推导', reverse: false },
    { dimension: 'I', text: '我乐于查阅文献、研究学术问题与新兴技术', reverse: false },
    { dimension: 'I', text: '遇到难题时我习惯先收集数据再得出结论', reverse: false },
    { dimension: 'I', text: '我对科学实验、数据分析类工作有浓厚兴趣', reverse: false },
    // I 就业方向
    { dimension: 'I', text: '我享受解决复杂问题带来的成就感', reverse: false, direction: 'job' },
    { dimension: 'I', text: '我愿意深入研究一个领域直到成为专家', reverse: false, direction: 'job' },
    // I 考研方向（重点）
    { dimension: 'I', text: '我习惯用数学或统计方法验证我的想法', reverse: false, direction: 'graduate' },
    { dimension: 'I', text: '我对学术论文和技术文档有较强的阅读理解能力', reverse: false, direction: 'graduate' },
    { dimension: 'I', text: '我喜欢提出假设并验证它', reverse: false, direction: 'graduate' },
    { dimension: 'I', text: '我享受钻研难题直到找到答案', reverse: false, direction: 'graduate' },
    // I 考公方向
    { dimension: 'I', text: '我注重数据分析和逻辑推理能力', reverse: false, direction: 'public' },
    // I 反向题
    { dimension: 'I', text: '我更关注how而不是why', reverse: true },
    { dimension: 'I', text: '我很少追根究底，差不多就行', reverse: true },
    { dimension: 'I', text: '我不喜欢复杂的理论和抽象概念', reverse: true },
    // I 学术类专业
    { dimension: 'I', text: '我愿意为发表论文投入大量时间精力', reverse: false, majorCategory: 'science', direction: 'graduate' },
    { dimension: 'I', text: '我对科研项目有强烈的兴趣', reverse: false, majorCategory: 'science', direction: 'graduate' },
    // I 技术类专业
    { dimension: 'I', text: '我喜欢研究新技术和算法原理', reverse: false, majorCategory: 'tech' },

    // ===== A 艺术型 (17题) =====
    // A 通用
    { dimension: 'A', text: '我喜欢通过创意设计、文字或艺术形式表达想法', reverse: false },
    { dimension: 'A', text: '我更愿意做有创造性、不按固定流程的工作', reverse: false },
    { dimension: 'A', text: '我对审美、排版、视觉呈现比较敏感', reverse: false },
    { dimension: 'A', text: '我经常产生独特的想法并想付诸实践', reverse: false },
    // A 就业方向
    { dimension: 'A', text: '我享受艺术创作和灵感迸发的过程', reverse: false, direction: 'job' },
    { dimension: 'A', text: '我善于用非传统方式解决问题', reverse: false, direction: 'job' },
    // A 考研方向
    { dimension: 'A', text: '我喜欢独立工作而不是按指令完成任务', reverse: false, direction: 'graduate' },
    { dimension: 'A', text: '我对色彩和构图有天生的敏感度', reverse: false, direction: 'graduate' },
    // A 考公方向
    { dimension: 'A', text: '我享受音乐、绘画或写作等艺术活动', reverse: false, direction: 'public' },
    { dimension: 'A', text: '我喜欢尝试新的艺术形式和创作方法', reverse: false, direction: 'public' },
    // A 反向题
    { dimension: 'A', text: '我更喜欢有明确步骤的工作任务', reverse: true },
    { dimension: 'A', text: '我更注重结果而不是过程的美感', reverse: true },
    { dimension: 'A', text: '我对艺术和创意活动缺乏兴趣', reverse: true },
    // A 设计类专业
    { dimension: 'A', text: '我能接受为追求完美效果而反复修改作品', reverse: false, majorCategory: 'design', direction: 'job' },
    { dimension: 'A', text: '我对UI/UX设计有浓厚兴趣', reverse: false, majorCategory: 'design', direction: 'job' },
    // A 语言类专业
    { dimension: 'A', text: '我喜欢用文字表达复杂的思想', reverse: false, majorCategory: 'lang' },

    // ===== S 社会型 (17题) =====
    // S 通用
    { dimension: 'S', text: '我乐于倾听和帮助他人解决学习或生活中的问题', reverse: false },
    { dimension: 'S', text: '我喜欢参与志愿服务、社群运营类的活动', reverse: false },
    { dimension: 'S', text: '我擅长和不同的人沟通协作，愿意从事服务类工作', reverse: false },
    // S 就业方向
    { dimension: 'S', text: '我享受教导和传授知识给他人的过程', reverse: false, direction: 'job' },
    { dimension: 'S', text: '我关心社会问题，愿意为公共利益出力', reverse: false, direction: 'job' },
    // S 考研方向
    { dimension: 'S', text: '我擅长调解冲突、维护团队和谐', reverse: false, direction: 'graduate' },
    // S 考公方向（重点）
    { dimension: 'S', text: '我更喜欢与人互动而不是独自工作', reverse: false, direction: 'public' },
    { dimension: 'S', text: '我愿意倾听他人的倾诉并给予支持', reverse: false, direction: 'public' },
    { dimension: 'S', text: '我享受帮助他人成长和进步的过程', reverse: false, direction: 'public' },
    { dimension: 'S', text: '我善于理解他人的处境和感受', reverse: false, direction: 'public' },
    // S 反向题
    { dimension: 'S', text: '我更喜欢独立完成工作而不是团队协作', reverse: true },
    { dimension: 'S', text: '我不太擅长处理复杂的人际关系', reverse: true },
    { dimension: 'S', text: '我对帮助他人没有太大兴趣', reverse: true },
    // S 教育/心理类专业
    { dimension: 'S', text: '我能够耐心倾听并理解他人的情绪和需求', reverse: false, majorCategory: 'social' },
    { dimension: 'S', text: '我对心理咨询和辅导有兴趣', reverse: false, majorCategory: 'social' },
    // S 医学类专业
    { dimension: 'S', text: '我愿意花时间关心和照顾病人', reverse: false, majorCategory: 'medical' },

    // ===== E 企业型 (17题) =====
    // E 通用
    { dimension: 'E', text: '我喜欢带领团队完成任务，承担组织与决策工作', reverse: false },
    { dimension: 'E', text: '我对商业运营、市场推广、创业类话题感兴趣', reverse: false },
    // E 就业方向（重点）
    { dimension: 'E', text: '我愿意挑战有业绩目标、能快速获得回报的工作', reverse: false, direction: 'job' },
    { dimension: 'E', text: '我善于说服他人接受我的观点和建议', reverse: false, direction: 'job' },
    { dimension: 'E', text: '我享受竞争和冒险带来的刺激感', reverse: false, direction: 'job' },
    { dimension: 'E', text: '我对权力和影响力有较强的渴望', reverse: false, direction: 'job' },
    { dimension: 'E', text: '我善于发现商机并付诸行动', reverse: false, direction: 'job' },
    // E 考研方向
    { dimension: 'E', text: '我愿意承担管理职责，带领团队达成目标', reverse: false, direction: 'graduate' },
    // E 考公方向
    { dimension: 'E', text: '我享受制定战略和实现目标的过程', reverse: false, direction: 'public' },
    { dimension: 'E', text: '我善于谈判和达成商业合作', reverse: false, direction: 'public' },
    // E 反向题
    { dimension: 'E', text: '我更倾向于稳定的工作环境而不愿冒险', reverse: true },
    { dimension: 'E', text: '我更愿意做执行者而不是决策者', reverse: true },
    { dimension: 'E', text: '我对商业和管理没有兴趣', reverse: true },
    // E 商科类专业
    { dimension: 'E', text: '我愿意为创业梦想承担风险', reverse: false, majorCategory: 'business', direction: 'job' },
    { dimension: 'E', text: '我对市场营销和品牌建设有热情', reverse: false, majorCategory: 'business', direction: 'job' },
    // E 管理类专业
    { dimension: 'E', text: '我喜欢分析市场趋势并做出商业决策', reverse: false, majorCategory: 'business' },

    // ===== C 常规型 (17题) =====
    // C 通用
    { dimension: 'C', text: '我喜欢按规范流程做事，确保细节准确无误', reverse: false },
    { dimension: 'C', text: '我擅长整理资料、数据统计与事务性工作', reverse: false },
    { dimension: 'C', text: '我更偏好稳定、规则清晰的工作环境', reverse: false },
    { dimension: 'C', text: '我习惯按照计划严格执行任务', reverse: false },
    // C 就业方向
    { dimension: 'C', text: '我注重工作的准确性和完整性', reverse: false, direction: 'job' },
    // C 考研方向
    { dimension: 'C', text: '我喜欢处理数字、报表、数据核对工作', reverse: false, direction: 'graduate' },
    { dimension: 'C', text: '我习惯将工作安排得井井有条', reverse: false, direction: 'graduate' },
    // C 考公方向（重点）
    { dimension: 'C', text: '我愿意遵守规章制度而不是打破规则', reverse: false, direction: 'public' },
    { dimension: 'C', text: '我注重工作的条理性和系统性', reverse: false, direction: 'public' },
    { dimension: 'C', text: '我擅长处理行政事务和文书工作', reverse: false, direction: 'public' },
    { dimension: 'C', text: '我注重文件的规范性和程序的合规性', reverse: false, direction: 'public' },
    { dimension: 'C', text: '我习惯于按部就班地完成任务', reverse: false, direction: 'public' },
    // C 反向题
    { dimension: 'C', text: '我更喜欢灵活自由的工作方式', reverse: true },
    { dimension: 'C', text: '我经常打破常规寻找新方法', reverse: true },
    { dimension: 'C', text: '我对规则和流程感到束缚', reverse: true },
    // C 医疗/法律类专业
    { dimension: 'C', text: '我愿意严格遵守职业规范和操作流程', reverse: false, majorCategory: 'medical' },
    { dimension: 'C', text: '我注重法律条文和规章制度的学习', reverse: false, majorCategory: 'law', direction: 'public' }
];

// 方向权重配置：影响不同维度的题目数量和推荐权重
var directionWeightConfig = {
    job: { R: 1.2, I: 0.9, A: 1.0, S: 0.8, E: 1.3, C: 0.9 },
    graduate: { R: 0.8, I: 1.4, A: 0.9, S: 0.8, E: 0.7, C: 1.2 },
    public: { R: 0.7, I: 0.8, A: 0.7, S: 1.3, E: 1.0, C: 1.5 },
    undecided: { R: 1.0, I: 1.0, A: 1.0, S: 1.0, E: 1.0, C: 1.0 }
};

// 根据专业和方向选择题目（100题题库，严格无重复）
// 逻辑：
// 1. 如果用户选择了明确方向（就业/考研/考公），只选择该方向的题目（含通用题）
// 2. 如果用户选择未确定，选择所有三个方向的题目
function selectQuestions(major, directions) {
    var category = majorCategoryMap[major] || 'general';
    var totalNeeded = 20;
    var dimensions = ['R', 'I', 'A', 'S', 'E', 'C'];

    // 确定可用的方向列表
    var allowedDirections = [];
    var isUndecided = directions.length === 0 || directions.includes('undecided');
    
    if (isUndecided) {
        // 未确定：使用所有三个方向
        allowedDirections = ['job', 'graduate', 'public'];
    } else {
        // 确定方向：只使用用户选择的方向
        allowedDirections = directions;
    }

    // 计算方向权重
    var weights = { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 };
    allowedDirections.forEach(function(dir) {
        var dirWeights = directionWeightConfig[dir] || directionWeightConfig.undecided;
        for (var d in dirWeights) {
            weights[d] = weights[d] * dirWeights[d];
        }
    });

    // 严格计算每个维度的题目数量（确保总题数20，每维度至少3题）
    var totalWeight = Object.values(weights).reduce(function(a, b) { return a + b; }, 0);
    var dimCounts = {};
    
    // 先按权重分配基础题数
    dimensions.forEach(function(dim) {
        dimCounts[dim] = Math.max(3, Math.round((weights[dim] / totalWeight) * totalNeeded));
    });

    // 强制调整为20题，确保每维度3-4题
    var sum = Object.values(dimCounts).reduce(function(a, b) { return a + b; }, 0);
    var diff = sum - totalNeeded;
    
    // 调整策略：优先调整权重较高的维度
    if (diff > 0) {
        // 需要减少题目，从权重较低的维度开始
        var sortedDims = dimensions.slice().sort(function(a, b) { return weights[a] - weights[b]; });
        for (var i = 0; i < diff && i < sortedDims.length; i++) {
            if (dimCounts[sortedDims[i]] > 3) {
                dimCounts[sortedDims[i]]--;
            }
        }
    } else if (diff < 0) {
        // 需要增加题目，向权重较高的维度增加
        var sortedDims = dimensions.slice().sort(function(a, b) { return weights[b] - weights[a]; });
        for (var i = 0; i < Math.abs(diff) && i < sortedDims.length; i++) {
            dimCounts[sortedDims[i]]++;
        }
    }

    // 最终验证总数
    sum = Object.values(dimCounts).reduce(function(a, b) { return a + b; }, 0);
    if (sum !== totalNeeded) {
        // 微调最后一个维度
        dimCounts[dimensions[dimensions.length - 1]] += totalNeeded - sum;
    }

    // 开始选择题目，确保无重复
    var selected = [];
    var usedTexts = new Set(); // 用题目文本作为唯一标识，确保无重复

    dimensions.forEach(function(dim) {
        var count = dimCounts[dim] || 3;
        
        // 筛选该维度可用的题目：
        // 1. 方向匹配：题目无方向标签 或 题目方向在允许列表中
        // 2. 专业匹配（优先）
        // 3. 未被使用
        var availableQuestions = questionBank.filter(function(q) {
            if (q.dimension !== dim || usedTexts.has(q.text)) {
                return false;
            }
            // 检查方向匹配
            if (!q.direction) {
                // 无方向标签的题目通用
                return true;
            }
            // 有方向标签的题目必须在允许列表中
            return allowedDirections.includes(q.direction);
        });

        // 按优先级排序：专业适配 + 方向匹配优先
        availableQuestions.sort(function(a, b) {
            var aScore = 0;
            var bScore = 0;
            
            // 专业匹配加分
            if (a.majorCategory === category) aScore += 2;
            if (b.majorCategory === category) bScore += 2;
            
            // 方向匹配加分（非通用题）
            if (a.direction) aScore += 1;
            if (b.direction) bScore += 1;
            
            return bScore - aScore;
        });

        // 随机打乱同优先级的题目
        var highPriority = availableQuestions.filter(function(q) { 
            return q.majorCategory === category && q.direction; 
        });
        var midPriority = availableQuestions.filter(function(q) { 
            return (q.majorCategory === category || q.direction) && !(q.majorCategory === category && q.direction); 
        });
        var lowPriority = availableQuestions.filter(function(q) { 
            return !q.majorCategory && !q.direction; 
        });
        
        // 打乱各自的顺序
        highPriority.sort(function() { return Math.random() - 0.5; });
        midPriority.sort(function() { return Math.random() - 0.5; });
        lowPriority.sort(function() { return Math.random() - 0.5; });
        
        var shuffled = [...highPriority, ...midPriority, ...lowPriority];

        // 选择所需数量
        var toSelect = shuffled.slice(0, count);
        toSelect.forEach(function(q) {
            selected.push(q);
            usedTexts.add(q.text);
        });
    });

    // 最终打乱所有题目的顺序
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

// 专业 × 方向 → 技能映射（基于互联网大数据比对，每专业每方向4-6项核心技能）
// undecided = 暂未确定，展示该专业基础通用技能
var majorDirectionSkillMap = {
  '计算机科学与技术':{
    job:['编程(Python/Java/C++)','数据结构与算法','项目实战经验','面试刷题(LeetCode)','系统设计','GitHub开源'],
    graduate:['高等数学','数据结构','操作系统','计算机网络','考研英语','政治'],
    public:['行测(数量/言语)','申论写作','时政热点','逻辑推理','公共基础','计算机基础'],
    undecided:['编程基础(Python)','数据结构','计算机网络','数据库','操作系统','GitHub']
  },
  '软件工程':{
    job:['面向对象编程','软件测试','版本控制(Git)','敏捷开发','需求分析','Spring/React'],
    graduate:['数据结构','操作系统','软件工程理论','考研英语','政治','高等数学'],
    public:['行测(数量/言语)','申论写作','时政热点','逻辑推理','公共基础','信息技术基础'],
    undecided:['编程基础(Java/Python)','数据结构','软件工程概论','数据库基础','Git','需求分析基础']
  },
  '数据科学与大数据技术':{
    job:['数据清洗(ETL)','机器学习/Python','SQL/Hive','数据可视化(Tableau)','统计学','Spark/Flink'],
    graduate:['高等数学','概率论','机器学习','考研英语','政治','数据结构'],
    public:['行测(数量/资料分析)','申论写作','时政热点','逻辑推理','公共基础','数据思维'],
    undecided:['Python基础','SQL','统计学基础','数据处理','数据可视化入门','机器学习入门']
  },
  '人工智能':{
    job:['深度学习(PyTorch)','自然语言处理','计算机视觉','Python','数学基础','模型部署'],
    graduate:['高等数学','线性代数','机器学习','概率论','考研英语','政治'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','科技常识'],
    undecided:['Python','高等数学','线性代数','机器学习入门','数据结构','算法基础']
  },
  '电子信息工程':{
    job:['电路设计(Altium)','嵌入式开发(STM32)','信号处理','通信协议','C/C++','硬件调试'],
    graduate:['信号与系统','数字信号处理','通信原理','考研英语','政治','高等数学'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','电工基础'],
    undecided:['电路基础','C语言','模拟电子技术','数字电子技术','信号与系统基础','单片机入门']
  },
  '通信工程':{
    job:['通信协议(5G/LTE)','网络规划','信号处理','射频技术','光纤通信','Python'],
    graduate:['通信原理','信号与系统','数字信号处理','考研英语','政治','高等数学'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','信息技术基础'],
    undecided:['通信原理基础','信号与系统','C语言','计算机网络','电子电路','高等数学']
  },
  '电气工程及其自动化':{
    job:['PLC编程','电路设计','电机控制','供配电设计','AutoCAD电气','传感器技术'],
    graduate:['电路理论','电机学','电力系统分析','考研英语','政治','高等数学'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','电工基础'],
    undecided:['自动控制基础','C语言','传感器基础','电路基础','高等数学','PLC入门']
  },
  '自动化':{
    job:['控制理论','PLC/SCADA','传感器技术','机器人(ROS)','嵌入式系统','MATLAB'],
    graduate:['自动控制原理','现代控制理论','考研英语','政治','高等数学','线性代数'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','自动化基础'],
    undecided:['自动控制基础','C语言','传感器基础','电路基础','高等数学','PLC入门']
  },
  '机械设计制造及其自动化':{
    job:['CAD/SolidWorks','机械设计','材料力学','数控编程','有限元分析','工艺设计'],
    graduate:['机械原理','材料力学','机械设计','考研英语','政治','高等数学'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','机械基础'],
    undecided:['机械制图','CAD','材料力学基础','机械原理','高等数学','金工实习']
  },
  '土木工程':{
    job:['结构力学','AutoCAD','工程造价','施工管理','BIM建模(Revit)','测量学'],
    graduate:['结构力学','混凝土结构','土力学','考研英语','政治','高等数学'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','工程管理'],
    undecided:['结构力学基础','AutoCAD','工程测量','材料力学','混凝土结构基础','工程管理概论']
  },
  '建筑学':{
    job:['建筑设计','SketchUp/Rhino','空间规划','BIM建模','建筑史','效果图(VRay)'],
    graduate:['建筑史','建筑设计理论','城市规划','考研英语','政治','快题设计'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','城建规划'],
    undecided:['建筑概论','手绘基础','CAD/SketchUp','中外建筑史','空间设计','美术基础']
  },
  '城乡规划':{
    job:['城市规划','GIS','交通规划','环境设计','AutoCAD','空间分析'],
    graduate:['城市规划原理','区域规划','GIS','考研英语','政治','快题设计'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','城建规划'],
    undecided:['城市规划概论','GIS基础','CAD','设计基础','地理信息系统','城市社会学']
  },
  '金融学':{
    job:['财务分析','投资管理','估值建模(DCF)','Excel高级应用','CFA/FRM基础','Wind/Bloomberg'],
    graduate:['微观经济学','宏观经济学','金融学','数学三','考研英语','政治'],
    public:['行测(数量/资料分析)','申论写作','经济金融基础','时政热点','逻辑推理','公共基础'],
    undecided:['经济学基础','会计学基础','Excel','数据分析','金融市场基础','统计学']
  },
  '会计学':{
    job:['财务报表','税务筹划','审计实务','Excel','会计准则','财务软件(用友/金蝶)'],
    graduate:['会计学','财务管理','管理学','考研英语','政治','数学三'],
    public:['行测(数量/资料分析)','申论写作','会计基础','时政热点','逻辑推理','公共基础'],
    undecided:['会计学原理','财务管理基础','Excel','税法入门','审计基础','经济法']
  },
  '工商管理':{
    job:['项目管理','数据分析','沟通协调','商业策划','PPT演示','团队管理'],
    graduate:['管理学','经济学','运筹学','考研英语','政治','数学三'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','管理常识'],
    undecided:['管理学原理','经济学基础','数据分析','沟通表达','市场营销基础','组织行为学']
  },
  '市场营销':{
    job:['市场调研','品牌策划','数据分析(Excel/SQL)','文案撰写','新媒体运营','活动策划'],
    graduate:['营销管理','消费者行为','管理学','考研英语','政治','数学三'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','经济基础'],
    undecided:['市场营销学','消费者心理','数据分析','文案写作','市场调研','新媒体运营基础']
  },
  '人力资源管理':{
    job:['招聘面试','绩效管理(KPI/OKR)','劳动法','沟通培训','HR系统(钉钉/飞书)','组织发展'],
    graduate:['管理学','组织行为学','人力资源','考研英语','政治','数学三'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','人事管理'],
    undecided:['管理学','组织行为学','劳动法基础','沟通协调','招聘基础','绩效管理入门']
  },
  '国际经济与贸易':{
    job:['英语商务','外贸流程','报关报检','跨境支付','贸易谈判','供应链管理'],
    graduate:['国际贸易理论','经济学','国际金融','考研英语','政治','数学三'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','国际常识'],
    undecided:['经济学基础','国际贸易实务','英语','商务沟通','国际金融基础','市场营销']
  },
  '经济学':{
    job:['宏观分析','微观分析','计量分析(Stata/SPSS)','政策研究','Excel','行业研究报告'],
    graduate:['微观经济学','宏观经济学','计量经济学','数学三','考研英语','政治'],
    public:['行测(数量/资料分析)','申论写作','经济学基础','时政热点','逻辑推理','公共基础'],
    undecided:['微观经济学','宏观经济学','统计学','数学基础','计量经济学入门','经济法']
  },
  '财务管理':{
    job:['财务分析','预算管理','Excel','资金管理','税法基础','财务报表编制'],
    graduate:['财务管理','会计学','管理学','考研英语','政治','数学三'],
    public:['行测(数量/资料分析)','申论写作','财务基础','时政热点','逻辑推理','公共基础'],
    undecided:['会计学基础','财务管理','Excel','财务分析入门','税法基础','投资学基础']
  },
  '法学':{
    job:['法律检索','文书写作','案例分析','辩论技巧','法规解读','合同审查'],
    graduate:['法理学','民法学','刑法学','考研英语','政治','专业综合'],
    public:['行测(言语/判断)','申论写作','法律基础','时政热点','逻辑推理','公共基础'],
    undecided:['法理学基础','宪法学','民法学入门','刑法学入门','法律写作','案例分析']
  },
  '社会工作':{
    job:['个案工作','社区服务','心理咨询','社会调查','活动策划','沟通协调'],
    graduate:['社会工作理论','社会学','心理学','考研英语','政治','社会政策'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','社区治理'],
    undecided:['社会学概论','心理学基础','个案工作方法','沟通技巧','社区服务','社会调查']
  },
  '行政管理':{
    job:['公文写作','会议组织','档案管理','办公软件','沟通协调','行政流程'],
    graduate:['行政管理学','公共管理','政治学','考研英语','政治','管理学'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','行政管理'],
    undecided:['管理学原理','公共管理导论','公文写作','办公软件','政治学基础','沟通协调']
  },
  '汉语言文学':{
    job:['文案写作','文学鉴赏','编辑排版','新媒体运营','古文阅读','内容策划'],
    graduate:['文学理论','语言学','古代文学','考研英语','政治','文学综合'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','公文写作'],
    undecided:['现代汉语','古代文学','写作能力','文学鉴赏','语言学概论','编辑排版']
  },
  '新闻学':{
    job:['新闻采写','视频剪辑(PR/FCP)','新媒体运营','采访技巧','内容策划','数据分析'],
    graduate:['新闻传播理论','新闻史','传播学','考研英语','政治','新闻实务'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','舆论分析'],
    undecided:['新闻学概论','采访写作','传播学基础','新媒体认知','摄影基础','视频剪辑入门']
  },
  '广告学':{
    job:['创意策划','文案撰写','PS/AI设计','品牌策划','视频剪辑','媒介投放'],
    graduate:['广告学','传播学','营销学','考研英语','政治','设计理论'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','传播基础'],
    undecided:['广告学概论','创意设计基础','文案写作','市场调研','PS/AI基础','品牌策划入门']
  },
  '英语':{
    job:['英语口语','翻译(笔译/口译)','跨文化沟通','商务英语','写作','CAT工具'],
    graduate:['语言学','英美文学','翻译理论','二外','政治','英语综合'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','英语翻译'],
    undecided:['英语听说读写','翻译基础','英美文化','跨文化沟通','写作','商务英语入门']
  },
  '日语':{
    job:['日语口语','日语翻译','日本文化','商务日语','JLPT N1备考','CAT工具'],
    graduate:['日语语言学','日本文学','翻译理论','二外','政治','日语综合'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','日语翻译'],
    undecided:['日语听说读写','翻译基础','日本文化','语言表达','商务日语入门','英语基础']
  },
  '数学与应用数学':{
    job:['数学建模','MATLAB/Python','逻辑推理','统计分析','算法设计','数据挖掘'],
    graduate:['数学分析','高等代数','概率论','考研英语','政治','数学综合'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','数理分析'],
    undecided:['数学分析','高等代数','概率论','逻辑思维','数学建模入门','MATLAB基础']
  },
  '应用物理学':{
    job:['实验设计','MATLAB','数据分析','仪器操作','物理仿真','半导体基础'],
    graduate:['量子力学','电动力学','热力学','考研英语','政治','物理综合'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','科技常识'],
    undecided:['高等数学','力学','电磁学','实验方法','量子力学基础','MATLAB基础']
  },
  '化学':{
    job:['实验操作','仪器分析(HPLC/GC)','化学合成','实验室安全','数据处理','质量检测'],
    graduate:['有机化学','物理化学','分析化学','考研英语','政治','化学综合'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','化学基础'],
    undecided:['有机化学','无机化学','分析化学','物理化学','实验操作','仪器分析入门']
  },
  '生物科学':{
    job:['实验操作(PCR/电泳)','细胞培养','显微技术','数据分析','分子克隆','生物信息'],
    graduate:['生物化学','分子生物学','遗传学','考研英语','政治','生物综合'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','生物基础'],
    undecided:['生物化学','细胞生物学','遗传学','分子生物学','实验操作','数据分析']
  },
  '环境工程':{
    job:['环境监测','水处理工艺','固废处理','环评报告','AutoCAD','数据分析'],
    graduate:['环境工程原理','水污染控制','大气污染控制','考研英语','政治','高等数学'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','环保法规'],
    undecided:['环境科学概论','化学基础','工程制图','数据分析','水处理基础','环境监测']
  },
  '临床医学':{
    job:['临床诊断','医患沟通','病历书写','急救技能','影像判读','手术基础'],
    graduate:['内科学','外科学','病理学','考研英语','政治','医学综合'],
    public:['行测(判断/常识)','申论写作','时政热点','逻辑推理','公共基础','医学基础'],
    undecided:['人体解剖学','生理学','病理学','诊断学基础','药理学','医学伦理学']
  },
  '护理学':{
    job:['基础护理','急救技能','无菌操作','医患沟通','病例记录','仪器监护'],
    graduate:['护理学基础','内科护理','外科护理','考研英语','政治','护理综合'],
    public:['行测(判断/常识)','申论写作','时政热点','逻辑推理','公共基础','护理基础'],
    undecided:['护理学基础','人体解剖学','生理学','无菌技术','药理学基础','健康评估']
  },
  '药学':{
    job:['药物分析','药理学','制剂制备','GMP规范','仪器操作','注册申报'],
    graduate:['药理学','药物化学','药剂学','考研英语','政治','药学综合'],
    public:['行测(判断/常识)','申论写作','时政热点','逻辑推理','公共基础','药品法规'],
    undecided:['药理学基础','药物化学','药剂学','药物分析','有机化学','药事管理']
  },
  '心理学':{
    job:['心理咨询','量表测评','SPSS/R','实验设计','沟通技巧','案例分析'],
    graduate:['普通心理学','实验心理学','心理统计','考研英语','政治','心理学综合'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','心理常识'],
    undecided:['普通心理学','实验心理学','心理统计','沟通技巧','发展心理学','社会心理学']
  },
  '教育学':{
    job:['教学设计','课堂管理','PPT制作','教育心理学','课程开发','教学评估'],
    graduate:['教育学原理','教育心理学','中外教育史','考研英语','政治','教育综合'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','教育理论'],
    undecided:['教育学原理','心理学基础','教学设计','表达沟通','教育史','课程论基础']
  },
  '学前教育':{
    job:['幼儿活动设计','绘本教学','手工制作','音乐律动','保育技能','家长沟通'],
    graduate:['学前教育学','儿童心理学','幼儿园课程','考研英语','政治','教育综合'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','早教理论'],
    undecided:['学前教育学','儿童发展心理','艺术基础','活动设计','钢琴/声乐','保育基础']
  },
  '体育教育':{
    job:['运动训练','赛事裁判','体能教学','运动解剖','急救技能','体育管理'],
    graduate:['运动生理学','运动训练学','体育概论','考研英语','政治','体育综合'],
    public:['行测(判断/常识)','申论写作','时政热点','逻辑推理','公共基础','体育常识'],
    undecided:['运动解剖学','运动生理学','体育教学法','体能训练','运动训练学','体育心理学']
  },
  '美术学':{
    job:['手绘基础','色彩理论','素描','油画/国画','艺术史','创作能力'],
    graduate:['美术史','艺术概论','美术教育','考研英语','政治','专业创作'],
    public:['行测(判断/常识)','申论写作','时政热点','逻辑推理','公共基础','文化常识'],
    undecided:['素描','色彩','美术史','创作能力','速写','艺术概论']
  },
  '视觉传达设计':{
    job:['平面设计','PS/AI','版式设计','品牌设计','插画','动效设计'],
    graduate:['设计史','设计概论','视觉传达','考研英语','政治','专业设计'],
    public:['行测(判断/常识)','申论写作','时政热点','逻辑推理','公共基础','设计基础'],
    undecided:['设计基础','PS/AI','版式设计','色彩构成','字体设计','品牌设计入门']
  },
  '数字媒体艺术':{
    job:['视频剪辑','3D建模(Blender/C4D)','动画制作','UI设计','摄影','后期特效(AE)'],
    graduate:['数字媒体概论','影视理论','交互设计','考研英语','政治','专业创作'],
    public:['行测(判断/常识)','申论写作','时政热点','逻辑推理','公共基础','新媒体'],
    undecided:['数字媒体概论','PS','视频剪辑基础','摄影基础','UI设计入门','三维建模基础']
  },
  '音乐学':{
    job:['乐理知识','乐器演奏','视唱练耳','音乐史','作曲编曲','音乐教育'],
    graduate:['音乐史','和声学','曲式分析','考研英语','政治','音乐综合'],
    public:['行测(判断/常识)','申论写作','时政热点','逻辑推理','公共基础','文化常识'],
    undecided:['基本乐理','视唱练耳','音乐史','器乐基础','声乐基础','和声学入门']
  },
  '历史学':{
    job:['文献检索','史料分析','写作表达','批判思维','考古基础','文化传播'],
    graduate:['中国史','世界史','史学理论','考研英语','政治','历史综合'],
    public:['行测(言语/常识)','申论写作','时政热点','逻辑推理','公共基础','历史文化'],
    undecided:['中国通史','世界通史','文献检索','写作表达','史学理论','考古学基础']
  },
  '哲学':{
    job:['逻辑推理','文本分析','批判思维','论证写作','跨学科思考','教育培训'],
    graduate:['哲学原理','中哲史','西哲史','考研英语','政治','哲学综合'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','思辨能力'],
    undecided:['哲学导论','逻辑学','批判思维','文本分析','中国哲学','西方哲学']
  },
  '社会学':{
    job:['社会调查','SPSS/Stata','数据分析','问卷设计','田野研究','报告撰写'],
    graduate:['社会学理论','社会研究方法','社会统计','考研英语','政治','社会学综合'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','社会治理'],
    undecided:['社会学概论','社会调查方法','统计分析','批判思维','社会理论','SPSS基础']
  },
  '统计学':{
    job:['SPSS/R/Python','数据建模','假设检验','可视化(Tableau)','机器学习','SQL'],
    graduate:['概率论','数理统计','回归分析','考研英语','政治','统计综合'],
    public:['行测(数量/资料分析)','申论写作','时政热点','逻辑推理','公共基础','统计基础'],
    undecided:['概率论','数理统计','R/Python基础','数据可视化','回归分析','SQL基础']
  },
  '物流管理':{
    job:['供应链管理','仓储管理','物流系统(WMS/TMS)','ERP','成本控制','数据分析'],
    graduate:['物流学','供应链管理','运筹学','考研英语','政治','管理学'],
    public:['行测(数量/判断)','申论写作','时政热点','逻辑推理','公共基础','物流基础'],
    undecided:['物流学概论','供应链管理基础','ERP基础','数据分析','仓储管理基础','运筹学入门']
  },
  '旅游管理':{
    job:['酒店运营','景区规划','导游技能','旅游英语','接待礼仪','OTA平台运营'],
    graduate:['旅游学','管理学','旅游规划','考研英语','政治','旅游综合'],
    public:['行测(言语/判断)','申论写作','时政热点','逻辑推理','公共基础','文旅政策'],
    undecided:['旅游学概论','酒店管理基础','服务管理','沟通表达','旅游英语','导游基础']
  }
};

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
 // 获取用户信息，根据专业和方向选择题目
 var userInfo=JSON.parse(localStorage.getItem('userInfo')||'{}');
 var major=userInfo.major||'';
 var directions=userInfo.directions||[];
 selectedQuestions=selectQuestions(major,directions);

 var savedAnswers=localStorage.getItem('testAnswers');
 var savedQ=localStorage.getItem('testQuestions');
 if(savedAnswers && savedQ){
  var parsedQ=JSON.parse(savedQ);
  // 验证题目是否一致
  if(JSON.stringify(parsedQ.map(function(q){return q.text;}))===JSON.stringify(selectedQuestions.map(function(q){return q.text;}))) {
   answers=JSON.parse(savedAnswers);
  }else{
   answers=new Array(20).fill(null);
   localStorage.removeItem('testAnswers');
   localStorage.removeItem('testQuestions');
  }
 }else{
  answers=new Array(20).fill(null);
 }
 currentQuestion=0;
 initProgressTrack();
 showQuestion();
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

function initSearchSelect(){
 var select = document.getElementById('major-select');
 var searchInput = document.getElementById('major-search');
 var dropdown = document.getElementById('major-dropdown');
 var hiddenInput = document.getElementById('major');

 // 渲染选项列表
 function renderOptions(filter){
  var keyword = (filter || '').toLowerCase();
  dropdown.innerHTML = '';
  var filtered = majorList.filter(function(m){ return m.toLowerCase().indexOf(keyword) !== -1; });
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

 // 输入搜索
 searchInput.addEventListener('input', function(){
  select.classList.add('open');
  renderOptions(this.value);
 });

 // 点击输入框打开下拉
 searchInput.addEventListener('focus', function(){
  select.classList.add('open');
  renderOptions('');
 });

 // 点击外部关闭
 document.addEventListener('click', function(e){
  if(!select.contains(e.target)){
   select.classList.remove('open');
   // 恢复已选值显示
   if(hiddenInput.value){
    searchInput.value = hiddenInput.value;
   }else{
    searchInput.value = '';
    searchInput.placeholder = '请选择或搜索专业';
   }
  }
 });

 // 初始渲染
 renderOptions('');
}

function initSkillSelect(major, directions){
 var group = document.getElementById('skills-group');
 var pills = document.getElementById('skill-pills');
 var hint = document.getElementById('skills-hint');
 var skillMap = majorDirectionSkillMap[major];
 if(!skillMap){
  group.style.display = 'none';
  pills.innerHTML = '';
  return;
 }
 // 收集所有选中方向对应的技能（去重）
 var skillSet = {};
 var directionSkillMap = {};
 directions = directions || [];
 if(directions.length === 0){
  // 还没选方向，显示提示
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
 // 按方向分组渲染技能
 directions.forEach(function(dir){
  var skills = directionSkillMap[dir];
  if(!skills || skills.length === 0) return;
  // 分组标题
  var header = document.createElement('div');
  header.className = 'skill-group-header';
  header.textContent = dirLabels[dir] + '方向';
  pills.appendChild(header);
  // 该方向的技能
  skills.forEach(function(s){
   var label = document.createElement('label');
   label.className = 'skill-pill';
   label.innerHTML = '<input type="checkbox" name="skill" value="'+s+'"><span>'+s+'</span>';
   pills.appendChild(label);
  });
 });
 document.getElementById('error-skills').textContent = '';
 document.getElementById('skill-other').value = '';
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
 if(!skills && majorDirectionSkillMap[major]){document.getElementById('error-skills').textContent='请至少选择一项已掌握技能';valid=false;}
 if(!valid)return;
 var userInfo={major:major,grade:grade,skills:skills,directions:directions};
 localStorage.setItem('userInfo',JSON.stringify(userInfo));
 nav('test');
}

function initResultPage(){
 // 加载题目和得分
 var savedQ=localStorage.getItem('testQuestions');
 if(savedQ){
  selectedQuestions=JSON.parse(savedQ);
 }else{
  selectedQuestions=questionBank.slice(0,20);
 }

 var scores=JSON.parse(localStorage.getItem('testScores')||'{"R":0,"I":0,"A":0,"S":0,"E":0,"C":0}');
 var userInfo=JSON.parse(localStorage.getItem('userInfo')||'{}');
 var directions=userInfo.directions||[];

 // 计算方向适配度，调整显示
 var dimensions=['R','I','A','S','E','C'];
 dimensions.forEach(function(d){
  var baseScore=scores[d]||0;
  // 根据方向权重调整显示分数
  var weight=1;
  directions.forEach(function(dir){
   weight*=directionWeightConfig[dir]?.[d]||1;
  });
  var adjustedScore=Math.round(baseScore*weight*10)/10;
  document.getElementById('disp-'+d).textContent=adjustedScore;
 });

 drawRadarChart(scores,directions);
 generateRoutes(scores,userInfo);
 generateAbilities(scores,userInfo);
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
 dimensions.forEach(function(d){
  var baseScore=scores[d]||0;
  var weight=1;
  if(directions){
   directions.forEach(function(dir){
    weight*=directionWeightConfig[dir]?.[d]||1;
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

// 专业 × 发展方向路线映射（基于互联网大数据：麦可思就业报告、猎聘薪资数据、各高校就业质量报告）
var majorDirectionRoutesMap = {
  '计算机科学与技术':{
    job:[
      {title:'后端开发工程师',detail:'Java/Go/Python技术栈，掌握Spring Boot/Django框架，精通MySQL/Redis/消息队列，大厂校招起薪15-30万/年',salary:'15-30万/年',requirement:'本科及以上学历，计算机相关专业；扎实的编程基础和算法功底；掌握至少一门后端语言（Java/Go/Python）；熟悉数据库和缓存技术；通过CET-4',promotion:'1-2年：初级工程师→中级工程师；3-5年：中级工程师→高级工程师/技术专家，可晋升为架构师或技术经理'},
      {title:'前端开发工程师',detail:'Vue/React/Angular任一框架深入，掌握TypeScript和前端工程化，一线城市的本科起薪10-25万/年',salary:'10-25万/年',requirement:'本科及以上学历，计算机或设计相关专业；精通HTML/CSS/JavaScript；熟练使用Vue/React/Angular任一框架；了解前端工程化和性能优化；有良好的审美和用户体验意识',promotion:'1-2年：初级前端→中级前端；3-5年：中级前端→高级前端/前端专家，可晋升为前端架构师或前端负责人'},
      {title:'算法工程师',detail:'机器学习/深度学习/自然语言处理，需硕士学历为大厂门槛，硕士起薪25-60万/年',salary:'25-60万/年',requirement:'硕士及以上学历，计算机/数学/统计相关专业；扎实的机器学习/深度学习理论基础；精通Python/C++；熟悉TensorFlow/PyTorch框架；有顶会论文/竞赛获奖/项目经验者优先',promotion:'2-3年：算法工程师→高级算法工程师/算法专家；4-5年：可发展为算法总监/研究科学家/技术Fellow，跳槽可获高涨幅'},
      {title:'测试开发工程师',detail:'自动化测试框架搭建、CI/CD流水线维护，质量保障方向起薪12-20万/年',salary:'12-20万/年',requirement:'本科及以上学历，计算机相关专业；掌握软件测试基础理论；熟悉Python/Java/Shell编程；了解CI/CD工具（Jenkins/GitLab CI）；有测试框架开发经验优先',promotion:'1-2年：测试工程师→高级测试工程师；3-4年：测试专家/测试架构师→测试经理/质量负责人，职业路径稳定'},
      {title:'DevOps工程师',detail:'Kubernetes/Docker集群运维，Linux系统及Shell脚本，年薪18-35万',salary:'18-35万/年',requirement:'本科及以上学历，计算机相关专业；精通Linux系统管理和Shell脚本；掌握Docker/Kubernetes；熟悉CI/CD工具和云服务（AWS/阿里云）；了解监控和日志系统',promotion:'1-2年：DevOps工程师→高级DevOps/平台工程师；3-5年：可发展为SRE负责人/运维架构师/云架构师，薪资涨幅大'}
    ],
    graduate:[
      {title:'学术硕士（学硕）',detail:'计算机科学与技术方向，研究型硕士学制3年，适合读博或进科研院所，需发表论文',salary:'补贴800-2000/月'},
      {title:'专业硕士（专硕）',detail:'电子信息大类，就业导向，学制2-3年，导师项目实战丰富，秋招春招不耽误',salary:'补贴1200-3000/月'},
      {title:'跨专业考研',detail:'金融科技（计算机+金融）、生物信息（计算机+生物），复合型人才薪资溢价30-50%',salary:'学历提升后薪资增幅显著'},
      {title:'AI/大数据方向',detail:'人工智能专硕火爆，985/211名额紧张，需提前准备项目经历和竞赛获奖',salary:'大厂核心岗位硕士占60%+'}
    ],
    public:[
      {title:'国家公务员（国考）',detail:'税务局、统计局、海关、银保监等计算机相关岗位，35岁前均可报考，竞争比1:50-200',salary:'年薪10-18万（视地区）'},
      {title:'选调生',detail:'985/211名校生优先，基层锻炼后晋升快，近年计算机专业需求增加',salary:'年薪8-15万+晋升空间'},
      {title:'事业单位',detail:'高校、医院、研究院的信息化岗位，工作稳定，部分有编制，笔试+面试',salary:'年薪8-15万'},
      {title:'公安机关（网警）',detail:'网络安全岗位，需计算机相关背景，专业技术性强，福利待遇较好',salary:'年薪12-20万'}
    ],
    other:[
      {title:'留学深造',detail:'美国CS硕士（Stanford/MIT/CMU）、英国AI方向，顶尖院校毕业后可留当地工作或回国进大厂',salary:'留学投入30-80万，回馈周期2-4年'},
      {title:'创业/自由职业',detail:'小程序开发、SaaS工具、AI应用创业，早期团队融资难但成功后回报高，适合有技术+商业嗅觉的学生',salary:'风险高但上限极高'},
      {title:'产品经理',detail:'技术背景转产品有优势，需补充商业思维和沟通能力，大厂产品起薪15-30万',salary:'15-30万/年'}
    ]
  },
  '软件工程':{
    job:[
      {title:'Java开发工程师',detail:'掌握Spring Cloud微服务、分布式系统设计，大厂中级岗年薪30-50万',salary:'15-40万/年',requirement:'本科及以上学历，软件工程/计算机相关专业；精通Java语言和面向对象编程；熟悉Spring Boot/Spring Cloud框架；掌握MySQL/Redis数据库；有大型项目经验优先',promotion:'1-2年：初级Java→中级Java；3-5年：中级→高级Java/架构师，可发展为技术专家或项目经理'},
      {title:'移动端开发工程师',detail:'Android(Java/Kotlin)/iOS(Swift)，移动开发需求稳定，大厂起薪15-28万',salary:'15-28万/年',requirement:'本科及以上学历；精通Android(Java/Kotlin)或iOS(Swift)开发；熟悉移动端性能优化；了解主流框架（Jetpack/Firebase）；有上线App项目经验优先',promotion:'1-2年：初级移动开发→中级移动开发；3-5年：中级→高级/移动端技术负责人，可晋升为移动端架构师或项目经理'},
      {title:'测试工程师',detail:'功能测试、自动化测试、性能测试，质量保障岗起薪10-18万',salary:'10-18万/年',requirement:'本科及以上学历，计算机相关专业；掌握软件测试理论和方法；熟悉测试工具（Selenium/JMeter）；了解自动化测试框架；具备良好的逻辑思维和细心耐心',promotion:'1-2年：初级测试→中级测试；3-5年：中级→高级测试/测试主管，可发展为测试经理或质量总监'},
      {title:'实施工程师',detail:'ERP、OA等企业软件实施，需出差但技术要求适中，职业路径稳定',salary:'8-15万/年',requirement:'本科及以上学历，计算机/管理相关专业；了解ERP/CRM/OA等企业软件；具备良好的沟通表达能力和问题解决能力；能适应出差；有SQL基础优先',promotion:'1-2年：实施工程师→高级实施；3-5年：可发展为项目经理/实施顾问/区域负责人，职业路径清晰稳定'},
      {title:'技术支持工程师',detail:'售前售后技术支持，客户培训和技术文档编写，跳槽选择多',salary:'10-18万/年',requirement:'本科及以上学历，计算机相关专业；具备良好的技术基础和沟通能力；熟悉常见软件/硬件产品；能独立解决技术问题；良好的文档编写能力',promotion:'1-2年：技术支持→高级技术支持；3-5年：可发展为技术支持经理/售前顾问/产品经理，跨方向发展机会多'}
    ],
    graduate:[
      {title:'软件工程学术硕士',detail:'软件工程理论、软件架构研究，学制3年，读博或进高校为佳',salary:'补贴800-2000/月'},
      {title:'软件工程专业硕士',detail:'专硕就业导向，2年制，导师项目实战为主，秋招不耽误',salary:'补贴1200-3000/月'},
      {title:'人工智能方向',detail:'机器学习应用、软件开发智能化，研究AI辅助编程等前沿方向',salary:'大厂算法岗硕士薪资高'}
    ],
    public:[
      {title:'国家公务员',detail:'税务局、海关、统计局等，每年招录计算机类岗位',salary:'年薪10-18万'},
      {title:'选调生',detail:'基层公务员储备干部，985/211优先，晋升机制透明',salary:'年薪8-15万'},
      {title:'银保监/证监会',detail:'金融监管科技岗位，专业性强，竞争相对较小',salary:'年薪15-25万'}
    ],
    other:[
      {title:'留学（英国/澳洲）',detail:'英国1年制硕士（CS/AI方向），澳洲留学后可申请工作签证，QS前100院校回国认可度高',salary:'留学费用25-60万'},
      {title:'IT培训讲师',detail:'技术培训机构讲师，传授Java/Python/前端等技能，薪资8-20万，需技术扎实+表达能力强',salary:'8-20万/年'},
      {title:'产品经理',detail:'软件专业转产品有优势，对接技术和业务，需补充商业和用户思维',salary:'15-30万/年'}
    ]
  },
  '金融学':{
    job:[
      {title:'银行管培生',detail:'国有大行（工农中建）校招，经过2年轮岗后定岗，稳定性强',salary:'年薪12-20万',requirement:'本科及以上学历，金融/经济/管理相关专业；具备良好的沟通能力和抗压能力；通过CET-4/6；有过银行实习或销售类实习经验优先',promotion:'2年轮岗后定岗：柜员/客户经理→支行客户经理/部门主管→支行行长/分行部门负责人，晋升需业绩+资源'},
      {title:'证券分析师',detail:'研究所行业研究、宏观策略分析，需CPA/CFA加分，薪资与研究能力挂钩',salary:'base+奖金20-50万',requirement:'硕士及以上学历，金融/经济/统计相关专业；具备扎实的财务分析和宏观经济研究能力；通过CPA/CFA考试优先；有券商研究所实习经验',promotion:'2-3年：分析师→高级分析师/首席分析师；4-5年：可晋升为研究总监/基金经理/首席经济学家，薪资与派点挂钩涨幅大'},
      {title:'金融科技岗位',detail:'FinTech、银行IT、支付系统开发，金融+技术复合人才需求旺盛',salary:'15-30万/年',requirement:'本科及以上学历，金融/计算机相关专业；掌握Java/Python等编程语言；了解金融业务逻辑（支付/贷款/理财）；有金融IT实习经验优先',promotion:'1-2年：初级FinTech工程师→中级；3-5年：可发展为金融IT项目经理/架构师，或转向产品经理，复合背景薪资溢价大'},
      {title:'基金/信托',detail:'基金会计、风控合规、销售岗，985/211硕士进头部机构机会大',salary:'15-35万/年',requirement:'本科及以上学历，金融/会计/法律相关专业；通过基金从业资格考试；了解基金/信托业务流程；具备良好的数据分析能力；985/211硕士更有优势',promotion:'1-2年：基金会计/风控专员→高级专员；3-5年：可发展为基金经理/风控总监/销售总监，薪资与业绩挂钩'},
      {title:'企业财务',detail:'上市公司财务管培，职业路径：专员→主管→经理→CFO',salary:'10-20万/年',requirement:'本科及以上学历，财务/会计/金融相关专业；通过初级/中级会计职称优先；熟悉财务软件和Excel；具备良好的数字敏感度和细心',promotion:'3年：专员→财务主管；5年：主管→财务经理；8-10年：经理→财务总监/CFO，职业路径清晰'}
    ],
    graduate:[
      {title:'金融学硕士（学硕）',detail:'学术导向，学制3年，读博或进高校/研究机构',salary:'补贴800-2000/月'},
      {title:'金融专硕（MF）',detail:'就业导向，名校金专2年制，秋招头部机构，起薪20-40万',salary:'补贴2000-4000/月'},
      {title:'CFA/FRM方向',detail:'考研+考证双线， CFA Level II/III 通过后薪资大幅提升',salary:'持证后薪资涨幅50%+'}
    ],
    public:[
      {title:'国家公务员',detail:'财政部、税务局、审计署、央行总部，竞争激烈但待遇优厚',salary:'年薪12-20万'},
      {title:'银保监/证监会',detail:'金融监管岗位，专业性强，需金融+法律复合背景',salary:'年薪15-25万'},
      {title:'选调生（财政系统）',detail:'地方财政、发改系统，发展前景好',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（英美金融）',detail:'美国MFE（金融工程）、英国LSE/IC金融硕士，回国进外资投行/PE，留学投入50-100万',salary:'顶级机构年薪可达80万+'},
      {title:'CPA考证+事务所',detail:'注册会计师，审计岗起薪低但晋升快，5年可升经理，薪资30-60万',salary:'30-60万/（5年经验）'},
      {title:'创业（金融科技）',detail:'支付、理财、征信等FinTech创业，需要金融+技术+资源的复合能力',salary:'风险高回报高'}
    ]
  },
  '会计学':{
    job:[
      {title:'四大会计师事务所',detail:'审计/税务方向，ACCA优先，3年可升经理，5年可签字',salary:'起薪12-18万，5年经理30-50万',requirement:'本科及以上学历，会计/财务/金融相关专业；通过ACCA/CPA部分科目优先；具备良好的英语水平和逻辑分析能力；抗压能力强，能适应加班和出差',promotion:'2年：审计员→高级审计员；3年：高级审计员→审计经理；5年：审计经理→高级经理/合伙人，晋升透明清晰'},
      {title:'企业财务',detail:'总账、成本、税务岗位，需CPA加持，三年可升主管',salary:'8-18万/年',requirement:'本科及以上学历，会计/财务相关专业；持有会计从业资格证/初级职称；熟悉财务软件（用友/金蝶）；了解会计准则和税务法规；细心谨慎',promotion:'2-3年：会计员→总账会计/主管；5年：主管→财务经理，积累CPA后薪资大幅提升'},
      {title:'上市公司财务管培',detail:'财务管培生，轮岗后定岗，职业路径清晰',salary:'10-20万/年',requirement:'本科及以上学历，财务/会计/金融相关专业；具备良好的学习能力和沟通能力；通过CET-4/6；有财务相关实习经验优先',promotion:'轮岗后定岗：总账/成本/税务→财务主管→财务经理，5-8年可升财务总监/CFO'},
      {title:'银行',detail:'柜员→客户经理→支行行长，国有行稳定但晋升需资源',salary:'8-15万/年',requirement:'本科及以上学历，金融/经济/会计相关专业；通过银行从业资格考试优先；具备良好的沟通能力和服务意识；形象气质佳',promotion:'柜员→客户经理（2-3年）→支行客户经理/网点负责人→支行行长，晋升需业绩和资源'},
      {title:'内审/风控',detail:'企业内部审计、风险管理，需CIA/CPA证书',salary:'12-22万/年',requirement:'本科及以上学历，审计/财务/会计相关专业；通过CIA/CPA考试优先；熟悉企业内部审计流程和风险管理体系；具备良好的逻辑思维和独立思考能力',promotion:'2-3年：内审/风控专员→高级内审/风控；5年：内审/风控经理→审计总监/风控总监，职业稳定性高'}
    ],
    graduate:[
      {title:'会计学硕士（学硕）',detail:'财务会计、管理会计研究，学制3年，读博或高校',salary:'补贴800-2000/月'},
      {title:'会计专硕（MPAcc）',detail:'就业导向，2年制，名校MPAcc竞争激烈',salary:'补贴1500-3000/月'},
      {title:'审计学硕士',detail:'审计方向，审计署、央企内审需求大',salary:'补贴1200-2500/月'}
    ],
    public:[
      {title:'国家公务员（税务）',detail:'税务局稽查局，国考招录大户，工作稳定',salary:'年薪10-18万'},
      {title:'审计署/特派办',detail:'中央审计机关，专业性强，晋升渠道清晰',salary:'年薪12-20万'},
      {title:'地方审计局',detail:'地方审计系统，基层锻炼后晋升',salary:'年薪8-15万'}
    ],
    other:[
      {title:'CPA注册会计师',detail:'国内最高含金量财会证书，持证后年薪30-80万',salary:'30-80万/（持证后）'},
      {title:'ACCA国际注册会计师',detail:'外企/外资金融机构认可，留学/移民加分',salary:'国际认可度高'},
      {title:'留学（英国/澳洲）',detail:'英国会计与金融硕士，澳洲会计专业可移民，留学费用25-50万',salary:'回本周期3-5年'}
    ]
  },
  '法学':{
    job:[
      {title:'律所（律师助理）',detail:'红圈所起薪2-3万/月，需过司考，3-5年成为初级律师',salary:'起薪20-40万/年（红圈所）',requirement:'本科及以上学历，法学专业；通过法律职业资格考试（A证）；法律基础知识扎实；良好的逻辑思维和表达能力；英语水平优秀优先',promotion:'律师助理→初级律师（3年）→高级律师/合伙人，晋升路径清晰，红圈所晋升透明'},
      {title:'法务专员',detail:'企业合同审查、知识产权、合规管理，大型集团需求大',salary:'12-25万/年',requirement:'本科及以上学历，法学专业；通过法律职业资格考试；熟悉合同法/公司法/劳动法；具备良好的逻辑思维和沟通能力；有企业法务实习经验优先',promotion:'法务专员→法务主管（3年）→法务经理→法务总监/首席法务官，职业稳定性强'},
      {title:'法律顾问',detail:'私人/企业法律服务，执业3年后可独立',salary:'15-30万/年',requirement:'本科及以上学历，法学专业；通过法律职业资格考试；具备扎实的法律知识和实践经验；良好的沟通能力和客户资源；执业3年后可申请独立',promotion:'执业3年后可独立开设个人律所；积累客户资源后可成立合伙制律所，薪资上不封顶'},
      {title:'公证员',detail:'公证机构从业，需过司考+公证员资格证，工作稳定',salary:'10-18万/年',requirement:'本科及以上学历，法学专业；通过法律职业资格考试+公证员资格证；细心严谨，原则性强；良好的沟通能力和服务意识',promotion:'公证员→高级公证员（5年）→公证机构管理层，职业稳定，职称晋升清晰'},
      {title:'考研/法硕辅导',detail:'司考/法硕培训机构讲师，知识变现',salary:'15-30万/年',requirement:'本科及以上学历，法学专业；通过法律职业资格考试；授课能力强，表达清晰；有培训行业实习或家教经验优先',promotion:'讲师→高级讲师/教研组长→培训项目负责人/校长，优秀讲师可获高额课时费或股份'}
    ],
    graduate:[
      {title:'法学硕士（学硕）',detail:'法理学、民法、刑法等研究方向，学制3年，读博或高校',salary:'补贴800-2000/月'},
      {title:'法律硕士（JM）',detail:'非法本可跨考，2年制，就业导向，律所/法务认可',salary:'补贴1500-3000/月'},
      {title:'法学博士',detail:'学术路线，发表C刊，高校任教，需耐得住寂寞',salary:'高校待遇稳定+课题收入'}
    ],
    public:[
      {title:'法官/检察官',detail:'通过司法考试+公务员考试，入额后薪资显著提升',salary:'年薪15-30万+社会地位高'},
      {title:'公安机关',detail:'经侦、刑侦、法制岗位，专业对口',salary:'年薪12-22万'},
      {title:'司法局/公证处',detail:'基层法律服务，稳定但晋升慢',salary:'年薪8-15万'},
      {title:'纪检监察',detail:'纪委监委，近年扩招，反腐工作需求大',salary:'年薪12-20万'}
    ],
    other:[
      {title:'留学（美国LLM/T14）',detail:'美国LLM一年制，T14法学院回国进红圈所，留学费用40-60万',salary:'海归红圈所起薪高30%'},
      {title:'企业合规师',detail:'新兴职业，ESG合规、数据合规，需求快速增长',salary:'20-40万/年'},
      {title:'仲裁员',detail:'国际商事仲裁，需多年执业经验+境外背景',salary:'按案件提成，上不封顶'}
    ]
  },
  '英语':{
    job:[
      {title:'翻译（同声传译/笔译）',detail:'专业翻译需CATTI二级口译/笔译证书，自由译者收入可观',salary:'同传日薪5000-15000',requirement:'本科及以上学历，英语专业；通过CATTI二级口译/笔译证书；精通中英文互译；具备良好的记忆力和反应速度；同传需专业训练',promotion:'翻译→高级翻译（3年）→资深翻译/翻译总监；自由译者可成立翻译公司，薪资上不封顶'},
      {title:'英语教师（机构）',detail:'新东方/好未来等，薪资与课时量挂钩，寒暑假旺季收入高',salary:'10-25万/年',requirement:'本科及以上学历，英语专业；通过TEM8或CET-6；具备良好的口语和授课能力；有教师资格证优先；喜欢与学生交流',promotion:'教师→高级教师/教研组长（3年）→校区教学负责人/校长，明星教师薪资上不封顶'},
      {title:'外贸/跨境电商',detail:'英语作为工作语言，B2B/B2C平台运营，阿里巴巴国际站',salary:'8-18万/年+提成',requirement:'本科及以上学历，英语/国贸/商务相关专业；通过CET-6/4；熟悉外贸流程和B2B/B2C平台操作；良好的沟通和谈判能力；抗压能力强',promotion:'外贸业务员→高级外贸/外贸主管（3年）→外贸经理/总监，积累客户资源后薪资增幅大'},
      {title:'海外运营/市场',detail:'字节跳动、TikTok等出海企业，海外社交媒体运营',salary:'15-30万/年',requirement:'本科及以上学历，英语/传媒/营销相关专业；英语可作为工作语言；有海外社交媒体运营经验优先；了解目标市场文化；创意和数据分析能力',promotion:'运营专员→高级运营/运营主管（2-3年）→运营经理/市场经理，TikTok等企业晋升快'},
      {title:'空乘/航空',detail:'国际航线空乘，英文要求高，福利待遇好',salary:'15-30万/年（含飞行补贴）',requirement:'大专及以上学历；身高158cm以上；英语口语流利（国际航线要求）；形象气质佳；良好的服务意识和应急处理能力；通过航空公司面试',promotion:'乘务员→高级乘务员/乘务长（3-5年）→客舱经理/培训师，福利待遇好，退休后有保障'}
    ],
    graduate:[
      {title:'英语语言文学硕士',detail:'文学/文化方向，学硕3年，读博或高校',salary:'补贴800-2000/月'},
      {title:'翻译硕士（MTI）',detail:'口译/笔译方向，专业性强，2年制',salary:'补贴1500-3000/月'},
      {title:'英语教育硕士',detail:'TESOL方向，回国可当老师或继续读博',salary:'补贴1200-2500/月'}
    ],
    public:[
      {title:'海关（英语岗）',detail:'外语类专业国考有优势，检验检疫、稽查岗位',salary:'年薪10-18万'},
      {title:'外交部/商务部',detail:'高级翻译/外交官，需通过严格遴选，竞争激烈',salary:'驻外补贴高+晋升快'},
      {title:'税务局（外语岗）',detail:'国际税务、出口退税审核',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（TESOL/教育）',detail:'英国/澳洲TESOL硕士，1年制，回国可当老师或留学移民',salary:'留学费用20-40万'},
      {title:'雅思/托福培训',detail:'机构名师或独立教师，高水平英语教师收入可观',salary:'20-50万/年'},
      {title:'留学顾问',detail:'申请文书、选校咨询、面试培训，淡季需销售能力',salary:'底薪+提成10-25万/年'}
    ]
  },
  '汉语言文学':{
    job:[
      {title:'出版社/编辑',detail:'图书编辑、期刊编辑，需文学素养和文字功底',salary:'8-15万/年',requirement:'本科及以上学历，汉语言文学/编辑出版相关专业；扎实的文字功底和文学素养；细心严谨；熟悉出版流程；有文字作品发表优先',promotion:'编辑→高级编辑/编辑部主任（3-5年）→副总编辑/总编辑，资深编辑薪资可观'},
      {title:'新媒体运营/文案策划',detail:'公众号、短视频脚本、企业宣传，大厂薪资可观',salary:'10-20万/年',requirement:'本科及以上学历，新闻/中文/营销相关专业；扎实的文字功底和内容创作能力；熟悉新媒体平台运营规则；有爆款内容创作经验优先',promotion:'运营专员→高级运营/内容主管（2-3年）→运营经理/内容总监，优秀内容创作者薪资上不封顶'},
      {title:'语文教师',detail:'初高中教师，需教师资格证，带薪寒暑假',salary:'10-18万/年（教师编更高）',requirement:'本科及以上学历，汉语言文学/教育学相关专业；持有教师资格证；普通话二甲以上；具备良好的授课能力和沟通能力；热爱教育事业',promotion:'教师→年级备课组长/教研组长（3年）→教务主任/副校长/校长，带编教师职称晋升：助教→讲师→副高→正高'},
      {title:'广告/文案',detail:'广告公司文案策划，天马行空创意型工作',salary:'10-20万/年',requirement:'本科及以上学历，中文/广告/新闻相关专业；优秀的文字功底和创意能力；有广告文案作品集优先；脑洞大，思维活跃；能承受加班压力',promotion:'文案→高级文案/创意组长（3年）→创意总监/副总创意总监，优秀创意人薪资上不封顶'},
      {title:'公务员（文职）',detail:'政府机关文字材料岗，稳定但需写作能力',salary:'年薪10-18万',requirement:'本科及以上学历，中文/法律/行政相关专业；通过国家公务员/省级公务员考试；具备良好的写作能力和政治素养；细心严谨，原则性强',promotion:'科员→副主任科员/主任科员（3-5年）→副科级/正科级，晋升需考核+年限+机遇'}
    ],
    graduate:[
      {title:'古代文学/现当代文学硕士',detail:'学硕3年，读博或高校教师',salary:'补贴800-2000/月'},
      {title:'学科语文（教育专硕）',detail:'2年制，就业导向，师范类院校招生多',salary:'补贴1500-3000/月'},
      {title:'创意写作MFA',detail:'创意写作硕士，培养作家/编剧人才',salary:'补贴1200-2500/月'}
    ],
    public:[
      {title:'中学语文教师（编制）',detail:'事业编，稳定且有社会地位，需教师资格证',salary:'年薪10-18万+寒暑假'},
      {title:'政府文职',detail:'党委、政府文字材料岗，写作能力是核心竞争力',salary:'年薪10-18万'},
      {title:'文化局/博物馆',detail:'文化遗产保护、文物管理，体制内文化岗',salary:'年薪8-15万'}
    ],
    other:[
      {title:'出版人/图书策划',detail:'图书选题策划、版权贸易，创业型工作',salary:'15-40万/年（创业型）'},
      {title:'自由撰稿人/专栏作家',detail:'自媒体、内容创业，需长期内容积累',salary:'不固定，上限高'},
      {title:'留学（教育/传媒）',detail:'英国教育学、传媒硕士，回国进高校或媒体',salary:'留学费用20-45万'}
    ]
  },
  '工商管理':{
    job:[
      {title:'管培生（快消/互联网）',detail:'宝洁/京东管培生，2年轮岗后定岗，晋升快',salary:'15-30万/年',requirement:'本科及以上学历，专业不限（商科优先）；良好的沟通能力和领导力潜质；有过学生会/社团/实习经历优先；较强的逻辑思维和解决问题的能力',promotion:'管培生→部门主管（2-3年）→部门经理/总监，顶尖快消/互联网管培晋升快，5-8年可到高层'},
      {title:'市场营销/策划',detail:'品牌管理、市场推广、数字营销，大厂市场岗',salary:'12-25万/年',requirement:'本科及以上学历，市场营销/广告/传媒相关专业；良好的沟通能力和创意思维；了解市场营销理论和方法；有市场实习或项目经验优先',promotion:'市场专员→市场主管/品牌主管（2-3年）→市场经理/品牌总监，市场营销晋升与业绩挂钩'},
      {title:'人力资源',detail:'HR六大模块，需沟通能力和Office技能',salary:'10-20万/年',requirement:'本科及以上学历，人力资源/管理/心理相关专业；良好的沟通能力和组织协调能力；熟悉HR各模块；熟练使用Office软件；有HR实习经验优先',promotion:'HR专员→HR主管（3年）→HR经理→HR总监，人力资源晋升路径清晰'},
      {title:'管理咨询',detail:'麦肯锡/贝恩/波士顿，顶尖MBA学历背景',salary:'25-60万/年（顶尖咨询）',requirement:'硕士及以上学历（MBA优先）；顶尖院校背景；良好的逻辑思维和商业敏感度；出色的沟通和表达能力；英语流利；有过咨询实习优先',promotion:'分析师→咨询顾问（2年）→高级顾问→项目经理→合伙人，顶级咨询晋升透明，三年晋升一次'},
      {title:'运营管理',detail:'电商运营、产品运营、内容运营',salary:'12-25万/年',requirement:'本科及以上学历，工商管理/电商/营销相关专业；良好的逻辑思维和数据敏感度；熟悉互联网运营模式；有电商/运营实习经验优先',promotion:'运营专员→高级运营/运营主管（2-3年）→运营经理/总监，运营晋升与数据指标挂钩'}
    ],
    graduate:[
      {title:'工商管理硕士（MBA）',detail:'在职/全日制，名校MBA学费30-60万，回报需考量',salary:'毕业5年薪资翻倍'},
      {title:'管理学硕士（学硕）',detail:'学术方向，学制3年，读博或高校',salary:'补贴800-2000/月'},
      {title:'会计/法律硕士',detail:'MBA转会计、法律，跳槽薪资涨幅大',salary:'复合背景薪资溢价'}
    ],
    public:[
      {title:'公务员（管理类）',detail:'工商、质检、食药监等，岗位多',salary:'年薪10-18万'},
      {title:'选调生',detail:'管理岗储备干部，晋升机制透明',salary:'年薪8-15万+晋升空间'},
      {title:'事业单位（管理岗）',detail:'高校、医院行政，稳定性强',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（MBA）',detail:'美国/欧洲MBA，2年制，名校需GMAT700+，创业资源丰富',salary:'留学费用60-120万'},
      {title:'创业',detail:'商业创业，创业管理方向，适合有商业嗅觉的学生',salary:'风险高回报高'},
      {title:'PMP项目管理',detail:'项目管理认证，转管理岗位加分，跳槽认可度高',salary:'15-30万/年'}
    ]
  },
  '临床医学':{
    job:[
      {title:'住院医师规范化培训',detail:'3年规培是必经历程，定科后成为住院医师',salary:'规培期3-8万/年',requirement:'本科及以上学历，临床医学专业；通过医师资格考试；完成实习轮转；具备良好的临床思维和沟通能力；身体素质好，能承受夜班压力',promotion:'规培生→住院医师（3年规培后）→主治医师（5年）→副主任医师→主任医师，职称晋升与年限+考试+论文挂钩'},
      {title:'专科医生',detail:'5+3+3+年主治+副高+正高，熬资历的长期路线',salary:'主治后15-40万/年',requirement:'本科及以上学历，临床医学专业；完成规范化培训；通过主治医师考试；具备专科方向的知识和技能；良好的临床判断力和动手能力',promotion:'主治医师→副主任医师（5年+考试+论文）→主任医师→科室主任/副院长，熬资历路线，越老越吃香'},
      {title:'医药代表',detail:'药企销售，收入与业绩挂钩，医学背景是优势',salary:'10-30万/年（看业绩）',requirement:'本科及以上学历，医学/药学/营销相关专业；具备良好的沟通能力和公关能力；了解医药行业和市场；有销售实习经验优先；能承受业绩压力',promotion:'医药代表→高级医药代表/地区经理（3年）→省区经理→大区总监，薪资与业绩强挂钩'},
      {title:'医疗数据/AI',detail:'医疗信息化、医院HIS系统、AI辅助诊断',salary:'15-30万/年',requirement:'本科及以上学历，医学信息/计算机/生物医学工程相关专业；了解医疗信息化和HIS系统；掌握数据分析/机器学习技术；有医疗IT项目经验优先',promotion:'医疗IT工程师→项目经理/技术负责人（3年）→医疗信息化部门负责人，医疗+技术复合人才稀缺'},
      {title:'医学编辑/出版',detail:'医学期刊、教科书编辑，需医学背景',salary:'10-18万/年',requirement:'本科及以上学历，医学/药学相关专业；扎实的医学基础知识；良好的文字编辑能力；细心严谨；有编辑类实习或写作经验优先',promotion:'医学编辑→高级编辑/编辑部主任（3-5年）→副总编辑/总编辑，医学出版行业稳定'}
    ],
    graduate:[
      {title:'专业硕士（专硕）',detail:'5+3专硕，四证合一（学历+规培+执医+学位），就业导向',salary:'补贴1000-2000/月'},
      {title:'学术硕士（学硕）',detail:'3年学硕+3年规培，读博或科研岗',salary:'补贴800-2000/月'},
      {title:'博士（PhD/MD）',detail:'顶尖三甲医院必要条件，科研+临床双发展',salary:'博士安家费30-100万'}
    ],
    public:[
      {title:'医院事业编',detail:'公立医院编制，稳定性强，福利好',salary:'年薪12-25万（看职称）'},
      {title:'卫生局/疾控中心',detail:'行政管理/公共卫生，体制内',salary:'年薪10-18万'},
      {title:'狱医',detail:'监狱卫生员，工作轻松，夜班少',salary:'年薪8-15万'}
    ],
    other:[
      {title:'美国执业医师（USMLE）',detail:'USMLE考试，通过后可申请美国住院医，难度极高',salary:'美国住院医年薪20-50万美元'},
      {title:'医学翻译',detail:'医疗器械注册翻译、医学论文翻译',salary:'日薪800-3000'},
      {title:'健康管理/高端私立',detail:'和睦家/卓正等高端私立，高薪资但需服务意识',salary:'15-35万/年'}
    ]
  },
  '数据科学与大数据技术':{
    job:[
      {title:'数据分析师',detail:'SQL/Hive数据提取，Python/R数据分析，Tableau可视化，大厂数据分析起薪15-30万',salary:'15-30万/年',requirement:'本科及以上学历，统计/计算机/数学相关专业；精通SQL和Hive；熟练使用Python/R进行数据分析；熟悉Tableau等可视化工具；有数据分析项目经验优先',promotion:'数据分析师→高级分析师/数据分析组长（2-3年）→数据分析经理→数据总监，职业路径清晰'},
      {title:'数据工程师',detail:'ETL流水线、数据仓库搭建、Spark/Flink处理，大数据开发工程师需求旺盛',salary:'20-35万/年',requirement:'本科及以上学历，计算机/数据科学相关专业；精通SQL和Python/Java；熟悉Hadoop/Spark/Flink等技术；有数据仓库ETL项目经验优先',promotion:'数据工程师→高级数据工程师/数据架构师（3年）→数据工程经理→数据平台负责人，薪资涨幅大'},
      {title:'算法工程师',detail:'机器学习/深度学习建模，特征工程，模型优化，大厂算法岗硕士为主',salary:'25-60万/年',requirement:'硕士及以上学历，计算机/数学/统计相关专业；扎实的机器学习/深度学习理论基础；精通Python/C++；熟悉TensorFlow/PyTorch框架；有Kaggle竞赛/顶会论文优先',promotion:'算法工程师→高级算法工程师/算法专家（2-3年）→算法总监/研究科学家，薪资上不封顶'},
      {title:'BI工程师',detail:'商业智能报表开发，企业数据中台，指标体系建设',salary:'15-28万/年',requirement:'本科及以上学历，计算机/统计相关专业；精通SQL和BI工具（Tableau/PowerBI）；了解数据仓库和指标体系建设；具备数据分析思维；有BI开发项目经验优先',promotion:'BI工程师→高级BI/BI组长（2-3年）→BI经理→数据平台负责人，企业数字化转型需求大'},
      {title:'数据产品经理',detail:'数据产品设计，数据需求对接，技术+业务复合能力',salary:'20-35万/年',requirement:'本科及以上学历，计算机/数据科学/产品管理相关专业；了解数据产品和数据技术；有数据分析能力；良好的沟通和需求分析能力；有产品经理实习经验优先',promotion:'数据产品经理→高级数据PM/数据产品负责人（3年）→数据产品总监，数据产品人才稀缺'}
    ],
    graduate:[
      {title:'数据科学硕士',detail:'DS/CS数据科学方向，学制2年，名校竞争激烈',salary:'补贴2000-4000/月'},
      {title:'人工智能方向',detail:'AI/ML/DL研究，发表顶会论文，进大厂研究院',salary:'大厂算法岗薪资高'},
      {title:'统计学/数学方向',detail:'概率论、数理统计、贝叶斯方法，学术路线',salary:'补贴800-2000/月'}
    ],
    public:[
      {title:'统计局',detail:'政府统计岗位，数据处理分析，体制内稳定',salary:'年薪10-18万'},
      {title:'银保监/央行',detail:'金融监管数据岗，需统计/数学背景',salary:'年薪15-25万'},
      {title:'信息安全相关',detail:'政府数据安全部门',salary:'年薪12-20万'}
    ],
    other:[
      {title:'留学（美国DS/CS）',detail:'美国DS/BA硕士项目，Stanford/CMU等顶尖院校，回国进大厂',salary:'留学费用40-80万'},
      {title:'数据咨询',detail:'咨询公司数据分析，为企业做数据化转型',salary:'15-30万/年'},
      {title:'创业（数据服务）',detail:'数据交易平台、API服务',salary:'风险高回报高'}
    ]
  },
  '人工智能':{
    job:[
      {title:'算法工程师',detail:'NLP/CV/推荐算法，大厂核心岗，需硕士及以上学历',salary:'25-60万/年',requirement:'硕士及以上学历，计算机/数学/统计相关专业；扎实的机器学习/深度学习基础；熟悉NLP/CV/推荐系统任一方向；顶会论文/竞赛获奖/项目经验是关键',promotion:'算法工程师→高级算法/算法专家（2年）→算法总监/研究科学家，大厂算法岗晋升快，薪资上不封顶'},
      {title:'AI应用开发工程师',detail:'大模型应用开发、Agent开发、AI产品落地',salary:'20-40万/年',requirement:'本科及以上学历，计算机相关专业；掌握Python/Java开发；了解大模型原理和应用场景；有LangChain/向量数据库等经验优先；有AI产品开发项目经验',promotion:'AI开发工程师→高级AI开发/技术专家（2-3年）→AI技术负责人/架构师，大模型赛道火热，薪资涨幅大'},
      {title:'自动驾驶工程师',detail:'感知/规划/控制算法，车企/自动驾驶公司',salary:'25-50万/年',requirement:'硕士及以上学历，车辆工程/控制/计算机相关专业；熟悉自动驾驶感知/规划/控制算法；了解激光雷达/摄像头等传感器；有自动驾驶项目经验优先',promotion:'自动驾驶工程师→高级工程师/技术组长（2-3年）→自动驾驶技术负责人/项目经理，自动驾驶行业前景广阔'},
      {title:'AI infra工程师',detail:'模型训练平台、推理优化、GPU集群管理',salary:'25-45万/年',requirement:'本科及以上学历，计算机相关专业；精通Linux和Python/C++；熟悉GPU集群管理和分布式训练；了解模型推理优化技术；有AI平台开发经验优先',promotion:'AI infra工程师→高级infra/技术专家（2-3年）→infra负责人/架构师，AI基础设施人才稀缺'},
      {title:'AI产品经理',detail:'AI产品规划，需技术背景+产品思维',salary:'20-35万/年',requirement:'本科及以上学历，计算机/产品管理相关专业；有AI技术背景优先；了解AI产品开发流程；良好的沟通和需求分析能力；有AI产品项目经验优先',promotion:'AI产品经理→高级AI PM/AI产品负责人（3年）→AI产品总监，AI产品人才稀缺'}
    ],
    graduate:[
      {title:'人工智能博士',detail:'PhD学术路线，发表顶会，进高校或研究院',salary:'博士安家费+科研启动费'},
      {title:'计算机视觉方向',detail:'CV/DL研究，人脸识别、自动驾驶视觉',salary:'大厂算法岗高薪'},
      {title:'自然语言处理方向',detail:'NLP/LLM研究，大模型研究',salary:'大厂研究院薪资顶尖'}
    ],
    public:[
      {title:'科研院所',detail:'中科院、自动化所等AI研究机构',salary:'年薪12-25万+福利'},
      {title:'国企科技岗',detail:'央企数字化转型AI岗，稳定性强',salary:'年薪15-25万'},
      {title:'公安系统',detail:'视频图像分析、AI辅助办案',salary:'年薪12-20万'}
    ],
    other:[
      {title:'留学（美国AI博士）',detail:'Stanford/MIT/CMU PhD，全奖录取难度大',salary:'全额奖学金'},
      {title:'AI创业',detail:'AI应用创业，大模型落地服务',salary:'VC投资，风险高回报高'},
      {title:'AI培训讲师',detail:'AI培训机构授课，Python/机器学习',salary:'15-35万/年'}
    ]
  },
  '电子信息工程':{
    job:[
      {title:'硬件工程师',detail:'电路设计、PCB绘制、硬件调试，大厂/国企需求大',salary:'12-25万/年',requirement:'本科及以上学历，电子/通信/自动化相关专业；熟悉电路原理和PCB设计；熟练使用Altium Designer/Cadence；有硬件项目开发经验优先',promotion:'硬件工程师→高级硬件/硬件组长（3年）→硬件经理→硬件总监，国企/大厂需求稳定'},
      {title:'嵌入式工程师',detail:'STM32/ARM开发、RTOS、驱动开发，物联网方向',salary:'15-30万/年',requirement:'本科及以上学历，电子/计算机/自动化相关专业；熟悉STM32/ARM开发；了解RTOS和驱动开发；有嵌入式项目经验优先；掌握C语言编程',promotion:'嵌入式工程师→高级嵌入式/系统架构师（3年）→嵌入式技术负责人，物联网行业前景广阔'},
      {title:'通信协议工程师',detail:'5G/LTE/蓝牙协议，通信设备商',salary:'15-28万/年',requirement:'本科及以上学历，通信/电子/计算机相关专业；熟悉通信原理和协议栈；了解5G/LTE/蓝牙协议；有通信设备商实习经验优先；英语良好',promotion:'协议工程师→高级协议/系统工程师（3年）→通信系统负责人，5G/6G技术发展推动需求'},
      {title:'FPGA工程师',detail:'Xilinx/Intel FPGA，信号处理，薪资高',salary:'20-40万/年',requirement:'本科及以上学历，电子/通信/计算机相关专业；精通Verilog/VHDL；熟悉Xilinx/Intel FPGA开发；有FPGA项目经验优先；了解信号处理算法',promotion:'FPGA工程师→高级FPGA/技术专家（3年）→FPGA技术负责人，芯片国产化推动需求增长'},
      {title:'芯片验证工程师',detail:'IC验证，数字电路验证，芯片设计',salary:'20-40万/年',requirement:'本科及以上学历，微电子/电子/计算机相关专业；熟悉数字电路和IC设计流程；掌握Verilog/SystemVerilog；了解UVM验证方法学；有芯片验证项目经验优先',promotion:'芯片验证工程师→高级验证/验证专家（3年）→验证负责人/项目经理，芯片行业国产替代机遇'}
    ],
    graduate:[
      {title:'电子科学与技术硕士',detail:'微电子/电路方向，学硕3年',salary:'补贴800-2000/月'},
      {title:'通信工程硕士',detail:'无线通信/信号处理方向',salary:'补贴1200-3000/月'},
      {title:'集成电路方向',detail:'IC设计/工艺，芯片国产化方向',salary:'国家战略需求，薪资上涨'}
    ],
    public:[
      {title:'军工/航天院所',detail:'航天科技/科工集团，稳定但需双985背景',salary:'年薪15-25万+福利'},
      {title:'铁路/交通系统',detail:'信号控制、轨道通信',salary:'年薪10-18万'},
      {title:'运营商',detail:'中国移动/电信/联通，技术岗',salary:'年薪10-20万'}
    ],
    other:[
      {title:'留学（美国EE）',detail:'美国电子工程硕士，Stanford/UC Berkeley等名校',salary:'留学费用40-70万'},
      {title:'医疗器械',detail:'迈瑞、联影等医疗器械公司硬件岗',salary:'15-30万/年'},
      {title:'智能硬件',detail:'无人机、机器人、智能家居',salary:'15-30万/年'}
    ]
  },
  '机械设计制造及其自动化':{
    job:[
      {title:'机械设计工程师',detail:'CAD/SolidWorks设计，机械结构设计，大厂/国企',salary:'10-20万/年',requirement:'本科及以上学历，机械/材料/自动化相关专业；熟练使用CAD/SolidWorks；了解机械加工工艺；有机械设计项目经验优先',promotion:'机械工程师→高级工程师/技术组长（3年）→机械经理→技术总监，制造业稳定'},
      {title:'工艺工程师',detail:'加工工艺、工装设计、质量控制',salary:'10-18万/年',requirement:'本科及以上学历，机械/材料/自动化相关专业；了解机械加工工艺和工艺装备；有工厂实习经验优先；具备良好的分析问题和解决问题的能力',promotion:'工艺工程师→高级工艺/工艺主管（3年）→工艺经理→生产总监，制造业需求稳定'},
      {title:'机电工程师',detail:'PLC/电气控制，工业自动化',salary:'12-22万/年',requirement:'本科及以上学历，机电/自动化/电气相关专业；熟悉PLC编程和电气控制；有自动化设备调试经验优先；能适应现场工作',promotion:'机电工程师→高级机电/项目经理（3年）→工程经理→项目经理，工业自动化需求大'},
      {title:'项目经理',detail:'工程项目管理，需经验积累',salary:'15-30万/年',requirement:'本科及以上学历，工程/机械/管理相关专业；了解项目管理知识（PMP优先）；良好的沟通和协调能力；有工程项目实习经验优先',promotion:'项目经理助理→项目经理（3年）→高级项目经理→项目总监/PMP证书加持薪资高'},
      {title:'3D打印工程师',detail:'增材制造，新兴方向',salary:'12-22万/年',requirement:'本科及以上学历，机械/材料/材料加工相关专业；了解3D打印原理和材料特性；熟悉主流3D打印设备；具备工艺参数调试能力；有3D打印项目经验优先',promotion:'3D打印工程师→高级工程师/研发负责人（3年）→3D打印技术专家，增材制造行业快速发展'}
    ],
    graduate:[
      {title:'机械工程硕士',detail:'机械设计/制造/自动化方向，学硕3年',salary:'补贴800-2000/月'},
      {title:'机械专硕',detail:'专硕2年，就业导向',salary:'补贴1200-3000/月'},
      {title:'智能制造方向',detail:'数字化工厂、工业4.0',salary:'制造业转型升级需求大'}
    ],
    public:[
      {title:'机械类公务员',detail:'质监局、安监局、海关机械检验',salary:'年薪10-18万'},
      {title:'军工院所',detail:'航空/航天/船舶/兵器，稳定性强',salary:'年薪12-22万+福利'},
      {title:'铁路/交通',detail:'高铁/地铁维护，央企稳定',salary:'年薪10-20万'}
    ],
    other:[
      {title:'留学（德国/日本）',detail:'德国TU9/日本东京大学，机械强校',salary:'留学费用10-30万（德国免学费）'},
      {title:'专利代理',detail:'机械领域专利撰写，需理工科背景',salary:'15-25万/年'},
      {title:'机械销售',detail:'机械设备销售，底薪+提成',salary:'10-25万/年（看业绩）'}
    ]
  },
  '自动化':{
    job:[
      {title:'自动化工程师',detail:'PLC/SCADA/DCS控制系统，工业自动化',salary:'12-25万/年',requirement:'本科及以上学历，自动化/控制/电气相关专业；熟悉PLC编程和SCADA/DCS系统；有自动化项目调试经验优先；能适应出差',promotion:'自动化工程师→高级工程师/项目经理（3年）→自动化部门负责人，工业4.0推动需求'},
      {title:'机器人工程师',detail:'ROS机器人开发，运动控制，薪资高',salary:'18-35万/年',requirement:'本科及以上学历，自动化/机械/计算机相关专业；熟悉ROS机器人操作系统；了解运动控制和路径规划；有机器人项目经验优先',promotion:'机器人工程师→高级机器人/技术组长（3年）→机器人技术负责人，机器人行业蓬勃发展'},
      {title:'电气工程师',detail:'电气设计、供配电、PLC编程',salary:'12-22万/年',requirement:'本科及以上学历，电气/自动化/机电相关专业；熟悉电气设计和高低压配电；掌握PLC编程；有电气设计项目经验优先',promotion:'电气工程师→高级电气/电气主管（3年）→电气经理→电气总监，工业/建筑行业需求稳定'},
      {title:'控制算法工程师',detail:'运动控制、PID、滤波算法',salary:'18-35万/年',requirement:'本科及以上学历，控制/自动化/数学相关专业；精通控制理论（PID/现代控制）；熟悉MATLAB/Simulink仿真；有控制算法项目经验优先',promotion:'控制算法工程师→高级算法/技术专家（3年）→控制技术负责人/架构师，高端制造业稀缺'},
      {title:'工业互联网',detail:'工业物联网平台开发，智能制造',salary:'15-28万/年',requirement:'本科及以上学历，计算机/自动化/通信相关专业；熟悉物联网技术和工业协议；有平台开发经验优先；了解工业自动化场景',promotion:'工业互联网工程师→高级工程师/产品负责人（3年）→工业互联网项目经理，智能制造核心方向'}
    ],
    graduate:[
      {title:'控制科学与工程硕士',detail:'控制理论/模式识别，学硕3年',salary:'补贴800-2000/月'},
      {title:'人工智能方向',detail:'AI+控制结合，热门方向',salary:'大厂算法岗薪资高'},
      {title:'机器人方向',detail:'机器人视觉/导航，智能机器人',salary:'机器人行业发展迅猛'}
    ],
    public:[
      {title:'科研院所',detail:'自动化所、航天院所',salary:'年薪12-22万+福利'},
      {title:'国企自动化岗',detail:'国家电网/中石化/中石油',salary:'年薪12-20万'},
      {title:'交通系统',detail:'高铁/地铁控制系统',salary:'年薪10-20万'}
    ],
    other:[
      {title:'留学（美国/德国）',detail:'美国CMU/德国TU9，自动化强校',salary:'留学费用20-60万'},
      {title:'智能制造',detail:'工厂自动化改造，工业4.0',salary:'15-30万/年'},
      {title:'创业（机器人）',detail:'服务机器人/工业机器人',salary:'风险高，政策扶持'}
    ]
  },
  '土木工程':{
    job:[
      {title:'结构工程师',detail:'建筑结构设计，CAD/BIM，施工单位',salary:'10-20万/年',requirement:'本科及以上学历，土木工程/结构工程相关专业；熟悉结构设计原理和规范；熟练使用PKPM/AutoCAD；有设计院实习经验优先',promotion:'结构工程师→注册结构师（考取证书后薪资大幅提升）→结构负责人→总工程师，证书加持'},
      {title:'工程造价',detail:'预算编制、成本控制、造价咨询',salary:'10-22万/年',requirement:'本科及以上学历，工程管理/土木工程相关专业；熟悉工程造价原理和清单计价；掌握广联达/斯维尔等造价软件；有造价咨询实习经验优先',promotion:'造价员→注册造价工程师（考取证书后薪资大幅提升）→造价负责人→造价总监，证书值钱'},
      {title:'施工项目经理',detail:'现场管理、进度控制，需现场经验',salary:'12-25万/年',requirement:'本科及以上学历，土木工程/施工管理相关专业；了解施工工艺和项目管理；有工地实习经验优先；能适应驻场工作；良好的协调能力',promotion:'施工员→项目经理（考取一建证书后晋升）→项目总监→分公司总经理，一建证书加持'},
      {title:'BIM工程师',detail:'建筑信息模型搭建，Revit建模',salary:'12-22万/年',requirement:'本科及以上学历，土木工程/建筑学相关专业；熟练使用Revit等BIM软件；有BIM项目经验优先；了解建筑全生命周期管理',promotion:'BIM工程师→高级BIM/BIM主管（3年）→BIM负责人，BIM技术推广需求增长'},
      {title:'检测加固工程师',detail:'房屋检测、结构加固',salary:'10-20万/年',requirement:'本科及以上学历，土木工程/结构工程相关专业；了解结构检测和加固技术；熟悉相关规范；有检测实习经验优先；细心严谨',promotion:'检测工程师→注册检测工程师→检测负责人→检测总监，城市更新和老旧小区改造推动需求'}
    ],
    graduate:[
      {title:'结构工程硕士',detail:'土木工程学硕3年，进设计院/高校',salary:'补贴800-2000/月'},
      {title:'土木水利专硕',detail:'专硕2年，就业导向',salary:'补贴1200-3000/月'},
      {title:'智能建造方向',detail:'建筑业数字化转型',salary:'新兴方向，需求增长'}
    ],
    public:[
      {title:'住建局/规划局',detail:'政府建设管理部门',salary:'年薪10-18万'},
      {title:'事业单位（住建类）',detail:'质监站、安监站',salary:'年薪8-15万'},
      {title:'交通系统',detail:'公路/铁路局',salary:'年薪10-20万'}
    ],
    other:[
      {title:'留学（美国/英国）',detail:'美国土木工程硕士，名校就业好',salary:'留学费用30-60万'},
      {title:'房地产评估',detail:'资产评估事务所',salary:'12-22万/年'},
      {title:'工程监理',detail:'工程监理咨询',salary:'8-15万/年'}
    ]
  },
  '建筑学':{
    job:[
      {title:'建筑设计师',detail:'建筑方案设计、施工图设计，需创新思维',salary:'12-25万/年',requirement:'本科及以上学历，建筑学相关专业；扎实的建筑设计方案能力；熟练使用AutoCAD/SketchUp/Revit；有设计院实习经验优先；创新思维强',promotion:'建筑设计师→项目负责人（考取一建后）→设计总监→设计院院长，证书+经验加持'},
      {title:'城市规划师',detail:'城市规划设计，政策传导',salary:'12-25万/年',requirement:'本科及以上学历，城市规划/建筑学相关专业；熟悉城市规划原理和规范；了解国家政策；熟练使用GIS等专业软件；有规划设计院实习经验优先',promotion:'规划师→项目负责人（考取规划师证书）→规划所所长→总规划师，证书加持'},
      {title:'景观设计师',detail:'园林景观设计，绿化设计',salary:'10-20万/年',requirement:'本科及以上学历，风景园林/环境艺术相关专业；扎实的景观设计能力；熟练使用Photoshop/SketchUp；有设计院或景观公司实习经验优先',promotion:'景观设计师→项目负责人（3-5年）→景观设计总监，地产行业需求稳定'},
      {title:'室内设计师',detail:'室内装修设计，家装/工装',salary:'10-22万/年',requirement:'本科及以上学历，室内设计/环境艺术相关专业；扎实的室内设计方案能力；熟练使用3DMAX/AutoCAD；有设计公司实习经验优先；审美良好',promotion:'室内设计师→高级设计师/设计主管（3年）→设计总监，优秀设计师可成立个人工作室'},
      {title:'BIM建筑师',detail:'建筑信息化模型',salary:'12-22万/年',requirement:'本科及以上学历，建筑学/土木工程相关专业；熟练使用Revit等BIM软件；有BIM项目经验优先；了解建筑全生命周期管理',promotion:'BIM建筑师→高级BIM/BIM主管（3年）→BIM负责人，装配式建筑推动需求增长'}
    ],
    graduate:[
      {title:'建筑学硕士',detail:'建筑历史/设计/技术方向',salary:'补贴800-2000/月'},
      {title:'城市设计方向',detail:'城市设计、可持续建筑',salary:'新兴方向'},
      {title:'建筑历史与理论',detail:'古建筑保护、修缮',salary:'学术路线'}
    ],
    public:[
      {title:'规划局',detail:'政府规划管理部门',salary:'年薪10-18万'},
      {title:'设计院（国有）',detail:'国营设计院，稳定',salary:'年薪12-22万'},
      {title:'文保单位',detail:'文物保护单位',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（意大利/美国）',detail:'AA/Cooper Union/哈佛GSD',salary:'留学费用40-80万'},
      {title:'建筑摄影',detail:'建筑摄影、建筑渲染',salary:'10-25万/年（创业型）'},
      {title:'独立设计师',detail:'个人工作室，接项目',salary:'不固定，上限高'}
    ]
  },
  '教育学':{
    job:[
      {title:'中小学教师',detail:'学科教学，需教师资格证+教师编',salary:'年薪10-18万（带编）',requirement:'本科及以上学历，教育学/学科相关专业；持有教师资格证；普通话二甲以上；具备良好的授课能力；热爱教育事业',promotion:'教师→年级组长/教研组长（3年）→教务主任→副校长→校长，带编教师职称晋升：助教→讲师→副高→正高'},
      {title:'教育培训',detail:'新东方/好未来等，课程研发/教学',salary:'12-25万/年',requirement:'本科及以上学历，教育/学科相关专业；授课能力强，表达清晰；有教师资格证优先；喜欢与学生交流；能承受工作压力',promotion:'培训教师→高级教师/教研组长（3年）→校区教学负责人/校长，明星教师薪资上不封顶'},
      {title:'课程研发',detail:'教材编写、课程设计',salary:'10-20万/年',requirement:'本科及以上学历，教育学/课程与教学论相关专业；熟悉教材编写流程和课程设计原理；有教材编写或编辑经验优先；文字功底扎实',promotion:'课程研发专员→高级课程研发/研发主管（3年）→课程研发经理/总监'},
      {title:'教育产品经理',detail:'教育App/平台产品设计',salary:'15-28万/年',requirement:'本科及以上学历，教育技术/产品管理相关专业；了解教育行业和教育产品；有产品经理实习经验优先；良好的沟通和需求分析能力',promotion:'产品经理→高级PM/产品负责人（3年）→产品总监，在线教育行业发展前景好'},
      {title:'学校行政',detail:'高校行政、辅导员',salary:'年薪8-15万',requirement:'本科及以上学历，教育学/管理学相关专业；良好的沟通和组织协调能力；中共党员优先（有辅导员岗位需求）；细心严谨',promotion:'行政专员→行政主管（3年）→院系行政负责人→学校中层管理干部，体制内晋升需年限+考核'}
    ],
    graduate:[
      {title:'教育学硕士',detail:'教育原理/教育史，学术路线',salary:'补贴800-2000/月'},
      {title:'学科教育硕士',detail:'语数英等学科教学，师范类',salary:'补贴1200-2500/月'},
      {title:'教育技术方向',detail:'教育信息化、在线教育',salary:'互联网教育需求大'}
    ],
    public:[
      {title:'教育局',detail:'政府教育管理部门',salary:'年薪10-18万'},
      {title:'事业单位（教育类）',detail:'教研室、电教馆',salary:'年薪8-15万'},
      {title:'高校教师',detail:'硕士进专科/民办本科，博士进一本',salary:'年薪10-25万+科研'}
    ],
    other:[
      {title:'留学（教育学）',detail:'英国/澳洲教育学硕士，TESOL方向',salary:'留学费用20-45万'},
      {title:'留学顾问',detail:'留学申请咨询',salary:'底薪+提成10-25万/年'},
      {title:'教育创业',detail:'培训工作室、在线教育平台',salary:'风险高回报高'}
    ]
  },
  '心理学':{
    job:[
      {title:'心理咨询师',detail:'心理咨询/治疗，需经验积累+证书',salary:'100-500/小时（独立）',requirement:'本科及以上学历，心理学/临床心理相关专业；持有心理咨询师证书；完成咨询小时数和个人体验；良好的倾听和共情能力',promotion:'助理咨询师→初级咨询师→资深咨询师（积累2000+小时）→督导师/咨询机构负责人，独立执业后薪资上不封顶'},
      {title:'心理产品经理',detail:'心理App/平台产品',salary:'15-28万/年',requirement:'本科及以上学历，心理学/产品管理相关专业；了解心理健康行业；有互联网产品经验优先；良好的沟通和数据分析能力',promotion:'产品经理→高级PM/产品负责人（3年）→产品总监，心理健康行业快速发展'},
      {title:'人力资源（HR）',detail:'招聘/培训/员工关系',salary:'10-20万/年',requirement:'本科及以上学历，人力资源/心理/管理相关专业；熟悉HR六大模块；良好的沟通和组织协调能力；熟练使用Office软件',promotion:'HR专员→HR主管（3年）→HR经理→HR总监，人力资源晋升路径清晰'},
      {title:'市场研究',detail:'用户研究、消费心理',salary:'12-22万/年',requirement:'本科及以上学历，心理学/统计/市场营销相关专业；熟悉市场研究方法（问卷/访谈）；掌握SPSS等数据分析工具；有市场研究公司实习经验优先',promotion:'市场研究员→高级研究员/研究主管（3年）→研究经理→研究总监'},
      {title:'心理健康教师',detail:'中小学心理老师，需教师证',salary:'年薪8-15万（带编）',requirement:'本科及以上学历，心理学/教育学相关专业；持有教师资格证和心理健康教育教师证；普通话二甲以上；具备良好的沟通和辅导能力',promotion:'心理教师→心理健康教育负责人（3年）→教务副主任→教务主任，心理健康教育日益受重视'}
    ],
    graduate:[
      {title:'心理学硕士',detail:'基础心理学/应用心理学，学硕3年',salary:'补贴800-2000/月'},
      {title:'临床心理学方向',detail:'心理咨询与治疗，执照咨询师路线',salary:'需要长期督导和个人体验'},
      {title:'应用心理专硕',detail:'MAP，就业导向',salary:'补贴1500-3000/月'}
    ],
    public:[
      {title:'监狱/戒毒所',detail:'心理矫治工作',salary:'年薪10-18万'},
      {title:'公安系统',detail:'犯罪心理分析',salary:'年薪12-20万'},
      {title:'学校心理教师',detail:'中小学心理辅导',salary:'年薪8-15万（带编）'}
    ],
    other:[
      {title:'留学（临床心理学）',detail:'美国PsyD/PhD，心理咨询师培养',salary:'留学费用50-100万'},
      {title:'EAP咨询师',detail:'企业员工帮助计划',salary:'15-30万/年'},
      {title:'心理测评师',detail:'人才测评工具开发',salary:'15-25万/年'}
    ]
  },
  '新闻学':{
    job:[
      {title:'记者/编辑',detail:'传统媒体/新媒体，文字功底强',salary:'8-18万/年',requirement:'本科及以上学历，新闻/中文/传播学相关专业；扎实的新闻写作功底；有媒体实习或发表作品优先；敏锐的新闻嗅觉',promotion:'记者→资深记者/编辑部主任（3年）→总编辑/内容总监，媒体行业转型中'},
      {title:'新媒体运营',detail:'公众号/短视频运营，大厂需求大',salary:'12-25万/年',requirement:'本科及以上学历，新闻/传媒/营销相关专业；熟悉新媒体平台运营规则；有内容创作经验优先；了解数据分析',promotion:'运营专员→高级运营/运营主管（2-3年）→运营经理/内容总监，优秀运营薪资上不封顶'},
      {title:'内容策划',detail:'内容选题策划，IP打造',salary:'12-22万/年',requirement:'本科及以上学历，新闻/传媒/中文相关专业；优秀的创意策划能力；有成功IP运营经验优先；脑洞大，思维活跃',promotion:'策划专员→高级策划/策划主管（3年）→策划总监，IP经济推动职业发展'},
      {title:'视频编导',detail:'短视频/纪录片制作',salary:'12-25万/年',requirement:'本科及以上学历，广播电视编导/导演/摄影相关专业；熟练掌握拍摄和剪辑技能；有作品集优先；有创意思维',promotion:'编导→高级编导/导演（3年）→节目总监/内容总监，视频内容需求旺盛'},
      {title:'品牌公关',detail:'企业品牌传播，媒体关系',salary:'12-22万/年',requirement:'本科及以上学历，公关/传媒/营销相关专业；良好的沟通和协调能力；了解公关传播流程；有公关公司或企业PR实习经验优先',promotion:'公关专员→高级公关/公关主管（3年）→公关经理→公关总监，企业品牌意识增强推动需求'}
    ],
    graduate:[
      {title:'新闻传播学硕士',detail:'新闻学/传播学，学硕3年',salary:'补贴800-2000/月'},
      {title:'MJC（新闻专硕）',detail:'纽约大学/哥伦比亚大学模式',salary:'补贴1500-3000/月'},
      {title:'广播电视方向',detail:'纪录片/新媒体研究',salary:'新媒体行业需求大'}
    ],
    public:[
      {title:'宣传部',detail:'政府宣传部门',salary:'年薪10-18万'},
      {title:'央媒/党媒',detail:'人民日报/新华社，有编制',salary:'年薪12-20万'},
      {title:'高校新闻教师',detail:'硕博进高校任教',salary:'年薪10-20万+科研'}
    ],
    other:[
      {title:'留学（传媒）',detail:'英国LSE/美国哥大传播学，回国进媒体/大厂',salary:'留学费用30-60万'},
      {title:'自媒体/博主',detail:'个人IP打造，流量变现',salary:'不固定，上限高'},
      {title:'广告/公关公司',detail:'奥美/蓝色光标',salary:'10-20万/年'}
    ]
  },
  '市场营销':{
    job:[
      {title:'市场策划/品牌营销',detail:'品牌管理、市场推广、活动策划，大厂/快消',salary:'12-25万/年',requirement:'本科及以上学历，市场营销/广告/传媒相关专业；了解市场营销理论和方法；有市场策划实习经验优先；创意能力强',promotion:'市场专员→市场主管/品牌主管（2-3年）→市场经理→市场总监，晋升与业绩挂钩'},
      {title:'数字营销',detail:'SEM/SEO、信息流广告、社交媒体营销',salary:'15-28万/年',requirement:'本科及以上学历，市场营销/广告/计算机相关专业；了解数字营销工具和投放策略；有SEM/SEO经验优先；数据分析能力',promotion:'数字营销专员→高级营销/营销主管（2-3年）→营销经理→营销总监，数字营销需求持续增长'},
      {title:'产品经理',detail:'互联网产品策划，需市场洞察和用户思维',salary:'15-30万/年',requirement:'本科及以上学历，产品管理/市场营销/计算机相关专业；了解产品开发流程；有产品经理实习经验优先；良好的沟通和数据分析能力',promotion:'产品专员→产品经理→高级PM/产品负责人（3年）→产品总监，产品人才需求大'},
      {title:'销售/BD',detail:'商务拓展、客户关系，业绩导向',salary:'底薪+提成，上不封顶',requirement:'本科及以上学历，专业不限；良好的沟通和谈判能力；抗压能力强；有销售实习经验优先；结果导向',promotion:'销售代表→高级销售/销售主管（2-3年）→销售经理→销售总监，业绩为王，薪资上不封顶'},
      {title:'市场研究',detail:'消费者研究、竞争分析、数据洞察',salary:'12-22万/年',requirement:'本科及以上学历，市场营销/统计/心理学相关专业；熟悉市场研究方法；掌握SPSS/Python等分析工具；有市场研究公司实习经验优先',promotion:'市场研究员→高级研究员/研究主管（3年）→研究经理→研究总监'}
    ],
    graduate:[
      {title:'工商管理硕士（MBA）',detail:'市场营销方向，名校MBA',salary:'毕业5年薪资翻倍'},
      {title:'学术硕士',detail:'市场营销/消费者行为，学硕3年',salary:'补贴800-2000/月'},
      {title:'传播学方向',detail:'广告/公关/品牌传播',salary:'互联网营销需求大'}
    ],
    public:[
      {title:'市场监督管理局',detail:'工商管理、质量监督',salary:'年薪10-18万'},
      {title:'商务局',detail:'招商引资、贸易促进',salary:'年薪10-18万'},
      {title:'选调生',detail:'管理岗储备干部',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（Marketing）',detail:'美国/欧洲MBA Marketing方向',salary:'留学费用40-80万'},
      {title:'营销咨询',detail:'品牌咨询、营销策略',salary:'15-30万/年'},
      {title:'自媒体创业',detail:'个人IP、内容创业',salary:'风险高上限高'}
    ]
  },
  '数学与应用数学':{
    job:[
      {title:'量化分析师',detail:'量化投资、风险建模，需数学+编程',salary:'base+提成20-80万',requirement:'硕士及以上学历，数学/统计/金融工程相关专业；精通数学建模和统计分析；掌握Python/MATLAB；有量化策略开发经验优先',promotion:'量化分析师→高级量化/量化基金经理（3-5年）→量化投资总监，量化金融行业薪资顶尖'},
      {title:'数据分析师/科学家',detail:'SQL/Python/R，数据建模',salary:'15-35万/年',requirement:'本科及以上学历，数学/统计/计算机相关专业；精通SQL和Python/R；熟悉数据分析和建模方法；有数据分析项目经验优先',promotion:'数据分析师→高级分析师/数据科学家（2-3年）→数据科学负责人，数学背景转数据科学有优势'},
      {title:'算法工程师',detail:'机器学习/深度学习，需数学功底',salary:'25-60万/年',requirement:'硕士及以上学历，计算机/数学/统计相关专业；扎实的机器学习/深度学习理论基础；精通Python/C++；有竞赛获奖/顶会论文优先',promotion:'算法工程师→高级算法/算法专家（2年）→算法总监/研究科学家，数学背景是算法工程师的优势'},
      {title:'保险精算师',detail:'精算建模、风险评估，需精算证',salary:'20-50万/年',requirement:'本科及以上学历，保险学/数学/统计相关专业；通过精算师考试（北美SOA或中国精算师）；扎实的数学和统计学基础',promotion:'精算师→高级精算师/精算主管（3-5年）→精算负责人→总精算师，精算证书加持，薪资稳步增长'},
      {title:'教师/培训',detail:'初高中数学教师，培训讲师',salary:'10-20万/年（带编更高）',requirement:'本科及以上学历，数学/教育学相关专业；持有教师资格证；数学功底扎实；授课逻辑清晰；有教师实习经验优先',promotion:'教师→年级备课组长/教研组长（3年）→教务主任→副校长/校长，带编教师职称晋升：助教→讲师→副高→正高'}
    ],
    graduate:[
      {title:'数学硕士',detail:'基础数学/应用数学，学硕3年',salary:'补贴800-2000/月'},
      {title:'统计学硕士',detail:'数据科学/金融统计',salary:'补贴1200-2500/月'},
      {title:'计算机方向',detail:'CS/AI，读博或进大厂算法岗',salary:'大厂算法岗薪资顶尖'}
    ],
    public:[
      {title:'统计局',detail:'政府统计岗位',salary:'年薪10-18万'},
      {title:'税务局',detail:'税务计算、稽查',salary:'年薪10-18万'},
      {title:'银保监',detail:'金融监管，需统计/数学背景',salary:'年薪15-25万'}
    ],
    other:[
      {title:'留学（金融数学/统计）',detail:'美国金数/英国统计，热门留学方向',salary:'留学费用30-60万'},
      {title:'FinTech创业',detail:'金融科技创业',salary:'风险高回报高'},
      {title:'数学竞赛培训',detail:'奥赛教练、培训讲师',salary:'15-35万/年'}
    ]
  },
  '新闻学':{
    job:[
      {title:'记者/编辑',detail:'传统媒体/新媒体，文字功底扎实',salary:'8-18万/年'},
      {title:'新媒体运营',detail:'公众号、短视频运营，大厂薪资高',salary:'12-25万/年'},
      {title:'内容策划',detail:'内容矩阵、选题策划',salary:'12-22万/年'},
      {title:'公关/品牌',detail:'企业公关、媒体关系',salary:'10-20万/年'},
      {title:'影视编剧',detail:'剧本创作，创意导向',salary:'不固定，上限高'}
    ],
    graduate:[
      {title:'新闻传播学硕士',detail:'新闻学/传播学，学硕3年',salary:'补贴800-2000/月'},
      {title:'MJC（新闻专硕）',detail:'新闻专硕2年，就业导向',salary:'补贴1200-2500/月'},
      {title:'广播电视方向',detail:'广电、新媒体技术',salary:'融媒体需求大'}
    ],
    public:[
      {title:'宣传部',detail:'政府宣传部门',salary:'年薪10-18万'},
      {title:'电视台/报社',detail:'事业编制，稳定',salary:'年薪8-15万'},
      {title:'央企国企宣传',detail:'企业文化、宣传部门',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（传媒）',detail:'美国/英国传媒硕士',salary:'留学费用25-50万'},
      {title:'自媒体创业',detail:'个人IP打造',salary:'风险高上限高'},
      {title:'MCN机构',detail:'网红孵化、内容运营',salary:'底薪+提成'}
    ]
  },
  '护理学':{
    job:[
      {title:'临床护士',detail:'各级医院临床护理，三甲医院竞争激烈',salary:'年薪10-18万（编制内）',requirement:'大专及以上学历，护理学专业；持有护士执业资格证；具备良好的沟通能力和应急处理能力；能适应夜班',promotion:'护士→护师（考取证书后）→主管护师→副主任护师→主任护师，职称晋升与年限+考试+论文挂钩'},
      {title:'护理管理',detail:'护士长、护理部主任',salary:'主管护师后15-25万',requirement:'本科及以上学历，护理学专业；主管护师及以上职称；有丰富的临床护理经验；良好的组织协调和领导能力',promotion:'护士长→护理部副主任→护理部主任（5-8年）→分管护理副院长，护理管理岗位稳定'},
      {title:'医疗美容',detail:'医美机构护士，环境好薪资高',salary:'12-22万/年',requirement:'大专及以上学历，护理学专业；持有护士执业资格证；形象气质佳；服务意识强；有医美行业实习经验优先',promotion:'医美护士→医美现场咨询师→医美现场主管（3年）→医美机构院长，医美行业发展迅猛'},
      {title:'口腔护士',detail:'口腔诊所，工作相对轻松',salary:'8-15万/年',requirement:'大专及以上学历，护理学专业；持有护士执业资格证；了解口腔科护理操作；细心耐心；能与患者良好沟通',promotion:'口腔护士→口腔护士长（3年）→口腔门诊管理者，工作环境好，强度低于临床护士'},
      {title:'健康管理',detail:'高端健康管理机构',salary:'12-20万/年',requirement:'本科及以上学历，健康管理/护理/临床医学相关专业；了解健康管理知识和流程；良好的沟通和服务意识；有健康管理机构实习经验优先',promotion:'健康管理师→高级健康管理/健康管理主管（3年）→健康管理负责人，高端健康管理需求增长'}
    ],
    graduate:[
      {title:'护理学硕士',detail:'护理教育/管理方向，学硕3年',salary:'补贴800-2000/月'},
      {title:'护理专硕',detail:'临床护理方向',salary:'补贴1200-2500/月'},
      {title:'护理学博士',detail:'护理教育/科研，读博或高校',salary:'博士安家费+科研启动费'}
    ],
    public:[
      {title:'医院事业编',detail:'公立医院编制，稳定性强',salary:'年薪10-18万'},
      {title:'卫生局/疾控',detail:'卫生行政管理',salary:'年薪10-18万'},
      {title:'血站/急救中心',detail:'事业编',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（护理）',detail:'美国/澳洲护士，移民方向',salary:'海外护士薪资高'},
      {title:'医疗翻译',detail:'医疗陪同翻译',salary:'日薪500-2000'},
      {title:'健康管理创业',detail:'陪诊、居家护理',salary:'市场需求增长'}
    ]
  },
  '视觉传达设计':{
    job:[
      {title:'品牌设计师',detail:'VI系统、logo、包装设计',salary:'12-25万/年',requirement:'本科及以上学历，视觉传达/平面设计相关专业；熟练使用AI/PS/CDR等设计软件；有品牌设计作品集优先；审美良好',promotion:'设计师→高级设计师/设计主管（3年）→设计总监，优秀设计师可成立个人工作室'},
      {title:'UI/UX设计师',detail:'App/Web界面设计，大厂需求大',salary:'15-30万/年',requirement:'本科及以上学历，视觉传达/交互设计/数字媒体相关专业；熟练使用Figma/Sketch/AI/PS；有UI/UX设计作品集优先；了解用户体验设计原则',promotion:'UI/UX设计师→高级设计师/设计组长（3年）→设计主管→设计总监，互联网行业需求大'},
      {title:'平面设计师',detail:'海报、广告、宣传物料',salary:'10-20万/年',requirement:'本科及以上学历，视觉传达/平面设计相关专业；熟练使用AI/PS等设计软件；有设计作品集优先；审美良好',promotion:'设计师→高级设计师/设计主管（3年）→设计总监，广告公司/企业设计部门需求稳定'},
      {title:'插画师',detail:'商业插画、原画设计',salary:'12-25万/年',requirement:'本科及以上学历，插画/动画/视觉传达相关专业；有插画作品集优先；手绘能力强；创意思维活跃',promotion:'插画师→高级插画师/插画主管（3年）→插画总监，插画师可独立执业或成立工作室'},
      {title:'包装设计师',detail:'产品包装、品牌包装',salary:'10-22万/年',requirement:'本科及以上学历，视觉传达/包装工程相关专业；熟练使用AI/PS等设计软件；了解包装材料和印刷工艺；有包装设计作品集优先',promotion:'包装设计师→高级设计师/包装设计主管（3年）→包装设计总监，食品/化妆品行业需求稳定'}
    ],
    graduate:[
      {title:'设计学硕士',detail:'视觉传达方向，学硕3年',salary:'补贴800-2000/月'},
      {title:'艺术设计专硕',detail:'专硕2年，作品集导向',salary:'补贴1200-2500/月'},
      {title:'数字媒体方向',detail:'交互设计、新媒体艺术',salary:'互联网需求大'}
    ],
    public:[
      {title:'设计院',detail:'国有设计院，稳定',salary:'年薪10-18万'},
      {title:'文化局/博物馆',detail:'文创设计',salary:'年薪8-15万'},
      {title:'学校美术教师',detail:'需教师资格证',salary:'年薪8-15万（带编）'}
    ],
    other:[
      {title:'留学（艺术设计）',detail:'美国/英国艺术学院',salary:'留学费用30-70万'},
      {title:'独立设计师',detail:'个人工作室，接项目',salary:'不固定，上限高'},
      {title:'设计电商',detail:'设计素材网站、模板销售',salary:'被动收入型'}
    ]
  },
  '学前教育':{
    job:[
      {title:'幼儿教师（幼儿园）',detail:'学前教育，需教师资格证',salary:'年薪8-15万（带编更高）',requirement:'大专及以上学历，学前教育专业；持有教师资格证；喜欢孩子；有幼儿园实习经验优先',promotion:'幼儿教师→年级组长/教研组长（3年）→教务主任→副园长→园长，带编教师职称晋升：助教→幼教一级→幼教高级'},
      {title:'幼教产品经理',detail:'幼儿教育App/产品',salary:'12-22万/年',requirement:'本科及以上学历，学前教育/产品管理相关专业；了解幼儿教育行业和产品；有产品经理实习经验优先；良好的沟通能力',promotion:'产品经理→高级PM/产品负责人（3年）→产品总监，在线幼儿教育行业发展前景好'},
      {title:'儿童康复师',detail:'特殊儿童康复训练',salary:'12-22万/年',requirement:'本科及以上学历，康复治疗/特殊教育相关专业；持有康复治疗师资格证优先；了解儿童发展心理学；有康复机构实习经验优先',promotion:'康复师→高级康复师/康复主管（3年）→康复科负责人，特殊儿童康复需求增长'},
      {title:'亲子活动策划',detail:'早教中心、亲子活动',salary:'10-18万/年',requirement:'本科及以上学历，学前教育/市场营销相关专业；了解儿童发展特点；有活动策划经验优先；创意和执行力强',promotion:'策划专员→高级策划/策划主管（3年）→活动总监，亲子消费升级推动需求'},
      {title:'儿童出版/编辑',detail:'绘本、儿童读物编辑',salary:'8-15万/年',requirement:'本科及以上学历，学前教育/儿童文学/编辑出版相关专业；扎实的文字功底和文学素养；了解儿童阅读特点；有出版社实习经验优先',promotion:'编辑→高级编辑/编辑部主任（3-5年）→副总编辑/总编辑，童书市场稳定增长'}
    ],
    graduate:[
      {title:'教育学硕士',detail:'学前教育方向，学硕3年',salary:'补贴800-2000/月'},
      {title:'学前教育专硕',detail:'专硕2年，实践导向',salary:'补贴1200-2500/月'},
      {title:'儿童发展方向',detail:'儿童心理学、发展教育',salary:'学术/实践皆可'}
    ],
    public:[
      {title:'幼儿园（事业编）',detail:'公立幼儿园教师',salary:'年薪8-15万'},
      {title:'教育局',detail:'学前教育管理',salary:'年薪10-18万'},
      {title:'少年宫/妇女儿童中心',detail:'事业单位',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（学前教育）',detail:'英国/澳洲幼教，移民方向',salary:'留学费用20-40万'},
      {title:'幼教创业',detail:'幼儿园/早教中心',salaritype:'需投资，但回报稳定'},
      {title:'儿童内容创业',detail:'绘本、动画、自媒体',salary:'内容创业型'}
    ]
  },
  '通信工程':{
    job:[
      {title:'通信协议工程师',detail:'5G/LTE/蓝牙协议开发',salary:'15-30万/年',requirement:'本科及以上学历，通信/电子/计算机相关专业；熟悉通信原理和协议栈；了解5G/LTE/蓝牙协议；有通信设备商实习经验优先',promotion:'协议工程师→高级协议/系统工程师（3年）→通信系统负责人，5G技术发展推动需求'},
      {title:'网络优化工程师',detail:'通信网络优化、运维',salary:'12-22万/年',requirement:'本科及以上学历，通信/网络/电子相关专业；了解通信网络原理和优化技术；有网络优化实习经验优先；能适应出差',promotion:'网络优化工程师→高级优化/项目主管（3年）→网络优化负责人，运营商和设备商需求稳定'},
      {title:'嵌入式工程师',detail:'通信设备嵌入式开发',salary:'15-28万/年',requirement:'本科及以上学历，通信/电子/计算机相关专业；熟悉STM32/ARM开发；了解RTOS和驱动开发；有嵌入式项目经验优先',promotion:'嵌入式工程师→高级嵌入式/系统架构师（3年）→嵌入式技术负责人，物联网推动需求增长'},
      {title:'硬件工程师',detail:'通信硬件设计、射频',salary:'12-25万/年',requirement:'本科及以上学历，通信/电子/自动化相关专业；熟悉电路原理和PCB设计；了解射频技术；有硬件设计项目经验优先',promotion:'硬件工程师→高级硬件/硬件组长（3年）→硬件经理→硬件总监，通信设备商需求稳定'},
      {title:'光网络工程师',detail:'光纤通信网络',salary:'12-22万/年',requirement:'本科及以上学历，通信/光电/网络相关专业；了解光纤通信原理和技术；有光网络项目经验优先；细心严谨',promotion:'光网络工程师→高级工程师/项目负责人（3年）→光网络负责人，5G和数据中心推动需求'}
    ],
    graduate:[
      {title:'信息与通信工程硕士',detail:'学硕3年，通信/信号处理',salary:'补贴800-2000/月'},
      {title:'电子信息专硕',detail:'专硕2年，就业导向',salary:'补贴1200-3000/月'},
      {title:'5G/6G研究方向',detail:'下一代通信技术',salary:'科研院所需求大'}
    ],
    public:[
      {title:'运营商',detail:'移动/电信/联通，技术岗',salary:'年薪10-20万'},
      {title:'军工院所',detail:'航天/电子对抗',salary:'年薪12-25万+福利'},
      {title:'铁路通信',detail:'高铁/地铁通信维护',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（通信）',detail:'美国/欧洲通信工程',salary:'留学费用30-60万'},
      {title:'智能硬件',detail:'物联网设备',salary:'15-28万/年'},
      {title:'车联网',detail:'V2X通信',salary:'15-30万/年'}
    ]
  },
  '统计学':{
    job:[
      {title:'数据分析师',detail:'SQL/Hive/Python，数据提取分析',salary:'15-30万/年',requirement:'本科及以上学历，统计/数学/计算机相关专业；精通SQL和Python/R；熟悉数据分析和建模方法；有数据分析项目经验优先',promotion:'数据分析师→高级分析师/数据分析组长（2-3年）→数据分析经理→数据总监，职业路径清晰'},
      {title:'数据工程师',detail:'ETL、数据仓库',salary:'18-32万/年',requirement:'本科及以上学历，计算机/统计相关专业；精通SQL和Python/Java；熟悉Hadoop/Spark等技术；有数据仓库ETL项目经验优先',promotion:'数据工程师→高级数据工程师/数据架构师（3年）→数据工程经理→数据平台负责人'},
      {title:'保险精算师',detail:'精算建模，需考精算师证',salary:'20-50万/年',requirement:'本科及以上学历，保险学/数学/统计相关专业；通过精算师考试（北美SOA或中国精算师）；扎实的数学和统计学基础',promotion:'精算师→高级精算师/精算主管（3-5年）→精算负责人→总精算师，精算证书加持'},
      {title:'生物统计师',detail:'药企/CRO，临床试验统计',salary:'15-28万/年',requirement:'本科及以上学历，统计/生物统计/流行病学相关专业；掌握SAS/R编程；熟悉临床试验统计方法；有药企或CRO实习经验优先',promotion:'生物统计师→高级统计师/统计主管（3年）→生物统计负责人，医药行业推动需求增长'},
      {title:'市场研究',detail:'消费者研究、数据洞察',salary:'12-22万/年',requirement:'本科及以上学历，统计/市场营销/心理学相关专业；熟悉市场研究方法；掌握SPSS/Python等分析工具；有市场研究公司实习经验优先',promotion:'市场研究员→高级研究员/研究主管（3年）→研究经理→研究总监'}
    ],
    graduate:[
      {title:'统计学硕士',detail:'数理统计/应用统计，学硕3年',salary:'补贴800-2000/月'},
      {title:'数据科学硕士',detail:'DS方向，热门',salary:'补贴1500-3000/月'},
      {title:'生物统计方向',detail:'公共卫生、药企需求大',salary:'北美生物统计就业好'}
    ],
    public:[
      {title:'统计局',detail:'政府统计岗位',salary:'年薪10-18万'},
      {title:'银保监',detail:'金融监管统计',salary:'年薪15-25万'},
      {title:'卫健委',detail:'卫生统计、疾控',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（统计/生统）',detail:'美国生物统计名校，移民方向',salary:'留学费用30-60万'},
      {title:'金融科技',detail:'量化投资、风控建模',salary:'20-60万/年'},
      {title:'市场调研公司',detail:'咨询型公司',salary:'12-22万/年'}
    ]
  },
  '电气工程及其自动化':{
    job:[
      {title:'电气工程师',detail:'电力系统设计、PLC控制，大厂/国企',salary:'12-25万/年',requirement:'本科及以上学历，电气/自动化/控制工程相关专业；熟悉电气设计和PLC编程；有电气设计项目经验优先',promotion:'电气工程师→高级电气/电气主管（3年）→电气经理→电气总监，国企/大厂需求稳定'},
      {title:'自动化工程师',detail:'工业自动化、SCADA系统',salary:'12-25万/年',requirement:'本科及以上学历，自动化/控制/电气相关专业；熟悉PLC编程和SCADA/DCS系统；有自动化项目调试经验优先',promotion:'自动化工程师→高级工程师/项目经理（3年）→自动化部门负责人，工业4.0推动需求'},
      {title:'电力电子工程师',detail:'电源设计、逆变器、新能源',salary:'15-30万/年',requirement:'本科及以上学历，电气/电力电子/自动化相关专业；熟悉电力电子拓扑和功率器件；有电源设计项目经验优先',promotion:'电力电子工程师→高级工程师/技术专家（3年）→电力电子技术负责人，新能源行业推动需求'},
      {title:'国家电网/南方电网',detail:'电网调度、运维，稳定',salary:'年薪12-20万',requirement:'本科及以上学历，电气/电力系统/自动化相关专业；通过电网校园招聘考试；了解电力系统运行原理；能适应倒班工作',promotion:'运维/调度员→班组长→部门主管（3-5年）→中层管理干部，央企稳定福利好'},
      {title:'电机设计工程师',detail:'电机设计、电磁仿真',salary:'12-25万/年',requirement:'本科及以上学历，电气/电机/机械相关专业；熟悉电机原理和设计方法；了解电磁仿真软件；有电机设计项目经验优先',promotion:'电机设计工程师→高级工程师/技术专家（3年）→电机技术负责人，新能源汽车推动需求'}
    ],
    graduate:[
      {title:'电气工程硕士',detail:'电力系统/电力电子，学硕3年',salary:'补贴800-2000/月'},
      {title:'控制科学与工程',detail:'控制理论、自动化',salary:'补贴1200-3000/月'},
      {title:'新能源方向',detail:'储能、氢能、光伏',salary:'新能源行业需求大'}
    ],
    public:[
      {title:'国家电网/南方电网',detail:'央企，稳定，校园招聘',salary:'年薪12-20万'},
      {title:'电力设计院',detail:'电力规划设计院',salary:'年薪12-22万'},
      {title:'军工院所',detail:'航空航天、船舶',salary:'年薪12-25万+福利'}
    ],
    other:[
      {title:'留学（德国/美国）',detail:'德国TU9/美国名校电气工程',salary:'留学费用20-60万'},
      {title:'新能源企业',detail:'宁德时代、比亚迪',salary:'15-30万/年'},
      {title:'智能制造',detail:'工厂自动化改造',salary:'12-25万/年'}
    ]
  },
  '城乡规划':{
    job:[
      {title:'城市规划师',detail:'城市规划设计、总规详规',salary:'12-25万/年',requirement:'本科及以上学历，城市规划/建筑学相关专业；熟悉城市规划原理和规范；熟练使用GIS等专业软件；有规划设计院实习经验优先',promotion:'规划师→项目负责人（考取规划师证书）→规划所所长→总规划师，证书加持'},
      {title:'建筑设计师',detail:'建筑设计、施工图',salary:'12-25万/年',requirement:'本科及以上学历，建筑学相关专业；扎实的建筑设计方案能力；熟练使用AutoCAD/SketchUp/Revit；有设计院实习经验优先',promotion:'建筑设计师→项目负责人（考取一建后）→设计总监→设计院院长，证书+经验加持'},
      {title:'景观设计师',detail:'园林景观、绿化设计',salary:'10-22万/年',requirement:'本科及以上学历，风景园林/环境艺术相关专业；扎实的景观设计方案能力；熟练使用Photoshop/SketchUp；有设计院或景观公司实习经验优先',promotion:'景观设计师→项目负责人（3-5年）→景观设计总监，地产行业需求稳定'},
      {title:'土地规划师',detail:'土地利用规划、用地审批',salary:'10-20万/年',requirement:'本科及以上学历，土地资源管理/城市规划相关专业；熟悉土地规划政策和法规；有土地规划项目经验优先',promotion:'土地规划师→高级规划师/项目负责人（3年）→土地规划部门负责人，政府部门需求稳定'},
      {title:'交通规划师',detail:'交通系统规划',salary:'12-22万/年',requirement:'本科及以上学历，交通工程/城市规划/物流相关专业；熟悉交通规划原理和方法；有交通规划项目经验优先；了解交通仿真软件',promotion:'交通规划师→高级规划师/项目负责人（3年）→交通规划部门负责人，智慧交通推动需求'}
    ],
    graduate:[
      {title:'城乡规划学硕士',detail:'城市规划/设计，学硕3年',salary:'补贴800-2000/月'},
      {title:'城市规划专硕',detail:'专硕2年，实践导向',salary:'补贴1200-2500/月'},
      {title:'城市设计方向',detail:'城市更新、存量规划',salary:'新兴热点方向'}
    ],
    public:[
      {title:'自然资源局',detail:'规划管理、土地利用',salary:'年薪10-18万'},
      {title:'住建局',detail:'城市建设管理',salary:'年薪10-18万'},
      {title:'规划设计院',detail:'国有设计院，稳定',salary:'年薪12-22万'}
    ],
    other:[
      {title:'留学（城市规划）',detail:'美国/英国城市规划',salary:'留学费用30-60万'},
      {title:'房地产公司',detail:'前期策划、规划设计',salary:'15-28万/年'},
      {title:'GIS开发',detail:'城市规划信息化',salary:'15-28万/年'}
    ]
  },
  '广告学':{
    job:[
      {title:'广告策划/文案',detail:'广告创意、文案撰写',salary:'10-20万/年',requirement:'本科及以上学历，广告/新闻/中文相关专业；扎实的文字功底和创意能力；有广告文案作品集优先；创意思维活跃',promotion:'文案→高级文案/创意组长（3年）→创意总监/副总创意总监，广告行业晋升透明'},
      {title:'品牌设计师',detail:'品牌VI、包装设计',salary:'12-25万/年',requirement:'本科及以上学历，视觉传达/平面设计相关专业；熟练使用AI/PS/CDR等设计软件；有品牌设计作品集优先',promotion:'设计师→高级设计师/设计主管（3年）→设计总监，广告公司/设计机构需求稳定'},
      {title:'媒介策划',detail:'媒体投放、效果分析',salary:'12-22万/年',requirement:'本科及以上学历，广告/传媒/市场营销相关专业；了解媒体投放流程和效果分析；有媒介策划实习经验优先',promotion:'媒介策划→高级媒介/媒介主管（3年）→媒介总监，数字营销推动需求'},
      {title:'AE（客户执行）',detail:'客户服务、项目对接',salary:'10-18万/年',requirement:'本科及以上学历，广告/传媒/市场营销相关专业；良好的沟通和协调能力；能承受工作压力；有广告公司实习经验优先',promotion:'AE→高级AE/客户主管（3年）→客户总监，广告行业客户关系重要'},
      {title:'新媒体运营',detail:'社交媒体、内容营销',salary:'12-22万/年',requirement:'本科及以上学历，广告/传媒/市场营销相关专业；熟悉新媒体平台运营规则；有内容创作经验优先；了解数据分析',promotion:'运营专员→高级运营/运营主管（2-3年）→运营经理→运营总监，新媒体行业蓬勃发展'}
    ],
    graduate:[
      {title:'传播学硕士',detail:'广告学/传播学，学硕3年',salary:'补贴800-2000/月'},
      {title:'MJC新闻传播专硕',detail:'专硕2年，实践导向',salary:'补贴1200-2500/月'},
      {title:'数字营销方向',detail:'效果广告、信息流',salary:'互联网营销需求大'}
    ],
    public:[
      {title:'市场监督管理局',detail:'广告监管执法',salary:'年薪10-18万'},
      {title:'宣传部',detail:'政府宣传部门',salary:'年薪10-18万'},
      {title:'央企国企品牌部',detail:'企业文化宣传',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（广告传媒）',detail:'美国/英国广告硕士',salary:'留学费用25-50万'},
      {title:'MCN机构',detail:'网红孵化、内容运营',salary:'底薪+提成'},
      {title:'广告创业工作室',detail:'创意热店',salary:'创业型，收入不固定'}
    ]
  },
  '美术学':{
    job:[
      {title:'美术教师',detail:'中小学/培训机构，需教师证',salary:'8-18万/年（带编更高）'},
      {title:'艺术策展人',detail:'美术馆、画廊策展',salary:'10-20万/年'},
      {title:'美术编辑',detail:'出版社、期刊编辑',salary:'8-15万/年'},
      {title:'文物修复',detail:'博物馆、文物修复',salary:'8-15万/年'},
      {title:'画廊/拍卖行',detail:'艺术市场、鉴定',salary:'10-20万/年'}
    ],
    graduate:[
      {title:'美术学硕士',detail:'美术史论/美术教育，学硕3年',salary:'补贴800-2000/月'},
      {title:'艺术硕士（MFA）',detail:'美术创作，专硕2-3年',salary:'补贴1200-2500/月'},
      {title:'文物与博物馆方向',detail:'博物馆学、文物保护',salary:'学术/实践皆可'}
    ],
    public:[
      {title:'美术馆/博物馆',detail:'事业编，展览策划',salary:'年薪8-15万'},
      {title:'文化局',detail:'文化管理',salary:'年薪10-18万'},
      {title:'学校美术教师',detail:'需教师资格证',salary:'年薪8-15万（带编）'}
    ],
    other:[
      {title:'留学（艺术史）',detail:'英国/美国艺术史',salary:'留学费用25-50万'},
      {title:'艺术评论家',detail:'撰稿、评论',salary:'不固定'},
      {title:'画廊创业',detail:'艺术品交易',salary:'创业型'}
    ]
  },
  '数字媒体艺术':{
    job:[
      {title:'影视后期',detail:'AE/PR/C4D，视频特效',salary:'12-25万/年',requirement:'本科及以上学历，数字媒体/影视编导/动画相关专业；熟练使用AE/PR/C4D等软件；有视频作品集优先',promotion:'后期制作→高级后期/项目负责人（3年）→后期总监，视频内容需求旺盛'},
      {title:'三维建模师',detail:'3D建模、渲染',salary:'12-25万/年',requirement:'本科及以上学历，数字媒体/动画/游戏美术相关专业；熟练使用3DMax/Maya/Blender等软件；有3D建模作品集优先',promotion:'建模师→高级建模/建模组长（3年）→美术总监，游戏/影视行业需求稳定'},
      {title:'游戏美术',detail:'原画、场景、角色',salary:'15-30万/年',requirement:'本科及以上学历，游戏美术/动画/视觉传达相关专业；有游戏美术作品集；手绘能力强；了解游戏美术制作流程',promotion:'游戏美术→高级美术/美术组长（3年）→美术总监→主美，游戏行业薪资较高'},
      {title:'UI设计师',detail:'App/Web界面设计',salary:'15-28万/年',requirement:'本科及以上学历，视觉传达/交互设计/数字媒体相关专业；熟练使用Figma/Sketch/AI/PS；有UI设计作品集优先',promotion:'UI设计师→高级设计师/设计组长（3年）→设计主管→设计总监，互联网行业需求大'},
      {title:'动画师',detail:'2D/3D动画',salary:'12-25万/年',
       requirement:'本科及以上学历，动画/数字媒体/影视相关专业；熟练使用Animate/Toon Boom/3DMax/Maya等动画软件；具备良好的美术基础和动画原理知识；有动画作品集优先',
       promotion:'动画师→高级动画师/动画组长（3年）→动画总监→主流动画导演，动漫/游戏行业需求旺盛'}
    ],
    graduate:[
      {title:'数字媒体艺术硕士',detail:'新媒体艺术/交互设计',salary:'补贴800-2000/月'},
      {title:'艺术设计专硕',detail:'专硕2年，作品集导向',salary:'补贴1200-2500/月'},
      {title:'游戏设计方向',detail:'游戏设计、交互叙事',salary:'游戏行业需求大'}
    ],
    public:[
      {title:'电视台/融媒体',detail:'影视制作',salary:'年薪10-18万'},
      {title:'学校美术/设计教师',detail:'需教师资格证',salary:'年薪8-15万（带编）'},
      {title:'文化馆/少年宫',detail:'艺术教育',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（游戏/动画）',detail:'美国/日本游戏设计',salary:'留学费用30-60万'},
      {title:'短视频/自媒体',detail:'内容创作',salary:'不固定，上限高'},
      {title:'独立艺术家',detail:'个人创作',salary:'不固定'}
    ]
  },
  '人力资源管理':{
    job:[
      {title:'HR专员/HRBP',detail:'招聘、培训、绩效',salary:'10-20万/年',
       requirement:'本科及以上学历，人力资源/管理/心理相关专业；良好的沟通能力和组织协调能力；熟悉HR六大模块基础；熟练使用Office软件；有HR实习经验优先',
       promotion:'HR专员→HR主管（3年）→HR经理→HR总监，人力资源晋升路径清晰，稳定'},
      {title:'猎头顾问',detail:'高端人才招聘',salary:'底薪+提成20-50万/年',
       requirement:'本科及以上学历，专业不限；良好的沟通能力和抗压能力；有人才招聘或销售经验优先；目标导向，结果驱动',
       promotion:'猎头顾问→高级猎头/团队主管（2-3年）→猎头合伙人，优秀猎头收入上不封顶'},
      {title:'薪酬福利专员',detail:'薪酬设计、社保公积金',salary:'10-18万/年',
       requirement:'本科及以上学历，人力资源/财务/会计相关专业；细心严谨，数字敏感；熟悉薪酬福利政策和EXCEL函数；有薪酬核算实习经验优先',
       promotion:'薪酬专员→薪酬主管（3年）→薪酬经理→薪酬总监，专业化路径清晰'},
      {title:'HR产品经理',detail:'HR软件/SaaS产品',salary:'15-28万/年',
       requirement:'本科及以上学历，人力资源/计算机/产品相关专业；了解HR行业和SaaS产品；良好的逻辑思维和沟通能力；有HR软件或B端产品实习经验优先',
       promotion:'HR产品经理→高级产品经理/产品总监（3年）→HR科技公司高管，HR科技赛道前景好'},
      {title:'企业文化专员',detail:'员工关系、文化建设',salary:'10-18万/年',
       requirement:'本科及以上学历，中文/新闻/人力资源相关专业；良好的文字功底和活动策划能力；熟悉企业文化工作；有学生会/社团经历优先',
       promotion:'企业文化专员→企业文化主管（3年）→企业文化经理，文化建设越来越受企业重视'}
    ],
    graduate:[
      {title:'工商管理硕士（MBA）',detail:'人力资源方向',salary:'名校MBA回报高'},
      {title:'人力资源管理硕士',detail:'学硕3年，学术路线',salary:'补贴800-2000/月'},
      {title:'劳动经济学',detail:'劳动关系、人才政策',salary:'学术/实践皆可'}
    ],
    public:[
      {title:'人社局',detail:'人力资源管理',salary:'年薪10-18万'},
      {title:'组织部',detail:'干部管理',salary:'年薪10-18万'},
      {title:'央企国企HR',detail:'人力资源部',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（HR）',detail:'美国/英国HR硕士',salary:'留学费用25-50万'},
      {title:'管理咨询',detail:'人力咨询公司',salary:'15-30万/年'},
      {title:'HR科技创业',detail:'HR SaaS',salary:'创业型'}
    ]
  },
  '国际经济与贸易':{
    job:[
      {title:'外贸业务员',detail:'进出口业务，跟单',salary:'底薪+提成8-20万/年',
       requirement:'本科及以上学历，国贸/英语/商务相关专业；通过CET-4/6；熟悉外贸进出口流程；良好的沟通和谈判能力；能承受压力',
       promotion:'外贸业务员→高级外贸/外贸主管（3年）→外贸经理/总监，积累客户资源后薪资大幅提升'},
      {title:'跨境电商运营',detail:'亚马逊/阿里国际站',salary:'10-22万/年',
       requirement:'本科及以上学历，电商/国贸/英语相关专业；熟悉亚马逊/阿里国际站等平台操作；良好的数据分析能力；英语可作为工作语言优先',
       promotion:'运营专员→高级运营/运营主管（2-3年）→运营经理，跨境电商行业蓬勃发展'},
      {title:'报关员/货代',detail:'报关、货运代理',salary:'8-15万/年',
       requirement:'本科及以上学历，国贸/物流/报关相关专业；持有报关员资格证/货代资格证优先；细心严谨，熟悉报关流程和海关法规',
       promotion:'报关员/货代→高级报关/货代主管（3年）→报关行/货代公司管理层，专业性强'},
      {title:'银行国际业务',detail:'国际结算、信用证',salary:'12-22万/年',
       requirement:'本科及以上学历，金融/国贸/会计相关专业；通过CET-6；熟悉国际结算和信用证业务；良好的风险控制意识；国有银行或外资银行',
       promotion:'国际业务柜员→国际业务客户经理（3年）→国际业务部门主管→支行副行长，国有银行晋升需年限+考核'},
      {title:'商务专员',detail:'商务谈判、合同管理',salary:'10-18万/年',
       requirement:'本科及以上学历，法律/国贸/商务管理相关专业；通过CET-4/6；熟悉商务谈判和合同法；良好的沟通协调和表达能力',
       promotion:'商务专员→商务主管（3年）→商务经理→商务总监，企业国际化带动需求'}
    ],
    graduate:[
      {title:'国际贸易学硕士',detail:'学硕3年，学术路线',salary:'补贴800-2000/月'},
      {title:'国际商务硕士',detail:'专硕2年，实践导向',salary:'补贴1200-2500/月'},
      {title:'金融方向',detail:'国际金融、跨境金融',salary:'复合背景薪资高'}
    ],
    public:[
      {title:'商务部/海关',detail:'外贸管理、关税',salary:'年薪10-18万'},
      {title:'税务局',detail:'进出口税务',salary:'年薪10-18万'},
      {title:'贸促会',detail:'贸易促进',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（国际商务）',detail:'美国/欧洲IB硕士',salary:'留学费用30-60万'},
      {title:'跨境创业',detail:'跨境电商创业',salary:'创业型'},
      {title:'海外市场拓展',detail:'驻外工作',salary:'驻外补贴高'}
    ]
  },
  '经济学':{
    job:[
      {title:'银行管培生',detail:'国有大行/股份行管培',salary:'12-22万/年',
       requirement:'本科及以上学历，经济/金融/管理相关专业；通过CET-4/6；良好的逻辑思维和沟通能力；有过学生会/社团/实习经历优先；抗压能力强',
       promotion:'管培生→部门主管（2-3年）→部门经理，国有银行晋升需年限+考核，股份行晋升较快'},
      {title:'证券分析师',detail:'宏观研究、行业研究',salary:'base+奖金20-50万',
       requirement:'硕士及以上学历（985/211优先），经济/金融/数学/统计相关专业；通过CPA/CFA优先；良好的数据分析能力和行业研究能力；Wind/Excel熟练',
       promotion:'分析师→高级分析师（2-3年）→首席分析师→研究部门管理层，新财富评选提升知名度'},
      {title:'咨询顾问',detail:'管理咨询、战略咨询',salary:'15-30万/年',
       requirement:'硕士及以上学历（MBA/985优先），专业不限；良好的逻辑思维和商业敏感度；出色的沟通和表达能力；英语流利；有咨询实习优先',
       promotion:'分析师→咨询顾问（2年）→高级顾问→项目经理→合伙人，顶级咨询晋升透明'},
      {title:'银行客户经理',detail:'对公/零售业务',salary:'底薪+提成',
       requirement:'本科及以上学历，金融/经济/营销相关专业；通过CET-4；良好的沟通能力和服务意识；持有银行从业资格证优先；抗压能力强',
       promotion:'柜员/客户经理助理→客户经理（2-3年）→高级客户经理→支行副行长/行长，薪资与业绩挂钩'},
      {title:'数据分析师',detail:'经济数据分析',salary:'15-28万/年',
       requirement:'本科及以上学历，统计/数学/经济/计算机相关专业；熟练使用Python/R/SQL；熟悉机器学习和数据可视化；有数据分析项目经验优先',
       promotion:'数据分析师→高级分析师/数据分析主管（3年）→数据部门管理层，各行业数字化转型需求大'}
    ],
    graduate:[
      {title:'经济学硕士',detail:'理论经济学/应用经济学，学硕3年',salary:'补贴800-2000/月'},
      {title:'金融学硕士',detail:'金融方向，热门',salary:'补贴1200-3000/月'},
      {title:'数量经济学',detail:'计量经济模型',salary:'学术/金融皆可'}
    ],
    public:[
      {title:'发改委',detail:'宏观政策研究',salary:'年薪10-18万'},
      {title:'统计局',detail:'经济统计',salary:'年薪10-18万'},
      {title:'财政部',detail:'财政政策',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（经济学）',detail:'美国/英国经济学硕士',salary:'留学费用30-60万'},
      {title:'VC/PE',detail:'股权投资',salary:'base+carry'},
      {title:'经济研究机构',detail:'智库、研究员',salary:'15-30万/年'}
    ]
  },
  '财务管理':{
    job:[
      {title:'企业财务',detail:'总账、成本、财务分析',salary:'10-20万/年',
       requirement:'本科及以上学历，财务/会计/金融相关专业；通过初级会计职称优先；熟悉财务软件和Excel函数；细心严谨，责任心强',
       promotion:'会计/出纳→财务主管（3年）→财务经理→财务总监，CPA加持晋升快'},
      {title:'四大会计师事务所',detail:'审计/税务，晋升快',salary:'起薪12-18万',
       requirement:'本科及以上学历，财务/会计/审计相关专业；通过CPA/ACCA部分科目优先；良好的英语水平和逻辑思维；能承受高强度加班和出差',
       promotion:'审计员→高级审计员（2-3年）→审计经理→高级经理→合伙人，四大晋升路径透明，5年可升经理'},
      {title:'银行',detail:'柜员→客户经理→支行',salary:'8-18万/年',
       requirement:'本科及以上学历，金融/经济/会计相关专业；通过CET-4；形象气质佳；良好的沟通能力和服务意识；持有银行从业资格证优先',
       promotion:'柜员→客户经理（2-3年）→支行客户经理/网点负责人→支行行长，国有银行稳定但晋升需资源'},
      {title:'投行/券商',detail:'IBD，学历门槛高',salary:'base+奖金20-80万',
       requirement:'硕士及以上学历（985/211/海外名校），金融/会计/法律相关专业；通过CPA/CFA/司考优先；良好的财务分析和建模能力；英语流利',
       promotion:'分析员→高级分析员（2-3年）→经理→高级经理→副总裁→执行董事→MD，券商IBD晋升路径清晰'},
      {title:'风控合规',detail:'企业风险控制',salary:'12-25万/年',
       requirement:'本科及以上学历，金融/法律/财务/审计相关专业；通过CPA/CFA/FRM优先；熟悉金融风险控制理论和方法；良好的逻辑思维和风险意识',
       promotion:'风控专员→风控主管（3年）→风控经理→风控总监，金融行业风控人才需求大'}
    ],
    graduate:[
      {title:'会计学硕士',detail:'财务会计，学硕3年',salary:'补贴800-2000/月'},
      {title:'会计专硕（MPAcc）',detail:'专硕2年，就业导向',salary:'补贴1500-3000/月'},
      {title:'财务管理方向',detail:'公司金融、资本运营',salary:'金融方向薪资高'}
    ],
    public:[
      {title:'税务局',detail:'税务稽查',salary:'年薪10-18万'},
      {title:'审计局',detail:'政府审计',salary:'年薪10-18万'},
      {title:'财政局',detail:'财政管理',salary:'年薪10-18万'}
    ],
    other:[
      {title:'CPA注册会计师',detail:'财务最高证书',salary:'持证后30-80万/年'},
      {title:'CFA金融分析师',detail:'投资领域证书',salary:'持证后薪资涨幅大'},
      {title:'留学（金融/会计）',detail:'美国/英国金融硕士',salary:'留学费用30-60万'}
    ]
  },
  '物流管理':{
    job:[
      {title:'物流专员/主管',detail:'仓储、运输管理',salary:'8-18万/年',
       requirement:'本科及以上学历，物流/仓储/供应链相关专业；熟悉仓储管理和运输流程；良好的组织和协调能力；能承受体力劳动和加班',
       promotion:'物流专员→物流主管（2-3年）→物流经理→物流总监，行业稳健发展'},
      {title:'供应链管理',detail:'采购、库存优化',salary:'12-22万/年',
       requirement:'本科及以上学历，供应链/物流/管理相关专业；熟悉采购流程和库存管理方法；良好的谈判能力和数据分析能力；持有CPSM/SCMP优先',
       promotion:'采购专员→采购主管（3年）→采购经理→采购总监，供应链核心岗位'},
      {title:'跨境物流',detail:'国际货运、报关',salary:'10-20万/年',
       requirement:'本科及以上学历，国际贸易/物流/英语相关专业；通过CET-4/6；熟悉国际货运和报关流程；有货代或报关实习经验优先',
       promotion:'跨境物流专员→高级专员/主管（3年）→跨境物流经理，跨境电商带动需求旺盛'},
      {title:'京东/顺丰/菜鸟',detail:'电商/快递巨头',salary:'12-25万/年',
       requirement:'本科及以上学历，专业不限；能承受高强度工作压力；良好的沟通和团队协作能力；有电商/物流实习经验优先',
       promotion:'管培生/专员→主管（2-3年）→经理→高级经理，大平台晋升通道清晰'},
      {title:'物流系统开发',detail:'WMS/TMS系统',salary:'15-28万/年',
       requirement:'本科及以上学历，计算机/物流/信息管理相关专业；熟悉WMS/TMS系统架构；良好的编程能力和逻辑思维；有物流系统开发经验优先',
       promotion:'开发工程师→高级工程师/系统架构师（3年）→技术经理→IT总监，物流科技化需求大'}
    ],
    graduate:[
      {title:'物流管理硕士',detail:'供应链管理，学硕3年',salary:'补贴800-2000/月'},
      {title:'MBA供应链方向',detail:'管理+物流',salary:'名校MBA回报高'},
      {title:'运筹学方向',detail:'优化算法、智能物流',salary:'科技+物流方向热'}
    ],
    public:[
      {title:'交通运输局',detail:'物流管理',salary:'年薪10-18万'},
      {title:'商务局',detail:'商贸物流',salary:'年薪10-18万'},
      {title:'邮政管理局',detail:'快递监管',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（供应链）',detail:'美国/欧洲SCM硕士',salary:'留学费用25-50万'},
      {title:'物流创业',detail:'同城配送、仓储自动化',salary:'创业型'},
      {title:'物流咨询',detail:'方案设计',salary:'15-30万/年'}
    ]
  },
  '旅游管理':{
    job:[
      {title:'酒店管理',detail:'前台、客房、餐饮管理',salary:'8-18万/年',
       requirement:'本科及以上学历，酒店/旅游管理相关专业；良好的服务意识和沟通能力；形象气质佳；能承受倒班工作；有酒店实习经验优先',
       promotion:'前台/客房→大堂副理（2-3年）→部门经理→酒店总经理，国际品牌酒店晋升体系成熟'},
      {title:'导游/领队',detail:'旅行社，需导游证',salary:'底薪+提成',
       requirement:'本科及以上学历，旅游/外语相关专业；持有导游资格证；良好的表达能力和应变能力；喜欢户外工作和与人交流；英语/小语种优先',
       promotion:'导游→高级导游/领队（2-3年）→旅行社部门主管→旅行社总经理，优秀导游收入可观'},
      {title:'旅游产品经理',detail:'旅游线路设计',salary:'10-20万/年',
       requirement:'本科及以上学历，旅游管理/市场营销/策划相关专业；熟悉旅游产品和线路设计；有创意和审美能力；良好的沟通和协调能力',
       promotion:'产品专员→产品经理（3年）→高级产品经理→产品总监，旅游业复苏带动需求'},
      {title:'OTA运营',detail:'携程/飞猪运营',salary:'12-22万/年',
       requirement:'本科及以上学历，电商/旅游/营销相关专业；熟悉OTA平台运营规则；有数据分析能力；良好的沟通和团队协作能力',
       promotion:'运营专员→高级运营/运营主管（2-3年）→运营经理，OTA行业集中度高'},
      {title:'景区管理',detail:'主题公园、景区运营',salary:'10-18万/年',
       requirement:'本科及以上学历，旅游管理/景区管理/公共管理相关专业；良好的组织和协调能力；有景区或主题公园实习经验优先',
       promotion:'景区专员→景区主管（3年）→景区经理→景区总监，文旅融合发展机遇多'}
    ],
    graduate:[
      {title:'旅游管理硕士',detail:'旅游规划/酒店管理，学硕3年',salary:'补贴800-2000/月'},
      {title:'MBA旅游方向',detail:'管理+旅游',salary:'名校MBA回报高'},
      {title:'会展经济方向',detail:'会展策划、管理',salary:'新兴方向'}
    ],
    public:[
      {title:'文旅局',detail:'旅游管理',salary:'年薪10-18万'},
      {title:'景区管理单位',detail:'事业编',salary:'年薪8-15万'},
      {title:'文化局',detail:'文化管理',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（旅游酒店管理）',detail:'瑞士/美国酒店管理',salary:'留学费用20-50万'},
      {title:'民宿/文旅创业',detail:'乡村旅游、文旅项目',salary:'创业型'},
      {title:'旅游博主',detail:'内容创业',salary:'不固定，上限高'}
    ]
  },
  '社会工作':{
    job:[
      {title:'社工机构',detail:'社区服务、公益项目',salary:'8-15万/年',
       requirement:'本科及以上学历，社会工作/社会学/心理相关专业；持有助理/中级社会工作师证优先；良好的沟通能力和同理心；有公益志愿服务经历优先',
       promotion:'社工→项目主管（3年）→机构管理层，社会工作行业快速发展但薪资相对较低'},
      {title:'民政系统',detail:'社会救助、福利',salary:'8-15万/年',
       requirement:'本科及以上学历，社会工作/社会学/公共管理相关专业；通过公务员考试；熟悉社会救助政策；有公益或社区实习经验优先',
       promotion:'科员→副主任科员/主任科员（3-5年）→副科级→正科级，体制内晋升需考核+年限'},
      {title:'企业CSR',detail:'企业社会责任',salary:'10-18万/年',
       requirement:'本科及以上学历，企业管理/社会学/环境科学相关专业；良好的沟通和项目管理能力；熟悉CSR/ESG理念；有公益组织或企业社会责任实习经验优先',
       promotion:'CSR专员→CSR主管（3年）→CSR经理→CSR总监，大企业越来越重视'},
      {title:'心理咨询师',detail:'需经验积累',salary:'100-500/小时',
       requirement:'本科及以上学历，心理学/心理咨询相关专业；持有心理咨询师资格证；完成一定小时数的个案积累；良好的倾听和共情能力',
       promotion:'心理咨询师→高级咨询师/督导师（3-5年）→咨询机构负责人，个案小时数提升后收入可观'},
      {title:'基金会',detail:'公益项目管理',salary:'10-18万/年',
       requirement:'本科及以上学历，社会工作/公共管理/非营利组织管理相关专业；熟悉公益项目管理和运作流程；良好的沟通和写作能力；有基金会或NGO实习经验优先',
       promotion:'项目专员→项目主管（3年）→项目总监→基金会秘书长，公益行业发展潜力大'}
    ],
    graduate:[
      {title:'社会工作硕士',detail:'MSW，2年制',salary:'补贴800-2000/月'},
      {title:'社会学硕士',detail:'学硕3年，学术路线',salary:'补贴800-2000/月'},
      {title:'社会政策方向',detail:'政策研究',salary:'学术/实践皆可'}
    ],
    public:[
      {title:'民政局',detail:'社会救助、养老',salary:'年薪10-18万'},
      {title:'街道办/居委会',detail:'基层社会服务',salary:'年薪8-15万'},
      {title:'残联/妇联',detail:'特殊群体服务',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（社会工作）',detail:'美国/加拿大社工',salary:'留学费用25-50万'},
      {title:'公益创业',detail:'社会企业',salary:'创业型'},
      {title:'国际组织',detail:'UN/NGO',salary:'国际薪酬'}
    ]
  },
  '行政管理':{
    job:[
      {title:'行政专员/主管',detail:'日常行政、后勤',salary:'8-15万/年',
       requirement:'本科及以上学历，行政管理/文秘/管理相关专业；良好的沟通和协调能力；细心严谨，熟练使用Office软件；有行政实习经验优先',
       promotion:'行政专员→行政主管（3年）→行政经理→行政总监，稳定但晋升较慢'},
      {title:'HR专员',detail:'招聘、培训',salary:'10-18万/年',
       requirement:'本科及以上学历，人力资源/管理/心理相关专业；良好的沟通能力和组织协调能力；熟悉HR六大模块；熟练使用Office软件',
       promotion:'HR专员→HR主管（3年）→HR经理→HR总监，人力资源晋升路径清晰'},
      {title:'秘书/总助',detail:'高管秘书',salary:'10-20万/年',
       requirement:'本科及以上学历，文秘/中文/行政管理相关专业；良好的沟通和写作能力；细心严谨，形象气质佳；熟练使用Office软件',
       promotion:'秘书/总助→高级秘书/行政主管（3年）→行政经理/总监，优秀总助薪资可观'},
      {title:'政府机关',detail:'参公编制',salary:'年薪10-18万',
       requirement:'本科及以上学历，专业不限；通过国家公务员/省级公务员考试；良好的政治素养和写作能力；细心严谨，原则性强',
       promotion:'科员→副主任科员/主任科员（3-5年）→副科级→正科级，晋升需考核+年限+机遇'},
      {title:'企业培训',detail:'培训专员',salary:'10-18万/年',
       requirement:'本科及以上学历，人力资源/教育/管理相关专业；良好的表达和授课能力；熟悉培训流程和培训方法；有培训或教学经验优先',
       promotion:'培训专员→培训主管（3年）→培训经理→培训总监，企业培训越来越受重视'}
    ],
    graduate:[
      {title:'行政管理硕士',detail:'学硕3年，学术路线',salary:'补贴800-2000/月'},
      {title:'MPA公共管理',detail:'在职/全日制',salary:'MPA学费10-20万'},
      {title:'公共政策方向',detail:'政策分析',salary:'学术/政府皆可'}
    ],
    public:[
      {title:'公务员',detail:'政府机关',salary:'年薪10-18万'},
      {title:'事业单位',detail:'高校、医院行政',salary:'年薪8-15万'},
      {title:'选调生',detail:'储备干部',salary:'年薪8-15万+晋升'}
    ],
    other:[
      {title:'留学（公共管理）',detail:'美国/欧洲MPA',salary:'留学费用30-60万'},
      {title:'管理咨询',detail:'战略/运营',salary:'15-30万/年'},
      {title:'企业行政管理',detail:'高管助理',salary:'15-25万/年'}
    ]
  },
  '社会学':{
    job:[
      {title:'市场研究',detail:'消费者研究、用户研究',salary:'12-22万/年',
       requirement:'本科及以上学历，社会学/市场研究/统计/心理相关专业；熟悉问卷设计和数据分析方法；熟练使用SPSS/Excel；有市场研究或用户调研实习经验优先',
       promotion:'研究专员→高级研究/研究主管（3年）→研究经理，市场研究行业需求稳定'},
      {title:'社会调查员',detail:'问卷设计、数据分析',salary:'10-18万/年',
       requirement:'本科及以上学历，社会学/统计/社会调查相关专业；熟悉社会调查方法和问卷设计；熟练使用统计软件和Excel；有社会调查项目经验优先',
       promotion:'调查员→高级调查员/项目主管（3年）→调查经理，政府/学术机构需求稳定'},
      {title:'HR专员',detail:'招聘、培训',salary:'10-18万/年',
       requirement:'本科及以上学历，人力资源/社会学/管理相关专业；良好的沟通能力和组织协调能力；熟悉HR六大模块基础；熟练使用Office软件',
       promotion:'HR专员→HR主管（3年）→HR经理，人力资源晋升路径清晰'},
      {title:'NGO/公益',detail:'项目管理',salary:'8-15万/年',
       requirement:'本科及以上学历，社会工作/社会学/公共管理相关专业；良好的沟通和项目管理能力；熟悉公益项目运作流程；有NGO或公益实习经验优先',
       promotion:'项目专员→项目主管（3年）→项目总监→机构管理层，公益行业快速发展'},
      {title:'记者/编辑',detail:'社会新闻',salary:'10-20万/年',
       requirement:'本科及以上学历，新闻/中文/社会学相关专业；扎实的文字功底和新闻敏感度；有媒体实习或作品发表优先；能承受加班和值班',
       promotion:'记者→资深记者/部门主编（3年）→总编辑，媒体行业转型中但需求仍在'}
    ],
    graduate:[
      {title:'社会学硕士',detail:'学硕3年，学术路线',salary:'补贴800-2000/月'},
      {title:'社会工作硕士',detail:'MSW，2年',salary:'补贴800-2000/月'},
      {title:'人口学方向',detail:'人口研究',salary:'学术/政府需求大'}
    ],
    public:[
      {title:'统计局',detail:'人口统计',salary:'年薪10-18万'},
      {title:'民政局',detail:'社会管理',salary:'年薪10-18万'},
      {title:'政策研究室',detail:'政策研究',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（社会学）',detail:'美国/欧洲社会学',salary:'留学费用25-50万'},
      {title:'市场调研公司',detail:'咨询型',salary:'12-22万/年'},
      {title:'智库研究员',detail:'政策研究',salary:'15-30万/年'}
    ]
  },
  '音乐学':{
    job:[
      {title:'音乐教师',detail:'中小学/培训机构',salary:'8-18万/年（带编更高）',
       requirement:'本科及以上学历，音乐学/音乐教育相关专业；持有教师资格证优先；良好的音乐素养和授课能力；会钢琴/声乐；有教学经验优先',
       promotion:'教师→年级备课组长/教研组长（3年）→教务主任/副校长，带编教师职称晋升：助教→讲师→副高→正高'},
      {title:'音乐经纪人',detail:'艺人经纪、演出',salary:'底薪+提成',
       requirement:'本科及以上学历，音乐/传媒/市场营销相关专业；良好的沟通和谈判能力；有娱乐圈或经纪公司实习经验优先；人脉资源和社交能力',
       promotion:'经纪人→高级经纪人/经纪总监（3年）→成立个人经纪公司，优秀经纪人收入可观'},
      {title:'音乐制作人',detail:'编曲、录音',salary:'10-25万/年',
       requirement:'本科及以上学历，音乐制作/录音艺术/作曲相关专业；熟练使用DAW软件（Cubase/Logic Pro等）；扎实的音乐理论基础和制作能力；有音乐作品集优先',
       promotion:'音乐制作人→高级制作人/制作总监（3年）→成立个人工作室，音乐平台兴起带动需求'},
      {title:'乐器演奏',detail:'乐团、交响乐',salary:'8-20万/年',
       requirement:'本科及以上学历（音乐表演/演奏专业）；精通至少一种乐器演奏；良好的音乐表现力；有乐团演出经验优先；需通过乐团面试',
       promotion:'演奏员→首席演奏员（3-5年）→乐团副首席/首席→乐团管理职位（团长/副团长），乐团晋升需年限+考核'},
      {title:'音乐编辑',detail:'音乐平台编辑',salary:'8-15万/年',
       requirement:'本科及以上学历，音乐学/传媒/编辑出版相关专业；良好的音乐审美和文字编辑能力；熟悉音乐平台运营规则；有音乐编辑或媒体实习经验优先',
       promotion:'音乐编辑→高级编辑/内容主管（3年）→内容总监，音乐平台内容需求大'}
    ],
    graduate:[
      {title:'音乐学硕士',detail:'音乐理论/教育，学硕3年',salary:'补贴800-2000/月'},
      {title:'音乐表演硕士',detail:'声乐/器乐表演',salary:'补贴1200-2500/月'},
      {title:'音乐教育方向',detail:'音乐教育',salary:'教育方向稳定'}
    ],
    public:[
      {title:'学校音乐教师',detail:'需教师资格证',salary:'年薪8-15万（带编）'},
      {title:'文化馆/少年宫',detail:'群众音乐',salary:'年薪8-15万'},
      {title:'乐团/剧院',detail:'事业编',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（音乐）',detail:'美国/欧洲音乐学院',salary:'留学费用30-80万'},
      {title:'独立音乐人',detail:'原创音乐',salary:'不固定'},
      {title:'音乐培训创业',detail:'培训机构',salary:'创业型'}
    ]
  },
  '历史学':{
    job:[
      {title:'历史教师',detail:'中学教师，需教师证',salary:'8-18万/年（带编更高）',
       requirement:'本科及以上学历，历史学/历史教育相关专业；持有教师资格证；良好的历史素养和授课能力；喜欢教育事业；有教学经验优先',
       promotion:'教师→年级备课组长/教研组长（3年）→教务主任/副校长，带编教师职称晋升：助教→讲师→副高→正高'},
      {title:'博物馆/文物',detail:'策展、修复、研究',salary:'8-15万/年',
       requirement:'本科及以上学历，历史学/博物馆学/文物与博物馆学相关专业；熟悉博物馆运作和策展流程；有博物馆实习或志愿者经历优先',
       promotion:'博物馆专员→博物馆主管（3年）→博物馆管理层，文物行业发展潜力大'},
      {title:'档案馆',detail:'档案管理',salary:'8-15万/年',
       requirement:'本科及以上学历，档案学/历史学/信息管理相关专业；细心严谨，熟悉档案管理流程；有档案馆或图书馆实习经验优先',
       promotion:'档案管理员→档案主管（3年）→档案馆管理层，体制内工作稳定'},
      {title:'出版社编辑',detail:'历史类图书',salary:'8-15万/年',
       requirement:'本科及以上学历，历史学/编辑出版/中文相关专业；扎实的文字功底和历史知识；细心严谨，熟悉出版流程',
       promotion:'编辑→高级编辑/编辑部主任（3-5年）→副总编辑/总编辑，资深编辑薪资可观'},
      {title:'文化遗产保护',detail:'文物管理',salary:'8-15万/年',
       requirement:'本科及以上学历，文物与博物馆学/考古学/历史学相关专业；熟悉文物保护法律法规；有文物保护或修复实习经验优先',
       promotion:'文保专员→文保主管（3年）→文保管理层，国家重视文物保护工作'}
    ],
    graduate:[
      {title:'历史学硕士',detail:'中国古代史/世界史，学硕3年',salary:'补贴800-2000/月'},
      {title:'学科历史（教育专硕）',detail:'历史教学',salary:'补贴1200-2500/月'},
      {title:'考古学方向',detail:'考古发掘',salary:'学术/实践皆可'}
    ],
    public:[
      {title:'学校历史教师',detail:'需教师资格证',salary:'年薪8-15万（带编）'},
      {title:'博物馆/文物局',detail:'事业编',salary:'年薪8-15万'},
      {title:'文旅局',detail:'文化管理',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（历史）',detail:'美国/欧洲历史',salary:'留学费用25-50万'},
      {title:'历史纪录片',detail:'策划、撰稿',salary:'10-20万/年'},
      {title:'自媒体/历史博主',detail:'内容创业',salary:'不固定'}
    ]
  },
  '哲学':{
    job:[
      {title:'教师',detail:'高校/中学，需博士学位',salary:'年薪10-20万+科研',
       requirement:'博士研究生学历（985/211优先），哲学相关专业；扎实的哲学理论基础和学术研究能力；发表过高质量学术论文；良好的教学能力',
       promotion:'讲师→副教授（5年）→教授→学科带头人，高校职称晋升路径清晰'},
      {title:'出版社编辑',detail:'人文社科类',salary:'8-15万/年',
       requirement:'本科及以上学历，哲学/中文/编辑出版相关专业；扎实的文字功底和人文学科知识；细心严谨，熟悉出版流程；有出版社实习经验优先',
       promotion:'编辑→高级编辑/编辑部主任（3-5年）→副总编辑/总编辑，资深编辑薪资可观'},
      {title:'企业文化',detail:'价值观建设',salary:'10-18万/年',
       requirement:'本科及以上学历，哲学/中文/企业管理相关专业；良好的文字功底和逻辑思维；熟悉企业文化建设；有企业文化或品牌实习经验优先',
       promotion:'企业文化专员→企业文化主管（3年）→企业文化经理→企业文化总监，大企业越来越重视'},
      {title:'政府机关',detail:'文字材料',salary:'年薪10-18万',
       requirement:'本科及以上学历，专业不限（中文/哲学/法律优先）；通过公务员/选调生考试；良好的写作能力和政治素养；细心严谨',
       promotion:'科员→副主任科员/主任科员（3-5年）→副科级→正科级，晋升需考核+年限+机遇'},
      {title:'咨询顾问',detail:'逻辑思维训练',salary:'15-25万/年',
       requirement:'硕士及以上学历（MBA/985优先），专业不限；良好的逻辑思维和分析能力；出色的沟通表达能力；英语流利；有咨询实习优先',
       promotion:'分析师→咨询顾问（2年）→高级顾问→项目经理→合伙人，顶级咨询晋升透明'}
    ],
    graduate:[
      {title:'哲学硕士',detail:'马哲/中哲/西哲，学硕3年',salary:'补贴800-2000/月'},
      {title:'逻辑学方向',detail:'逻辑论证',salary:'学术/AI方向可'},
      {title:'宗教学方向',detail:'宗教研究',salary:'学术/文化机构'}
    ],
    public:[
      {title:'党校',detail:'理论研究',salary:'年薪10-18万'},
      {title:'宣传部',detail:'理论宣传',salary:'年薪10-18万'},
      {title:'高校思政',detail:'思政教师',salary:'年薪10-20万'}
    ],
    other:[
      {title:'留学（哲学）',detail:'美国/欧洲哲学',salary:'留学费用25-50万'},
      {title:'智库研究员',detail:'政策研究',salary:'15-30万/年'},
      {title:'写作/自媒体',detail:'内容创作',salary:'不固定'}
    ]
  },
  '日语':{
    job:[
      {title:'日语翻译',detail:'口译/笔译，需N1证书',salary:'10-25万/年',
       requirement:'本科及以上学历，日语专业；通过N1考试；精通中日语互译；良好的沟通和表达能力；有CATTI口译/笔译证书优先',
       promotion:'翻译→高级翻译/翻译主管（3年）→翻译总监，自由译者可成立翻译公司'},
      {title:'对日IT',detail:'赴日IT、涉日项目',salary:'12-25万/年',
       requirement:'本科及以上学历，计算机/软件/日语相关专业；日语N2及以上+IT技术；良好的沟通能力；有对日项目经验优先',
       promotion:'工程师→高级工程师/项目组长（3年）→项目经理→IT营业，赴日IT需求旺盛'},
      {title:'日企行政/营业',detail:'日资企业',salary:'10-18万/年',
       requirement:'本科及以上学历，日语/行政管理/市场营销相关专业；日语N1或商务日语；熟悉日企文化和工作方式；良好的沟通和协调能力',
       promotion:'行政/营业担当→主管（3年）→日企经理/总监，日企文化稳定但晋升较慢'},
      {title:'日语教师',detail:'机构/赴日',salary:'10-20万/年',
       requirement:'本科及以上学历，日语专业；通过N1；良好的日语教学能力；有教师资格证优先；喜欢教育事业',
       promotion:'教师→高级教师/教研组长（3年）→教务主任/校长，优秀日语教师薪资可观'},
      {title:'跨境电商运营',detail:'日本市场',salary:'10-20万/年',
       requirement:'本科及以上学历，电商/日语/国贸相关专业；日语N2及以上；熟悉日本电商平台（如Rakuten/Amazon JP）；良好的数据分析能力',
       promotion:'运营专员→高级运营/运营主管（2-3年）→运营经理，跨境电商日本市场增长快'}
    ],
    graduate:[
      {title:'日语语言文学硕士',detail:'学硕3年，文学/文化',salary:'补贴800-2000/月'},
      {title:'日语笔译/口译硕士',detail:'MTI，2年',salary:'补贴1200-2500/月'},
      {title:'日本研究方向',detail:'日本文化/社会',salary:'学术/外事'}
    ],
    public:[
      {title:'外交部',detail:'日语翻译/外交',salary:'年薪15-25万'},
      {title:'海关日语岗',detail:'检验检疫',salary:'年薪10-18万'},
      {title:'日语教师（编制）',detail:'中学日语',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（日本）',detail:'日本修士/研究生',salary:'留学费用10-30万（国公立）'},
      {title:'赴日工作',detail:'IT/服务',salary:'年薪15-30万日元'},
      {title:'日语培训创业',detail:'机构/个人',salary:'创业型'}
    ]
  },
  '应用物理学':{
    job:[
      {title:'半导体/芯片',detail:'IC设计/工艺',salary:'15-30万/年',
       requirement:'本科及以上学历，微电子/电子信息/物理相关专业；熟悉半导体工艺和IC设计流程；良好的逻辑思维和实验能力；有芯片厂或IC设计实习经验优先',
       promotion:'工艺工程师→高级工程师/技术主管（3年）→工艺经理→技术总监，芯片行业国产化机遇'},
      {title:'光学工程师',detail:'光学设计、光通信',salary:'15-28万/年',
       requirement:'本科及以上学历，光学/光电信息/物理相关专业；熟悉光学设计软件（如Zemax/Code V）；了解光学加工和检测工艺；有光学项目经验优先',
       promotion:'光学工程师→高级工程师/光学主管（3年）→光学经理，光通信/激光行业需求稳定'},
      {title:'材料工程师',detail:'新材料研发',salary:'12-25万/年',
       requirement:'本科及以上学历，材料物理/材料化学/物理相关专业；熟悉材料制备和表征方法；良好的实验动手能力和数据分析能力',
       promotion:'材料工程师→高级工程师/研发主管（3年）→研发经理→研发总监，新材料是国家战略方向'},
      {title:'物理教师',detail:'初高中教师',salary:'8-18万/年（带编）',
       requirement:'本科及以上学历，物理学/物理教育相关专业；持有教师资格证；良好的物理素养和授课能力；喜欢教育事业',
       promotion:'教师→年级备课组长/教研组长（3年）→教务主任/副校长，带编教师职称晋升：助教→讲师→副高→正高'},
      {title:'医疗器械',detail:'物理医疗设备',salary:'12-22万/年',
       requirement:'本科及以上学历，生物医学工程/物理/机械/电子相关专业；了解医疗器械法规和标准；良好的逻辑思维和动手能力',
       promotion:'医疗器械工程师→高级工程师/主管（3年）→项目经理→医疗设备部门管理层，医疗器械行业增长快'}
    ],
    graduate:[
      {title:'物理学硕士',detail:'理论物理/应用物理，学硕3年',salary:'补贴800-2000/月'},
      {title:'微电子方向',detail:'集成电路',salary:'芯片行业薪资高'},
      {title:'光学方向',detail:'光学工程',salary:'光通信/激光'}
    ],
    public:[
      {title:'科研院所',detail:'中科院物理所等',salary:'年薪12-22万'},
      {title:'军工院所',detail:'航空航天',salary:'年薪12-25万+福利'},
      {title:'学校物理教师',detail:'需教师资格证',salary:'年薪8-15万（带编）'}
    ],
    other:[
      {title:'留学（物理）',detail:'美国/欧洲物理博士',salary:'全额奖学金多'},
      {title:'半导体创业',detail:'芯片设计',salary:'创业型'},
      {title:'数据科学',detail:'金融量化',salary:'20-50万/年'}
    ]
  },
  '化学':{
    job:[
      {title:'化工工程师',detail:'化工工艺、设计',salary:'12-22万/年',
       requirement:'本科及以上学历，化学工程/化工/工艺相关专业；熟悉化工工艺流程和设备；良好的实验动手能力和安全意识；持有化工工程师职称优先',
       promotion:'化工工程师→高级工程师/工艺主管（3年）→工艺经理→技术总监，化工行业稳健'},
      {title:'质检/研发',detail:'质量检测、产品研发',salary:'10-20万/年',
       requirement:'本科及以上学历，化学/应用化学/质检相关专业；熟悉化学分析方法和仪器操作；细心严谨，有责任心；有质检或研发实习经验优先',
       promotion:'质检/研发专员→主管（3年）→经理，化工/制药行业需求稳定'},
      {title:'医药代表',detail:'药企销售',salary:'底薪+提成',
       requirement:'本科及以上学历，药学/化学/市场营销相关专业；良好的沟通和公关能力；勤奋踏实，能承受压力；有好药品销售经验优先',
       promotion:'医药代表→高级代表/地区主管（2-3年）→区域经理→大区总监，医药行业薪资与业绩挂钩'},
      {title:'化妆品研发',detail:'配方研发',salary:'12-22万/年',
       requirement:'本科及以上学历，化妆品/化学/精细化工相关专业；熟悉化妆品配方和工艺；有化妆品研发实习经验优先；创新能力和审美',
       promotion:'研发工程师→高级工程师/研发主管（3年）→研发经理→研发总监，美妆行业增长快'},
      {title:'环境检测',detail:'第三方检测',salary:'10-18万/年',
       requirement:'本科及以上学历，环境工程/化学/检测相关专业；熟悉环境检测方法和仪器；细心严谨，有责任心；有检测机构实习经验优先',
       promotion:'检测员→高级检测/检测主管（3年）→检测经理，第三方检测市场需求大'}
    ],
    graduate:[
      {title:'化学硕士',detail:'有机/无机/分析化学，学硕3年',salary:'补贴800-2000/月'},
      {title:'化学工程硕士',detail:'化工方向',salary:'补贴1200-3000/月'},
      {title:'药物化学方向',detail:'新药研发',salary:'药企需求大'}
    ],
    public:[
      {title:'质检院/药检院',detail:'事业编，检测',salary:'年薪8-15万'},
      {title:'环保局',detail:'环境监测',salary:'年薪10-18万'},
      {title:'学校化学教师',detail:'需教师资格证',salary:'年薪8-15万（带编）'}
    ],
    other:[
      {title:'留学（化学）',detail:'美国/欧洲化学硕士',salary:'留学费用25-50万'},
      {title:'化妆品创业',detail:'配方研发',salary:'创业型'},
      {title:'第三方检测',detail:'检测机构',salary:'10-18万/年'}
    ]
  },
  '生物科学':{
    job:[
      {title:'生物教师',detail:'初高中教师，需教师证',salary:'8-18万/年（带编）',
       requirement:'本科及以上学历，生物科学/生物教育相关专业；持有教师资格证；良好的生物素养和授课能力；喜欢教育事业',
       promotion:'教师→年级备课组长/教研组长（3年）→教务主任/副校长，带编教师职称晋升：助教→讲师→副高→正高'},
      {title:'医药代表',detail:'药企销售',salary:'底薪+提成',
       requirement:'本科及以上学历，药学/生物/市场营销相关专业；良好的沟通和公关能力；勤奋踏实，能承受压力；有好药品销售经验优先',
       promotion:'医药代表→高级代表/地区主管（2-3年）→区域经理→大区总监，医药行业薪资与业绩挂钩'},
      {title:'技术支持',detail:'生物公司售前售后',salary:'10-18万/年',
       requirement:'本科及以上学历，生物科学/生物技术/相关专业；熟悉生物实验技术和仪器操作；良好的沟通能力和服务意识；有生物公司实习经验优先',
       promotion:'技术支持专员→技术支持主管（3年）→技术支持经理，生物行业发展潜力大'},
      {title:'检测员',detail:'医院/第三方检测',salary:'8-15万/年',
       requirement:'本科及以上学历，医学检验/生物技术/相关专业；熟悉实验室检测流程和操作规范；细心严谨，有责任心；有医院或检测机构实习经验优先',
       promotion:'检测员→高级检测/检测主管（3年）→检验科管理层，医院或第三方检测机构稳定'},
      {title:'实验员',detail:'科研助理',salary:'8-15万/年',
       requirement:'本科及以上学历，生物科学/生物技术/实验动物学相关专业；熟悉实验室操作规范；有科研项目实验经验优先；细心严谨，动手能力强',
       promotion:'实验员→高级实验员/科研助理（3年）→实验室主管/研究员，科研机构或高校实验室'}
    ],
    graduate:[
      {title:'生物学硕士',detail:'植物/动物/微生物，学硕3年',salary:'补贴800-2000/月'},
      {title:'生物与医药专硕',detail:'生物医药方向',salary:'补贴1200-2500/月'},
      {title:'生物信息学',detail:'CS+Bio，交叉学科',salary:'IT+生物，薪资高'}
    ],
    public:[
      {title:'学校生物教师',detail:'需教师资格证',salary:'年薪8-15万（带编）'},
      {title:'疾控中心',detail:'卫生检测',salary:'年薪8-15万'},
      {title:'环保局',detail:'生态监测',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（生物）',detail:'美国/欧洲生物硕士/博士',salary:'博士全额奖学金多'},
      {title:'生物科技创业',detail:' Biotech创业',salary:'创业型'},
      {title:'农业/环保创业',detail:'生态农业',salary:'创业型'}
    ]
  },
  '环境工程':{
    job:[
      {title:'环保工程师',detail:'废水/废气处理',salary:'10-20万/年',
       requirement:'本科及以上学历，环境工程/环境科学/水处理相关专业；熟悉废水/废气处理工艺和设备；良好的逻辑思维和动手能力；有环保工程实习经验优先',
       promotion:'环保工程师→高级工程师/项目经理（3年）→环保经理→环保总监，环保行业受政策支持'},
      {title:'环评工程师',detail:'环境影响评价',salary:'12-22万/年',
       requirement:'本科及以上学历，环境科学/环境工程/相关专业；持有环境影响评价工程师证书优先；熟悉环评法律法规和编写流程；良好的写作和沟通能力',
       promotion:'环评工程师→高级环评/项目负责人（3年）→环评经理→总工程师，环评行业稳定'},
      {title:'EHS专员',detail:'环境健康安全',salary:'10-18万/年',
       requirement:'本科及以上学历，环境工程/安全工程/化工相关专业；熟悉EHS法律法规和体系；良好的逻辑思维和沟通能力；有EHS实习经验优先',
       promotion:'EHS专员→EHS主管（3年）→EHS经理→EHS总监，大企业越来越重视EHS'},
      {title:'水处理工程师',detail:'市政/工业水处理',salary:'10-20万/年',
       requirement:'本科及以上学历，给排水/环境工程/水处理相关专业；熟悉水处理工艺和设备；良好的逻辑思维和动手能力；有水处理项目经验优先',
       promotion:'水处理工程师→高级工程师/项目经理（3年）→水处理部门经理，水处理行业需求稳定'},
      {title:'环境监测',detail:'第三方检测',salary:'8-15万/年',
       requirement:'本科及以上学历，环境监测/环境科学/化学相关专业；熟悉环境监测方法和仪器操作；细心严谨，有责任心；有检测机构实习经验优先',
       promotion:'监测员→高级监测/监测主管（3年）→监测经理，第三方检测市场需求大'}
    ],
    graduate:[
      {title:'环境工程硕士',detail:'学硕3年，水/气/固废',salary:'补贴800-2000/月'},
      {title:'环境科学硕士',detail:'环境科学方向',salary:'补贴800-2000/月'},
      {title:'新能源方向',detail:'碳中和、新能源',salary:'政策导向，需求大'}
    ],
    public:[
      {title:'环保局',detail:'环境管理',salary:'年薪10-18万'},
      {title:'环境监测站',detail:'事业编',salary:'年薪8-15万'},
      {title:'住建局',detail:'市政管理',salary:'年薪10-18万'}
    ],
    other:[
      {title:'留学（环境）',detail:'美国/欧洲环境工程',salary:'留学费用25-50万'},
      {title:'环保咨询',detail:'为企业做环评',salary:'12-22万/年'},
      {title:'环保创业',detail:'污水处理、节能',salary:'政策扶持，朝阳'}
    ]
  },
  '药学':{
    job:[
      {title:'医药代表',detail:'药企销售',salary:'底薪+提成10-30万/年',
       requirement:'本科及以上学历，药学/临床医学/市场营销相关专业；良好的沟通和公关能力；勤奋踏实，能承受压力；熟悉医药行业和药品知识',
       promotion:'医药代表→高级代表/地区主管（2-3年）→区域经理→大区总监，医药行业薪资与业绩挂钩'},
      {title:'临床监查员CRA',detail:'临床试验',salary:'12-22万/年',
       requirement:'本科及以上学历，临床医学/药学/护理学相关专业；熟悉GCP和临床试验流程；良好的沟通和协调能力；能适应出差；有CRA实习经验优先',
       promotion:'CRA→高级CRA/项目经理（3年）→临床运营经理→临床总监，CRO行业快速发展'},
      {title:'药店/执业药师',detail:'药店营业员/药师',salary:'8-18万/年',
       requirement:'本科及以上学历，药学/中药学相关专业；持有执业药师资格证书；熟悉药品知识和用药指导；良好的沟通能力和服务意识',
       promotion:'药师→店长/区域药师主管（3年）→区域经理→连锁药房管理层，零售药房稳定'},
      {title:'质量QA/QC',detail:'药品质量',salary:'10-18万/年',
       requirement:'本科及以上学历，药学/制药工程/化学相关专业；熟悉GMP和药品质量管理体系；细心严谨，有责任心；有药企QA/QC实习经验优先',
       promotion:'QA/QC专员→QA/QC主管（3年）→QA/QC经理→质量总监，制药行业质量人才需求稳定'},
      {title:'药物研发',detail:'药企研发岗',salary:'12-25万/年',
       requirement:'本科及以上学历，药学/药物化学/药剂学/制药工程相关专业；熟悉药物研发流程和实验操作；有药物研发项目经验优先；创新思维和实验能力',
       promotion:'研发工程师→高级工程师/研发主管（3年）→研发经理→研发总监，创新药行业受资本青睐'}
    ],
    graduate:[
      {title:'药学硕士',detail:'药物化学/药剂学，学硕3年',salary:'补贴800-2000/月'},
      {title:'药学专硕',detail:'临床药学/工业药学',salary:'补贴1200-2500/月'},
      {title:'临床药学方向',detail:'医院临床药师',salary:'医院稳定'}
    ],
    public:[
      {title:'药监局',detail:'药品监管',salary:'年薪10-18万'},
      {title:'医院药师',detail:'事业编',salary:'年薪10-18万'},
      {title:'疾控中心',detail:'疫苗管理',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（药学）',detail:'美国/英国药学硕士',salary:'留学费用25-50万'},
      {title:'DTP药房',detail:'特药药房',salary:'10-18万/年'},
      {title:'医药咨询',detail:'行业研究',salary:'15-28万/年'}
    ]
  },
  '体育教育':{
    job:[
      {title:'体育教师',detail:'中小学体育教师',salary:'8-18万/年（带编）',
       requirement:'本科及以上学历，体育教育/体育训练相关专业；持有教师资格证；良好的体育素养和授课能力；有体育教学或带队经验优先',
       promotion:'教师→年级备课组长/教研组长（3年）→教务主任/副校长，带编教师职称晋升：助教→讲师→副高→正高'},
      {title:'健身教练',detail:'健身房/工作室',salary:'底薪+提成',
       requirement:'大专及以上学历，体育/健身/运动训练相关专业；持有健身教练证书（如ACSM/ACE/国家职业资格）；良好的沟通能力和健身指导能力；有健身房实习经验优先',
       promotion:'健身教练→高级教练/教练主管（2-3年）→健身经理→店长/合伙人，优秀教练薪资上不封顶'},
      {title:'体育经纪人',detail:'运动员经纪',salary:'底薪+提成',
       requirement:'本科及以上学历，体育管理/市场营销/法律相关专业；良好的沟通谈判能力和人脉资源；有体育行业或经纪公司实习经验优先；对体育产业有热情',
       promotion:'体育经纪人→高级经纪人/经纪总监（3年）→成立个人经纪公司，顶级体育经纪人收入可观'},
      {title:'户外拓展',detail:'团建活动',salary:'10-18万/年',
       requirement:'本科及以上学历，体育/户外/旅游管理相关专业；良好的组织协调和带队能力；持有户外指导员/拓展培训师证书优先；能适应户外工作环境',
       promotion:'拓展教练→高级拓展/拓展主管（3年）→拓展公司管理层，企业团建市场需求大'},
      {title:'裁判/教练',detail:'体育局/俱乐部',salary:'8-20万/年',
       requirement:'本科及以上学历，体育/运动训练相关专业；持有裁判证/教练员证；熟悉体育竞赛规则；有比赛执裁或执教经验优先',
       promotion:'裁判/教练→高级裁判/高级教练（3-5年）→裁判长/总教练→体育局管理层，专业路线稳定'}
    ],
    graduate:[
      {title:'体育学硕士',detail:'体育教育/运动训练，学硕3年',salary:'补贴800-2000/月'},
      {title:'体育教学专硕',detail:'专硕2年',salary:'补贴1200-2500/月'},
      {title:'运动康复方向',detail:'康复治疗',salary:'医疗+体育'}
    ],
    public:[
      {title:'学校体育教师',detail:'需教师资格证',salary:'年薪8-15万（带编）'},
      {title:'体育局',detail:'体育管理',salary:'年薪10-18万'},
      {title:'体育总会',detail:'赛事管理',salary:'年薪8-15万'}
    ],
    other:[
      {title:'留学（体育管理）',detail:'美国/欧洲体育管理',salary:'留学费用25-50万'},
      {title:'体育创业',detail:'健身房/工作室',salary:'创业型'},
      {title:'体育自媒体',detail:'内容创业',salary:'不固定'}
    ]
  }
};


// 默认专业路线映射（适用于未在上述列表中的专业）
var defaultDirectionRoutes = {
  job:[
    {title:'技术类岗位',detail:'扎实的专业基础+项目经验，积极寻找实习机会，建立作品集',salary:'根据专业和地区浮动',
     requirement:'本科及以上学历（专业相关）；扎实的专业基础知识；项目实践经验；积极寻找实习机会；建立个人作品集',
     promotion:'初级工程师→中级工程师（2-3年）→高级工程师/技术专家→技术经理/架构师，技术路线晋升清晰'},
    {title:'管培生',detail:'大企业校招管培生，轮岗培训后定岗，晋升通道明确',salary:'10-20万/年',
     requirement:'本科及以上学历，专业不限；良好的沟通能力和领导力潜质；有过学生会/社团/实习经历优先；较强的逻辑思维和解决问题的能力',
     promotion:'管培生→部门主管（2-3年）→部门经理/总监，大企业管培晋升通道明确'},
    {title:'专业对口岗位',detail:'根据专业背景选择对口中大型企业，积累行业经验',salary:'8-18万/年',
     requirement:'本科及以上学历，专业对口；扎实的专业基础知识；了解行业和企业背景；良好的学习能力和适应能力',
     promotion:'专员→主管（3年）→经理→总监，专业对口企业积累行业经验后晋升稳定'}
  ],
  graduate:[
    {title:'学术硕士',detail:'学硕3年，读博或进高校/科研院所，需发表论文',salary:'补贴800-2000/月'},
    {title:'专业硕士',detail:'专硕2年，就业导向，职业培训为主',salary:'补贴1200-3000/月'},
    {title:'跨专业考研',detail:'选择热门/交叉方向，如金融科技、人工智能',salary:'复合背景薪资溢价'}
  ],
  public:[
    {title:'国家公务员',detail:'税务局、海关、统计局等，每年国考省考',salary:'年薪10-18万（视地区）'},
    {title:'选调生',detail:'基层公务员储备干部，985/211优先',salary:'年薪8-15万+晋升空间'},
    {title:'事业单位',detail:'高校、医院、科研院所，工作稳定',salary:'年薪8-15万'}
  ],
  other:[
    {title:'留学深造',detail:'英国/澳洲1年制硕士，美/加2年制，学历提升+国际化视野',salary:'留学费用20-60万'},
    {title:'创业',detail:'结合专业+市场需求的创业方向',salary:'风险高回报高'},
    {title:'自由职业/斜杠',detail:'专业技能+个人品牌，多元化收入',salary:'不固定，上限高'}
  ]
};

// 年级学习规划数据（基于互联网大数据）
var gradePlanData = {
  // 就业方向的年级规划
  job: {
    freshman: {
      currentStatus: '大一新生，专业基础阶段',
      abilities: ['正在学习专业基础课程', '初步了解行业概况', '掌握基础编程/专业技能'],
      plans: [
        {phase: '大一上学期', tasks: ['认真学习高数、线代、概率论等数学基础课程', '掌握一门编程语言基础（Python/Java/C++）', '加入专业相关社团或技术俱乐部', '了解本专业就业方向和行业前景', '考取英语四级']},
        {phase: '大一下学期', tasks: ['深入学习数据结构与算法基础', '完成课程配套的编程练习项目', '参加校内编程竞赛或技能比赛', '开始建立个人GitHub代码仓库', '考取计算机二级证书']}
      ]
    },
    sophomore: {
      currentStatus: '大二学生，专业能力成型阶段',
      abilities: ['已掌握专业基础课程', '具备基础编程能力', '了解行业技术栈'],
      plans: [
        {phase: '大二上学期', tasks: ['深入学习专业核心课程（操作系统、数据库、网络）', '学习主流技术栈（Web开发/移动开发/数据分析）', '参加专业技能竞赛（ACM、程序设计赛等）', '完成3-5个完整的技术小项目', '考取英语六级']},
        {phase: '大二下学期', tasks: ['寻找第一份实习或兼职机会', '深入学习一门技术方向（前端/后端/算法）', '参与开源项目贡献', '建立个人技术博客', '为大三实习做准备']}
      ]
    },
    junior: {
      currentStatus: '大三学生，求职准备关键期',
      abilities: ['掌握专业核心技能', '有项目实践经验', '了解目标岗位要求'],
      plans: [
        {phase: '大三上学期', tasks: ['系统准备秋招（算法刷题、项目整理、面试准备）', '争取名企暑期实习机会', '完成一个高质量的技术项目', '积累GitHub开源项目贡献经验', '完善个人简历和技术博客']},
        {phase: '大三下学期', tasks: ['全力冲刺暑期实习申请', '参加企业宣讲会和招聘活动', '深入准备技术面试（算法、系统设计）', '学习目标岗位入职前技能', '建立行业人脉关系']}
      ]
    },
    senior: {
      currentStatus: '大四学生，求职冲刺阶段',
      abilities: ['具备完整专业技能', '有实习/项目经验', '准备进入职场'],
      plans: [
        {phase: '大四上学期', tasks: ['全力冲刺秋招，获取offer', '参加校园招聘宣讲会和双选会', '完成毕业设计和毕业论文', '准备入职体检和三方协议签订', '提前学习目标岗位入职前技能']},
        {phase: '大四下学期', tasks: ['完成毕业答辩', '办理入职手续', '参加入职前培训', '建立职场人脉关系', '规划职业发展路径']}
      ]
    },
    graduate: {
      currentStatus: '毕业一年内，职场新人阶段',
      abilities: ['具备完整专业技能', '有实习/项目经验', '完成学生到职场人的转变'],
      plans: [
        {phase: '毕业后第1-3个月', tasks: ['完成试用期工作', '熟悉公司业务和团队', '学习职场沟通和协作', '建立职业习惯和工作节奏', '参加新员工培训']},
        {phase: '毕业后第4-6个月', tasks: ['独立承担工作任务', '提升专业技能深度', '建立跨部门合作关系', '准备试用期答辩/转正', '规划职业发展方向']},
        {phase: '毕业后第7-12个月', tasks: ['成为团队骨干成员', '参与重要项目', '积累成功案例', '准备晋升或跳槽', '持续学习提升竞争力']}
      ]
    }
  },
  // 考研方向的年级规划
  graduate: {
    freshman: {
      currentStatus: '大一新生，考研基础积累期',
      abilities: ['正在学习专业基础课程', '英语基础待提升', '数学基础待夯实'],
      plans: [
        {phase: '大一上学期', tasks: ['认真学习高数、线代等数学课程（考研数学基础）', '扎实学习英语，为考研英语做准备', '了解考研基本信息和流程', '保持高GPA，为复试做准备', '考取英语四级']},
        {phase: '大一下学期', tasks: ['继续夯实数学基础', '学习专业基础课程', '了解目标院校和专业方向', '参加学术讲座和科研活动', '考取英语六级']}
      ]
    },
    sophomore: {
      currentStatus: '大二学生，考研方向探索期',
      abilities: ['数学基础已建立', '英语能力提升中', '专业方向待确定'],
      plans: [
        {phase: '大二上学期', tasks: ['确定考研目标院校和专业方向', '继续夯实数学基础', '阅读目标专业经典教材', '参与科研项目积累科研经历', '关注目标院校招生信息']},
        {phase: '大二下学期', tasks: ['开始接触考研英语词汇', '学习专业课核心内容', '参加学科竞赛积累履历', '联系目标院校学长学姐', '准备考研复习资料']}
      ]
    },
    junior: {
      currentStatus: '大三学生，考研备考关键期',
      abilities: ['数学基础扎实', '英语能力达标', '专业方向已确定'],
      plans: [
        {phase: '大三上学期', tasks: ['系统复习考研数学（教材+课后习题）', '背诵考研英语核心词汇', '通读专业课教材构建知识框架', '收集目标院校真题和参考书目', '制定详细复习计划']},
        {phase: '大三下学期', tasks: ['进入强化复习阶段', '攻克数学重难点题型', '开始做英语真题', '深入学习专业课', '参加考研辅导班或网课']}
      ]
    },
    senior: {
      currentStatus: '大四学生，考研冲刺阶段',
      abilities: ['复习进入冲刺期', '真题训练阶段', '准备初试复试'],
      plans: [
        {phase: '大四上学期（9-12月）', tasks: ['全力冲刺考研初试', '做真题套卷模拟考试', '背诵政治核心考点', '专业课强化背诵', '调整心态，保持作息']},
        {phase: '大四下学期（1-6月）', tasks: ['准备考研复试', '联系导师了解研究方向', '准备复试面试材料', '完成毕业论文', '等待录取结果']}
      ]
    },
    graduate: {
      currentStatus: '读研期间，学术能力提升期',
      abilities: ['研究生录取', '学术研究能力培养', '专业领域深入探索'],
      plans: [
        {phase: '研一上学期', tasks: ['适应研究生学习节奏', '完成专业课程学习', '阅读大量文献打基础', '参加学术研讨会', '确定研究方向']},
        {phase: '研一下学期', tasks: ['确定论文课题方向', '学习研究方法论', '参与导师科研项目', '撰写文献综述', '准备开题报告']},
        {phase: '研二-研三', tasks: ['开展实验/调研', '撰写学术论文', '参加学术会议', '准备毕业论文', '规划博士申请或就业']}
      ]
    }
  },
  // 考公方向的年级规划
  public: {
    freshman: {
      currentStatus: '大一新生，考公基础准备期',
      abilities: ['了解考公基本信息', '政治素养待提升', '写作能力待培养'],
      plans: [
        {phase: '大一上学期', tasks: ['了解公务员考试类型（国考、省考、选调生）', '提交入党申请书', '加入学生会或社团锻炼组织能力', '关注时政新闻培养政策敏感度', '保持高GPA']},
        {phase: '大一下学期', tasks: ['继续入党流程', '参加社会实践或志愿服务', '学习公文写作基础', '考取英语四级', '了解目标岗位招录要求']}
      ]
    },
    sophomore: {
      currentStatus: '大二学生，考公能力积累期',
      abilities: ['政治素养提升中', '组织协调能力培养', '政策敏感度建立'],
      plans: [
        {phase: '大二上学期', tasks: ['考取英语六级和计算机二级', '参加学生干部竞选', '关注人民日报评论培养申论思维', '学习行测基础模块（资料分析、判断推理）', '积累时政素材']},
        {phase: '大二下学期', tasks: ['完成入党流程成为预备党员', '参加政府部门实习', '系统学习行测各模块', '练习申论写作', '建立岗位数据库']}
      ]
    },
    junior: {
      currentStatus: '大三学生，考公备考黄金期',
      abilities: ['政治面貌达标', '行测基础已建立', '申论能力培养中'],
      plans: [
        {phase: '大三上学期', tasks: ['成为正式党员', '确定目标岗位', '系统学习行测五大模块', '每周练习申论写作', '参加公考辅导班']},
        {phase: '大三下学期', tasks: ['刷行测真题套卷', '申论批改提升', '参加模拟考试', '准备选调生考试', '关注国考省考公告']}
      ]
    },
    senior: {
      currentStatus: '大四学生，考公冲刺阶段',
      abilities: ['行测能力成熟', '申论写作达标', '准备参加考试'],
      plans: [
        {phase: '大四上学期（9-12月）', tasks: ['参加国考报名和笔试', '继续刷题提速', '申论重点练大作文框架', '准备省考复习', '参加选调生考试']},
        {phase: '大四下学期（1-6月）', tasks: ['参加省考笔试', '准备面试', '参加事业单位联考', '完成毕业论文', '等待录用结果']}
      ]
    },
    graduate: {
      currentStatus: '上岸后，新入职公务员阶段',
      abilities: ['成功考取公务员', '完成身份转变', '进入体制内工作'],
      plans: [
        {phase: '入职第1-3个月', tasks: ['完成试用期工作', '熟悉单位业务和流程', '学习机关工作规范', '建立同事关系网络', '参加新公务员培训']},
        {phase: '入职第4-6个月', tasks: ['独立承担岗位工作', '学习公文写作', '了解单位规章制度', '参与重要会议和活动', '培养政治素养']},
        {phase: '入职第7-12个月', tasks: ['成为科室业务骨干', '积累群众工作经验', '准备职级晋升', '规划职业发展路径', '持续学习提升能力']}
      ]
    }
  },
  // 留学方向的年级规划
  studyAbroad: {
    freshman: {
      currentStatus: '大一新生，留学基础准备期',
      abilities: ['GPA积累阶段', '语言基础待建立', '专业方向待明确'],
      plans: [
        {phase: '大一上学期', tasks: ['确定留学目标国家和专业方向', '保持高GPA（目标85+）', '开始学习雅思/托福词汇', '参加校内科研或竞赛', '了解目标院校申请要求']},
        {phase: '大一下学期', tasks: ['继续提升GPA', '系统备考雅思/托福', '参加暑期课程或夏校', '考取英语四级', '建立留学信息渠道']}
      ]
    },
    sophomore: {
      currentStatus: '大二学生，留学能力提升期',
      abilities: ['GPA稳步提升', '语言备考中', '背景提升阶段'],
      plans: [
        {phase: '大二上学期', tasks: ['考取雅思/托福首考', '继续提升GPA', '参加科研项目', '考取英语六级', '了解目标院校专业课程']},
        {phase: '大二下学期', tasks: ['刷雅思/托福高分', '参加专业相关实习', '准备GMAT/GRE（商科/理工）', '参加夏令营或夏校', '积累背景提升经历']}
      ]
    },
    junior: {
      currentStatus: '大三学生，留学申请准备期',
      abilities: ['语言成绩达标', 'GPA稳定', '背景经历丰富'],
      plans: [
        {phase: '大三上学期', tasks: ['拿到目标语言成绩', '继续刷GPA', '准备GMAT/GRE', '确定申请院校名单', '开始准备文书素材']},
        {phase: '大三下学期', tasks: ['撰写个人陈述和简历', '联系推荐人准备推荐信', '参加高质量实习', '准备作品集（艺术类）', '关注申请截止日期']}
      ]
    },
    senior: {
      currentStatus: '大四学生，留学申请冲刺期',
      abilities: ['申请材料准备完毕', '等待录取结果', '准备签证'],
      plans: [
        {phase: '大四上学期（9-12月）', tasks: ['提交网申材料', '跟进申请状态', '准备面试', '继续刷语言成绩（如需）', '等待录取结果']},
        {phase: '大四下学期（1-6月）', tasks: ['确认入读院校', '缴纳押金', '办理签证', '申请宿舍', '准备行李和机票']}
      ]
    },
    graduate: {
      currentStatus: '留学期间，海外学习与成长阶段',
      abilities: ['成功获得留学 offer', '海外学习能力', '跨文化交流能力'],
      plans: [
        {phase: '留学第1学期', tasks: ['适应海外学习生活', '完成课程学习取得好成绩', '建立国际人脉关系', '参与校园活动', '了解当地就业市场']},
        {phase: '留学第2学期至毕业', tasks: ['深入学习专业知识', '寻找实习机会积累经验', '准备毕业论文/项目', '建立导师关系', '规划毕业后发展方向']},
        {phase: '毕业后', tasks: ['考虑是否继续读博', '参加海外就业或回国发展', '利用海归身份优势', '积累海外工作经验', '建立职业发展网络']}
      ]
    }
  },
  // 创业方向的年级规划
  startup: {
    freshman: {
      currentStatus: '大一新生，创业意识培养期',
      abilities: ['了解创业基础知识', '市场敏感度待培养', '团队协作能力待建立'],
      plans: [
        {phase: '大一上学期', tasks: ['学习创业基础课程', '参加创业讲座和沙龙', '加入创业社团或俱乐部', '了解行业市场动态', '培养创新思维']},
        {phase: '大一下学期', tasks: ['参加创业比赛（如挑战杯）', '学习商业模式设计', '建立创业人脉关系', '了解融资和股权知识', '尝试小规模创业实践']}
      ]
    },
    sophomore: {
      currentStatus: '大二学生，创业能力积累期',
      abilities: ['创业知识初步建立', '市场分析能力培养', '团队管理能力提升'],
      plans: [
        {phase: '大二上学期', tasks: ['深入学习创业方法论', '参加创业训练营', '寻找创业合伙人', '进行市场调研', '学习财务和法律知识']},
        {phase: '大二下学期', tasks: ['启动创业项目试点', '申请创业孵化器入驻', '参加创业大赛', '积累行业资源', '建立团队协作机制']}
      ]
    },
    junior: {
      currentStatus: '大三学生，创业实践关键期',
      abilities: ['创业项目启动', '团队组建完成', '市场验证阶段'],
      plans: [
        {phase: '大三上学期', tasks: ['完善创业项目方案', '进行产品原型开发', '寻找天使投资机会', '参加创业路演', '建立客户关系']},
        {phase: '大三下学期', tasks: ['产品上线测试', '收集用户反馈', '优化商业模式', '申请创业扶持资金', '建立品牌影响力']}
      ]
    },
    senior: {
      currentStatus: '大四学生，创业发展期',
      abilities: ['创业项目成熟', '团队运营稳定', '寻求规模化发展'],
      plans: [
        {phase: '大四上学期', tasks: ['完善产品和服务', '扩大市场推广', '寻求融资机会', '建立运营体系', '完成毕业论文']},
        {phase: '大四下学期', tasks: ['项目规模化发展', '建立公司架构', '招聘团队成员', '规划未来发展', '平衡学业与创业']}
      ]
    },
    graduate: {
      currentStatus: '毕业后，创业正式起步阶段',
      abilities: ['创业项目成熟', '团队组建完成', '市场需求验证'],
      plans: [
        {phase: '毕业后第1-3个月', tasks: ['全职投入创业', '完善产品和服务', '获取首批付费客户', '建立运营体系', '申请创业扶持资金']},
        {phase: '毕业后第4-6个月', tasks: ['扩大市场规模', '寻求天使轮/种子轮融资', '完善商业模式', '建立核心团队', '参加创业大赛/路演']},
        {phase: '毕业后第7-12个月', tasks: ['实现稳定营收', '扩大团队规模', '寻求A轮融资', '建立品牌影响力', '规划公司未来3年发展']}
      ]
    }
  }
};

// 当前用户信息（用于规划展示）
var currentUserInfoForPlan = null;

// 专业特定学习计划数据（结合专业和岗位）
// 每个专业每个方向的学习计划会根据该专业该方向的具体岗位来定制
var majorSpecificPlanData = {
  '计算机科学与技术': {
    job: {
      '后端开发工程师': {
        freshman: {
          currentStatus: '大一新生，后端开发基础阶段',
          abilities: ['正在学习编程语言基础', '了解后端开发概念', '掌握基础数据结构'],
          plans: [
            {phase: '大一上学期', tasks: ['深入学习Java/Python编程语言', '掌握数据结构与算法基础', '了解数据库基本概念', '学习Linux操作系统基础', '参加编程社团或技术俱乐部']},
            {phase: '大一下学期', tasks: ['学习Spring Boot/Django等后端框架', '完成3-5个后端API开发项目', '学习MySQL数据库设计与优化', '了解RESTful API设计规范', '考取计算机二级证书']}
          ]
        },
        sophomore: {
          currentStatus: '大二学生，后端技能成型阶段',
          abilities: ['已掌握后端框架基础', '具备数据库设计能力', '了解分布式系统概念'],
          plans: [
            {phase: '大二上学期', tasks: ['深入学习Spring Cloud微服务架构', '掌握Redis缓存和消息队列', '学习分布式系统设计', '完成一个完整的后端系统项目', '参加ACM或蓝桥杯编程竞赛']},
            {phase: '大二下学期', tasks: ['寻找后端开发实习机会', '学习高并发系统设计', '掌握Docker容器化部署', '建立GitHub开源项目', '为秋招做准备']}
          ]
        },
        junior: {
          currentStatus: '大三学生，后端求职关键期',
          abilities: ['掌握微服务架构', '有完整项目经验', '了解大厂技术栈'],
          plans: [
            {phase: '大三上学期', tasks: ['系统准备秋招（刷LeetCode算法题）', '整理后端项目经验', '学习大厂面试高频题', '争取大厂后端实习机会', '完善技术博客和简历']},
            {phase: '大三下学期', tasks: ['全力冲刺暑期实习申请', '深入准备系统设计面试', '学习目标公司技术栈', '积累GitHub开源贡献', '建立行业人脉']}
          ]
        },
        senior: {
          currentStatus: '大四学生，后端求职冲刺阶段',
          abilities: ['具备完整后端技能', '有实习/项目经验', '准备进入大厂'],
          plans: [
            {phase: '大四上学期', tasks: ['全力冲刺秋招，获取大厂offer', '参加校园招聘宣讲会', '完成毕业设计', '准备入职前技能学习', '签订三方协议']},
            {phase: '大四下学期', tasks: ['完成毕业答辩', '办理入职手续', '学习目标岗位入职前技能', '建立职场人脉', '规划职业发展路径']}
          ]
        }
      },
      '前端开发工程师': {
        freshman: {
          currentStatus: '大一新生，前端开发入门阶段',
          abilities: ['正在学习HTML/CSS基础', '了解JavaScript语法', '掌握网页制作基础'],
          plans: [
            {phase: '大一上学期', tasks: ['学习HTML5/CSS3基础', '掌握JavaScript基础语法', '了解浏览器渲染原理', '完成5-10个静态网页练习', '加入前端技术社群']},
            {phase: '大一下学期', tasks: ['学习ES6+新特性', '了解前端框架概念', '完成3-5个交互网页项目', '学习响应式布局设计', '考取计算机二级证书']}
          ]
        },
        sophomore: {
          currentStatus: '大二学生，前端技能提升阶段',
          abilities: ['已掌握前端基础技能', '具备框架入门能力', '了解前端工程化'],
          plans: [
            {phase: '大二上学期', tasks: ['深入学习Vue/React框架', '掌握TypeScript基础', '学习前端工程化（Webpack/Vite）', '完成一个完整的前端项目', '参加前端技术分享会']},
            {phase: '大二下学期', tasks: ['寻找前端开发实习机会', '学习前端性能优化', '掌握Git版本控制', '建立个人前端作品集', '为秋招做准备']}
          ]
        },
        junior: {
          currentStatus: '大三学生，前端求职关键期',
          abilities: ['掌握主流前端框架', '有完整项目经验', '了解前端面试重点'],
          plans: [
            {phase: '大三上学期', tasks: ['系统准备秋招（前端面试题）', '整理前端项目作品集', '学习前端面试高频题', '争取大厂前端实习机会', '完善技术博客和简历']},
            {phase: '大三下学期', tasks: ['全力冲刺暑期实习申请', '深入准备前端框架原理面试', '学习目标公司前端技术栈', '积累GitHub开源贡献', '建立行业人脉']}
          ]
        },
        senior: {
          currentStatus: '大四学生，前端求职冲刺阶段',
          abilities: ['具备完整前端技能', '有实习/项目经验', '准备进入大厂'],
          plans: [
            {phase: '大四上学期', tasks: ['全力冲刺秋招，获取大厂offer', '参加校园招聘宣讲会', '完成毕业设计', '准备入职前技能学习', '签订三方协议']},
            {phase: '大四下学期', tasks: ['完成毕业答辩', '办理入职手续', '学习目标岗位入职前技能', '建立职场人脉', '规划职业发展路径']}
          ]
        }
      },
      '算法工程师': {
        freshman: {
          currentStatus: '大一新生，算法基础积累阶段',
          abilities: ['正在学习数学基础', '了解编程语言', '掌握基础算法概念'],
          plans: [
            {phase: '大一上学期', tasks: ['深入学习高数、线代、概率论', '掌握Python/C++编程语言', '学习基础算法和数据结构', '了解机器学习基本概念', '参加数学建模社团']},
            {phase: '大一下学期', tasks: ['完成LeetCode简单题100道', '学习机器学习基础算法', '了解深度学习框架', '参加ACM编程竞赛入门', '考取计算机二级证书']}
          ]
        },
        sophomore: {
          currentStatus: '大二学生，算法能力提升阶段',
          abilities: ['已掌握基础算法', '具备机器学习入门能力', '了解深度学习概念'],
          plans: [
            {phase: '大二上学期', tasks: ['深入学习机器学习算法', '掌握TensorFlow/PyTorch框架', '完成Kaggle入门竞赛', '学习数据预处理方法', '参加数学建模竞赛']},
            {phase: '大二下学期', tasks: ['寻找算法相关实习机会', '学习深度学习模型设计', '掌握NLP/CV基础技术', '建立GitHub算法项目', '为考研或秋招做准备']}
          ]
        },
        junior: {
          currentStatus: '大三学生，算法求职/考研关键期',
          abilities: ['掌握机器学习算法', '有竞赛/项目经验', '了解算法岗面试重点'],
          plans: [
            {phase: '大三上学期', tasks: ['系统准备秋招或考研', '深入准备算法岗面试', '完成高质量算法项目', '争取大厂算法实习机会', '完善技术博客和简历']},
            {phase: '大三下学期', tasks: ['全力冲刺暑期实习或考研', '深入准备算法原理面试', '学习目标公司算法方向', '积累竞赛获奖经历', '建立行业人脉']}
          ]
        },
        senior: {
          currentStatus: '大四学生，算法岗求职冲刺阶段',
          abilities: ['具备完整算法技能', '有竞赛/项目经验', '准备进入大厂或读研'],
          plans: [
            {phase: '大四上学期', tasks: ['全力冲刺秋招或考研', '参加校园招聘宣讲会', '完成毕业设计', '准备入职前技能学习', '签订三方协议']},
            {phase: '大四下学期', tasks: ['完成毕业答辩', '办理入职或入学手续', '学习目标岗位/研究方向', '建立职场/学术人脉', '规划职业发展路径']}
          ]
        }
      }
    },
    graduate: {
      '学术硕士（学硕）': {
        freshman: {
          currentStatus: '大一新生，考研基础积累期',
          abilities: ['正在学习数学基础', '英语能力待提升', '专业基础待夯实'],
          plans: [
            {phase: '大一上学期', tasks: ['认真学习高数、线代、概率论（考研数学基础）', '扎实学习英语，为考研英语做准备', '了解考研基本信息和流程', '保持高GPA，为复试做准备', '考取英语四级']},
            {phase: '大一下学期', tasks: ['继续夯实数学基础', '学习专业基础课程（数据结构、操作系统）', '了解目标院校和专业方向', '参加学术讲座和科研活动', '考取英语六级']}
          ]
        },
        sophomore: {
          currentStatus: '大二学生，考研方向探索期',
          abilities: ['数学基础已建立', '英语能力提升中', '专业方向待确定'],
          plans: [
            {phase: '大二上学期', tasks: ['确定考研目标院校和专业方向', '继续夯实数学基础', '阅读目标专业经典教材', '参与科研项目积累科研经历', '关注目标院校招生信息']},
            {phase: '大二下学期', tasks: ['开始接触考研英语词汇', '学习专业课核心内容', '参加学科竞赛积累履历', '联系目标院校学长学姐', '准备考研复习资料']}
          ]
        },
        junior: {
          currentStatus: '大三学生，考研备考关键期',
          abilities: ['数学基础扎实', '英语能力达标', '专业方向已确定'],
          plans: [
            {phase: '大三上学期', tasks: ['系统复习考研数学（教材+课后习题）', '背诵考研英语核心词汇', '通读专业课教材构建知识框架', '收集目标院校真题和参考书目', '制定详细复习计划']},
            {phase: '大三下学期', tasks: ['进入强化复习阶段', '攻克数学重难点题型', '开始做英语真题', '深入学习专业课（数据结构、操作系统、网络）', '参加考研辅导班或网课']}
          ]
        },
        senior: {
          currentStatus: '大四学生，考研冲刺阶段',
          abilities: ['复习进入冲刺期', '真题训练阶段', '准备初试复试'],
          plans: [
            {phase: '大四上学期（9-12月）', tasks: ['全力冲刺考研初试', '做真题套卷模拟考试', '背诵政治核心考点', '专业课强化背诵', '调整心态，保持作息']},
            {phase: '大四下学期（1-6月）', tasks: ['准备考研复试', '联系导师了解研究方向', '准备复试面试材料', '完成毕业论文', '等待录取结果']}
          ]
        }
      }
    },
    public: {
      '国家公务员（国考）': {
        freshman: {
          currentStatus: '大一新生，考公基础准备期',
          abilities: ['了解考公基本信息', '政治素养待提升', '写作能力待培养'],
          plans: [
            {phase: '大一上学期', tasks: ['了解公务员考试类型（国考、省考、选调生）', '提交入党申请书', '加入学生会或社团锻炼组织能力', '关注时政新闻培养政策敏感度', '保持高GPA']},
            {phase: '大一下学期', tasks: ['继续入党流程', '参加社会实践或志愿服务', '学习公文写作基础', '考取英语四级', '了解目标岗位招录要求']}
          ]
        },
        sophomore: {
          currentStatus: '大二学生，考公能力积累期',
          abilities: ['政治素养提升中', '组织协调能力培养', '政策敏感度建立'],
          plans: [
            {phase: '大二上学期', tasks: ['考取英语六级和计算机二级', '参加学生干部竞选', '关注人民日报评论培养申论思维', '学习行测基础模块（资料分析、判断推理）', '积累时政素材']},
            {phase: '大二下学期', tasks: ['完成入党流程成为预备党员', '参加政府部门实习', '系统学习行测各模块', '练习申论写作', '建立岗位数据库']}
          ]
        },
        junior: {
          currentStatus: '大三学生，考公备考黄金期',
          abilities: ['政治面貌达标', '行测基础已建立', '申论能力培养中'],
          plans: [
            {phase: '大三上学期', tasks: ['成为正式党员', '确定目标岗位（税务局、统计局、海关等）', '系统学习行测五大模块', '每周练习申论写作', '参加公考辅导班']},
            {phase: '大三下学期', tasks: ['刷行测真题套卷', '申论批改提升', '参加模拟考试', '准备选调生考试', '关注国考省考公告']}
          ]
        },
        senior: {
          currentStatus: '大四学生，考公冲刺阶段',
          abilities: ['行测能力成熟', '申论写作达标', '准备参加考试'],
          plans: [
            {phase: '大四上学期（9-12月）', tasks: ['参加国考报名和笔试', '继续刷题提速', '申论重点练大作文框架', '准备省考复习', '参加选调生考试']},
            {phase: '大四下学期（1-6月）', tasks: ['参加省考笔试', '准备面试', '参加事业单位联考', '完成毕业论文', '等待录用结果']}
          ]
        }
      }
    }
  },
  '软件工程': {
    job: {
      'Java开发工程师': {
        freshman: {
          currentStatus: '大一新生，Java开发基础阶段',
          abilities: ['正在学习Java编程语言', '了解面向对象概念', '掌握基础数据结构'],
          plans: [
            {phase: '大一上学期', tasks: ['深入学习Java编程语言基础', '掌握面向对象编程思想', '学习数据结构与算法基础', '了解数据库基本概念', '参加编程社团']},
            {phase: '大一下学期', tasks: ['学习Java集合框架和IO', '掌握MySQL数据库基础', '完成3-5个Java小项目', '学习Git版本控制', '考取计算机二级证书']}
          ]
        },
        sophomore: {
          currentStatus: '大二学生，Java技能成型阶段',
          abilities: ['已掌握Java基础', '具备数据库设计能力', '了解Spring框架'],
          plans: [
            {phase: '大二上学期', tasks: ['深入学习Spring/SpringMVC/MyBatis', '掌握Spring Boot快速开发', '学习微服务架构概念', '完成一个完整的Java Web项目', '参加蓝桥杯竞赛']},
            {phase: '大二下学期', tasks: ['寻找Java开发实习机会', '学习Spring Cloud微服务', '掌握Redis缓存和消息队列', '建立GitHub开源项目', '为秋招做准备']}
          ]
        },
        junior: {
          currentStatus: '大三学生，Java求职关键期',
          abilities: ['掌握Spring全家桶', '有完整项目经验', '了解大厂技术栈'],
          plans: [
            {phase: '大三上学期', tasks: ['系统准备秋招（刷LeetCode算法题）', '整理Java项目经验', '学习大厂面试高频题', '争取大厂Java实习机会', '完善技术博客和简历']},
            {phase: '大三下学期', tasks: ['全力冲刺暑期实习申请', '深入准备系统设计面试', '学习目标公司技术栈', '积累GitHub开源贡献', '建立行业人脉']}
          ]
        },
        senior: {
          currentStatus: '大四学生，Java求职冲刺阶段',
          abilities: ['具备完整Java技能', '有实习/项目经验', '准备进入大厂'],
          plans: [
            {phase: '大四上学期', tasks: ['全力冲刺秋招，获取大厂offer', '参加校园招聘宣讲会', '完成毕业设计', '准备入职前技能学习', '签订三方协议']},
            {phase: '大四下学期', tasks: ['完成毕业答辩', '办理入职手续', '学习目标岗位入职前技能', '建立职场人脉', '规划职业发展路径']}
          ]
        }
      }
    },
    graduate: {
      '软件工程学术硕士': {
        freshman: {
          currentStatus: '大一新生，考研基础积累期',
          abilities: ['正在学习数学基础', '英语能力待提升', '专业基础待夯实'],
          plans: [
            {phase: '大一上学期', tasks: ['认真学习高数、线代、概率论（考研数学基础）', '扎实学习英语，为考研英语做准备', '了解考研基本信息和流程', '保持高GPA，为复试做准备', '考取英语四级']},
            {phase: '大一下学期', tasks: ['继续夯实数学基础', '学习软件工程核心课程', '了解目标院校和专业方向', '参加学术讲座和科研活动', '考取英语六级']}
          ]
        },
        sophomore: {
          currentStatus: '大二学生，考研方向探索期',
          abilities: ['数学基础已建立', '英语能力提升中', '专业方向待确定'],
          plans: [
            {phase: '大二上学期', tasks: ['确定考研目标院校和专业方向', '继续夯实数学基础', '阅读软件工程经典教材', '参与科研项目积累科研经历', '关注目标院校招生信息']},
            {phase: '大二下学期', tasks: ['开始接触考研英语词汇', '学习专业课核心内容', '参加学科竞赛积累履历', '联系目标院校学长学姐', '准备考研复习资料']}
          ]
        },
        junior: {
          currentStatus: '大三学生，考研备考关键期',
          abilities: ['数学基础扎实', '英语能力达标', '专业方向已确定'],
          plans: [
            {phase: '大三上学期', tasks: ['系统复习考研数学', '背诵考研英语核心词汇', '通读专业课教材', '收集目标院校真题', '制定详细复习计划']},
            {phase: '大三下学期', tasks: ['进入强化复习阶段', '攻克数学重难点', '开始做英语真题', '深入学习专业课', '参加考研辅导班']}
          ]
        },
        senior: {
          currentStatus: '大四学生，考研冲刺阶段',
          abilities: ['复习进入冲刺期', '真题训练阶段', '准备初试复试'],
          plans: [
            {phase: '大四上学期', tasks: ['全力冲刺考研初试', '做真题套卷模拟', '背诵政治核心考点', '专业课强化背诵', '调整心态']},
            {phase: '大四下学期', tasks: ['准备考研复试', '联系导师了解研究方向', '准备复试面试材料', '完成毕业论文', '等待录取结果']}
          ]
        }
      }
    },
    public: {
      '国家公务员': {
        freshman: {
          currentStatus: '大一新生，考公基础准备期',
          abilities: ['了解考公基本信息', '政治素养待提升', '写作能力待培养'],
          plans: [
            {phase: '大一上学期', tasks: ['了解公务员考试类型', '提交入党申请书', '加入学生会锻炼组织能力', '关注时政新闻', '保持高GPA']},
            {phase: '大一下学期', tasks: ['继续入党流程', '参加社会实践', '学习公文写作基础', '考取英语四级', '了解目标岗位招录要求']}
          ]
        },
        sophomore: {
          currentStatus: '大二学生，考公能力积累期',
          abilities: ['政治素养提升中', '组织协调能力培养', '政策敏感度建立'],
          plans: [
            {phase: '大二上学期', tasks: ['考取英语六级和计算机二级', '参加学生干部竞选', '关注人民日报评论', '学习行测基础模块', '积累时政素材']},
            {phase: '大二下学期', tasks: ['完成入党流程', '参加政府部门实习', '系统学习行测各模块', '练习申论写作', '建立岗位数据库']}
          ]
        },
        junior: {
          currentStatus: '大三学生，考公备考黄金期',
          abilities: ['政治面貌达标', '行测基础已建立', '申论能力培养中'],
          plans: [
            {phase: '大三上学期', tasks: ['成为正式党员', '确定目标岗位', '系统学习行测五大模块', '每周练习申论写作', '参加公考辅导班']},
            {phase: '大三下学期', tasks: ['刷行测真题套卷', '申论批改提升', '参加模拟考试', '准备选调生考试', '关注国考省考公告']}
          ]
        },
        senior: {
          currentStatus: '大四学生，考公冲刺阶段',
          abilities: ['行测能力成熟', '申论写作达标', '准备参加考试'],
          plans: [
            {phase: '大四上学期', tasks: ['参加国考报名和笔试', '继续刷题提速', '申论重点练大作文', '准备省考复习', '参加选调生考试']},
            {phase: '大四下学期', tasks: ['参加省考笔试', '准备面试', '参加事业单位联考', '完成毕业论文', '等待录用结果']}
          ]
        }
      }
    }
  }
};

// 获取专业特定学习计划
function getMajorSpecificPlan(major, planKey, routeTitle, grade) {
  // 查找专业特定计划
  var majorPlans = majorSpecificPlanData[major];
  if (majorPlans && majorPlans[planKey]) {
    var directionPlans = majorPlans[planKey];
    // 查找匹配的岗位计划
    for (var jobTitle in directionPlans) {
      if (routeTitle.indexOf(jobTitle) !== -1 || jobTitle.indexOf(routeTitle) !== -1) {
        return directionPlans[jobTitle];
      }
    }
    // 如果没有找到精确匹配，返回该方向的第一个计划
    for (var jobTitle in directionPlans) {
      return directionPlans[jobTitle];
    }
  }
  // 返回通用计划
  return gradePlanData[planKey] || gradePlanData['job'];
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
 // 月薪（将年薪转换为月薪）
 var salaryHtml='';
 if(route.salary){
 var salaryNum = route.salary.replace(/[^0-9.-]/g,'');
 var salaryDisplay = route.salary;
 if(salaryNum && salaryNum.indexOf('-') !== -1){
 var parts = salaryNum.split('-');
 var low = Math.round(parseFloat(parts[0])/12);
 var high = Math.round(parseFloat(parts[1])/12);
 salaryDisplay = '月薪'+low+'-'+high+'元';
 } else if(salaryNum && !isNaN(parseFloat(salaryNum))){
 var monthly = Math.round(parseFloat(salaryNum)/12);
 salaryDisplay = '月薪'+monthly+'元';
 }
 salaryHtml='<div class="route-salary"><span class="salary-label">💰 '+salaryDisplay;
 if(route.promotion){
 salaryHtml += ' <span class="promotion-info"> | '+route.promotion+'</span>';
 }
 salaryHtml += '</span></div>';
 }
 categoryHtml+='<div class="route-card"><div class="route-card-title">'+route.title+'</div>'+detailHtml+requirementHtml+salaryHtml+'</div>';
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
 // 月薪（将年薪转换为月薪）
 var salaryHtml='';
 if(route.salary){
 var salaryNum = route.salary.replace(/[^0-9.-]/g,'');
 var salaryDisplay = route.salary;
 if(salaryNum && salaryNum.indexOf('-') !== -1){
 var parts = salaryNum.split('-');
 var low = Math.round(parseFloat(parts[0])/12);
 var high = Math.round(parseFloat(parts[1])/12);
 salaryDisplay = '月薪'+low+'-'+high+'元';
 } else if(salaryNum && !isNaN(parseFloat(salaryNum))){
 var monthly = Math.round(parseFloat(salaryNum)/12);
 salaryDisplay = '月薪'+monthly+'元';
 }
 salaryHtml='<div class="route-salary"><span class="salary-label">💰 '+salaryDisplay;
 if(route.promotion){
 salaryHtml += ' <span class="promotion-info"> | '+route.promotion+'</span>';
 }
 salaryHtml += '</span></div>';
 }
 categoryHtml+='<div class="route-card"><div class="route-card-title">'+route.title+'</div>'+detailHtml+requirementHtml+salaryHtml+'</div>';
 });
 categoryHtml+='</div></div>';
 container.innerHTML+=categoryHtml;
 });
 }
}

async function fetchRoutesFromBackend(major) {
 try {
 var response = await fetch('https://career-assistant-api.vercel.app/api/routes/majors/name/' + encodeURIComponent(major));
 if (response.ok) {
 var routes = await response.json();
 var routeData = { job: [], graduate: [], public: [], other: [] };
 routes.forEach(function(route) {
 if (routeData[route.direction]) {
 routeData[route.direction].push(route);
 }
 });
 return routeData;
 }
 } catch (error) {
 console.error('Failed to fetch routes from backend:', error);
 }
 return majorDirectionRoutesMap[major] || defaultDirectionRoutes;
}

// 显示路线详细规划弹窗
function showRoutePlan(planKey, routeTitle, grade) {
 var gradeLabels={freshman:'大一',sophomore:'大二',junior:'大三',senior:'大四',fifth:'大五',graduate:'毕业一年内'};
 
 // 获取用户专业信息
 var major = currentUserInfoForPlan ? currentUserInfoForPlan.major : '';
 
 // 获取专业特定规划数据（优先使用专业特定计划，否则使用通用计划）
 var planData = getMajorSpecificPlan(major, planKey, routeTitle, grade);
 
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
 currentIndex = 0; // 如果找不到，默认从第一个开始
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
 // 遍历从当前年级开始的所有后续年级
 for (var i = currentIndex; i < gradeOrder.length; i++) {
 var g = gradeOrder[i];
 var gradeData = planData[g];
 if (!gradeData) continue;
 
 // 标记当前年级
 var isCurrentGrade = (g === grade);
 var currentTag = isCurrentGrade ? ' <span style="background:#0077cc;color:white;padding:2px 8px;border-radius:10px;font-size:0.75rem;margin-left:8px;">当前年级</span>' : '';
 
 modalHtml += '<div class="plan-phase" style="' + (isCurrentGrade ? 'border-left: 3px solid #0077cc; background: #f8fbff;' : '') + '">';
 modalHtml += '<div class="plan-phase-header">';
 modalHtml += '<span class="plan-phase-num" style="' + (isCurrentGrade ? 'background:#0077cc;' : '') + '">' + (planCount + 1) + '</span>';
 modalHtml += '<span class="plan-phase-title">' + gradeLabels[g] + currentTag + '</span>';
 modalHtml += '</div>';
 
 // 当前状态（仅当前年级显示）
 if (isCurrentGrade) {
 modalHtml += '<div class="plan-status-box" style="margin: 0.75rem 0; padding: 0.5rem; background: #f0f7ff; border-radius: 8px;">';
 modalHtml += '<div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">📍 当前状态：</div>';
 modalHtml += '<div style="font-size: 0.9rem; color: #333;">' + gradeData.currentStatus + '</div>';
 modalHtml += '</div>';
 
 // 当前能力（仅当前年级显示）
 modalHtml += '<div style="margin: 0.75rem 0;">';
 modalHtml += '<div style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">💪 当前应掌握能力：</div>';
 modalHtml += '<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">';
 gradeData.abilities.forEach(function(ability) {
 modalHtml += '<span style="background: #e8f4f8; color: #0077cc; padding: 4px 10px; border-radius: 15px; font-size: 0.8rem;">' + ability + '</span>';
 });
 modalHtml += '</div></div>';
 }
 
 modalHtml += '<div class="plan-tasks-list">';
 gradeData.plans.forEach(function(plan) {
 modalHtml += '<div class="plan-task-item">';
 modalHtml += '<span class="plan-task-checkbox">☐</span>';
 modalHtml += '<div>';
 modalHtml += '<div style="font-weight: 600; font-size: 0.85rem; color: #555; margin-bottom: 0.25rem;">📅 ' + plan.phase + '</div>';
 plan.tasks.forEach(function(task) {
 modalHtml += '<div style="display: flex; align-items: flex-start; margin: 0.25rem 0;">';
 modalHtml += '<span style="color: #999; margin-right: 0.5rem;">•</span>';
 modalHtml += '<span class="plan-task-text">' + task + '</span>';
 modalHtml += '</div>';
 });
 modalHtml += '</div></div>';
 });
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
 var majorCategory = majorCategoryMap[major] || 'tech';
 
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
 
 // 获取用户信息
 var major = userInfo.major || '';
 var grade = userInfo.grade || 'freshman';
 var directions = userInfo.directions || [];
 var majorCategory = majorCategoryMap[major] || 'tech';
 
 // 获取该年级该方向需要的能力（基于大数据）
 var requiredAbilities = getRequiredAbilities(majorCategory, directions, grade);
 
 // 根据用户测评结果、专业和年级评估当前能力
var userAbilities = evaluateUserAbilities(scores, directions, major, grade);
 
 // 对比分析生成差距列表
 var gaps = analyzeAbilityGaps(requiredAbilities, userAbilities);
 
 // 渲染能力差距分析
 if(gaps.length > 0){
 gaps.forEach(function(gap, index){
 var statusClass = gap.level === 'high' ? 'gap-high' : (gap.level === 'medium' ? 'gap-medium' : 'gap-low');
 var statusLabel = gap.level === 'high' ? '急需提升' : (gap.level === 'medium' ? '需要加强' : '建议学习');
 var statusIcon = gap.level === 'high' ? '🔴' : (gap.level === 'medium' ? '🟡' : '📚');
 
 abilitiesList.innerHTML += '<div class="ability-item ' + statusClass + '">' +
 '<span class="ability-num">' + (index + 1) + '</span>' +
 '<div class="ability-content">' +
 '<div class="ability-header">' +
 '<h4>' + gap.ability + '</h4>' +
 '<span class="ability-status ' + statusClass + '">' + statusIcon + ' ' + statusLabel + '</span>' +
 '</div>' +
 '<p class="gap-detail">' + gap.description + '</p>' +
 '<div class="gap-suggestion">' +
 '<span class="suggestion-label">📖 建议：</span>' +
 '<span class="suggestion-text">' + gap.suggestion + '</span>' +
 '</div>' +
 '</div></div>';
 });
 } else {
 // 如果没有明显差距，显示基于测评的优势能力
 top3.forEach(function(d,index){
 var items=abilitiesMap[d]||[];
 items.slice(0,1).forEach(function(item){
 abilitiesList.innerHTML+='<div class="ability-item"><span class="ability-num">'+(abilitiesList.children.length+1)+'</span><div class="ability-content"><h4>'+item.split('：')[0]+'</h4><p>'+item.split('：')[1]+'</p></div></div>';
 });
 });
 }
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
    initSearchSelect();
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
    
    var routeData = majorDirectionRoutesMap[major] || defaultDirectionRoutes;
    var results = [];
    
    if (isUndecided) {
        // 未确定方向：返回所有路线
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
        // 确定方向：只返回该方向的路线
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