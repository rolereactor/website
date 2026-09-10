import { type LinkItemType } from "fumadocs-ui/layouts/docs";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import Image from "next/image";
import { BsGithub } from "react-icons/bs";
import { FaDiscord } from "react-icons/fa";

import { links } from "@/constants/links";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";

export const linkItems: LinkItemType[] = [];

export const baseOptions: BaseLayoutProps = {
  nav: {
    transparentMode: "always",
    title: (
      <>
        <Image
          src="/logo.png"
          width={28}
          height={28}
          alt="Role Reactor Logo"
          className="inline-block"
          priority
        />
        Role Reactor
      </>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  links: [
    {
      type: "custom",
      secondary: true,
      children: (
        <div className="flex items-center ml-3 gap-3">
          <NotificationBell />
          <UserMenu />
        </div>
      ),
    },
  ],
};

// Docs layout options without login button
export const docsOptions: BaseLayoutProps = {
  ...baseOptions,
  links: [
    {
      type: "icon",
      text: "GitHub Repository",
      url: links.github,
      external: true,
      icon: <BsGithub className="w-5 h-5" />,
    },
    {
      type: "icon",
      text: "Discord Server",
      url: links.support,
      external: true,
      secondary: true,
      icon: <FaDiscord className="w-5 h-5" />,
    },
  ],
};
