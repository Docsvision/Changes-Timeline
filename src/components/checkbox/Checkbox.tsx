import { ChangeEvent } from "react";

import "./Checkbox.css";

export interface ICheckboxProps {
    checked: boolean;
    id: string;
    name: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    label: string;
}

export function Checkbox(props: ICheckboxProps) {
    const {checked, id, name, onChange, label} = props;

    return (
        <label htmlFor={id} className="timeline__checkbox">
            <input type="checkbox" id={id} name={name} checked={checked} onChange={onChange} />
            {label}
        </label>
    )
}