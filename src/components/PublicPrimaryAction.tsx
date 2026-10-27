import type { MouseEventHandler, ReactNode } from "react";

type LinkAction = {
  children: ReactNode;
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type ButtonAction = {
  children: ReactNode;
  href?: never;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

export function PublicPrimaryAction(props: LinkAction | ButtonAction) {
  if (typeof props.href === "string") {
    return <a className="public-primary-action" href={props.href} onClick={props.onClick}>{props.children}</a>;
  }

  return <button className="public-primary-action" type="button" onClick={props.onClick} disabled={props.disabled}>{props.children}</button>;
}
