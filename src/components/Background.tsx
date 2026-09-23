import { useEffect, useRef, useState } from 'react';
import type { Wallpaper } from '../types';
import './Background.css';

interface BackgroundProps {
  wallpaper: Wallpaper;
  blurred: boolean;
  dimmed: boolean;
}

interface Layer {
  id: number;
  src: string;
}

/** 与 CSS 里的 opacity 过渡时长保持一致，过渡结束后丢掉旧图层。 */
const FADE_MS = 1400;

/**
 * 背景图。切换壁纸（尤其是每天同步新图）时保留旧图层做交叉淡入淡出，
 * 避免出现空白帧或生硬跳变。
 */
export function Background({ wallpaper, blurred, dimmed }: BackgroundProps) {
  const [layers, setLayers] = useState<Layer[]>(() => [{ id: 0, src: wallpaper.src }]);
  const [loaded, setLoaded] = useState<number[]>([0]);
  const nodes = useRef(new Map<number, HTMLImageElement>());
  const nextId = useRef(1);
  const frontSrc = layers[layers.length - 1]?.src;

  // 新的壁纸 → 追加一层放在最上面，旧图层留在下面继续可见。
  useEffect(() => {
    if (!wallpaper.src || wallpaper.src === frontSrc) return;
    const id = nextId.current++;
    setLayers((current) => [...current, { id, src: wallpaper.src }].slice(-2));
  }, [wallpaper.src, frontSrc]);

  // 淡入结束后只保留最上面那一层。
  useEffect(() => {
    if (layers.length < 2) return;
    const front = layers[layers.length - 1].id;
    const timer = window.setTimeout(() => {
      setLayers((current) => current.filter((layer) => layer.id === front));
      setLoaded((current) => current.filter((id) => id === front));
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [layers]);

  // 命中缓存时图片可能在挂载前就已经 complete，这里补一次判定。
  useEffect(() => {
    for (const layer of layers) {
      const node = nodes.current.get(layer.id);
      if (node?.complete && node.naturalWidth > 0) {
        setLoaded((current) => (current.includes(layer.id) ? current : [...current, layer.id]));
      }
    }
  }, [layers]);

  const markLoaded = (id: number) => setLoaded((current) => (current.includes(id) ? current : [...current, id]));

  const dropLayer = (id: number) => {
    nodes.current.delete(id);
    setLayers((current) => (current.length > 1 ? current.filter((layer) => layer.id !== id) : current));
    setLoaded((current) => current.filter((layerId) => layerId !== id));
  };

  return (
    <>
      {layers.map((layer, index) => (
        <img
          key={layer.id}
          ref={(node) => {
            if (node) nodes.current.set(layer.id, node);
            else nodes.current.delete(layer.id);
          }}
          className={`background${blurred ? ' is-blurred' : ''}${loaded.includes(layer.id) ? ' is-loaded' : ''}`}
          style={{ zIndex: -3 + index }}
          src={layer.src}
          alt=""
          draggable={false}
          decoding="async"
          fetchPriority={index === layers.length - 1 ? 'high' : 'low'}
          onLoad={() => markLoaded(layer.id)}
          onError={() => dropLayer(layer.id)}
        />
      ))}
      <div className={`vignette${dimmed ? ' is-dimmed' : ''}`} aria-hidden="true" />
    </>
  );
}
