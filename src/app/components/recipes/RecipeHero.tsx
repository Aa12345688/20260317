import { useIngredients } from "../../services/IngredientContext";

interface RecipeHeroProps {
    image: string;
    name: string;
}

export function RecipeHero({ image, name }: RecipeHeroProps) {
    return (
        <div className="relative h-64 overflow-hidden">
            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="px-2.5 py-0.5 bg-primary text-[var(--background)] text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg">
                        98% Compatible
                    </div>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                    {name}
                </h2>
            </div>
        </div>
    );
}
