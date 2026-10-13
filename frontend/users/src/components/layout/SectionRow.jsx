import { ChevronRight } from 'lucide-react';
import SkeletonCard from '../common/SkeletonCard';

/**
 * SectionRow - Generic horizontal scrollable section with title
 * Props: title, isLoading, skeletonCount, skeletonType, children
 */
export default function SectionRow({
  title,
  isLoading = false,
  skeletonCount = 6,
  skeletonType = 'square',
  onShowAll,
  children,
}) {
  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-bold text-white md:text-xl">{title}</h2>
        {onShowAll && (
          <button
            onClick={onShowAll}
            className="flex items-center gap-1 text-xs font-semibold text-[#a7a7a7] hover:text-white transition-colors duration-200 uppercase tracking-wider"
          >
            Xem tất cả
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <SkeletonCard key={i} type={skeletonType} />
            ))
          : children}
      </div>
    </section>
  );
}
