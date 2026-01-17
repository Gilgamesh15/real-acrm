import { LogIn, LogOut, User, Users } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";

import { authClient } from "~/lib/auth-client";
import type { UseSessionReturn } from "~/lib/types";

import type { NavItem } from "./navbar";

interface AuthDropdownProps {
  session: UseSessionReturn;
  accountItems: NavItem[];
  className?: string;
}

const AuthDropdown = ({
  session,
  accountItems,
  className,
}: AuthDropdownProps) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <User />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {session.isPending ? (
          <div className="flex flex-col gap-px">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-40" />
          </div>
        ) : session.data === null || session.data?.user.isAnonymous ? (
          <>
            <DropdownMenuItem asChild>
              <Link to={"/zaloguj-sie"}>
                <LogIn />
                Zaloguj się
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={"/zarejestruj-sie"}>
                <Users />
                Zarejestruj się
              </Link>
            </DropdownMenuItem>
          </>
        ) : session.data !== null && !session.data?.user.isAnonymous ? (
          <>
            <div className="flex h-fit p-3 flex-col items-start gap-1">
              <div className="font-medium text-sm leading-none">
                {session?.data?.user.firstName} {session?.data?.user.lastName}
              </div>
              <div className="text-xs text-muted-foreground leading-none">
                {session?.data?.user.email}
              </div>
            </div>
            <DropdownMenuSeparator />
            {accountItems
              .filter((item) => {
                if (!item.access || typeof item.access !== "function")
                  return true;
                return item.access(session.data?.user);
              })
              .map((item) => (
                <DropdownMenuItem asChild key={item.href}>
                  <Link to={item.href}>
                    {item.icon}
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                await authClient.signOut();
                navigate("/zaloguj-sie");
              }}
            >
              <LogOut />
              Wyloguj
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { AuthDropdown };
