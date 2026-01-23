import React from "react";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export function useStructuredData(data: Json | undefined, id: string) {
  React.useEffect(() => {
    if (!data) return;

    // Remove any existing script with this ID first
    const existingScript = document.getElementById(id);
    if (existingScript) {
      document.head.removeChild(existingScript);
    }

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [data, id]);
}
