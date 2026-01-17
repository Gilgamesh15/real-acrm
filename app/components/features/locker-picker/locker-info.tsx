import { Clock, MapPin, Pin } from "lucide-react";

import type { InpostApiLocker } from "~/lib/types";
import { cn } from "~/lib/utils";

function LockerInfo({
  locker,
  className,
  ...props
}: {
  locker: InpostApiLocker;
} & React.ComponentProps<"div">) {
  const { opening_hours, name, address_details, image_url } = locker;
  return (
    <div className={cn("gap-2 text-left", className)} {...props}>
      <div className="pb-2">
        <h4 className="text-sm font-semibold">{opening_hours}</h4>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={image_url}
          alt={name}
          className="size-[64px] border aspect-square shrink-0"
        />
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground text-left">
            <div className="flex gap-2">
              <Pin className="size-5 p-[3px] text-chart-2 rounded-full border bg-chart-2/10 border-chart-2/50" />
              <span>{name}</span>
            </div>
            <div className="flex gap-2">
              <MapPin className="size-5 p-[3px] text-chart-4 rounded-full bg-chart-4/10 border border-chart-4/50" />
              <span>
                {address_details.street} {address_details.building_number},{" "}
                {address_details.post_code}, {address_details.city}
              </span>
            </div>
            <div className="flex gap-2">
              <Clock className="size-5 p-[3px] text-chart-3 rounded-full bg-chart-3/10 border border-chart-3/50" />
              <span>W punkcie w ciagu 1-2 dni roboczych</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export { LockerInfo };
