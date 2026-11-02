"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { CMSPortfolioModal } from "@/components/cms/cms-portfolio-modal";
import type { ProjectDetailItem } from "@/lib/portfolio-data";

interface PortfolioDetailEditButtonProps {
  project: ProjectDetailItem;
}

export function PortfolioDetailEditButton({ project }: PortfolioDetailEditButtonProps) {
  const searchParams = useSearchParams();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const isEditQuery = searchParams.get("cms_edit") === "true";
    const hasAdminCookie = typeof document !== "undefined" && document.cookie.includes("glessios_admin_session");
    if (isEditQuery && hasAdminCookie) {
      setIsAdminMode(true);
    }
  }, [searchParams]);

  if (!isAdminMode) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom duration-300">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FF650F] hover:bg-[#e05508] text-white font-bold shadow-2xl flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 hover:scale-105 transition-all text-sm"
        >
          <Edit3 className="w-4 h-4" />
          Editar Este Projeto (CMS On-Page)
        </Button>
      </div>

      <CMSPortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialProject={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          subtitle: project.subtitle,
          category: project.category,
          clientName: project.clientName,
          clientSegment: project.clientSegment,
          location: project.location,
          year: project.year,
          executionTime: project.executionTime,
          dimensions: project.dimensions,
          warranty: project.warranty,
          description: project.description,
          challenge: project.challenge,
          solution: project.solution,
          results: project.results,
          materials: project.materials,
          technicalSpecs: project.technicalSpecs,
          testimonial: project.testimonial,
          featuredImage: project.featuredImage,
          coverImage: project.coverImage,
          galleryImages: project.galleryImages,
          videos: project.videos,
          tags: project.tags,
        }}
        onSaved={() => {
          setIsModalOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}
