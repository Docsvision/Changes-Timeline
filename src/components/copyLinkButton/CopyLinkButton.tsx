import { forwardRef, HTMLAttributes, MouseEvent, useState } from "react";
import { LinkIcon } from "@/components/linkIcon/LinkIcon";
import { getLinkWithGroupId } from "@/helpers/getLinkWithGroupId";
import { useHasHover } from "@/hooks/useHasHover";

import "./CopyLinkButton.css";

interface ICopyLinkButtonProps extends HTMLAttributes<HTMLButtonElement> {
    groupId: string;
    visible: boolean;
}

export const CopyLinkButton = forwardRef<HTMLButtonElement, ICopyLinkButtonProps>(function CopyLinkButton(props, ref) {
    const { groupId, visible, onMouseLeave, onMouseEnter, ...buttonProps } = props;
    const link = getLinkWithGroupId(groupId);
    const hasHover = useHasHover();

    const [copied, setCopied] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);

    function copyToClickboard() {
        navigator.clipboard.writeText(link);
        setCopied(true);

        if (!hasHover) {
            setTooltipVisible(true);
            setTimeout(() => setTooltipVisible(false), 1000);
        }
    }

    function handleMouseEnter(event: MouseEvent<HTMLButtonElement>) {
        setTooltipVisible(true);
        onMouseEnter?.(event);
    }

    function handleMouseLeave(event: MouseEvent<HTMLButtonElement>) {
        setTooltipVisible(false);
        setTimeout(() => {
            setCopied(false);
        }, 200);
        onMouseLeave?.(event);
    }
    
    return (
        <button className={"timeline__copy-link-button" + (visible ? " timeline__copy-link-button_visible" : "")} onClick={copyToClickboard}
            onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={ref} {...buttonProps}>
            <LinkIcon />
            <div className={"timeline__copy-link-button__tooltip" + (tooltipVisible ? " timeline__copy-link-button__tooltip_visible" : "")}>
                {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
            </div>
        </button>
    );
});