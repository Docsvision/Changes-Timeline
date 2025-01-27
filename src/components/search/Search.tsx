import { ChangeEvent, useEffect, useState } from "react";
import { SEARCH_DEBOUNCE_DELAY } from "@/helpers/constants";
import { useDebounce } from "@/hooks/useDebounce";

import "./Search.css";

interface ISearchProps {
    onSearchChange: (value: string) => void;
    label: string;
    name: string;
}   

export function Search(props: ISearchProps) {
    const { label, name, onSearchChange } = props;

    const [searchValue, setSearchValue] = useState("");
    const debouncedValue = useDebounce(searchValue, SEARCH_DEBOUNCE_DELAY);

    useEffect(() => {
        onSearchChange(debouncedValue);
    }, [debouncedValue])

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value);
    }

    function handleClearSearch() {
        setSearchValue("");
    }

    return (
        <div className="timeline__search">
            <div className="timeline__search-input-wrapper">
                <div className="timeline__search-icon"></div>
                <input id={name} name={name} placeholder={label} type="text" className="timeline__search-input"
                    onChange={handleChange} value={searchValue} />
                {searchValue && <div onClick={handleClearSearch} className="timeline__search-clear-btn"></div>}
            </div>
        </div>
    );
};