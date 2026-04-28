const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "#0f172a" }}>
      {skeletonMessages.map((_, idx) => {
        const isRight = idx % 2 !== 0;
        return (
          <div
            key={idx}
            className={`flex items-end gap-2 animate-pulse ${isRight ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full shrink-0"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            {/* Bubble */}
            <div
              className={`flex flex-col gap-1 max-w-[60%] ${isRight ? "items-end" : "items-start"}`}
            >
              <div
                className="h-2 w-12 rounded"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
              <div
                className="rounded-2xl"
                style={{
                  background: isRight
                    ? "rgba(99,102,241,0.12)"
                    : "rgba(255,255,255,0.04)",
                  border: isRight ? "none" : "1px solid rgba(255,255,255,0.06)",
                  width: `${100 + Math.random() * 120}px`,
                  height: "40px",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;