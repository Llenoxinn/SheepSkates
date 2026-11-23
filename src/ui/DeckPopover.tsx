import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import { BOARD_ARTS, BOARD_ART_SPECS, getBoardArtPreview, type BoardArt } from '../game/boardArt';
import { BOARD_SPECS, BOARD_STYLES, type BoardStyle } from '../game/boards';
import { ArtIcon, type ArtIconName } from './ArtIcons';

const SHAPE_ICON: Record<BoardStyle, ArtIconName> = {
  street: 'boardStreet',
  cruiser: 'boardCruiser',
  oldschool: 'boardOldschool',
  pintail: 'boardPintail',
};

const SHAPE_LABEL: Record<BoardStyle, string> = {
  street: 'Street',
  cruiser: 'Cruiser',
  oldschool: '80s Pool',
  pintail: 'Pintail',
};

type DeckPopoverProps = {
  boardStyle: BoardStyle;
  boardArt: BoardArt;
  below: boolean;
  offsetPx: number;
  onSelectStyle: (style: BoardStyle) => void;
  onSelectArt: (art: BoardArt) => void;
  onRandomize: () => void;
  onTestKickflip: () => void;
};

/** Compact Deck Studio popover for choosing 3D board shape, illustrated deck artwork, and testing kickflips. */
export function DeckPopover({
  boardStyle,
  boardArt,
  below,
  offsetPx,
  onSelectStyle,
  onSelectArt,
  onRandomize,
  onTestKickflip,
}: DeckPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const previews = useMemo(
    () => BOARD_ARTS.map(id => [id, getBoardArtPreview(id)] as const),
    [],
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--shift-x', '0px');
    const r = el.getBoundingClientRect();
    let shift = 0;
    if (r.left < 10) shift = 10 - r.left;
    else if (r.right > window.innerWidth - 10) shift = window.innerWidth - 10 - r.right;
    el.style.setProperty('--shift-x', `${Math.round(shift)}px`);
  }, [below, offsetPx, boardStyle, boardArt]);

  return (
    <div
      ref={ref}
      className={`deck-studio ${below ? 'below' : ''}`}
      style={{ '--pop-gap': `${offsetPx}px` } as CSSProperties}
      role="dialog"
      aria-label="Deck Studio"
    >
      <div className="deck-studio-head">
        <span className="deck-studio-title">Deck Studio</span>
        <div className="deck-studio-acts">
          <button
            type="button"
            className="deck-act"
            title="Randomize board shape and artwork"
            aria-label="Randomize shape and artwork"
            onClick={onRandomize}
          >
            <ArtIcon name="randomize" size={14} />
            <span>Mix</span>
          </button>
          <button
            type="button"
            className="deck-act flip"
            title="Test Kickflip · admire underside artwork"
            aria-label="Test Kickflip"
            onClick={onTestKickflip}
          >
            <ArtIcon name="kickflip" size={14} />
            <span>Flip</span>
          </button>
        </div>
      </div>

      <div className="deck-sec-label">Shape</div>
      <div className="deck-shapes" role="radiogroup" aria-label="Board shape">
        {BOARD_STYLES.map(id => {
          const spec = BOARD_SPECS[id];
          const active = boardStyle === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              title={`${SHAPE_LABEL[id]} · ${spec.subtitle}`}
              className={active ? 'checked' : ''}
              onClick={() => onSelectStyle(id)}
            >
              <ArtIcon name={SHAPE_ICON[id]} size={20} />
              <span>{SHAPE_LABEL[id]}</span>
            </button>
          );
        })}
      </div>

      <div className="deck-sec-label">Artwork</div>
      <div className="deck-arts" role="radiogroup" aria-label="Deck artwork">
        {previews.map(([id, src]) => {
          const spec = BOARD_ART_SPECS[id];
          const active = boardArt === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={spec.label}
              title={spec.label}
              className={active ? 'checked' : ''}
              onClick={() => onSelectArt(id)}
            >
              <span className="deck-swatch" style={{ background: spec.baseHex }}>
                <img src={src} alt="" width={22} height={44} />
              </span>
              <span>{spec.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
