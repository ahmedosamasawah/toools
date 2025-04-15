<svelte:head>
    <title>استبدال النص | ادوات نصية</title>
</svelte:head>
<div>
    <MainReplacer {show_notification} />
    <Tooltip />
</div>

<script>
import Tooltip from 'components/src/Tooltip.svelte'

import MainReplacer from '~/components/MainReplacer.svelte'

const {show_notification = /** @type {(message: string, type?: string) => void} */ (() => {})} =
    $props()
</script>
