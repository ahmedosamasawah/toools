// @ts-ignore
import QCF4_DATA from './qcf-data.txt?raw'

const d = QCF4_DATA.split('\n').map((/** @type {string} */ l) =>
    l.split(',').map((/** @type {string | number} */ v) => +v),
)

const types = [
    'word',
    'waqf',
    'sajdah-overline',
    'basmalah',
    'surah',
    'ayah-marker',
    'rubu-marker',
    'sajdah-marker',
]

/**
 * @param {string | number} file_i
 */
async function load_font(file_i) {
    let f = `url(https://fonts.nuqayah.com/qcf4/QCF4_Hafs_${('' + file_i).padStart(2, '0')}.woff2)`
    if (file_i === 0) f = `url(https://fonts.nuqayah.com/qcf4/QCF4_QBSML.woff2)`
    document.fonts.add(await new FontFace('qcf4' + file_i, f).load())
}

// 0:Sura, 1:Verse, 2:PageNo, 3:LineNo, 4:FontFile, 5:FontCode, 6:Type
/**
 * @param {number} s1
 * @param {number} a1
 * @param {number} s2
 * @param {number} a2
 */
export function qpc_range(s1, a1, s2, a2) {
    let last_font = -1
    let last_line = 0
    let last_page = 0
    let i = 0
    let out = ''
    if (a1 === 1) a1-- // add surah name and basmalah
    for (; i < d.length; i++) {
        const o = d[i]
        if (o[0] < s1 || (o[0] === s1 && o[1] < a1)) continue
        if (o[0] > s2 || (o[0] === s2 && o[1] > a2)) break

        last_line = last_line || o[3]
        last_page = last_page || o[2]
        let space = !!out.length
        if (last_page !== o[2]) out += '<span class=break-before></span>'
        if (last_line !== o[3]) {
            out += '<br>'
            space = false
        }
        if (o[6] === 2 || o[6] === 3)
            // also if bsmalah or surah since new line?
            space = false
        const c = String.fromCharCode(0xf100 + o[5])
        out +=
            (space ? ' ' : '') +
            `<span style="font-family: qcf4${o[4]}" class="${types[o[6] - 1]}">${c}</span>`

        if (o[4] !== last_font) load_font(o[4])
        last_font = o[4]
        last_line = o[3]
        last_page = o[2]
    }
    return out
}
