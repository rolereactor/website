const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "https://rolereactor.xyz";

export const links = {
  author: {
    name: "Role Reactor",
    url: "https://github.com/rolereactor",
  },
  contact: {
    email: "rolereactor@gmail.com",
  },
  home: WEBSITE_URL,
  support: "https://discord.gg/D8tYkU75Ry",
  github: "https://github.com/rolereactor/role-reactor-bot",
  sponsor: `${WEBSITE_URL}/sponsor`,
  buymeacoffee: "https://buymeacoffee.com/rolereactor",
  inviteBot: `https://discord.com/api/oauth2/authorize?client_id=${
    process.env.NEXT_PUBLIC_BOT_CLIENT_ID || "1392714201558159431"
  }&permissions=8&scope=bot%20applications.commands`,
};
