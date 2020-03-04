import { ModelHook } from "./types";
import { ReactElement, useEffect, useMemo, useRef } from "react";

export function Executor<T>(props: {
  hook: ModelHook<T>;
  onUpdate: (data: T) => void;
}) {
  const data = props.hook();
  const initialLoad = useRef(false);

  useMemo(() => {
    // notify the initial value
    props.onUpdate(data);
    initialLoad.current = false;
  }, [])

  useEffect(()=>{
    if (initialLoad.current) {
      // notify the following value changes
      props.onUpdate(data);
    } else {
      initialLoad.current = true;
    }
  })

  return null as ReactElement;
}
