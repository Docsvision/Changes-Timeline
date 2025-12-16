import { forwardRef, HTMLAttributes, MouseEvent, useEffect, useRef, useState } from "react";
import { LinkIcon } from "@/components/linkIcon/LinkIcon";
import { getLinkWithGroupId } from "@/helpers/getLinkWithGroupId";

import "./CopyLinkButton.css";

interface ICopyLinkButtonProps extends HTMLAttributes<HTMLButtonElement> {
    groupId: string;
    visible: boolean;
}

export const CopyLinkButton = forwardRef<HTMLButtonElement, ICopyLinkButtonProps>(function CopyLinkButton(props, ref) {
    const { groupId, visible, onMouseLeave, onMouseEnter, ...buttonProps } = props;
    const link = getLinkWithGroupId(groupId);
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const [copied, setCopied] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);

    const tooltipVisibleTimerRef = useRef<number>();
    const isCopiedTimerRef = useRef<number>();

    useEffect(() => {
        return () => {
            window.clearTimeout(tooltipVisibleTimerRef.current);
            window.clearTimeout(isCopiedTimerRef.current);
        }
    }, []);

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
    
            if (!hasHover) {
                setTooltipVisible(true);
                if (tooltipVisibleTimerRef.current) {
                    window.clearTimeout(tooltipVisibleTimerRef.current);
                }
                tooltipVisibleTimerRef.current = window.setTimeout(() => setTooltipVisible(false), 1000);
            }
        } catch(error) {
            console.log(error);
        }
    }

    function handleMouseEnter(event: MouseEvent<HTMLButtonElement>) {
        setTooltipVisible(true);
        onMouseEnter?.(event);
    }

    function handleMouseLeave(event: MouseEvent<HTMLButtonElement>) {
        setTooltipVisible(false);
        if (isCopiedTimerRef.current) {
            window.clearTimeout(isCopiedTimerRef.current);
        }
        isCopiedTimerRef.current = window.setTimeout(() => setCopied(false), 200);
        onMouseLeave?.(event);
    }
    
    return (
        <button className={"timeline__copy-link-button" + (visible ? " timeline__copy-link-button_visible" : "")} onClick={copyToClipboard}
            onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={ref} {...buttonProps}>
            <LinkIcon />
            <div className={"timeline__copy-link-button__tooltip" + (tooltipVisible ? " timeline__copy-link-button__tooltip_visible" : "")}>
                {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
            </div>
        </button>
    );
});