import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { ConversionOptions } from './types'

type ProgressCallback = (progress: number) => void
type LogCallback = (message: string) => void

export class FFmpegManager {
	private ffmpeg: FFmpeg | null = null
	private onProgress: ProgressCallback | null = null
	private onLog: LogCallback | null = null

	public isLoaded(): boolean {
		return !!this.ffmpeg
	}

	public on(
		event: 'progress' | 'log',
		callback: ProgressCallback | LogCallback,
	): void {
		if (event === 'progress') {
			this.onProgress = callback as ProgressCallback
		} else if (event === 'log') {
			this.onLog = callback as LogCallback
		}
	}

	public async load(): Promise<void> {
		if (this.ffmpeg) return

		try {
			const ffmpegInstance = new FFmpeg()

			ffmpegInstance.on('log', ({ message }) => {
				this.onLog?.(message)
			})

			ffmpegInstance.on('progress', ({ progress }) => {
				this.onProgress?.(Math.round(progress * 100))
			})

			const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
			await ffmpegInstance.load({
				coreURL: await toBlobURL(
					`${baseURL}/ffmpeg-core.js`,
					'text/javascript',
				),
				wasmURL: await toBlobURL(
					`${baseURL}/ffmpeg-core.wasm`,
					'application/wasm',
				),
			})

			this.ffmpeg = ffmpegInstance
		} catch (err) {
			console.error('FFmpeg loading failed:', err)
			throw new Error('FFmpegの読み込みに失敗しました')
		}
	}

	public async convertToShorts(
		videoFile: File,
		options: ConversionOptions = {},
	): Promise<string> {
		if (!this.ffmpeg) {
			throw new Error('FFmpeg is not loaded.')
		}

		const {
			resolution = { width: 720, height: 1280 },
			videoCodec = 'libx264',
			preset = 'fast',
			crf = 23,
			audioCodec = 'aac',
			audioBitrate = '128k',
			paddingColor = 'black',
		} = options

		try {
			const inputName = 'input.mp4'
			const outputName = 'output.mp4'

			await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile))

			const vfFilter = `scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=decrease,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2:${paddingColor}`

			const ffmpegArgs = [
				'-i',
				inputName,
				'-vf',
				vfFilter,
				'-c:v',
				videoCodec,
				'-preset',
				preset,
				'-crf',
				crf.toString(),
				'-c:a',
				audioCodec,
				'-b:a',
				audioBitrate,
				'-movflags',
				'+faststart',
				'-y',
				outputName,
			]

			this.onLog?.(`FFmpeg command: ${ffmpegArgs.join(' ')}`)

			await this.ffmpeg.exec(ffmpegArgs)

			const outputData = await this.ffmpeg.readFile(outputName)
			const outputBlob = new Blob([outputData], { type: 'video/mp4' })
			return URL.createObjectURL(outputBlob)
		} catch (err) {
			console.error('Conversion failed:', err)
			throw new Error(
				`変換に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`,
			)
		}
	}
}
