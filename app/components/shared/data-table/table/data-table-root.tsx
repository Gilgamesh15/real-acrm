import type { PropsWithChildren } from "react";

const DataTableRoot = ({ children }: PropsWithChildren) => {
  return <div className="w-full flex flex-col gap-6">{children}</div>;
};
export { DataTableRoot };
