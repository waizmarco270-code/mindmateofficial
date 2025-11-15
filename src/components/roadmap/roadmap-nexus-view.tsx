

'use client';

import { Roadmap, RoadmapMilestone, RoadmapCategory, RoadmapTask } from '@/hooks/use-roadmaps';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Check, Circle } from 'lucide-react';

interface RoadmapNexusViewProps {
    roadmap: Roadmap;
}

const MilestoneNode = ({ milestone, layout, onClick }: { milestone: RoadmapMilestone; layout: { x: number; y: number; }; onClick: () => void; }) => {
    const allTasks = milestone.categories.flatMap(c => c.tasks);
    const completedTasks = allTasks.filter(t => t.completed).length;
    const isMilestoneComplete = allTasks.length > 0 && completedTasks === allTasks.length;

    return (
        <motion.div
            className="absolute cursor-pointer group"
            style={{ x: layout.x, y: layout.y, transform: 'translate(-50%, -50%)' }}
            whileHover={{ scale: 1.1, zIndex: 20 }}
            onClick={onClick}
        >
            <div className={cn(
                "h-20 w-20 rounded-full flex items-center justify-center text-center p-2 text-white font-bold text-xs shadow-lg transition-all duration-300",
                isMilestoneComplete ? "bg-green-500 border-4 border-green-300" : "bg-primary border-4 border-primary/50"
            )}>
                <span className="truncate">Day {milestone.day}</span>
            </div>
            <div className="absolute -top-2 -right-2 text-white rounded-full bg-slate-800 p-1 text-xs font-bold">
                 {isMilestoneComplete ? <Check className="h-4 w-4 text-green-400" /> : `${completedTasks}/${allTasks.length}`}
            </div>
        </motion.div>
    );
};

const CategoryNode = ({ category, layout, onClick }: { category: RoadmapCategory; layout: { x: number; y: number; }; onClick: () => void; }) => {
     const allTasks = category.tasks;
    const completedTasks = allTasks.filter(t => t.completed).length;
    const isCategoryComplete = allTasks.length > 0 && completedTasks === allTasks.length;

    return (
        <motion.div
            className="absolute cursor-pointer group"
            style={{ x: layout.x, y: layout.y, transform: 'translate(-50%, -50%)' }}
            whileHover={{ scale: 1.2, zIndex: 30 }}
            onClick={onClick}
        >
             <div className="h-10 w-10 rounded-full flex items-center justify-center text-center p-1" style={{ backgroundColor: category.color }}>
                {isCategoryComplete && <Check className="h-6 w-6 text-white"/>}
             </div>
        </motion.div>
    );
};

export function RoadmapNexusView({ roadmap }: RoadmapNexusViewProps) {
    const [selectedMilestone, setSelectedMilestone] = useState<RoadmapMilestone | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<RoadmapCategory | null>(null);

    const layout = useMemo(() => {
        const center = { x: 400, y: 300 };
        const radius = 250;
        const milestones = roadmap.milestones;

        const milestoneLayouts = milestones.map((m, i) => {
            const angle = (i / milestones.length) * 2 * Math.PI;
            return {
                milestone: m,
                position: {
                    x: center.x + radius * Math.cos(angle),
                    y: center.y + radius * Math.sin(angle),
                }
            };
        });

        const categoryLayouts: { milestone: RoadmapMilestone; category: RoadmapCategory; position: { x: number; y: number; } }[] = [];
        milestoneLayouts.forEach(({ milestone, position }) => {
            const categoryRadius = 80;
            milestone.categories.forEach((cat, i) => {
                const angle = (i / milestone.categories.length) * 2 * Math.PI;
                categoryLayouts.push({
                    milestone,
                    category: cat,
                    position: {
                        x: position.x + categoryRadius * Math.cos(angle),
                        y: position.y + categoryRadius * Math.sin(angle),
                    }
                });
            });
        });

        return { center, milestoneLayouts, categoryLayouts };
    }, [roadmap]);
    
    const handleNodeClick = (milestone: RoadmapMilestone, category?: RoadmapCategory) => {
        setSelectedMilestone(milestone);
        setSelectedCategory(category || null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative h-[600px] bg-slate-900/50 rounded-xl overflow-hidden border">
                 <div className="absolute inset-0 bg-grid-slate-800/50"></div>
                 <svg className="absolute inset-0 h-full w-full" width="800" height="600">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary) / 0.2)" />
                        </marker>
                    </defs>
                    {/* Lines from center to milestones */}
                     {layout.milestoneLayouts.map((m, i) => (
                        <motion.line
                            key={`line-center-${m.milestone.day}`}
                            x1={layout.center.x} y1={layout.center.y}
                            x2={m.position.x} y2={m.position.y}
                            stroke="hsl(var(--primary) / 0.2)"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                        />
                    ))}
                    {/* Lines from milestones to categories */}
                     {layout.categoryLayouts.map((catLayout, i) => {
                        const milestonePos = layout.milestoneLayouts.find(m => m.milestone.day === catLayout.milestone.day)?.position;
                        if(!milestonePos) return null;
                         return (
                            <motion.line
                                key={`line-milestone-${catLayout.category.id}`}
                                x1={milestonePos.x} y1={milestonePos.y}
                                x2={catLayout.position.x} y2={catLayout.position.y}
                                stroke={catLayout.category.color}
                                strokeWidth="1.5"
                                opacity={0.5}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                             />
                        );
                    })}
                </svg>

                {/* Central Node */}
                <motion.div
                    className="absolute h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center text-center text-xs font-bold text-slate-300"
                    style={{ x: layout.center.x, y: layout.center.y, transform: 'translate(-50%, -50%)' }}
                >
                    {roadmap.name}
                </motion.div>
                
                {/* Milestone Nodes */}
                {layout.milestoneLayouts.map(({ milestone, position }) => (
                    <MilestoneNode key={milestone.day} milestone={milestone} layout={position} onClick={() => handleNodeClick(milestone)} />
                ))}

                {/* Category Nodes */}
                {layout.categoryLayouts.map(({ milestone, category, position }) => (
                     <CategoryNode key={category.id} category={category} layout={position} onClick={() => handleNodeClick(milestone, category)} />
                ))}

            </div>
             <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Click a node to see its details.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[480px] overflow-y-auto">
                        {!selectedMilestone ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                                <p>Select a milestone or category node to view its tasks.</p>
                            </div>
                        ) : (
                             <div className="space-y-4">
                                <h3 className="font-bold text-lg">Day {selectedMilestone.day}</h3>
                                {selectedCategory ? (
                                    <div className="space-y-3">
                                         <h4 className="font-semibold" style={{color: selectedCategory.color}}>{selectedCategory.title}</h4>
                                         <ul className="space-y-2">
                                            {selectedCategory.tasks.map(task => (
                                                <li key={task.id} className={cn("flex items-center gap-2 text-sm", task.completed && "text-muted-foreground line-through")}>
                                                    {task.completed ? <Check className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                                                    {task.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedMilestone.categories.map(cat => (
                                            <div key={cat.id} className="p-3 border rounded-lg" style={{borderColor: cat.color}}>
                                                <h4 className="font-semibold" style={{color: cat.color}}>{cat.title}</h4>
                                                <ul className="mt-2 space-y-2">
                                                    {cat.tasks.map(task => (
                                                        <li key={task.id} className={cn("flex items-center gap-2 text-sm", task.completed && "text-muted-foreground line-through")}>
                                                            {task.completed ? <Check className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                                                            {task.text}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
