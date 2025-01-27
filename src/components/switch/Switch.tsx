import { ChangeEvent } from "react";

import "./Switch.css";

interface ISwitchProps {
    id: string;
    name: string;
    checked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    label: string;
}

export function Switch(props: ISwitchProps) {
    const { id, name, checked, onChange, label } = props;

    return (
        <label htmlFor={id} className="timeline__switch-label">
            <div className="timeline__switch">
                <input type="checkbox" className="timeline__switch-checkbox" name={name} id={id}
                    checked={checked} onChange={onChange} />
                <label className="timeline__switch-body" htmlFor={id}>
                    <span className="timeline__switch-inner"></span>
                    <span className="timeline__switch-switch"></span>
                </label>
            </div>
            {label}
        </label>
    )
}