/**
 * 解码 GBK 编码的 Buffer
 * Windows 注册表等命令输出常为 GBK 编码
 */
export function decodeGbk(input?: NonSharedBuffer): string {
  const decoder = new TextDecoder('gbk')
  return decoder.decode(input)
}
