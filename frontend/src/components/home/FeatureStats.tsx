import { CheckCircle2, Zap, Database, FileText } from "lucide-react";

export function FeatureStats() {
  const features = [
    { icon: <Zap className="w-5 h-5" />, text: "Under 10s processing" },
    { icon: <CheckCircle2 className="w-5 h-5" />, text: "95%+ accuracy" },
    { icon: <Database className="w-5 h-5" />, text: "SAP integration ready" },
    { icon: <FileText className="w-5 h-5" />, text: "Supports PDF & scans" },
  ];

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-12 pt-8 border-t border-slate-200/50">
      {features.map((feature, idx) => (
        <div key={idx} className="flex items-center gap-2 text-slate-600">
          <div className="text-emerald-500">{feature.icon}</div>
          <span className="font-medium text-sm md:text-base">{feature.text}</span>
        </div>
      ))}
    </div>
  );
}
