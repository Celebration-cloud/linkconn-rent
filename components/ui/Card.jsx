import React from "react";
import { Card as HeroCard, CardBody } from "@heroui/react";
import clsx from "clsx";

export default function Card({ children, title, footer, className = "" }) {
  return (
    <HeroCard className={clsx("rounded-2xl shadow-sm border", className)}>
      <CardBody>
        {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
        <div>{children}</div>
        {footer && <div className="mt-4">{footer}</div>}
      </CardBody>
    </HeroCard>
  );
}
