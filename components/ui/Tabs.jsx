"use client";
import { Tabs, Tab } from "@heroui/react";

export const AppTabs = ({ tabs, onChange, ...props }) => (
  <Tabs aria-label="App Tabs" onSelectionChange={onChange} {...props}>
    {tabs.map((t) => (
      <Tab key={t.key} title={t.title}>
        {t.content}
      </Tab>
    ))}
  </Tabs>
);
