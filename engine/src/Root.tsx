import React from 'react';
import { Composition } from 'remotion';
import { Video, videoDefaults, videoMeta } from './Video';
import { CastSheet, castSize } from './CastSheet';

export const RemotionRoot = () => (
  <>
    <Composition id="Tholu" component={Video} defaultProps={videoDefaults} calculateMetadata={videoMeta} durationInFrames={180} fps={30} width={1080} height={1920} />
    <Composition id="Cast" component={CastSheet} durationInFrames={1} fps={30} width={castSize.w} height={castSize.h} />
  </>
);
