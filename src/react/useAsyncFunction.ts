import { useCallback, useEffect, useMemo, useState } from "react";
import { PromiseCancelled } from "../internal/callFunction";

export type UseAsyncFunctionInstance<
  Fn extends (...args: any[]) => Promise<any>,
  E = unknown
> = IUseAsyncFunctionInstance<Fn> &
  (
    | {
        args: Parameters<Fn> | [];
        result: Awaited<ReturnType<Fn>>;
        error?: E;
        isPending: boolean;
        isSuccess: true;
        isError: false;
      }
    | {
        args: Parameters<Fn> | [];
        error: E;
        result?: Awaited<ReturnType<Fn>>;
        isPending: boolean;
        isSuccess: false;
        isError: true;
      }
  );

export interface IUseAsyncFunctionInstance<
  Fn extends (...args: any[]) => Promise<any>
> {
  (...args: Parameters<Fn>): void;
}

const useAsyncFunction = <
  Fn extends (...args: any[]) => Promise<any>,
  E = unknown
>(
  fn: Fn,
  initialResult?: Awaited<ReturnType<Fn>>
): UseAsyncFunctionInstance<Fn, E> => {
  const [args, setArgs] = useState<Parameters<Fn> | undefined>();
  const [result, setResult] = useState<Awaited<ReturnType<Fn>> | undefined>(
    initialResult
  );
  const [error, setError] = useState<E>();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (args === undefined) return;

    setIsPending(true);
    setIsSuccess(false);
    setIsError(false);

    let cancelled = false;

    fn(...args)
      .then(
        (result) => {
          if (!cancelled) {
            setResult(result);
            setIsSuccess(true);
          }
        },
        (reason) => {
          if (reason === PromiseCancelled) {
            cancelled = true;
          } else {
            setError(reason);
            setIsError(true);
          }
        }
      )
      .finally(() => {
        if (!cancelled) setIsPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [args]);

  const callback = useCallback((...args: Parameters<Fn>) => {
    console.log("SALUDOS");
    setArgs(args);
  }, []);

  const callableObj = useMemo(() => {
    return Object.assign(callback, {
      args,
      result,
      error,
      isPending,
      isSuccess,
      isError,
    });
  }, [callback, args, result, error, isPending, isSuccess, isError]);

  return callableObj as UseAsyncFunctionInstance<Fn, E>;
};

export default useAsyncFunction;
