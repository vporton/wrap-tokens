import {
    isAddressValid, isUint256Valid, isRealNumber
} from './common';
  
export function Address({...props}) {
  return (
    <span className="Address">
      <input type="text"
             style={{maxWidth: '23.5em', width: '100%'}}
             maxLength={42}
             size={50}
             value={props.value ? props.value : ""}
             onChange={props.onChange}
             className={isAddressValid(props.value) ? '' : 'error'}/>
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
             value={props.value}
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
             value={props.value ? props.value : ""}
             onChange={props.onChange}
             className={isRealNumber(props.value) ? '' : 'error'}/>
    </span>
  )
}
