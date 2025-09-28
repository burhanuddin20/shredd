import React from 'react';
import Svg, { G, Path, Polygon } from 'react-native-svg';
import { COLORS } from './theme';

interface RankBadgeProps {
    rank: string;
    size?: number;
}

const ScoutBadge = ({ size = 32 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={COLORS.textSecondary}
            strokeWidth="8"
        />
        <Path
            d="M38 58 L64 82 L90 58"
            fill="none"
            stroke={COLORS.textSecondary}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const SoldierBadge = ({ size = 32 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={COLORS.textSecondary}
            strokeWidth="8"
        />
        <Polygon
            points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48"
            fill={COLORS.textSecondary}
        />
    </Svg>
);

const CaptainBadge = ({ size = 32 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={COLORS.textSecondary}
            strokeWidth="8"
        />
        <G fill="none" stroke={COLORS.textSecondary} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Polygon
            points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48"
            fill={COLORS.textSecondary}
        />
    </Svg>
);

const CommanderBadge = ({ size = 32 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={COLORS.textSecondary}
            strokeWidth="8"
        />
        <G fill="none" stroke={COLORS.textSecondary} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Polygon
            points="64,28 72,40 88,40 76,48 80,64 64,56 48,64 52,48 40,40 56,40"
            fill={COLORS.warning}
        />
    </Svg>
);

const TitanSlayerBadge = ({ size = 32 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={COLORS.textSecondary}
            strokeWidth="8"
        />
        <G fill="none" stroke={COLORS.textSecondary} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Path
            d="M44 40 L84 40 L80 70 L64 90 L48 70 Z"
            fill={COLORS.textSecondary}
        />
    </Svg>
);

const LegendaryWarriorBadge = ({ size = 32 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={COLORS.warning}
            strokeWidth="8"
        />
        <G fill="none" stroke={COLORS.warning} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Polygon
            points="64,28 72,40 88,40 76,48 80,64 64,56 48,64 52,48 40,40 56,40"
            fill={COLORS.warning}
        />
    </Svg>
);

export const getRankBadge = (rank: string, size = 32) => {
    switch (rank.toLowerCase()) {
        case 'scout':
            return <ScoutBadge size={size} />;
        case 'soldier':
            return <SoldierBadge size={size} />;
        case 'captain':
            return <CaptainBadge size={size} />;
        case 'commander':
            return <CommanderBadge size={size} />;
        case 'titan slayer':
            return <TitanSlayerBadge size={size} />;
        case 'legendary warrior':
            return <LegendaryWarriorBadge size={size} />;
        default:
            return <SoldierBadge size={size} />;
    }
};
