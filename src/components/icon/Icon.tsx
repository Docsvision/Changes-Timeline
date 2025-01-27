import { TimelineIcon } from "@/components/timelineIcon/TimelineIcon";

import "./Icon.css";

interface IIconProps {
    iconId: string | undefined;
    wide?: boolean;
}

export function Icon(props: IIconProps) {
    const { iconId, wide } = props;

    return (
        <div className="timeline__icon">
            <div className={`timeline__icon-circle ${wide ? "timeline__icon-circle_wide" : ""}`}>
                <TimelineIcon iconId={iconId} />
            </div>
            <div className="timeline__icon-line"></div>
        </div>
    );
};