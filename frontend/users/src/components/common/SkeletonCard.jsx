/**
 * SkeletonCard - Skeleton loading placeholder for cards
 * Props: type ('square' | 'circle')
 */
export default function SkeletonCard({ type = 'square' }) {
  return (
    <div className="p-4 bg-[#181818] rounded-lg">
      <div
        className={`w-full aspect-square mb-4 bg-[#282828] animate-pulse ${
          type === 'circle' ? 'rounded-full' : 'rounded-md'
        }`}
      />
      <div className="space-y-2">
        <div className="h-3.5 bg-[#282828] rounded animate-pulse w-3/4" />
        <div className="h-3 bg-[#282828] rounded animate-pulse w-1/2" />
        <div className="h-3 bg-[#282828] rounded animate-pulse w-1/3" />
      </div>
    </div>
  );
}
