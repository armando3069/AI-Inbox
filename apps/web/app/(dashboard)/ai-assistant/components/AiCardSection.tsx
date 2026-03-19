import { ReactNode } from "react";
import { CARD, ICON_BOX, ICON, CARD_TITLE, CARD_DESC } from "@/app/(dashboard)/ai-assistant/utils/ai-assistant.utils";

export interface AiCardSectionProps {
  icon: ReactNode;
  title: string;
  description: string | ReactNode;
  children?: ReactNode;
  headerRight?: ReactNode;
}

export function AiCardSection({
  icon,
  title,
  description,
  children,
  headerRight,
}: AiCardSectionProps) {
  return (
    <div className={CARD}>
      <div className={`flex items-start ${headerRight ? "justify-between" : ""} gap-4 ${children ? "mb-5" : ""}`}>
        <div className="flex items-start gap-3.5">
          <div className={ICON_BOX}>
            <span className={ICON}>{icon}</span>
          </div>
          <div>
            <p className={CARD_TITLE}>{title}</p>
            <p className={CARD_DESC}>{description}</p>
          </div>
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>
      {children}
    </div>
  );
}
