import React from 'react'

function Button ({
  handleClick,
  buttonTitle,
  buttonClass,
  otherProps,
  disabledCondition = false
}) {
  return (
    <button
      {...otherProps}
      disabled={disabledCondition}
      onClick={handleClick}
      className={`button rounded-pill px-4 py-2 ${buttonClass}`}
    >
      {buttonTitle}
    </button>
  )
}

export default Button
