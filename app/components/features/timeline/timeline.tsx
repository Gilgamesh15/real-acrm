import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

import { cn, formatDate } from "~/lib/utils";

export type TimelineEvent = {
  variant: "success" | "default" | "pending" | "destructive";
  timestamp?: Date;
  icon: LucideIcon;
  title: string;
  description?: string;
  passedDescription?: string;
  isLast?: boolean;
};

const Timeline = ({ events }: { events: TimelineEvent[] }) => {
  return (
    <div className="relative space-y-12">
      {events.map((event, index) => (
        <div key={index} className="relative">
          <TimelineEvent {...event} isLast={index === events.length - 1} />
          {index < events.length - 1 && (
            <TimelineConnector variant={event.variant} index={index} />
          )}
        </div>
      ))}
    </div>
  );
};

export { Timeline };

const TimelineEvent = ({
  variant,
  timestamp,
  icon: Icon,
  title,
  description,
  isLast,
}: TimelineEvent) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          iconBg: "bg-green-500",
          iconText: "text-white",
          titleText: "text-foreground",
          descText: "text-muted-foreground",
        };
      case "pending":
        return {
          iconBg: "bg-primary",
          iconText: "text-primary-foreground",
          titleText: "text-foreground",
          descText: "text-muted-foreground",
        };
      case "destructive":
        return {
          iconBg: "bg-destructive",
          iconText: "text-destructive-foreground",
          titleText: "text-foreground",
          descText: "text-muted-foreground",
        };
      default:
        return {
          iconBg: "bg-muted",
          iconText: "text-muted-foreground",
          titleText: "text-muted-foreground",
          descText: "text-muted-foreground",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="flex items-start space-x-3">
      <div
        className={cn(
          "flex min-h-8 min-w-8 items-center justify-center rounded-full",
          styles.iconBg
        )}
      >
        <Icon className={cn("h-4 w-4", styles.iconText)} />
      </div>
      <div
        style={{
          height: isLast ? "auto" : "2.75rem",
        }}
        className="flex-1 space-y-0.5"
      >
        <div className="flex flex-col">
          <h3 className={cn("text-sm font-medium", styles.titleText)}>
            {title}
          </h3>
          {timestamp && (
            <time className="text-xs text-muted-foreground">
              {formatDate(timestamp)}
            </time>
          )}
        </div>
        {description && (
          <p className={cn("text-xs", styles.descText)}>{description}</p>
        )}
      </div>
    </div>
  );
};

const TimelineConnector = ({
  variant,
  index,
}: {
  variant: "success" | "default" | "pending" | "destructive";
  index: number;
}) => {
  const getConnectorColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-500";
      case "pending":
        return "bg-primary";
      case "destructive":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <motion.div
      className={cn("absolute left-4 top-8 min-h-15 w-px", getConnectorColor())}
      initial={{ height: 0 }}
      animate={{ height: 24 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    />
  );
};
