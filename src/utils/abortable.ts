/**
 * 讓任何 promise 支援 AbortSignal 取消語意。
 *
 * 當 signal 觸發時立即以 { statusCode: 499 } reject，讓呼叫端可提早離開鏈路，
 * 避免後續的 DB 寫入或 Cloudinary 上傳繼續執行並消耗資源。
 *
 * 注意：底層的外部請求（例如 Gemini SDK、axios）可能仍會跑完，
 * 但因為呼叫端已離開，後續副作用不會發生。
 */
export function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  // 未傳入 signal 時直接回傳原始 promise，不影響舊有呼叫端行為
  if (!signal) return promise;

  if (signal.aborted) {
    return Promise.reject({ statusCode: 499, message: '請求已取消' });
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject({ statusCode: 499, message: '請求已取消' });

    signal.addEventListener('abort', onAbort, { once: true });

    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (err) => {
        signal.removeEventListener('abort', onAbort);
        reject(err);
      }
    );
  });
}
