"use client";
import Button from "@material-tailwind/react/components/Button";
import { Navbar } from "@material-tailwind/react/components/Navbar";
import { Typography } from "@material-tailwind/react/components/Typography";
import { signOut, useSession } from "next-auth/react";
import React from "react";

export default function NavbarComponent() {
  const { data: session } = useSession();
  const email = session?.user?.email;
  return (
    <div>
      <Navbar className="mx-auto max-w-screen-xl py-3" placeholder={undefined}>
        <div className="flex items-center justify-between text-blue-gray-900">
          <Typography
            as="a"
            href="#"
            variant="h6"
            className="mt-2 cursor-pointer py-1.5"
            placeholder={undefined}
          >
            Paperless Alcucoa Accreditation System
          </Typography>
          <div className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
            <p className="ml-16">{email}</p>
            <Button
              placeholder={undefined}
              className="flex justify-center bg-green-900 ml-2"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </div>
        </div>
      </Navbar>
    </div>
  );
}
