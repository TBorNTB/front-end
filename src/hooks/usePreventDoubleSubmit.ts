'use client';

import { useCallback, useRef, useState } from 'react';

type AnyAsyncFn = (...args: unknown[]) => Promise<unknown>;

/**
 * 제출/클릭 시 연속 호출을 막는 훅.
 * 버튼이나 form onSubmit에 사용하면 빠른 연속 클릭으로 인한 중복 POST/생성을 방지할 수 있습니다.
 *
 * @param fn - 실제 실행할 비동기 함수 (form 이벤트를 받을 경우 첫 인자로 React.FormEvent 사용 가능)
 * @returns { handleSubmit, isSubmitting } - 래핑된 핸들러와 제출 중 여부
 *
 * @example
 * // Form
 * const { handleSubmit, isSubmitting } = usePreventDoubleSubmit(async (e) => {
 *   await createItem(data);
 * });
 * <form onSubmit={handleSubmit}>...</form>
 * <button type="submit" disabled={isSubmitting}>저장</button>
 *
 * @example
 * // Button click
 * const { handleSubmit, isSubmitting } = usePreventDoubleSubmit(async () => {
 *   await doSomething();
 * });
 * <button onClick={handleSubmit} disabled={isSubmitting}>실행</button>
 */
export function usePreventDoubleSubmit<T extends AnyAsyncFn>(fn: T) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const handleSubmit = useCallback(
    (...args: Parameters<T>): Promise<unknown> => {
      if (submittingRef.current) return Promise.resolve();
      const first = args[0] as React.FormEvent<HTMLFormElement> | undefined;
      if (
        first &&
        typeof first === 'object' &&
        'preventDefault' in first &&
        typeof (first as React.FormEvent).preventDefault === 'function'
      ) {
        (first as React.FormEvent).preventDefault();
      }
      submittingRef.current = true;
      setIsSubmitting(true);
      return (async () => {
        try {
          await (fnRef.current as (...a: unknown[]) => Promise<unknown>)(...args);
        } finally {
          submittingRef.current = false;
          setIsSubmitting(false);
        }
      })();
    },
    []
  ) as T;

  return { handleSubmit, isSubmitting };
}
