"use client";

import { useState, useEffect } from "react";

export default function SectionNav({ sections }) {
  const [activeSection, setActiveSection] = useState(sections[0]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;

      sections.forEach((section) => {
        const el = document.getElementById(section);

        if (el) {
          const { offsetTop, offsetHeight } = el;

          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollTo = (section) => {
    const el = document.getElementById(section);

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(section);
    }
  };

  return (
    <div className="mt-8 px-4 sm:px-6 sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-black/70 border-b border-gray-200 dark:border-white/10">
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section}
            className={`whitespace-nowrap pb-2 px-1 border-b-2 transition-colors duration-200 ${
              activeSection === section
                ? "border-yellow-700 text-blue-900 dark:text-yellow-600"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-gray-100"
            }`}
            onClick={() => scrollTo(section)}
          >
            {section}
          </button>
        ))}
      </div>
    </div>
  );
}
