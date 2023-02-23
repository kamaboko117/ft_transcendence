import React, { useRef, useEffect } from "react";

/*
  Call this to listening to events outside a react component
*/
export const useEventListener = (callback: any) => {
    const ref: React.MutableRefObject<any> = useRef();
    useEffect(() => {
      //create eventListener
      const eventFunction = (event: any) => {
        console.log("event func event");
        console.log(event.target.innerHTML);
        console.log("ref func event");
        console.log(ref.current.childBindings.domNode.childNodes);
        const arr = ref.current.childBindings.domNode.childNodes;
        const length = arr.length;
        let i = 0;
        for (i = 0; i < length; ++i)
        {
            console.log(arr[i].textContent);
            if (event.target.innerHTML === arr[i].textContent)
                break ;
        }
        console.log("i: " + i + "length: " + length);
        //if (ref.current && !ref.current.contains(event.target))
        if (i >= length)
            callback();
      }
      //listening to JS event
      document.addEventListener("click", eventFunction);
      return () => {
        document.removeEventListener("click", eventFunction)
      };
    }, [ref])
    return (ref);
  }