import { z } from 'zod';

// 動画変換フォームの入力スキーマ
export const videoConversionSchema = z.object({
  title: z
    .string()
    .min(1, '動画タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください'),
  subtitle: z
    .string()
    .max(100, 'サブタイトルは100文字以内で入力してください')
    .optional(),
  videoFile: z
    .instanceof(File, { message: '動画ファイルを選択してください' })
    .refine(
      (file) => file.size > 0,
      '有効な動画ファイルを選択してください'
    )
    .refine(
      (file) => file.type.startsWith('video/'),
      '動画ファイルを選択してください'
    )
    .refine(
      (file) => file.size <= 100 * 1024 * 1024, // 100MB制限
      'ファイルサイズは100MB以下にしてください'
    ),
  thumbnailImage: z
    .instanceof(File, { message: 'サムネイル画像を選択してください' })
    .refine(
      (file) => file.size > 0,
      '有効な画像ファイルを選択してください'
    )
    .refine(
      (file) => file.type.startsWith('image/'),
      '画像ファイルを選択してください'
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB制限
      '画像ファイルサイズは10MB以下にしてください'
    ),
  backgroundTemplate: z
    .instanceof(File)
    .refine(
      (file) => file.size > 0,
      '有効な背景画像ファイルを選択してください'
    )
    .refine(
      (file) => file.type.startsWith('image/'),
      '画像ファイルを選択してください'
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB制限
      '背景画像ファイルサイズは10MB以下にしてください'
    )
    .optional(),
});

export type VideoConversionFormData = z.infer<typeof videoConversionSchema>;

// 動画変換の進捗状態
export enum ConversionStatus {
  IDLE = 'idle',
  LOADING_FFMPEG = 'loading_ffmpeg',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

// 動画変換の結果型
export interface ConversionResult {
  success: boolean;
  outputFile?: Uint8Array;
  error?: string;
  progress?: number;
}

// FFmpeg処理のオプション
export interface FFmpegOptions {
  onProgress?: (progress: number) => void;
  onLog?: (message: string) => void;
}

// 動画変換設定
export interface VideoConversionSettings {
  // 動画配置設定（Bashスクリプトのパラメータ参考）
  videoScale: number; // 1080 = full width
  videoPositionX: number; // 横位置オフセット
  videoPositionY: number; // 縦位置オフセット（上から）
  
  // タイトル設定
  titleFontSize: number; // フォントサイズ
  titlePositionY: number; // タイトルY位置
  titleColor: string; // テキスト色
  titleOutlineColor: string; // アウトライン色
  
  // サムネイル設定
  thumbnailScale: number; // サムネイルサイズ
  thumbnailPositionX: number; // サムネイル横位置
  thumbnailPositionY: number; // サムネイル縦位置
  
  // 出力設定
  outputWidth: number; // 出力幅（デフォルト：1080）
  outputHeight: number; // 出力高（デフォルト：1920）
  maxDuration: number; // 最大時間（秒）
}

// デフォルト設定
export const DEFAULT_CONVERSION_SETTINGS: VideoConversionSettings = {
  videoScale: 1080,
  videoPositionX: 0,
  videoPositionY: 400,
  titleFontSize: 60,
  titlePositionY: 200,
  titleColor: 'white',
  titleOutlineColor: 'black',
  thumbnailScale: 200,
  thumbnailPositionX: 840,
  thumbnailPositionY: 100,
  outputWidth: 1080,
  outputHeight: 1920,
  maxDuration: 60,
};
