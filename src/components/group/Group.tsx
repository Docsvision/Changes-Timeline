import { forwardRef, ReactNode } from "react";
import { Group as GroupType } from "@/types/Types";

import "./Group.css";

interface IGroupProps {
    groupInfo?: GroupType;
    icon: ReactNode;
}

export const Group = forwardRef<HTMLDivElement, IGroupProps>(function Group(props, ref) {
    const { icon, groupInfo } = props;
    return (
        <div className="timeline__group" ref={ref}>
            <div className="timeline__group-header"></div>
            {icon}
            <div className="timeline__group-content">
                <div className="timeline__group-title">
                    {groupInfo?.title ?? ""}
                </div>
                <div className={"timeline__group-description"}
                    dangerouslySetInnerHTML={{ __html: groupInfo?.description ?? "" }}>
                </div>
            </div>
        </div>
    );
});