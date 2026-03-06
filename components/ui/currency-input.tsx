"use client"

import { forwardRef } from "react"
import { NumericFormat } from "react-number-format"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
  value?: string | number
  defaultValue?: string | number
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  required?: boolean
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, defaultValue, onChange, placeholder = "0", disabled, className, id, name, required, ...props }, ref) => {
    return (
      <NumericFormat
        customInput={Input}
        thousandSeparator="."
        decimalSeparator=","
        prefix="$ "
        decimalScale={0}
        fixedDecimalScale={false}
        allowNegative={false}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(values) => {
          onChange?.(values.value)
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(className)}
        id={id}
        name={name}
        required={required}
        getInputRef={ref}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"
