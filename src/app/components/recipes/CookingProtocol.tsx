interface Step {
    title: string;
    description: string;
}

interface CookingProtocolProps {
    steps: Step[];
}

export function CookingProtocol({ steps }: CookingProtocolProps) {
    return (
        <div className="mb-6 px-2">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#00ff88]" />
                烹飪執行協議
            </h3>
            <div className="space-y-6">
                {steps.map((step, index) => (
                    <div key={index} className="relative pl-8">
                        <div className="absolute left-0 top-0 w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00ff88] text-[8px] font-black">
                            {index + 1}
                        </div>
                        {index < steps.length - 1 && (
                            <div className="absolute left-2.5 top-6 bottom-[-24px] w-[1px] bg-gradient-to-b from-[#00ff88]/20 to-transparent" />
                        )}
                        <h4 className="font-black text-[10px] text-white uppercase tracking-widest mb-1">{step.title}</h4>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-tighter">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
