const SpecialText = ({ children }: { children: string | number }) => {
  const colors = {
    color: "text-[#00CED1]",
    layer1: "text-[#00CED1]", // Dark turquoise
    layer2: "text-[#FF1493]", // Deep pink
    layer3: "text-[#9400D3]", // Dark violet
  };

  return (
    <div className="relative font-tertiary">
      <div
        className="tracking-wider scale-x-[1.55] scale-y-125 font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-9xl relative z-10 text-white"
        style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
      >
        {children}
      </div>
      <div
        className={`tracking-wider scale-x-[1.55] scale-y-125 font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-9xl absolute inset-0 -translate-x-2 opacity-90`}
        style={{ color: colors.layer1.replace("text-[", "").replace("]", "") }}
      >
        {children}
      </div>
      <div
        className={`tracking-wider scale-x-[1.55] scale-y-125 font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-9xl absolute inset-0 translate-x-1 opacity-90`}
        style={{ color: colors.layer2.replace("text-[", "").replace("]", "") }}
      >
        {children}
      </div>
      <div
        className={`tracking-wider scale-x-[1.55] scale-y-125 font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-9xl absolute inset-0 translate-x-2 opacity-90`}
        style={{ color: colors.layer3.replace("text-[", "").replace("]", "") }}
      >
        {children}
      </div>
    </div>
  );
};

export { SpecialText };
