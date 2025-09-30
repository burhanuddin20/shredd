import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';
import { COLORS } from './theme';

// Color definitions for different rank tiers with variations
const RANK_COLORS = {
    // Bronze progression (darker to lighter)
    bronze1: '#8B4513', // Dark bronze/saddle brown
    bronze2: '#CD7F32', // Classic bronze

    // Silver progression (darker to lighter with subtle blue tint)
    silver1: '#A9A9A9', // Dark gray
    silver2: '#C0C0C0', // Classic silver
    silver3: '#D3D3D3', // Light silver

    // Gold progression (warmer to brighter)
    gold1: '#DAA520', // Goldenrod
    gold2: '#FFD700', // Classic gold
    gold3: '#FFA500', // Orange gold

    // Special colors for high ranks
    special1: '#9370DB', // Purple for Colonel
    special2: '#4169E1', // Royal Blue for Commander
    special3: '#DC143C', // Crimson for General
    special4: '#FF6347', // Tomato Red for Commander-in-Chief
    special5: '#FF4500', // Orange Red for Titan Slayer
    special6: '#8B00FF', // Electric Violet for Humanity's Hope
    special7: '#FF1493', // Deep Pink for Legendary Warrior
};

// Scout Badge with color variants and optional glow
const ScoutBadge = ({ size = 32, color = COLORS.textSecondary, showGlow = false }: { size?: number; color?: string; showGlow?: boolean }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        {showGlow && (
            <Circle cx="64" cy="64" r="56" fill="none" stroke={color} strokeWidth="2" opacity="0.2" />
        )}
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={color}
            strokeWidth="8"
        />
        <Path
            d="M38 58 L64 82 L90 58"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

// Soldier Badge with color variants and tier effects
const SoldierBadge = ({ size = 32, color = COLORS.textSecondary, tier = 1 }: { size?: number; color?: string; tier?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        {tier >= 2 && (
            <Circle cx="64" cy="64" r="56" fill="none" stroke={color} strokeWidth="2" opacity="0.2" />
        )}
        {tier >= 3 && (
            <Circle cx="64" cy="64" r="60" fill="none" stroke={color} strokeWidth="1" opacity="0.15" />
        )}
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={color}
            strokeWidth="8"
        />
        <Polygon
            points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48"
            fill={color}
        />
    </Svg>
);

// Captain Badge with color variants and tier effects
const CaptainBadge = ({ size = 32, color = RANK_COLORS.gold1, tier = 1 }: { size?: number; color?: string; tier?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        {/* Progressive glow based on tier */}
        {tier >= 1 && (
            <Circle cx="64" cy="64" r="56" fill="none" stroke={color} strokeWidth="2" opacity="0.15" />
        )}
        {tier >= 2 && (
            <>
                <Circle cx="64" cy="64" r="60" fill="none" stroke={color} strokeWidth="1" opacity="0.2" />
                <Circle cx="64" cy="64" r="52" fill="none" stroke={color} strokeWidth="2" opacity="0.25" />
            </>
        )}
        {tier >= 3 && (
            <Circle cx="64" cy="64" r="64" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
        )}
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={color}
            strokeWidth="8"
        />
        <G fill="none" stroke={color} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Polygon
            points="64,38 68,48 78,48 70,54 74,64 64,58 54,64 58,54 50,48 60,48"
            fill={color}
        />
    </Svg>
);

// Commander Badge with color variants
const CommanderBadge = ({ size = 32, color = COLORS.warning }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke={color}
            strokeWidth="8"
        />
        <G fill="none" stroke={color} strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Polygon
            points="64,28 72,40 88,40 76,48 80,64 64,56 48,64 52,48 40,40 56,40"
            fill={color}
        />
    </Svg>
);

// Titan Slayer Badge with glowing effect
const TitanSlayerBadge = ({ size = 32 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Defs>
            <LinearGradient id="titanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={RANK_COLORS.special5} stopOpacity="1" />
                <Stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        {/* Outer glow effect */}
        <Circle cx="64" cy="64" r="58" fill="none" stroke={RANK_COLORS.special5} strokeWidth="2" opacity="0.3" />
        <Circle cx="64" cy="64" r="54" fill="none" stroke={RANK_COLORS.special5} strokeWidth="2" opacity="0.5" />

        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke="url(#titanGlow)"
            strokeWidth="8"
        />
        <G fill="none" stroke="url(#titanGlow)" strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Path
            d="M44 40 L84 40 L80 70 L64 90 L48 70 Z"
            fill="url(#titanGlow)"
        />
    </Svg>
);

// Legendary Warrior Badge with animated glow effect
const LegendaryWarriorBadge = ({ size = 32 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 128 128">
        <Defs>
            <LinearGradient id="legendaryGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={RANK_COLORS.special7} stopOpacity="1" />
                <Stop offset="50%" stopColor={RANK_COLORS.special6} stopOpacity="1" />
                <Stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
            </LinearGradient>
        </Defs>
        {/* Multiple glow layers for dramatic effect */}
        <Circle cx="64" cy="64" r="60" fill="none" stroke={RANK_COLORS.special7} strokeWidth="1" opacity="0.2" />
        <Circle cx="64" cy="64" r="58" fill="none" stroke={RANK_COLORS.special6} strokeWidth="2" opacity="0.3" />
        <Circle cx="64" cy="64" r="54" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.5" />

        <Path
            d="M64 10 L108 26 V62 C108 90 88 108 64 118 C40 108 20 90 20 62 V26 Z"
            fill="none"
            stroke="url(#legendaryGlow)"
            strokeWidth="8"
        />
        <G fill="none" stroke="url(#legendaryGlow)" strokeWidth="6">
            <Path d="M40 76 C40 60, 54 52, 64 52 C74 52, 88 60, 88 76" />
            <Path d="M48 80 C48 68, 56 64, 64 64 C72 64, 80 68, 80 80" />
        </G>
        <Polygon
            points="64,28 72,40 88,40 76,48 80,64 64,56 48,64 52,48 40,40 56,40"
            fill="url(#legendaryGlow)"
        />
        {/* Additional decorative stars */}
        <Polygon points="30,30 32,34 36,34 33,37 34,41 30,38 26,41 27,37 24,34 28,34" fill="#FFD700" opacity="0.6" />
        <Polygon points="98,30 100,34 104,34 101,37 102,41 98,38 94,41 95,37 92,34 96,34" fill="#FFD700" opacity="0.6" />
    </Svg>
);

export const getRankBadge = (rank: string, size = 32) => {
    switch (rank.toLowerCase()) {
        // Early ranks - Scout badge with progression
        case 'cadet':
            return <ScoutBadge size={size} color={RANK_COLORS.bronze1} showGlow={false} />;
        case 'trainee':
            return <ScoutBadge size={size} color={RANK_COLORS.bronze2} showGlow={true} />;

        // Mid-low ranks - Soldier badge with progression
        case 'soldier':
            return <SoldierBadge size={size} color={RANK_COLORS.silver1} tier={1} />;
        case 'corporal':
            return <SoldierBadge size={size} color={RANK_COLORS.silver2} tier={2} />;
        case 'sergeant':
            return <SoldierBadge size={size} color={RANK_COLORS.silver3} tier={3} />;

        // Mid-high ranks - Captain badge with progressive glow
        case 'lieutenant':
            return <CaptainBadge size={size} color={RANK_COLORS.gold1} tier={1} />;
        case 'captain':
            return <CaptainBadge size={size} color={RANK_COLORS.gold2} tier={2} />;
        case 'major':
            return <CaptainBadge size={size} color={RANK_COLORS.gold3} tier={3} />;

        // High ranks - Commander badge with special colors
        case 'colonel':
            return <CommanderBadge size={size} color={RANK_COLORS.special1} />;
        case 'commander':
            return <CommanderBadge size={size} color={RANK_COLORS.special2} />;
        case 'general':
            return <CommanderBadge size={size} color={RANK_COLORS.special3} />;
        case 'commander-in-chief':
            return <CommanderBadge size={size} color={RANK_COLORS.special4} />;

        // Elite rank - Titan Slayer with glowing effect
        case 'titan slayer':
            return <TitanSlayerBadge size={size} />;

        // Legendary ranks - with maximum effects
        case "humanity's hope":
        case 'legendary warrior':
            return <LegendaryWarriorBadge size={size} />;

        // Default fallback
        default:
            return <ScoutBadge size={size} color={RANK_COLORS.bronze1} showGlow={false} />;
    }
};
