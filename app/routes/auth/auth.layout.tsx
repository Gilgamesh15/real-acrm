import { Outlet } from "react-router";

import { Logo } from "~/components/features/logo/logo";

import HeroImage from "/hero.jpg";

export default function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 divide-x">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <Outlet />
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={HeroImage}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
