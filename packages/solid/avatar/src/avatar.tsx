import { createSignal, createEffect, onCleanup, on, splitProps, Show } from 'solid-js';
import { isServer } from 'solid-js/web';
import { createContextScope } from '@radix-solid/context';
import { Primitive, type PrimitiveProps } from '@radix-solid/primitive-component';

import type { Scope } from '@radix-solid/context';

/* -------------------------------------------------------------------------------------------------
 * Avatar
 * -----------------------------------------------------------------------------------------------*/

const AVATAR_NAME = 'Avatar';

const [createAvatarContext, createAvatarScope] = createContextScope(AVATAR_NAME);

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

type AvatarContextValue = {
  imageLoadingStatus: ImageLoadingStatus;
  onImageLoadingStatusChange: (status: ImageLoadingStatus) => void;
};

const [AvatarProvider, useAvatarContext] =
  createAvatarContext<AvatarContextValue>(AVATAR_NAME);

interface AvatarProps extends PrimitiveProps<'span'> {
  __scopeAvatar?: Scope;
}

function Avatar(props: AvatarProps) {
  const [local, rest] = splitProps(props, ['__scopeAvatar']);
  const [imageLoadingStatus, setImageLoadingStatus] = createSignal<ImageLoadingStatus>('idle');

  return (
    <AvatarProvider
      scope={local.__scopeAvatar}
      imageLoadingStatus={imageLoadingStatus()}
      onImageLoadingStatusChange={setImageLoadingStatus}
    >
      <Primitive.span {...rest} />
    </AvatarProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AvatarImage
 * -----------------------------------------------------------------------------------------------*/

const IMAGE_NAME = 'AvatarImage';

interface AvatarImageProps extends PrimitiveProps<'img'> {
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
  __scopeAvatar?: Scope;
}

function AvatarImage(props: AvatarImageProps) {
  const [local, rest] = splitProps(props, [
    '__scopeAvatar',
    'src',
    'onLoadingStatusChange',
    'referrerPolicy',
    'crossOrigin',
  ]);
  const context = useAvatarContext(IMAGE_NAME, local.__scopeAvatar);

  const imageLoadingStatus = createImageLoadingStatus(
    () => local.src,
    () => local.referrerPolicy,
    () => local.crossOrigin
  );

  // Propagate loading status changes
  createEffect(
    on(imageLoadingStatus, (status) => {
      if (status !== 'idle') {
        local.onLoadingStatusChange?.(status);
        context.onImageLoadingStatusChange(status);
      }
    })
  );

  return (
    <Show when={imageLoadingStatus() === 'loaded'}>
      <Primitive.img {...rest} src={local.src} />
    </Show>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AvatarFallback
 * -----------------------------------------------------------------------------------------------*/

const FALLBACK_NAME = 'AvatarFallback';

interface AvatarFallbackProps extends PrimitiveProps<'span'> {
  delayMs?: number;
  __scopeAvatar?: Scope;
}

function AvatarFallback(props: AvatarFallbackProps) {
  const [local, rest] = splitProps(props, ['__scopeAvatar', 'delayMs']);
  const context = useAvatarContext(FALLBACK_NAME, local.__scopeAvatar);
  const [canRender, setCanRender] = createSignal(local.delayMs === undefined);

  createEffect(() => {
    const delayMs = local.delayMs;
    if (delayMs !== undefined) {
      const timerId = window.setTimeout(() => setCanRender(true), delayMs);
      onCleanup(() => window.clearTimeout(timerId));
    }
  });

  return (
    <Show when={canRender() && context.imageLoadingStatus !== 'loaded'}>
      <Primitive.span {...rest} />
    </Show>
  );
}

/* -----------------------------------------------------------------------------------------------*/

function resolveLoadingStatus(image: HTMLImageElement | null, src?: string): ImageLoadingStatus {
  if (!image) return 'idle';
  if (!src) return 'error';
  if (image.src !== src) {
    image.src = src;
  }
  return image.complete && image.naturalWidth > 0 ? 'loaded' : 'loading';
}

function createImageLoadingStatus(
  src: () => string | undefined,
  referrerPolicy: () => string | undefined,
  crossOrigin: () => string | undefined
) {
  // On the server, we can't create Image objects
  if (isServer) {
    return () => 'idle' as ImageLoadingStatus;
  }

  let imageRef: HTMLImageElement | null = null;

  const getImage = () => {
    if (!imageRef) {
      imageRef = new window.Image();
    }
    return imageRef;
  };

  const [loadingStatus, setLoadingStatus] = createSignal<ImageLoadingStatus>(
    resolveLoadingStatus(getImage(), src())
  );

  // React to src changes
  createEffect(
    on(src, (currentSrc) => {
      setLoadingStatus(resolveLoadingStatus(getImage(), currentSrc));
    })
  );

  // Listen for load/error events
  createEffect(() => {
    const image = getImage();
    const rp = referrerPolicy();
    const co = crossOrigin();

    const handleLoad = () => setLoadingStatus('loaded');
    const handleError = () => setLoadingStatus('error');

    image.addEventListener('load', handleLoad);
    image.addEventListener('error', handleError);

    if (rp) image.referrerPolicy = rp;
    if (typeof co === 'string') image.crossOrigin = co;

    onCleanup(() => {
      image.removeEventListener('load', handleLoad);
      image.removeEventListener('error', handleError);
    });
  });

  return loadingStatus;
}

const Root = Avatar;
const Image = AvatarImage;
const Fallback = AvatarFallback;

export {
  createAvatarScope,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Root,
  Image,
  Fallback,
};
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps };
