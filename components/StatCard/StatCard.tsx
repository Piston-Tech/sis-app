import cn from "@/utils/cn";
import Card from "../Card";

const StatCard = ({ label, value, icon: Icon, trend }: { label: string, value: string | number, icon: any, trend?: string }) => (
  <Card className="flex-1">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <h3 className="text-2xl font-bold mt-1 text-zinc-900">{value}</h3>
        {trend && (
          <p className={cn("text-xs mt-2 font-medium", trend.startsWith('+') ? "text-emerald-600" : "text-rose-600")}>
            {trend} <span className="text-zinc-400 font-normal ml-1">vs last month</span>
          </p>
        )}
      </div>
      <div className="p-3 bg-zinc-50 rounded-xl text-zinc-600">
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

export default StatCard;