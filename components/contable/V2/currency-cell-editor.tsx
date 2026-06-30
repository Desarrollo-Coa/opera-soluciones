'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { ICellEditorParams } from 'ag-grid-community';

export const CurrencyCellEditor = forwardRef((params: ICellEditorParams, ref) => {
    const [value, setValue] = useState(params.value);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => {
        return {
            getValue() {
                return value;
            },
            isCancelBeforeStart() {
                return false;
            },
            isCancelAfterEnd() {
                return false;
            }
        };
    });

    useEffect(() => {
        // Enfocar el input al iniciar la edición
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    }, []);

    return (
        <div className="flex items-center w-full h-full bg-background px-2 border border-primary ring-1 ring-primary z-50">
            <span className="mr-1 text-muted-foreground">$</span>
            <NumericFormat
                getInputRef={inputRef}
                value={value}
                onValueChange={(values) => {
                    // Guardamos el valor numérico "limpio"
                    setValue(values.floatValue);
                }}
                thousandSeparator="."
                decimalSeparator=","
                prefix=""
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm"
                allowNegative={true}
            />
        </div>
    );
});

CurrencyCellEditor.displayName = 'CurrencyCellEditor';
