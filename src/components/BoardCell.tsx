import React, { memo } from 'react';
import { Check, Lock, Zap } from 'lucide-react';
import { BoardCell as BoardCellData, ITEM_CATALOG } from '../game/rules';
import { ItemArtwork } from './ItemArtwork';

interface BoardCellProps {
  cell: BoardCellData;
  isAr: boolean;
  isSelected: boolean;
  isCelebrating: boolean;
  isFocused: boolean;
  isTutorialTarget: boolean;
  isMergeTarget: boolean;
  isOrderNeeded: boolean;
  isRecipeNeeded: boolean;
  isDragSource: boolean;
  isDragOver: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>, index: number) => void;
  onSelect: (index: number) => void;
}

/**
 * One tile of the 7×7 board. Memoised: a merge or spawn changes one or two cells, so the other tiles
 * skip rendering entirely (unchanged board cell objects are reused by the rules engine).
 */
export const BoardCell = memo(function BoardCell({
  cell,
  isAr,
  isSelected,
  isCelebrating,
  isFocused,
  isTutorialTarget,
  isMergeTarget,
  isOrderNeeded,
  isRecipeNeeded,
  isDragSource,
  isDragOver,
  onPointerDown,
  onSelect,
}: BoardCellProps) {
  const itemDef = cell.itemId ? ITEM_CATALOG[cell.itemId] : null;
  const isEvenChecker = (cell.row + cell.col) % 2 === 0;
  const tileSurfaceClass = cell.sandLocked
    ? 'tile-locked-3d opacity-95'
    : itemDef?.isGenerator
    ? 'tile-generator-3d hover:scale-[1.03]'
    : itemDef?.isChest
    ? 'tile-chest-3d hover:scale-[1.03]'
    : isOrderNeeded
    ? 'tile-ready-3d active:scale-95'
    : isEvenChecker
    ? 'tile-ivory active:scale-95'
    : 'tile-sand active:scale-95';
  const accessibleLabel = itemDef
    ? `${isAr ? itemDef.nameAr : itemDef.nameEn} ${itemDef.isGenerator ? (isAr ? 'مولد' : 'Generator') : `Lv.${itemDef.level}`} ${
        cell.sandLocked ? (isAr ? 'مغطى بالرمال' : 'Sand-Locked') : ''
      } (${cell.row + 1},${cell.col + 1})`
    : `${isAr ? 'خلية فارغة' : 'Empty Tile'} (${cell.row + 1},${cell.col + 1})`;

  return (
    <button
      type="button"
      aria-label={`${accessibleLabel}${isFocused ? (isAr ? '، مفيد للمهمة المختارة' : ', useful for the focused goal') : ''}${isTutorialTarget ? (isAr ? '، مقترح للدمج الأول' : ', suggested for your first merge') : ''}${isRecipeNeeded ? (isAr ? '، جاهز للوصفة المختارة' : ', ready for the focused recipe') : ''}`}
      data-cell-index={cell.index}
      data-recipe-needed={isRecipeNeeded || undefined}
      onPointerDown={(e) => onPointerDown(e, cell.index)}
      onClick={() => onSelect(cell.index)}
      className={`relative min-w-0 aspect-square rounded-xl flex flex-col items-center justify-center transition-transform cursor-pointer select-none ${!cell.itemId || cell.sandLocked ? 'touch-pan-y' : 'touch-none'} ${tileSurfaceClass} ${
        isDragSource ? 'opacity-40' : ''
      } ${
        isDragOver ? 'ring-3 ring-[#FDE047] scale-[1.06] z-10' : ''
      } ${
        isSelected
          ? 'ring-3 ring-[#F59E0B] scale-[1.05] z-10'
          : ''
      } ${
        isMergeTarget || isTutorialTarget
          ? 'ring-3 ring-[#10B981]'
          : ''
      } ${
        isCelebrating
          ? 'merge-tile-celebrate ring-3 ring-[#FDE047] shadow-[0_0_18px_rgba(250,204,21,0.85)] z-20'
          : ''
      } ${
        isFocused && !isSelected && !isMergeTarget && !isTutorialTarget ? 'ring-2 ring-[#F59E0B]' : ''
      }`}
    >
      {itemDef && (
        <>
          <ItemArtwork itemId={itemDef.id} size="board" />

          {/* Clean Gossip-Harbor Style Corner Badge */}
          {itemDef.isGenerator ? (
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-gradient-to-b from-[#FDE047] to-[#D97706] border border-[#78350F] text-[#3E2723] flex items-center justify-center shadow">
              <Zap className="w-2.5 h-2.5 fill-current" />
            </span>
          ) : (
            <span className="absolute bottom-0.5 left-0.5 px-1 min-w-[16px] h-4 rounded-md bg-[#3E2723]/85 text-[#FFFDF9] text-[9px] font-black tabular-nums flex items-center justify-center leading-none">
              {itemDef.level}
            </span>
          )}

          {/* Order Needed Green Checkmark Badge */}
          {isOrderNeeded && (
            <span
              title={isAr ? 'مطلوب لطلب ضيف' : 'Needed for Order'}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border border-white text-white flex items-center justify-center shadow"
            >
              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
            </span>
          )}

          {isRecipeNeeded && (
            <span aria-hidden="true" title={isAr ? 'جاهز للوصفة المختارة' : 'Ready for the focused recipe'} className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#B45309] border border-white text-white flex items-center justify-center shadow">
              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
            </span>
          )}

          {/* Sand-Locked Ribbon Badge */}
          {cell.sandLocked && (
            <span
              title={isAr ? 'ادمج عنصراً مطابقاً لفتح القفل' : 'Merge matching item to unlock'}
              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#78350F] border border-[#FDE68A] text-[#FDE68A] flex items-center justify-center shadow"
            >
              <Lock className="w-2.5 h-2.5" />
            </span>
          )}
        </>
      )}
    </button>
  );
});
