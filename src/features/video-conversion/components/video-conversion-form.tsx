'use client';

import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function VideoConversionForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [outputVideo, setOutputVideo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFFmpeg = async () => {
    if (ffmpeg) return;
    
    try {
      const ffmpegInstance = new FFmpeg();
      
      ffmpegInstance.on('log', ({ message }) => {
        console.log(message);
      });
      
      ffmpegInstance.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      setFFmpeg(ffmpegInstance);
    } catch (err) {
      console.error('FFmpeg loading failed:', err);
      setError('FFmpegの読み込みに失敗しました');
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setOutputVideo(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertVideo = async () => {
    if (!videoFile || !ffmpeg) return;
    
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setOutputVideo(null);

    try {
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';
      
      // Write input file to FFmpeg file system
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      // Simple conversion from horizontal (16:9) to vertical (9:16)
      // Scale to fit height and pad with black bars on sides
      const ffmpegArgs = [
        '-i', inputName,
        '-vf', 'scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:black',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y', // Overwrite output file
        outputName
      ];

      console.log('FFmpeg command:', ffmpegArgs.join(' '));
      
      await ffmpeg.exec(ffmpegArgs);
      
      const outputData = await ffmpeg.readFile(outputName);
      const outputBlob = new Blob([outputData], { type: 'video/mp4' });
      const outputUrl = URL.createObjectURL(outputBlob);
      
      setOutputVideo(outputUrl);
      setProgress(100);
    } catch (err) {
      console.error('Conversion failed:', err);
      setError(`変換に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadVideo = () => {
    if (!outputVideo) return;
    
    const a = document.createElement('a');
    a.href = outputVideo;
    a.download = 'shorts-video.mp4';
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>YouTube Shorts 変換</CardTitle>
          <CardDescription>
            横向き動画（16:9）を縦向き動画（9:16、720x1280）に変換します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Upload */}
          <div className="space-y-2">
            <Label htmlFor="video-input">動画ファイルを選択</Label>
            <Input
              id="video-input"
              type="file"
              accept="video/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setVideoFile(file || null);
                setOutputVideo(null);
                setError(null);
              }}
            />
            {videoFile && (
              <p className="text-sm text-gray-600">
                選択されたファイル: {videoFile.name}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={loadFFmpeg} 
                disabled={!!ffmpeg || isLoading}
                variant="outline"
                className="flex-1"
              >
                {ffmpeg ? '✅ FFmpeg準備完了' : 'FFmpegを読み込む'}
              </Button>
              
              <Button
                onClick={convertVideo}
                disabled={!videoFile || !ffmpeg || isLoading}
                className="flex-1"
              >
                {isLoading ? '変換中...' : '🔄 変換開始'}
              </Button>
              
              <Button
                onClick={resetForm}
                variant="outline"
                disabled={isLoading}
              >
                リセット
              </Button>
            </div>

            {/* Progress */}
            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>変換進行状況</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Output Video */}
            {outputVideo && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 font-medium">✅ 変換完了！</p>
                  <p className="text-sm text-green-600">
                    縦向き動画（720x1280）として変換されました
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>プレビュー</Label>
                  <video
                    src={outputVideo}
                    controls
                    className="w-full max-w-sm mx-auto rounded-md border"
                    style={{ aspectRatio: '9/16' }}
                  />
                </div>
                
                <Button onClick={downloadVideo} className="w-full">
                  📥 動画をダウンロード
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
