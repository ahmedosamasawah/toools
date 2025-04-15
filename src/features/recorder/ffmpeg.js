import {FFmpeg} from '@ffmpeg/ffmpeg'
import {fetchFile, toBlobURL} from '@ffmpeg/util'

/** @type {FFmpeg | null} */
let ffmpeg = null

/** @returns {Promise<void>} */
export async function init() {
    if (ffmpeg) return

    ffmpeg = new FFmpeg()

    ffmpeg.on('log', ({message}) => console.log(message))

    await ffmpeg.load({
        coreURL: await toBlobURL('ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('ffmpeg-core.wasm', 'application/wasm'),
    })

    console.log('FFmpeg loaded')
}

/** @param {Blob} audio_file @param {string} start_time @param {string} end_time @returns {Promise<string>} */
export async function trim_audio(audio_file, start_time, end_time) {
    if (!ffmpeg) await init()

    const input_file_name = 'input.webm'
    const output_file_name = 'output.webm'

    await ffmpeg?.writeFile(input_file_name, await fetchFile(audio_file))

    await ffmpeg?.exec([
        '-i',
        input_file_name,
        '-ss',
        start_time,
        '-to',
        end_time,
        '-c',
        'copy',
        output_file_name,
    ])

    /** @type {BlobPart | undefined} */
    const data = await ffmpeg?.readFile(output_file_name)

    const blob = new Blob([data ?? ''], {type: 'audio/webm'})
    return URL.createObjectURL(blob)
}

/** @param {Blob} audio_file @param {string} [source_format] @returns {Promise<{url: string, blob: Blob, duration: number}>} */
export async function convert_audio(audio_file, source_format) {
    if (!ffmpeg) await init()

    const format = source_format || audio_file.type.split('/')[1] || 'mp3'
    const input_file_name = `input.${format}`
    const output_file_name = 'output.webm'

    await ffmpeg?.writeFile(input_file_name, await fetchFile(audio_file))

    await ffmpeg?.exec(['-i', input_file_name, '-f', 'null', '-'])

    await ffmpeg?.exec(['-i', input_file_name, '-c:a', 'libopus', '-b:a', '128k', output_file_name])

    /** @type {BlobPart | undefined} */
    const data = await ffmpeg?.readFile(output_file_name)

    const blob = new Blob([data ?? ''], {type: 'audio/webm'})
    const url = URL.createObjectURL(blob)

    const duration = await new Promise(resolve => {
        const audio = new Audio(url)
        audio.addEventListener('loadedmetadata', () => resolve(audio.duration))
        audio.addEventListener('error', () => resolve(0))
    })

    return {
        url,
        blob,
        duration,
    }
}
