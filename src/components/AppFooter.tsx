import React from 'react';

export const AppFooter: React.FC = () => (
  <footer className="hidden md:flex h-10 px-4 md:px-6 items-center justify-between border-t border-slate-900 bg-slate-950 text-xs text-slate-500 shrink-0 select-none">
    <span>
      Created by{' '}
      <a
        href="https://hustlailab.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-400 font-medium hover:text-slate-200 transition-colors"
      >
        HustlAI Lab
      </a>
    </span>
    <div className="flex items-center gap-3">
      <a
        href="https://www.producthunt.com/products/slidemd?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-slidemd"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center opacity-80 hover:opacity-100 transition-opacity"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1299747&theme=dark&t=1793468120533"
          alt="SlideMD - Turn AI-generated Markdown into slide decks, free | Product Hunt"
          width={250}
          height={54}
          className="h-8 w-auto"
        />
      </a>
      <a
        href="https://viberank.dev/apps/SlideMD"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center opacity-80 hover:opacity-100 transition-opacity"
      >
        <img
          src="https://viberank.dev/badge?app=SlideMD&theme=dark"
          alt="SlideMD on VibeRank"
          className="h-8 w-auto"
        />
      </a>
    </div>
  </footer>
);
