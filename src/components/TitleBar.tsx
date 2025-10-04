export const TitleBar = () => {
  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50 flex items-center justify-center px-4"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        {/* Logo and App Name - Centered */}
        <div className="flex items-center gap-2 select-none">
          <img
            src="./logo_web.png"
            alt="FramePromptly"
            className="h-6 w-6"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-sm font-semibold">FramePromptly</span>
        </div>
      </div>
      {/* Spacer to push content down */}
      <div className="h-10" />
    </>
  );
};
