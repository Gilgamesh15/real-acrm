import { LogInIcon, LogOut, UsersIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";

import { authClient } from "~/lib/auth-client";
import type { UseSessionReturn } from "~/lib/types";

interface MobileSidebarUserMenuProps {
  session: UseSessionReturn;
  onNavigate: (href: string) => void;
}

const MobileSidebarUserMenu = ({
  session,
  onNavigate,
}: MobileSidebarUserMenuProps) => {
  const handleSignOut = () => {
    authClient.signOut();
    onNavigate("/zaloguj-sie");
  };

  const isPending = session.isPending;
  const isLoggedIn =
    session.data !== null && !isPending && !session.data?.user.isAnonymous;

  return (
    <div className="flex flex-col gap-2">
      {isLoggedIn ? (
        <div className="flex flex-col gap-2 font-secondary">
          <Button
            onClick={() => onNavigate("/konto")}
            variant="outline"
            className="flex h-fit p-3 flex-col items-start"
          >
            <div className="font-medium text-sm leading-none">
              {session?.data?.user.firstName} {session?.data?.user.lastName}
            </div>
            <div className="text-xs text-muted-foreground leading-none">
              {session?.data?.user.email}
            </div>
          </Button>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="justify-start"
          >
            <LogOut />
            Wyloguj
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            disabled={isPending}
            onClick={() => onNavigate("/zaloguj-sie")}
            variant="outline"
            className="justify-start"
          >
            <LogInIcon />
            Zaloguj się
            {isPending && <Spinner className="ml-auto" />}
          </Button>
          <Button
            disabled={isPending}
            onClick={() => onNavigate("/zarejestruj-sie")}
            variant="outline"
            className="justify-start"
          >
            <UsersIcon />
            Utwórz konto
            {isPending && <Spinner className="ml-auto" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export { MobileSidebarUserMenu };
