export default function CardMetric({ icon: Icon, title, value, iconClass="bg-blue-50 text-blue-600", barClass="bg-blue-500" }){
  // Determine dynamic glow class
  let glowClass = "glow-blue";
  if (barClass.includes("emerald") || barClass.includes("green") || barClass.includes("success")) {
    glowClass = "glow-emerald";
  } else if (barClass.includes("amber") || barClass.includes("yellow") || barClass.includes("warning")) {
    glowClass = "glow-amber";
  } else if (barClass.includes("rose") || barClass.includes("red") || barClass.includes("danger")) {
    glowClass = "glow-rose";
  }

  return (
    <div className={`bg-white rounded-2xl p-5 border-y border-r border-slate-100/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${glowClass}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${iconClass}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-4">{value}</p>
      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: '100%' }} />
      </div>
    </div>
  );
}
