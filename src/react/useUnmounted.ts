import { useEffect, useRef } from "react";

const useUnmounted = () => {
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
    };
  }, []);

  return () => unmounted.current;
};

export default useUnmounted;
