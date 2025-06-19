export type VideoCodec = 'libx264' | 'libx265'
export type Preset =
	| 'ultrafast'
	| 'superfast'
	| 'veryfast'
	| 'faster'
	| 'fast'
	| 'medium'
	| 'slow'
	| 'slower'
	| 'veryslow'
export type AudioCodec = 'aac' | 'copy'

export interface ConversionOptions {
	resolution?: {
		width: number
		height: number
	}
	videoCodec?: VideoCodec
	preset?: Preset
	crf?: number // Constant Rate Factor (0-51 for libx264, lower is better quality)
	audioCodec?: AudioCodec
	audioBitrate?: string // e.g., '128k', '192k'
	paddingColor?: string
}
