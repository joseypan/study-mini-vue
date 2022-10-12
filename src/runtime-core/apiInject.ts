import { getCurrentInstance } from "./component";

/**
 * 描述：provider data
 * @param { string } key 数据对应的key，后续要根据key进行数据查找
 * @return
 */
export const provider = (key: string, data: any) => {
  const instance: any = getCurrentInstance();
  // 因为provider方法只在setup中存在，所以根据instance是否有值看在不在setup中
  if (!instance) return;
  // 从instance中获取到provider，给provider赋值
  let { provider }: any = instance;
  const parentProvider = instance.parent.provider;
  //希望通过原型链让当前instance.provider指向parentProvider
  // init
  if (provider === parentProvider) {
    provider = instance.provider = Object.create(parentProvider);
  }
  provider[key] = data;
};
/**
 * 描述：consumer data
 * @param { string } key 数据对应的key
 * @return
 */
export const inject = (key: string, defaultValue: any) => {
  const instance = getCurrentInstance();
  const { parent }: any = instance;
  if (key in parent.provider) {
    return parent.provider[key];
  } else if (defaultValue) {
    if (typeof defaultValue === "function") {
      return defaultValue();
    }
    return defaultValue;
  }
};
