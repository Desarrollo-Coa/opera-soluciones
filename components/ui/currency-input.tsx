"use client"

import { forwardRef } from "react"
import { NumericFormat } from "react-number-format"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
  value?: string | number
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder = "0", disabled, className, id, name, ...props }, ref) => {
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
        onValueChange={(values) => {
          onChange?.(values.value)
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(className)}
        id={id}
        name={name}
        getInputRef={ref}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"
