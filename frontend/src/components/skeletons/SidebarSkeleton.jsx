import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside
      className="h-full w-16 lg:w-72 flex flex-col transition-all duration-200"
      style={{ background: "#1e293b", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header */}
      <div
        className="p-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: "#6366f1" }} />
          <span
            className="font-medium hidden lg:block text-sm"
            style={{ color: "#e2e8f0" }}
          >
            Messages
          </span>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-2 px-2 space-y-1">
        {skeletonContacts.map((_, idx) => (
          <div
            key={idx}
            className="w-full p-2.5 flex items-center gap-3 rounded-xl animate-pulse"
          >
            {/* Avatar skeleton */}
            <div
              className="w-10 h-10 rounded-full shrink-0"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            {/* Info skeleton */}
            <div className="hidden lg:block flex-1 min-w-0 space-y-2">
              <div
                className="h-3 rounded w-28"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div
                className="h-2.5 rounded w-14"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;