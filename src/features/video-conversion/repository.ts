'use client'

import { ConversionResult, FFmpegOptions } from './schemas';

export class VideoConversionRepository {
  private ffmpeg: any = null;
  private isLoaded = false;

  /**
   * ブラウザ環境でのみFFmpeg.wasmを初期化
   */
  async initialize(options?: FFmpegOptions): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('FFmpeg.wasmはブラウザ環境でのみ利用可能です');
    }

    if (this.isLoaded && this.ffmpeg) {
      return;
    }

    try {
      // 動的インポートでFFmpeg.wasmをロード
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      this.ffmpeg = new FFmpeg();

      // イベントリスナーを設定
      if (options?.onLog) {
        this.ffmpeg.on('log', ({ message }: { message: string }) => {
          options.onLog!(message);
        });
      }

      if (options?.onProgress) {
        this.ffmpeg.on('progress', ({ progress }: { progress: number }) => {
          options.onProgress!(progress);
        });
      }

      // CDNからFFmpeg coreファイルをロード
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.isLoaded = true;
    } catch (error) {
      console.error('FFmpeg初期化エラー:', error);
      throw new Error(`FFmpeg初期化に失敗しました: ${error}`);
    }
  }

  /**
   * 横動画を縦動画に変換
   */
  async convertVideo(
    videoFile: File,
    title: string,
    thumbnailImage?: File
  ): Promise<ConversionResult> {
    if (!this.ffmpeg || !this.isLoaded) {
      throw new Error('FFmpegが初期化されていません');
    }

    try {
      const { fetchFile } = await import('@ffmpeg/util');
      
      const inputFileName = 'input.mp4';
      const outputFileName = 'output.mp4';

      // 入力ファイルを書き込み
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

      // シンプルな縦動画変換（中央切り抜き）
      await this.ffmpeg.exec([
        '-i', inputFileName,
        '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        '-crf', '25',
        '-t', '60', // 最大60秒
        outputFileName
      ]);

      // 出力ファイルを読み取り
      const outputData = await this.ffmpeg.readFile(outputFileName);

      // 一時ファイルをクリーンアップ
      await this.ffmpeg.deleteFile(inputFileName);
      await this.ffmpeg.deleteFile(outputFileName);

      return {
        success: true,
        outputFile: new Uint8Array(outputData as ArrayBuffer),
      };

    } catch (error) {
      console.error('動画変換エラー:', error);
      return {
        success: false,
        error: `動画変換に失敗しました: ${error}`,
      };
    }
  }

  /**
   * 初期化状態をチェック
   */
  isInitialized(): boolean {
    return this.isLoaded && this.ffmpeg !== null;
  }

  /**
   * リソースをクリーンアップ
   */
  destroy(): void {
    if (this.ffmpeg) {
      this.ffmpeg = null;
      this.isLoaded = false;
    }
  }
}
