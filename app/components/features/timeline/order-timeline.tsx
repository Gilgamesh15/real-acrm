import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { TimelineEvent } from "~/components/features/timeline/timeline";
import { Timeline } from "~/components/features/timeline/timeline";
import type { OrderStatus } from "~/lib/types";
import type { DBQueryResult } from "~/lib/types";

const OrderTimeline = ({
  events,
}: {
  events: DBQueryResult<"orderTimelineEvents", {}>[];
}) => {
  const enrichedEvents = enrichOrderEvents({ events });

  const timelineEvents: TimelineEvent[] = enrichedEvents.map((event) => {
    const config = ORDER_TIMELINE_CONFIG[event.status];
    const shouldUsePassedDescription = event.variant === "success";

    return {
      ...config,
      description:
        shouldUsePassedDescription && config.passedDescription
          ? config.passedDescription
          : config.description,
      variant: event.variant,
      timestamp: event.createdAt,
    };
  });

  return <Timeline events={timelineEvents} />;
};

export { OrderTimeline };

type EnrichedOrderEvent = {
  id: string;
  status: OrderStatus;
  createdAt?: Date;
  variant: "success" | "default" | "pending" | "destructive";
};

type OrderTimelineEventConfig = {
  icon: LucideIcon;
  title: string;
  description?: string;
  passedDescription?: string;
};

const ORDER_TIMELINE_CONFIG: Record<OrderStatus, OrderTimelineEventConfig> = {
  pending: {
    title: "Złożyłeś zamówienie",
    description: "Oczekiwanie na potwierdzenie płatności",
    passedDescription: "Płatność została potwierdzona",
    icon: Package,
  },
  processing: {
    title: "Przygotowanie zamówienia",
    description: "Pakujemy Twoje zamówienie",
    passedDescription: "Zamówienie zostało spakowane",
    icon: Clock,
  },
  in_transit: {
    title: "Przekazane do InPost",
    description: "Zamówienie jest pod opieką InPost",
    passedDescription: "Zamówienie zostało przekazane do InPost",
    icon: Truck,
  },
  delivered: {
    title: "Gotowe do odbioru",
    description: "Zamówienie dotarło do paczkomatu",
    passedDescription: "Zamówienie zostało dostarczone do paczkomatu",
    icon: CheckCircle,
  },
  cancelled: {
    title: "Żądanie zwrotu",
    description: "Żądanie zwrotu",
    passedDescription: "Żądanie zwrotu zostało przetworzone",
    icon: XCircle,
  },
};

const ORDER_EVENT_ORDER: OrderStatus[] = [
  "pending",
  "processing",
  "in_transit",
  "delivered",
];

const enrichOrderEvents = ({
  events,
}: {
  events: DBQueryResult<"orderTimelineEvents", {}>[];
}): EnrichedOrderEvent[] => {
  // Sort events by createdAt (oldest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Get the current status (most recent event)
  const currentStatus = sortedEvents[sortedEvents.length - 1]?.status;

  // If cancelled, only show events up to and including cancelled
  if (currentStatus === "cancelled") {
    return sortedEvents.map((event) => ({
      ...event,
      variant: event.status === "cancelled" ? "destructive" : "success",
    }));
  }

  const result: EnrichedOrderEvent[] = [];

  // Add all statuses in order
  for (const status of ORDER_EVENT_ORDER) {
    const existingEvent = sortedEvents.find((e) => e.status === status);

    if (existingEvent) {
      // This event has happened
      result.push({
        ...existingEvent,
        variant: "success",
      });
    } else if (getStatusIndex(status) <= getStatusIndex(currentStatus)) {
      // This status should have happened by now but hasn't - show it anyway
      result.push({
        id: `missing-${status}`,
        status,
        createdAt: undefined,
        variant: "success",
      });
    } else {
      // Future event
      result.push({
        id: `future-${status}`,
        status,
        createdAt: undefined,
        variant: "default",
      });
    }
  }

  // Apply the special rules:
  // 1. If last event is DELIVERED, mark it as success (not pending)
  // 2. Otherwise, mark the last completed status as pending
  if (currentStatus === "delivered") {
    // Keep all as success, DELIVERED should be success not pending
    // No need to change anything
  } else {
    // Mark the current status as pending
    const currentIndex = result.findIndex((e) => e.status === currentStatus);
    if (currentIndex !== -1) {
      result[currentIndex] = {
        ...result[currentIndex],
        variant: "pending",
      };
    }
  }

  return result;
};

const getStatusIndex = (status: OrderStatus): number => {
  const index = ORDER_EVENT_ORDER.indexOf(status);
  return index === -1 ? -1 : index;
};
