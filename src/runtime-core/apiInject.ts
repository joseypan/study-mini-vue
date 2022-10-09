import { getCurrentInstance } from "./component";

/**
 * 描述：provider data
 * @param { string } key 数据对应的key，后续要根据key进行数据查找
 * @return
 */
export const provider = (key: string, data: any) => {
  const instance = getCurrentInstance();
  // 因为provider方法只在setup中存在，所以根据instance是否有值看在不在setup中
  if (!instance) return;
  // 从instance中获取到provider，给provider赋值
  const { provider }: any = instance;
  provider[key] = data;
};
/**
 * 描述：consumer data
 * @param { string } key 数据对应的key
 * @return
 */
export const inject = (key: string) => {
  const instance = getCurrentInstance();
  const { parent } = instance;
};
