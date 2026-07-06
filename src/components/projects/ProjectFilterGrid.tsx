"use client";

import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import {
  getCategoryLabel,
  getProjectTitle,
  toLanguageUppercase,
  translations,
  type Language,
} from "@/lib/i18n";

type FilterProject = {
  id: string;
  title: string;
  titleTr: string | null;
  titleEn: string | null;
  slug: string;
  location: string | null;
  year: number | null;
  featured: boolean;
  images: {
    url: string;
    thumbnailUrl: string | null;
    webUrl: string | null;
    originalUrl: string | null;
  }[];
  categories: { category: CategoryFilterOption }[];
};

type CategoryFilterOption = {
  id: string;
  name: string;
  nameTr: string | null;
  nameEn: string | null;
};

type ProjectFilterGridProps = {
  projects: FilterProject[];
  categories: CategoryFilterOption[];
  language: Language;
};

export function ProjectFilterGrid({ projects, categories: categoryOptions, language }: ProjectFilterGridProps) {
  const t = translations[language];
  const filterLabel = language === "tr" ? "Projeleri filtrele" : "Filter projects";
  const categories = [
    { key: "All", label: t.common.all },
    ...categoryOptions.map((category) => ({
      key: category.id,
      label: getCategoryLabel(category, language),
    })),
  ];

  const [activeCategory, setActiveCategory] = useState("All");
  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.categories.some(({ category }) => category.id === activeCategory));

  return (
    <>
      <div className="mt-20 border-b border-stone pb-8 md:mt-24 md:hidden">
        <label className="block text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-warm-gray">
          {toLanguageUppercase(filterLabel, language)}
        </label>
        <div className="relative mt-4">
          <select
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value)}
            aria-label={filterLabel}
            className="w-full appearance-none truncate rounded-none border border-stone/70 bg-cream px-4 py-4 pr-12 text-xs font-semibold uppercase tracking-[0.22em] text-charcoal outline-none transition-colors focus:border-accent"
          >
            {categories.map((category) => (
              <option key={category.key} value={category.key}>
                {toLanguageUppercase(category.label, language)}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-2 rotate-45 border-b border-r border-accent"
          />
        </div>
      </div>

      <div className="mt-24 hidden flex-wrap gap-6 border-b border-stone pb-11 md:flex">
        {categories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setActiveCategory(category.key)}
            className={`text-[0.68rem] font-semibold uppercase tracking-[0.36em] transition-colors ${
              activeCategory === category.key ? "text-accent" : "text-warm-gray hover:text-charcoal"
            }`}
          >
            {toLanguageUppercase(category.label, language)}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <p className="mt-12 text-warm-gray">{t.common.noProjects}</p>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              title={getProjectTitle(project, language)}
              slug={project.slug}
              location={project.location}
              year={project.year}
              categories={getCategoryNames(project, language)}
              language={language}
              imageUrl={
                project.images[0]?.thumbnailUrl ??
                project.images[0]?.webUrl ??
                project.images[0]?.url ??
                undefined
              }
              imageSources={project.images[0] ? [
                project.images[0].webUrl,
                project.images[0].url,
                project.images[0].originalUrl,
              ] : []}
              featured={project.featured}
              index={index}
            />
          ))}
        </div>
      )}
    </>
  );
}

function getCategoryNames(project: FilterProject, language: Language) {
  if (project.categories.length > 0) {
    return project.categories.map(({ category }) => getCategoryLabel(category, language));
  }

  return [];
}
