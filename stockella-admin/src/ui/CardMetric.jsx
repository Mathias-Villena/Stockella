export default function CardMetric({ icon, title, value, barClass="bg-[#1B59F8]" }){
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.06)] p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-xl bg-gray-100 grid place-content-center">{icon}</div>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <div className={`h-1 mt-3 rounded-full ${barClass}`}/>
    </div>
  );
}
