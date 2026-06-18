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
 allSkills.forEach(function(s){
  var label = document.createElement('label');
  label.className = 'skill-pill';
  label.innerHTML = '<input type="checkbox" name="skill" value="'+s+'"><span>'+s+'</span>';
  pills.appendChild(label);
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