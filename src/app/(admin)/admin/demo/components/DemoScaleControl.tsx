"use client";

interface DemoScaleControlProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  disabled: boolean;
}

export function DemoScaleControl({
  scale,
  onScaleChange,
  disabled,
}: DemoScaleControlProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Data Scale
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Control the amount of demo data generated
          </p>
        </div>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {scale}x
        </span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>1x (Minimal)</span>
          <span>10x (Default)</span>
          <span>100x (Maximum)</span>
        </div>
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded text-xs space-y-1">
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Expected counts for scale {scale}:
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 dark:text-gray-400">
            <span>• Users: {scale * 10}</span>
            <span>• Shops: {Math.ceil(scale / 2)}</span>
            <span>• Products: {scale * 100}</span>
            <span>• Auctions: {Math.ceil(scale * 25)}</span>
            <span>• Bids: {scale * 250}+</span>
            <span>• Reviews: {scale * 150}+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
