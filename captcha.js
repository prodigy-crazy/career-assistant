const captchaStore = {};

function generateCaptcha(length = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let captcha = '';
  for (let i = 0; i < length; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

function storeCaptcha(key, captcha) {
  captchaStore[key] = {
    code: captcha.toLowerCase(),
    timestamp: Date.now(),
    attempts: 0
  };
  setTimeout(() => {
    delete captchaStore[key];
  }, 5 * 60 * 1000);
}

function validateCaptcha(key, inputCode) {
  const stored = captchaStore[key];
  if (!stored) {
    return { valid: false, error: '验证码已过期' };
  }
  
  stored.attempts++;
  if (stored.attempts > 3) {
    delete captchaStore[key];
    return { valid: false, error: '验证次数过多，请重新获取' };
  }
  
  if (inputCode.toLowerCase() !== stored.code) {
    return { valid: false, error: '验证码错误' };
  }
  
  delete captchaStore[key];
  return { valid: true };
}

module.exports = {
  generateCaptcha,
  storeCaptcha,
  validateCaptcha
};
