import { ChangeEvent, useState } from 'react';
import { createRef, RefObject } from 'react';
import {
    isAddressValid, isUint256Valid, isRealNumber
} from './common';
  
export function Address({...props}) {
  const inputRef: RefObject<HTMLInputElement> = createRef();
  // const [value, setValue] = useState(props.value);
  return (
    <span className="Address">
      <input type="text"
             style={{maxWidth: '23.5em', width: '100%'}}
             maxLength={42}
             size={50}
             defaultValue={props.value ? props.value : ""}
             onChange={(e: ChangeEvent<HTMLInputElement>) => props.onChange(e)}
             className={isAddressValid(props.value) ? '' : 'error'}
             ref={inputRef}/>
    </span>
)
}

// FIXME: Right support for 256 and 160 bit values.
export function Uint256({...props}) {
  return (
    <span className="Uint256">
      <input type="text"
             style={{maxWidth: '27em', width: '100%'}}
             maxLength={78}
             defaultValue={props.value}
             onChange={props.onChange}
             className={isUint256Valid(props.value) ? '' : 'error'}/>
    </span>
  )
}

export function Amount({...props}  ) {
  return (
    <span className="Amount">
      <input type="text"
             style={{maxWidth: '8em', width: '100%'}} /* Hack for 160 bit value */
             defaultValue={props.value ? props.value : ""}
             onChange={props.onChange}
             className={isRealNumber(props.value) ? '' : 'error'}/>
    </span>
  )
}
