// 相当于是创建了一个队列用来收集所有的更新,我们的目的是等到所有的更新都结束之后，我们再调用更新，可以节省性能消耗
// 这里牵扯了一个问题 同步任务 -> 微任务
// 微任务的执行顺序会晚于同一批次的同步任务，所以我们会先完成测试用例中的for循环，然后才会执行Promise.resolve().then的逻辑

export const queue: any[] = [];
let isFlushPending = false;
const p = Promise.resolve();
// 这里的逻辑设计很巧妙，我们在mountComponet的时候，调用effect会产生runner，然后后续无论添加多少次，传过来的job都是一样的
// 当做了去重处理之后，相当于在微任务队列中只会有唯一一个任务->所以最终只会调用一次
// 这样做可以实现，但是当我们想再次触发的时候，会发现已经触发不了了 -> 所以需要一个契机什么时候重置?
export const nextTick = (fn) => {
  return fn ? p.then(fn) : p;
};
export const queueJob = (job) => {
  //这里需要判断一下是否重复添加,若重复添加就不加入进去
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
};

const queueFlush = () => {
  // 这里需要设置一个节流阀，防止同时多次触发
  if (isFlushPending) return;
  isFlushPending = true;
  nextTick(jobFlush);
};
const jobFlush = () => {
  //这里因为可能会有多个job，所以需要循环遍历queue
  let job;
  while (queue.length) {
    job = queue.shift();
    job && job();
  }
  isFlushPending = false;
};
