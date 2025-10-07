import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Interaction } from '../../types';
import { differenceInHours, addHours } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';

interface CampaignEngagementTimelineProps {
    interactions: Interaction[];
    campaignStartDate: Date;
}

const CampaignEngagementTimeline: React.FC<CampaignEngagementTimelineProps> = ({ interactions, campaignStartDate }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const strokeColor = isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(226, 232, 240, 0.8)';

    const data = useMemo(() => {
        const hours = Array.from({ length: 48 }, (_, i) => i); // 0 to 47
        const timelineData = hours.map(hour => ({
            hour: `H+${hour}`,
            Opens: 0,
            Clicks: 0,
        }));

        interactions.forEach(interaction => {
            if (interaction.openedAt) {
                const openHour = differenceInHours(new Date(interaction.openedAt), campaignStartDate);
                if (openHour >= 0 && openHour < 48) {
                    timelineData[openHour].Opens += 1;
                }
            }
            if (interaction.clickedAt) {
                const clickHour = differenceInHours(new Date(interaction.clickedAt), campaignStartDate);
                if (clickHour >= 0 && clickHour < 48) {
                    timelineData[clickHour].Clicks += 1;
                }
            }
        });

        // Accumulate counts for a smoother graph
        for (let i = 1; i < timelineData.length; i++) {
            timelineData[i].Opens += timelineData[i - 1].Opens;
            timelineData[i].Clicks += timelineData[i - 1].Clicks;
        }

        return timelineData;
    }, [interactions, campaignStartDate]);


    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                    <XAxis 
                        dataKey="hour" 
                        tick={{ fill: tickColor, fontSize: 12 }} 
                        interval={5} 
                    />
                    <YAxis tick={{ fill: tickColor, fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            border: `1px solid ${strokeColor}`,
                            borderRadius: '10px'
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Opens" stroke="rgb(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Clicks" stroke="rgb(var(--success))" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CampaignEngagementTimeline;