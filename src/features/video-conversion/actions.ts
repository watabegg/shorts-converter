'use server'

import { videoConversionSchema } from './schemas'

export async function submitVideoConversion(formData: FormData) {
	try {
		// フォームデータからファイルと文字列を取得
		const title = formData.get('title') as string
		const videoFile = formData.get('videoFile') as File
		const thumbnailImage = formData.get('thumbnailImage') as File

		// バリデーション
		const validationResult = videoConversionSchema.safeParse({
			title,
			videoFile,
			thumbnailImage,
		})

		if (!validationResult.success) {
			return {
				success: false,
				error: '入力データが無効です',
				fieldErrors: validationResult.error.flatten().fieldErrors,
			}
		}

		// クライアントサイドでの処理のため、ここではバリデーション済みデータを返す
		return {
			success: true,
			data: {
				title: validationResult.data.title,
				hasVideoFile: validationResult.data.videoFile instanceof File,
				hasThumbnailImage: validationResult.data.thumbnailImage instanceof File,
			},
		}
	} catch (error) {
		console.error('Server Action エラー:', error)
		return {
			success: false,
			error: '処理中にエラーが発生しました',
		}
	}
}
