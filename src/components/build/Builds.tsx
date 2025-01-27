import { ReactNode } from "react";

import "./Build.css";

interface IBuildProps {
    buildId: number;
    icon: ReactNode;
    toggleExpandAllForBuild: (buildId: number) => void;
    title: string;
    children: ReactNode;
}

export function Build(props: IBuildProps) {
    const { buildId, icon, toggleExpandAllForBuild, title, children } = props;

    function handleTitleClick() {
        toggleExpandAllForBuild(buildId);
    };

    return (
        <li className="timeline__build">
            <div className="timeline__build-header"></div>
            {icon}
            <div className="timeline__build-content">
                <div className="timeline__build-title" onClick={handleTitleClick}>
                    <div className="timeline__build-title-text">{title}</div>
                    <div className="timeline__build-toggle">
                        <div className="timeline__build-toggle-wrapper">
                            <div className="timeline__expand-icon"></div>
                        </div>
                    </div>
                </div>
                <div className="timeline__build-text">
                    <ul>
                        {children}
                    </ul>
                </div>
            </div>
        </li>
    );
};