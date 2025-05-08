// src/components/JsonLdSchema.jsx
// JSON-LD Schema for structured data to improve SEO

"use client";

import { useEffect } from "react";

export default function JsonLdSchema() {
  useEffect(() => {
    // Add JSON-LD schema to the document head
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "TeamWorks",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Efficient team work tracking and task management solution. Organize, track, and manage your team's tasks with our intuitive Kanban board system.",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "125"
      },
      "featureList": "Task Management, Team Collaboration, Kanban Board, Tag Filtering, Data Import/Export",
      "keywords": "team work tracking, task management, kanban board, team collaboration, project management"
    });
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  return null;
}
