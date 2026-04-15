import { forwardRef, MouseEvent, ReactNode, useRef, useState } from "react";
import { Group as GroupType } from "@/types/Types";
import { CopyLinkButton } from "@/components/copyLinkButton/CopyLinkButton";

import "./Group.css";

interface IGroupProps {
    groupInfo?: GroupType;
    icon: ReactNode;
}

export const Group = forwardRef<HTMLDivElement, IGroupProps>(function Group(props, ref) {
    const { icon, groupInfo } = props;
    const [visible, setVisible] = useState(false);
    const titleRef = useRef<HTMLDivElement>(null);

    function handleMouseEnter() {
        setVisible(true);
    }

    function handleMouseLeave(event: MouseEvent<HTMLDivElement | HTMLButtonElement>) {
        const related = event.relatedTarget as HTMLElement | null;
        setTimeout(() => {
            const titleEl = titleRef.current;
            const insideTitle = titleEl && related && titleEl.contains(related);

            if (!insideTitle) {
                setVisible(false);
            }
        }, 200);
    }

    return (
        <div className="timeline__group" ref={ref}>
            <div className="timeline__group-header"></div>
            {icon}
            <div className="timeline__group-content">
                <div className="timeline__group-title-wrapper" ref={titleRef} onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter}>
                    <div className="timeline__group-title">
                        {groupInfo?.title ?? ""}
                    </div>
                    <div className="timeline__group-copy-link-button">
                        <CopyLinkButton onMouseLeave={handleMouseLeave} groupId={groupInfo?.id.toString() ?? ""} visible={visible} />
                    </div>
                </div>
                <div className={"timeline__group-description"}
                    dangerouslySetInnerHTML={{ __html: groupInfo?.description ?? "" }}>
                </div>
            </div>
        </div>
    );
});