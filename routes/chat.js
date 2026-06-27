const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, user_info, scores } = req.body;

    if (!message) {
      return res.status(400).json({ error: '缺少消息内容' });
    }

    const API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: '服务器未配置API密钥' });
    }

    const systemPrompt = `你是一个大学生职业规划智能助手。请根据用户信息提供专业的职业规划建议。

用户信息：
- 专业：${user_info?.major || '未指定'}
- 年级：${user_info?.grade || '未指定'}
- 方向：${user_info?.directions?.join(', ') || '未指定'}
- 测评得分：${JSON.stringify(scores || {})}

请用友好、专业的语气回答，提供具体的建议和行动步骤。`;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content || '抱歉，我无法回答这个问题。';
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('DeepSeek API Error:', error.message);
    res.status(500).json({ 
      error: 'AI服务暂时不可用',
      details: error.message 
    });
  }
});

module.exports = router;
