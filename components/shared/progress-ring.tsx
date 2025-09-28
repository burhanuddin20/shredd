import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS, SIZES } from './theme';

interface ProgressRingProps {
    progress: number;
    timeRemaining: number;
    planName?: string;
    size?: number;
    strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    timeRemaining,
    planName,
    size = SIZES.circle,
    strokeWidth = SIZES.stroke,
}) => {
    const circumference = 2 * Math.PI * (size / 2 - strokeWidth / 2);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - strokeWidth / 2}
                    stroke={COLORS.progressTrack}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - strokeWidth / 2}
                    stroke={COLORS.progressFill}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

            <View style={styles.textContainer}>
                <Text style={styles.timerText}>
                    {timeRemaining > 0 ? formatTime(timeRemaining) : '00:00:00'}
                </Text>
                {planName && <Text style={styles.planText}>{planName}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 48,
        fontFamily: FONTS.heading,
        lineHeight: 66,
        color: COLORS.textPrimary,
        letterSpacing: 1,
        fontWeight: '500',
    },
    planText: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.1,
        marginTop: 12,
    },
});
