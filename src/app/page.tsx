import NoSSRWrapper from '@/components/NoSSRWrapper'
import VideoConversionForm from '@/features/video-conversion/components/video-conversion-form'

export default function Home() {
	return (
		<NoSSRWrapper>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="container mx-auto py-8">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">
							YouTube Shorts 変換ツール
						</h1>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							YouTube用の横動画を簡単にShorts用の縦動画に変換できます。
							FFmpeg.wasmを使用してブラウザ上で安全に変換します。
						</p>
					</div>

					<VideoConversionForm />

					<div className="mt-16 text-center text-sm text-gray-500">
						<p>
							このツールはブラウザ上でFFmpeg.wasmを使用して動画変換を行います。
							アップロードしたファイルはサーバーに送信されません。
						</p>
					</div>
				</div>
			</div>
		</NoSSRWrapper>
	)
}
