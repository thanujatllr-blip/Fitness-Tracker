// src/components/dashboard/SmartScaleCard.tsx - Smart scale widget

import { useState } from 'react';
import { Scale, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dashboardService from '@/services/dashboard.service';
import type { SmartScaleReading } from '@/types';

interface SmartScaleCardProps {
    initialReading: SmartScaleReading | null;
    onUpdate?: () => void;
}

export default function SmartScaleCard({ initialReading, onUpdate }: SmartScaleCardProps) {
    const [reading, setReading] = useState(initialReading);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulate = async () => {
        setIsSimulating(true);
        try {
            const newReading = await dashboardService.simulateSmartScale();
            setReading(newReading);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to simulate scale:', error);
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Scale className="w-5 h-5" />
                    Smart Scale
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <div className="text-5xl font-bold text-primary">
                        {reading?.weightKg?.toFixed(1) || '--'}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">kg</div>
                    {reading?.readingTimestamp && (
                        <div className="text-xs text-muted-foreground mt-2">
                            Last updated: {new Date(reading.readingTimestamp).toLocaleString()}
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className="w-full"
                    variant="outline"
                >
                    {isSimulating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Simulating...
                        </>
                    ) : (
                        'Start Simulation'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}