function StatsGrid({ children }) {
  return (
    <div
      className="
        grid
        gap-6
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {children}
    </div>
  );
}

export default StatsGrid;