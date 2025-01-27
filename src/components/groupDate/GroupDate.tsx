import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { GroupedBuilds } from "@/types/Types";

import "./GroupDate.css";

interface IGroupDateProps {
    group: GroupedBuilds;
    toggleExpandAllForGroupedBuilds: (group: GroupedBuilds) => void;
}

export function GroupDate(props: IGroupDateProps) {
    const { group, toggleExpandAllForGroupedBuilds } = props;

    const date = format(new Date(group.date), "dd MMM yyyy", { locale: ru });

    function handleExpandAll() {
        toggleExpandAllForGroupedBuilds(group);
    };
    
    return (
        <div className="timeline__date-header">
            <div className={"timeline__date-title" + (!!group.groupId ? " timeline__group-date" : "")}
                onClick={handleExpandAll}>
                {date}
            </div>
        </div>
    );
};