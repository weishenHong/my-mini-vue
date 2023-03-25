const queue: any = [];
// 判断当前是否有更新任务正在等待被执行。如果isFlushPending为true，那么说明当前更新任务已经被加入到更新队列中，但是还没有被执行。
let isFlushPending = false;
let p = Promise.resolve();
export function nextTick(fn: any) {
  // 传入fn，将fn用then推入到微任务队列中，没有传入，则返回一个promise( 可以让用户await )
  return fn ? p.then(fn) : p;
}
export function queueJobs(job: any) {
  if (!queue.includes(job)) {
    queue.push(job);
  }

  queueFlush();
}
function queueFlush() {
  // 更新任务还没有被执行，不会重复添加另一个更新任务
  if (isFlushPending) return;
  isFlushPending = true;
  // 用微任务异步更新
  nextTick(flushJobs);
}
function flushJobs() {
  isFlushPending = false;
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}
