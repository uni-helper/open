/** 小程序平台标识 */
export const MP_PLATFORMS = {
  'mp-weixin': '微信',
  'mp-alipay': '支付宝',
  'mp-baidu': '百度',
  'mp-toutiao': '字节跳动',
  'mp-qq': 'QQ',
  'mp-xhs': '小红书',
  'mp-harmony': '鸿蒙',
  'mp-jd': '京东',
  'mp-kuaishou': '快手',
  'mp-lark': '飞书',
} as const

export type MPPlatform = keyof typeof MP_PLATFORMS
