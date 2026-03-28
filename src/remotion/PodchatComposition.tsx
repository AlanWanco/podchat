import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import type { PodchatExportInput, SpeakerConfig, SubtitleContentItem } from './types';

const rgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized.padEnd(6, '0').slice(0, 6);
  const parsed = Number.parseInt(value, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatBubbleShadow = (shadowSize: number) => {
  if (shadowSize <= 0) {
    return 'none';
  }

  return `0 ${Math.round(shadowSize * 0.35)}px ${shadowSize}px rgba(15, 23, 42, 0.24)`;
};

const formatTimestamp = (seconds: number) => {
  const total = Math.max(0, seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = Math.floor(total % 60);
  const centiseconds = Math.floor((total % 1) * 100);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};

const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return t === 0 ? 0 : t === 1 ? 1 : c3 * t * t * t - c1 * t * t;
};

const getBubbleAnimationStyle = (progress: number, side: SpeakerConfig['side']) => {
  const eased = easeOutBack(clamp(progress, 0, 1));
  const translateX = side === 'left' ? -18 * (1 - eased) : side === 'right' ? 18 * (1 - eased) : 0;
  const translateY = 22 * (1 - eased);
  const scale = 0.92 + 0.08 * eased;
  return `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
};

const AnnotationBubble: React.FC<{
  item: SubtitleContentItem;
  speaker: SpeakerConfig;
  bubbleScale: number;
  effectiveScale: number;
}> = ({ item, speaker, bubbleScale, effectiveScale }) => {
  const shadowSize = (speaker.style?.shadowSize ?? 7) * effectiveScale;
  return (
    <div
      style={{
        alignSelf: 'center',
        maxWidth: `${(speaker.style?.maxWidth ?? 720) * effectiveScale}px`,
        borderRadius: `${speaker.style?.borderRadius ?? 999}px`,
        backgroundColor: rgba(speaker.style?.bgColor || '#111827', speaker.style?.opacity ?? 0.9),
        color: speaker.style?.textColor || '#ffffff',
        padding: `${(speaker.style?.paddingY ?? 10) * effectiveScale}px ${(speaker.style?.paddingX ?? 18) * effectiveScale}px`,
        fontFamily: speaker.style?.fontFamily || 'system-ui',
        fontSize: `${(speaker.style?.fontSize ?? 24) * bubbleScale * effectiveScale}px`,
        fontWeight: speaker.style?.fontWeight || 'normal',
        lineHeight: 1.35,
        textAlign: 'center',
        boxShadow: formatBubbleShadow(shadowSize),
        whiteSpace: 'pre-wrap',
      }}
    >
      {item.text}
    </div>
  );
};

export const PodchatComposition: React.FC<PodchatExportInput> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const currentTime = props.exportRange.start + frame / fps;
  const bubbleScale = props.chatLayout?.bubbleScale ?? 1.5;
  const avatarSize = props.chatLayout?.avatarSize ?? 80;
  const speakerNameSize = props.chatLayout?.speakerNameSize ?? 22;
  const animationDuration = props.chatLayout?.animationDuration ?? 0.25;
  const layoutScale = width / (props.dimensions.width || width);
  const effectiveScale = Math.max(0.35, layoutScale);
  const horizontalPadding = (props.chatLayout?.paddingLeft ?? props.chatLayout?.paddingX ?? 48) * effectiveScale;
  const topPadding = (props.chatLayout?.paddingTop ?? 48) * effectiveScale;
  const bottomPadding = (props.chatLayout?.paddingBottom ?? 80) * effectiveScale;

  const visibleItems = props.content.filter((item) => {
    const speaker = props.speakers[item.speaker];
    if (!speaker) {
      return false;
    }

    if (speaker.type === 'annotation') {
      return currentTime >= item.start && currentTime <= item.end;
    }

    const appearanceTime = Math.max(0, item.start - animationDuration);
    return currentTime >= appearanceTime;
  });

  const visibleMessages = visibleItems.filter((item) => props.speakers[item.speaker]?.type !== 'annotation');
  const topAnnotations = visibleItems.filter((item) => props.speakers[item.speaker]?.type === 'annotation' && props.speakers[item.speaker]?.style?.annotationPosition === 'top');
  const bottomAnnotations = visibleItems.filter((item) => props.speakers[item.speaker]?.type === 'annotation' && (props.speakers[item.speaker]?.style?.annotationPosition ?? 'bottom') === 'bottom');

  return (
    <AbsoluteFill style={{ backgroundColor: '#111111', overflow: 'hidden', fontFamily: 'system-ui' }}>
      {props.background?.image ? (
        <AbsoluteFill>
          <Img
            src={props.background.image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: `blur(${props.background.blur ?? 0}px) brightness(${props.background.brightness ?? 1})`,
              transform: 'scale(1.05)',
            }}
          />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ backgroundColor: props.background?.image ? 'rgba(0,0,0,0.06)' : '#111111' }} />

      {props.audioPath ? (
        <Sequence from={0}>
          <Audio src={props.audioPath} startFrom={Math.max(0, Math.round(props.exportRange.start * fps))} />
        </Sequence>
      ) : null}

      <AbsoluteFill
        style={{
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 * effectiveScale, alignItems: 'stretch' }}>
          {topAnnotations.map((item) => (
            <AnnotationBubble
              key={`top-${item.speaker}-${item.start}-${item.text}`}
              item={item}
              speaker={props.speakers[item.speaker]}
              bubbleScale={bubbleScale}
              effectiveScale={effectiveScale}
            />
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 * effectiveScale, justifyContent: 'flex-end' }}>
            {visibleMessages.map((item) => {
              const speaker = props.speakers[item.speaker];
              if (!speaker) {
                return null;
              }

              const isLeft = (speaker.side ?? 'left') === 'left';
               const bgColor = speaker.style?.bgColor || (speaker.theme === 'dark' ? '#2563eb' : '#ffffff');
               const textColor = speaker.style?.textColor || (speaker.theme === 'dark' ? '#ffffff' : '#111827');
               const borderColor = speaker.style?.borderColor || '#ffffff';
               const borderOpacity = speaker.style?.borderOpacity ?? 1;
               const shadowSize = (speaker.style?.shadowSize ?? 7) * effectiveScale;
               const fontSize = (speaker.style?.fontSize ?? 30) * bubbleScale * effectiveScale;
               const currentProgress = animationDuration <= 0
                 ? 1
                 : clamp((currentTime - item.start + animationDuration) / animationDuration, 0, 1);
               const avatarPx = avatarSize * effectiveScale;
               const bubbleMaxWidth = width * 0.60;
              const radius = (speaker.style?.borderRadius ?? 28) * bubbleScale * effectiveScale;
              const bubbleGap = 16 * bubbleScale * effectiveScale;
              const metaGap = 8 * bubbleScale * effectiveScale;
              const avatarBorderWidth = Math.max(2, 4 * bubbleScale * effectiveScale);
              const speakerBlockShadow = shadowSize > 0
                ? `drop-shadow(0 ${Math.round(shadowSize * 0.2)}px ${Math.max(6, shadowSize * 0.55)}px rgba(15, 23, 42, 0.22))`
                : 'none';
               const hexBg = bgColor.startsWith('#') ? bgColor : '#ffffff';
               const finalBgColor = `${hexBg}${Math.floor((speaker.style?.opacity ?? 0.9) * 255).toString(16).padStart(2, '0')}`;

              return (
                <div
                  key={`${item.speaker}-${item.start}-${item.text}`}
                  style={{
                    display: 'flex',
                    justifyContent: isLeft ? 'flex-start' : 'flex-end',
                    transform: getBubbleAnimationStyle(currentProgress, speaker.side),
                    opacity: currentProgress,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isLeft ? 'row' : 'row-reverse',
                      alignItems: 'flex-end',
                      gap: bubbleGap,
                      maxWidth: '100%',
                    }}
                  >
                    {speaker.avatar ? (
                      <div
                        style={{
                          width: avatarPx,
                          height: avatarPx,
                          minWidth: avatarPx,
                          borderRadius: '999px',
                          overflow: 'hidden',
                          backgroundColor: rgba('#ffffff', 0.12),
                          boxShadow: formatBubbleShadow(shadowSize),
                          border: `${avatarBorderWidth}px solid ${speaker.style?.avatarBorderColor || '#ffffff'}`,
                        }}
                      >
                        <Img src={speaker.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : null}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isLeft ? 'flex-start' : 'flex-end', gap: 6 * effectiveScale, maxWidth: bubbleMaxWidth, filter: speakerBlockShadow }}>
                      {speaker.name ? (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: isLeft ? 'row' : 'row-reverse',
                            alignItems: 'baseline',
                            gap: metaGap,
                            marginBottom: 4 * effectiveScale,
                          }}
                        >
                          <span
                            style={{
                              fontSize: `${speakerNameSize * bubbleScale * effectiveScale}px`,
                              fontWeight: 700,
                              color: speaker.style?.nameColor || '#ffffff',
                              textShadow: '0 2px 6px rgba(0,0,0,0.35)',
                              letterSpacing: '0.3px',
                            }}
                          >
                            {speaker.name}
                          </span>
                           <span
                            style={{
                              fontSize: `${9 * bubbleScale * effectiveScale}px`,
                              fontFamily: 'monospace',
                              color: 'rgba(255,255,255,0.65)',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {formatTimestamp(item.start)}
                          </span>
                        </div>
                      ) : null}
                      <div
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          isolation: 'isolate',
                          backgroundColor: finalBgColor,
                          color: textColor,
                          borderRadius: `${radius}px`,
                          borderTopLeftRadius: isLeft ? `${Math.max(2, 3 * bubbleScale * effectiveScale)}px` : `${radius}px`,
                          borderTopRightRadius: !isLeft ? `${Math.max(2, 3 * bubbleScale * effectiveScale)}px` : `${radius}px`,
                          padding: `${(speaker.style?.paddingY ?? 12) * effectiveScale}px ${(speaker.style?.paddingX ?? 20) * effectiveScale}px`,
                          fontSize: `${fontSize}px`,
                          fontWeight: speaker.style?.fontWeight || 'normal',
                          lineHeight: 1.35,
                          maxWidth: `${bubbleMaxWidth}px`,
                          whiteSpace: 'pre-wrap',
                          border: (speaker.style?.borderWidth ?? 0) > 0 ? `${(speaker.style?.borderWidth ?? 0) * effectiveScale}px solid ${rgba(borderColor, borderOpacity)}` : 'none',
                          boxShadow: formatBubbleShadow(shadowSize),
                        }}
                      >
                        {item.text}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 * effectiveScale, alignItems: 'stretch' }}>
          {bottomAnnotations.map((item) => (
            <AnnotationBubble
              key={`bottom-${item.speaker}-${item.start}-${item.text}`}
              item={item}
              speaker={props.speakers[item.speaker]}
              bubbleScale={bubbleScale}
              effectiveScale={effectiveScale}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
